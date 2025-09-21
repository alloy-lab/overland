import * as Sentry from '@sentry/nextjs';
import pino from 'pino';

// Initialize Sentry
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  debug: process.env.NODE_ENV === 'development',
});

// Initialize Pino logger
const logger = pino({
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

  // Log the error with Pino
  logger.error(
    {
      message: appError.message,
      statusCode: appError.statusCode,
      stack: appError.stack,
      isOperational: appError.isOperational,
    },
    'Error occurred'
  );

  // Send to Sentry
  Sentry.captureException(appError);

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

// Express error handler
export function expressErrorHandler(
  error: Error,
  req: any,
  res: any,
  next: any
) {
  const appError = handleError(error);

  // Don't leak error details in production
  const message =
    process.env.NODE_ENV === 'production'
      ? 'Something went wrong'
      : appError.message;

  res.status(appError.statusCode).json({
    error: message,
    ...(process.env.NODE_ENV === 'development' && {
      stack: appError.stack,
      details: appError.message,
    }),
  });
}

// Export logger for use throughout the app
export { logger };
