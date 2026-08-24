# syntax=docker/dockerfile:1.7

ARG NODE_IMAGE=node:22-alpine3.24@sha256:c610fcdfb1d5b4740dd70c284ed3cb16bb857e0f7166196e36a5501df7a3aa32
ARG ALPINE_IMAGE=alpine:3.24@sha256:28bd5fe8b56d1bd048e5babf5b10710ebe0bae67db86916198a6eec434943f8b

# Build
FROM ${NODE_IMAGE} AS build

ENV PNPM_HOME=/pnpm \
  PATH=/pnpm:$PATH \
  COREPACK_ENABLE_DOWNLOAD_PROMPT=0

RUN corepack enable

WORKDIR /workspace

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/keeper/package.json packages/keeper/package.json

RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
  pnpm install --frozen-lockfile --filter @nightmint/keeper...

COPY packages/keeper packages/keeper

RUN pnpm --filter @nightmint/keeper build \
  && pnpm --filter @nightmint/keeper deploy --prod --legacy /prod/keeper

# Runtime
FROM ${ALPINE_IMAGE} AS runtime

RUN apk add --no-cache dumb-init libstdc++ \
  && addgroup -g 1000 node \
  && adduser -u 1000 -G node -s /bin/sh -D node \
  && mkdir /app \
  && chown node:node /app

COPY --from=build /usr/local/bin/node /usr/local/bin/

WORKDIR /app

COPY --from=build --chown=node:node /prod/keeper ./

ENV NODE_ENV=production
LABEL org.opencontainers.image.source=https://github.com/marcioecom/nightmint
USER node

ENTRYPOINT ["dumb-init", "--"]

CMD ["node", "dist/index.js"]
