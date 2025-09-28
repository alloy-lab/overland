/**
 * Base types for web app
 * Generated from Payload CMS collections
 *
 * DO NOT EDIT MANUALLY - Run collection-registry to regenerate
 */

// Base response type
export interface PayloadResponse<T> {
  docs: T[];
  totalDocs: number;
  limit: number;
  totalPages: number;
  page: number;
  pagingCounter: number;
  hasPrevPage: boolean;
  hasNextPage: boolean;
  prevPage: number | null;
  nextPage: number | null;
}

// Media type
export interface Media {
  id: string;
  url: string;
  alt?: string;
  width?: number;
  height?: number;
  filename?: string;
  mimeType?: string;
  filesize?: number;
  createdAt: string;
  updatedAt: string;
}

// Query types
export interface QueryOptions {
  limit?: number;
  page?: number;
  where?: any;
  sort?: string;
  draft?: boolean;
}

// Navigation types
export interface NavigationItem {
  id: string;
  title: string;
  slug: string;
  children?: NavigationItem[];
}

// SEO types
export interface SEOData {
  title: string;
  description: string;
  image?: string;
  url?: string;
  type?: string;
}

// Form types
export interface FormField {
  name: string;
  type: string;
  required: boolean;
  label?: string;
  placeholder?: string;
  options?: Array<{ label: string; value: string }>;
}

export interface FormSchema {
  fields: FormField[];
  validation?: any;
}
