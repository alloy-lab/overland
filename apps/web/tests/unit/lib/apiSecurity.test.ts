import { NextFunction, Request, Response } from 'express';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock environment variables before importing apiSecurity module
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

import {
  apiRequestLogger,
  formatApiResponse,
  requireAdmin,
  validateApiKey,
  validateFileUpload,
} from '~/lib/apiSecurity';

// Mock logger
vi.mock('~/lib/logger', () => ({
  default: {
    warn: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
}));

describe('API Security Middleware', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockReq = {
      ip: '127.0.0.1',
      get: vi.fn(),
      url: '/api/test',
      method: 'GET',
      query: {},
    };
    mockRes = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
      setHeader: vi.fn(),
      end: vi.fn(),
    };
    mockNext = vi.fn();

    // Reset environment variables
    delete process.env.API_KEY;
    delete process.env.ADMIN_TOKEN;
  });

  describe('API Key Validation', () => {
    it('should reject requests without API key', () => {
      process.env.API_KEY = 'test-api-key';
      mockReq.get = vi.fn().mockReturnValue(undefined);

      validateApiKey(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Invalid or missing API key',
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should reject requests with invalid API key', () => {
      process.env.API_KEY = 'test-api-key';
      mockReq.get = vi.fn().mockReturnValue('invalid-key');

      validateApiKey(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Invalid or missing API key',
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should accept requests with valid API key in header', () => {
      process.env.API_KEY = 'test-api-key';
      mockReq.get = vi.fn().mockImplementation(header => {
        if (header === 'X-API-Key') return 'test-api-key';
        return undefined;
      });

      validateApiKey(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    it('should accept requests with valid API key in query', () => {
      process.env.API_KEY = 'test-api-key';
      mockReq.query = { apiKey: 'test-api-key' };
      mockReq.get = vi.fn().mockReturnValue(undefined);

      validateApiKey(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    it('should return 500 when API_KEY not configured', () => {
      validateApiKey(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'API key validation not configured',
      });
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe('Admin Authentication', () => {
    it('should reject requests without admin token', () => {
      process.env.ADMIN_TOKEN = 'test-admin-token';
      mockReq.get = vi.fn().mockReturnValue(undefined);

      requireAdmin(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Admin access required',
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should reject requests with invalid admin token', () => {
      process.env.ADMIN_TOKEN = 'test-admin-token';
      mockReq.get = vi.fn().mockReturnValue('invalid-token');

      requireAdmin(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Admin access required',
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should accept requests with valid admin token', () => {
      process.env.ADMIN_TOKEN = 'test-admin-token';
      mockReq.get = vi.fn().mockImplementation(header => {
        if (header === 'X-Admin-Token') return 'test-admin-token';
        return undefined;
      });

      requireAdmin(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    it('should return 500 when ADMIN_TOKEN not configured', () => {
      requireAdmin(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Admin authentication not configured',
      });
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe('API Request Logger', () => {
    it('should have apiRequestLogger function defined', () => {
      expect(apiRequestLogger).toBeDefined();
      expect(typeof apiRequestLogger).toBe('function');
    });
  });

  describe('File Upload Validation', () => {
    it('should reject requests without file', () => {
      validateFileUpload(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'No file uploaded',
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should reject files that are too large', () => {
      mockReq.file = {
        size: 15 * 1024 * 1024, // 15MB
        mimetype: 'image/jpeg',
        originalname: 'test.jpg',
      } as any;

      validateFileUpload(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(413);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'File too large. Maximum size is 10MB.',
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should reject files with invalid MIME types', () => {
      mockReq.file = {
        size: 1024,
        mimetype: 'application/executable',
        originalname: 'test.exe',
      } as any;

      validateFileUpload(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        error:
          'Invalid file type. Allowed types: image/jpeg, image/png, image/gif, image/webp, application/pdf, text/plain',
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should reject files with malicious extensions', () => {
      mockReq.file = {
        size: 1024,
        mimetype: 'image/jpeg',
        originalname: 'test.exe',
      } as any;

      validateFileUpload(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'File type not allowed',
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should accept valid files', () => {
      mockReq.file = {
        size: 1024,
        mimetype: 'image/jpeg',
        originalname: 'test.jpg',
      } as any;

      validateFileUpload(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });
  });

  describe('API Response Formatting', () => {
    it('should format successful responses', () => {
      const mockJson = vi.fn().mockReturnValue(mockRes);
      mockRes.json = mockJson;

      formatApiResponse(mockReq as Request, mockRes as Response, mockNext);

      // Simulate a successful response
      (mockRes as any).statusCode = 200;
      mockRes.json({ data: 'test' });

      expect(mockRes.setHeader).toHaveBeenCalledWith(
        'X-Content-Type-Options',
        'nosniff'
      );
      expect(mockRes.setHeader).toHaveBeenCalledWith('X-Frame-Options', 'DENY');
      expect(mockRes.setHeader).toHaveBeenCalledWith(
        'X-XSS-Protection',
        '1; mode=block'
      );

      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        status: 200,
        data: { data: 'test' },
        timestamp: expect.any(String),
      });

      expect(mockNext).toHaveBeenCalled();
    });

    it('should format error responses', () => {
      const mockJson = vi.fn().mockReturnValue(mockRes);
      mockRes.json = mockJson;

      formatApiResponse(mockReq as Request, mockRes as Response, mockNext);

      // Simulate an error response
      (mockRes as any).statusCode = 400;
      mockRes.json({ error: 'Bad request' });

      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        status: 400,
        data: { error: 'Bad request' },
        timestamp: expect.any(String),
      });
    });
  });
});
