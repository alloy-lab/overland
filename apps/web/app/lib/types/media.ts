/**
 * Media collection types
 * Generated from Payload CMS collections
 *
 * DO NOT EDIT MANUALLY - Run 'pnpm generate:types' to regenerate
 */

import type { Media as BaseMedia } from './base';

// Media collection extends the base Media type
export interface Media extends BaseMedia {
  alt: string;
}

// Export for convenience
export type MediaInput = Omit<Media, 'id' | 'createdAt' | 'updatedAt'>;
export type MediaUpdate = Partial<MediaInput>;
