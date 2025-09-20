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

export interface Post {
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
  tags?: Array<{
    id: string;
    name: string;
    slug: string;
    color?: string;
  }>;
  author: {
    id: string;
    name: string;
  };
  publishedDate: string;
  status: "draft" | "published";
  seo?: {
    title?: string;
    description?: string;
    keywords?: string;
    image?: {
      id: string;
      url: string;
    };
  };
  createdAt: string;
  updatedAt: string;
}

export interface Book {
  id: string;
  title: string;
  slug: string;
  description?: any;
  coverImage?: {
    id: string;
    url: string;
    alt?: string;
  };
  author: string;
  isbn?: string;
  publishedDate?: string;
  pages?: number;
  status: "draft" | "published";
  chapters?: Array<{
    id: string;
    title: string;
    slug: string;
    chapterNumber: number;
  }>;
  seo?: {
    title?: string;
    description?: string;
    keywords?: string;
    image?: {
      id: string;
      url: string;
    };
  };
  createdAt: string;
  updatedAt: string;
}

export interface Chapter {
  id: string;
  title: string;
  slug: string;
  content: any;
  book: {
    id: string;
    title: string;
    slug: string;
  };
  chapterNumber: number;
  status: "draft" | "published";
  seo?: {
    title?: string;
    description?: string;
    keywords?: string;
    image?: {
      id: string;
      url: string;
    };
  };
  createdAt: string;
  updatedAt: string;
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
  description?: string;
  color?: string;
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

  // Posts
  async getPosts(options?: {
    limit?: number;
    page?: number;
    where?: any;
    sort?: string;
    draft?: boolean;
  }): Promise<PayloadResponse<Post>> {
    const params = new URLSearchParams();

    if (options?.limit) params.set("limit", options.limit.toString());
    if (options?.page) params.set("page", options.page.toString());
    if (options?.sort) params.set("sort", options.sort);
    if (options?.draft) params.set("draft", "true");
    if (options?.where) params.set("where", JSON.stringify(options.where));

    return this.fetch<PayloadResponse<Post>>(`/posts?${params.toString()}`);
  }

  async getPost(slug: string, draft = false): Promise<Post> {
    const params = new URLSearchParams();
    if (draft) params.set("draft", "true");

    const response = await this.fetch<PayloadResponse<Post>>(
      `/posts?where[slug][equals]=${slug}&${params.toString()}`
    );
    if (response.docs.length === 0) {
      throw new Error(`Post with slug "${slug}" not found`);
    }
    return response.docs[0];
  }

  // Books
  async getBooks(options?: {
    limit?: number;
    page?: number;
    where?: any;
    sort?: string;
    draft?: boolean;
  }): Promise<PayloadResponse<Book>> {
    const params = new URLSearchParams();

    if (options?.limit) params.set("limit", options.limit.toString());
    if (options?.page) params.set("page", options.page.toString());
    if (options?.sort) params.set("sort", options.sort);
    if (options?.draft) params.set("draft", "true");
    if (options?.where) params.set("where", JSON.stringify(options.where));

    return this.fetch<PayloadResponse<Book>>(`/books?${params.toString()}`);
  }

  async getBook(slug: string, draft = false): Promise<Book> {
    const params = new URLSearchParams();
    if (draft) params.set("draft", "true");

    const response = await this.fetch<PayloadResponse<Book>>(
      `/books?where[slug][equals]=${slug}&${params.toString()}`
    );
    if (response.docs.length === 0) {
      throw new Error(`Book with slug "${slug}" not found`);
    }
    return response.docs[0];
  }

  // Chapters
  async getChapter(
    bookSlug: string,
    chapterSlug: string,
    draft = false
  ): Promise<Chapter> {
    const params = new URLSearchParams();
    if (draft) params.set("draft", "true");

    const response = await this.fetch<PayloadResponse<Chapter>>(
      `/chapters?where[and][0][book.slug][equals]=${bookSlug}&where[and][1][slug][equals]=${chapterSlug}&${params.toString()}`
    );
    if (response.docs.length === 0) {
      throw new Error(
        `Chapter "${chapterSlug}" in book "${bookSlug}" not found`
      );
    }
    return response.docs[0];
  }

  // Tags
  async getTags(): Promise<PayloadResponse<Tag>> {
    return this.fetch<PayloadResponse<Tag>>("/tags");
  }

  // Site Settings
  async getSiteSettings(): Promise<SiteSettings> {
    return this.fetch<SiteSettings>("/globals/site");
  }
}

export const payloadClient = new PayloadClient();
