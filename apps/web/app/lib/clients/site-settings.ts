/**
 * Site Settings client
 * Generated from Payload CMS collections
 *
 * DO NOT EDIT MANUALLY - Run 'pnpm generate:types' to regenerate
 * Last generated: 2025-09-21T15:41:20.463Z
 */

import type { SiteSettings } from '../types';
import { BasePayloadClient } from './base';

export class SiteSettingsClient extends BasePayloadClient {
  /**
   * Get site settings
   */
  async getSiteSettings(): Promise<SiteSettings> {
    return this.fetch<SiteSettings>('/globals/site');
  }
}

export const siteSettingsClient = new SiteSettingsClient();
