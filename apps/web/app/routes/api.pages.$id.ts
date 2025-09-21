import { type ActionFunctionArgs, type LoaderFunctionArgs } from 'react-router';
import { NotFoundError, ValidationError } from '~/lib/errorHandler';
import logger from '~/lib/logger';

// GET /api/pages/:id - Get a specific page
export async function loader({ params }: LoaderFunctionArgs) {
  try {
    const { id } = params;

    if (!id) {
      throw new ValidationError('Page ID is required');
    }

    logger.info('API: Fetching page', { id });

    // In a real implementation, you would fetch the page by ID
    // const page = await payloadClient.getPage(id);

    // For now, return a mock response
    const page = {
      id,
      title: 'Sample Page',
      content: 'This is sample content',
      slug: 'sample-page',
      status: 'published',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (!page) {
      throw new NotFoundError('Page not found');
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: page,
      }),
      {
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    logger.error('API: Error fetching page', { error, id: params.id });
    throw error;
  }
}

// PUT /api/pages/:id - Update a specific page
export async function action({ request, params }: ActionFunctionArgs) {
  try {
    const { id } = params;

    if (!id) {
      throw new ValidationError('Page ID is required');
    }

    const formData = await request.formData();
    const title = formData.get('title') as string;
    const content = formData.get('content') as string;
    const status = formData.get('status') as string;

    // Basic validation
    if (title && title.length > 200) {
      throw new ValidationError('Title must be less than 200 characters');
    }

    if (content && content.length > 10000) {
      throw new ValidationError('Content must be less than 10,000 characters');
    }

    if (status && !['draft', 'published'].includes(status)) {
      throw new ValidationError('Status must be either draft or published');
    }

    logger.info('API: Updating page', { id, title, status });

    // In a real implementation, you would update the page here
    // const updatedPage = await payloadClient.updatePage(id, { title, content, status });

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Page updated successfully',
        data: {
          id,
          title: title || 'Updated Page',
          content: content || 'Updated content',
          status: status || 'draft',
          updatedAt: new Date().toISOString(),
        },
      }),
      {
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    logger.error('API: Error updating page', { error, id: params.id });
    throw error;
  }
}
