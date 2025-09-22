import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ContentScheduler } from '~/lib/contentScheduler';

// Mock the pages client
vi.mock('~/lib/clients/pages', () => ({
  pagesClient: {
    getPages: vi.fn(),
    updatePage: vi.fn(),
  },
}));

// Mock logger
vi.mock('~/lib/logger', () => ({
  default: {
    info: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
  },
}));

import { pagesClient } from '~/lib/clients/pages';
import logger from '~/lib/logger';

const mockPagesClient = vi.mocked(pagesClient);
const mockLogger = vi.mocked(logger);

describe('ContentScheduler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('processScheduledContent', () => {
    it('should publish scheduled pages that are ready', async () => {
      const mockScheduledPages = {
        docs: [
          {
            id: '1',
            title: 'Scheduled Page 1',
            status: 'scheduled',
            scheduledDate: '2024-01-01T00:00:00.000Z',
          },
          {
            id: '2',
            title: 'Scheduled Page 2',
            status: 'scheduled',
            scheduledDate: '2024-01-01T00:00:00.000Z',
          },
        ],
        totalDocs: 2,
      };

      mockPagesClient.getPages.mockResolvedValue(mockScheduledPages);
      mockPagesClient.updatePage.mockResolvedValue({} as any);

      await ContentScheduler.processScheduledContent();

      expect(mockPagesClient.getPages).toHaveBeenCalledWith({
        where: {
          status: { equals: 'scheduled' },
          scheduledDate: { less_than_equal: expect.any(String) },
        },
        limit: 100,
      });

      expect(mockPagesClient.updatePage).toHaveBeenCalledTimes(2);
      expect(mockPagesClient.updatePage).toHaveBeenCalledWith('1', {
        status: 'published',
        publishedDate: expect.any(String),
        scheduledDate: undefined,
      });
      expect(mockPagesClient.updatePage).toHaveBeenCalledWith('2', {
        status: 'published',
        publishedDate: expect.any(String),
        scheduledDate: undefined,
      });

      expect(mockLogger.info).toHaveBeenCalledWith(
        'Found 2 scheduled pages ready to publish'
      );
      expect(mockLogger.info).toHaveBeenCalledWith(
        'Published scheduled page: "Scheduled Page 1" (ID: 1)'
      );
      expect(mockLogger.info).toHaveBeenCalledWith(
        'Published scheduled page: "Scheduled Page 2" (ID: 2)'
      );
    });

    it('should handle no scheduled pages', async () => {
      mockPagesClient.getPages.mockResolvedValue({ docs: [], totalDocs: 0 });

      await ContentScheduler.processScheduledContent();

      expect(mockLogger.debug).toHaveBeenCalledWith(
        'No scheduled pages ready to publish'
      );
      expect(mockPagesClient.updatePage).not.toHaveBeenCalled();
    });

    it('should handle errors when updating pages', async () => {
      const mockScheduledPages = {
        docs: [
          {
            id: '1',
            title: 'Scheduled Page 1',
            status: 'scheduled',
            scheduledDate: '2024-01-01T00:00:00.000Z',
          },
        ],
        totalDocs: 1,
      };

      mockPagesClient.getPages.mockResolvedValue(mockScheduledPages);
      mockPagesClient.updatePage.mockRejectedValue(new Error('Update failed'));

      await ContentScheduler.processScheduledContent();

      expect(mockLogger.error).toHaveBeenCalledWith(
        'Failed to publish scheduled page "Scheduled Page 1":',
        expect.any(Error)
      );
    });
  });

  describe('processExpiredContent', () => {
    it('should archive expired pages', async () => {
      const mockExpiredPages = {
        docs: [
          {
            id: '1',
            title: 'Expired Page 1',
            status: 'published',
            expirationDate: '2024-01-01T00:00:00.000Z',
          },
        ],
        totalDocs: 1,
      };

      mockPagesClient.getPages.mockResolvedValue(mockExpiredPages);
      mockPagesClient.updatePage.mockResolvedValue({} as any);

      await ContentScheduler.processExpiredContent();

      expect(mockPagesClient.getPages).toHaveBeenCalledWith({
        where: {
          status: { equals: 'published' },
          expirationDate: { less_than_equal: expect.any(String) },
        },
        limit: 100,
      });

      expect(mockPagesClient.updatePage).toHaveBeenCalledWith('1', {
        status: 'archived',
      });

      expect(mockLogger.info).toHaveBeenCalledWith(
        'Found 1 expired pages to archive'
      );
      expect(mockLogger.info).toHaveBeenCalledWith(
        'Archived expired page: "Expired Page 1" (ID: 1)'
      );
    });
  });

  describe('getScheduledContent', () => {
    it('should return scheduled content', async () => {
      const mockScheduledPages = {
        docs: [
          {
            id: '1',
            title: 'Scheduled Page 1',
            status: 'scheduled',
            scheduledDate: '2024-01-01T00:00:00.000Z',
          },
        ],
        totalDocs: 1,
      };

      mockPagesClient.getPages.mockResolvedValue(mockScheduledPages);

      const result = await ContentScheduler.getScheduledContent();

      expect(result).toEqual([
        {
          id: '1',
          title: 'Scheduled Page 1',
          scheduledDate: '2024-01-01T00:00:00.000Z',
          status: 'scheduled',
        },
      ]);
    });

    it('should return empty array on error', async () => {
      mockPagesClient.getPages.mockRejectedValue(new Error('API Error'));

      const result = await ContentScheduler.getScheduledContent();

      expect(result).toEqual([]);
      expect(mockLogger.error).toHaveBeenCalledWith(
        'Error fetching scheduled content:',
        expect.any(Error)
      );
    });
  });

  describe('getContentStats', () => {
    it('should return content statistics', async () => {
      const mockStats = [
        { totalDocs: 10 }, // total
        { totalDocs: 5 }, // published
        { totalDocs: 3 }, // draft
        { totalDocs: 1 }, // scheduled
        { totalDocs: 1 }, // archived
      ];

      mockPagesClient.getPages
        .mockResolvedValueOnce(mockStats[0])
        .mockResolvedValueOnce(mockStats[1])
        .mockResolvedValueOnce(mockStats[2])
        .mockResolvedValueOnce(mockStats[3])
        .mockResolvedValueOnce(mockStats[4]);

      const result = await ContentScheduler.getContentStats();

      expect(result).toEqual({
        total: 10,
        published: 5,
        draft: 3,
        scheduled: 1,
        archived: 1,
      });
    });
  });

  describe('runScheduler', () => {
    it('should run both scheduled and expired content processing', async () => {
      const processScheduledSpy = vi.spyOn(
        ContentScheduler,
        'processScheduledContent'
      );
      const processExpiredSpy = vi.spyOn(
        ContentScheduler,
        'processExpiredContent'
      );

      processScheduledSpy.mockResolvedValue();
      processExpiredSpy.mockResolvedValue();

      await ContentScheduler.runScheduler();

      expect(processScheduledSpy).toHaveBeenCalled();
      expect(processExpiredSpy).toHaveBeenCalled();
      expect(mockLogger.info).toHaveBeenCalledWith(
        'Starting content scheduler...'
      );
      expect(mockLogger.info).toHaveBeenCalledWith(
        'Content scheduler completed'
      );
    });
  });
});
