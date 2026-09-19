#!/bin/sh
set -eu

# Coolify injects PORT for the public site. The API stays on 4000 in-process.
export API_PORT="${API_PORT:-4000}"
export HOSTNAME="${HOSTNAME:-0.0.0.0}"
export PORT="${PORT:-3000}"

node /app/api/dist/index.js &
API_PID=$!

trap 'kill $API_PID 2>/dev/null || true' TERM INT EXIT

sleep 1
if ! kill -0 "$API_PID" 2>/dev/null; then
  echo "API failed to start" >&2
  exit 1
fi

if [ -f /app/web/server.js ]; then
  cd /app/web
elif [ -f /app/web/frontend/server.js ]; then
  cd /app/web/frontend
else
  echo "Next.js server.js not found under /app/web" >&2
  ls -la /app/web || true
  exit 1
fi

exec node server.js
