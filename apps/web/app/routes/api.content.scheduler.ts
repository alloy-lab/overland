import { ContentScheduler } from '~/lib/contentScheduler';
import logger from '~/lib/logger';

export async function action({ request }: { request: Request }) {
  try {
    const formData = await request.formData();
    const action = formData.get('action') as string;

    switch (action) {
      case 'run':
        await ContentScheduler.runScheduler();
        return new Response(
          JSON.stringify({
            success: true,
            message: 'Content scheduler completed successfully',
          }),
          {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          }
        );

      case 'scheduled':
        const scheduledContent = await ContentScheduler.getScheduledContent();
        return new Response(
          JSON.stringify({
            success: true,
            data: scheduledContent,
          }),
          {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          }
        );

      case 'stats':
        const stats = await ContentScheduler.getContentStats();
        return new Response(
          JSON.stringify({
            success: true,
            data: stats,
          }),
          {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          }
        );

      default:
        return new Response(
          JSON.stringify({
            success: false,
            error: 'Invalid action. Use: run, scheduled, or stats',
          }),
          {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
          }
        );
    }
  } catch (error) {
    logger.error('Content scheduler API error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Content scheduler failed',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
