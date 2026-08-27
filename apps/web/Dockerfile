# Build this from the monorepo root, e.g.:
#   docker build -f apps/web/Dockerfile -t gestando-web \
#     --build-arg NEXT_PUBLIC_API_URL=https://api.gestandoapp.com/api .
#
# NEXT_PUBLIC_* variables are inlined into the JS bundle at build time, not read at
# runtime - the API must already have a stable URL before building this image.

FROM node:22-slim AS base
WORKDIR /repo

FROM base AS deps
COPY package.json package-lock.json ./
COPY apps/api/package.json apps/api/package.json
COPY apps/mobile/package.json apps/mobile/package.json
COPY apps/web/package.json apps/web/package.json
RUN npm ci

FROM deps AS build
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
COPY apps/web apps/web
RUN npm run build --workspace=apps/web

FROM node:22-slim AS runner
WORKDIR /repo
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# In a monorepo, the standalone output mirrors the repo's directory structure
# (apps/web/server.js, plus node_modules at whichever level deps were hoisted to)
# - see https://nextjs.org/docs/app/api-reference/config/next-config-js/output
COPY --from=build /repo/apps/web/.next/standalone ./
COPY --from=build /repo/apps/web/.next/static ./apps/web/.next/static
COPY --from=build /repo/apps/web/public ./apps/web/public

WORKDIR /repo/apps/web
EXPOSE 3000
CMD ["node", "server.js"]
