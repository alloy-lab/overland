/**
 * Payload clients index
 * Generated from Payload CMS collections
 *
 * DO NOT EDIT MANUALLY - Run 'pnpm generate:types' to regenerate
 */

// Export individual clients
export { examplesClient, ExamplesClient } from './examples';
export { mediaClient, MediaClient } from './media';
export { pagesClient, PagesClient } from './pages';
export { usersClient, EmailClient } from './users';
export { siteSettingsClient, SiteSettingsClient } from './site-settings';

// Export base client
export { BasePayloadClient } from './base';

// Re-export types
export type { PayloadResponse, QueryOptions } from '../types';
