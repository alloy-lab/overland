/**
 * Examples collection types
 * Generated from Payload CMS collections
 *
 * DO NOT EDIT MANUALLY - Run 'pnpm generate:types' to regenerate
 */

import type { Media } from './base';

export interface Examples {
  id: string;
  title: string;
  type?: string;
  description?: string;
  status?: 'draft' | 'published';
  tags?: string;
  featured?: boolean;
  difficulty?: string;
  createdAt: string;
  updatedAt: string;
}

// Export for convenience
export type ExamplesInput = Omit<Examples, 'id' | 'createdAt' | 'updatedAt'>;
export type ExamplesUpdate = Partial<ExamplesInput>;
