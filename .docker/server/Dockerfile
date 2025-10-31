FROM node:22.20-alpine AS base

WORKDIR /app

RUN npm install -g turbo

FROM base AS builder

COPY package.json package-lock.json turbo.json ./
COPY apps ./apps
COPY packages ./packages

RUN npm ci --omit=dev --prefer-offline

RUN turbo prune --scope=backend --docker

FROM base AS installer

COPY --from=builder /app/out/json/ .
COPY --from=builder /app/out/package-lock.json ./package-lock.json

RUN npm ci

COPY --from=builder /app/out/full/ .

RUN turbo run build --filter=backend

FROM base AS prod-deps

COPY --from=builder /app/out/json/ .
COPY --from=builder /app/out/package-lock.json ./package-lock.json

RUN npm ci --omit=dev --prefer-offline

FROM node:22.20-alpine AS runner

WORKDIR /app

COPY --from=installer /app/apps/backend/package.json ./

RUN npm install -g pm2 

COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=installer /app/apps/backend/dist ./dist

CMD ["pm2-runtime", "start", "npm", "--", "start"]