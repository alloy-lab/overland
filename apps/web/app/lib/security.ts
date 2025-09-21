import cors from 'cors';
import csrf from 'csurf';
import type { NextFunction, Request, Response } from 'express';
import rateLimit from 'express-rate-limit';
import { body, param, query, validationResult } from 'express-validator';
import helmet from 'helmet';
import logger from './logger';

// CORS configuration
export const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);

    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:3001',
      'https://localhost:3000',
      'https://localhost:3001',
      // Add production domains here
      process.env.ALLOWED_ORIGIN_1,
      process.env.ALLOWED_ORIGIN_2,
    ].filter(Boolean);

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      logger.warn(`CORS blocked request from origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Origin',
    'X-Requested-With',
    'Content-Type',
    'Accept',
    'Authorization',
    'X-CSRF-Token',
  ],
  exposedHeaders: ['X-CSRF-Token'],
};

// Rate limiting configurations
export const rateLimitConfig = {
  // General API rate limit
  general: rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: {
      error: 'Too many requests from this IP, please try again later.',
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      logger.warn(`Rate limit exceeded for IP: ${req.ip}`);
      res.status(429).json({
        error: 'Too many requests from this IP, please try again later.',
      });
    },
  }),

  // Strict rate limit for auth endpoints
  auth: rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Limit each IP to 5 requests per windowMs
    message: {
      error: 'Too many authentication attempts, please try again later.',
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      logger.warn(`Auth rate limit exceeded for IP: ${req.ip}`);
      res.status(429).json({
        error: 'Too many authentication attempts, please try again later.',
      });
    },
  }),

  // Strict rate limit for password reset
  passwordReset: rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3, // Limit each IP to 3 password reset attempts per hour
    message: {
      error: 'Too many password reset attempts, please try again later.',
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      logger.warn(`Password reset rate limit exceeded for IP: ${req.ip}`);
      res.status(429).json({
        error: 'Too many password reset attempts, please try again later.',
      });
    },
  }),
};

// Helmet security headers configuration
export const helmetConfig = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
      fontSrc: ["'self'", 'https://fonts.gstatic.com', 'data:'],
      imgSrc: ["'self'", 'data:', 'https:', 'blob:'],
      scriptSrc: [
        "'self'",
        "'unsafe-inline'",
        "'unsafe-eval'", // Required for Vite in development
      ],
      connectSrc: [
        "'self'",
        'ws://localhost:*',
        'wss://localhost:*',
        'http://localhost:*',
        'https://localhost:*',
      ],
      objectSrc: ["'none'"],
      upgradeInsecureRequests:
        process.env.NODE_ENV === 'production' ? [] : null,
    },
  },
  crossOriginEmbedderPolicy: false, // Disable for development
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
});

// CSRF protection
export const csrfProtection: any = csrf({
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  },
  ignoreMethods: ['GET', 'HEAD', 'OPTIONS'],
});

// Input validation middleware
export const validateRequest = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    logger.warn('Validation errors:', {
      errors: errors.array(),
      ip: req.ip,
      userAgent: req.get('User-Agent'),
    });
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array(),
    });
  }
  next();
};

// Common validation rules
export const validationRules = {
  // Email validation
  email: body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),

  // Password validation
  password: body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage(
      'Password must contain at least one lowercase letter, one uppercase letter, and one number'
    ),

  // Name validation
  name: body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('Name can only contain letters and spaces'),

  // Slug validation
  slug: param('slug')
    .matches(/^[a-z0-9-]+$/)
    .withMessage(
      'Slug can only contain lowercase letters, numbers, and hyphens'
    ),

  // Page content validation
  content: body('content')
    .trim()
    .isLength({ min: 1 })
    .withMessage('Content is required')
    .isLength({ max: 10000 })
    .withMessage('Content must be less than 10,000 characters'),

  // Title validation
  title: body('title')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Title must be between 1 and 200 characters'),

  // Pagination validation
  page: query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),

  limit: query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
};

// Security middleware for API routes
export const apiSecurity = [
  helmetConfig,
  cors(corsOptions),
  rateLimitConfig.general,
];

// Security middleware for auth routes
export const authSecurity = [
  helmetConfig,
  cors(corsOptions),
  rateLimitConfig.auth,
];

// Security middleware for password reset
export const passwordResetSecurity = [
  helmetConfig,
  cors(corsOptions),
  rateLimitConfig.passwordReset,
];

// Security middleware for forms
export const formSecurity: any[] = [
  helmetConfig,
  cors(corsOptions),
  csrfProtection,
  rateLimitConfig.general,
];

// Request sanitization middleware
export const sanitizeRequest = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Remove potentially dangerous characters from string inputs
  const sanitizeString = (str: string): string => {
    return str
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
      .replace(/on\w+\s*=\s*[^>\s]+/gi, '')
      .trim();
  };

  // Sanitize body parameters
  if (req.body && typeof req.body === 'object') {
    for (const key in req.body) {
      if (typeof req.body[key] === 'string') {
        req.body[key] = sanitizeString(req.body[key]);
      }
    }
  }

  // Sanitize query parameters
  if (req.query && typeof req.query === 'object') {
    for (const key in req.query) {
      if (typeof req.query[key] === 'string') {
        req.query[key] = sanitizeString(req.query[key] as string);
      }
    }
  }

  next();
};

// Security headers for static files
export const staticSecurity = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Set security headers for static assets
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Cache control for static assets
  if (req.url.includes('/assets/')) {
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
  }

  next();
};

// IP whitelist middleware (for admin routes)
export const ipWhitelist = (allowedIPs: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const clientIP = req.ip || req.connection.remoteAddress;

    if (!clientIP || !allowedIPs.includes(clientIP)) {
      logger.warn(
        `Blocked request from non-whitelisted IP: ${clientIP || 'unknown'}`
      );
      return res.status(403).json({
        error: 'Access denied',
      });
    }

    next();
  };
};

// Request size limiter
export const requestSizeLimit = (maxSize: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const contentLength = parseInt(req.get('content-length') || '0');
    const maxBytes = parseInt(maxSize.replace(/\D/g, ''));

    if (contentLength > maxBytes) {
      logger.warn(
        `Request too large: ${contentLength} bytes from IP: ${req.ip || 'unknown'}`
      );
      return res.status(413).json({
        error: 'Request entity too large',
      });
    }

    next();
  };
};
