#!/usr/bin/env node
import crypto from 'node:crypto';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

import { describeConfig, loadConfig } from './config.mjs';
import {
  loadOrCreateMasterKey,
  mintDshCookie,
  randomToken,
  readDshSigningSecret,
  sha256Hex,
} from './crypto.mjs';
import { openStore } from './store.mjs';
import { normalizeSetupToken } from './totp.mjs';

function args(argv) {
  const positional = [];
  const flags = new Map();
  for (const item of argv) {
    if (item.startsWith('--')) {
      const [key, value] = item.slice(2).split('=');
      flags.set(key, value ?? true);
    } else {
      positional.push(item);
    }
  }
  return { positional, flags };
}

function formatTime(ms) {
  if (!ms) return '—';
  return new Date(ms).toLocaleString('zh-CN', { hour12: false });
}

const SETUP_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

function tokenGrouped() {
  const bytes = crypto.randomBytes(16);
  let text = '';
  for (let index = 0; index < 16; index += 1) {
    text += SETUP_ALPHABET[bytes[index] % 32];
  }
  return `PALACE-${text.slice(0, 4)}-${text.slice(4, 8)}-${text.slice(8, 12)}-${text.slice(12, 16)}`;
}

function printStatus(config, store) {
  const now = Date.now();
  console.log(`Palace 认证网关`);
  for (const [key, value] of Object.entries(describeConfig(config))) {
    console.log(`  ${key.padEnd(14)} ${String(value)}`);
  }
  console.log(`  initialized    ${store.isInitialized() ? 'yes' : 'no'}`);
  console.log(`  passkeys       ${store.countPasskeys()}`);
  console.log(`  sessions       ${store.listSessions(now).length}`);
  console.log(`  recoveryCodes  ${store.countUnusedRecoveryCodes()}`);
  console.log(`  setupTokens    ${store.countUnusedSetupTokens(now)}`);
}

function commandSetupToken(config, store, flags) {
  const ttl = Number(flags.get('ttl') ?? 600);
  if (!Number.isSafeInteger(ttl) || ttl < 60 || ttl > 3600) {
    throw new Error('--ttl must be between 60 and 3600 seconds');
  }
  const token = tokenGrouped();
  const now = Date.now();
  store.db.prepare('DELETE FROM setup_tokens WHERE used_at IS NULL').run();
  store.createSetupToken({
    id: randomToken(12),
    hash: sha256Hex(normalizeSetupToken(token)),
    createdAt: now,
    expiresAt: now + ttl * 1000,
  });
  store.audit('cli.setup_token_created', { detail: null });
  if (flags.get('json')) {
    console.log(JSON.stringify({ token, expiresAt: now + ttl * 1000, url: `${config.publicOrigin}/__palace/setup` }));
    return;
  }
  console.log('一次性绑定凭证（只显示这一次，仅可使用一次）：\n');
  console.log(`  ${token}\n`);
  console.log(`有效期：${Math.round(ttl / 60)} 分钟（至 ${formatTime(now + ttl * 1000)}）`);
  console.log(`打开：${config.publicOrigin}/__palace/setup`);
  console.log('在页面上输入该凭证，然后按提示绑定验证器、通行密钥并保存恢复码。');
}

function commandSessions(config, store) {
  const sessions = store.listSessions(Date.now());
  if (sessions.length === 0) {
    console.log('没有有效会话。');
    return;
  }
  for (const session of sessions) {
    console.log(
      `${session.id}  ${session.kind.padEnd(9)}  last=${formatTime(session.last_seen)}  ip=${session.ip ?? '-'}  ${String(session.ua ?? '').slice(0, 50)}`,
    );
  }
}

function commandRevoke(config, store, positional, flags) {
  const target = positional[0];
  if (!target) throw new Error('usage: revoke <session-id-prefix|all> [--yes]');
  const now = Date.now();
  if (target === 'all') {
    if (!flags.get('yes')) throw new Error('refusing to revoke every session without --yes');
    const count = store.revokeAllSessions(now);
    console.log(`已撤销 ${count} 个会话。`);
    return;
  }
  const matches = store.listSessions(now).filter((session) => session.id.startsWith(target));
  if (matches.length === 0) throw new Error('no matching session');
  if (matches.length > 1) throw new Error('session prefix is ambiguous; use more characters');
  store.revokeSession(matches[0].id, now);
  console.log(`已撤销会话 ${matches[0].id}`);
}

function commandReset(config, store, flags) {
  if (!flags.get('yes')) throw new Error('refusing to reset Palace credentials without --yes');
  store.tx(() => {
    store.db.prepare('DELETE FROM passkeys').run();
    store.db.prepare('DELETE FROM totp').run();
    store.db.prepare('DELETE FROM recovery_codes').run();
    store.db.prepare('DELETE FROM sessions').run();
    store.db.prepare('DELETE FROM challenges').run();
    store.db.prepare('DELETE FROM setup_tokens').run();
    store.db.prepare('DELETE FROM owner').run();
    store.db.prepare("DELETE FROM meta WHERE key IN ('initialized_at','user_handle')").run();
    store.audit('cli.reset');
  });
  console.log('已清除 owner、通行密钥、验证器、恢复码和全部会话。请重新生成绑定凭证。');
  console.log('下一步：palace-auth setup-token');
}

function commandBackup(config, store, positional) {
  const destination = path.resolve(positional[0] ?? path.join(config.stateDir, `backup-${Date.now()}.sqlite`));
  store.backup(destination);
  console.log(`数据库备份已写入 ${destination}`);
  console.log(`加密密钥位于 ${config.keyPath}，请与数据库备份分开保管。`);
  console.log('恢复旧备份后应立即运行 revoke all，避免已撤销凭据复活。');
}

function commandRestore(config, positional, flags) {
  const source = positional[0];
  if (!source) throw new Error('usage: restore <backup.sqlite> --yes');
  if (!flags.get('yes')) throw new Error('stop the gateway and pass --yes to restore');
  const resolved = path.resolve(source);
  if (!fs.existsSync(resolved)) throw new Error(`backup not found: ${resolved}`);
  for (const suffix of ['-wal', '-shm']) {
    try {
      fs.unlinkSync(config.dbPath + suffix);
    } catch {
      /* absent */
    }
  }
  fs.copyFileSync(resolved, config.dbPath);
  fs.chmodSync(config.dbPath, 0o600);
  const store = openStore(config.dbPath);
  const count = store.revokeAllSessions(Date.now());
  store.audit('cli.restore');
  store.close();
  console.log(`已恢复数据库，并撤销 ${count} 个会话。请重启网关服务。`);
  console.log(`确认 ${config.keyPath} 与备份匹配；不匹配时 TOTP 绑定将无法解密。`);
}

function commandDoctor(config) {
  let ok = true;
  const report = (label, passed, detail) => {
    console.log(`${passed ? 'ok  ' : 'FAIL'}  ${label}${detail ? `  (${detail})` : ''}`);
    if (!passed) ok = false;
  };

  try {
    fs.accessSync(config.stateDir, fs.constants.R_OK | fs.constants.W_OK);
    report('state directory', true, config.stateDir);
  } catch (error) {
    report('state directory', false, String(error?.message ?? error));
  }

  try {
    loadOrCreateMasterKey(config.keyPath);
    report('master key', true, config.keyPath);
  } catch (error) {
    report('master key', false, String(error?.message ?? error));
  }

  let secret = null;
  try {
    secret = readDshSigningSecret(config.dshCredentials);
    report('DSH signing secret', true, config.dshCredentials);
  } catch (error) {
    report('DSH signing secret', false, String(error?.message ?? error));
  }

  if (secret) {
    const host = new URL(config.publicOrigin).host;
    const cookie = mintDshCookie(secret, host);
    const url = new URL(config.upstream);
    const request = http.request(
      {
        hostname: url.hostname,
        port: url.port === '' ? 80 : Number(url.port),
        path: '/',
        method: 'GET',
        headers: { host, cookie, accept: 'text/html' },
        timeout: 5000,
      },
      (response) => {
        report('DSH bridge GET /', response.statusCode === 200, `HTTP ${response.statusCode}`);
        response.resume();
        console.log(ok ? '\n所有检查通过。' : '\n存在失败项，请先修复再切换流量。');
        process.exitCode = ok ? 0 : 1;
      },
    );
    request.on('timeout', () => request.destroy(new Error('timeout')));
    request.on('error', (error) => {
      report('DSH bridge GET /', false, String(error?.message ?? error));
      console.log('\n存在失败项，请先修复再切换流量。');
      process.exitCode = 1;
    });
    request.end();
    return;
  }
  console.log('\n存在失败项，请先修复再切换流量。');
  process.exitCode = 1;
}

function commandAudit(config, store, positional) {
  const limit = Math.min(Math.max(Number(positional[0] ?? 40), 1), 500);
  for (const row of store.listAudit(limit)) {
    console.log(
      `${formatTime(row.ts)}  ${row.event.padEnd(28)}  ${row.ip ?? '-'}  ${row.detail ?? ''}`,
    );
  }
}

function help() {
  console.log(`Palace 认证网关管理命令

  node src/cli.mjs status
  node src/cli.mjs setup-token [--ttl 600] [--json]
  node src/cli.mjs sessions
  node src/cli.mjs revoke <session-id-prefix|all> [--yes]
  node src/cli.mjs reset [--yes]
  node src/cli.mjs backup [destination.sqlite]
  node src/cli.mjs restore <backup.sqlite> --yes
  node src/cli.mjs audit [limit]
  node src/cli.mjs doctor

环境变量：PALACE_STATE_DIR、PALACE_AUTH_CONFIG 等，见 src/config.mjs。`);
}

export function main(argv = process.argv.slice(2)) {
  const { positional, flags } = args(argv);
  const [command] = positional;
  const config = loadConfig();
  if (command === undefined || command === 'help' || command === '--help') {
    help();
    return;
  }
  if (command === 'doctor') {
    commandDoctor(config);
    return;
  }
  const store = openStore(config.dbPath);
  try {
    switch (command) {
      case 'status':
        printStatus(config, store);
        break;
      case 'setup-token':
        commandSetupToken(config, store, flags);
        break;
      case 'sessions':
        commandSessions(config, store);
        break;
      case 'revoke':
        commandRevoke(config, store, positional.slice(1), flags);
        break;
      case 'reset':
        commandReset(config, store, flags);
        break;
      case 'backup':
        commandBackup(config, store, positional.slice(1));
        break;
      case 'restore':
        store.close();
        commandRestore(config, positional.slice(1), flags);
        return;
      case 'audit':
        commandAudit(config, store, positional.slice(1));
        break;
      default:
        throw new Error(`unknown command: ${command}`);
    }
  } finally {
    try {
      store.close();
    } catch {
      /* already closed */
    }
  }
}

const isMain = process.argv[1] !== undefined && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href;
if (isMain) {
  try {
    main();
  } catch (error) {
    console.error(`错误：${String(error?.message ?? error)}`);
    process.exit(1);
  }
}
