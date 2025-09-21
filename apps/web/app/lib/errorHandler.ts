import logger from './logger';

export interface AppError extends Error {
  statusCode: number;
  isOperational: boolean;
}

export class CustomError extends Error implements AppError {
  public statusCode: number;
  public isOperational: boolean;
  public name: string;

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
  constructor(message: string) {
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
export function handleError(error: Error | AppError): AppError {
  let appError: AppError;

  if (error instanceof CustomError) {
    appError = error;
  } else {
    // Convert unknown errors to internal server errors
    appError = new InternalServerError(error.message);
  }

  // Log the error
  logger.error('Error occurred:', {
    message: appError.message,
    statusCode: appError.statusCode,
    stack: appError.stack,
    isOperational: appError.isOperational,
  });

  return appError;
}

// Async error wrapper
export function asyncHandler<T extends any[], R>(
  fn: (...args: T) => Promise<R>
) {
  return (...args: T): Promise<R> => {
    return Promise.resolve(fn(...args)).catch(error => {
      throw handleError(error);
    });
  };
}

// Express error handler middleware
export function expressErrorHandler(
  error: Error | AppError,
  req: any,
  res: any,
  next: any
) {
  const appError = handleError(error);

  // Don't leak error details in production
  const isDevelopment = process.env.NODE_ENV === 'development';

  res.status(appError.statusCode ?? 500).json({
    error: {
      message: appError.message,
      statusCode: appError.statusCode,
      ...(isDevelopment && { stack: appError.stack }),
    },
  });
}

// React Router error handler
export function reactRouterErrorHandler(error: Error | AppError) {
  const appError = handleError(error);

  // You can customize this based on your needs
  // For example, redirect to error pages based on status code
  if (appError.statusCode === 404) {
    throw new Response(null, { status: 404 });
  } else if (appError.statusCode >= 500) {
    throw new Response(null, { status: 500 });
  }

  throw appError;
}
