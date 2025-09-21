/**
 * Site Settings client
 * Generated from Payload CMS collections
 *
 * DO NOT EDIT MANUALLY - Run 'pnpm generate:types' to regenerate
 */

import { BasePayloadClient } from './base';
import type { SiteSettings } from '../types';

export class SiteSettingsClient extends BasePayloadClient {
  /**
   * Get site settings
   */
  async getSiteSettings(): Promise<SiteSettings> {
    return this.fetch<SiteSettings>('/globals/site');
  }
}

export const siteSettingsClient = new SiteSettingsClient();
