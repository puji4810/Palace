/**
 * Real-browser end-to-end check for the Palace gateway.
 *
 * Drives Chromium through the full first-run setup (TOTP + passkey), the
 * proxied landing page, logout and a passkey login. WebAuthn is provided by
 * Chrome's virtual authenticator over CDP, so no hardware is needed.
 *
 * Playwright is intentionally not a dependency of this package; point
 * PLAYWRIGHT_HOME at a directory that has it installed (defaults to the
 * throw-away install used on the Palace host).
 */
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createRequire } from 'node:module';
import { loadConfig } from '../src/config.mjs';
import { createApp } from '../src/server.mjs';
import { randomToken, sha256Hex } from '../src/crypto.mjs';
import { normalizeSetupToken, totp } from '../src/totp.mjs';
import { freePort, startUpstream } from './helpers.mjs';

const PLAYWRIGHT_HOME = process.env.PLAYWRIGHT_HOME ?? '/home/ubuntu/palace/.tmp-e2e';
process.env.PLAYWRIGHT_BROWSERS_PATH ??= path.join(PLAYWRIGHT_HOME, 'browsers');
const requireFromPlaywright = createRequire(path.join(PLAYWRIGHT_HOME, 'package.json'));
let chromium;
try {
  ({ chromium } = requireFromPlaywright('playwright'));
} catch (error) {
  console.error(`Playwright is not available under ${PLAYWRIGHT_HOME}: ${error.message}`);
  process.exit(2);
}

function issueSetupToken(store) {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  const bytes = crypto.randomBytes(16);
  const body = Array.from(bytes, (byte) => alphabet[byte % 32]).join('');
  const token = `PALACE-${body.slice(0, 4)}-${body.slice(4, 8)}-${body.slice(8, 12)}-${body.slice(12, 16)}`;
  const now = Date.now();
  store.db.prepare('DELETE FROM setup_tokens WHERE used_at IS NULL').run();
  store.createSetupToken({
    id: randomToken(12),
    hash: sha256Hex(normalizeSetupToken(token)),
    createdAt: now,
    expiresAt: now + 10 * 60 * 1000,
  });
  return token;
}

const step = (message) => console.log(`• ${message}`);

const stateDir = fs.mkdtempSync(path.join(os.tmpdir(), 'palace-e2e-'));
const upstream = await startUpstream();
const port = await freePort();
const origin = `http://localhost:${port}`;
const config = loadConfig({
  env: {
    PALACE_STATE_DIR: stateDir,
    PALACE_AUTH_PORT: String(port),
    PALACE_AUTH_HOST: '127.0.0.1',
    PALACE_PUBLIC_ORIGIN: origin,
    PALACE_RP_ID: 'localhost',
    PALACE_ALLOWED_HOSTS: `localhost:${port}`,
    PALACE_UPSTREAM: `http://127.0.0.1:${upstream.port}`,
    PALACE_DSH_CREDENTIALS: path.join(stateDir, 'missing.yaml'),
    PALACE_COOKIE_SECURE: '0',
    PALACE_COOKIE_PREFIX: '0',
    PALACE_EXTRA_ORIGINS: origin,
  },
  configFile: path.join(stateDir, 'none.env'),
});
const app = createApp({ config, dshSecret: crypto.randomBytes(32) });
await new Promise((resolve) => app.server.listen(port, '127.0.0.1', resolve));
const token = issueSetupToken(app.store);

let browser;
let cdp;
try {
  browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', (error) => errors.push(String(error)));
  page.on('console', (message) => {
    if (message.type() === 'error') console.error('console:', message.text());
  });
  page.on('response', (response) => {
    if (response.url().includes('/__palace/api/') && response.status() >= 400) {
      console.error('api:', response.status(), response.url());
    }
  });

  step('opening setup page');
  await page.goto(`${origin}/__palace/setup`);
  assert.equal(await page.title(), '初始化 · Palace');

  await page.fill('#setup-token', token);
  await page.click('#token-form button[type="submit"]');
  await page.waitForSelector('#step-2:not(.hidden)');
  step('TOTP secret shown; submitting a live code');

  const secret = (await page.textContent('#totp-secret')).replace(/\s+/g, '');
  assert.ok(secret.length >= 16, 'expected a base32 TOTP secret');
  await page.fill('#totp-code', totp(secret));
  await page.click('#totp-form button[type="submit"]');
  await page.waitForSelector('#step-3:not(.hidden)');

  step('installing Chrome virtual authenticator');
  cdp = await context.newCDPSession(page);
  await cdp.send('WebAuthn.enable');
  await cdp.send('WebAuthn.addVirtualAuthenticator', {
    options: {
      protocol: 'ctap2',
      transport: 'internal',
      hasResidentKey: true,
      hasUserVerification: true,
      isUserVerified: true,
      automaticPresenceSimulation: true,
    },
  });

  await page.fill('#passkey-name', 'E2E browser');
  await page.click('#passkey-form button[type="submit"]');
  try {
    await page.waitForSelector('#step-4:not(.hidden)', { timeout: 20_000 });
  } catch (error) {
    console.error('passkey step failed:', await page.textContent('#status-3'));
    const diagnostic = await page.evaluate(async () => {
      const csrf = Object.fromEntries(document.cookie.split('; ').map((pair) => pair.split('=')))['palace-csrf'];
      const response = await fetch('/__palace/api/setup/passkey/options', {
        method: 'POST',
        headers: { 'content-type': 'application/json', 'x-palace-csrf': csrf },
        body: '{}',
      });
      const { options } = await response.json();
      const publicKey = {
        ...options,
        challenge: Uint8Array.from(atob(options.challenge.replace(/-/g, '+').replace(/_/g, '/')), (c) => c.charCodeAt(0)),
        user: { ...options.user, id: Uint8Array.from(atob(options.user.id.replace(/-/g, '+').replace(/_/g, '/')), (c) => c.charCodeAt(0)) },
      };
      publicKey.excludeCredentials = [];
      try {
        const credential = await navigator.credentials.create({ publicKey });
        return { ok: true, rp: options.rp, origin: location.origin, secure: window.isSecureContext, id: credential.id };
      } catch (error) {
        return { ok: false, rp: options.rp, origin: location.origin, secure: window.isSecureContext, name: error.name, message: error.message };
      }
    });
    console.error('diagnostic:', JSON.stringify(diagnostic));
    throw error;
  }
  const recoveryCodes = await page.$$eval('#recovery-codes span', (nodes) =>
    nodes.map((node) => node.textContent.trim()),
  );
  assert.equal(recoveryCodes.length, 10, 'expected ten recovery codes');
  step(`bound passkey and received ${recoveryCodes.length} recovery codes`);

  await page.check('#saved-codes');
  await page.click('#finish-setup');
  await page.waitForURL(`${origin}/`, { timeout: 10_000 });
  await page.waitForSelector('#upstream', { timeout: 10_000 });
  assert.equal(await page.textContent('#upstream'), 'upstream ok');
  step('landing page is proxied to upstream with the injected DSH cookie');
  assert.ok(
    upstream.requests.some((request) => /dsh-auth-/.test(request.headers.cookie ?? '')),
    'expected the gateway to mint a DSH cookie',
  );

  const cookies = await context.cookies(origin);
  const session = cookies.find((cookie) => cookie.name === 'palace-session');
  assert.ok(session, 'expected a session cookie');
  assert.equal(session.httpOnly, true);
  assert.equal(session.secure, false, 'dev config disables Secure');
  assert.equal(session.sameSite, 'Lax');
  step('session cookie is HttpOnly + SameSite=Lax');

  step('opening the security page');
  await page.goto(`${origin}/__palace/security`);
  await page.waitForSelector('#passkey-list .row', { timeout: 10_000 });
  assert.match(await page.textContent('body'), /E2E browser/);

  step('logging out and signing back in with the passkey');
  await page.click('#logout');
  await page.waitForSelector('#passkey-login', { timeout: 10_000 });
  await page.click('#passkey-login');
  await page.waitForURL(`${origin}/`, { timeout: 20_000 });
  await page.waitForSelector('#upstream', { timeout: 10_000 });
  step('passkey re-login reached Palace');

  assert.deepEqual(errors, [], `page errors: ${errors.join('; ')}`);
  console.log('\nBrowser E2E passed.');
} finally {
  await browser?.close().catch(() => {});
  await app.close();
  await upstream.close();
  fs.rmSync(stateDir, { recursive: true, force: true });
}
