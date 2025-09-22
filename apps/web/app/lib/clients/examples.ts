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
   * Get all examples with optional filtering
   */
  async getExamples(
    options?: QueryOptions
  ): Promise<PayloadResponse<Examples>> {
    const params = this.buildQueryParams(options);
    return this.fetch<PayloadResponse<Examples>>(
      `/examples?${params.toString()}`
    );
  }

  /**
   * Get only published examples
   */
  async getPublishedExamples(
    options?: Omit<QueryOptions, 'where'>
  ): Promise<Examples[]> {
    const response = await this.getExamples({
      ...options,
      where: {
        status: { equals: 'published' },
      },
    });
    return response.docs;
  }
}

export const examplesClient = new ExamplesClient();
