/**
 * Types index - exports all collection types
 * Generated from Payload CMS collections
 *
 * DO NOT EDIT MANUALLY - Run 'pnpm generate:types' to regenerate
 */

// Base types
export * from './types/base';

// Collection types
export * from './types/examples';
export * from './types/media';
export * from './types/pages';
export * from './types/site-settings';
export * from './types/users';

// Re-export commonly used types for convenience
export type { Examples } from './types/examples';
export type { Media } from './types/media';
export type { Pages } from './types/pages';
export type { SiteSettings } from './types/site-settings';
export type { Email } from './types/users';
