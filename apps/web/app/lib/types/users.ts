/**
 * Email collection types
 * Generated from Payload CMS collections
 *
 * DO NOT EDIT MANUALLY - Run 'pnpm generate:types' to regenerate
 */

import type { Media } from './base';

export interface Email {
  id: string;

  createdAt: string;
  updatedAt: string;
}

// Export for convenience
export type EmailInput = Omit<Email, 'id' | 'createdAt' | 'updatedAt'>;
export type EmailUpdate = Partial<EmailInput>;
