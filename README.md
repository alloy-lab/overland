<div align="center">
  <img src="./apps/web/public/overland_banner.png" alt="the Overland Stack" width="100%">
</div>

A production-ready template that pairs React Router SSR (Vite) with Payload CMS on Postgres, packaged as a monorepo with pnpm and Docker Compose for local development and Coolify deployment.

## 🚀 Features

- **Frontend**: React 19 with React Router v7 and Vite SSR
- **CMS**: Payload CMS v3 with PostgreSQL 17
- **Authentication**: Payload built-in auth for CMS (public site is read-only)
- **Data Flow**: Web app reads from Payload REST API with draft support
- **Images**: Local disk storage (easily extensible to S3/R2)
- **Deployment**: Docker containers optimized for Coolify on Hetzner
- **Monorepo**: pnpm workspaces
- **TypeScript**: Full TypeScript support across all packages

## 📁 Project Structure

```
overland-stack/
├── apps/
│   ├── cms/                 # Payload CMS application
│   │   ├── src/
│   │   │   ├── collections/ # Content collections
│   │   │   ├── globals/    # Global settings
│   │   │   ├── fields/     # Reusable field configurations
│   │   │   └── utils/      # Utility functions
│   │   └── Dockerfile
│   └── web/                 # React Router SSR application
│       ├── src/
│       │   ├── routes/     # React Router routes
│       │   └── lib/        # Utilities and API client
│       └── Dockerfile
├── packages/
│   └── ui/                  # Shared UI components
├── scripts/                 # Development and build scripts
├── docker-compose.yml       # Production deployment
├── docker-compose.dev.yml   # Development environment
├── pnpm-workspace.yaml     # pnpm workspace configuration
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

- **Posts**: Blog posts with rich text content, tags, and SEO
- **Books**: Book catalog with chapters and metadata
- **Chapters**: Individual book chapters with rich text
- **Tags**: Categorization system for posts
- **Users**: CMS administrators and editors

### Global Settings

- **Site**: Site-wide configuration, social links, contact info

### Content Features

- **Rich Text**: Lexical editor for content creation
- **SEO**: Built-in SEO fields for all content types
- **Drafts**: Draft/published workflow
- **Media**: File uploads with local storage
- **Relationships**: Content relationships (posts to tags, books to chapters)

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

## 🔧 Development

### Adding New Collections

1. Create collection file in `apps/cms/src/collections/`
2. Import and add to `payload.config.ts`
3. Generate types: `pnpm generate:types --filter=cms`

### Adding New Routes

1. Create route file in `apps/web/src/routes/`
2. Add route to `apps/web/src/routes/index.ts`
3. Update API client if needed

### Shared Components

Add reusable components to `packages/ui/src/` and export from `index.ts`.

### Scripts

- `./scripts/setup.sh` - Complete development setup (prerequisites, env, deps, dev servers)
- `pnpm dev` - Start development servers
- `pnpm build` - Build all applications
- `pnpm start` - Start production servers
- `pnpm typecheck` - Type check all packages
- `pnpm lint` - Lint all packages

## 🎨 Customization

### Styling

The web application uses Tailwind CSS classes. You can:

1. Add custom CSS in the web app
2. Extend the UI package with styled components
3. Replace Tailwind with your preferred CSS framework

### CMS Customization

- **Fields**: Add custom fields in `apps/cms/src/fields/`
- **Hooks**: Add collection hooks for custom logic
- **Plugins**: Install and configure Payload plugins
- **Admin UI**: Customize the admin interface

### API Extensions

- Add custom API routes in `apps/cms/src/server.ts`
- Extend the web app API in `apps/web/src/server.ts`
- Add middleware for authentication, rate limiting, etc.

## 🔒 Security

- **Environment Variables**: Never commit `.env` files
- **Payload Secret**: Use a strong, random secret key
- **Database**: Use strong passwords and restrict access
- **HTTPS**: Always use HTTPS in production
- **CORS**: Configure CORS properly for your domains

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

## 📈 Roadmap

- [ ] Add image optimization
- [ ] Implement Redis caching
- [ ] Add search functionality
- [ ] Create admin dashboard
- [ ] Add email notifications
- [ ] Implement user comments
- [ ] Add analytics integration
- [ ] Create mobile app
