import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
export const PROJECT_ROOT = path.resolve(here, '..');

const DEFAULTS = {
  host: '127.0.0.1',
  port: 3090,
  stateDir: path.join(PROJECT_ROOT, 'var'),
  publicOrigin: 'https://bot.pu-ji.top',
  rpID: 'bot.pu-ji.top',
  rpName: 'Palace',
  allowedHosts: ['bot.pu-ji.top'],
  upstream: 'http://127.0.0.1:3080',
  dshCredentials: '/home/ubuntu/palace/state/.credentials.yaml',
  cookieSecure: true,
  cookiePrefix: true,
  sessionIdleDays: 30,
  sessionAbsoluteDays: 90,
  reauthWindowMs: 5 * 60 * 1000,
  bootstrapTtlMs: 20 * 60 * 1000,
  challengeTtlMs: 5 * 60 * 1000,
  setupTokenTtlMs: 10 * 60 * 1000,
  recoverySessionTtlMs: 15 * 60 * 1000,
  trustProxy: true,
  extraOrigins: [],
  tlsCert: '',
  tlsKey: '',
  logRequests: false,
};

function readEnvFile(file) {
  if (!fs.existsSync(file)) return {};
  const out = {};
  for (const raw of fs.readFileSync(file, 'utf8').split('\n')) {
    const line = raw.trim();
    if (line === '' || line.startsWith('#')) continue;
    const at = line.indexOf('=');
    if (at <= 0) continue;
    const key = line.slice(0, at).trim();
    let value = line.slice(at + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    out[key] = value;
  }
  return out;
}

function bool(value, fallback) {
  if (value === undefined || value === '') return fallback;
  return /^(1|true|yes|on)$/i.test(String(value));
}

function int(value, fallback) {
  if (value === undefined || value === '') return fallback;
  const parsed = Number.parseInt(String(value), 10);
  if (!Number.isSafeInteger(parsed) || parsed <= 0) {
    throw new Error(`invalid positive integer: ${String(value)}`);
  }
  return parsed;
}

function list(value, fallback) {
  if (value === undefined || value === '') return fallback;
  return String(value)
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

/**
 * Build the immutable runtime configuration.
 *
 * Precedence: built-in defaults < config.env < process environment.
 * @param {{ env?: NodeJS.ProcessEnv, configFile?: string }} [options]
 */
export function loadConfig(options = {}) {
  const env = options.env ?? process.env;
  const configFile =
    options.configFile ??
    env.PALACE_AUTH_CONFIG ??
    path.join(PROJECT_ROOT, 'config.env');
  const fileValues = readEnvFile(configFile);

  const pick = (key) => (env[key] !== undefined ? env[key] : fileValues[key]);
  const get = (key, fallback) => {
    const value = pick(key);
    return value === undefined ? fallback : value;
  };

  const stateDir = path.resolve(get('PALACE_STATE_DIR', DEFAULTS.stateDir));
  const publicOrigin = new URL(get('PALACE_PUBLIC_ORIGIN', DEFAULTS.publicOrigin)).origin;
  const rpID = get('PALACE_RP_ID', DEFAULTS.rpID);
  const allowedHosts = list(get('PALACE_ALLOWED_HOSTS'), DEFAULTS.allowedHosts);
  const extraOrigins = list(get('PALACE_EXTRA_ORIGINS'), DEFAULTS.extraOrigins);

  const config = {
    host: get('PALACE_AUTH_HOST', DEFAULTS.host),
    port: int(get('PALACE_AUTH_PORT'), DEFAULTS.port),
    stateDir,
    publicOrigin,
    rpID,
    rpName: get('PALACE_RP_NAME', DEFAULTS.rpName),
    allowedHosts,
    allowedOrigins: [...new Set([publicOrigin, ...extraOrigins])],
    upstream: new URL(get('PALACE_UPSTREAM', DEFAULTS.upstream)),
    dshCredentials: path.resolve(get('PALACE_DSH_CREDENTIALS', DEFAULTS.dshCredentials)),
    cookieSecure: bool(get('PALACE_COOKIE_SECURE'), DEFAULTS.cookieSecure),
    cookiePrefix: bool(get('PALACE_COOKIE_PREFIX'), DEFAULTS.cookiePrefix),
    sessionIdleDays: int(get('PALACE_SESSION_IDLE_DAYS'), DEFAULTS.sessionIdleDays),
    sessionAbsoluteDays: int(get('PALACE_SESSION_ABSOLUTE_DAYS'), DEFAULTS.sessionAbsoluteDays),
    reauthWindowMs: int(get('PALACE_REAUTH_WINDOW_SECONDS'), DEFAULTS.reauthWindowMs / 1000) * 1000,
    bootstrapTtlMs: int(get('PALACE_BOOTSTRAP_TTL_SECONDS'), DEFAULTS.bootstrapTtlMs / 1000) * 1000,
    challengeTtlMs: int(get('PALACE_CHALLENGE_TTL_SECONDS'), DEFAULTS.challengeTtlMs / 1000) * 1000,
    setupTokenTtlMs: int(get('PALACE_SETUP_TOKEN_TTL_SECONDS'), DEFAULTS.setupTokenTtlMs / 1000) * 1000,
    recoverySessionTtlMs:
      int(get('PALACE_RECOVERY_SESSION_TTL_SECONDS'), DEFAULTS.recoverySessionTtlMs / 1000) * 1000,
    trustProxy: bool(get('PALACE_TRUST_PROXY'), DEFAULTS.trustProxy),
    tlsCert: get('PALACE_TLS_CERT', DEFAULTS.tlsCert),
    tlsKey: get('PALACE_TLS_KEY', DEFAULTS.tlsKey),
    logRequests: bool(get('PALACE_LOG_REQUESTS'), DEFAULTS.logRequests),
    dbPath: path.join(stateDir, 'palace-auth.sqlite'),
    keyPath: path.join(stateDir, 'master.key'),
    cookieNames: {
      session: `${bool(get('PALACE_COOKIE_PREFIX'), DEFAULTS.cookiePrefix) ? '__Host-' : ''}palace-session`,
      bootstrap: `${bool(get('PALACE_COOKIE_PREFIX'), DEFAULTS.cookiePrefix) ? '__Host-' : ''}palace-bootstrap`,
      csrf: `${bool(get('PALACE_COOKIE_PREFIX'), DEFAULTS.cookiePrefix) ? '__Host-' : ''}palace-csrf`,
    },
  };

  if (config.cookiePrefix && !config.cookieSecure) {
    throw new Error('__Host- cookies require PALACE_COOKIE_SECURE=1');
  }
  if (config.rpID !== new URL(config.publicOrigin).hostname) {
    throw new Error(
      `RP ID (${config.rpID}) must equal the public origin hostname (${new URL(config.publicOrigin).hostname})`,
    );
  }
  if (!allowedHosts.includes(new URL(config.publicOrigin).host)) {
    throw new Error(`PALACE_ALLOWED_HOSTS must include ${new URL(config.publicOrigin).host}`);
  }
  if (!(config.upstream.protocol === 'http:' || config.upstream.protocol === 'https:')) {
    throw new Error('PALACE_UPSTREAM must be an http(s) URL');
  }
  return config;
}

/** Human-readable, secret-free summary used by CLI status. */
export function describeConfig(config) {
  return {
    listen: `${config.host}:${config.port}`,
    publicOrigin: config.publicOrigin,
    rpID: config.rpID,
    upstream: config.upstream.origin,
    stateDir: config.stateDir,
    dbPath: config.dbPath,
    cookieSecure: config.cookieSecure,
    cookiePrefix: config.cookiePrefix,
  };
}
