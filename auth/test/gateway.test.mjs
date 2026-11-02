import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';

import { loadConfig } from '../src/config.mjs';
import { sha256Hex } from '../src/crypto.mjs';
import { createApp } from '../src/server.mjs';
import { normalizeSetupToken, totp } from '../src/totp.mjs';
import { Client, createAuthenticator, freePort, rawUpgrade, startUpstream } from './helpers.mjs';

const SETUP_TOKEN = 'PALACE-ABCD-EFGH-IJKL-MNPQ';
const RP_ID = 'bot.pu-ji.top';

async function makeGateway(overrides = {}) {
  const upstream = await startUpstream();
  const port = await freePort();
  const stateDir = fs.mkdtempSync(path.join(os.tmpdir(), 'palace-gw-'));
  const origin = `http://${RP_ID}:${port}`;
  const env = {
    PALACE_STATE_DIR: stateDir,
    PALACE_AUTH_PORT: String(port),
    PALACE_AUTH_HOST: '127.0.0.1',
    PALACE_PUBLIC_ORIGIN: origin,
    PALACE_RP_ID: RP_ID,
    PALACE_ALLOWED_HOSTS: `${RP_ID}:${port}`,
    PALACE_UPSTREAM: `http://127.0.0.1:${upstream.port}`,
    PALACE_DSH_CREDENTIALS: path.join(stateDir, 'missing.yaml'),
    PALACE_COOKIE_SECURE: '0',
    PALACE_COOKIE_PREFIX: '0',
    PALACE_EXTRA_ORIGINS: origin,
    ...overrides.env,
  };
  const config = loadConfig({ env, configFile: path.join(stateDir, 'none.env') });
  const dshSecret = overrides.dshSecret ?? crypto.randomBytes(32);
  const app = createApp({ config, dshSecret });
  await new Promise((resolve) => app.server.listen(port, '127.0.0.1', resolve));
  return {
    app,
    config,
    port,
    origin,
    stateDir,
    dshSecret,
    upstream,
    client: () => new Client(port, { host: `${RP_ID}:${port}`, origin }),
    closeApp: () => app.close(),
    close: async () => {
      await app.close();
      await upstream.close();
    },
  };
}

async function setupOwner(gateway) {
  const client = gateway.client();
  const normalized = normalizeSetupToken(SETUP_TOKEN);
  gateway.app.store.createSetupToken({
    id: crypto.randomUUID(),
    hash: sha256Hex(normalized),
    createdAt: Date.now(),
    expiresAt: Date.now() + 10 * 60 * 1000,
  });

  const page = await client.get('/__palace/setup', { accept: 'text/html' });
  assert.equal(page.status, 200);
  assert.match(page.headers['content-security-policy'] ?? '', /default-src/);

  const started = await client.post('/__palace/api/setup/start', { token: SETUP_TOKEN });
  assert.equal(started.status, 200);
  const startBody = client.json(started);
  assert.match(startBody.qr, /^<svg/);
  assert.ok(startBody.secret.length >= 16);

  const code = totp(startBody.secret);
  const verified = await client.post('/__palace/api/setup/totp', { code });
  assert.equal(verified.status, 200);

  const authenticator = createAuthenticator({ rpId: RP_ID, origin: gateway.origin });
  const optionsResponse = await client.post('/__palace/api/setup/passkey/options', {});
  assert.equal(optionsResponse.status, 200);
  const optionsBody = client.json(optionsResponse);
  const registration = authenticator.register(optionsBody.options);
  const registrationResponse = await client.post('/__palace/api/setup/passkey/verify', {
    flow: optionsBody.flow,
    response: registration,
    name: '测试设备',
  });
  assert.equal(registrationResponse.status, 200, registrationResponse.body.toString());

  const finished = await client.post('/__palace/api/setup/finish', {});
  assert.equal(finished.status, 200, finished.body.toString());
  const finishBody = client.json(finished);
  assert.equal(finishBody.recoveryCodes.length, 10);
  assert.ok(client.cookies.get('palace-session'));

  return { client, authenticator, secret: startBody.secret, recoveryCodes: finishBody.recoveryCodes };
}

async function loginWithPasskey(gateway, authenticator, client = gateway.client()) {
  await client.get('/__palace/', { accept: 'text/html' });
  const optionsResponse = await client.post('/__palace/api/login/options', {});
  assert.equal(optionsResponse.status, 200, optionsResponse.body.toString());
  const body = client.json(optionsResponse);
  const assertion = authenticator.authenticate(body.options);
  const verified = await client.post('/__palace/api/login/verify', {
    flow: body.flow,
    response: assertion,
  });
  assert.equal(verified.status, 200, verified.body.toString());
  return client;
}

test('public surface: login page, closed legacy routes and CSRF defences', async (t) => {
  const gateway = await makeGateway();
  t.after(() => gateway.close());
  const client = gateway.client();

  const anonymous = await client.get('/', { accept: 'text/html' });
  assert.equal(anonymous.status, 303);
  assert.match(String(anonymous.headers.location), /^\/__palace\/\?next=/);

  const api = await client.get('/api/whatever');
  assert.equal(api.status, 401);
  assert.equal(client.json(api).error.code, 'unauthenticated');

  const legacy = await client.get('/connect');
  assert.equal(legacy.status, 403);
  const token = await client.get('/?token=abc');
  assert.equal(token.status, 403);

  const state = await client.get('/__palace/api/state');
  assert.equal(state.status, 200);
  assert.equal(client.json(state).initialized, false);

  const page = await client.get('/__palace/', { accept: 'text/html' });
  assert.equal(page.status, 200);
  assert.match(page.body.toString(), /登录/);
  assert.match(page.headers['content-security-policy'] ?? '', /script-src 'self'/);

  const fresh = gateway.client();
  const noCsrf = await fresh.post('/__palace/api/setup/start', { token: SETUP_TOKEN });
  assert.equal(noCsrf.status, 403);
  assert.equal(fresh.json(noCsrf).error.code, 'csrf_missing');

  const withCsrf = gateway.client();
  await withCsrf.get('/__palace/', { accept: 'text/html' });
  const badOrigin = await withCsrf.request('POST', '/__palace/api/setup/start', {
    body: { token: SETUP_TOKEN },
    headers: { origin: 'https://evil.example', 'sec-fetch-site': 'same-origin' },
  });
  assert.equal(badOrigin.status, 403);
  assert.equal(withCsrf.json(badOrigin).error.code, 'bad_origin');
});

test('bootstrap, proxy injection, response cookie filtering and streaming', async (t) => {
  const gateway = await makeGateway();
  t.after(() => gateway.close());
  const { client } = await setupOwner(gateway);

  const index = await client.get('/', { accept: 'text/html' });
  assert.equal(index.status, 200);
  assert.match(index.body.toString(), /upstream ok/);

  const last = gateway.upstream.requests.at(-1);
  assert.match(last.headers.cookie, /dsh-auth-[A-Za-z0-9_-]+=v1\./);
  assert.doesNotMatch(last.headers.cookie, /palace-session/);
  assert.equal(last.headers.host, `${RP_ID}:${gateway.port}`);
  assert.equal(last.headers['x-forwarded-for'], undefined);
  assert.equal(last.headers['cf-connecting-ip'], undefined);

  const forgedHeaders = await client.get('/forged', {
    headers: {
      'x-forwarded-for': '1.2.3.4',
      'cf-connecting-ip': '1.2.3.4',
      authorization: 'Bearer forged',
      'x-palace-user': 'owner',
    },
  });
  assert.equal(forgedHeaders.status, 200);
  const forged = gateway.upstream.requests.at(-1);
  assert.equal(forged.headers['x-forwarded-for'], undefined);
  assert.equal(forged.headers['cf-connecting-ip'], undefined);
  assert.equal(forged.headers.authorization, undefined);
  assert.equal(forged.headers['x-palace-user'], undefined);

  const cookieResponse = await client.get('/set-cookie');
  const setCookies = cookieResponse.headers['set-cookie'] ?? [];
  assert.ok(setCookies.some((cookie) => cookie.startsWith('keep=1')));
  assert.ok(!setCookies.some((cookie) => cookie.startsWith('dsh-auth-')));

  const stream = await client.get('/stream');
  assert.equal(stream.status, 200);
  assert.match(stream.body.toString(), /data: one/);
  assert.match(stream.body.toString(), /data: two/);

  const security = await client.get('/__palace/api/security');
  assert.equal(security.status, 200);
  const overview = client.json(security);
  assert.equal(overview.passkeys.length, 1);
  assert.equal(overview.sessions.length, 1);
  assert.equal(overview.sessions[0].current, true);
  assert.equal(overview.recoveryRemaining, 10);
});

test('passkey login survives a gateway restart', async (t) => {
  const gateway = await makeGateway();
  const { client, authenticator } = await setupOwner(gateway);
  const stateDir = gateway.stateDir;
  const port = gateway.port;
  const origin = gateway.origin;
  const dshSecret = gateway.dshSecret;
  const upstreamPort = gateway.upstream.port;
  await gateway.closeApp();

  const config = loadConfig({
    env: {
      PALACE_STATE_DIR: stateDir,
      PALACE_AUTH_PORT: String(port),
      PALACE_AUTH_HOST: '127.0.0.1',
      PALACE_PUBLIC_ORIGIN: origin,
      PALACE_RP_ID: RP_ID,
      PALACE_ALLOWED_HOSTS: `${RP_ID}:${port}`,
      PALACE_UPSTREAM: `http://127.0.0.1:${upstreamPort}`,
      PALACE_DSH_CREDENTIALS: path.join(stateDir, 'missing.yaml'),
      PALACE_COOKIE_SECURE: '0',
      PALACE_COOKIE_PREFIX: '0',
    },
    configFile: path.join(stateDir, 'none.env'),
  });
  const app = createApp({ config, dshSecret });
  await new Promise((resolve) => app.server.listen(port, '127.0.0.1', resolve));
  t.after(async () => {
    await app.close();
    await gateway.upstream.close();
  });

  const afterRestart = new Client(port, { host: `${RP_ID}:${port}`, origin });
  afterRestart.cookies = new Map(client.cookies);
  const proxied = await afterRestart.get('/', { accept: 'text/html' });
  assert.equal(proxied.status, 200);

  const fresh = new Client(port, { host: `${RP_ID}:${port}`, origin });
  const loggedIn = await loginWithPasskey({ port, origin }, authenticator, fresh);
  const page = await loggedIn.get('/', { accept: 'text/html' });
  assert.equal(page.status, 200);
});

test('TOTP recovery is restricted, revokes other sessions and is rate limited', async (t) => {
  const gateway = await makeGateway();
  t.after(() => gateway.close());
  const { client, authenticator, secret } = await setupOwner(gateway);
  const originalSession = client.cookies.get('palace-session');

  const recovery = gateway.client();
  await recovery.get('/__palace/', { accept: 'text/html' });
  const code = totp(secret, Date.now() + 30_000);
  const login = await recovery.post('/__palace/api/login/totp', { code });
  assert.equal(login.status, 200, login.body.toString());

  const root = await recovery.get('/', { accept: 'text/html' });
  assert.equal(root.status, 303);
  assert.equal(root.headers.location, '/__palace/recover');

  const blocked = await recovery.get('/api/sessions');
  assert.equal(blocked.status, 403);
  assert.equal(recovery.json(blocked).error.code, 'recovery_session');

  const recoverPage = await recovery.get('/__palace/recover', { accept: 'text/html' });
  assert.equal(recoverPage.status, 200);

  const optionsResponse = await recovery.post('/__palace/api/recover/passkey/options', {});
  assert.equal(optionsResponse.status, 200);
  const optionsBody = recovery.json(optionsResponse);
  const assertion = authenticator.register(optionsBody.options);
  const verified = await recovery.post('/__palace/api/recover/passkey/verify', {
    flow: optionsBody.flow,
    response: assertion,
    name: '恢复设备',
    revokeOthers: true,
  });
  assert.equal(verified.status, 200, verified.body.toString());

  const proxied = await recovery.get('/', { accept: 'text/html' });
  assert.equal(proxied.status, 200);

  const oldSession = new Client(gateway.port, { host: `${RP_ID}:${gateway.port}`, origin: gateway.origin });
  oldSession.cookies.set('palace-session', originalSession);
  const oldResult = await oldSession.get('/', { accept: 'text/html' });
  assert.equal(oldResult.status, 303);

  const bad = gateway.client();
  await bad.get('/__palace/', { accept: 'text/html' });
  let lastStatus = 0;
  for (let attempt = 0; attempt < 6; attempt += 1) {
    const response = await bad.post('/__palace/api/login/totp', { code: '000000' });
    lastStatus = response.status;
    if (lastStatus === 429) break;
  }
  assert.equal(lastStatus, 429);
});

test('WebSocket upgrades require session and exact origin, and revocation closes them', async (t) => {
  const gateway = await makeGateway();
  t.after(() => gateway.close());
  const { client, authenticator } = await setupOwner(gateway);
  const cookie = client.cookieHeader();

  const unauthorized = await rawUpgrade(gateway.port, {
    host: `${RP_ID}:${gateway.port}`,
    origin: gateway.origin,
    path: '/api/remote.mux',
  });
  assert.equal(unauthorized.status, 401);
  unauthorized.socket.destroy();

  const wrongOrigin = await rawUpgrade(gateway.port, {
    host: `${RP_ID}:${gateway.port}`,
    origin: 'https://evil.example',
    cookie,
    path: '/api/remote.mux',
  });
  assert.equal(wrongOrigin.status, 403);
  wrongOrigin.socket.destroy();

  const upgraded = await rawUpgrade(gateway.port, {
    host: `${RP_ID}:${gateway.port}`,
    origin: gateway.origin,
    cookie,
    path: '/api/remote.mux',
  });
  assert.equal(upgraded.status, 101);
  const upstreamCall = gateway.upstream.requests.at(-1);
  assert.match(upstreamCall.headers.cookie, /dsh-auth-/);

  const closed = new Promise((resolve) => upgraded.socket.once('close', resolve));

  const second = await loginWithPasskey(gateway, authenticator);
  const overviewResponse = await second.get('/__palace/api/security');
  const overview = second.json(overviewResponse);
  const other = overview.sessions.find((session) => !session.current);
  assert.ok(other, 'expected two active sessions');

  const reauthOptions = await second.post('/__palace/api/security/reauth/options', {});
  const reauthBody = second.json(reauthOptions);
  const reauthAssertion = authenticator.authenticate(reauthBody.options);
  const reauth = await second.post('/__palace/api/security/reauth/verify', {
    flow: reauthBody.flow,
    response: reauthAssertion,
  });
  assert.equal(reauth.status, 200);

  const revoked = await second.post('/__palace/api/security/sessions/revoke', { id: other.id });
  assert.equal(revoked.status, 200);

  await Promise.race([
    closed,
    new Promise((_, reject) => setTimeout(() => reject(new Error('websocket was not closed')), 3000)),
  ]);
});

test('security changes require fresh re-authentication', async (t) => {
  const gateway = await makeGateway();
  t.after(() => gateway.close());
  const { client, authenticator } = await setupOwner(gateway);

  const overview = client.json(await client.get('/__palace/api/security'));
  const sessionId = overview.sessions[0].id;
  gateway.app.store.db
    .prepare('UPDATE sessions SET reauth_at = ? WHERE id = ?')
    .run(Date.now() - 10 * 60 * 1000, sessionId);

  const blocked = await client.post('/__palace/api/security/passkey/options', {});
  assert.equal(blocked.status, 403);
  assert.equal(client.json(blocked).error.code, 'reauth_required');

  const options = await client.post('/__palace/api/security/reauth/options', {});
  assert.equal(options.status, 200);
  const body = client.json(options);
  const assertion = authenticator.authenticate(body.options);
  const verified = await client.post('/__palace/api/security/reauth/verify', {
    flow: body.flow,
    response: assertion,
  });
  assert.equal(verified.status, 200);

  const allowed = await client.post('/__palace/api/security/passkey/options', {});
  assert.equal(allowed.status, 200);
  assert.ok(client.json(allowed).options.challenge);
});
