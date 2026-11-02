# Palace 认证网关

Palace 是单 owner 的 DSH Web 部署。本网关替换“从日志复制启动 token 链接”的登录方式：

- 首次通过服务器管理通道生成一次性绑定凭证，在 `/__palace/setup` 扫码绑定 Authenticator（TOTP）。
- 同一向导中创建 Passkey（WebAuthn），之后日常用指纹 / 面容 / 设备 PIN 登录。
- 绑定成功后一次性展示恢复码；TOTP 或恢复码只能进入受限恢复会话，必须重新绑定 Passkey 才能恢复完整访问。
- 登录后由网关签发 `__Host-palace-session` 持久 Cookie；DSH 自身的 `dsh-auth-*` Cookie 由网关按请求注入，客户端永远拿不到 DSH 签名密钥或启动 token。

## 架构与信任边界

```text
浏览器 / PWA
    │ HTTPS
Cloudflare Tunnel
    │
Nginx 127.0.0.1:3081
    │
Palace Auth Gateway 127.0.0.1:3090   ← 会话、登录、CSRF、限速、审计
    │ 注入 dsh-auth-* Cookie，剥离客户端伪造的同名 Cookie
DSH Web 127.0.0.1:3080
```

- 网关是公网到 DSH 的唯一入口。DSH 仍只监听 loopback，不修改安装包。
- 网关没有“跳过认证”的开关：数据库、master key 或 DSH 签名密钥缺失时返回 503，不会退化为匿名代理。
- 所有状态修改接口要求同源 `Origin`、`Sec-Fetch-Site`、双提交 CSRF 和 JSON 请求体。
- DSH 签名密钥从 `state/.credentials.yaml` 读取，仅用于按请求签发短时 Cookie；`dsh-auth-*` 不会被写入日志或会话存储。

## 目录

```text
auth/
  src/            网关源码（config、crypto、totp、webauthn、store、session、proxy、server、cli）
  ui/             登录 / 初始化 / 恢复 / 安全设置页面（无构建步骤）
  test/           单元、网关集成、真实浏览器 E2E
  deploy/         systemd、Nginx、安装 / 切换 / 回滚脚本
  config.env      本机配置（git 忽略，chmod 600）
  var/            SQLite、master.key、备份（git 忽略，chmod 700）
```

## 安装与配置

要求 Node.js ≥ 22.13（当前服务器使用 v24.19.0），无需编译步骤。

```bash
cd /home/ubuntu/palace/auth
npm ci --omit=dev

sudo deploy/install.sh          # 安装 systemd 单元并启动 127.0.0.1:3090
```

`install.sh` 会在缺失时把 `deploy/config.env.example` 复制为 `config.env`（600，owner ubuntu），创建 `var/`，并安装 `palace-auth.service`。它**不会**改动公网流量。

关键配置（`config.env`，环境变量优先）：

| 变量 | 默认值 | 说明 |
| --- | --- | --- |
| `PALACE_AUTH_PORT` | `3090` | 网关监听端口，仅 loopback |
| `PALACE_PUBLIC_ORIGIN` | `https://bot.pu-ji.top` | 唯一可信 Origin，同时决定 RP ID |
| `PALACE_RP_ID` | `bot.pu-ji.top` | 必须等于 public origin 的 hostname；不支持 IP |
| `PALACE_UPSTREAM` | `http://127.0.0.1:3080` | DSH 地址 |
| `PALACE_DSH_CREDENTIALS` | `/home/ubuntu/palace/state/.credentials.yaml` | DSH 签名密钥来源 |
| `PALACE_STATE_DIR` | `auth/var` | 数据库与 master key |
| `PALACE_COOKIE_SECURE` | `1` | 生产必须为 1 |
| `PALACE_COOKIE_PREFIX` | `1` | 使用 `__Host-` 前缀，要求 Secure + Path=/ |

修改配置后 `sudo systemctl restart palace-auth`；Nginx 无需改动。

## 首次绑定

1. 在服务器管理通道生成一次性凭证（10 分钟有效、只能使用一次）：

   ```bash
   sudo -u ubuntu env PALACE_AUTH_CONFIG=/home/ubuntu/palace/auth/config.env \
     node /home/ubuntu/palace/auth/src/cli.mjs setup-token
   ```

   命令只输出凭证；若使用 `--json`，输出 `{token, expiresAt, url}`。凭证不写访问日志。

2. 打开 `https://bot.pu-ji.top/__palace/setup`，粘贴凭证。
3. 用 Authenticator 扫描二维码（或复制种子手工添加），输入当前 6 位验证码。
4. 点击创建 Passkey，完成系统指纹 / 面容 / PIN 验证。
5. 离线保存一次性展示的 10 个恢复码，确认后完成绑定。

初始化完成后 `setup-token` 不再可用；新增 Passkey 或轮换恢复码必须从已登录的安全设置页操作。

## 日常、恢复与撤销

- **日常登录**：有效会话直接进入；过期后默认使用 Passkey。浏览器与已安装 PWA 各自建立会话，PWA 首次也需登录一次。
- **TOTP / 恢复码**：验证成功后只获得 15 分钟受限恢复会话，不能读取 DSH 数据；必须在 `/__palace/recover` 重新创建 Passkey。默认会撤销其他 Passkey，并撤销全部旧会话。
- **安全设置** `/__palace/security`：查看 / 新增 Passkey、重生成恢复码、退出登录。敏感操作要求 5 分钟内重新验证 Passkey。
- **远程撤销**：

  ```bash
  node src/cli.mjs sessions
  node src/cli.mjs revoke <session-id-prefix>
  node src/cli.mjs revoke all --yes
  ```

  撤销会立即使服务端会话失效，并关闭该会话跟踪的 WebSocket。
- **完全重置**（所有因素丢失）：`node src/cli.mjs reset --yes`，然后重新生成 setup token。此操作清空 owner、Passkey、TOTP、恢复码和会话，不可逆。

## 管理命令

```bash
node src/cli.mjs status
node src/cli.mjs setup-token [--ttl 600] [--json]
node src/cli.mjs sessions
node src/cli.mjs revoke <session-id-prefix|all> [--yes]
node src/cli.mjs reset [--yes]
node src/cli.mjs backup [destination.sqlite]
node src/cli.mjs restore <backup.sqlite> --yes
node src/cli.mjs audit [limit]
node src/cli.mjs doctor
```

- `doctor` 检查状态目录、master key、DSH 签名密钥，并用 mint 出的 Cookie 对 DSH 做一次真实 `GET /`；任何失败都会以非零退出。
- `backup` 使用 `VACUUM INTO` 生成一致性快照；备份包含 owner / 凭据 / 会话数据，必须与 `master.key` 分开加密保管，且不得进入 Git。
- `restore` 会先备份当前数据库；恢复旧备份后建议 `revoke all`，避免已用恢复码或已撤销凭据复活。

## 测试

```bash
cd /home/ubuntu/palace/auth
npm test            # 单元 + 网关集成（16 个测试）
npm run test:e2e    # 真实 Chromium：初始化 → Passkey → 代理 → 退出 → 重新登录
```

E2E 需要本机 Playwright 浏览器。默认从 `/home/ubuntu/palace/.tmp-e2e/browsers` 读取；可用 `PLAYWRIGHT_HOME`、`CHROME_PATH` 覆盖。测试使用临时数据库、伪上游和 `http://localhost:<随机端口>`，不使用生产状态。

## 切换与回滚

`deploy/switch.sh` 只改本机 Nginx 的 `3081 -> 3090` 上游并 reload，不重启 DSH；会自动把旧配置备份为 `/etc/nginx/conf.d/palace-local.conf.dsh-backup`。切换后旧 DSH 浏览器会话立即失效，需要重新走绑定流程。

```bash
sudo deploy/switch.sh
sudo deploy/rollback.sh
```

回滚恢复旧 Nginx 配置并停止网关；`auth/var` 中的凭据和会话保留，便于再次切换。不要把网关和 DSH 直接暴露到公网，也不要为“临时恢复访问”关闭认证。

## PWA 说明

登录后在浏览器中“添加到主屏幕”。PWA 与浏览器可能使用独立存储，首次在 PWA 内仍需完成一次 Passkey 登录；这是预期行为。会话 Cookie 为 `SameSite=Lax`、`Secure`、`HttpOnly`，`manifest`/`start_url` 不携带任何认证材料，认证页与 API 禁止缓存。

## 安全边界与已知限制

- 单 owner，不开放注册、邮件找回或公网 DSH token 入口。
- TOTP 单独登录**不是**双因素认证；它只用于初始绑定和受限恢复。
- 恢复过程默认删除其他 Passkey，避免旧设备残留；如果只是新增设备，请从安全设置页添加，而不是走恢复流程。
- 网关通过读取 DSH 持久签名密钥来实现免重启桥接，这是版本相关行为：升级 DSH 后先运行 `doctor`；若 DSH 更改凭据格式或 Cookie 校验，`doctor` 会失败，网关保持 fail-closed，不会匿名放行。
- 审计日志只记录事件、时间、IP、会话 ID 前缀，不记录 token、TOTP 种子、恢复码或 DSH Cookie。
