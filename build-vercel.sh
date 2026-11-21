#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/backend"

if command -v pnpm >/dev/null 2>&1; then
    pnpm install --frozen-lockfile
else
    npx --yes pnpm@11.0.9 install --frozen-lockfile
fi

node bundle-vercel.js
