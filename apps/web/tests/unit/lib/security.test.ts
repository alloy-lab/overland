import { NextFunction, Request, Response } from 'express';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock environment variables before importing security module
vi.mock('~/lib/envValidation', () => ({
  env: {
    NODE_ENV: 'test',
    ENABLE_CORS: true,
    ENABLE_RATE_LIMITING: true,
    ENABLE_CSRF: true,
    ALLOWED_ORIGIN_1: 'http://localhost:3000',
    ALLOWED_ORIGIN_2: 'http://localhost:3001',
  },
}));

// Mock the security package's validateEnv function to prevent process.exit
vi.mock('@alloylab/security', async () => {
  const actual = await vi.importActual('@alloylab/security');
  return {
    ...actual,
    validateEnv: vi.fn(() => ({
      NODE_ENV: 'test',
      ENABLE_CORS: true,
      ENABLE_RATE_LIMITING: true,
      ENABLE_CSRF: true,
      ALLOWED_ORIGIN_1: 'http://localhost:3000',
      ALLOWED_ORIGIN_2: 'http://localhost:3001',
      MAX_FILE_SIZE: '10MB',
      ALLOWED_FILE_TYPES: 'image/jpeg,image/png,image/gif,image/webp',
    })),
  };
});

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
    it('should have corsOptions configured', () => {
      expect(corsOptions).toBeDefined();
      expect(corsOptions.origin).toBeDefined();
      expect(corsOptions.credentials).toBe(true);
    });
  });

  describe('Rate Limiting', () => {
    it('should have rate limit config configured', () => {
      expect(rateLimitConfig).toBeDefined();
      expect(rateLimitConfig.general).toBeDefined();
      expect(rateLimitConfig.auth).toBeDefined();
      expect(rateLimitConfig.passwordReset).toBeDefined();
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
    it('should have sanitizeRequest function defined', () => {
      expect(sanitizeRequest).toBeDefined();
      expect(typeof sanitizeRequest).toBe('function');
    });

    it('should call next() without modifying request', () => {
      const originalBody = {
        content: '<script>alert("xss")</script>Hello World',
      };
      mockReq.body = originalBody;

      sanitizeRequest(mockReq as Request, mockRes as Response, mockNext);

      // Legacy implementation doesn't sanitize, just calls next()
      expect(mockReq.body).toBe(originalBody);
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
    it('should have validateRequest function defined', () => {
      expect(validateRequest).toBeDefined();
      expect(typeof validateRequest).toBe('function');
    });
  });
});
