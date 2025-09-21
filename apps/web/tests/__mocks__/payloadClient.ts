import { vi } from 'vitest';
import type { Pages } from '~/lib/types';
import {
  createMockPage,
  createMockPayloadResponse,
  createMockSiteSettings,
} from '../utils/test-helpers';

// Mock data
const mockPages: Pages[] = [
  createMockPage({
    id: '1',
    title: 'Home',
    slug: 'home',
    status: 'published',
    showInNavigation: true,
    navigationOrder: 1,
  }),
  createMockPage({
    id: '2',
    title: 'About',
    slug: 'about',
    status: 'published',
    showInNavigation: true,
    navigationOrder: 2,
  }),
  createMockPage({
    id: '3',
    title: 'Contact',
    slug: 'contact',
    status: 'published',
    showInNavigation: true,
    navigationOrder: 3,
  }),
];

const mockSiteSettings = createMockSiteSettings();

// Mock implementations
export const mockPayloadClient = {
  // Pages
  getPages: vi.fn().mockImplementation(async (options?: any) => {
    return createMockPayloadResponse(mockPages);
  }),

  getPage: vi.fn().mockImplementation(async (slug: string) => {
    const page = mockPages.find(p => p.slug === slug);
    if (!page) {
      throw new Error(`Pages with slug "${slug}" not found`);
    }
    return page;
  }),

  getPublishedPages: vi.fn().mockImplementation(async () => {
    return mockPages.filter(p => p.status === 'published');
  }),

  getPagesForNavigation: vi.fn().mockImplementation(async () => {
    return mockPages.filter(
      p => p.showInNavigation && p.status === 'published'
    );
  }),

  // Site Settings
  getSiteSettings: vi.fn().mockImplementation(async () => {
    return mockSiteSettings;
  }),

  // Media
  getMedia: vi.fn().mockImplementation(async () => {
    return createMockPayloadResponse([]);
  }),

  // Email/Users
  getEmails: vi.fn().mockImplementation(async () => {
    return createMockPayloadResponse([]);
  }),
};

// Reset all mocks
export const resetMocks = () => {
  Object.values(mockPayloadClient).forEach(mock => {
    if (vi.isMockFunction(mock)) {
      mock.mockClear();
    }
  });
};

// Set up default mock implementations
export const setupMocks = () => {
  // Reset all mocks to default implementations
  resetMocks();

  // Re-apply default implementations
  mockPayloadClient.getPages.mockImplementation(async (options?: any) => {
    return createMockPayloadResponse(mockPages);
  });

  mockPayloadClient.getPage.mockImplementation(async (slug: string) => {
    const page = mockPages.find(p => p.slug === slug);
    if (!page) {
      throw new Error(`Pages with slug "${slug}" not found`);
    }
    return page;
  });

  mockPayloadClient.getPublishedPages.mockImplementation(async () => {
    return mockPages.filter(p => p.status === 'published');
  });

  mockPayloadClient.getPagesForNavigation.mockImplementation(async () => {
    return mockPages.filter(
      p => p.showInNavigation && p.status === 'published'
    );
  });

  mockPayloadClient.getSiteSettings.mockImplementation(async () => {
    return mockSiteSettings;
  });

  mockPayloadClient.getMedia.mockImplementation(async () => {
    return createMockPayloadResponse([]);
  });

  mockPayloadClient.getEmails.mockImplementation(async () => {
    return createMockPayloadResponse([]);
  });
};
