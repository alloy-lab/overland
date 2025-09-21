/**
 * Pages collection client
 * Generated from Payload CMS collections
 *
 * DO NOT EDIT MANUALLY - Run 'pnpm generate:types' to regenerate
 * Last generated: 2025-09-21T15:41:20.463Z
 */

import type { Pages, PayloadResponse, QueryOptions } from '../types';
import { BasePayloadClient } from './base';

export class PagesClient extends BasePayloadClient {
  /**
   * Get all pages with optional filtering
   */
  async getPages(options?: QueryOptions): Promise<PayloadResponse<Pages>> {
    const params = this.buildQueryParams(options);
    return this.fetch<PayloadResponse<Pages>>(`/pages?${params.toString()}`);
  }

  /**
   * Get a single pages by slug
   */
  async getPage(slug: string, draft = false): Promise<Pages> {
    const params = new URLSearchParams();
    if (draft) params.set('draft', 'true');

    const response = await this.fetch<PayloadResponse<Pages>>(
      `/pages?where[slug][equals]=${slug}&${params.toString()}`
    );

    if (response.docs.length === 0) {
      throw new Error(`Pages with slug "${slug}" not found`);
    }

    return response.docs[0];
  }

  /**
   * Get only published pages
   */
  async getPublishedPages(
    options?: Omit<QueryOptions, 'where'>
  ): Promise<Pages[]> {
    const response = await this.getPages({
      ...options,
      where: {
        status: { equals: 'published' },
      },
    });
    return response.docs;
  }

  /**
   * Get pages for navigation menu
   */
  async getPagesForNavigation(): Promise<Pages[]> {
    const response = await this.getPages({
      where: {
        showInNavigation: { equals: true },
        status: { equals: 'published' },
      },
      sort: 'navigationOrder',
    });
    return response.docs;
  }
}

export const pagesClient = new PagesClient();
