import { env } from "./env";

export interface PayloadResponse<T> {
  docs: T[];
  totalDocs: number;
  limit: number;
  totalPages: number;
  page: number;
  pagingCounter: number;
  hasPrevPage: boolean;
  hasNextPage: boolean;
  prevPage: number | null;
  nextPage: number | null;
}


export interface SiteSettings {
  title: string;
  description: string;
  logo?: {
    id: string;
    url: string;
    alt?: string;
  };
  favicon?: {
    id: string;
    url: string;
    alt?: string;
  };
  social?: {
    twitter?: string;
    github?: string;
    linkedin?: string;
  };
  contact?: {
    email?: string;
    phone?: string;
    address?: string;
  };
  analytics?: {
    googleAnalyticsId?: string;
    googleTagManagerId?: string;
  };
}

class PayloadClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = env.CMS_API_URL;
  }

  private async fetch<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }


  // Site Settings
  async getSiteSettings(): Promise<SiteSettings> {
    return this.fetch<SiteSettings>("/globals/site");
  }
}

export const payloadClient = new PayloadClient();
