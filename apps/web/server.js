import compression from 'compression';
import express from 'express';
import morgan from 'morgan';

import { env } from './app/lib/envValidation.js';
import { expressErrorHandler } from './app/lib/errorHandler.js';
import logger from './app/lib/logger.js';
import {
  apiSecurity,
  authSecurity,
  formSecurity,
  requestSizeLimit,
  staticSecurity,
} from './app/lib/security.js';

// Short-circuit the type-checking of the built output.
const BUILD_PATH = './build/server/index.js';
const DEVELOPMENT = process.env.NODE_ENV === 'development';
const PORT = Number.parseInt(process.env.PORT || '3000');

const app = express();

// Trust proxy for accurate IP addresses
app.set('trust proxy', 1);

// Security middleware
app.disable('x-powered-by');
app.use(compression());
app.use(requestSizeLimit('10MB'));

// Performance monitoring is now handled by Vercel Analytics and Web Vitals

// Apply security middleware based on environment
if (env.ENABLE_CORS) {
  app.use(apiSecurity);
}

// Static file security
app.use(staticSecurity);

// Request logging
app.use(
  morgan('combined', {
    stream: {
      write: message => logger.info(message.trim()),
    },
  })
);

if (DEVELOPMENT) {
  logger.info('Starting development server');
  const viteDevServer = await import('vite').then(vite =>
    vite.createServer({
      server: { middlewareMode: true },
    })
  );
  app.use(viteDevServer.middlewares);
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
  logger.info('Starting production server');
  app.use(
    '/assets',
    express.static('build/client/assets', { immutable: true, maxAge: '1y' })
  );
  app.use(express.static('build/client', { maxAge: '1h' }));
  app.use(await import(BUILD_PATH).then(mod => mod.app));
}

// API routes with security middleware
app.use('/api', apiSecurity);
app.use('/api/auth', authSecurity);
app.use('/api/forms', formSecurity);

// Global error handler (must be last)
app.use(expressErrorHandler);

// Handle uncaught exceptions
process.on('uncaughtException', error => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

app.listen(PORT, () => {
  logger.info(`Server is running on http://localhost:${PORT}`);
});
