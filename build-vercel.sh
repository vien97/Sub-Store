
#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/backend"

npx --yes pnpm@11.0.9 install --no-frozen-lockfile

node bundle-vercel.js
