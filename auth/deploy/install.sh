#!/usr/bin/env bash
# Install or refresh the Palace auth gateway. Does NOT move public traffic.
# Run as root from anywhere: /home/ubuntu/palace/auth/deploy/install.sh
set -euo pipefail

AUTH_DIR=/home/ubuntu/palace/auth
OWNER=ubuntu
GROUP=ubuntu
SERVICE=palace-auth.service
NODE_BIN=/home/ubuntu/.local/share/fnm/node-versions/v24.19.0/installation/bin
RUNUSER=/usr/sbin/runuser
[[ -x "${RUNUSER}" ]] || RUNUSER=$(command -v runuser)

if [[ ${EUID} -ne 0 ]]; then
  echo "install.sh must run as root" >&2
  exit 1
fi
cd "${AUTH_DIR}"

if [[ ! -d node_modules ]]; then
  echo "==> installing production dependencies"
  "${RUNUSER}" -u "${OWNER}" -- env PATH="${NODE_BIN}:/usr/local/bin:/usr/bin:/bin" \
    npm ci --omit=dev
fi

echo "==> preparing state directory"
install -d -m 700 -o "${OWNER}" -g "${GROUP}" "${AUTH_DIR}/var"
install -d -m 700 -o "${OWNER}" -g "${GROUP}" /home/ubuntu/palace/state
touch /home/ubuntu/palace/state/palace-auth.log
chown "${OWNER}:${GROUP}" /home/ubuntu/palace/state/palace-auth.log
chmod 600 /home/ubuntu/palace/state/palace-auth.log
if [[ ! -f config.env ]]; then
  echo "==> creating config.env from deploy/config.env.example"
  install -m 600 -o "${OWNER}" -g "${GROUP}" deploy/config.env.example config.env
fi

echo "==> installing systemd unit"
install -m 644 deploy/palace-auth.service "/etc/systemd/system/${SERVICE}"
systemctl daemon-reload
systemctl enable "${SERVICE}"
systemctl restart "${SERVICE}"

for _ in $(seq 1 20); do
  if curl -fsS --max-time 2 http://127.0.0.1:3090/__palace/healthz >/dev/null; then
    echo "==> gateway is healthy on 127.0.0.1:3090"
    break
  fi
  sleep 0.5
done
curl -fsS --max-time 2 http://127.0.0.1:3090/__palace/healthz || {
  echo "gateway failed to become healthy; check journalctl -u ${SERVICE}" >&2
  exit 1
}

cat <<'TXT'

Gateway installed. Public traffic is still going to DSH directly.

Next:
  1. Create the one-time setup token (server management channel):
       sudo -u ubuntu env PALACE_AUTH_CONFIG=/home/ubuntu/palace/auth/config.env \
         /home/ubuntu/.local/share/fnm/node-versions/v24.19.0/installation/bin/node \
         /home/ubuntu/palace/auth/src/cli.mjs setup-token
  2. Move traffic when ready:
       sudo /home/ubuntu/palace/auth/deploy/switch.sh
  3. Open https://bot.pu-ji.top/__palace/setup and bind TOTP + passkey.
TXT
