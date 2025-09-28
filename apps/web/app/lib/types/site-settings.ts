/**
 * Site Settings types
 * Generated from Payload CMS collections
 *
 * DO NOT EDIT MANUALLY - Run 'pnpm generate:types' to regenerate
 */

import type { Media } from './base';

export interface SiteSettings {
  id: string;
  siteName?: string;
  siteDescription?: string;
  logo?: Media;
  favicon?: Media;
  socialMedia?: {
    twitter?: string;
    facebook?: string;
    instagram?: string;
    linkedin?: string;
    github?: string;
  };
  contactInfo?: {
    email?: string;
    phone?: string;
    address?: string;
  };
  seo?: {
    defaultTitle?: string;
    defaultDescription?: string;
    defaultKeywords?: string;
    defaultImage?: Media;
  };
  analytics?: {
    googleAnalytics?: string;
    googleTagManager?: string;
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
