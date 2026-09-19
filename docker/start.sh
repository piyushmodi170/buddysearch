#!/bin/sh
set -eu

# Coolify binds the public PORT. Express and Next stay on internal ports so
# /api is never rewritten back to the public hostname (that looped and timed out).
PUBLIC_PORT="${PORT:-3000}"
export API_PORT="${API_PORT:-4000}"
export WEB_PORT="${WEB_PORT:-3001}"
export HOSTNAME="${HOSTNAME:-0.0.0.0}"
export NODE_OPTIONS="${NODE_OPTIONS:-} --dns-result-order=ipv4first"

wait_http() {
  CHECK_PATH="$1"
  CHECK_PORT="$2"
  CHECK_PATH="$CHECK_PATH" CHECK_PORT="$CHECK_PORT" node -e "
const http = require('http');
const path = process.env.CHECK_PATH;
const port = process.env.CHECK_PORT;
const tryOnce = () => new Promise((resolve, reject) => {
  const req = http.get({ hostname: '127.0.0.1', port, path, timeout: 800 }, (res) => {
    res.resume();
    resolve(res.statusCode);
  });
  req.on('error', reject);
  req.on('timeout', () => { req.destroy(); reject(new Error('timeout')); });
});
(async () => {
  for (let i = 0; i < 60; i++) {
    try {
      const code = await tryOnce();
      if (code && code < 500) process.exit(0);
    } catch {}
    await new Promise((r) => setTimeout(r, 250));
  }
  process.exit(1);
})();
"
}

# Isolate the API from Coolify's public PORT.
PORT="$API_PORT" API_PORT="$API_PORT" node /app/api/dist/index.js &
API_PID=$!

wait_http /health/live "$API_PORT"

if [ -f /app/web/server.js ]; then
  WEB_DIR=/app/web
elif [ -f /app/web/frontend/server.js ]; then
  WEB_DIR=/app/web/frontend
else
  echo "Next.js server.js not found under /app/web" >&2
  ls -la /app/web || true
  exit 1
fi

cd "$WEB_DIR"
PORT="$WEB_PORT" HOSTNAME=0.0.0.0 node ./server.js &
WEB_PID=$!

trap 'kill $API_PID $WEB_PID 2>/dev/null || true' TERM INT EXIT

wait_http / "$WEB_PORT"

if ! kill -0 "$API_PID" 2>/dev/null; then
  echo "API failed to start" >&2
  exit 1
fi
if ! kill -0 "$WEB_PID" 2>/dev/null; then
  echo "Web failed to start" >&2
  exit 1
fi

# Warm Mongo so the first login is not the first DB handshake.
node -e "
const http = require('http');
http.get('http://127.0.0.1:' + (process.env.API_PORT || 4000) + '/health', (r) => { r.resume(); });
" || true

PORT="$PUBLIC_PORT" API_PORT="$API_PORT" WEB_PORT="$WEB_PORT" exec node /app/gateway.js
