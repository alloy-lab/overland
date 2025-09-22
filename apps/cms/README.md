# CMS App

Payload CMS application for the Overland Stack.

## Features

- PostgreSQL database
- Local file storage
- Collections: Pages, Users, Media
- Rich text editor (Lexical)
- SEO fields
- Draft/published workflow

## Development

```bash
# Start development server
pnpm dev

# Access admin panel
http://localhost:3001/admin
```

## Collections

- **Pages**: Static content with rich text and SEO
- **Users**: CMS administrators and editors
- **Media**: File uploads with local storage

## Configuration

Edit `src/payload.config.ts` to customize collections and settings.
