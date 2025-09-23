import type { MetaFunction } from 'react-router';
import { payloadClient } from '~/lib/payloadClient';
import type { Pages } from '~/lib/types';

export const meta: MetaFunction = () => {
  return [
    { title: `Pages - My App` },
    { name: 'description', content: `Browse all pages` },
  ];
};

export async function loader() {
  try {
    const pages = await payloadClient.getPublishedPages();
    return { pages };
  } catch (error) {
    console.error(`Error loading pages:`, error);
    return { pages: [] };
  }
}

export default function PagesIndex({
  loaderData,
}: {
  loaderData: { pages: Pages[] };
}) {
  const { pages } = loaderData;

  return (
    <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
      <h1 className='text-3xl font-bold text-gray-900 mb-8'>Pages</h1>

      {pages.length === 0 ? (
        <p className='text-gray-600'>No pages found.</p>
      ) : (
        <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-3'>
          {pages.map(page => (
            <div
              key={page.id}
              className='bg-white rounded-lg shadow-md overflow-hidden'
            >
              {page.featuredImage && (
                <img
                  src={page.featuredImage.url}
                  alt={page.featuredImage.alt || page.title}
                  className='w-full h-48 object-cover'
                />
              )}
              <div className='p-6'>
                <h2 className='text-xl font-semibold text-gray-900 mb-2'>
                  <a
                    href={`/pages/${page.slug}`}
                    className='hover:text-blue-600'
                  >
                    {page.title}
                  </a>
                </h2>
                {page.excerpt && (
                  <p className='text-gray-600 mb-4'>{page.excerpt}</p>
                )}
                <div className='text-sm text-gray-500'>
                  {new Date(
                    page.publishedDate || page.createdAt
                  ).toLocaleDateString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
