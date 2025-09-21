/**
 * Site Settings types
 * Generated from Payload CMS collections
 *
 * DO NOT EDIT MANUALLY - Run 'pnpm generate:types' to regenerate
 * Last generated: ${new Date().toISOString()}
 */

import type { Media } from './base';

export interface SiteSettings {
  id: string;
  title: string;
  description: string;
  logo?: Media;
  favicon?: Media;
  social?: {
    twitter?: string;
    github?: string;
    linkedin?: string;
  };
  contact?: {
    email?: string;
    phone?: string;
    address?: string;
  };
  analytics?: {
    googleAnalyticsId?: string;
    googleTagManagerId?: string;
  };
  createdAt: string;
  updatedAt: string;
}

// Export for convenience
export type SiteSettingsInput = Omit<
  SiteSettings,
  'id' | 'createdAt' | 'updatedAt'
>;
export type SiteSettingsUpdate = Partial<SiteSettingsInput>;
