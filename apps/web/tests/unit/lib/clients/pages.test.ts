import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Pages, PayloadResponse } from '~/lib/types';

// Mock the pages client
const mockPagesClient = {
  getPages: vi.fn(),
  getPage: vi.fn(),
  getPublishedPages: vi.fn(),
  getPagesForNavigation: vi.fn(),
};

vi.mock('~/lib/clients/pages', () => ({
  pagesClient: mockPagesClient,
}));

describe('PagesClient', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getPages', () => {
    it('should fetch all pages with default options', async () => {
      const mockResponse: PayloadResponse<Pages> = {
        docs: [
          {
            id: '1',
            title: 'Test Page',
            slug: 'test-page',
            content: {},
            status: 'published',
            createdAt: '2024-01-01T00:00:00.000Z',
            updatedAt: '2024-01-01T00:00:00.000Z',
          },
        ],
        totalDocs: 1,
        limit: 10,
        totalPages: 1,
        page: 1,
        pagingCounter: 1,
        hasPrevPage: false,
        hasNextPage: false,
        prevPage: null,
        nextPage: null,
      };

      mockPagesClient.getPages.mockResolvedValue(mockResponse);

      const result = await mockPagesClient.getPages();

      expect(mockPagesClient.getPages).toHaveBeenCalledWith();
      expect(result).toEqual(mockResponse);
    });

    it('should fetch pages with custom options', async () => {
      const options = { limit: 5, page: 2 };
      const mockResponse: PayloadResponse<Pages> = {
        docs: [],
        totalDocs: 0,
        limit: 5,
        totalPages: 0,
        page: 2,
        pagingCounter: 0,
        hasPrevPage: false,
        hasNextPage: false,
        prevPage: null,
        nextPage: null,
      };

      mockPagesClient.getPages.mockResolvedValue(mockResponse);

      const result = await mockPagesClient.getPages(options);

      expect(mockPagesClient.getPages).toHaveBeenCalledWith(options);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('getPage', () => {
    it('should fetch a single page by slug', async () => {
      const mockPage: Pages = {
        id: '1',
        title: 'Test Page',
        slug: 'test-page',
        content: {},
        status: 'published',
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      };

      mockPagesClient.getPage.mockResolvedValue(mockPage);

      const result = await mockPagesClient.getPage('test-page');

      expect(mockPagesClient.getPage).toHaveBeenCalledWith('test-page');
      expect(result).toEqual(mockPage);
    });

    it('should throw error when page not found', async () => {
      mockPagesClient.getPage.mockRejectedValue(
        new Error('Pages with slug "non-existent" not found')
      );

      await expect(mockPagesClient.getPage('non-existent')).rejects.toThrow(
        'Pages with slug "non-existent" not found'
      );
    });
  });

  describe('getPublishedPages', () => {
    it('should fetch only published pages', async () => {
      const mockPages: Pages[] = [
        {
          id: '1',
          title: 'Published Page',
          slug: 'published-page',
          content: {},
          status: 'published',
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z',
        },
      ];

      mockPagesClient.getPublishedPages.mockResolvedValue(mockPages);

      const result = await mockPagesClient.getPublishedPages();

      expect(mockPagesClient.getPublishedPages).toHaveBeenCalled();
      expect(result).toEqual(mockPages);
    });
  });

  describe('getPagesForNavigation', () => {
    it('should fetch pages for navigation menu', async () => {
      const mockPages: Pages[] = [
        {
          id: '1',
          title: 'Home',
          slug: 'home',
          content: {},
          status: 'published',
          showInNavigation: true,
          navigationOrder: 1,
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z',
        },
      ];

      mockPagesClient.getPagesForNavigation.mockResolvedValue(mockPages);

      const result = await mockPagesClient.getPagesForNavigation();

      expect(mockPagesClient.getPagesForNavigation).toHaveBeenCalled();
      expect(result).toEqual(mockPages);
    });
  });
});
