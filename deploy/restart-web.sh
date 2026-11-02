#!/usr/bin/env bash
# Restart the LAN-facing DSH web instance that serves the user GUI (profile
# `web`, default port 3080) so a newly installed plugin (Palace UI) is loaded.
#
#   ./deploy/restart-web.sh              # restart the instance on :3080
#   ./deploy/restart-web.sh --dry-run    # only show what would happen
#
# The script finds the process listening on the port, stops it, starts the same
# `dsh --profile web` composition in the background with --no-open, and prints
# the fresh token URL. The session history is persisted by DSH, so an open browser
# tab can be reloaded (or reopened from the printed URL) after the restart.
set -euo pipefail

ROOT=$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)
PORT="${DSH_PORT:-3080}"
LOG="${DSH_WEB_LOG:-$ROOT/state/web-$PORT.log}"
DRY=0
[[ "${1:-}" == "--dry-run" ]] && DRY=1

HOST="${DSH_LAN_IP:-$(ip -4 -o addr show scope global 2>/dev/null | awk '{print $4}' | cut -d/ -f1 | grep -vE '^(127\.|169\.254\.|198\.1[89]\.)' | head -1)}"
[[ -n "$HOST" ]] || { echo "cannot determine a LAN IP; set DSH_LAN_IP" >&2; exit 1; }

PIDS=$(ss -ltnp 2>/dev/null | sed -n "s/.*:${PORT} .*pid=\([0-9]*\).*/\1/p" | sort -u | tr '\n' ' ')
echo "port $PORT is served by pid(s): ${PIDS:-<none>} (host $HOST)"
[[ $DRY -eq 1 ]] && { echo "dry run: would stop those pids, then run 'dsh --profile web --host $HOST --port $PORT --no-open'"; exit 0; }

for pid in $PIDS; do
  kill "$pid" 2>/dev/null || true
done
for _ in $(seq 1 60); do
  ss -ltn 2>/dev/null | grep -qE "[:.]${PORT}[[:space:]]" || break
  sleep 0.25
done
if ss -ltn 2>/dev/null | grep -qE "[:.]${PORT}[[:space:]]"; then
  echo "port $PORT still busy; force killing" >&2
  for pid in $PIDS; do kill -9 "$pid" 2>/dev/null || true; done
  sleep 1
fi

mkdir -p "$(dirname "$LOG")"
setsid -f bash -c 'exec "$@" >> "$LOG" 2>&1' _ \
  env -u DISPLAY -u WAYLAND_DISPLAY dsh --profile web --host "$HOST" --port "$PORT" --no-open \
  >>"$LOG" 2>&1 </dev/null

echo "waiting for http://$HOST:$PORT/ ..."
for _ in $(seq 1 120); do
  code=$(curl -s -o /dev/null -w '%{http_code}' --max-time 1 "http://$HOST:$PORT/" 2>/dev/null || true)
  if [[ -n "$code" && "$code" != "000" ]]; then
    echo
    echo "dsh web is back on http://$HOST:$PORT/"
    grep -o "http://$HOST:$PORT/?token=[A-Za-z0-9_-]*" "$LOG" | tail -1 || true
    exit 0
  fi
  sleep 0.5
done
echo "timed out waiting for dsh web; see $LOG" >&2
exit 1
