FROM node:22-alpine AS base

RUN npm install -g pnpm
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
COPY apps/cms ./apps/cms
COPY packages/ui ./packages/ui

# Build UI package first
RUN pnpm --filter @acme/ui build

# Build CMS
RUN pnpm --filter cms build

# Production stage
FROM node:22-alpine AS production

RUN npm install -g pnpm
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
COPY --from=base /app/apps/cms/.next ./apps/cms/.next
COPY --from=base /app/apps/cms/public ./apps/cms/public
COPY --from=base /app/apps/cms/package.json ./apps/cms/

# Create uploads directory for file storage
RUN mkdir -p /app/apps/cms/uploads

EXPOSE 3001
ENV NODE_ENV=production
ENV PORT=3001
CMD ["pnpm", "start", "--filter=cms"]
