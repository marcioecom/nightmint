# syntax=docker/dockerfile:1
# Build from the repo root:
#   docker build -f packages/indexer/Dockerfile -t ghcr.io/marcioecom/nightmint-indexer:latest .

FROM node:22-alpine AS base
ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH
# packageManager in the root package.json pins the exact pnpm version corepack fetches.
ENV COREPACK_ENABLE_DOWNLOAD_PROMPT=0
RUN corepack enable

# ---------------------------------------------------------------------------
# deps: install only the indexer's dependency tree from the frozen lockfile.
# Copying every workspace package.json (but no sources) keeps the pnpm
# workspace graph intact while keeping this layer cacheable.
# ---------------------------------------------------------------------------
FROM base AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/contracts/package.json packages/contracts/
COPY packages/web/package.json packages/web/
COPY packages/keeper/package.json packages/keeper/
COPY packages/indexer/package.json packages/indexer/
RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    pnpm install --frozen-lockfile --filter @nightmint/indexer...

# ---------------------------------------------------------------------------
# runner: full install copied over (Ponder builds the app at startup, so it
# needs its toolchain at runtime; `pnpm deploy --prod` would drop it).
# ---------------------------------------------------------------------------
FROM node:22-alpine AS runner
LABEL org.opencontainers.image.source=https://github.com/marcioecom/nightmint
ENV NODE_ENV=production
ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH
ENV COREPACK_ENABLE_DOWNLOAD_PROMPT=0
RUN corepack enable
WORKDIR /app
COPY --from=deps --chown=node:node /app ./
COPY --chown=node:node packages/indexer packages/indexer
USER node
WORKDIR /app/packages/indexer
EXPOSE 42069
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD wget -qO- http://127.0.0.1:42069/health || exit 1
CMD ["pnpm", "start"]
