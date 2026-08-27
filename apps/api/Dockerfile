# Build this from the monorepo root, e.g.:
#   docker build -f apps/api/Dockerfile -t gestando-api .

FROM node:22-slim AS base
RUN apt-get update && apt-get install -y --no-install-recommends openssl python3 make g++ \
    && rm -rf /var/lib/apt/lists/*
WORKDIR /repo

FROM base AS deps
COPY package.json package-lock.json ./
COPY apps/api/package.json apps/api/package.json
COPY apps/mobile/package.json apps/mobile/package.json
COPY apps/web/package.json apps/web/package.json
RUN npm ci

FROM deps AS build
# Prisma's config loader requires DATABASE_URL to be set even for `prisma generate`,
# which doesn't connect to a database - this placeholder is never used at runtime.
ENV DATABASE_URL="postgresql://user:password@localhost:5432/gestando?schema=public"
COPY apps/api apps/api
RUN npm run prisma:generate --workspace=apps/api
RUN npm run build --workspace=apps/api
RUN npm prune --omit=dev

FROM node:22-slim AS runner
RUN apt-get update && apt-get install -y --no-install-recommends openssl \
    && rm -rf /var/lib/apt/lists/*
WORKDIR /repo
ENV NODE_ENV=production
COPY --from=build /repo/node_modules ./node_modules
COPY --from=build /repo/apps/api ./apps/api

WORKDIR /repo/apps/api
EXPOSE 3000
CMD ["sh", "-c", "npm run prisma:migrate:deploy && node dist/main"]
