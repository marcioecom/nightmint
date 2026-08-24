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
COPY packages/indexer/package.json packages/indexer/package.json

RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
  pnpm install --frozen-lockfile --filter @nightmint/indexer...

COPY packages/indexer packages/indexer

RUN pnpm --filter @nightmint/indexer deploy --prod --legacy /prod/indexer

# Runtime 
FROM ${ALPINE_IMAGE} AS runtime

RUN apk add --no-cache dumb-init libstdc++ \
  && addgroup -g 1000 node \
  && adduser -u 1000 -G node -s /bin/sh -D node \
  && mkdir /app \
  && chown node:node /app

COPY --from=build /usr/local/bin/node /usr/local/bin/

WORKDIR /app

COPY --from=build --chown=node:node /prod/indexer ./

ENV NODE_ENV=production
LABEL org.opencontainers.image.source=https://github.com/marcioecom/nightmint
USER node
EXPOSE 42069

ENTRYPOINT ["dumb-init", "--"]

CMD ["node", "node_modules/ponder/dist/esm/bin/ponder.js", "start"]
