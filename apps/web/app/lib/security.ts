/**
 * @fileoverview Security Configuration for Web App
 * @description Re-exports and configures security middleware from @alloylab/security
 */

import {
  apiValidationRules,
  createApiRequestLogger,
  createApiSecurity,
  createAuthSecurity,
  createFormatApiResponse,
  createFormSecurity,
  createPasswordResetSecurity,
  createRequireAdmin,
  createStaticSecurity,
  createValidateApiKey,
  createValidateApiRequest,
  createValidateFileUpload,
  createValidateRequest,
  validateEnv,
  validationRules,
} from '@alloylab/security';
import logger from './logger';

// Validate environment variables on startup
export const env = validateEnv(logger);

// Get allowed origins from environment
const allowedOrigins = [env.ALLOWED_ORIGIN_1, env.ALLOWED_ORIGIN_2].filter(
  (origin): origin is string => Boolean(origin)
);

// Security middleware configurations
// For development, create a no-op middleware to disable CSP
export const apiSecurity =
  process.env.NODE_ENV === 'development'
    ? (req: any, res: any, next: any) => {
        // Skip API security in development to avoid CSP issues
        next();
      }
    : createApiSecurity(allowedOrigins, logger);
export const authSecurity = createAuthSecurity(allowedOrigins, logger);
export const formSecurity = createFormSecurity(allowedOrigins, logger);
export const passwordResetSecurity = createPasswordResetSecurity(
  allowedOrigins,
  logger
);
// For development, we'll disable CSP entirely to allow inline scripts
// In production, use the default secure CSP
export const staticSecurity =
  process.env.NODE_ENV === 'development'
    ? (req: any, res: any, next: any) => {
        // Skip CSP in development
        next();
      }
    : createStaticSecurity();

// API security middleware
export const validateApiKey = createValidateApiKey(logger);
export const requireAdmin = createRequireAdmin(logger);
export const formatApiResponse = createFormatApiResponse(true, logger);
export const apiRequestLogger = createApiRequestLogger(logger);

// File upload security
export const validateFileUpload = createValidateFileUpload(
  parseInt(env.MAX_FILE_SIZE.replace(/[^\d]/g, '')) * 1024 * 1024, // Convert to bytes
  env.ALLOWED_FILE_TYPES.split(','),
  logger
);

// Validation middleware
export const validateRequest = createValidateRequest(logger);
export const validateApiRequest = createValidateApiRequest(logger);

// Re-export validation rules and API validation rules
export { apiValidationRules, validationRules };

// Legacy exports for backward compatibility (can be removed after full migration)
export const corsOptions = { origin: allowedOrigins, credentials: true };
export const rateLimitConfig = { general: {}, auth: {}, passwordReset: {} };
export const helmetConfig = {};
export const sanitizeRequest = (req: any, res: any, next: any) => next();
export const requestSizeLimit =
  (limit: string) => (req: any, res: any, next: any) =>
    next();
