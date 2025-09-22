import compression from 'compression';
import express from 'express';
import morgan from 'morgan';

// Short-circuit the type-checking of the built output.
const BUILD_PATH = './build/server/index.js';
const DEVELOPMENT = process.env.NODE_ENV === 'development';
const PORT = Number.parseInt(process.env.PORT || '3000');

const app = express();

if (DEVELOPMENT) {
  // Import development dependencies
  const { env } = await import('./app/lib/envValidation.js');
  const { expressErrorHandler } = await import('./app/lib/errorHandler.js');
  const logger = (await import('./app/lib/logger.js')).default;
  const {
    apiSecurity,
    authSecurity,
    formSecurity,
    requestSizeLimit,
    staticSecurity,
  } = await import('./app/lib/security.js');

  // Trust proxy for accurate IP addresses
  app.set('trust proxy', 1);

  // Security middleware
  app.disable('x-powered-by');
  app.use(compression());
  app.use(requestSizeLimit('10MB'));

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

  // API routes with security middleware
  app.use('/api', apiSecurity);
  app.use('/api/auth', authSecurity);
  app.use('/api/forms', formSecurity);

  // Global error handler (must be last)
  app.use(expressErrorHandler);
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
