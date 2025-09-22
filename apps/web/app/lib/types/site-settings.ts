/**
 * Site Settings types
 * Generated from Payload CMS collections
 *
 * DO NOT EDIT MANUALLY - Run 'pnpm generate:types' to regenerate
 */

export interface SiteSettings {
  id: string;
  title?: string;
  description?: string;
  siteName?: string;
  siteDescription?: string;
  logo?: {
    url?: string;
    alt?: string;
  };
  favicon?: any;
  social?: {
    twitter?: string;
    facebook?: string;
    instagram?: string;
    linkedin?: string;
    github?: string;
  };
  socialMedia?: {
    twitter?: string;
    facebook?: string;
    instagram?: string;
    linkedin?: string;
    github?: string;
  };
  contact?: {
    email?: string;
    phone?: string;
    address?: string;
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
    defaultImage?: any;
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
