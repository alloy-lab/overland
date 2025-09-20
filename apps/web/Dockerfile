FROM node:18-alpine AS base

RUN npm install -g pnpm
WORKDIR /app

COPY package.json pnpm-lock.yaml ./
COPY apps/web/package.json ./apps/web/
RUN pnpm install --frozen-lockfile

COPY apps/web ./apps/web
COPY turbo.json ./
RUN pnpm build --filter=web

# Production stage
FROM node:18-alpine AS production

RUN npm install -g pnpm
WORKDIR /app

COPY package.json pnpm-lock.yaml ./
COPY apps/web/package.json ./apps/web/
RUN pnpm install --frozen-lockfile --prod

COPY --from=base /app/apps/web/dist ./apps/web/dist

EXPOSE 3000
ENV NODE_ENV=production
ENV PORT=3000
CMD ["node", "apps/web/dist/server.js"]
