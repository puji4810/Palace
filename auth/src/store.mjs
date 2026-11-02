import fs from 'node:fs';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';

const SCHEMA_VERSION = 1;

const SCHEMA = `
PRAGMA journal_mode = WAL;
PRAGMA synchronous = FULL;
PRAGMA foreign_keys = ON;
PRAGMA busy_timeout = 5000;

CREATE TABLE IF NOT EXISTS meta (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS owner (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  created_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS passkeys (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  public_key TEXT NOT NULL,
  counter INTEGER NOT NULL DEFAULT 0,
  transports TEXT NOT NULL DEFAULT '[]',
  device_type TEXT NOT NULL DEFAULT 'singleDevice',
  backed_up INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL,
  last_used_at INTEGER
);

CREATE TABLE IF NOT EXISTS totp (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  secret_enc TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  last_step INTEGER NOT NULL DEFAULT -1
);

CREATE TABLE IF NOT EXISTS recovery_codes (
  hash TEXT PRIMARY KEY,
  created_at INTEGER NOT NULL,
  used_at INTEGER
);

CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  kind TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  last_seen INTEGER NOT NULL,
  idle_expires INTEGER NOT NULL,
  expires_at INTEGER NOT NULL,
  revoked_at INTEGER,
  reauth_at INTEGER NOT NULL DEFAULT 0,
  ua TEXT,
  ip TEXT,
  data TEXT NOT NULL DEFAULT '{}'
);
CREATE INDEX IF NOT EXISTS sessions_expires ON sessions (expires_at);

CREATE TABLE IF NOT EXISTS challenges (
  id TEXT PRIMARY KEY,
  kind TEXT NOT NULL,
  challenge TEXT NOT NULL,
  session_id TEXT,
  data TEXT NOT NULL DEFAULT '{}',
  created_at INTEGER NOT NULL,
  expires_at INTEGER NOT NULL,
  consumed_at INTEGER
);
CREATE INDEX IF NOT EXISTS challenges_expires ON challenges (expires_at);

CREATE TABLE IF NOT EXISTS setup_tokens (
  id TEXT PRIMARY KEY,
  hash TEXT NOT NULL UNIQUE,
  created_at INTEGER NOT NULL,
  expires_at INTEGER NOT NULL,
  used_at INTEGER
);

CREATE TABLE IF NOT EXISTS audit (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ts INTEGER NOT NULL,
  event TEXT NOT NULL,
  ip TEXT,
  ua TEXT,
  detail TEXT
);
CREATE INDEX IF NOT EXISTS audit_ts ON audit (ts);
`;

export class Store {
  constructor(db, { readonly = false } = {}) {
    this.db = db;
    this.readonly = readonly;
  }

  close() {
    this.db.close();
  }

  tx(fn) {
    this.db.exec('BEGIN IMMEDIATE');
    try {
      const result = fn();
      this.db.exec('COMMIT');
      return result;
    } catch (error) {
      try {
        this.db.exec('ROLLBACK');
      } catch {
        /* already rolled back */
      }
      throw error;
    }
  }

  getMeta(key) {
    const row = this.db.prepare('SELECT value FROM meta WHERE key = ?').get(key);
    return row ? row.value : undefined;
  }

  setMeta(key, value) {
    this.db
      .prepare('INSERT INTO meta (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value')
      .run(key, String(value));
  }

  isInitialized() {
    return this.getMeta('initialized_at') !== undefined;
  }

  createOwner(now) {
    this.db.prepare('INSERT INTO owner (id, created_at) VALUES (1, ?)').run(now);
    this.setMeta('initialized_at', String(now));
  }

  listPasskeys() {
    return this.db.prepare('SELECT * FROM passkeys ORDER BY created_at ASC').all();
  }

  getPasskey(id) {
    return this.db.prepare('SELECT * FROM passkeys WHERE id = ?').get(id);
  }

  countPasskeys() {
    return this.db.prepare('SELECT COUNT(*) AS n FROM passkeys').get().n;
  }

  addPasskey(record) {
    this.db
      .prepare(
        `INSERT INTO passkeys (id, name, public_key, counter, transports, device_type, backed_up, created_at, last_used_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, NULL)`,
      )
      .run(
        record.id,
        record.name,
        record.publicKey,
        record.counter ?? 0,
        JSON.stringify(record.transports ?? []),
        record.deviceType ?? 'singleDevice',
        record.backedUp ? 1 : 0,
        record.createdAt,
      );
  }

  updatePasskeyUsage(id, counter, now) {
    this.db
      .prepare('UPDATE passkeys SET counter = ?, last_used_at = ? WHERE id = ?')
      .run(counter, now, id);
  }

  renamePasskey(id, name) {
    return this.db.prepare('UPDATE passkeys SET name = ? WHERE id = ?').run(name, id).changes;
  }

  deletePasskey(id) {
    return this.db.prepare('DELETE FROM passkeys WHERE id = ?').run(id).changes;
  }

  getTotp() {
    return this.db.prepare('SELECT * FROM totp WHERE id = 1').get();
  }

  setTotp(secretEnc, now) {
    this.db
      .prepare('INSERT INTO totp (id, secret_enc, created_at, last_step) VALUES (1, ?, ?, -1)')
      .run(secretEnc, now);
  }

  /** Atomically reserve a TOTP time step; false means it was already used. */
  claimTotpStep(step, now) {
    return (
      this.db
        .prepare('UPDATE totp SET last_step = ? WHERE id = 1 AND last_step < ?')
        .run(step, step).changes === 1
    );
  }

  replaceRecoveryCodes(hashes, now) {
    this.db.prepare('DELETE FROM recovery_codes').run();
    const insert = this.db.prepare('INSERT INTO recovery_codes (hash, created_at) VALUES (?, ?)');
    for (const hash of hashes) insert.run(hash, now);
  }

  addRecoveryCodes(hashes, now) {
    const insert = this.db.prepare('INSERT INTO recovery_codes (hash, created_at) VALUES (?, ?)');
    for (const hash of hashes) insert.run(hash, now);
  }

  /** Consume one recovery code atomically; returns true only for an unused match. */
  consumeRecoveryCode(hash, now) {
    return (
      this.db
        .prepare('UPDATE recovery_codes SET used_at = ? WHERE hash = ? AND used_at IS NULL')
        .run(now, hash).changes === 1
    );
  }

  countUnusedRecoveryCodes() {
    return this.db.prepare('SELECT COUNT(*) AS n FROM recovery_codes WHERE used_at IS NULL').get().n;
  }

  countRecoveryCodes() {
    return this.db.prepare('SELECT COUNT(*) AS n FROM recovery_codes').get().n;
  }

  createSession(row) {
    this.db
      .prepare(
        `INSERT INTO sessions (id, kind, created_at, last_seen, idle_expires, expires_at, revoked_at, reauth_at, ua, ip, data)
         VALUES (?, ?, ?, ?, ?, ?, NULL, ?, ?, ?, ?)`,
      )
      .run(
        row.id,
        row.kind,
        row.createdAt,
        row.lastSeen,
        row.idleExpires,
        row.expiresAt,
        row.reauthAt ?? 0,
        row.ua ?? null,
        row.ip ?? null,
        JSON.stringify(row.data ?? {}),
      );
  }

  getSession(id) {
    return this.db.prepare('SELECT * FROM sessions WHERE id = ?').get(id);
  }

  touchSession(id, lastSeen, idleExpires) {
    this.db
      .prepare('UPDATE sessions SET last_seen = ?, idle_expires = ? WHERE id = ?')
      .run(lastSeen, idleExpires, id);
  }

  setSessionData(id, data) {
    this.db.prepare('UPDATE sessions SET data = ? WHERE id = ?').run(JSON.stringify(data), id);
  }

  setSessionReauth(id, now) {
    this.db.prepare('UPDATE sessions SET reauth_at = ? WHERE id = ?').run(now, id);
  }

  revokeSession(id, now) {
    return this.db
      .prepare('UPDATE sessions SET revoked_at = ? WHERE id = ? AND revoked_at IS NULL')
      .run(now, id).changes;
  }

  revokeAllSessions(now, exceptId = null) {
    if (exceptId === null) {
      return this.db
        .prepare('UPDATE sessions SET revoked_at = ? WHERE revoked_at IS NULL')
        .run(now).changes;
    }
    return this.db
      .prepare('UPDATE sessions SET revoked_at = ? WHERE revoked_at IS NULL AND id <> ?')
      .run(now, exceptId).changes;
  }

  listSessions(now) {
    return this.db
      .prepare(
        'SELECT * FROM sessions WHERE revoked_at IS NULL AND expires_at > ? ORDER BY last_seen DESC',
      )
      .all(now);
  }

  purgeExpired(now) {
    const sessions = this.db
      .prepare('DELETE FROM sessions WHERE expires_at < ? OR (revoked_at IS NOT NULL AND revoked_at < ?)')
      .run(now, now - 7 * 24 * 60 * 60 * 1000).changes;
    const challenges = this.db
      .prepare('DELETE FROM challenges WHERE expires_at < ?')
      .run(now).changes;
    const tokens = this.db
      .prepare('DELETE FROM setup_tokens WHERE expires_at < ?')
      .run(now).changes;
    return { sessions, challenges, tokens };
  }

  createChallenge(row) {
    this.db
      .prepare(
        `INSERT INTO challenges (id, kind, challenge, session_id, data, created_at, expires_at)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
      )
      .run(
        row.id,
        row.kind,
        row.challenge,
        row.sessionId ?? null,
        JSON.stringify(row.data ?? {}),
        row.createdAt,
        row.expiresAt,
      );
  }

  /** Read a live challenge without consuming it. */
  getChallenge(id) {
    return this.db.prepare('SELECT * FROM challenges WHERE id = ?').get(id);
  }

  consumeChallenge(id, now) {
    return (
      this.db
        .prepare(
          'UPDATE challenges SET consumed_at = ? WHERE id = ? AND consumed_at IS NULL AND expires_at > ?',
        )
        .run(now, id, now).changes === 1
    );
  }

  deleteChallenge(id) {
    this.db.prepare('DELETE FROM challenges WHERE id = ?').run(id);
  }

  createSetupToken(row) {
    this.db
      .prepare('INSERT INTO setup_tokens (id, hash, created_at, expires_at) VALUES (?, ?, ?, ?)')
      .run(row.id, row.hash, row.createdAt, row.expiresAt);
  }

  consumeSetupToken(hash, now) {
    return (
      this.db
        .prepare(
          'UPDATE setup_tokens SET used_at = ? WHERE hash = ? AND used_at IS NULL AND expires_at > ?',
        )
        .run(now, hash, now).changes === 1
    );
  }

  countUnusedSetupTokens(now) {
    return this.db
      .prepare('SELECT COUNT(*) AS n FROM setup_tokens WHERE used_at IS NULL AND expires_at > ?')
      .get(now).n;
  }

  audit(event, { ip = null, ua = null, detail = null } = {}) {
    this.db
      .prepare('INSERT INTO audit (ts, event, ip, ua, detail) VALUES (?, ?, ?, ?, ?)')
      .run(Date.now(), event, ip, ua, detail === null ? null : JSON.stringify(detail));
  }

  listAudit(limit = 100) {
    return this.db.prepare('SELECT * FROM audit ORDER BY id DESC LIMIT ?').all(limit);
  }

  /** Consistent snapshot via SQLite's online backup, without copying WAL files. */
  backup(destination) {
    fs.mkdirSync(path.dirname(destination), { recursive: true, mode: 0o700 });
    try {
      fs.unlinkSync(destination);
    } catch {
      /* fresh destination */
    }
    this.db.prepare('VACUUM INTO ?').run(destination);
    fs.chmodSync(destination, 0o600);
    return destination;
  }
}

export function openStore(dbPath, { readonly = false } = {}) {
  if (!readonly) fs.mkdirSync(path.dirname(dbPath), { recursive: true, mode: 0o700 });
  const db = new DatabaseSync(dbPath, { readOnly: readonly });
  if (!readonly) db.exec(SCHEMA);
  const store = new Store(db, { readonly });
  if (!readonly) {
    const version = store.getMeta('schema_version');
    if (version === undefined) store.setMeta('schema_version', String(SCHEMA_VERSION));
    else if (Number(version) !== SCHEMA_VERSION) {
      throw new Error(`unsupported database schema version ${version}`);
    }
  }
  return store;
}
