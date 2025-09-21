/**
 * Media collection client
 * Generated from Payload CMS collections
 *
 * DO NOT EDIT MANUALLY - Run 'pnpm generate:types' to regenerate
 */

import { BasePayloadClient } from './base';
import type { PayloadResponse, QueryOptions, Media } from '../types';

export class MediaClient extends BasePayloadClient {
  /**
   * Get all media with optional filtering
   */
  async getMedia(options?: QueryOptions): Promise<PayloadResponse<Media>> {
    const params = this.buildQueryParams(options);
    return this.fetch<PayloadResponse<Media>>(`/media?${params.toString()}`);
  }
}

export const mediaClient = new MediaClient();
