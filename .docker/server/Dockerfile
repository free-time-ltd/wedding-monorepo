FROM oven/bun:1.2-alpine AS base

WORKDIR /app

RUN apk add --no-cache nodejs npm

RUN npm install -g turbo pm2

FROM base AS builder

COPY . .

RUN turbo prune --scope=backend --docker

FROM base AS installer

COPY --from=builder /app/out/json/ .
COPY --from=builder /app/out/package-lock.json ./package-lock.json

RUN npm install --omit=dev

# Build the project
COPY --from=builder /app/out/full/ .

COPY turbo.json turbo.json

RUN turbo run build --filter=backend

FROM node:22.20-alpine AS runner

WORKDIR /app

COPY .docker/server/entrypoint.sh /entrypoint.sh

COPY --from=installer /app/node_modules ./node_modules
COPY --from=installer /app/apps/backend/dist/index.js index.js

CMD ["node", "index.js"]