<div align="center">
  <img src="./apps/web/public/stratos.png#gh-light-mode-only" alt="Stratos the sky bison" width="400" style="max-width: 100%; height: auto;" />
  <img src="./apps/web/public/stratos-dark.png#gh-dark-mode-only" alt="Stratos the sky bison" width="400" style="max-width: 100%; height: auto;" />
  <br />
  <img src="./apps/web/app/welcome/logo-light.svg#gh-light-mode-only" alt="Overland Stack" width="400" style="max-width: 100%; height: auto;" />
  <img src="./apps/web/app/welcome/logo-dark.svg#gh-dark-mode-only" alt="Overland Stack" width="400" style="max-width: 100%; height: auto;" />
</div>

<div align="center">

[![CI](https://github.com/alloy-lab/overland/actions/workflows/ci.yml/badge.svg)](https://github.com/alloy-lab/overland/actions/workflows/ci.yml)

</div>

**The modern full-stack starter that gets you shipping faster.** React Router v7 + Payload CMS + PostgreSQL, with zero configuration overhead and production-ready deployment.

## Why this stack?

Most starter templates try to impress you with everything they can cram in. This one takes the opposite approach: only what you actually need, plus recipes for what you might want later.

Think of it as polite defaults with clear exits:

- 🚀 React Router v7 for the frontend. Fast, modern, battle-tested SSR.
- 🗄 Payload CMS v3 with PostgreSQL. One source of truth for data and content.
- 📄 Pages collection for static content management with rich text and SEO.
- 🎨 Tailwind CSS v4 styling with shared UI components.
- 🧪 TypeScript, ESLint, Prettier, Vitest, Playwright. Comprehensive testing and code quality.
- 🐳 Dockerized and ready to deploy. Works out of the box with Coolify.
- 🔧 Automated type generation and API clients from CMS collections.

And for the ambitious:

- 📧 Drop-in email (Mailgun/Postmark)
- 📊 Error monitoring (Sentry)
- 🌍 i18n support
- 🖼 Image optimization route
- 🌗 Dark/light theme toggle
- 💳 Stripe payments example

Everything else? Optional examples, not baggage. No dashboards you didn’t ask for, no lock-in you’ll regret later.

## The Philosophy

- Less scaffolding, more shipping. You start coding features, not deleting boilerplate.
- One DB, one CMS. No split-brain SQLite vs Postgres drama.
- Recipes, not mandates. If you want Stripe, i18n, or Grafana, the patterns are ready—but they don’t come pre-installed.

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

This project uses pnpm workspaces for monorepo management:

- **Root workspace**: Contains shared dependencies and scripts
- **Apps**: Independent applications (cms, web)
- **Packages**: Shared libraries (@acme/ui)
- **Workspace dependencies**: Use `workspace:*` for internal packages

## 🛠️ Tech Stack

- **Language**: TypeScript
- **Package Manager**: pnpm
- **Monorepo**: pnpm workspaces
- **Frontend**: React 19, React Router v7, Vite SSR, Express
- **CMS**: Payload CMS v3, PostgreSQL 17
- **Deployment**: Docker, Docker Compose, Coolify-ready

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- pnpm 8+
- Docker & Docker Compose
- PostgreSQL 17 (or use Docker)

### 1. Complete Setup

```bash
# Clone the repository
git clone <your-repo-url>
cd overland-stack

# Run the comprehensive setup script
./scripts/setup.sh
```

The setup script will:

- Check prerequisites (Node.js, pnpm, Docker)
- Create environment configuration from `env.example`
- Install all dependencies
- Optionally start development servers

### 2. Manual Setup (Alternative)

```bash
# Copy environment file
cp env.example .env

# Edit .env with your configuration
# Important: Set PAYLOAD_SECRET to a secure random string

# Install dependencies
pnpm install

# Start development
pnpm dev
```

### 3. Access Applications

- **Web App**: http://localhost:3000
- **CMS Admin**: http://localhost:3001/admin
- **CMS API**: http://localhost:3001/api

## 📝 Content Management

### Collections

- **Pages**: Static pages with rich text content, SEO fields, and navigation
- **Users**: CMS administrators and editors
- **Media**: File uploads with local storage

### Global Settings

- **SiteSettings**: Site-wide configuration, social links, contact info

### Content Features

- **Rich Text**: Lexical editor for content creation
- **SEO**: Built-in SEO fields for Pages collection
- **Drafts**: Draft/published workflow
- **Media**: File uploads with local storage
- **Navigation**: Built-in navigation management for pages
- **Automated Type Generation**: Auto-generates TypeScript types and API clients from CMS collections
- **Type Safety**: Full TypeScript support with auto-generated types

## 🔄 Automated Collection Registry

The Overland Stack includes a powerful automated collection registry system that bridges the gap between Payload CMS and the web application:

### Features

- **Auto-Generated Types**: TypeScript interfaces generated from CMS collection schemas
- **API Clients**: Individual client classes for each collection with type-safe methods
- **Route Generation**: React Router v7 routes automatically created for collections
- **Code Organization**: Separate files per collection for maintainable code structure

### How It Works

1. **Collection Detection**: Scans `apps/cms/src/collections/` for collection definitions
2. **Type Generation**: Creates TypeScript interfaces in `apps/web/app/lib/types/`
3. **Client Generation**: Generates API client classes in `apps/web/app/lib/clients/`
4. **Route Generation**: Creates route files in `apps/web/app/routes/`
5. **Auto-Formatting**: Ensures generated code follows project formatting standards

### Usage

```bash
# Generate types and clients from CMS collections
pnpm generate:types
```

This system eliminates the need to manually maintain type definitions and API clients, ensuring they stay in sync with your CMS schema.

## 🏗️ Building and Deployment

### Production Build

```bash
# Build all applications
pnpm build
```

### Docker Production

```bash
# Build and start production containers
docker-compose up -d
```

### Coolify Deployment

1. **Connect Repository**: Link your Git repository to Coolify
2. **Environment Variables**: Set required environment variables
3. **Docker Compose**: Use the provided `docker-compose.yml`
4. **Database**: Configure PostgreSQL connection
5. **Deploy**: Coolify will handle the build and deployment

#### Required Environment Variables for Production

```env
DATABASE_URI=postgresql://user:password@host:port/database
PAYLOAD_SECRET=your-secure-secret-key
PAYLOAD_PUBLIC_SERVER_URL=https://your-domain.com
PAYLOAD_PUBLIC_CMS_URL=https://your-domain.com/admin
```

## 🧪 Testing

The project includes comprehensive testing infrastructure:

### Unit Tests

- **Framework**: Vitest with jsdom environment
- **Coverage**: Tests for all utility functions, API clients, and security middleware
- **Location**: `apps/web/tests/unit/`
- **Run**: `pnpm test:unit`

### End-to-End Tests

- **Framework**: Playwright for cross-browser testing
- **Coverage**: Homepage, pages, and API endpoints
- **Location**: `apps/web/tests/e2e/`
- **Run**: `pnpm test:e2e`

### Test Scripts

- `pnpm test` - Run all tests (unit and E2E)
- `pnpm test:unit` - Run unit tests only
- `pnpm test:e2e` - Run end-to-end tests only
- `pnpm test:ui` - Run Vitest UI for interactive testing
- `pnpm test:coverage` - Run tests with coverage reporting

## 🔧 Development

### Adding New Collections

1. Create collection file in `apps/cms/src/collections/`
2. Import and add to `payload.config.ts`
3. Generate types and API clients: `pnpm generate:types`
4. The automated collection registry will generate TypeScript types, API clients, and route files

### Adding New Routes

1. Create route file in `apps/web/app/routes/` (React Router v7 file-based routing)
2. Routes are automatically generated for CMS collections via the collection registry
3. API clients are auto-generated and available in `apps/web/app/lib/clients/`
4. Use the generated types from `apps/web/app/lib/types/` for type safety

### Shared Components

Add reusable components to `packages/ui/src/` and export from `index.ts`.

### Scripts

- `./scripts/setup.sh` - Complete development setup (prerequisites, env, deps, dev servers)
- `pnpm dev` - Start development servers
- `pnpm build` - Build all applications
- `pnpm start` - Start production servers
- `pnpm typecheck` - Type check all packages
- `pnpm lint` - Lint all packages
- `pnpm test` - Run all tests (unit and E2E)
- `pnpm test:unit` - Run unit tests only
- `pnpm test:e2e` - Run end-to-end tests only
- `pnpm format` - Format code with Prettier
- `pnpm format:check` - Check code formatting
- `pnpm generate:types` - Generate TypeScript types and API clients from CMS collections
- `pnpm setup` - Run development setup via CLI
- `pnpm new:collection` - Create new CMS collection with templates
- `pnpm config` - Show or apply auto-detected configuration
- `pnpm status` - Show development environment status
- `pnpm env:generate` - Generate environment configuration
- `pnpm docker:dev` - Start Docker development environment

## 🎨 Customization

### Styling

The web application uses Tailwind CSS v4. You can:

1. Add custom CSS in the web app
2. Extend the UI package with styled components
3. Replace Tailwind with your preferred CSS framework
4. Customize the Tailwind configuration in `tailwind.config.js`

### CMS Customization

- **Fields**: Add custom fields in `apps/cms/src/fields/`
- **Hooks**: Add collection hooks for custom logic
- **Plugins**: Install and configure Payload plugins
- **Admin UI**: Customize the admin interface

### API Extensions

- Add custom API routes in `apps/cms/src/app/(payload)/api/`
- Extend the web app API in `apps/web/server/`
- Add middleware for authentication, rate limiting, etc.
- Use the auto-generated API clients in `apps/web/app/lib/clients/`

## 🔒 Security

- **Environment Variables**: Never commit `.env` files, use `env.example` as template
- **Payload Secret**: Use a strong, random secret key (32+ characters)
- **Database**: Use strong passwords and restrict access
- **HTTPS**: Always use HTTPS in production
- **CORS**: Configure CORS properly for your domains
- **Rate Limiting**: Built-in rate limiting for API endpoints
- **Security Headers**: Helmet middleware for security headers
- **Input Validation**: Express-validator for request validation
- **File Upload Security**: File type and size validation

## 📊 Performance

### Optimization Tips

- **Images**: Consider adding image optimization
- **Caching**: Implement Redis for API caching
- **CDN**: Use a CDN for static assets
- **Database**: Optimize queries and add indexes

### Monitoring

- Add logging and monitoring
- Set up health checks
- Monitor database performance
- Track API response times

## 🤝 Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for development guidelines.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

## 🆘 Support

- **Documentation**: Check this README and inline code comments
- **Issues**: Create GitHub issues for bugs and feature requests
- **Payload CMS**: [Official Documentation](https://payloadcms.com/docs)
- **React Router**: [Official Documentation](https://reactrouter.com)

## 🔄 Updates

To update dependencies:

```bash
# Update all dependencies
pnpm update

# Update specific packages
pnpm update payload @payloadcms/db-postgres

# Check for outdated packages
pnpm outdated
```
