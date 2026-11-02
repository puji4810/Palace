import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const KEY_BYTES = 32;
const IV_BYTES = 12;
const TAG_BYTES = 16;

/** Random URL-safe token with `bytes` bytes of entropy (default 32 = 256 bit). */
export function randomToken(bytes = 32) {
  return crypto.randomBytes(bytes).toString('base64url');
}

/** SHA-256 as lowercase hex; used to store bearer tokens without keeping them. */
export function sha256Hex(value) {
  return crypto.createHash('sha256').update(value, 'utf8').digest('hex');
}

/** Constant-time comparison of two UTF-8 strings of arbitrary length. */
export function timingSafeEqualStr(a, b) {
  const left = Buffer.from(String(a), 'utf8');
  const right = Buffer.from(String(b), 'utf8');
  if (left.length !== right.length) return false;
  return crypto.timingSafeEqual(left, right);
}

export function base64url(buffer) {
  return Buffer.from(buffer).toString('base64url');
}

export function fromBase64url(value) {
  return Buffer.from(String(value), 'base64url');
}

/**
 * Load the 32-byte data-encryption key, creating it (mode 0600) on first use.
 * The key never leaves the host and is deliberately stored outside SQLite.
 */
export function loadOrCreateMasterKey(keyPath) {
  fs.mkdirSync(path.dirname(keyPath), { recursive: true, mode: 0o700 });
  try {
    const existing = fs.readFileSync(keyPath);
    if (existing.byteLength !== KEY_BYTES) {
      throw new Error(`master key at ${keyPath} is not ${KEY_BYTES} bytes`);
    }
    return existing;
  } catch (error) {
    if (error && error.code !== 'ENOENT') throw error;
  }
  const generated = crypto.randomBytes(KEY_BYTES);
  const temporary = `${keyPath}.tmp-${process.pid}-${Date.now()}`;
  fs.writeFileSync(temporary, generated, { mode: 0o600, flag: 'wx' });
  fs.renameSync(temporary, keyPath);
  fs.chmodSync(keyPath, 0o600);
  return generated;
}

/** AES-256-GCM encrypt a UTF-8 string; output is `v1.<iv>.<tag>.<ciphertext>`. */
export function encryptString(key, plaintext, aad = '') {
  const iv = crypto.randomBytes(IV_BYTES);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  if (aad) cipher.setAAD(Buffer.from(aad, 'utf8'));
  const ciphertext = Buffer.concat([cipher.update(String(plaintext), 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `v1.${base64url(iv)}.${base64url(tag)}.${base64url(ciphertext)}`;
}

/** Decrypt a value produced by {@link encryptString}. Throws on tampering. */
export function decryptString(key, envelope, aad = '') {
  const parts = String(envelope).split('.');
  if (parts.length !== 4 || parts[0] !== 'v1') throw new Error('encrypted value has an unknown format');
  const iv = fromBase64url(parts[1]);
  const tag = fromBase64url(parts[2]);
  const ciphertext = fromBase64url(parts[3]);
  if (iv.byteLength !== IV_BYTES || tag.byteLength !== TAG_BYTES) {
    throw new Error('encrypted value has invalid parameters');
  }
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
  if (aad) decipher.setAAD(Buffer.from(aad, 'utf8'));
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString('utf8');
}

/**
 * Read the DSH browser-session signing secret from its credential store.
 *
 * This is the version-pinned bridge identified in the implementation plan:
 * DSH keeps a stable HMAC secret in `$DSH_HOME/.credentials.yaml`; the gateway
 * mints short-lived upstream cookies with it instead of scraping launch tokens
 * from logs or exposing them to browsers. The secret never leaves the host.
 *
 * @param {string} credentialsPath
 * @returns {Buffer} 32-byte HMAC secret
 */
export function readDshSigningSecret(credentialsPath) {
  const text = fs.readFileSync(credentialsPath, 'utf8');
  const matches = [...text.matchAll(/^\s*secret:\s*([A-Za-z0-9_-]+)\s*$/gmu)];
  if (matches.length !== 1) {
    throw new Error(
      `expected exactly one browser-session secret in ${credentialsPath}, found ${matches.length}`,
    );
  }
  const secret = Buffer.from(matches[0][1], 'base64url');
  if (secret.byteLength !== KEY_BYTES) {
    throw new Error('DSH browser-session secret is not 32 bytes');
  }
  return secret;
}

/**
 * Mint the exact signed cookie DSH expects for one authority.
 *
 * Mirrors `dsh-client-connection` v1 cookie format for a plain-HTTP listener:
 * `{version:1, authority, issuedAt, expiresAt}` signed with HMAC-SHA256.
 *
 * @param {Buffer} secret
 * @param {string} authority Host header value DSH will observe
 * @param {{ issuedAt?: number, ttlMs?: number }} [options]
 * @returns {string} `Cookie` header fragment
 */
export function mintDshCookie(secret, authority, options = {}) {
  const issuedAt = options.issuedAt ?? Date.now();
  const expiresAt = issuedAt + (options.ttlMs ?? 60 * 60 * 1000);
  const name =
    'dsh-auth-' + crypto.createHash('sha256').update(authority, 'utf8').digest('base64url');
  const body = Buffer.from(
    JSON.stringify({ version: 1, authority, issuedAt, expiresAt }),
    'utf8',
  ).toString('base64url');
  const signature = crypto.createHmac('sha256', secret).update(body).digest('base64url');
  return `${name}=v1.${body}.${signature}`;
}
