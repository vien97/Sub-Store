#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/backend"

npx --yes pnpm@11.0.9 install --no-frozen-lockfile

node bundle-vercel.js

mkdir -p ../public
printf 'Sub-Store deployment placeholder\n' > ../public/__build_placeholder.txt
