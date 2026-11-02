#!/usr/bin/env bash
# Point the existing loopback Nginx listener at the Palace auth gateway.
# DSH keeps running untouched. Existing DSH browser cookies stop working.
set -euo pipefail

AUTH_DIR=/home/ubuntu/palace/auth
LIVE=/etc/nginx/conf.d/palace-local.conf
BACKUP=/etc/nginx/conf.d/palace-local.conf.dsh-backup
SERVICE=palace-auth.service

if [[ ${EUID} -ne 0 ]]; then
  echo "switch.sh must run as root" >&2
  exit 1
fi
cd "${AUTH_DIR}"

systemctl is-active --quiet "${SERVICE}" || systemctl start "${SERVICE}"
curl -fsS --max-time 3 http://127.0.0.1:3090/__palace/healthz >/dev/null || {
  echo "auth gateway is not healthy on 3090; refusing to switch" >&2
  exit 1
}

if [[ -f "${LIVE}" ]] && ! grep -q '127\.0\.0\.1:3090' "${LIVE}"; then
  echo "==> saving current Nginx config to ${BACKUP}"
  cp -a "${LIVE}" "${BACKUP}"
fi

echo "==> installing gateway Nginx config"
install -m 644 deploy/nginx-palace-auth.conf "${LIVE}"
if ! nginx -t; then
  echo "nginx -t failed; restoring previous config" >&2
  if [[ -f "${BACKUP}" ]]; then
    install -m 644 "${BACKUP}" "${LIVE}"
    nginx -t || true
  fi
  exit 1
fi

systemctl reload nginx
for _ in $(seq 1 10); do
  if curl -fsS --max-time 3 -H 'Host: bot.pu-ji.top' \
    http://127.0.0.1:3081/__palace/healthz >/dev/null; then
    echo "==> public entry now reaches the auth gateway"
    break
  fi
  sleep 0.5
done
curl -fsS --max-time 3 -H 'Host: bot.pu-ji.top' \
  http://127.0.0.1:3081/__palace/healthz >/dev/null

cat <<'TXT'

Traffic switched. Existing DSH browser sessions are now logged out.

Next:
  sudo -u ubuntu env PALACE_AUTH_CONFIG=/home/ubuntu/palace/auth/config.env \
    /home/ubuntu/.local/share/fnm/node-versions/v24.19.0/installation/bin/node \
    /home/ubuntu/palace/auth/src/cli.mjs setup-token
  then open https://bot.pu-ji.top/__palace/setup

Rollback (restores the direct DSH route):
  sudo /home/ubuntu/palace/auth/deploy/rollback.sh
TXT
