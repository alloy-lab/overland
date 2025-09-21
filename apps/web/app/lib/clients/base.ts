/**
 * Base Payload client class
 * Generated from Payload CMS collections
 *
 * DO NOT EDIT MANUALLY - Run 'pnpm generate:types' to regenerate
 * Last generated: 2025-09-21T15:41:20.463Z
 */

import { env } from '../env';
import type { QueryOptions } from '../types';

export abstract class BasePayloadClient {
  protected baseUrl: string;

  constructor() {
    this.baseUrl = env.CMS_API_URL;
  }

  protected async fetch<T>(
    endpoint: string,
    options?: RequestInit
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  protected buildQueryParams(options?: QueryOptions): URLSearchParams {
    const params = new URLSearchParams();

    if (options?.limit) params.set('limit', options.limit.toString());
    if (options?.page) params.set('page', options.page.toString());
    if (options?.sort) params.set('sort', options.sort);
    if (options?.draft) params.set('draft', 'true');
    if (options?.where) params.set('where', JSON.stringify(options.where));

    return params;
  }
}
