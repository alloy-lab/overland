import type { Pages, SiteSettings } from '~/lib/types';

/**
 * Test data factories for creating mock objects
 */

export const createMockSiteSettings = (
  overrides?: Partial<SiteSettings>
): SiteSettings => ({
  title: 'Test Site',
  description: 'A test site for unit testing',
  logo: {
    url: 'https://example.com/logo.png',
    alt: 'Test Logo',
  },
  social: {
    twitter: '@testsite',
    facebook: 'testsite',
  },
  seo: {
    title: 'Test Site - Unit Testing',
    description: 'A test site for unit testing purposes',
    keywords: 'test, unit, testing',
  },
  ...overrides,
});

export const createMockPage = (overrides?: Partial<Pages>): Pages => ({
  id: '1',
  title: 'Test Page',
  slug: 'test-page',
  excerpt: 'A test page for unit testing',
  content: {},
  status: 'published',
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
  ...overrides,
});

export const createMockPayloadResponse = <T>(
  docs: T[],
  overrides?: Partial<any>
): any => ({
  docs,
  totalDocs: docs.length,
  limit: 10,
  totalPages: Math.ceil(docs.length / 10),
  page: 1,
  pagingCounter: 1,
  hasPrevPage: false,
  hasNextPage: docs.length > 10,
  prevPage: null,
  nextPage: docs.length > 10 ? 2 : null,
  ...overrides,
});

/**
 * Mock fetch responses for testing
 */
export const createMockFetchResponse = (data: any, ok = true) => ({
  ok,
  status: ok ? 200 : 404,
  statusText: ok ? 'OK' : 'Not Found',
  json: async () => data,
  text: async () => JSON.stringify(data),
  headers: new Headers({
    'Content-Type': 'application/json',
  }),
});

/**
 * Test environment setup
 */
export const setupTestEnvironment = () => {
  // Mock environment variables
  process.env.NODE_ENV = 'test';
  process.env.CMS_API_URL = 'http://localhost:3001';

  // Mock console methods to reduce noise in tests
  const originalConsole = { ...console };

  beforeEach(() => {
    console.warn = vi.fn();
    console.error = vi.fn();
  });

  afterEach(() => {
    Object.assign(console, originalConsole);
  });
};

/**
 * Wait for async operations to complete
 */
export const waitForAsync = (ms = 100) =>
  new Promise(resolve => setTimeout(resolve, ms));

/**
 * Create a mock function with proper typing
 */
export const createMockFunction = <T extends (...args: any[]) => any>(
  implementation?: T
): T & { mock: any } => {
  const mockFn = vi.fn(implementation) as T & { mock: any };
  return mockFn;
};
