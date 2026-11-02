#!/usr/bin/env bash
# Local development instance for Palace on this workstation.
#
# Runs the same two services as the cloud deployment, on local-only ports:
#   - DSH web (profile `palace`, with the palace-mobile client plugin)
#       127.0.0.1:3082   DSH_HOME = <repo>/state
#   - Palace auth gateway (passkey/TOTP/recovery in front of DSH)
#       127.0.0.1:3091   http://localhost:3091/__palace/
#
# Differences from the cloud host (see docs/local-instance.md):
#   * reuses the globally installed DSH 0.2.1-rc.5 instead of a local runtime/
#   * the auth gateway runs over plain HTTP for localhost (PALACE_COOKIE_SECURE=0)
#   * the native directory-picker is disabled by unsetting DISPLAY so the web
#     file browser uses the in-app `browse` backend, like the headless server.
#
# Usage: deploy/local-dev.sh {start|stop|restart|status|url|token}
set -euo pipefail

ROOT=$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)
STATE="$ROOT/state"
RUN="$STATE/run"
WEB_PORT=${PALACE_WEB_PORT:-3082}
WEB_HOST=${PALACE_WEB_HOST:-127.0.0.1}
AUTH_PORT=${PALACE_AUTH_PORT:-3091}
WEB_LOG="$STATE/local-web.log"
AUTH_LOG="$STATE/local-auth.log"
DSH_BIN=$(command -v dsh || true)
[[ -n "$DSH_BIN" ]] || DSH_BIN="$HOME/.local/share/npm-global/bin/dsh"

mkdir -p "$RUN"

pid_alive() { [[ -f "$1" ]] && kill -0 "$(cat "$1")" 2>/dev/null; }

# spawn <pidfile> <logfile> <workdir> <command...>
# Double-forks via `setsid -f`, so the service outlives this script and keeps
# its own session; the intermediate shell writes the pidfile before exec.
spawn() {
  local pidfile=$1 logfile=$2 workdir=$3
  shift 3
  ( cd "$workdir" && setsid -f bash -c 'echo $$ > "$1"; shift; exec "$@"' _ \
      "$pidfile" "$@" >>"$logfile" 2>&1 </dev/null )
}

wait_http() { # url, label
  # DSH answers 401 without a token, so any HTTP status (non-000) means it is up.
  local code
  for _ in $(seq 1 120); do
    code=$(curl -s -o /dev/null -w '%{http_code}' --max-time 1 "$1" 2>/dev/null || true)
    [[ -n "$code" && "$code" != "000" ]] && return 0
    sleep 0.5
  done
  echo "timed out waiting for $2" >&2
  return 1
}

start_web() {
  if pid_alive "$RUN/web.pid"; then
    echo "dsh web already running (pid $(cat "$RUN/web.pid"))"
    return 0
  fi
  echo "==> starting dsh web on 127.0.0.1:$WEB_PORT (log: $WEB_LOG)"
  spawn "$RUN/web.pid" "$WEB_LOG" "$ROOT" \
    env -u DISPLAY -u WAYLAND_DISPLAY DSH_HOME="$STATE" \
    "$DSH_BIN" --profile palace --no-open --host "$WEB_HOST" --port "$WEB_PORT"
  wait_http "http://$WEB_HOST:$WEB_PORT/" "dsh web" || return 1
}

start_auth() {
  if pid_alive "$RUN/auth.pid"; then
    echo "auth gateway already running (pid $(cat "$RUN/auth.pid"))"
    return 0
  fi
  echo "==> starting Palace auth gateway on 127.0.0.1:$AUTH_PORT (log: $AUTH_LOG)"
  spawn "$RUN/auth.pid" "$AUTH_LOG" "$ROOT/auth" \
    env PALACE_AUTH_CONFIG="$ROOT/auth/config.env" node src/server.mjs
  wait_http "http://127.0.0.1:$AUTH_PORT/__palace/healthz" "auth gateway" || return 1
}

stop_one() { # pidfile, label
  if pid_alive "$1"; then
    echo "==> stopping $2 (pid $(cat "$1"))"
    kill "$(cat "$1")" 2>/dev/null || true
    for _ in $(seq 1 40); do pid_alive "$1" || break; sleep 0.25; done
    pid_alive "$1" && kill -9 "$(cat "$1")" 2>/dev/null || true
  fi
  rm -f "$1"
}

status() {
  if pid_alive "$RUN/web.pid"; then
    echo "dsh web:       running (pid $(cat "$RUN/web.pid"))  http://$WEB_HOST:$WEB_PORT/"
  else
    echo "dsh web:       stopped"
  fi
  if pid_alive "$RUN/auth.pid"; then
    echo "auth gateway:  running (pid $(cat "$RUN/auth.pid"))  http://localhost:$AUTH_PORT/__palace/"
  else
    echo "auth gateway:  stopped"
  fi
}

case "${1:-}" in
  start)
    start_web
    start_auth
    echo
    status
    echo
    echo "Open:  http://localhost:$AUTH_PORT/__palace/   (passkey login)"
    echo "First run: node auth/src/cli.mjs setup-token --json   then open /__palace/setup"
    ;;
  stop)
    stop_one "$RUN/auth.pid" "auth gateway"
    stop_one "$RUN/web.pid" "dsh web"
    ;;
  restart)
    "$0" stop
    "$0" start
    ;;
  status) status ;;
  url) echo "http://localhost:$AUTH_PORT/__palace/" ;;
  token)
    if [[ -f "$WEB_LOG" ]]; then
      grep -o 'http://127\.0\.0\.1:[0-9]*/?token=[A-Za-z0-9_-]*' "$WEB_LOG" | tail -1
    else
      echo "no $WEB_LOG yet" >&2; exit 1
    fi
    ;;
  *)
    echo "usage: $0 {start|stop|restart|status|url|token}" >&2
    exit 2
    ;;
esac
