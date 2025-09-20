FROM node:18-alpine AS base

RUN npm install -g pnpm
WORKDIR /app

COPY package.json pnpm-lock.yaml ./
COPY apps/cms/package.json ./apps/cms/
RUN pnpm install --frozen-lockfile

COPY apps/cms ./apps/cms
COPY turbo.json ./
RUN pnpm build --filter=cms

# Production stage
FROM node:18-alpine AS production

RUN npm install -g pnpm
WORKDIR /app

COPY package.json pnpm-lock.yaml ./
COPY apps/cms/package.json ./apps/cms/
RUN pnpm install --frozen-lockfile --prod

COPY --from=base /app/apps/cms/dist ./apps/cms/dist
COPY --from=base /app/apps/cms/node_modules/.cache ./apps/cms/node_modules/.cache

# Create uploads directory for file storage
RUN mkdir -p /app/apps/cms/uploads

EXPOSE 3001
ENV NODE_ENV=production
ENV PORT=3001
CMD ["node", "apps/cms/dist/server.js"]
