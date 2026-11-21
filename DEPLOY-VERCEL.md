# Deploy Sub-Store Backend on Vercel

This repository can be deployed to Vercel as a single serverless project serving the Sub-Store backend API.

## Files involved

| File | Purpose |
| --- | --- |
| `backend/src/products/sub-store-serverless.js` | Serverless entry: builds the Express app without listening on a port and without starting cron jobs |
| `backend/bundle-vercel.js` | Two-pass esbuild bundle producing a self-contained `api/sub-store-serverless.min.js` |
| `api/index.js` | Vercel function: prepares the data directory and forwards requests to the express app |
| `vercel.json` | Vercel configuration: build command + routing all paths to the function |
| `build-vercel.sh` | Installs backend dependencies (pnpm) and runs the bundler |

## Deploy steps

1. Import `vien97/Sub-Store` into Vercel as a new project (framework preset: **Other**). `vercel.json` is detected automatically.
2. Set the environment variables:

   | Variable | Required | Notes |
   | --- | --- | --- |
   | `SUB_STORE_DATA_BASE_PATH` | Recommended | Writable directory for the persisted JSON store. Defaults to `/tmp/sub-store` when unset. |
   | `SUB_STORE_FRONTEND_BACKEND_PATH` | Recommended | Set to `/` so script processors work in the Node.js runtime. |
   | `SUB_STORE_DATA_URL` | Optional | URL of a Gist/backup file restored into the store on every cold start. |
   | `SUB_STORE_CORS_ALLOWED_ORIGINS` | Optional | Defaults already allow `https://sub-store.vercel.app`. |

3. Deploy and open `https://<project>.vercel.app/api/utils/env` — it should answer with the Sub-Store env JSON.

## Usage with the frontend

Open the official frontend and point it at your backend:

```
https://sub-store.vercel.app?api=https://<project>.vercel.app
```

CORS defaults already allow the official frontend origin.

## Limitations on Vercel

- The filesystem is read-only except `/tmp`; data survives across warm invocations but is **reset on every cold start**. Pair `SUB_STORE_DATA_URL` (restore on start) with Gist backups (`/api/utils/backup`) to keep data durable.
- Cron-based features (`SUB_STORE_BACKEND_SYNC_CRON`, `SUB_STORE_PRODUCE_CRON`, MMDB cron, artifact cron) are disabled in the serverless entry. Trigger syncs manually or from the frontend instead.
