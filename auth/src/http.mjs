import { randomToken, timingSafeEqualStr } from './crypto.mjs';

export class HttpError extends Error {
  constructor(status, code, message, headers = {}) {
    super(message);
    this.status = status;
    this.code = code;
    this.headers = headers;
  }
}

export function parseCookies(headerValue) {
  const cookies = new Map();
  if (!headerValue) return cookies;
  for (const segment of headerValue.split(';')) {
    const at = segment.indexOf('=');
    if (at === -1) continue;
    const name = segment.slice(0, at).trim();
    const value = segment.slice(at + 1).trim();
    if (name && !cookies.has(name)) cookies.set(name, value);
  }
  return cookies;
}

export function appendSetCookie(res, value) {
  const existing = res.getHeader('set-cookie');
  if (existing === undefined) res.setHeader('set-cookie', value);
  else res.setHeader('set-cookie', Array.isArray(existing) ? [...existing, value] : [existing, value]);
}

export function cookieHeader(name, value, options = {}) {
  const parts = [`${name}=${value}`, `Path=${options.path ?? '/'}`];
  if (options.maxAge !== undefined) parts.push(`Max-Age=${Math.max(0, Math.floor(options.maxAge))}`);
  if (options.expires instanceof Date) parts.push(`Expires=${options.expires.toUTCString()}`);
  if (options.httpOnly !== false) parts.push('HttpOnly');
  parts.push(`SameSite=${options.sameSite ?? 'Lax'}`);
  if (options.secure) parts.push('Secure');
  return parts.join('; ');
}

export function readCookie(req, name) {
  return parseCookies(req.headers.cookie).get(name);
}

export function clientIp(req, config) {
  const remote = req.socket.remoteAddress ?? '';
  const loopback = remote === '127.0.0.1' || remote === '::1' || remote === '::ffff:127.0.0.1';
  if (!config.trustProxy || !loopback) return normalizeIp(remote);
  const cf = req.headers['cf-connecting-ip'];
  if (typeof cf === 'string' && isIp(cf)) return cf.trim();
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string') {
    const parts = forwarded.split(',').map((part) => part.trim()).filter(Boolean);
    for (let index = parts.length - 1; index >= 0; index -= 1) {
      if (isIp(parts[index])) return parts[index];
    }
  }
  return normalizeIp(remote);
}

function normalizeIp(value) {
  return String(value).replace(/^::ffff:/, '');
}

function isIp(value) {
  return /^[0-9a-fA-F:.]{2,45}$/.test(value) && (value.includes(':') || /^\d{1,3}(\.\d{1,3}){3}$/.test(value));
}

export function assertHost(req, config, { allowHealthLoopback = false } = {}) {
  const host = req.headers.host;
  if (typeof host !== 'string' || host === '') throw new HttpError(421, 'bad_host', 'missing Host');
  const lower = host.toLowerCase();
  if (config.allowedHosts.some((allowed) => allowed.toLowerCase() === lower)) return host;
  if (allowHealthLoopback && /^(127\.0\.0\.1|localhost)(:\d+)?$/.test(lower)) return host;
  throw new HttpError(421, 'bad_host', 'Host is not served by this gateway');
}

export function originOf(req) {
  const origin = req.headers.origin;
  return typeof origin === 'string' ? origin : undefined;
}

export function assertSameOrigin(req, config) {
  const site = req.headers['sec-fetch-site'];
  if (site === 'cross-site') throw new HttpError(403, 'cross_site', 'cross-site request refused');
  const origin = originOf(req);
  if (origin === undefined) {
    throw new HttpError(403, 'missing_origin', 'this endpoint requires an Origin header');
  }
  if (!config.allowedOrigins.includes(origin)) {
    throw new HttpError(403, 'bad_origin', 'Origin is not allowed');
  }
  return origin;
}

/** Double-submit CSRF token; the value is a JS-readable SameSite cookie. */
export function assertCsrf(req, config) {
  assertSameOrigin(req, config);
  const contentType = String(req.headers['content-type'] ?? '');
  if (!contentType.toLowerCase().startsWith('application/json')) {
    throw new HttpError(415, 'unsupported_media_type', 'Content-Type must be application/json');
  }
  const cookie = readCookie(req, config.cookieNames.csrf);
  const header = req.headers['x-palace-csrf'];
  if (typeof header !== 'string' || typeof cookie !== 'string' || header === '') {
    throw new HttpError(403, 'csrf_missing', 'CSRF token missing');
  }
  if (!timingSafeEqualStr(header, cookie)) {
    throw new HttpError(403, 'csrf_mismatch', 'CSRF token mismatch');
  }
  return cookie;
}

export function ensureCsrfCookie(req, res, config) {
  let token = readCookie(req, config.cookieNames.csrf);
  if (typeof token !== 'string' || !/^[A-Za-z0-9_-]{20,}$/.test(token)) {
    token = randomToken(32);
    appendSetCookie(
      res,
      cookieHeader(config.cookieNames.csrf, token, {
        httpOnly: false,
        sameSite: 'Lax',
        secure: config.cookieSecure,
        maxAge: 365 * 24 * 60 * 60,
      }),
    );
  }
  return token;
}

export async function readJsonBody(req, limit = 64 * 1024) {
  const declared = Number(req.headers['content-length'] ?? '0');
  if (Number.isFinite(declared) && declared > limit) {
    throw new HttpError(413, 'body_too_large', 'request body too large');
  }
  const chunks = [];
  let size = 0;
  for await (const chunk of req) {
    size += chunk.length;
    if (size > limit) throw new HttpError(413, 'body_too_large', 'request body too large');
    chunks.push(chunk);
  }
  if (size === 0) return {};
  let parsed;
  try {
    parsed = JSON.parse(Buffer.concat(chunks).toString('utf8'));
  } catch {
    throw new HttpError(400, 'bad_json', 'body is not valid JSON');
  }
  if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new HttpError(400, 'bad_json', 'body must be a JSON object');
  }
  return parsed;
}

export function sendJson(res, status, value, headers = {}) {
  if (res.headersSent) return;
  const body = JSON.stringify(value);
  res.writeHead(status, {
    'content-type': 'application/json; charset=utf-8',
    'content-length': Buffer.byteLength(body),
    'cache-control': 'no-store',
    ...headers,
  });
  res.end(body);
}

export function sendHtml(res, status, html, headers = {}) {
  if (res.headersSent) return;
  res.writeHead(status, {
    'content-type': 'text/html; charset=utf-8',
    'content-length': Buffer.byteLength(html),
    'cache-control': 'no-store',
    ...headers,
  });
  res.end(html);
}

export function sendText(res, status, text, headers = {}) {
  if (res.headersSent) return;
  res.writeHead(status, {
    'content-type': 'text/plain; charset=utf-8',
    'content-length': Buffer.byteLength(text),
    'cache-control': 'no-store',
    ...headers,
  });
  res.end(text);
}

export function redirect(res, location, headers = {}) {
  if (res.headersSent) return;
  res.writeHead(303, {
    location,
    'cache-control': 'no-store',
    'referrer-policy': 'no-referrer',
    ...headers,
  });
  res.end();
}

export function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

export const SECURITY_HEADERS = {
  'x-content-type-options': 'nosniff',
  'referrer-policy': 'no-referrer',
  'x-frame-options': 'DENY',
  'permissions-policy': 'publickey-credentials-get=(self), publickey-credentials-create=(self)',
};

export const PAGE_CSP = [
  "default-src 'none'",
  "script-src 'self'",
  "style-src 'self'",
  "img-src 'self' data:",
  "connect-src 'self'",
  "base-uri 'none'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join('; ');
