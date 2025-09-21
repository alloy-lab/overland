import type { NextFunction, Request, Response } from 'express';
import { body, param, query, validationResult } from 'express-validator';
import { env } from './envValidation';
import logger from './logger';

// API key validation middleware
export const validateApiKey = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const apiKey = req.get('X-API-Key') || req.query.apiKey;
  const validApiKey = process.env.API_KEY;

  if (!validApiKey) {
    logger.warn('API_KEY not configured in environment');
    return res.status(500).json({
      error: 'API key validation not configured',
    });
  }

  if (!apiKey || apiKey !== validApiKey) {
    logger.warn(`Invalid API key attempt from IP: ${req.ip}`);
    return res.status(401).json({
      error: 'Invalid or missing API key',
    });
  }

  next();
};

// Admin authentication middleware
export const requireAdmin = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // This would integrate with your authentication system
  // For now, we'll use a simple header check
  const adminToken = req.get('X-Admin-Token');
  const validAdminToken = process.env.ADMIN_TOKEN;

  if (!validAdminToken) {
    logger.warn('ADMIN_TOKEN not configured in environment');
    return res.status(500).json({
      error: 'Admin authentication not configured',
    });
  }

  if (!adminToken || adminToken !== validAdminToken) {
    logger.warn(`Unauthorized admin access attempt from IP: ${req.ip}`);
    return res.status(403).json({
      error: 'Admin access required',
    });
  }

  next();
};

// Request logging middleware for API routes
export const apiRequestLogger = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const startTime = Date.now();

  // Log the request
  logger.info('API Request', {
    method: req.method,
    url: req.url,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    timestamp: new Date().toISOString(),
  });

  // Override res.end to log the response
  const originalEnd = res.end;
  res.end = function (chunk?: any, encoding?: any) {
    const duration = Date.now() - startTime;

    logger.info('API Response', {
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
    });

    return originalEnd.call(this, chunk, encoding);
  };

  next();
};

// API validation rules
export const apiValidationRules = {
  // Page creation/update
  createPage: [
    body('title')
      .trim()
      .isLength({ min: 1, max: 200 })
      .withMessage('Title must be between 1 and 200 characters'),
    body('content')
      .trim()
      .isLength({ min: 1 })
      .withMessage('Content is required'),
    body('slug')
      .optional()
      .matches(/^[a-z0-9-]+$/)
      .withMessage(
        'Slug can only contain lowercase letters, numbers, and hyphens'
      ),
    body('status')
      .optional()
      .isIn(['draft', 'published'])
      .withMessage('Status must be either draft or published'),
  ],

  // Page update
  updatePage: [
    param('id').isMongoId().withMessage('Invalid page ID'),
    body('title')
      .optional()
      .trim()
      .isLength({ min: 1, max: 200 })
      .withMessage('Title must be between 1 and 200 characters'),
    body('content')
      .optional()
      .trim()
      .isLength({ min: 1 })
      .withMessage('Content cannot be empty'),
    body('status')
      .optional()
      .isIn(['draft', 'published'])
      .withMessage('Status must be either draft or published'),
  ],

  // Page deletion
  deletePage: [param('id').isMongoId().withMessage('Invalid page ID')],

  // Media upload
  uploadMedia: [
    body('alt')
      .optional()
      .trim()
      .isLength({ max: 200 })
      .withMessage('Alt text must be less than 200 characters'),
    body('caption')
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage('Caption must be less than 500 characters'),
  ],

  // Site settings update
  updateSiteSettings: [
    body('title')
      .optional()
      .trim()
      .isLength({ min: 1, max: 100 })
      .withMessage('Site title must be between 1 and 100 characters'),
    body('description')
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage('Site description must be less than 500 characters'),
    body('contact.email')
      .optional()
      .isEmail()
      .withMessage('Contact email must be valid'),
  ],

  // Pagination
  pagination: [
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Page must be a positive integer'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limit must be between 1 and 100'),
    query('sort')
      .optional()
      .isIn([
        'title',
        'createdAt',
        'updatedAt',
        '-title',
        '-createdAt',
        '-updatedAt',
      ])
      .withMessage('Invalid sort field'),
  ],

  // Search
  search: [
    query('q')
      .trim()
      .isLength({ min: 1, max: 100 })
      .withMessage('Search query must be between 1 and 100 characters'),
    query('type')
      .optional()
      .isIn(['pages', 'media', 'all'])
      .withMessage('Search type must be pages, media, or all'),
  ],
};

// Validation middleware
export const validateApiRequest = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    logger.warn('API validation failed', {
      errors: errors.array(),
      ip: req.ip,
      url: req.url,
      method: req.method,
    });

    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array().map(err => ({
        field: err.type === 'field' ? err.path : 'unknown',
        message: err.msg,
        value: (err as any).value,
      })),
    });
  }
  next();
};

// File upload security middleware
export const validateFileUpload = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const reqWithFiles = req as Request & { file?: any; files?: any };

  if (!reqWithFiles.file && !reqWithFiles.files) {
    return res.status(400).json({
      error: 'No file uploaded',
    });
  }

  const file = reqWithFiles.file || reqWithFiles.files?.[0];
  if (!file) {
    return res.status(400).json({
      error: 'No file uploaded',
    });
  }

  // Check file size
  const maxSize = 10 * 1024 * 1024; // 10MB
  if (file.size > maxSize) {
    logger.warn(`File too large: ${file.size} bytes from IP: ${req.ip}`);
    return res.status(413).json({
      error: 'File too large. Maximum size is 10MB.',
    });
  }

  // Check file type
  const allowedTypes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf',
    'text/plain',
  ];

  if (!allowedTypes.includes(file.mimetype)) {
    logger.warn(`Invalid file type: ${file.mimetype} from IP: ${req.ip}`);
    return res.status(400).json({
      error: 'Invalid file type. Allowed types: JPEG, PNG, GIF, WebP, PDF, TXT',
    });
  }

  // Check for malicious file extensions
  const maliciousExtensions = [
    '.exe',
    '.bat',
    '.cmd',
    '.scr',
    '.pif',
    '.vbs',
    '.js',
  ];
  const fileExtension = file.originalname
    .toLowerCase()
    .substring(file.originalname.lastIndexOf('.'));

  if (maliciousExtensions.includes(fileExtension)) {
    logger.warn(
      `Malicious file extension blocked: ${fileExtension} from IP: ${req.ip}`
    );
    return res.status(400).json({
      error: 'File type not allowed',
    });
  }

  next();
};

// Rate limiting for specific API endpoints
export const createApiRateLimit = (
  windowMs: number,
  max: number,
  message: string
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // This would integrate with your rate limiting system
    // For now, we'll use a simple in-memory store
    const key = `rate_limit_${req.ip}_${req.path}`;
    const now = Date.now();
    const windowStart = now - windowMs;

    // In a real implementation, you'd use Redis or a proper rate limiting library
    // This is just a placeholder
    next();
  };
};

// API response formatting middleware
export const formatApiResponse = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const originalJson = res.json;

  res.json = function (body: any) {
    // Add security headers to API responses
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');

    // Format the response
    const formattedResponse = {
      success: res.statusCode >= 200 && res.statusCode < 300,
      status: res.statusCode,
      data: body,
      timestamp: new Date().toISOString(),
      ...(env.NODE_ENV === 'development' && {
        requestId: req.get('X-Request-ID'),
      }),
    };

    return originalJson.call(this, formattedResponse);
  };

  next();
};
