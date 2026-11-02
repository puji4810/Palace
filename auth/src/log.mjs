const SECRET_KEYS = /token|secret|code|cookie|password|authorization|challenge|signature/i;

function clean(fields) {
  const out = {};
  for (const [key, value] of Object.entries(fields ?? {})) {
    if (value === undefined) continue;
    if (SECRET_KEYS.test(key)) {
      out[key] = '[redacted]';
    } else if (typeof value === 'string' && value.length > 300) {
      out[key] = `${value.slice(0, 300)}…`;
    } else {
      out[key] = value;
    }
  }
  return out;
}

export function log(level, event, fields = {}) {
  const record = { ts: new Date().toISOString(), level, event, ...clean(fields) };
  const line = JSON.stringify(record);
  if (level === 'error' || level === 'warn') process.stderr.write(`${line}\n`);
  else process.stdout.write(`${line}\n`);
}

export const logger = {
  info: (event, fields) => log('info', event, fields),
  warn: (event, fields) => log('warn', event, fields),
  error: (event, fields) => log('error', event, fields),
};
