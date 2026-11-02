import crypto from 'node:crypto';
import http from 'node:http';
import net from 'node:net';

/* ------------------------------------------------------------------ */
/* Minimal CBOR encoder (only the subset WebAuthn needs)              */
/* ------------------------------------------------------------------ */

function cborHeader(major, value) {
  if (value < 24) return Buffer.from([(major << 5) | value]);
  if (value < 0x100) return Buffer.from([(major << 5) | 24, value]);
  if (value < 0x10000) {
    const buffer = Buffer.alloc(3);
    buffer[0] = (major << 5) | 25;
    buffer.writeUInt16BE(value, 1);
    return buffer;
  }
  const buffer = Buffer.alloc(5);
  buffer[0] = (major << 5) | 26;
  buffer.writeUInt32BE(value, 1);
  return buffer;
}

export function cborEncode(value) {
  if (typeof value === 'number') {
    if (!Number.isSafeInteger(value)) throw new Error('CBOR integers must be safe integers');
    return value >= 0 ? cborHeader(0, value) : cborHeader(1, -1 - value);
  }
  if (typeof value === 'string') {
    const bytes = Buffer.from(value, 'utf8');
    return Buffer.concat([cborHeader(3, bytes.length), bytes]);
  }
  if (Buffer.isBuffer(value) || value instanceof Uint8Array) {
    const bytes = Buffer.from(value);
    return Buffer.concat([cborHeader(2, bytes.length), bytes]);
  }
  if (Array.isArray(value)) {
    return Buffer.concat([cborHeader(4, value.length), ...value.map((item) => cborEncode(item))]);
  }
  if (value instanceof Map) {
    const parts = [cborHeader(5, value.size)];
    for (const [key, item] of value) parts.push(cborEncode(key), cborEncode(item));
    return Buffer.concat(parts);
  }
  if (value !== null && typeof value === 'object') {
    const entries = Object.entries(value);
    const parts = [cborHeader(5, entries.length)];
    for (const [key, item] of entries) parts.push(cborEncode(key), cborEncode(item));
    return Buffer.concat(parts);
  }
  throw new Error(`unsupported CBOR value: ${String(value)}`);
}

/* ------------------------------------------------------------------ */
/* Software WebAuthn authenticator (CTAP2-like, ES256)                */
/* ------------------------------------------------------------------ */

export function createAuthenticator({ rpId, origin }) {
  const credentials = new Map();
  let signCount = 0;

  function registrationResponse(options) {
    const credentialId = crypto.randomBytes(32);
    const { privateKey, publicKey } = crypto.generateKeyPairSync('ec', { namedCurve: 'P-256' });
    const jwk = publicKey.export({ format: 'jwk' });
    const coseKey = new Map([
      [1, 2],
      [3, -7],
      [-1, 1],
      [-2, Buffer.from(jwk.x, 'base64url')],
      [-3, Buffer.from(jwk.y, 'base64url')],
    ]);
    signCount += 1;
    const rpIdHash = crypto.createHash('sha256').update(rpId).digest();
    const flags = Buffer.from([0x45]); // UP | UV | AT
    const counter = Buffer.alloc(4);
    counter.writeUInt32BE(signCount);
    const aaguid = Buffer.alloc(16);
    const credIdLength = Buffer.alloc(2);
    credIdLength.writeUInt16BE(credentialId.length);
    const authData = Buffer.concat([
      rpIdHash,
      flags,
      counter,
      aaguid,
      credIdLength,
      credentialId,
      cborEncode(coseKey),
    ]);
    const attestationObject = cborEncode({
      fmt: 'none',
      attStmt: new Map(),
      authData,
    });
    const clientDataJSON = Buffer.from(
      JSON.stringify({
        type: 'webauthn.create',
        challenge: options.challenge,
        origin,
        crossOrigin: false,
      }),
    );
    credentials.set(credentialId.toString('base64url'), {
      id: credentialId,
      privateKey,
      publicKey,
      counter: signCount,
    });
    return {
      id: credentialId.toString('base64url'),
      rawId: credentialId.toString('base64url'),
      type: 'public-key',
      clientExtensionResults: {},
      response: {
        clientDataJSON: clientDataJSON.toString('base64url'),
        attestationObject: attestationObject.toString('base64url'),
        transports: ['internal'],
      },
    };
  }

  function assertionResponse(options, credentialId) {
    const allowed = options.allowCredentials ?? [];
    const targetId = credentialId ?? (allowed[0] ? Buffer.from(allowed[0].id, 'base64url').toString('base64url') : undefined);
    if (!targetId) throw new Error('no credential to use');
    const credential = credentials.get(targetId);
    if (!credential) throw new Error(`unknown credential ${targetId}`);
    signCount += 1;
    const rpIdHash = crypto.createHash('sha256').update(rpId).digest();
    const flags = Buffer.from([0x05]); // UP | UV
    const counter = Buffer.alloc(4);
    counter.writeUInt32BE(signCount);
    const authData = Buffer.concat([rpIdHash, flags, counter]);
    const clientDataJSON = Buffer.from(
      JSON.stringify({
        type: 'webauthn.get',
        challenge: options.challenge,
        origin,
        crossOrigin: false,
      }),
    );
    const clientDataHash = crypto.createHash('sha256').update(clientDataJSON).digest();
    const signature = crypto.sign('sha256', Buffer.concat([authData, clientDataHash]), credential.privateKey);
    return {
      id: targetId,
      rawId: targetId,
      type: 'public-key',
      clientExtensionResults: {},
      response: {
        clientDataJSON: clientDataJSON.toString('base64url'),
        authenticatorData: authData.toString('base64url'),
        signature: signature.toString('base64url'),
        userHandle: options.user?.id ?? undefined,
      },
    };
  }

  return {
    credentials,
    register: (options) => registrationResponse(options),
    authenticate: (options, credentialId) => assertionResponse(options, credentialId),
  };
}

/* ------------------------------------------------------------------ */
/* Raw HTTP client with a cookie jar                                   */
/* ------------------------------------------------------------------ */

export function rawRequest(port, { method = 'GET', path = '/', headers = {}, body } = {}) {
  return new Promise((resolve, reject) => {
    const request = http.request({ host: '127.0.0.1', port, method, path, headers, agent: false }, (response) => {
      const chunks = [];
      response.on('data', (chunk) => chunks.push(chunk));
      response.on('end', () =>
        resolve({
          status: response.statusCode,
          headers: response.headers,
          body: Buffer.concat(chunks),
        }),
      );
    });
    request.on('error', reject);
    if (body !== undefined) request.write(body);
    request.end();
  });
}

export class Client {
  constructor(port, { host = `bot.pu-ji.top:${port}`, origin = `http://bot.pu-ji.top:${port}` } = {}) {
    this.port = port;
    this.host = host;
    this.origin = origin;
    this.cookies = new Map();
  }

  cookieHeader() {
    return [...this.cookies.entries()].map(([name, value]) => `${name}=${value}`).join('; ');
  }

  storeCookies(setCookie) {
    for (const header of setCookie ?? []) {
      const [pair, ...attributes] = header.split(';');
      const at = pair.indexOf('=');
      if (at === -1) continue;
      const name = pair.slice(0, at).trim();
      const value = pair.slice(at + 1).trim();
      const expired = attributes.some((attribute) => /^\s*max-age=0\s*$/i.test(attribute));
      if (expired) this.cookies.delete(name);
      else this.cookies.set(name, value);
    }
  }

  async request(method, path, { body, headers = {}, accept = 'application/json', follow = false } = {}) {
    const payload = body === undefined ? undefined : Buffer.from(JSON.stringify(body));
    const requestHeaders = {
      host: this.host,
      accept,
      ...headers,
    };
    if (this.cookies.size > 0) requestHeaders.cookie = this.cookieHeader();
    if (payload !== undefined) {
      requestHeaders['content-type'] = 'application/json';
      requestHeaders['content-length'] = String(payload.length);
      requestHeaders.origin ??= this.origin;
      requestHeaders['sec-fetch-site'] ??= 'same-origin';
      const csrf = this.cookies.get('palace-csrf') ?? this.cookies.get('__Host-palace-csrf');
      if (csrf) requestHeaders['x-palace-csrf'] = csrf;
    }
    const response = await rawRequest(this.port, {
      method,
      path,
      headers: requestHeaders,
      body: payload,
    });
    this.storeCookies(response.headers['set-cookie']);
    if (follow && response.status === 303 && response.headers.location) {
      return this.request('GET', response.headers.location, { accept, headers });
    }
    return response;
  }

  get(path, options) {
    return this.request('GET', path, options);
  }

  post(path, body = {}, options) {
    return this.request('POST', path, { body, ...options });
  }

  json(response) {
    try {
      return JSON.parse(response.body.toString('utf8'));
    } catch {
      return null;
    }
  }
}

/** Open a WebSocket-style upgrade and resolve with the status line/headers. */
export function rawUpgrade(port, { path = '/', host, origin, cookie = '', extraHeaders = '' } = {}) {
  return new Promise((resolve, reject) => {
    const socket = net.connect(port, '127.0.0.1', () => {
      const lines = [
        `GET ${path} HTTP/1.1`,
        `Host: ${host}`,
        'Connection: Upgrade',
        'Upgrade: websocket',
        'Sec-WebSocket-Version: 13',
        'Sec-WebSocket-Key: dGhlIHNhbXBsZSBub25jZQ==',
      ];
      if (origin) lines.push(`Origin: ${origin}`);
      if (cookie) lines.push(`Cookie: ${cookie}`);
      socket.write(`${lines.join('\r\n')}\r\n${extraHeaders}\r\n`);
    });
    let buffer = '';
    const onData = (chunk) => {
      buffer += chunk.toString('latin1');
      const end = buffer.indexOf('\r\n\r\n');
      if (end !== -1) {
        socket.off('data', onData);
        const head = buffer.slice(0, end).split('\r\n');
        resolve({
          status: Number(head[0].split(' ')[1]),
          headers: head.slice(1),
          socket,
          rest: buffer.slice(end + 4),
        });
      }
    };
    socket.on('data', onData);
    socket.on('error', reject);
    socket.setTimeout(5000, () => {
      socket.destroy();
      reject(new Error('upgrade timeout'));
    });
  });
}

export async function freePort() {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.once('error', reject);
    server.listen(0, '127.0.0.1', () => {
      const { port } = server.address();
      server.close(() => resolve(port));
    });
  });
}

/** Minimal upstream that mimics the bits of DSH the gateway depends on. */
export async function startUpstream() {
  const requests = [];
  const server = http.createServer((req, res) => {
    requests.push({ method: req.method, url: req.url, headers: req.headers });
    if (req.url === '/set-cookie') {
      res.writeHead(200, {
        'content-type': 'text/plain',
        'set-cookie': ['dsh-auth-fake=1; Path=/; HttpOnly', 'keep=1; Path=/'],
      });
      res.end('cookies');
      return;
    }
    if (req.url === '/stream') {
      res.writeHead(200, { 'content-type': 'text/event-stream' });
      res.write('data: one\n\n');
      setTimeout(() => {
        res.write('data: two\n\n');
        res.end();
      }, 50);
      return;
    }
    res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
    res.end('<h1 id="upstream">upstream ok</h1>');
  });
  const upgradeSockets = new Set();
  server.on('upgrade', (req, socket) => {
    upgradeSockets.add(socket);
    socket.on('close', () => upgradeSockets.delete(socket));
    requests.push({ method: 'UPGRADE', url: req.url, headers: req.headers });
    socket.write(
      'HTTP/1.1 101 Switching Protocols\r\nUpgrade: websocket\r\nConnection: Upgrade\r\n\r\nhello',
    );
    socket.resume();
  });
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const { port } = server.address();
  return {
    server,
    port,
    requests,
    close: () => new Promise((resolve) => {
      for (const socket of upgradeSockets) socket.destroy();
      upgradeSockets.clear();
      server.closeAllConnections?.();
      server.close(() => resolve());
    }),
  };
}
