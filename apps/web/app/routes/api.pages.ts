import { type ActionFunctionArgs, type LoaderFunctionArgs } from 'react-router';
import { ValidationError } from '~/lib/errorHandler';
import logger from '~/lib/logger';
import { payloadClient } from '~/lib/payloadClient';

// GET /api/pages - List all pages
export async function loader({ request }: LoaderFunctionArgs) {
  try {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '10');
    const status = url.searchParams.get('status') || 'published';

    logger.info('API: Fetching pages', { page, limit, status });

    const pages = await payloadClient.getPages({
      page,
      limit,
      where: status === 'all' ? {} : { status: { equals: status } },
    });

    return new Response(
      JSON.stringify({
        success: true,
        data: pages,
        pagination: {
          page,
          limit,
          total: pages.totalDocs,
          pages: pages.totalPages,
        },
      }),
      {
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    logger.error('API: Error fetching pages', { error });
    throw new Error('Failed to fetch pages');
  }
}

// POST /api/pages - Create a new page
export async function action({ request }: ActionFunctionArgs) {
  try {
    const formData = await request.formData();
    const title = formData.get('title') as string;
    const content = formData.get('content') as string;
    const slug = formData.get('slug') as string;
    const status = (formData.get('status') as string) || 'draft';

    // Basic validation
    if (!title || !content) {
      throw new ValidationError('Title and content are required');
    }

    if (title.length > 200) {
      throw new ValidationError('Title must be less than 200 characters');
    }

    if (content.length > 10000) {
      throw new ValidationError('Content must be less than 10,000 characters');
    }

    logger.info('API: Creating new page', { title, slug, status });

    // In a real implementation, you would create the page here
    // const newPage = await payloadClient.createPage({ title, content, slug, status });

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Page created successfully',
        data: {
          id: 'new-page-id',
          title,
          slug,
          status,
          createdAt: new Date().toISOString(),
        },
      }),
      {
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    logger.error('API: Error creating page', { error });
    throw error;
  }
}
