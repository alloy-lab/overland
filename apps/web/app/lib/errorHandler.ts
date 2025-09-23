import * as Sentry from '@sentry/react';
import pino from 'pino';

// Check if we're in a browser environment
const isBrowser = typeof globalThis !== 'undefined' && 'window' in globalThis;

// Initialize Sentry with Performance monitoring (browser only)
if (isBrowser) {
  const sentryDsn =
    (import.meta as any).env?.VITE_SENTRY_DSN ||
    (import.meta as any).env?.SENTRY_DSN;

  if (sentryDsn) {
    Sentry.init({
      dsn: sentryDsn,
      environment: (import.meta as any).env?.MODE || 'development',
      // Performance monitoring
      tracesSampleRate:
        (import.meta as any).env?.MODE === 'production' ? 0.1 : 1.0,
      // Web Vitals monitoring (automatically enabled with default integrations)
      debug: (import.meta as any).env?.MODE === 'development',
      // Enable performance monitoring
      enableTracing: true,
      // Automatically capture Web Vitals (LCP, CLS, INP, FCP, FID, TTFB)
      // This is enabled by default with the BrowserTracing integration
    });
  }
  // Note: Sentry DSN not provided - performance monitoring disabled
}

// Initialize Pino logger (server only)
const logger = isBrowser
  ? // Browser logger - simple console wrapper
    {
      error: (...args: any[]) => console.error(...args),
      warn: (...args: any[]) => console.warn(...args),
      info: (...args: any[]) => console.info(...args),
      debug: (...args: any[]) => console.debug(...args),
    }
  : // Node.js logger with pino
    pino({
      level: process.env.LOG_LEVEL || 'info',
      transport:
        process.env.NODE_ENV === 'development'
          ? {
              target: 'pino-pretty',
              options: {
                colorize: true,
                translateTime: 'SYS:standard',
                ignore: 'pid,hostname',
              },
            }
          : undefined,
    });

// Custom error classes
export class CustomError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(
    message: string,
    statusCode: number = 500,
    isOperational: boolean = true
  ) {
    super(message);
    this.name = 'CustomError';
    this.statusCode = statusCode;
    this.isOperational = isOperational;

    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends CustomError {
  constructor(message: string = 'Validation failed') {
    super(message, 400);
  }
}

export class NotFoundError extends CustomError {
  constructor(message: string = 'Resource not found') {
    super(message, 404);
  }
}

export class UnauthorizedError extends CustomError {
  constructor(message: string = 'Unauthorized') {
    super(message, 401);
  }
}

export class ForbiddenError extends CustomError {
  constructor(message: string = 'Forbidden') {
    super(message, 403);
  }
}

export class ConflictError extends CustomError {
  constructor(message: string = 'Conflict') {
    super(message, 409);
  }
}

export class TooManyRequestsError extends CustomError {
  constructor(message: string = 'Too many requests') {
    super(message, 429);
  }
}

export class InternalServerError extends CustomError {
  constructor(message: string = 'Internal server error') {
    super(message, 500);
  }
}

// Global error handler
export function handleError(error: Error | CustomError): CustomError {
  let appError: CustomError;

  if (error instanceof CustomError) {
    appError = error;
  } else {
    // Convert unknown errors to internal server errors
    appError = new InternalServerError(error.message);
  }

  // Log the error
  logger.error(
    {
      message: appError.message,
      statusCode: appError.statusCode,
      stack: appError.stack,
      isOperational: appError.isOperational,
    },
    'Error occurred'
  );

  // Send to Sentry (browser only)
  if (isBrowser) {
    Sentry.captureException(appError);
  }

  return appError;
}

// Async error wrapper
export function asyncHandler<T extends any[], R>(
  fn: (...args: T) => Promise<R>
) {
  return (...args: T): Promise<R> => {
    return fn(...args).catch(error => {
      throw handleError(error);
    });
  };
}

// Express error handler (server only)
export function expressErrorHandler(
  error: Error,
  req: any,
  res: any,
  next: any
) {
  const appError = handleError(error);

  // Don't leak error details in production
  const message =
    !isBrowser && process.env.NODE_ENV === 'production'
      ? 'Something went wrong'
      : appError.message;

  res.status(appError.statusCode).json({
    error: message,
    ...(!isBrowser &&
      process.env.NODE_ENV === 'development' && {
        stack: appError.stack,
        details: appError.message,
      }),
  });
}

// Export logger for use throughout the app
export { logger };
