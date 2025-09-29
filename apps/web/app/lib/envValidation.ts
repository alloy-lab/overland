/**
 * @fileoverview Environment Validation for Web App
 * @description Re-exports environment validation from @alloylab/security
 */

import {
  createEnvSchema,
  validateCustomEnv,
  validateEnv,
} from '@alloylab/security';
import logger from './logger';

// Validate environment variables using the security package
export const env = validateEnv(logger);

// Re-export validation functions
export { createEnvSchema, validateCustomEnv, validateEnv };

// Legacy export for backward compatibility
export const validateEnvironment = validateEnv;
