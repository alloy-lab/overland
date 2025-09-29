import type { MetaFunction } from 'react-router';
import { payloadClient } from '~/lib/payloadClient';
import type { Pages } from '~/lib/types';

export const meta: MetaFunction<typeof loader> = ({ loaderData }) => {
  if (!loaderData || !(loaderData as any)?.page) {
    return [
      { title: 'Not Found' },
      { name: 'description', content: 'Pages not found' },
    ];
  }

  const page = (loaderData as any).page;
  return [
    { title: `${page.title} - My App` },
    {
      name: 'description',
      content: page.excerpt || page.seo?.description || 'Read more',
    },
  ];
};

export async function loader({ params }: { params: { slug: string } }) {
  try {
    const page = await payloadClient.getPage(params.slug);
    return { page };
  } catch (error) {
    console.error(`Error loading pages:`, error);
    throw new Response('Not Found', { status: 404 });
  }
}

export default function PagesDetail({
  loaderData,
}: {
  loaderData: { page: Pages };
}) {
  const { page } = loaderData;

  return (
    <div className='max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
      <article className='prose prose-lg max-w-none'>
        {page.featuredImage && (
          <img
            src={page.featuredImage.url}
            alt={page.featuredImage.alt || page.title}
            className='w-full h-64 object-cover rounded-lg mb-8'
          />
        )}

        <h1 className='text-4xl font-bold text-gray-900 mb-4'>{page.title}</h1>

        {page.excerpt && (
          <p className='text-xl text-gray-600 mb-8'>{page.excerpt}</p>
        )}

        <div className='prose prose-lg max-w-none'>
          {/* Rich text content would be rendered here */}
          <div
            dangerouslySetInnerHTML={{
              __html: 'Rich text content rendering needed',
            }}
          />
        </div>

        <div className='mt-8 pt-8 border-t border-gray-200'>
          <div className='text-sm text-gray-500'>
            Published:{' '}
            {new Date(
              page.publishedDate || page.createdAt
            ).toLocaleDateString()}
          </div>
        </div>
      </article>
    </div>
  );
}
