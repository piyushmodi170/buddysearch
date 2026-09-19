#!/usr/bin/env bash
set -euo pipefail
cd /workspace/frontend
while true; do
  echo "[buddysearch] starting Next.js on 0.0.0.0:3000"
  npx next dev -H 0.0.0.0 -p 3000 || true
  echo "[buddysearch] Next.js exited; restarting in 2s"
  sleep 2
done
