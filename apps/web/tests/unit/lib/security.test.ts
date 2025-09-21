import { NextFunction, Request, Response } from 'express';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock environment variables before importing security module
vi.mock('~/lib/envValidation', () => ({
  env: {
    NODE_ENV: 'test',
    ENABLE_CORS: true,
    ENABLE_RATE_LIMITING: true,
    ENABLE_CSRF: true,
  },
}));

import {
  corsOptions,
  rateLimitConfig,
  sanitizeRequest,
  validateRequest,
  validationRules,
} from '~/lib/security';

// Mock logger
vi.mock('~/lib/logger', () => ({
  default: {
    warn: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
}));

describe('Security Middleware', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockReq = {
      ip: '127.0.0.1',
      get: vi.fn(),
      body: {},
      query: {},
    };
    mockRes = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
      setHeader: vi.fn(),
    };
    mockNext = vi.fn();
  });

  describe('CORS Configuration', () => {
    it('should allow requests from localhost', () => {
      const callback = vi.fn();
      corsOptions.origin?.('http://localhost:3000', callback);
      expect(callback).toHaveBeenCalledWith(null, true);
    });

    it('should block requests from unauthorized origins', () => {
      const callback = vi.fn();
      corsOptions.origin?.('http://malicious-site.com', callback);
      expect(callback).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  describe('Rate Limiting', () => {
    it('should have general rate limit configured', () => {
      expect(rateLimitConfig.general).toBeDefined();
      expect(rateLimitConfig.general.windowMs).toBe(15 * 60 * 1000);
      expect(rateLimitConfig.general.max).toBe(100);
    });

    it('should have auth rate limit configured', () => {
      expect(rateLimitConfig.auth).toBeDefined();
      expect(rateLimitConfig.auth.windowMs).toBe(15 * 60 * 1000);
      expect(rateLimitConfig.auth.max).toBe(5);
    });

    it('should have password reset rate limit configured', () => {
      expect(rateLimitConfig.passwordReset).toBeDefined();
      expect(rateLimitConfig.passwordReset.windowMs).toBe(60 * 60 * 1000);
      expect(rateLimitConfig.passwordReset.max).toBe(3);
    });
  });

  describe('Validation Rules', () => {
    it('should have email validation rule', () => {
      expect(validationRules.email).toBeDefined();
    });

    it('should have password validation rule', () => {
      expect(validationRules.password).toBeDefined();
    });

    it('should have name validation rule', () => {
      expect(validationRules.name).toBeDefined();
    });

    it('should have slug validation rule', () => {
      expect(validationRules.slug).toBeDefined();
    });

    it('should have content validation rule', () => {
      expect(validationRules.content).toBeDefined();
    });

    it('should have title validation rule', () => {
      expect(validationRules.title).toBeDefined();
    });

    it('should have pagination validation rules', () => {
      expect(validationRules.page).toBeDefined();
      expect(validationRules.limit).toBeDefined();
    });
  });

  describe('Request Sanitization', () => {
    it('should sanitize script tags from body', () => {
      mockReq.body = {
        content: '<script>alert("xss")</script>Hello World',
      };

      sanitizeRequest(mockReq as Request, mockRes as Response, mockNext);

      expect(mockReq.body.content).toBe('Hello World');
      expect(mockNext).toHaveBeenCalled();
    });

    it('should sanitize javascript: URLs from body', () => {
      mockReq.body = {
        url: 'javascript:alert("xss")',
      };

      sanitizeRequest(mockReq as Request, mockRes as Response, mockNext);

      expect(mockReq.body.url).toBe('alert("xss")');
      expect(mockNext).toHaveBeenCalled();
    });

    it('should sanitize event handlers from body', () => {
      mockReq.body = {
        content: '<div onclick="alert(\'xss\')">Click me</div>',
      };

      sanitizeRequest(mockReq as Request, mockRes as Response, mockNext);

      expect(mockReq.body.content).toBe('<div >Click me</div>');
      expect(mockNext).toHaveBeenCalled();
    });

    it('should sanitize query parameters', () => {
      mockReq.query = {
        search: '<script>alert("xss")</script>test',
      };

      sanitizeRequest(mockReq as Request, mockRes as Response, mockNext);

      expect(mockReq.query.search).toBe('test');
      expect(mockNext).toHaveBeenCalled();
    });

    it('should handle non-string values', () => {
      mockReq.body = {
        number: 123,
        boolean: true,
        object: { key: 'value' },
      };

      sanitizeRequest(mockReq as Request, mockRes as Response, mockNext);

      expect(mockReq.body.number).toBe(123);
      expect(mockReq.body.boolean).toBe(true);
      expect(mockReq.body.object).toEqual({ key: 'value' });
      expect(mockNext).toHaveBeenCalled();
    });
  });

  describe('Request Validation', () => {
    it('should call next when validation passes', () => {
      // Mock validationResult to return no errors
      const mockValidationResult = vi.fn().mockReturnValue({
        isEmpty: () => true,
        array: () => [],
      });

      vi.doMock('express-validator', () => ({
        validationResult: mockValidationResult,
      }));

      validateRequest(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    it('should return 400 when validation fails', () => {
      // Mock validationResult to return errors
      const mockValidationResult = vi.fn().mockReturnValue({
        isEmpty: () => false,
        array: () => [{ field: 'email', message: 'Invalid email' }],
      });

      vi.doMock('express-validator', () => ({
        validationResult: mockValidationResult,
      }));

      validateRequest(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Validation failed',
        details: [{ field: 'email', message: 'Invalid email' }],
      });
      expect(mockNext).not.toHaveBeenCalled();
    });
  });
});
