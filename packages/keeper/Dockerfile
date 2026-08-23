# syntax=docker/dockerfile:1
# Build from the repository root:
#   docker build -f packages/keeper/Dockerfile \
#     -t ghcr.io/marcioecom/nightmint-keeper:latest .

FROM node:22-alpine AS base
ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH
ENV COREPACK_ENABLE_DOWNLOAD_PROMPT=0
RUN corepack enable

FROM base AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/contracts/package.json packages/contracts/
COPY packages/web/package.json packages/web/
COPY packages/indexer/package.json packages/indexer/
COPY packages/keeper/package.json packages/keeper/
RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    pnpm install --frozen-lockfile --filter @nightmint/keeper...

FROM node:22-alpine AS runner
LABEL org.opencontainers.image.source=https://github.com/marcioecom/nightmint
ENV NODE_ENV=production
WORKDIR /app
COPY --from=deps --chown=node:node /app ./
COPY --chown=node:node packages/keeper packages/keeper
USER node
WORKDIR /app/packages/keeper
CMD ["./node_modules/.bin/tsx", "src/index.ts"]
