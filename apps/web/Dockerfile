FROM node:24.8.0-alpine AS base

RUN corepack enable pnpm
WORKDIR /app

# Copy workspace configuration
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Copy all package.json files for proper dependency resolution
COPY apps/cms/package.json ./apps/cms/
COPY apps/web/package.json ./apps/web/
COPY packages/ui/package.json ./packages/ui/

# Install all dependencies (skip git hooks in Docker)
RUN pnpm install --frozen-lockfile --ignore-scripts

# Copy source code
COPY apps/web ./apps/web
COPY packages/ui ./packages/ui

# Build UI package first
RUN pnpm --filter @acme/ui build

# Build Web app
RUN pnpm --filter web build

# Production stage
FROM node:24.8.0-alpine AS production

RUN corepack enable pnpm
WORKDIR /app

# Copy workspace configuration
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Copy all package.json files
COPY apps/cms/package.json ./apps/cms/
COPY apps/web/package.json ./apps/web/
COPY packages/ui/package.json ./packages/ui/

# Install production dependencies only (skip git hooks in Docker)
RUN pnpm install --frozen-lockfile --prod --ignore-scripts

# Copy built application from base stage
COPY --from=base /app/apps/web/build ./apps/web/build
COPY --from=base /app/apps/web/server.js ./apps/web/
COPY --from=base /app/apps/web/package.json ./apps/web/

EXPOSE 3000
ENV NODE_ENV=production
ENV PORT=3000
CMD ["pnpm", "--filter=web", "start"]
