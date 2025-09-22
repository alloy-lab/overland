import { pagesClient } from './clients/pages';
import logger from './logger';

export interface ScheduledContent {
  id: string;
  title: string;
  scheduledDate: string;
  status: string;
}

/**
 * Content scheduling service
 * Automatically publishes scheduled content and archives expired content
 */
export class ContentScheduler {
  /**
   * Process scheduled content - publish items that are ready
   */
  static async processScheduledContent(): Promise<void> {
    try {
      const now = new Date().toISOString();

      // Find pages that are scheduled and ready to publish
      const scheduledPages = await pagesClient.getPages({
        where: {
          status: {
            equals: 'scheduled',
          },
          scheduledDate: {
            less_than_equal: now,
          },
        },
        limit: 100,
      });

      if (scheduledPages.docs && scheduledPages.docs.length > 0) {
        logger.info(
          `Found ${scheduledPages.docs.length} scheduled pages ready to publish`
        );

        for (const page of scheduledPages.docs) {
          try {
            await pagesClient.updatePage(page.id, {
              status: 'published',
              publishedDate: now,
              scheduledDate: undefined, // Clear scheduled date
            });

            logger.info(
              `Published scheduled page: "${page.title}" (ID: ${page.id})`
            );
          } catch (error) {
            logger.error(
              `Failed to publish scheduled page "${page.title}":`,
              error
            );
          }
        }
      } else {
        logger.debug('No scheduled pages ready to publish');
      }
    } catch (error) {
      logger.error('Error processing scheduled content:', error);
    }
  }

  /**
   * Process expired content - archive items that have passed their expiration date
   */
  static async processExpiredContent(): Promise<void> {
    try {
      const now = new Date().toISOString();

      // Find pages that have expired
      const expiredPages = await pagesClient.getPages({
        where: {
          status: {
            equals: 'published',
          },
          expirationDate: {
            less_than_equal: now,
          },
        },
        limit: 100,
      });

      if (expiredPages.docs && expiredPages.docs.length > 0) {
        logger.info(
          `Found ${expiredPages.docs.length} expired pages to archive`
        );

        for (const page of expiredPages.docs) {
          try {
            await pagesClient.updatePage(page.id, {
              status: 'archived',
            });

            logger.info(
              `Archived expired page: "${page.title}" (ID: ${page.id})`
            );
          } catch (error) {
            logger.error(
              `Failed to archive expired page "${page.title}":`,
              error
            );
          }
        }
      } else {
        logger.debug('No expired pages to archive');
      }
    } catch (error) {
      logger.error('Error processing expired content:', error);
    }
  }

  /**
   * Get all scheduled content for monitoring
   */
  static async getScheduledContent(): Promise<ScheduledContent[]> {
    try {
      const scheduledPages = await pagesClient.getPages({
        where: {
          status: {
            equals: 'scheduled',
          },
        },
        limit: 100,
        sort: 'scheduledDate',
      });

      return (scheduledPages.docs || []).map(page => ({
        id: page.id,
        title: page.title,
        scheduledDate: (page as any).scheduledDate || '',
        status: page.status || 'draft',
      }));
    } catch (error) {
      logger.error('Error fetching scheduled content:', error);
      return [];
    }
  }

  /**
   * Get content statistics
   */
  static async getContentStats(): Promise<{
    total: number;
    published: number;
    draft: number;
    scheduled: number;
    archived: number;
  }> {
    try {
      const [total, published, draft, scheduled, archived] = await Promise.all([
        pagesClient.getPages({ limit: 1 }),
        pagesClient.getPages({
          where: { status: { equals: 'published' } },
          limit: 1,
        }),
        pagesClient.getPages({
          where: { status: { equals: 'draft' } },
          limit: 1,
        }),
        pagesClient.getPages({
          where: { status: { equals: 'scheduled' } },
          limit: 1,
        }),
        pagesClient.getPages({
          where: { status: { equals: 'archived' } },
          limit: 1,
        }),
      ]);

      return {
        total: total.totalDocs || 0,
        published: published.totalDocs || 0,
        draft: draft.totalDocs || 0,
        scheduled: scheduled.totalDocs || 0,
        archived: archived.totalDocs || 0,
      };
    } catch (error) {
      logger.error('Error fetching content stats:', error);
      return {
        total: 0,
        published: 0,
        draft: 0,
        scheduled: 0,
        archived: 0,
      };
    }
  }

  /**
   * Run the complete content scheduling process
   */
  static async runScheduler(): Promise<void> {
    logger.info('Starting content scheduler...');

    await Promise.all([
      this.processScheduledContent(),
      this.processExpiredContent(),
    ]);

    logger.info('Content scheduler completed');
  }
}
