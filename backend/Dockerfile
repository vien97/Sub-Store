FROM node:24-bookworm-slim AS build

ENV COREPACK_ENABLE_DOWNLOAD_PROMPT=0
WORKDIR /app

RUN corepack enable
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .
RUN node dev-esbuild.js
RUN pnpm prune --prod

FROM node:24-bookworm-slim AS runtime

ENV NODE_ENV=production \
    SUB_STORE_DATA_BASE_PATH=/data \
    SUB_STORE_BACKEND_API_HOST=0.0.0.0
WORKDIR /app

RUN mkdir -p /data
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/sub-store.min.js ./sub-store.min.js

EXPOSE 3000
CMD ["sh", "-c", "export SUB_STORE_BACKEND_API_PORT=\"${PORT:-3000}\"; exec node sub-store.min.js"]
