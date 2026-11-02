import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';

import {
  decryptString,
  encryptString,
  loadOrCreateMasterKey,
  mintDshCookie,
  readDshSigningSecret,
} from '../src/crypto.mjs';
import { openStore } from '../src/store.mjs';
import {
  base32Decode,
  base32Encode,
  generateRecoveryCode,
  hotp,
  normalizeRecoveryCode,
  normalizeSetupToken,
  verifyTotp,
} from '../src/totp.mjs';

test('base32 round-trips arbitrary bytes', () => {
  for (const bytes of [Buffer.from('a'), Buffer.from('hello world'), crypto.randomBytes(32)]) {
    assert.deepEqual(base32Decode(base32Encode(bytes)), bytes);
  }
});

test('HOTP matches RFC 4226 test vectors', () => {
  const secret = base32Encode(Buffer.from('12345678901234567890'));
  const expected = ['755224', '287082', '359152', '969429', '338314', '254676', '287922', '162583', '399871', '520489'];
  expected.forEach((code, counter) => assert.equal(hotp(secret, counter), code));
});

test('verifyTotp accepts the current step and rejects a stale code', () => {
  const secret = base32Encode(Buffer.from('12345678901234567890'));
  const now = 1_700_000_000_000;
  const code = hotp(secret, Math.floor(now / 30_000));
  assert.ok(verifyTotp(secret, code, { now }) >= 0);
  assert.equal(verifyTotp(secret, code, { now: now + 120_000 }), -1);
  assert.equal(verifyTotp(secret, '000000', { now }), -1);
});

test('recovery codes carry 128 bits and normalize consistently', () => {
  const code = generateRecoveryCode();
  assert.match(code, /^[A-Z2-7]{5}(-[A-Z2-7]{5}){4}-[A-Z2-7]$/);
  assert.equal(normalizeRecoveryCode(code).length, 26);
  assert.equal(normalizeRecoveryCode(code.toLowerCase()), normalizeRecoveryCode(code));
});

test('setup tokens ignore formatting characters', () => {
  assert.equal(normalizeSetupToken('palace-abcd-efgh'), normalizeSetupToken('PALACE ABCDEFGH'));
});

test('AES-GCM envelope round-trips and rejects tampering', () => {
  const key = crypto.randomBytes(32);
  const envelope = encryptString(key, 'totp-seed', 'aad');
  assert.equal(decryptString(key, envelope, 'aad'), 'totp-seed');
  assert.throws(() => decryptString(key, envelope, 'other-aad'));
  const tampered = envelope.slice(0, -2) + (envelope.endsWith('AA') ? 'BB' : 'AA');
  assert.throws(() => decryptString(key, tampered, 'aad'));
});

test('master key is created with restrictive permissions and is stable', () => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'palace-key-'));
  const keyPath = path.join(directory, 'master.key');
  const first = loadOrCreateMasterKey(keyPath);
  const second = loadOrCreateMasterKey(keyPath);
  assert.deepEqual(first, second);
  assert.equal(first.byteLength, 32);
  assert.equal(fs.statSync(keyPath).mode & 0o777, 0o600);
});

test('DSH secret parsing yields the persisted signing key', () => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'palace-cred-'));
  const file = path.join(directory, '.credentials.yaml');
  const secret = crypto.randomBytes(32).toString('base64url');
  fs.writeFileSync(
    file,
    `version: 1\nrecords:\n  client-connection/browser-session:\n    kind: grant\n    payload:\n      version: 1\n      secret: ${secret}\n`,
  );
  assert.equal(readDshSigningSecret(file).toString('base64url'), secret);
  fs.writeFileSync(file, 'version: 1\nrecords: {}\n');
  assert.throws(() => readDshSigningSecret(file));
});

test('minted DSH cookie matches the installed cookie format', () => {
  const secret = crypto.randomBytes(32);
  const authority = 'bot.pu-ji.top';
  const now = 1_700_000_000_000;
  const cookie = mintDshCookie(secret, authority, { issuedAt: now, ttlMs: 3_600_000 });
  const [name, value] = cookie.split('=');
  assert.equal(name, `dsh-auth-${crypto.createHash('sha256').update(authority).digest('base64url')}`);
  const [version, body, signature] = value.split('.');
  assert.equal(version, 'v1');
  assert.equal(
    signature,
    crypto.createHmac('sha256', secret).update(body).digest('base64url'),
  );
  const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'));
  assert.deepEqual(payload, {
    version: 1,
    authority,
    issuedAt: now,
    expiresAt: now + 3_600_000,
  });
});

test('store enforces single-use tokens and sessions', () => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'palace-store-'));
  const store = openStore(path.join(directory, 'db.sqlite'));
  const now = Date.now();
  store.createSetupToken({ id: 'a', hash: 'h', createdAt: now, expiresAt: now + 1000 });
  assert.equal(store.consumeSetupToken('h', now), true);
  assert.equal(store.consumeSetupToken('h', now), false);

  store.createSession({
    id: 's',
    kind: 'normal',
    createdAt: now,
    lastSeen: now,
    idleExpires: now + 1000,
    expiresAt: now + 2000,
    data: {},
  });
  assert.equal(store.revokeSession('s', now), 1);
  assert.equal(store.revokeSession('s', now), 0);
  store.close();
});
