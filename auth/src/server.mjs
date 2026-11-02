import fs from 'node:fs';
import http from 'node:http';
import https from 'node:https';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import QRCode from 'qrcode';

import { describeConfig, loadConfig, PROJECT_ROOT } from './config.mjs';
import {
  decryptString,
  encryptString,
  loadOrCreateMasterKey,
  mintDshCookie,
  randomToken,
  readDshSigningSecret,
  sha256Hex,
} from './crypto.mjs';
import {
  appendSetCookie,
  assertCsrf,
  assertHost,
  assertSameOrigin,
  clientIp,
  cookieHeader,
  ensureCsrfCookie,
  escapeHtml,
  HttpError,
  PAGE_CSP,
  readCookie,
  readJsonBody,
  redirect,
  SECURITY_HEADERS,
  sendHtml,
  sendJson,
  sendText,
} from './http.mjs';
import { logger } from './log.mjs';
import { forwardHttp, forwardUpgrade, writeSocketResponse } from './proxy.mjs';
import { RateLimiter } from './ratelimit.mjs';
import {
  appendSessionCookie,
  clearAllSessionCookies,
  clearCookie,
  createSession,
  hasRecentReauth,
  loadBootstrapSession,
  loadSession,
  publicSession,
  SESSION_KINDS,
  sessionCookieValue,
  setBootstrapCookie,
  setSessionCookie,
} from './session.mjs';
import { openStore } from './store.mjs';
import {
  generateRecoveryCode,
  generateTotpSecret,
  normalizeRecoveryCode,
  normalizeSetupToken,
  otpauthUrl,
  verifyTotp,
} from './totp.mjs';
import {
  authenticationOptions,
  passkeyFromRegistration,
  registrationOptions,
  verifyAuthentication,
  verifyRegistration,
} from './webauthn.mjs';

const AUTH_PREFIX = '/__palace';
const MAX_BODY_BYTES = 64 * 1024;
const RECOVERY_CODE_COUNT = 10;

function loadAssets() {
  const uiDir = path.join(PROJECT_ROOT, 'ui');
  const files = {
    '/__palace/app.js': ['app.js', 'text/javascript; charset=utf-8'],
    '/__palace/app.css': ['app.css', 'text/css; charset=utf-8'],
    '/__palace/favicon.svg': ['favicon.svg', 'image/svg+xml'],
  };
  const assets = new Map();
  for (const [route, [file, type]] of Object.entries(files)) {
    assets.set(route, { body: fs.readFileSync(path.join(uiDir, file)), type });
  }
  const pages = new Map();
  for (const page of ['login', 'setup', 'recover', 'security']) {
    pages.set(page, fs.readFileSync(path.join(uiDir, `${page}.html`), 'utf8'));
  }
  return { assets, pages };
}

function pageHeaders() {
  return {
    ...SECURITY_HEADERS,
    'content-security-policy': PAGE_CSP,
    'x-frame-options': 'DENY',
    'cache-control': 'no-store',
  };
}

function safeNext(value) {
  if (typeof value !== 'string') return '/';
  if (!value.startsWith('/') || value.startsWith('//')) return '/';
  if (value.startsWith(AUTH_PREFIX)) return '/';
  return value;
}

function hashRecoveryCodes(codes) {
  return codes.map((code) => sha256Hex(normalizeRecoveryCode(code)));
}

export function createApp(options = {}) {
  const config = options.config ?? loadConfig();
  const store = options.store ?? openStore(config.dbPath);
  const masterKey = options.masterKey ?? loadOrCreateMasterKey(config.keyPath);
  const limiter = new RateLimiter();
  const { assets, pages } = loadAssets();
  const socketsBySession = new Map();
  let dshSecret = options.dshSecret ?? null;
  let bridgeError = null;

  if (options.dshSecret === undefined) {
    try {
      dshSecret = readDshSigningSecret(config.dshCredentials);
    } catch (error) {
      bridgeError = String(error?.message ?? error);
      logger.error('dsh.secret_unavailable', { error: bridgeError, path: config.dshCredentials });
    }
  }

  function bridgeCookie(host) {
    if (!dshSecret) throw new HttpError(503, 'bridge_unavailable', '认证桥接尚未就绪');
    return mintDshCookie(dshSecret, host, { ttlMs: 60 * 60 * 1000 });
  }

  function closeSessionSockets(sessionId) {
    const sockets = socketsBySession.get(sessionId);
    if (!sockets) return;
    for (const socket of sockets) socket.destroy();
    socketsBySession.delete(sessionId);
  }

  function revokeSession(sessionId, now = Date.now()) {
    store.revokeSession(sessionId, now);
    closeSessionSockets(sessionId);
  }

  function revokeAllSessions(now, exceptId = null) {
    const sessions = store.listSessions(now);
    for (const session of sessions) {
      if (exceptId !== null && session.id === exceptId) continue;
      revokeSession(session.id, now);
    }
  }

  function audit(req, event, detail = null) {
    try {
      store.audit(event, {
        ip: clientIp(req, config),
        ua: String(req.headers['user-agent'] ?? '').slice(0, 300),
        detail,
      });
    } catch (error) {
      logger.warn('audit.write_failed', { error: String(error?.message ?? error) });
    }
  }

  function userHandle() {
    let handle = store.getMeta('user_handle');
    if (handle === undefined) {
      handle = randomToken(16);
      store.setMeta('user_handle', handle);
    }
    return handle;
  }

  function requireSession(req, res, kinds = [SESSION_KINDS.NORMAL]) {
    const session = loadSession(store, config, req);
    if (!session) throw new HttpError(401, 'unauthenticated', '请先登录');
    if (!kinds.includes(session.row.kind)) {
      throw new HttpError(403, 'wrong_session_kind', '当前会话不能执行此操作');
    }
    if (session.touched) appendSessionCookie(res, config, session.token, session.row);
    return session;
  }

  function requireBootstrap(req) {
    const session = loadBootstrapSession(store, config, req);
    if (!session) throw new HttpError(401, 'bootstrap_required', '绑定流程已过期，请重新开始');
    return session;
  }

  function requireReauth(session) {
    if (!hasRecentReauth(session.row, config)) {
      throw new HttpError(403, 'reauth_required', '请先验证通行密钥');
    }
  }

  function issueChallenge(kind, { sessionId = null, data = {}, challenge }) {
    const flow = randomToken(18);
    const now = Date.now();
    store.createChallenge({
      id: flow,
      kind,
      challenge,
      sessionId,
      data,
      createdAt: now,
      expiresAt: now + config.challengeTtlMs,
    });
    return flow;
  }

  function takeChallenge(req, flow, kind, sessionId = null) {
    if (typeof flow !== 'string' || flow.length < 10) {
      throw new HttpError(400, 'challenge_invalid', '登录挑战无效，请重试');
    }
    const row = store.getChallenge(flow);
    if (!row || row.kind !== kind || row.consumed_at !== null || row.expires_at <= Date.now()) {
      throw new HttpError(400, 'challenge_expired', '操作已超时，请重试');
    }
    if (sessionId !== null && row.session_id !== sessionId) {
      throw new HttpError(403, 'challenge_session_mismatch', '挑战与当前会话不匹配');
    }
    if (!store.consumeChallenge(flow, Date.now())) {
      throw new HttpError(400, 'challenge_expired', '操作已超时，请重试');
    }
    return row;
  }

  function loginLimiterKeys(req) {
    return [`login:ip:${clientIp(req, config)}`, 'login:global'];
  }

  function checkLimit(keys) {
    const now = Date.now();
    let retry = 0;
    for (const key of keys) {
      const state = limiter.check(key, now);
      if (!state.ok) retry = Math.max(retry, state.retryAfterMs);
    }
    if (retry > 0) {
      throw new HttpError(429, 'rate_limited', '尝试过多，请稍后再试', {
        'retry-after': String(Math.ceil(retry / 1000)),
      });
    }
  }

  function failLimit(keys) {
    for (const key of keys) limiter.fail(key);
  }

  function successLimit(keys) {
    for (const key of keys) limiter.succeed(key);
  }

  async function startSetup(req, res) {
    if (store.isInitialized()) throw new HttpError(409, 'already_initialized', 'Palace 已完成初始化');
    const keys = [`setup:ip:${clientIp(req, config)}`];
    checkLimit(keys);
    const body = await readJsonBody(req, MAX_BODY_BYTES);
    const token = typeof body.token === 'string' ? normalizeSetupToken(body.token) : '';
    if (token.length < 12 || token.length > 200) throw new HttpError(400, 'invalid_token', '绑定凭证无效');
    if (!store.consumeSetupToken(sha256Hex(token), Date.now())) {
      failLimit(keys);
      audit(req, 'setup.token_rejected');
      throw new HttpError(403, 'invalid_token', '绑定凭证无效或已过期');
    }
    successLimit(keys);

    const session = createSession(store, config, {
      kind: SESSION_KINDS.BOOTSTRAP,
      ip: clientIp(req, config),
      ua: String(req.headers['user-agent'] ?? ''),
      ttlMs: config.bootstrapTtlMs,
      data: { totpVerified: false, passkeys: [] },
    });
    const secret = generateTotpSecret();
    const data = {
      totpSecretEnc: encryptString(masterKey, secret, `bootstrap:${session.id}`),
      totpVerified: false,
      passkeyCount: 0,
    };
    store.setSessionData(session.id, data);
    setBootstrapCookie(res, config, session);
    audit(req, 'setup.started', { session: session.id });
    const uri = otpauthUrl({ secret, issuer: config.rpName, account: 'owner' });
    const qr = await QRCode.toString(uri, {
      type: 'svg',
      width: 260,
      margin: 1,
      errorCorrectionLevel: 'M',
    });
    sendJson(res, 200, { ok: true, secret, otpauth: uri, qr, account: 'owner' });
  }

  async function setupTotp(req, res) {
    const bootstrap = requireBootstrap(req);
    const keys = [`setup:${bootstrap.id}`];
    checkLimit(keys);
    const body = await readJsonBody(req, MAX_BODY_BYTES);
    const data = JSON.parse(bootstrap.row.data);
    const secret = decryptString(masterKey, data.totpSecretEnc, `bootstrap:${bootstrap.id}`);
    const step = verifyTotp(secret, String(body.code ?? ''));
    if (step < 0 || (data.totpStep !== undefined && step <= data.totpStep)) {
      failLimit(keys);
      audit(req, 'setup.totp_failed', { session: bootstrap.id });
      throw new HttpError(400, 'bad_code', '验证码不正确');
    }
    successLimit(keys);
    data.totpVerified = true;
    data.totpStep = step;
    store.setSessionData(bootstrap.id, data);
    audit(req, 'setup.totp_verified', { session: bootstrap.id });
    sendJson(res, 200, { ok: true });
  }

  async function setupPasskeyOptions(req, res) {
    const bootstrap = requireBootstrap(req);
    const data = JSON.parse(bootstrap.row.data);
    if (!data.totpVerified) throw new HttpError(409, 'totp_required', '请先验证验证码');
    const options = await registrationOptions(config, {
      userHandle: userHandle(),
      userName: 'owner',
      passkeys: data.passkeys ?? [],
    });
    const flow = issueChallenge('setup-reg', { sessionId: bootstrap.id, challenge: options.challenge });
    sendJson(res, 200, { ok: true, flow, options });
  }

  async function setupPasskeyVerify(req, res) {
    const bootstrap = requireBootstrap(req);
    const body = await readJsonBody(req, MAX_BODY_BYTES);
    const row = takeChallenge(req, body.flow, 'setup-reg', bootstrap.id);
    const data = JSON.parse(bootstrap.row.data);
    if (!data.totpVerified) throw new HttpError(409, 'totp_required', '请先验证验证码');
    let verification;
    try {
      verification = await verifyRegistration(config, body.response, row.challenge);
    } catch (error) {
      audit(req, 'setup.passkey_failed', { session: bootstrap.id, error: String(error?.message ?? error) });
      throw new HttpError(400, 'passkey_failed', '通行密钥验证失败，请重试');
    }
    if (!verification.verified || !verification.registrationInfo) {
      throw new HttpError(400, 'passkey_failed', '通行密钥验证失败，请重试');
    }
    const name = typeof body.name === 'string' && body.name.trim() !== '' ? body.name.trim() : '我的通行密钥';
    const record = passkeyFromRegistration(verification.registrationInfo, name, Date.now());
    data.passkeys = [...(data.passkeys ?? []), record];
    store.setSessionData(bootstrap.id, data);
    audit(req, 'setup.passkey_added', { session: bootstrap.id, name });
    sendJson(res, 200, { ok: true, passkey: { id: record.id, name: record.name } });
  }

  function finishSetup(req, res) {
    const bootstrap = requireBootstrap(req);
    const data = JSON.parse(bootstrap.row.data);
    if (!data.totpVerified) throw new HttpError(409, 'totp_required', '请先验证验证码');
    if (!Array.isArray(data.passkeys) || data.passkeys.length === 0) {
      throw new HttpError(409, 'passkey_required', '请先创建通行密钥');
    }
    const now = Date.now();
    const codes = Array.from({ length: RECOVERY_CODE_COUNT }, () => generateRecoveryCode());
    const session = store.tx(() => {
      if (store.isInitialized()) throw new HttpError(409, 'already_initialized', 'Palace 已完成初始化');
      store.createOwner(now);
      const secret = decryptString(masterKey, data.totpSecretEnc, `bootstrap:${bootstrap.id}`);
      store.setTotp(encryptString(masterKey, secret, 'totp:v1'), now);
      store.claimTotpStep(data.totpStep ?? -1, now);
      for (const passkey of data.passkeys) store.addPasskey(passkey);
      store.replaceRecoveryCodes(hashRecoveryCodes(codes), now);
      store.revokeSession(bootstrap.id, now);
      return createSession(store, config, {
        kind: SESSION_KINDS.NORMAL,
        ip: clientIp(req, config),
        ua: String(req.headers['user-agent'] ?? ''),
        reauthAt: now,
      });
    });
    clearCookie(res, config, config.cookieNames.bootstrap);
    setSessionCookie(res, config, session, {
      idle_expires: session.idleExpires,
      expires_at: session.expiresAt,
    });
    audit(req, 'setup.completed', { session: session.id });
    sendJson(res, 200, { ok: true, recoveryCodes: codes, redirect: '/' });
  }

  async function loginOptions(req, res) {
    if (!store.isInitialized()) throw new HttpError(409, 'not_initialized', 'Palace 尚未初始化');
    checkLimit(loginLimiterKeys(req));
    const passkeys = store.listPasskeys();
    if (passkeys.length === 0) throw new HttpError(409, 'no_passkeys', '没有可用的通行密钥');
    const options = await authenticationOptions(config, passkeys);
    const flow = issueChallenge('login', { challenge: options.challenge });
    sendJson(res, 200, { ok: true, flow, options });
  }

  async function loginVerify(req, res) {
    if (!store.isInitialized()) throw new HttpError(409, 'not_initialized', 'Palace 尚未初始化');
    const keys = loginLimiterKeys(req);
    checkLimit(keys);
    const body = await readJsonBody(req, MAX_BODY_BYTES);
    const row = takeChallenge(req, body.flow, 'login');
    const response = body.response;
    if (!response || typeof response.id !== 'string') throw new HttpError(400, 'bad_response', '无效的登录响应');
    const passkey = store.getPasskey(response.id);
    if (!passkey) {
      failLimit(keys);
      audit(req, 'login.passkey_unknown');
      throw new HttpError(401, 'passkey_unknown', '该通行密钥未在此注册');
    }
    let verification;
    try {
      verification = await verifyAuthentication(config, response, row.challenge, passkey);
    } catch (error) {
      failLimit(keys);
      audit(req, 'login.passkey_failed', { error: String(error?.message ?? error) });
      throw new HttpError(401, 'passkey_failed', '通行密钥验证失败');
    }
    if (!verification.verified) {
      failLimit(keys);
      throw new HttpError(401, 'passkey_failed', '通行密钥验证失败');
    }
    const now = Date.now();
    store.updatePasskeyUsage(passkey.id, verification.authenticationInfo.newCounter, now);
    successLimit(keys);
    const session = createSession(store, config, {
      kind: SESSION_KINDS.NORMAL,
      ip: clientIp(req, config),
      ua: String(req.headers['user-agent'] ?? ''),
      reauthAt: now,
    });
    setSessionCookie(res, config, session, {
      idle_expires: session.idleExpires,
      expires_at: session.expiresAt,
    });
    audit(req, 'login.passkey_ok', { session: session.id });
    sendJson(res, 200, { ok: true, redirect: safeNext(body.next) });
  }

  async function loginTotp(req, res) {
    if (!store.isInitialized()) throw new HttpError(409, 'not_initialized', 'Palace 尚未初始化');
    const keys = loginLimiterKeys(req);
    checkLimit(keys);
    const body = await readJsonBody(req, MAX_BODY_BYTES);
    const record = store.getTotp();
    if (!record) throw new HttpError(409, 'totp_missing', '未配置验证码');
    const secret = decryptString(masterKey, record.secret_enc, 'totp:v1');
    const step = verifyTotp(secret, String(body.code ?? ''));
    if (step < 0 || !store.claimTotpStep(step, Date.now())) {
      failLimit(keys);
      audit(req, 'login.totp_failed');
      throw new HttpError(401, 'bad_code', '验证码不正确');
    }
    successLimit(keys);
    const now = Date.now();
    revokeAllSessions(now);
    const session = createSession(store, config, {
      kind: SESSION_KINDS.RECOVERY,
      ip: clientIp(req, config),
      ua: String(req.headers['user-agent'] ?? ''),
      ttlMs: config.recoverySessionTtlMs,
      data: { method: 'totp' },
    });
    setSessionCookie(res, config, session, {
      idle_expires: session.idleExpires,
      expires_at: session.expiresAt,
    });
    audit(req, 'login.totp_recovery', { session: session.id });
    sendJson(res, 200, { ok: true, redirect: '/__palace/recover' });
  }

  async function loginRecoveryCode(req, res) {
    if (!store.isInitialized()) throw new HttpError(409, 'not_initialized', 'Palace 尚未初始化');
    const keys = loginLimiterKeys(req);
    checkLimit(keys);
    const body = await readJsonBody(req, MAX_BODY_BYTES);
    const normalized = normalizeRecoveryCode(String(body.code ?? ''));
    if (normalized.length < 20) {
      failLimit(keys);
      throw new HttpError(401, 'bad_recovery_code', '恢复码无效');
    }
    if (!store.consumeRecoveryCode(sha256Hex(normalized), Date.now())) {
      failLimit(keys);
      audit(req, 'login.recovery_failed');
      throw new HttpError(401, 'bad_recovery_code', '恢复码无效或已使用');
    }
    successLimit(keys);
    const now = Date.now();
    revokeAllSessions(now);
    const session = createSession(store, config, {
      kind: SESSION_KINDS.RECOVERY,
      ip: clientIp(req, config),
      ua: String(req.headers['user-agent'] ?? ''),
      ttlMs: config.recoverySessionTtlMs,
      data: { method: 'recovery' },
    });
    setSessionCookie(res, config, session, {
      idle_expires: session.idleExpires,
      expires_at: session.expiresAt,
    });
    audit(req, 'login.recovery_code_ok', { session: session.id });
    sendJson(res, 200, { ok: true, redirect: '/__palace/recover' });
  }

  async function recoverOptions(req, res) {
    const session = requireSession(req, res, [SESSION_KINDS.RECOVERY]);
    const options = await registrationOptions(config, {
      userHandle: userHandle(),
      userName: 'owner',
      passkeys: store.listPasskeys(),
    });
    const flow = issueChallenge('recover-reg', { sessionId: session.id, challenge: options.challenge });
    sendJson(res, 200, { ok: true, flow, options });
  }

  async function recoverVerify(req, res) {
    const session = requireSession(req, res, [SESSION_KINDS.RECOVERY]);
    const body = await readJsonBody(req, MAX_BODY_BYTES);
    const row = takeChallenge(req, body.flow, 'recover-reg', session.id);
    let verification;
    try {
      verification = await verifyRegistration(config, body.response, row.challenge);
    } catch (error) {
      audit(req, 'recover.passkey_failed', { error: String(error?.message ?? error) });
      throw new HttpError(400, 'passkey_failed', '通行密钥验证失败，请重试');
    }
    if (!verification.verified || !verification.registrationInfo) {
      throw new HttpError(400, 'passkey_failed', '通行密钥验证失败，请重试');
    }
    const name =
      typeof body.name === 'string' && body.name.trim() !== '' ? body.name.trim() : '恢复后的通行密钥';
    const record = passkeyFromRegistration(verification.registrationInfo, name, Date.now());
    const revokeOthers = body.revokeOthers !== false;
    const created = store.tx(() => {
      store.addPasskey(record);
      if (revokeOthers) {
        for (const passkey of store.listPasskeys()) {
          if (passkey.id !== record.id) store.deletePasskey(passkey.id);
        }
      }
      const now = Date.now();
      store.revokeSession(session.id, now);
      return createSession(store, config, {
        kind: SESSION_KINDS.NORMAL,
        ip: clientIp(req, config),
        ua: String(req.headers['user-agent'] ?? ''),
        reauthAt: now,
      });
    });
    closeSessionSockets(session.id);
    setSessionCookie(res, config, created, {
      idle_expires: created.idleExpires,
      expires_at: created.expiresAt,
    });
    clearCookie(res, config, config.cookieNames.bootstrap);
    audit(req, 'recover.completed', { session: created.id, revokeOthers });
    sendJson(res, 200, { ok: true, redirect: '/' });
  }

  async function reauthOptions(req, res) {
    const session = requireSession(req, res);
    const options = await authenticationOptions(config, store.listPasskeys());
    const flow = issueChallenge('reauth', { sessionId: session.id, challenge: options.challenge });
    sendJson(res, 200, { ok: true, flow, options });
  }

  async function reauthVerify(req, res) {
    const session = requireSession(req, res);
    const body = await readJsonBody(req, MAX_BODY_BYTES);
    const row = takeChallenge(req, body.flow, 'reauth', session.id);
    const response = body.response;
    if (!response || typeof response.id !== 'string') throw new HttpError(400, 'bad_response', '无效的响应');
    const passkey = store.getPasskey(response.id);
    if (!passkey) throw new HttpError(401, 'passkey_unknown', '未知的通行密钥');
    let verification;
    try {
      verification = await verifyAuthentication(config, response, row.challenge, passkey);
    } catch (error) {
      audit(req, 'reauth.failed', { error: String(error?.message ?? error) });
      throw new HttpError(401, 'passkey_failed', '通行密钥验证失败');
    }
    if (!verification.verified) throw new HttpError(401, 'passkey_failed', '通行密钥验证失败');
    const now = Date.now();
    store.updatePasskeyUsage(passkey.id, verification.authenticationInfo.newCounter, now);
    store.setSessionReauth(session.id, now);
    session.row.reauth_at = now;
    audit(req, 'reauth.ok', { session: session.id });
    sendJson(res, 200, { ok: true, reauthUntil: now + config.reauthWindowMs });
  }

  async function addPasskeyOptions(req, res) {
    const session = requireSession(req, res);
    requireReauth(session);
    const passkeys = store.listPasskeys();
    const options = await registrationOptions(config, {
      userHandle: userHandle(),
      userName: 'owner',
      passkeys,
    });
    const flow = issueChallenge('add-reg', { sessionId: session.id, challenge: options.challenge });
    sendJson(res, 200, { ok: true, flow, options });
  }

  async function addPasskeyVerify(req, res) {
    const session = requireSession(req, res);
    requireReauth(session);
    const body = await readJsonBody(req, MAX_BODY_BYTES);
    const row = takeChallenge(req, body.flow, 'add-reg', session.id);
    let verification;
    try {
      verification = await verifyRegistration(config, body.response, row.challenge);
    } catch (error) {
      audit(req, 'passkey.add_failed', { error: String(error?.message ?? error) });
      throw new HttpError(400, 'passkey_failed', '通行密钥验证失败，请重试');
    }
    if (!verification.verified || !verification.registrationInfo) {
      throw new HttpError(400, 'passkey_failed', '通行密钥验证失败，请重试');
    }
    const name =
      typeof body.name === 'string' && body.name.trim() !== '' ? body.name.trim() : '新的通行密钥';
    const record = passkeyFromRegistration(verification.registrationInfo, name, Date.now());
    store.addPasskey(record);
    audit(req, 'passkey.added', { session: session.id, name });
    sendJson(res, 200, { ok: true, passkey: { id: record.id, name: record.name } });
  }

  function securityOverview(req, res) {
    const session = requireSession(req, res);
    const now = Date.now();
    const passkeys = store.listPasskeys().map((passkey) => ({
      id: passkey.id,
      name: passkey.name,
      createdAt: passkey.created_at,
      lastUsedAt: passkey.last_used_at,
      deviceType: passkey.device_type,
      backedUp: Boolean(passkey.backed_up),
    }));
    const sessions = store.listSessions(now).map((row) => publicSession(row, session.id));
    sendJson(res, 200, {
      ok: true,
      passkeys,
      sessions,
      recoveryRemaining: store.countUnusedRecoveryCodes(),
      reauth: hasRecentReauth(session.row, config),
      reauthWindowSeconds: Math.floor(config.reauthWindowMs / 1000),
      idleDays: config.sessionIdleDays,
      absoluteDays: config.sessionAbsoluteDays,
    });
  }

  async function deletePasskey(req, res) {
    const session = requireSession(req, res);
    requireReauth(session);
    const body = await readJsonBody(req, MAX_BODY_BYTES);
    if (typeof body.id !== 'string') throw new HttpError(400, 'bad_request', '缺少通行密钥 ID');
    const passkey = store.getPasskey(body.id);
    if (!passkey) throw new HttpError(404, 'not_found', '通行密钥不存在');
    if (store.countPasskeys() <= 1) {
      throw new HttpError(409, 'last_passkey', '至少保留一个通行密钥；请先添加新的通行密钥');
    }
    store.deletePasskey(body.id);
    audit(req, 'passkey.deleted', { session: session.id, id: body.id });
    sendJson(res, 200, { ok: true });
  }

  async function renamePasskey(req, res) {
    const session = requireSession(req, res);
    const body = await readJsonBody(req, MAX_BODY_BYTES);
    if (typeof body.id !== 'string' || typeof body.name !== 'string' || body.name.trim() === '') {
      throw new HttpError(400, 'bad_request', '缺少通行密钥名称');
    }
    const changed = store.renamePasskey(body.id, body.name.trim().slice(0, 60));
    if (changed === 0) throw new HttpError(404, 'not_found', '通行密钥不存在');
    audit(req, 'passkey.renamed', { session: session.id, id: body.id });
    sendJson(res, 200, { ok: true });
  }

  async function revokeSessions(req, res) {
    const session = requireSession(req, res);
    requireReauth(session);
    const body = await readJsonBody(req, MAX_BODY_BYTES);
    const now = Date.now();
    if (body.all === true) {
      const sessions = store.listSessions(now);
      for (const row of sessions) {
        if (row.id === session.id) continue;
        revokeSession(row.id, now);
      }
      audit(req, 'session.revoked_all', { session: session.id });
      sendJson(res, 200, { ok: true });
      return;
    }
    if (typeof body.id !== 'string') throw new HttpError(400, 'bad_request', '缺少会话 ID');
    if (body.id === session.id) throw new HttpError(409, 'current_session', '不能在此撤销当前会话');
    const row = store.getSession(body.id);
    if (!row || row.revoked_at !== null) throw new HttpError(404, 'not_found', '会话不存在');
    revokeSession(body.id, now);
    audit(req, 'session.revoked', { session: session.id, target: body.id });
    sendJson(res, 200, { ok: true });
  }

  async function regenerateRecoveryCodes(req, res) {
    const session = requireSession(req, res);
    requireReauth(session);
    const codes = Array.from({ length: RECOVERY_CODE_COUNT }, () => generateRecoveryCode());
    store.replaceRecoveryCodes(hashRecoveryCodes(codes), Date.now());
    audit(req, 'recovery.regenerated', { session: session.id });
    sendJson(res, 200, { ok: true, recoveryCodes: codes });
  }

  async function logout(req, res) {
    const session = loadSession(store, config, req);
    if (session) {
      revokeSession(session.id);
      audit(req, 'logout', { session: session.id });
    }
    const bootstrap = loadBootstrapSession(store, config, req);
    if (bootstrap) {
      store.revokeSession(bootstrap.id);
      closeSessionSockets(bootstrap.id);
    }
    clearAllSessionCookies(res, config);
    sendJson(res, 200, { ok: true, redirect: '/__palace/' });
  }

  function state(req, res) {
    sendJson(res, 200, {
      ok: true,
      initialized: store.isInitialized(),
      passkeys: store.countPasskeys(),
      recoveryRemaining: store.countUnusedRecoveryCodes(),
      bridgeReady: Boolean(dshSecret),
    });
  }

  function health(req, res) {
    sendJson(res, 200, {
      ok: true,
      initialized: store.isInitialized(),
      bridgeReady: Boolean(dshSecret),
      bridgeError: bridgeError === null ? undefined : 'dsh credential unavailable',
    });
  }

  const apiRoutes = new Map([
    ['POST /__palace/api/setup/start', startSetup],
    ['POST /__palace/api/setup/totp', setupTotp],
    ['POST /__palace/api/setup/passkey/options', setupPasskeyOptions],
    ['POST /__palace/api/setup/passkey/verify', setupPasskeyVerify],
    ['POST /__palace/api/setup/finish', finishSetup],
    ['POST /__palace/api/login/options', loginOptions],
    ['POST /__palace/api/login/verify', loginVerify],
    ['POST /__palace/api/login/totp', loginTotp],
    ['POST /__palace/api/login/recovery', loginRecoveryCode],
    ['POST /__palace/api/recover/passkey/options', recoverOptions],
    ['POST /__palace/api/recover/passkey/verify', recoverVerify],
    ['GET /__palace/api/security', securityOverview],
    ['POST /__palace/api/security/reauth/options', reauthOptions],
    ['POST /__palace/api/security/reauth/verify', reauthVerify],
    ['POST /__palace/api/security/passkey/options', addPasskeyOptions],
    ['POST /__palace/api/security/passkey/verify', addPasskeyVerify],
    ['POST /__palace/api/security/passkey/delete', deletePasskey],
    ['POST /__palace/api/security/passkey/rename', renamePasskey],
    ['POST /__palace/api/security/sessions/revoke', revokeSessions],
    ['POST /__palace/api/security/recovery/regenerate', regenerateRecoveryCodes],
    ['POST /__palace/api/logout', logout],
    ['GET /__palace/api/state', state],
  ]);

  async function handleAuth(req, res, url) {
    const pathname = url.pathname;
    const asset = assets.get(pathname);
    if (asset !== undefined) {
      if (req.method !== 'GET' && req.method !== 'HEAD') throw new HttpError(405, 'method_not_allowed', 'method not allowed');
      res.writeHead(200, {
        'content-type': asset.type,
        'content-length': asset.body.length,
        'cache-control': 'no-cache',
        ...SECURITY_HEADERS,
      });
      res.end(req.method === 'HEAD' ? undefined : asset.body);
      return;
    }

    const route = apiRoutes.get(`${req.method} ${pathname}`);
    if (route !== undefined) {
      ensureCsrfCookie(req, res, config);
      if (req.method !== 'GET') assertCsrf(req, config);
      await route(req, res);
      return;
    }
    if (pathname.startsWith('/__palace/api/')) {
      throw new HttpError(404, 'not_found', '未知的认证接口');
    }
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      throw new HttpError(405, 'method_not_allowed', 'method not allowed');
    }

    ensureCsrfCookie(req, res, config);
    const headers = pageHeaders();
    if (pathname === '/__palace' ) return redirect(res, '/__palace/');
    if (pathname === '/__palace/') {
      const session = loadSession(store, config, req);
      if (session?.row.kind === SESSION_KINDS.NORMAL) return redirect(res, safeNext(url.searchParams.get('next')));
      if (session?.row.kind === SESSION_KINDS.RECOVERY) return redirect(res, '/__palace/recover');
      return sendHtml(res, 200, pages.get('login'), headers);
    }
    if (pathname === '/__palace/setup') {
      if (store.isInitialized()) return redirect(res, '/__palace/');
      return sendHtml(res, 200, pages.get('setup'), headers);
    }
    if (pathname === '/__palace/recover') {
      const session = loadSession(store, config, req);
      if (!session || session.row.kind !== SESSION_KINDS.RECOVERY) return redirect(res, '/__palace/');
      return sendHtml(res, 200, pages.get('recover'), headers);
    }
    if (pathname === '/__palace/security') {
      const session = loadSession(store, config, req);
      if (!session || session.row.kind !== SESSION_KINDS.NORMAL) return redirect(res, '/__palace/');
      return sendHtml(res, 200, pages.get('security'), headers);
    }
    if (pathname === '/__palace/healthz') return health(req, res);
    throw new HttpError(404, 'not_found', '页面不存在');
  }

  function unauthorized(req, res) {
    const acceptsHtml = String(req.headers.accept ?? '').includes('text/html');
    if (req.method === 'GET' && acceptsHtml) {
      const next = encodeURIComponent(req.url ?? '/');
      return redirect(res, `/__palace/?next=${next}`);
    }
    return sendJson(res, 401, {
      ok: false,
      error: { code: 'unauthenticated', message: '请先登录 Palace' },
    });
  }

  async function handle(req, res) {
    try {
      const url = new URL(req.url ?? '/', 'http://palace.internal');
      if (url.pathname === '/__palace/healthz') {
        assertHost(req, config, { allowHealthLoopback: true });
        return health(req, res);
      }
      const host = assertHost(req, config);
      for (const [name, value] of Object.entries(SECURITY_HEADERS)) res.setHeader(name, value);

      if (url.pathname.startsWith(AUTH_PREFIX)) {
        return await handleAuth(req, res, url);
      }
      if (url.pathname.toLowerCase() === '/connect' || url.searchParams.has('token')) {
        audit(req, 'blocked.legacy_auth_route', { path: url.pathname });
        return sendText(res, 403, '旧版启动令牌入口已关闭，请通过 Palace 登录页登录。\n');
      }

      const session = loadSession(store, config, req);
      if (!session) return unauthorized(req, res);
      if (session.row.kind !== SESSION_KINDS.NORMAL) {
        const acceptsHtml = String(req.headers.accept ?? '').includes('text/html');
        if (acceptsHtml && (req.method === 'GET' || req.method === 'HEAD')) {
          return redirect(res, '/__palace/recover');
        }
        return sendJson(res, 403, {
          ok: false,
          error: { code: 'recovery_session', message: '恢复会话不能访问 Palace 数据' },
        });
      }
      if (!dshSecret) {
        return sendText(res, 503, 'Palace 认证桥接不可用，请联系服务器管理员。\n');
      }
      const dshCookie = bridgeCookie(host);
      const extraSetCookie = session.touched ? sessionCookieValue(config, session.token, session.row) : undefined;
      const requestPath = url.pathname + url.search;
      if (config.logRequests) {
        logger.info('proxy.request', { method: req.method, path: requestPath, session: session.id.slice(0, 8) });
      }
      forwardHttp(req, res, { config, dshCookie, extraSetCookie });
    } catch (error) {
      if (error instanceof HttpError) {
        if (res.headersSent) {
          res.destroy();
          return;
        }
        if (error.headers['retry-after'] !== undefined) res.setHeader('retry-after', error.headers['retry-after']);
        const acceptsHtml = String(req.headers.accept ?? '').includes('text/html');
        if (acceptsHtml && error.status >= 400 && error.status !== 401) {
          return sendHtml(
            res,
            error.status,
            `<!doctype html><html lang="zh-CN"><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Palace</title><link rel="stylesheet" href="/__palace/app.css"><body><main class="shell"><section class="card"><h1>操作未完成</h1><p class="lead">${escapeHtml(error.message)}</p><p><a href="/__palace/">返回登录</a></p></section></main></body></html>`,
            pageHeaders(),
          );
        }
        return sendJson(res, error.status, {
          ok: false,
          error: { code: error.code, message: error.message },
        });
      }
      logger.error('request.failed', { error: String(error?.stack ?? error) });
      if (res.headersSent) {
        res.destroy();
        return;
      }
      return sendJson(res, 500, {
        ok: false,
        error: { code: 'internal_error', message: '认证服务内部错误' },
      });
    }
  }

  function handleUpgrade(req, socket, head) {
    try {
      const url = new URL(req.url ?? '/', 'http://palace.internal');
      if (url.pathname.startsWith(AUTH_PREFIX)) return writeSocketResponse(socket, 404, 'not found');
      const host = assertHost(req, config);
      if (url.pathname === '/connect' || url.searchParams.has('token')) {
        audit(req, 'blocked.legacy_auth_route', { path: url.pathname, upgrade: true });
        return writeSocketResponse(socket, 403, 'legacy auth route closed');
      }
      if (req.headers['sec-fetch-site'] === 'cross-site') {
        return writeSocketResponse(socket, 403, 'cross-site upgrade refused');
      }
      const origin = req.headers.origin;
      if (typeof origin !== 'string' || !config.allowedOrigins.includes(origin)) {
        audit(req, 'blocked.bad_ws_origin', { origin: origin ?? '' });
        return writeSocketResponse(socket, 403, 'origin not allowed');
      }
      const session = loadSession(store, config, req);
      if (!session) return writeSocketResponse(socket, 401, 'unauthorized');
      if (session.row.kind !== SESSION_KINDS.NORMAL) return writeSocketResponse(socket, 403, 'forbidden');
      if (!dshSecret) return writeSocketResponse(socket, 503, 'bridge unavailable');
      const dshCookie = bridgeCookie(host);

      let set = socketsBySession.get(session.id);
      if (!set) {
        set = new Set();
        socketsBySession.set(session.id, set);
      }
      set.add(socket);
      forwardUpgrade(req, socket, head, {
        config,
        dshCookie,
        onClose: () => {
          set.delete(socket);
          if (set.size === 0) socketsBySession.delete(session.id);
        },
      });
    } catch (error) {
      if (error instanceof HttpError) return writeSocketResponse(socket, error.status, error.message);
      logger.warn('upgrade.failed', { error: String(error?.message ?? error) });
      writeSocketResponse(socket, 500, 'internal error');
    }
  }

  const listener = (req, res) => {
    handle(req, res).catch((error) => {
      logger.error('request.unhandled', { error: String(error?.stack ?? error) });
      if (!res.headersSent) {
        res.writeHead(500, { 'content-type': 'text/plain; charset=utf-8' });
        res.end('internal error');
      } else {
        res.destroy();
      }
    });
  };

  let server;
  if (config.tlsCert && config.tlsKey) {
    server = https.createServer(
      { cert: fs.readFileSync(config.tlsCert), key: fs.readFileSync(config.tlsKey) },
      listener,
    );
  } else {
    server = http.createServer(listener);
  }
  server.requestTimeout = 0;
  server.headersTimeout = 60_000;
  server.keepAliveTimeout = 65_000;
  server.on('upgrade', handleUpgrade);
  server.on('clientError', (error, socket) => {
    if (socket.writable) {
      socket.end('HTTP/1.1 400 Bad Request\r\nConnection: close\r\n\r\n');
    } else {
      socket.destroy();
    }
  });

  const purgeTimer = setInterval(() => {
    try {
      store.purgeExpired(Date.now());
    } catch (error) {
      logger.warn('store.purge_failed', { error: String(error?.message ?? error) });
    }
  }, 10 * 60 * 1000);
  purgeTimer.unref?.();

  async function close() {
    clearInterval(purgeTimer);
    limiter.close();
    for (const set of socketsBySession.values()) for (const socket of set) socket.destroy();
    socketsBySession.clear();
    const closed = new Promise((resolve) => server.close(resolve));
    server.closeIdleConnections?.();
    const force = setTimeout(() => server.closeAllConnections?.(), 2000);
    force.unref?.();
    await closed;
    clearTimeout(force);
    store.close();
  }

  return {
    config,
    server,
    store,
    close,
    describe: () => describeConfig(config),
    state: () => ({
      initialized: store.isInitialized(),
      passkeys: store.countPasskeys(),
      bridgeReady: Boolean(dshSecret),
      bridgeError,
    }),
  };
}

export async function start(options = {}) {
  const config = options.config ?? loadConfig();
  const app = createApp(options);
  await new Promise((resolve, reject) => {
    app.server.once('error', reject);
    app.server.listen(config.port, config.host, () => {
      app.server.off('error', reject);
      resolve();
    });
  });
  logger.info('gateway.listening', {
    listen: `${config.host}:${config.port}`,
    publicOrigin: config.publicOrigin,
    upstream: config.upstream.origin,
    initialized: app.store.isInitialized(),
    bridgeReady: Boolean(app.state().bridgeReady),
  });
  let stopping = false;
  const shutdown = async (signal) => {
    if (stopping) return;
    stopping = true;
    logger.info('gateway.stopping', { signal });
    const timer = setTimeout(() => process.exit(1), 8000);
    timer.unref?.();
    try {
      await app.close();
      process.exit(0);
    } catch (error) {
      logger.error('gateway.stop_failed', { error: String(error?.message ?? error) });
      process.exit(1);
    }
  };
  process.on('SIGTERM', () => void shutdown('SIGTERM'));
  process.on('SIGINT', () => void shutdown('SIGINT'));
  return app;
}

const isMain = process.argv[1] !== undefined && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href;
if (isMain) {
  start().catch((error) => {
    logger.error('gateway.start_failed', { error: String(error?.stack ?? error) });
    process.exit(1);
  });
}
