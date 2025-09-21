/**
 * Email collection client
 * Generated from Payload CMS collections
 *
 * DO NOT EDIT MANUALLY - Run 'pnpm generate:types' to regenerate
 */

import { BasePayloadClient } from './base';
import type { PayloadResponse, QueryOptions, Email } from '../types';

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
