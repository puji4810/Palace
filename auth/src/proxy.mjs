import http from 'node:http';
import https from 'node:https';
import net from 'node:net';
import { logger } from './log.mjs';

const HOP_BY_HOP = new Set([
  'connection',
  'keep-alive',
  'proxy-authenticate',
  'proxy-authorization',
  'te',
  'trailer',
  'transfer-encoding',
  'upgrade',
]);

const CLIENT_HEADER_DENYLIST =
  /^(x-forwarded-|forwarded$|x-real-ip$|cf-connecting-ip$|cf-pseudo-ipv4$|authorization$|proxy-authorization$|x-palace-|dsh-auth-)/i;

/** Keep only the cookies that belong to DSH itself. */
export function sanitizeClientCookie(headerValue) {
  if (typeof headerValue !== 'string' || headerValue === '') return '';
  return headerValue
    .split(';')
    .map((part) => part.trim())
    .filter((part) => {
      const name = part.split('=')[0] ?? '';
      return !/^(dsh-auth-|__Host-palace-|palace-)/i.test(name);
    })
    .join('; ');
}

export function mergeCookies(original, dshCookie) {
  const kept = sanitizeClientCookie(original);
  return kept === '' ? dshCookie : `${kept}; ${dshCookie}`;
}

function requestHeaders(req, dshCookie) {
  const headers = {};
  for (const [name, value] of Object.entries(req.headers)) {
    const lower = name.toLowerCase();
    if (HOP_BY_HOP.has(lower)) continue;
    if (CLIENT_HEADER_DENYLIST.test(lower)) continue;
    if (lower === 'cookie') continue;
    if (value === undefined) continue;
    headers[lower] = value;
  }
  headers.cookie = mergeCookies(req.headers.cookie, dshCookie);
  return headers;
}

function responseHeaders(upstreamResponse, extraSetCookie) {
  const headers = {};
  for (const [name, value] of Object.entries(upstreamResponse.headers)) {
    if (HOP_BY_HOP.has(name)) continue;
    if (name === 'set-cookie') continue;
    headers[name] = value;
  }
  const upstreamCookies = upstreamResponse.headers['set-cookie'] ?? [];
  const cookies = upstreamCookies.filter((cookie) => !/^\s*dsh-auth-/i.test(cookie));
  if (extraSetCookie) cookies.push(extraSetCookie);
  if (cookies.length > 0) headers['set-cookie'] = cookies;
  if (typeof headers.location === 'string' && /(^|\/)(connect)(\/|\?|$)|[?&]token=/i.test(headers.location)) {
    headers.location = '/__palace/';
  }
  if (headers['x-content-type-options'] === undefined) headers['x-content-type-options'] = 'nosniff';
  if (headers['referrer-policy'] === undefined) headers['referrer-policy'] = 'no-referrer';
  return headers;
}

function upstreamTarget(config) {
  const url = config.upstream;
  return {
    protocol: url.protocol,
    hostname: url.hostname,
    port: url.port === '' ? (url.protocol === 'https:' ? 443 : 80) : Number(url.port),
  };
}

/**
 * Stream one authenticated request to the DSH upstream. The DSH session cookie
 * is minted server-side and always overwrites any client-supplied DSH cookie.
 */
export function forwardHttp(req, res, { config, dshCookie, extraSetCookie }) {
  const target = upstreamTarget(config);
  const transport = target.protocol === 'https:' ? https : http;
  let settled = false;

  const upstream = transport.request({
    hostname: target.hostname,
    port: target.port,
    method: req.method,
    path: req.url,
    headers: requestHeaders(req, dshCookie),
    agent: false,
  });

  const fail = (error) => {
    if (settled) return;
    settled = true;
    logger.warn('upstream.request_failed', { error: String(error?.message ?? error) });
    if (!res.headersSent) {
      const body = JSON.stringify({ ok: false, error: { code: 'upstream_unavailable', message: 'Palace 后端暂不可用' } });
      res.writeHead(502, {
        'content-type': 'application/json; charset=utf-8',
        'content-length': Buffer.byteLength(body),
        'cache-control': 'no-store',
      });
      res.end(body);
    } else {
      res.destroy();
    }
    upstream.destroy();
  };

  upstream.on('error', fail);
  upstream.on('response', (upstreamResponse) => {
    settled = true;
    res.writeHead(upstreamResponse.statusCode ?? 502, responseHeaders(upstreamResponse, extraSetCookie));
    upstreamResponse.on('error', () => res.destroy());
    upstreamResponse.pipe(res);
  });

  res.on('close', () => {
    if (!res.writableEnded) upstream.destroy();
  });
  req.on('error', () => upstream.destroy());
  req.pipe(upstream);
}

function upgradeHeaders(req, dshCookie) {
  const headers = {};
  for (const [name, value] of Object.entries(req.headers)) {
    const lower = name.toLowerCase();
    if (CLIENT_HEADER_DENYLIST.test(lower)) continue;
    if (lower === 'cookie') continue;
    if (lower === 'connection' || lower === 'upgrade') continue;
    if (value === undefined) continue;
    headers[lower] = value;
  }
  headers.connection = 'Upgrade';
  headers.upgrade = 'websocket';
  headers.cookie = mergeCookies(req.headers.cookie, dshCookie);
  return headers;
}

export function writeSocketResponse(socket, status, message) {
  if (socket.destroyed) return;
  const body = message ?? '';
  const reason =
    status === 401 ? 'Unauthorized' : status === 403 ? 'Forbidden' : status === 502 ? 'Bad Gateway' : 'Error';
  socket.write(
    `HTTP/1.1 ${status} ${reason}\r\nConnection: close\r\nContent-Type: text/plain; charset=utf-8\r\nContent-Length: ${Buffer.byteLength(body)}\r\n\r\n${body}`,
  );
  socket.destroy();
}

/**
 * Raw WebSocket upgrade proxy. DSH authenticates the upgrade from the injected
 * cookie; we additionally require a same-origin browser request.
 */
export function forwardUpgrade(req, socket, head, { config, dshCookie, onClose }) {
  const target = upstreamTarget(config);
  let closed = false;
  const finish = () => {
    if (closed) return;
    closed = true;
    onClose?.();
  };

  const upstream = net.connect(target.port, target.hostname, () => {
    const headers = upgradeHeaders(req, dshCookie);
    let raw = `${req.method ?? 'GET'} ${req.url ?? '/'} HTTP/1.1\r\n`;
    for (const [name, value] of Object.entries(headers)) {
      if (Array.isArray(value)) for (const item of value) raw += `${name}: ${item}\r\n`;
      else raw += `${name}: ${value}\r\n`;
    }
    raw += '\r\n';
    upstream.write(raw);
    if (head && head.length > 0) upstream.write(head);
    upstream.pipe(socket);
    socket.pipe(upstream);
  });

  upstream.setNoDelay(true);
  socket.setNoDelay(true);

  upstream.on('error', (error) => {
    logger.warn('upstream.upgrade_failed', { error: String(error?.message ?? error) });
    writeSocketResponse(socket, 502, 'upstream unavailable');
    upstream.destroy();
    finish();
  });
  socket.on('error', () => {
    upstream.destroy();
    finish();
  });
  upstream.on('close', () => {
    socket.destroy();
    finish();
  });
  socket.on('close', () => {
    upstream.destroy();
    finish();
  });
}
