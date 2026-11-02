#!/usr/bin/env bash
# Restore the pre-gateway Nginx route and stop the gateway. DSH is untouched.
set -euo pipefail

LIVE=/etc/nginx/conf.d/palace-local.conf
BACKUP=/etc/nginx/conf.d/palace-local.conf.dsh-backup

if [[ ${EUID} -ne 0 ]]; then
  echo "rollback.sh must run as root" >&2
  exit 1
fi
if [[ ! -f "${BACKUP}" ]]; then
  echo "no backup found at ${BACKUP}; cannot roll back automatically" >&2
  exit 1
fi

install -m 644 "${BACKUP}" "${LIVE}"
nginx -t
systemctl reload nginx
systemctl stop palace-auth.service || true
echo "==> traffic restored to the pre-gateway route; palace-auth stopped"
echo "    Credentials and sessions remain in /home/ubuntu/palace/auth/var for a later switch."
