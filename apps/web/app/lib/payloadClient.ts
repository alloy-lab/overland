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


export interface Page {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  content: any;
  featuredImage?: {
    id: string;
    url: string;
    alt?: string;
  };
  status: "draft" | "published";
  publishedDate?: string;
  template: "default" | "full-width" | "sidebar" | "landing";
  showInNavigation: boolean;
  navigationOrder?: number;
  parentPage?: {
    id: string;
    title: string;
    slug: string;
  };
  seo?: {
    title?: string;
    description?: string;
    keywords?: string;
    image?: {
      id: string;
      url: string;
    };
    noIndex?: boolean;
  };
  createdAt: string;
  updatedAt: string;
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


  // Pages
  async getPages(options?: {
    limit?: number;
    page?: number;
    where?: any;
    sort?: string;
    draft?: boolean;
  }): Promise<PayloadResponse<Page>> {
    const params = new URLSearchParams();

    if (options?.limit) params.set("limit", options.limit.toString());
    if (options?.page) params.set("page", options.page.toString());
    if (options?.sort) params.set("sort", options.sort);
    if (options?.draft) params.set("draft", "true");
    if (options?.where) params.set("where", JSON.stringify(options.where));

    return this.fetch<PayloadResponse<Page>>(`/pages?${params.toString()}`);
  }

  async getPage(slug: string, draft = false): Promise<Page> {
    const params = new URLSearchParams();
    if (draft) params.set("draft", "true");

    const response = await this.fetch<PayloadResponse<Page>>(
      `/pages?where[slug][equals]=${slug}&${params.toString()}`
    );
    if (response.docs.length === 0) {
      throw new Error(`Page with slug "${slug}" not found`);
    }
    return response.docs[0];
  }

  async getNavigationPages(): Promise<Page[]> {
    const response = await this.getPages({
      where: {
        showInNavigation: { equals: true },
        status: { equals: "published" },
      },
      sort: "navigationOrder",
    });
    return response.docs;
  }

  // Site Settings
  async getSiteSettings(): Promise<SiteSettings> {
    return this.fetch<SiteSettings>("/globals/site");
  }
}

export const payloadClient = new PayloadClient();
