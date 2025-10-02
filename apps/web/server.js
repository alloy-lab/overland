import express from 'express';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

// Load environment variables from root .env file in development only
if (process.env.NODE_ENV === 'development') {
  const { config } = await import('dotenv');
  const { resolve } = await import('path');

  // Try to load .env from root directory (when running from apps/web)
  const rootEnvPath = resolve(process.cwd(), '../../.env');
  const result = config({ path: rootEnvPath });

  // If root .env not found, try current directory as fallback
  if (!result.parsed) {
    config({ path: resolve(process.cwd(), '.env') });
  }
}

// Short-circuit the type-checking of the built output.
const BUILD_PATH = './build/server/index.js';
const DEVELOPMENT = process.env.NODE_ENV === 'development';
const PORT = Number.parseInt(process.env.PORT || '3000');

const app = express();

// Get the directory name for static file serving
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Serve static assets from build/client in production
if (!DEVELOPMENT) {
  app.use(express.static(join(__dirname, 'build/client')));
}

if (DEVELOPMENT) {
  // In development, use Vite dev server
  console.log('Starting development server with Vite...');
  const { createServer } = await import('vite');

  const viteDevServer = await createServer({
    server: { middlewareMode: true },
  });

  app.use(viteDevServer.middlewares);

  // Handle SSR
  app.use(async (req, res, next) => {
    try {
      const source = await viteDevServer.ssrLoadModule('./server/app.ts');
      return await source.app(req, res, next);
    } catch (error) {
      if (typeof error === 'object' && error instanceof Error) {
        viteDevServer.ssrFixStacktrace(error);
      }
      next(error);
    }
  });
} else {
  // In production, use the built server directly
  const builtServer = await import(BUILD_PATH);
  app.use(builtServer.app);
}

// Handle uncaught exceptions
process.on('uncaughtException', error => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
