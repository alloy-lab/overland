/**
 * Email collection client
 * Generated from Payload CMS collections
 *
 * DO NOT EDIT MANUALLY - Run 'pnpm generate:types' to regenerate
 * Last generated: 2025-09-21T15:41:20.463Z
 */

import type { Email, PayloadResponse, QueryOptions } from '../types';
import { BasePayloadClient } from './base';

export class EmailClient extends BasePayloadClient {
  /**
   * Get all emails with optional filtering
   */
  async getEmails(options?: QueryOptions): Promise<PayloadResponse<Email>> {
    const params = this.buildQueryParams(options);
    return this.fetch<PayloadResponse<Email>>(`/users?${params.toString()}`);
  }
}

export const usersClient = new EmailClient();
