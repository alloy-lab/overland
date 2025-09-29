/**
 * @fileoverview Security Configuration for CMS App
 * @description Environment validation and security utilities for Payload CMS
 */

import { validateEnv } from '@alloylab/security';

// Validate environment variables on startup
export const env = validateEnv();

// Re-export for use in other parts of the CMS
export { validateEnv };
