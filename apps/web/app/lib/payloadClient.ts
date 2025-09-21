/**
 * Main Payload client - aggregates all collection clients
 * Generated from Payload CMS collections
 *
 * DO NOT EDIT MANUALLY - Run 'pnpm generate:types' to regenerate
 * Last generated: 2025-09-21T15:41:20.464Z
 */

import {
  mediaClient,
  pagesClient,
  usersClient,
  siteSettingsClient,
} from './clients';

// Re-export all clients for convenience
export { mediaClient, pagesClient, usersClient, siteSettingsClient };

// Legacy compatibility - main client object
export const payloadClient = {
  // Media
  getMedia: mediaClient.getMedia.bind(mediaClient),

  // Pages
  getPages: pagesClient.getPages.bind(pagesClient),
  getPage: pagesClient.getPage.bind(pagesClient),
  getPublishedPages: pagesClient.getPublishedPages.bind(pagesClient),
  getPagesForNavigation: pagesClient.getPagesForNavigation.bind(pagesClient),

  // Email
  getEmails: usersClient.getEmails.bind(usersClient),

  // Site Settings
  getSiteSettings: siteSettingsClient.getSiteSettings.bind(siteSettingsClient),
};

// Re-export types
export type {
  PayloadResponse,
  QueryOptions,
  Media,
  Pages,
  Email,
  SiteSettings,
} from './types';
