const AUTH = '/__palace';

class ApiError extends Error {
  constructor(message, code, status) {
    super(message);
    this.code = code;
    this.status = status;
  }
}

function $(id) {
  return document.getElementById(id);
}

function show(element) {
  element?.classList.remove('hidden');
}

function hide(element) {
  element?.classList.add('hidden');
}

function setStatus(element, message, kind = '') {
  if (!element) return;
  element.textContent = message;
  element.className = `status${kind ? ` ${kind}` : ''}`;
}

function cookieValue(suffix) {
  for (const part of document.cookie.split('; ')) {
    const at = part.indexOf('=');
    if (at === -1) continue;
    if (part.slice(0, at).endsWith(suffix)) return decodeURIComponent(part.slice(at + 1));
  }
  return '';
}

function csrfToken() {
  return cookieValue('palace-csrf');
}

async function api(path, body) {
  const headers = { accept: 'application/json' };
  if (body !== undefined) {
    headers['content-type'] = 'application/json';
    headers['x-palace-csrf'] = csrfToken();
  }
  let response;
  try {
    response = await fetch(path, {
      method: body === undefined ? 'GET' : 'POST',
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
      credentials: 'same-origin',
      cache: 'no-store',
    });
  } catch {
    throw new ApiError('网络连接失败，请检查网络后重试', 'network_error', 0);
  }
  let data = null;
  try {
    data = await response.json();
  } catch {
    /* non-JSON error page */
  }
  if (!response.ok || data?.ok === false) {
    const code = data?.error?.code ?? `http_${response.status}`;
    const message = data?.error?.message ?? `请求失败（HTTP ${response.status}）`;
    throw new ApiError(message, code, response.status);
  }
  return data;
}

function setBusy(button, busy, label) {
  if (!button) return;
  if (busy) {
    button.dataset.label = button.textContent;
    button.disabled = true;
    if (label) button.textContent = label;
  } else {
    button.disabled = false;
    if (button.dataset.label) button.textContent = button.dataset.label;
  }
}

function b64uToBuffer(value) {
  const padded = value.replaceAll('-', '+').replaceAll('_', '/');
  const binary = atob(padded + '='.repeat((4 - (padded.length % 4)) % 4));
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index);
  return bytes.buffer;
}

function bufferToB64u(value) {
  const bytes = new Uint8Array(value);
  let binary = '';
  for (let index = 0; index < bytes.length; index += 1) binary += String.fromCharCode(bytes[index]);
  return btoa(binary).replaceAll('+', '-').replaceAll('/', '_').replaceAll('=', '');
}

function prepOptions(options) {
  const publicKey = { ...options };
  publicKey.challenge = b64uToBuffer(options.challenge);
  if (options.user) publicKey.user = { ...options.user, id: b64uToBuffer(options.user.id) };
  for (const key of ['allowCredentials', 'excludeCredentials']) {
    if (Array.isArray(options[key])) {
      publicKey[key] = options[key].map((item) => ({ ...item, id: b64uToBuffer(item.id) }));
    }
  }
  return publicKey;
}

async function createPasskey(options) {
  if (!window.PublicKeyCredential) throw new ApiError('此浏览器不支持通行密钥', 'unsupported');
  if (!window.isSecureContext) throw new ApiError('通行密钥需要 HTTPS 安全上下文', 'insecure_context');
  const credential = await navigator.credentials.create({ publicKey: prepOptions(options) });
  if (!credential) throw new ApiError('未创建通行密钥', 'cancelled');
  return {
    id: credential.id,
    rawId: bufferToB64u(credential.rawId),
    type: credential.type,
    authenticatorAttachment: credential.authenticatorAttachment ?? undefined,
    clientExtensionResults: credential.getClientExtensionResults?.() ?? {},
    response: {
      clientDataJSON: bufferToB64u(credential.response.clientDataJSON),
      attestationObject: bufferToB64u(credential.response.attestationObject),
      transports: credential.response.getTransports?.() ?? [],
    },
  };
}

async function getAssertion(options) {
  if (!window.PublicKeyCredential) throw new ApiError('此浏览器不支持通行密钥', 'unsupported');
  if (!window.isSecureContext) throw new ApiError('通行密钥需要 HTTPS 安全上下文', 'insecure_context');
  const credential = await navigator.credentials.get({ publicKey: prepOptions(options) });
  if (!credential) throw new ApiError('未完成验证', 'cancelled');
  return {
    id: credential.id,
    rawId: bufferToB64u(credential.rawId),
    type: credential.type,
    authenticatorAttachment: credential.authenticatorAttachment ?? undefined,
    clientExtensionResults: credential.getClientExtensionResults?.() ?? {},
    response: {
      clientDataJSON: bufferToB64u(credential.response.clientDataJSON),
      authenticatorData: bufferToB64u(credential.response.authenticatorData),
      signature: bufferToB64u(credential.response.signature),
      userHandle: credential.response.userHandle ? bufferToB64u(credential.response.userHandle) : undefined,
    },
  };
}

function safeNext(value) {
  if (typeof value !== 'string' || value === '') return '/';
  if (!value.startsWith('/') || value.startsWith('//')) return '/';
  if (value.startsWith(AUTH)) return '/';
  return value;
}

function nextPath() {
  const params = new URLSearchParams(location.search);
  return safeNext(params.get('next'));
}

function go(path) {
  location.replace(path || '/');
}

function friendlyError(error) {
  if (error instanceof ApiError) {
    if (error.code === 'unauthenticated') return '登录已过期，请重新登录';
    return error.message;
  }
  if (error?.name === 'NotAllowedError') return '操作已取消或超时';
  if (error?.name === 'InvalidStateError') return '该设备已注册过通行密钥';
  if (error?.name === 'SecurityError') return '当前地址不允许使用通行密钥（需要 HTTPS）';
  return '操作失败，请重试';
}

function initLogin() {
  const status = $('status');
  const button = $('passkey-login');
  const hint = $('passkey-hint');
  const form = $('totp-form');
  const recoveryForm = $('recovery-form');

  if (!window.PublicKeyCredential) {
    button.disabled = true;
    hint.textContent = '此浏览器不支持通行密钥，请使用验证码或恢复码。';
  }

  api(`${AUTH}/api/state`)
    .then((state) => {
      if (!state.initialized) {
        go(`${AUTH}/setup`);
        return;
      }
      if (state.passkeys === 0) {
        button.disabled = true;
        hint.textContent = '尚未注册通行密钥，请使用验证码或恢复码进入恢复流程。';
      }
    })
    .catch((error) => setStatus(status, friendlyError(error), 'error'));

  button.addEventListener('click', async () => {
    setBusy(button, true, '等待设备验证…');
    setStatus(status, '');
    try {
      const { flow, options } = await api(`${AUTH}/api/login/options`, {});
      const response = await getAssertion(options);
      const result = await api(`${AUTH}/api/login/verify`, { flow, response, next: nextPath() });
      go(result.redirect);
    } catch (error) {
      setStatus(status, friendlyError(error), 'error');
      setBusy(button, false);
    }
  });

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const submit = form.querySelector('button[type="submit"]');
    setBusy(submit, true);
    setStatus(status, '');
    try {
      const result = await api(`${AUTH}/api/login/totp`, { code: $('totp-code').value });
      go(result.redirect);
    } catch (error) {
      setStatus(status, friendlyError(error), 'error');
      setBusy(submit, false);
    }
  });

  $('recovery-toggle').addEventListener('click', () => {
    recoveryForm.classList.toggle('hidden');
    if (!recoveryForm.classList.contains('hidden')) $('recovery-code').focus();
  });

  // 恢复码输入为两行 textarea：Enter 直接提交，Shift+Enter 保留换行。
  $('recovery-code').addEventListener('keydown', (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      recoveryForm.requestSubmit();
    }
  });

  recoveryForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const submit = recoveryForm.querySelector('button[type="submit"]');
    setBusy(submit, true);
    setStatus(status, '');
    try {
      const result = await api(`${AUTH}/api/login/recovery`, { code: $('recovery-code').value });
      go(result.redirect);
    } catch (error) {
      setStatus(status, friendlyError(error), 'error');
      setBusy(submit, false);
    }
  });
}

function setStep(step) {
  for (const item of document.querySelectorAll('#stepper .step')) {
    const value = Number(item.dataset.step);
    item.classList.toggle('active', value === step);
    item.classList.toggle('done', value < step);
  }
  for (let index = 1; index <= 4; index += 1) {
    const section = $(`step-${index}`);
    if (section) section.classList.toggle('hidden', index !== step);
  }
}

function initSetup() {
  const status = $('status');
  api(`${AUTH}/api/state`)
    .then((state) => {
      if (state.initialized) go(`${AUTH}/`);
    })
    .catch((error) => setStatus(status, friendlyError(error), 'error'));

  $('token-form').addEventListener('submit', async (event) => {
    event.preventDefault();
    const submit = event.target.querySelector('button[type="submit"]');
    setBusy(submit, true, '正在校验…');
    setStatus(status, '');
    try {
      const result = await api(`${AUTH}/api/setup/start`, { token: $('setup-token').value });
      $('qr').replaceChildren();
      const image = new Image();
      image.alt = '验证器二维码';
      image.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(result.qr)}`;
      $('qr').append(image);
      $('totp-secret').textContent = result.secret.replace(/(.{4})/g, '$1 ').trim();
      setStep(2);
    } catch (error) {
      setStatus(status, friendlyError(error), 'error');
    } finally {
      setBusy(submit, false);
    }
  });

  $('copy-secret').addEventListener('click', async () => {
    const secret = $('totp-secret').textContent.replace(/\s+/g, '');
    try {
      await navigator.clipboard.writeText(secret);
      $('copy-secret').textContent = '已复制';
      setTimeout(() => {
        $('copy-secret').textContent = '复制密钥';
      }, 2000);
    } catch {
      setStatus($('status-2'), '无法自动复制，请长按密钥手动复制', 'error');
    }
  });

  $('totp-form').addEventListener('submit', async (event) => {
    event.preventDefault();
    const submit = event.target.querySelector('button[type="submit"]');
    setBusy(submit, true, '正在校验…');
    setStatus($('status-2'), '');
    try {
      await api(`${AUTH}/api/setup/totp`, { code: $('totp-code').value });
      setStep(3);
    } catch (error) {
      setStatus($('status-2'), friendlyError(error), 'error');
    } finally {
      setBusy(submit, false);
    }
  });

  $('passkey-form').addEventListener('submit', async (event) => {
    event.preventDefault();
    const submit = event.target.querySelector('button[type="submit"]');
    setBusy(submit, true, '请在设备上确认…');
    setStatus($('status-3'), '');
    try {
      const { flow, options } = await api(`${AUTH}/api/setup/passkey/options`, {});
      const response = await createPasskey(options);
      await api(`${AUTH}/api/setup/passkey/verify`, {
        flow,
        response,
        name: $('passkey-name').value,
      });
      const result = await api(`${AUTH}/api/setup/finish`, {});
      renderRecoveryCodes($('recovery-codes'), result.recoveryCodes);
      setStep(4);
    } catch (error) {
      setStatus($('status-3'), friendlyError(error), 'error');
    } finally {
      setBusy(submit, false);
    }
  });

  $('saved-codes').addEventListener('change', (event) => {
    $('finish-setup').disabled = !event.target.checked;
  });

  $('finish-setup').addEventListener('click', () => {
    go('/');
  });
}

function renderRecoveryCodes(container, codes) {
  container.replaceChildren();
  for (const code of codes) {
    const item = document.createElement('span');
    item.textContent = code;
    container.append(item);
  }
  show(container);
}

function initRecover() {
  const status = $('status');
  const form = $('passkey-form');
  $('recover-method').textContent = '恢复会话已建立。请创建新的通行密钥以恢复完整访问。';

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const submit = form.querySelector('button[type="submit"]');
    setBusy(submit, true, '请在设备上确认…');
    setStatus(status, '');
    try {
      const { flow, options } = await api(`${AUTH}/api/recover/passkey/options`, {});
      const response = await createPasskey(options);
      const result = await api(`${AUTH}/api/recover/passkey/verify`, {
        flow,
        response,
        name: $('passkey-name').value,
        revokeOthers: $('revoke-others').checked,
      });
      go(result.redirect);
    } catch (error) {
      setStatus(status, friendlyError(error), 'error');
      setBusy(submit, false);
    }
  });

  $('cancel-recovery').addEventListener('click', async () => {
    try {
      await api(`${AUTH}/api/logout`, {});
    } catch {
      /* best effort */
    }
    go(`${AUTH}/`);
  });
}

function formatDate(ms) {
  if (!ms) return '—';
  return new Date(ms).toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function relativeTime(ms) {
  if (!ms) return '从未';
  const delta = Date.now() - ms;
  if (delta < 60_000) return '刚刚';
  if (delta < 3_600_000) return `${Math.floor(delta / 60_000)} 分钟前`;
  if (delta < 86_400_000) return `${Math.floor(delta / 3_600_000)} 小时前`;
  return `${Math.floor(delta / 86_400_000)} 天前`;
}

function describeAgent(ua) {
  if (!ua) return '未知设备';
  const platform = /iPhone|iPad|iPod/i.test(ua)
    ? 'iOS'
    : /Android/i.test(ua)
      ? 'Android'
      : /Macintosh|Mac OS X/i.test(ua)
        ? 'macOS'
        : /Windows/i.test(ua)
          ? 'Windows'
          : 'Linux';
  const browser = /Edg\//i.test(ua)
    ? 'Edge'
    : /Chrome\//i.test(ua)
      ? 'Chrome'
      : /Safari\//i.test(ua)
        ? 'Safari'
        : /Firefox\//i.test(ua)
          ? 'Firefox'
          : '浏览器';
  return `${browser} · ${platform}`;
}

function initSecurity() {
  const status = $('status');
  const passkeyList = $('passkey-list');
  const sessionList = $('session-list');
  let overview = null;

  async function load() {
    overview = await api(`${AUTH}/api/security`);
    render();
  }

  function render() {
    passkeyList.replaceChildren();
    if (overview.passkeys.length === 0) {
      const empty = document.createElement('p');
      empty.className = 'empty';
      empty.textContent = '尚未注册通行密钥。';
      passkeyList.append(empty);
    }
    for (const passkey of overview.passkeys) {
      const row = document.createElement('div');
      row.className = 'row';
      const main = document.createElement('div');
      main.className = 'row-main';
      const title = document.createElement('div');
      title.className = 'row-title';
      title.append(document.createTextNode(passkey.name));
      if (passkey.backedUp) {
        const tag = document.createElement('span');
        tag.className = 'tag ok';
        tag.textContent = '已同步';
        title.append(tag);
      }
      const sub = document.createElement('div');
      sub.className = 'row-sub';
      sub.textContent = `创建于 ${formatDate(passkey.createdAt)} · 最近使用 ${relativeTime(passkey.lastUsedAt)}`;
      main.append(title, sub);
      const remove = document.createElement('button');
      remove.className = 'btn small danger';
      remove.type = 'button';
      remove.textContent = '删除';
      remove.addEventListener('click', async () => {
        if (!confirm(`删除通行密钥“${passkey.name}”？`)) return;
        try {
          await withReauth(() => api(`${AUTH}/api/security/passkey/delete`, { id: passkey.id }));
          setStatus(status, '已删除', 'ok');
          await load();
        } catch (error) {
          setStatus(status, friendlyError(error), 'error');
        }
      });
      row.append(main, remove);
      passkeyList.append(row);
    }

    sessionList.replaceChildren();
    for (const session of overview.sessions) {
      const row = document.createElement('div');
      row.className = 'row';
      const main = document.createElement('div');
      main.className = 'row-main';
      const title = document.createElement('div');
      title.className = 'row-title';
      title.append(document.createTextNode(describeAgent(session.userAgent)));
      if (session.current) {
        const tag = document.createElement('span');
        tag.className = 'tag';
        tag.textContent = '当前设备';
        title.append(tag);
      }
      const sub = document.createElement('div');
      sub.className = 'row-sub';
      sub.textContent = `${session.ip || '未知地址'} · 最近活动 ${relativeTime(session.lastSeen)}`;
      main.append(title, sub);
      row.append(main);
      if (!session.current) {
        const revoke = document.createElement('button');
        revoke.className = 'btn small danger';
        revoke.type = 'button';
        revoke.textContent = '撤销';
        revoke.addEventListener('click', async () => {
          try {
            await withReauth(() => api(`${AUTH}/api/security/sessions/revoke`, { id: session.id }));
            setStatus(status, '会话已撤销', 'ok');
            await load();
          } catch (error) {
            setStatus(status, friendlyError(error), 'error');
          }
        });
        row.append(revoke);
      }
      sessionList.append(row);
    }

    $('session-policy').textContent = `闲置 ${overview.idleDays} 天、最长 ${overview.absoluteDays} 天后需要重新登录。`;
    $('recovery-count').textContent = `剩余恢复码：${overview.recoveryRemaining} 张`;
    $('reauth-state').textContent = overview.reauth
      ? `最近已验证，敏感操作可用（窗口 ${overview.reauthWindowSeconds} 秒）`
      : '需要验证通行密钥后才能修改安全设置';
  }

  async function doReauth() {
    const { flow, options } = await api(`${AUTH}/api/security/reauth/options`, {});
    const response = await getAssertion(options);
    await api(`${AUTH}/api/security/reauth/verify`, { flow, response });
    setStatus(status, '身份验证通过', 'ok');
    await load();
  }

  async function withReauth(action) {
    try {
      return await action();
    } catch (error) {
      if (!(error instanceof ApiError) || error.code !== 'reauth_required') throw error;
      await doReauth();
      return action();
    }
  }

  $('reauth').addEventListener('click', async () => {
    try {
      await doReauth();
    } catch (error) {
      setStatus(status, friendlyError(error), 'error');
    }
  });

  $('add-passkey').addEventListener('click', () => {
    show($('add-passkey-form'));
    $('new-passkey-name').focus();
  });

  $('cancel-add-passkey').addEventListener('click', () => hide($('add-passkey-form')));

  $('add-passkey-form').addEventListener('submit', async (event) => {
    event.preventDefault();
    const submit = event.target.querySelector('button[type="submit"]');
    setBusy(submit, true, '请在设备上确认…');
    try {
      await withReauth(async () => {
        const { flow, options } = await api(`${AUTH}/api/security/passkey/options`, {});
        const response = await createPasskey(options);
        await api(`${AUTH}/api/security/passkey/verify`, {
          flow,
          response,
          name: $('new-passkey-name').value,
        });
      });
      hide($('add-passkey-form'));
      $('new-passkey-name').value = '';
      setStatus(status, '通行密钥已添加', 'ok');
      await load();
    } catch (error) {
      setStatus(status, friendlyError(error), 'error');
    } finally {
      setBusy(submit, false);
    }
  });

  $('revoke-others').addEventListener('click', async () => {
    if (!confirm('撤销除当前设备以外的所有登录会话？')) return;
    try {
      await withReauth(() => api(`${AUTH}/api/security/sessions/revoke`, { all: true }));
      setStatus(status, '其他会话已撤销', 'ok');
      await load();
    } catch (error) {
      setStatus(status, friendlyError(error), 'error');
    }
  });

  $('regenerate-recovery').addEventListener('click', async () => {
    if (!confirm('重新生成恢复码会使旧恢复码立即失效，继续？')) return;
    try {
      const result = await withReauth(() => api(`${AUTH}/api/security/recovery/regenerate`, {}));
      renderRecoveryCodes($('new-recovery-codes'), result.recoveryCodes);
      const notice = $('recovery-notice');
      notice.textContent = '新的恢复码只显示一次，请立即离线保存；旧恢复码已失效。';
      notice.classList.remove('hidden', 'warn');
      show(notice);
      await load();
    } catch (error) {
      setStatus(status, friendlyError(error), 'error');
    }
  });

  $('logout').addEventListener('click', async () => {
    try {
      const result = await api(`${AUTH}/api/logout`, {});
      go(result.redirect);
    } catch (error) {
      setStatus(status, friendlyError(error), 'error');
    }
  });

  load().catch((error) => {
    if (error instanceof ApiError && error.status === 401) {
      go(`${AUTH}/`);
      return;
    }
    setStatus(status, friendlyError(error), 'error');
  });
}

const page = document.body.dataset.page;
if (page === 'login') initLogin();
if (page === 'setup') initSetup();
if (page === 'recover') initRecover();
if (page === 'security') initSecurity();
