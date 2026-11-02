import crypto from 'node:crypto';

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
const PERIOD_SECONDS = 30;
const DIGITS = 6;

/** RFC 4648 base32 without padding, as used by authenticator apps. */
export function base32Encode(buffer) {
  let bits = 0;
  let value = 0;
  let output = '';
  for (const byte of buffer) {
    value = (value << 8) | byte;
    bits += 8;
    while (bits >= 5) {
      output += ALPHABET[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }
  if (bits > 0) output += ALPHABET[(value << (5 - bits)) & 31];
  return output;
}

export function base32Decode(text) {
  const normalized = String(text).toUpperCase().replace(/[\s=-]/g, '');
  let bits = 0;
  let value = 0;
  const bytes = [];
  for (const char of normalized) {
    const index = ALPHABET.indexOf(char);
    if (index === -1) throw new Error('invalid base32 character');
    value = (value << 5) | index;
    bits += 5;
    if (bits >= 8) {
      bytes.push((value >>> (bits - 8)) & 0xff);
      bits -= 8;
    }
  }
  return Buffer.from(bytes);
}

/** 160-bit random seed, the size authenticator apps expect. */
export function generateTotpSecret() {
  return base32Encode(crypto.randomBytes(20));
}

export function timeStep(now = Date.now()) {
  return Math.floor(now / 1000 / PERIOD_SECONDS);
}

/** RFC 4226 HOTP value for one counter. */
export function hotp(secretBase32, counter, digits = DIGITS) {
  const key = base32Decode(secretBase32);
  const message = Buffer.alloc(8);
  message.writeBigUInt64BE(BigInt(counter));
  const digest = crypto.createHmac('sha1', key).update(message).digest();
  const offset = digest[digest.length - 1] & 0x0f;
  const binary =
    ((digest[offset] & 0x7f) << 24) |
    ((digest[offset + 1] & 0xff) << 16) |
    ((digest[offset + 2] & 0xff) << 8) |
    (digest[offset + 3] & 0xff);
  return String(binary % 10 ** digits).padStart(digits, '0');
}

export function totp(secretBase32, now = Date.now()) {
  return hotp(secretBase32, timeStep(now));
}

/**
 * Verify a TOTP code with a +/-1 step window.
 * @returns {number} matched time step, or -1 on failure.
 */
export function verifyTotp(secretBase32, code, options = {}) {
  const normalized = String(code).replace(/\s/g, '');
  if (!/^\d{6}$/.test(normalized)) return -1;
  const now = options.now ?? Date.now();
  const window = options.window ?? 1;
  const current = timeStep(now);
  for (let delta = -window; delta <= window; delta += 1) {
    const step = current + delta;
    if (step < 0) continue;
    const expected = hotp(secretBase32, step);
    const left = Buffer.from(expected);
    const right = Buffer.from(normalized);
    if (left.length === right.length && crypto.timingSafeEqual(left, right)) return step;
  }
  return -1;
}

/** otpauth:// URI consumed by authenticator apps when scanning a QR code. */
export function otpauthUrl({ secret, issuer = 'Palace', account = 'owner' }) {
  const label = encodeURIComponent(`${issuer}:${account}`);
  const query = new URLSearchParams({
    secret,
    issuer,
    algorithm: 'SHA1',
    digits: String(DIGITS),
    period: String(PERIOD_SECONDS),
  });
  return `otpauth://totp/${label}?${query.toString()}`;
}

/** 128-bit one-time recovery code, grouped for transcription. */
export function generateRecoveryCode() {
  const raw = base32Encode(crypto.randomBytes(16));
  if (raw.length !== 26) throw new Error('unexpected recovery code length');
  return raw.replace(/(.{5})(?=.)/g, '$1-');
}

export function normalizeRecoveryCode(code) {
  return String(code).toUpperCase().replace(/[^A-Z2-7]/g, '');
}

/** Setup tokens use the same alphabet; dashes and spaces are cosmetic. */
export function normalizeSetupToken(token) {
  return String(token).toUpperCase().replace(/[^A-Z2-7]/g, '');
}
