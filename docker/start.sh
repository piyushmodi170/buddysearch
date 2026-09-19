#!/bin/sh
set -eu

# Coolify injects PORT for the public site. The API stays on 4000 in-process.
export API_PORT="${API_PORT:-4000}"
export HOSTNAME="${HOSTNAME:-0.0.0.0}"
export PORT="${PORT:-3000}"

node /app/api/dist/index.js &
API_PID=$!

trap 'kill $API_PID 2>/dev/null || true' TERM INT EXIT

# Wait until Express is accepting traffic before starting Next, otherwise
# /api rewrites hang on first login and every dashboard fetch.
node -e "
const http = require('http');
const port = process.env.API_PORT || 4000;
const tryOnce = (path) => new Promise((resolve, reject) => {
  const req = http.get('http://127.0.0.1:' + port + path, (res) => {
    res.resume();
    resolve(res.statusCode);
  });
  req.on('error', reject);
  req.setTimeout(1500, () => { req.destroy(); reject(new Error('timeout')); });
});
(async () => {
  let live = false;
  for (let i = 0; i < 50; i++) {
    try {
      const code = await tryOnce('/health/live');
      if (code && code < 500) { live = true; break; }
    } catch {}
    await new Promise((r) => setTimeout(r, 200));
  }
  if (!live) process.exit(1);
  try { await tryOnce('/health'); } catch {}
  process.exit(0);
})();
"

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
