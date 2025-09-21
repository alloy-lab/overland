/**
 * Pages collection types
 * Generated from Payload CMS collections
 *
 * DO NOT EDIT MANUALLY - Run 'pnpm generate:types' to regenerate
 * Last generated: 2025-09-21T15:41:20.462Z
 */

import type { Media } from './base';

export interface Pages {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  content: any;
  featuredImage?: Media;
  status?: "draft" | "published";
  publishedDate?: string;
  template?: "default" | "full-width" | "sidebar" | "landing";
  showInNavigation?: boolean;
  navigationOrder?: number;
  parentPage?: any;
  seo?: any;
  description?: string;
  keywords?: string;
  image?: Media;
  noIndex?: boolean;
  createdAt: string;
  updatedAt: string;
}

// Export for convenience
export type PagesInput = Omit<Pages, 'id' | 'createdAt' | 'updatedAt'>;
export type PagesUpdate = Partial<PagesInput>;
