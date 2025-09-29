<div align="center">
  <img src="apps/web/public/stratos.png#gh-light-mode-only" alt="Stratos the sky bison" width="400" style="max-width: 100%; height: auto;" />
  <img src="apps/web/public/stratos-dark.png#gh-dark-mode-only" alt="Stratos the sky bison" width="400" style="max-width: 100%; height: auto;" />
  <br />
  <img src="apps/web/app/welcome/logo-light.svg#gh-light-mode-only" alt="Overland Stack" width="400" style="max-width: 100%; height: auto;" />
  <img src="apps/web/app/welcome/logo-dark.svg#gh-dark-mode-only" alt="Overland Stack" width="400" style="max-width: 100%; height: auto;" />
</div>

A full-stack starter with React Router v7, Payload CMS, and PostgreSQL. Ready to deploy.

<div align="center">

[![CI](https://github.com/alloy-lab/overland/actions/workflows/ci.yml/badge.svg)](https://github.com/alloy-lab/overland/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

</div>

## What's included

- **React Router v7** with SSR and file-based routing
- **Payload CMS v3** with PostgreSQL and rich content management
- **TypeScript** with strict type checking and auto-generated types
- **Security Package** (`@alloylab/security`) with CORS, rate limiting, and CSRF protection
- **SEO Package** (`@alloylab/seo`) with structured data, meta tags, and sitemaps
- **Collection Registry** (`@alloylab/collection-registry`) for automated type generation
- **Testing** with Vitest (unit) and Playwright (E2E)
- **Development Tools** including ESLint, Prettier, and Lefthook git hooks
- **Docker** setup for development and production deployment

## Features

- **Security**: Built-in security middleware with CORS, rate limiting, and CSRF protection
- **SEO**: Comprehensive SEO package with structured data, meta tags, and sitemaps
- **Type Safety**: Auto-generated TypeScript types from CMS collections
- **Testing**: Unit tests with Vitest and E2E tests with Playwright
- **Performance**: Image optimization and performance monitoring
- **Development**: Hot reload, auto-formatting, and comprehensive linting

## Optional features (Coming soon)

- Email integration
- Error monitoring
- i18n support
- Dark/light theme
- Stripe payments

## 📁 Project Structure

```
overland/
├── apps/
│   ├── cms/                 # Payload CMS application
│   │   ├── src/
│   │   │   ├── app/         # Next.js app directory
│   │   │   │   ├── (frontend)/ # Frontend routes
│   │   │   │   └── (payload)/  # Payload admin routes
│   │   │   ├── collections/ # Content collections (Pages, Users, Media)
│   │   │   ├── globals/    # Global settings (SiteSettings)
│   │   │   └── migrations/ # Database migrations
│   │   ├── tests/          # CMS tests (unit, E2E)
│   │   └── Dockerfile
│   └── web/                 # React Router v7 SSR application
│       ├── app/
│       │   ├── routes/     # React Router v7 file-based routes
│       │   ├── lib/        # Utilities and auto-generated API clients
│       │   │   ├── clients/ # Auto-generated collection clients
│       │   │   └── types/  # Auto-generated TypeScript types
│       │   └── welcome/    # Welcome page components
│       ├── tests/          # Web app tests (unit, E2E)
│       └── Dockerfile
├── packages/
│   └── ui/                  # Shared UI components
├── scripts/                 # Development and build scripts
│   └── collection-registry.js # Automated type/client generation
├── docker-compose.yml       # Production deployment
├── docker-compose.dev.yml   # Development environment
├── pnpm-workspace.yaml     # pnpm workspace configuration
├── lefthook.yml            # Git hooks configuration
└── package.json            # Root workspace configuration
```

### pnpm Workspace

- Root workspace with shared dependencies
- Apps: `cms` and `web`
- Packages: `@acme/ui` for shared components

## Tech Stack

- TypeScript
- pnpm workspaces
- React Router v7, Vite SSR
- Payload CMS v3, PostgreSQL
- Docker

## Quick Start

### Prerequisites

- Node.js 24.8.0+
- pnpm 10.17.1+
- Docker & Docker Compose

### Setup

```bash
# Clone and setup
git clone https://github.com/alloy-lab/overland.git
cd overland
cp env.example .env

# Generate a secure PAYLOAD_SECRET
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
# Copy the output and update PAYLOAD_SECRET in .env

# Install and start
pnpm install
pnpm dev
```

### Access

- Web App: http://localhost:3000
- CMS Admin: http://localhost:3001/admin

## Content Management

### Collections

- **Pages**: Static pages with rich text and SEO
- **Users**: CMS administrators
- **Media**: File uploads

### Features

- Rich text editor (Lexical)
- SEO fields
- Draft/published workflow
- Auto-generated TypeScript types

## Auto-generated Types

Types and API clients are automatically generated from CMS collections:

```bash
pnpm generate:types
```

This creates:

- TypeScript interfaces in `apps/web/app/lib/types/`
- API client classes in `apps/web/app/lib/clients/`
- Route files in `apps/web/app/routes/`

## Deployment

### Build

```bash
pnpm build
```

### Docker

```bash
# Development environment
docker compose -f docker-compose.dev.yml --profile development up -d

# Production environment
docker compose up -d
```

### Environment Variables

```env
DATABASE_URI=postgresql://user:password@host:port/database
PAYLOAD_SECRET=your-secure-secret-key
PAYLOAD_PUBLIC_SERVER_URL=https://your-domain.com
PAYLOAD_PUBLIC_CMS_URL=https://your-domain.com/admin
```

## Testing

### Unit Tests

- Vitest with jsdom
- Location: `apps/web/tests/unit/`
- Run: `pnpm test:unit`

### E2E Tests

- Playwright
- Location: `apps/web/tests/e2e/`
- Run: `pnpm test:e2e`

### Commands

- `pnpm test` - All tests
- `pnpm test:unit` - Unit tests only
- `pnpm test:e2e` - E2E tests only

## Development

### Adding Collections

1. Create collection in `apps/cms/src/collections/`
2. Add to `payload.config.ts`
3. Run `pnpm generate:types`

### AlloyLab Packages

The template includes several published packages from the AlloyLab ecosystem:

#### Collection Registry (`@alloylab/collection-registry` v1.1.2)

Automatically generates TypeScript types, API client methods, and React Router route files from your Payload CMS collections.

#### Security Package (`@alloylab/security` v1.0.2)

Provides comprehensive security middleware including CORS, rate limiting, CSRF protection, and request sanitization.

#### SEO Package (`@alloylab/seo` v1.0.1)

Handles structured data generation, meta tags, sitemaps, and SEO optimization for your web application.

#### Package Dependencies

```json
{
  "dependencies": {
    "@alloylab/collection-registry": "^1.1.2",
    "@alloylab/security": "^1.0.2",
    "@alloylab/seo": "^1.0.1"
  }
}
```

The collection registry automatically:

- Scans your Payload collections
- Generates TypeScript types in `apps/web/app/lib/types/`
- Creates API client methods in `apps/web/app/lib/clients/`
- Generates React Router route files in `apps/web/app/lib/routes/`

### Adding Routes

Create route files in `apps/web/app/routes/` (React Router v7 file-based routing).

### Scripts

- `pnpm dev` - Start development
- `pnpm build` - Build all apps
- `pnpm test` - Run tests
- `pnpm generate:types` - Generate types from CMS
- `pnpm format` - Format code

## Customization

### Styling

Uses Tailwind CSS v4 with the new `@theme` directive. Customize in `apps/web/app/app.css` or replace with your preferred framework.

### CMS

- Add custom fields in `apps/cms/src/fields/`
- Add collection hooks for custom logic
- Install Payload plugins

### API

- Add custom routes in `apps/cms/src/app/(payload)/api/`
- Extend web app API in `apps/web/server/`

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

## License

MIT License - see [LICENSE](./LICENSE).

## Troubleshooting

### Common Issues

#### Type Generation Errors

If you encounter type generation errors, ensure your database is running and accessible:

```bash
# Check database connection
pnpm generate:types
```

#### Test Failures

If tests are failing, ensure all environment variables are set:

```bash
# Copy environment template
cp env.example .env

# Run tests with proper environment
NODE_ENV=test pnpm test:unit
```

#### Build Errors

If builds fail, ensure all dependencies are installed and types are generated:

```bash
# Clean install
rm -rf node_modules
pnpm install

# Generate types
pnpm generate:types

# Build
pnpm build
```

### Getting Help

- [Discord Community](https://discord.gg/8NeX7C7V)
- [Payload CMS Docs](https://payloadcms.com/docs)
- [React Router Docs](https://reactrouter.com)
- Create GitHub issues for bugs and features
