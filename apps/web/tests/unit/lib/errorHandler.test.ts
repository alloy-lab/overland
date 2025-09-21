import { describe, it, expect, vi } from 'vitest';
import {
  CustomError,
  ValidationError,
  NotFoundError,
  UnauthorizedError,
  ForbiddenError,
  ConflictError,
  TooManyRequestsError,
  InternalServerError,
  handleError,
  asyncHandler,
} from '~/lib/errorHandler';

describe('Error Handler', () => {
  describe('CustomError', () => {
    it('should create a custom error with default values', () => {
      const error = new CustomError('Test error');
      expect(error.message).toBe('Test error');
      expect(error.statusCode).toBe(500);
      expect(error.isOperational).toBe(true);
      expect(error.name).toBe('CustomError');
    });

    it('should create a custom error with custom values', () => {
      const error = new CustomError('Test error', 400, false);
      expect(error.message).toBe('Test error');
      expect(error.statusCode).toBe(400);
      expect(error.isOperational).toBe(false);
    });
  });

  describe('Specific Error Types', () => {
    it('should create ValidationError with 400 status', () => {
      const error = new ValidationError('Invalid input');
      expect(error.statusCode).toBe(400);
      expect(error.message).toBe('Invalid input');
    });

    it('should create NotFoundError with 404 status', () => {
      const error = new NotFoundError();
      expect(error.statusCode).toBe(404);
      expect(error.message).toBe('Resource not found');
    });

    it('should create UnauthorizedError with 401 status', () => {
      const error = new UnauthorizedError();
      expect(error.statusCode).toBe(401);
      expect(error.message).toBe('Unauthorized');
    });

    it('should create ForbiddenError with 403 status', () => {
      const error = new ForbiddenError();
      expect(error.statusCode).toBe(403);
      expect(error.message).toBe('Forbidden');
    });

    it('should create ConflictError with 409 status', () => {
      const error = new ConflictError();
      expect(error.statusCode).toBe(409);
      expect(error.message).toBe('Conflict');
    });

    it('should create TooManyRequestsError with 429 status', () => {
      const error = new TooManyRequestsError();
      expect(error.statusCode).toBe(429);
      expect(error.message).toBe('Too many requests');
    });

    it('should create InternalServerError with 500 status', () => {
      const error = new InternalServerError();
      expect(error.statusCode).toBe(500);
      expect(error.message).toBe('Internal server error');
    });
  });

  describe('handleError', () => {
    it('should handle CustomError instances', () => {
      const customError = new ValidationError('Test validation error');
      const result = handleError(customError);
      expect(result).toBe(customError);
      expect(result.statusCode).toBe(400);
    });

    it('should convert regular Error to InternalServerError', () => {
      const regularError = new Error('Regular error');
      const result = handleError(regularError);
      expect(result.statusCode).toBe(500);
      expect(result.message).toBe('Regular error');
      expect(result.isOperational).toBe(true);
    });
  });

  describe('asyncHandler', () => {
    it('should handle successful async operations', async () => {
      const asyncFn = async (value: number) => value * 2;
      const wrappedFn = asyncHandler(asyncFn);
      const result = await wrappedFn(5);
      expect(result).toBe(10);
    });

    it('should handle async errors', async () => {
      const asyncFn = async () => {
        throw new Error('Async error');
      };
      const wrappedFn = asyncHandler(asyncFn);

      try {
        await wrappedFn();
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error.statusCode).toBe(500);
        expect(error.message).toBe('Async error');
      }
    });

    it('should preserve CustomError instances', async () => {
      const asyncFn = async () => {
        throw new ValidationError('Validation failed');
      };
      const wrappedFn = asyncHandler(asyncFn);

      try {
        await wrappedFn();
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error.statusCode).toBe(400);
        expect(error.message).toBe('Validation failed');
      }
    });
  });
});
