<div align="center">
  <img src="./apps/web/public/stratos.png#gh-light-mode-only" alt="Stratos the sky bison" width="400" style="max-width: 100%; height: auto;" />
  <img src="./apps/web/public/stratos-dark.png#gh-dark-mode-only" alt="Stratos the sky bison" width="400" style="max-width: 100%; height: auto;" />
  <br />
  <img src="./apps/web/app/welcome/logo-light.svg#gh-light-mode-only" alt="Overland Stack" width="400" style="max-width: 100%; height: auto;" />
  <img src="./apps/web/app/welcome/logo-dark.svg#gh-dark-mode-only" alt="Overland Stack" width="400" style="max-width: 100%; height: auto;" />
</div>

A full-stack starter with React Router v7, Payload CMS, and PostgreSQL. Ready to deploy.

<div align="center">

[![CI](https://github.com/alloy-lab/overland/actions/workflows/ci.yml/badge.svg)](https://github.com/alloy-lab/overland/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

</div>

## What's included

- React Router v7 with SSR
- Payload CMS v3 with PostgreSQL
- TypeScript, ESLint, Prettier
- Vitest and Playwright for testing
- Docker setup
- Auto-generated types from CMS collections

## Optional features (Coming soon)

- Email integration
- Error monitoring
- i18n support
- Image optimization
- Dark/light theme
- Stripe payments

## 📁 Project Structure

```
overland-stack/
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

- Node.js 22+
- pnpm 8+
- Docker & Docker Compose

### Setup

```bash
# Clone and setup
git clone <your-repo-url>
cd overland-stack
cp env.example .env

# Edit .env with your configuration
# Set PAYLOAD_SECRET to a secure random string

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
docker-compose up -d
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

Uses Tailwind CSS v4. Customize in `tailwind.config.js` or replace with your preferred framework.

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

## Support

- [Discord Community](https://discord.gg/8NeX7C7V)
- [Payload CMS Docs](https://payloadcms.com/docs)
- [React Router Docs](https://reactrouter.com)
- Create GitHub issues for bugs and features
