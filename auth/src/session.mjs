import { randomToken, sha256Hex, timingSafeEqualStr } from './crypto.mjs';
import { appendSetCookie, cookieHeader, readCookie } from './http.mjs';

const DAY_MS = 24 * 60 * 60 * 1000;
const TOUCH_INTERVAL_MS = 60 * 1000;

export const SESSION_KINDS = Object.freeze({
  NORMAL: 'normal',
  BOOTSTRAP: 'bootstrap',
  RECOVERY: 'recovery',
});

/**
 * Create a server-side session. The raw bearer token is returned once and only
 * its SHA-256 hash is persisted.
 */
export function createSession(store, config, options = {}) {
  const now = options.now ?? Date.now();
  const kind = options.kind ?? SESSION_KINDS.NORMAL;
  const token = randomToken(32);
  const id = sha256Hex(token);
  let expiresAt;
  if (kind === SESSION_KINDS.NORMAL) {
    expiresAt = now + config.sessionAbsoluteDays * DAY_MS;
  } else {
    const ttl = options.ttlMs ?? config.bootstrapTtlMs;
    expiresAt = now + ttl;
  }
  const idleExpires =
    kind === SESSION_KINDS.NORMAL
      ? Math.min(now + config.sessionIdleDays * DAY_MS, expiresAt)
      : expiresAt;
  store.createSession({
    id,
    kind,
    createdAt: now,
    lastSeen: now,
    idleExpires,
    expiresAt,
    reauthAt: options.reauthAt ?? 0,
    ua: options.ua ?? null,
    ip: options.ip ?? null,
    data: options.data ?? {},
  });
  return { id, token, kind, createdAt: now, expiresAt, idleExpires };
}

/**
 * Resolve the session cookie on an incoming request, applying idle expiry and
 * sliding renewal (never beyond the absolute expiry).
 * @returns {{ id: string, token: string, row: object, touched: boolean } | null}
 */
export function loadSession(store, config, req, now = Date.now()) {
  const token = readCookie(req, config.cookieNames.session);
  if (typeof token !== 'string' || token === '') return null;
  const id = sha256Hex(token);
  const row = store.getSession(id);
  if (!row || row.revoked_at !== null) return null;
  if (row.expires_at <= now || row.idle_expires <= now) {
    store.revokeSession(id, now);
    return null;
  }
  let touched = false;
  if (row.kind === SESSION_KINDS.NORMAL && now - row.last_seen > TOUCH_INTERVAL_MS) {
    const idleExpires = Math.min(now + config.sessionIdleDays * DAY_MS, row.expires_at);
    store.touchSession(id, now, idleExpires);
    row.last_seen = now;
    row.idle_expires = idleExpires;
    touched = true;
  }
  return { id, token, row, touched };
}

export function loadBootstrapSession(store, config, req, now = Date.now()) {
  const token = readCookie(req, config.cookieNames.bootstrap);
  if (typeof token !== 'string' || token === '') return null;
  const id = sha256Hex(token);
  const row = store.getSession(id);
  if (!row || row.revoked_at !== null) return null;
  if (row.expires_at <= now || row.kind !== SESSION_KINDS.BOOTSTRAP) return null;
  return { id, token, row };
}

export function sessionCookieValue(config, token, row, now = Date.now()) {
  const expiresAt = Math.min(row.idle_expires, row.expires_at);
  const maxAge = Math.max(0, Math.floor((expiresAt - now) / 1000));
  return cookieHeader(config.cookieNames.session, token, {
    httpOnly: true,
    sameSite: 'Lax',
    secure: config.cookieSecure,
    maxAge,
    expires: new Date(expiresAt),
  });
}

export function setSessionCookie(res, config, session, row, now = Date.now()) {
  appendSetCookie(res, sessionCookieValue(config, session.token, row, now));
}

export function appendSessionCookie(res, config, token, row, now = Date.now()) {
  appendSetCookie(res, sessionCookieValue(config, token, row, now));
}

export function setBootstrapCookie(res, config, session, now = Date.now()) {
  const maxAge = Math.max(0, Math.floor((session.expiresAt - now) / 1000));
  appendSetCookie(
    res,
    cookieHeader(config.cookieNames.bootstrap, session.token, {
      httpOnly: true,
      sameSite: 'Lax',
      secure: config.cookieSecure,
      maxAge,
      expires: new Date(session.expiresAt),
    }),
  );
}

export function clearCookie(res, config, name) {
  const value = cookieHeader(name, '', {
    httpOnly: true,
    sameSite: 'Lax',
    secure: config.cookieSecure,
    maxAge: 0,
    expires: new Date(0),
  });
  appendSetCookie(res, value);
}

export function clearAllSessionCookies(res, config) {
  clearCookie(res, config, config.cookieNames.session);
  clearCookie(res, config, config.cookieNames.bootstrap);
}

/** Sensitive operations require a passkey assertion within the re-auth window. */
export function hasRecentReauth(row, config, now = Date.now()) {
  return row.reauth_at > 0 && now - row.reauth_at <= config.reauthWindowMs;
}

export function isSameToken(a, b) {
  return timingSafeEqualStr(a, b);
}

/** Device list entry with no secrets. */
export function publicSession(row, currentId) {
  return {
    id: row.id,
    kind: row.kind,
    createdAt: row.created_at,
    lastSeen: row.last_seen,
    expiresAt: row.expires_at,
    current: row.id === currentId,
    ip: row.ip ?? '',
    userAgent: row.ua ?? '',
  };
}
