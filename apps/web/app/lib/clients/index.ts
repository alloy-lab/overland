/**
 * Payload clients index
 * Generated from Payload CMS collections
 *
 * DO NOT EDIT MANUALLY - Run 'pnpm generate:types' to regenerate
 */

// Export individual clients
export { MediaClient, mediaClient } from './media';
export { PagesClient, pagesClient } from './pages';
export { SiteSettingsClient, siteSettingsClient } from './site-settings';
export { EmailClient, usersClient } from './users';

// Export base client
export { BasePayloadClient } from './base';

// Re-export types
export type { PayloadResponse, QueryOptions } from '../types';
