FROM node:18-alpine AS base

RUN npm install -g pnpm
WORKDIR /app

# Copy workspace configuration
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Copy all package.json files for proper dependency resolution
COPY apps/cms/package.json ./apps/cms/
COPY apps/web/package.json ./apps/web/
COPY packages/ui/package.json ./packages/ui/

# Install all dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY apps/web ./apps/web
COPY packages/ui ./packages/ui

# Build UI package first
RUN pnpm --filter @acme/ui build

# Build web app
RUN pnpm --filter web build

# Production stage
FROM node:18-alpine AS production

RUN npm install -g pnpm
WORKDIR /app

# Copy workspace configuration
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Copy all package.json files
COPY apps/cms/package.json ./apps/cms/
COPY apps/web/package.json ./apps/web/
COPY packages/ui/package.json ./packages/ui/

# Install production dependencies only
RUN pnpm install --frozen-lockfile --prod

# Copy built application from base stage
COPY --from=base /app/apps/web/build ./apps/web/build
COPY --from=base /app/apps/web/package.json ./apps/web/

EXPOSE 3000
ENV NODE_ENV=production
ENV PORT=3000
CMD ["pnpm", "start", "--filter=web"]
