/**
 * @fileoverview API Security Configuration for Web App
 * @description Re-exports API security middleware from @alloylab/security
 */

import {
  apiValidationRules,
  createApiRequestLogger,
  createFormatApiResponse,
  createRequireAdmin,
  createValidateApiKey,
  createValidateApiRequest,
  createValidateFileUpload,
} from '@alloylab/security';
import logger from './logger';

// API security middleware
export const validateApiKey = createValidateApiKey(logger);
export const requireAdmin = createRequireAdmin(logger);
export const formatApiResponse = createFormatApiResponse(true, logger);
export const apiRequestLogger = createApiRequestLogger(logger);
export const validateApiRequest = createValidateApiRequest(logger);

// File upload security (with default settings)
export const validateFileUpload = createValidateFileUpload(
  10 * 1024 * 1024, // 10MB default
  [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf',
    'text/plain',
  ],
  logger
);

// Re-export API validation rules
export { apiValidationRules };

// Legacy exports for backward compatibility (can be removed after full migration)
export const apiValidationRules_legacy = apiValidationRules;
