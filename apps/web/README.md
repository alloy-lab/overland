# Web App

React Router v7 SSR application for the Overland Stack.

## Features

- Server-side rendering
- TypeScript
- Tailwind CSS v4
- Auto-generated API clients from CMS
- Vitest and Playwright testing

## Development

```bash
# Start development server
pnpm dev

# Access application
http://localhost:3000
```

## Building

```bash
# Production build
pnpm build

# Start production server
pnpm start
```

## Project Structure

```
app/
├── routes/          # React Router v7 file-based routes
├── lib/            # Utilities and auto-generated clients
│   ├── clients/    # API clients from CMS collections
│   └── types/      # TypeScript types from CMS
└── welcome/        # Welcome page components
```

## Testing

```bash
# Unit tests
pnpm test:unit

# E2E tests
pnpm test:e2e
```

## Styling

Uses Tailwind CSS v4. Customize in `tailwind.config.js` or replace with your preferred framework.
