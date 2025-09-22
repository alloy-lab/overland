/**
 * Examples collection client
 * Generated from Payload CMS collections
 *
 * DO NOT EDIT MANUALLY - Run 'pnpm generate:types' to regenerate
 */

import type { Examples, PayloadResponse, QueryOptions } from '../types';
import { BasePayloadClient } from './base';

export class ExamplesClient extends BasePayloadClient {
  /**
   * Get all exampleses with optional filtering
   */
  async getExampleses(
    options?: QueryOptions
  ): Promise<PayloadResponse<Examples>> {
    const params = this.buildQueryParams(options);
    return this.fetch<PayloadResponse<Examples>>(
      `/examples?${params.toString()}`
    );
  }

  /**
   * Get only published exampleses
   */
  async getPublishedExampleses(
    options?: Omit<QueryOptions, 'where'>
  ): Promise<Examples[]> {
    const response = await this.getExampleses({
      ...options,
      where: {
        status: { equals: 'published' },
      },
    });
    return response.docs;
  }
}

export const examplesClient = new ExamplesClient();
