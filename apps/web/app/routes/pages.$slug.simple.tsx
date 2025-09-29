import { generateMetaTags, generateSEO } from '@alloylab/seo';
import type { MetaFunction } from 'react-router';
import { payloadClient } from '~/lib/payloadClient';
import type { Pages, SiteSettings } from '~/lib/types';

interface LoaderData {
  page: Pages;
  siteSettings: SiteSettings;
}

// Ultra-simple meta function using the SEO package helper
// Simple helper to convert HTML meta tags to React Router format
function htmlToReactRouterMeta(html: string) {
  return html
    .split('\n')
    .filter(line => line.trim())
    .map(line => {
      const titleMatch = line.match(/<title>(.*?)<\/title>/);
      if (titleMatch) return { title: titleMatch[1] };

      const metaMatch = line.match(
        /<meta\s+(?:name|property)="([^"]+)"\s+content="([^"]+)"\s*\/?>/
      );
      if (metaMatch) {
        const [, name, content] = metaMatch;
        if (name && content) {
          return {
            [name.startsWith('og:') ? 'property' : 'name']: name,
            content,
          };
        }
      }
      return null;
    })
    .filter((item): item is NonNullable<typeof item> => item !== null);
}

export const meta: MetaFunction<typeof loader> = ({ loaderData }) => {
  if (
    !loaderData ||
    typeof loaderData !== 'object' ||
    !('page' in loaderData) ||
    !('siteSettings' in loaderData)
  ) {
    return [
      { title: 'Not Found' },
      { name: 'description', content: 'Page not found' },
    ];
  }

  const { page, siteSettings } = loaderData as LoaderData;

  // Only generate SEO for published pages
  const seo =
    page.status === 'published'
      ? generateSEO(
          page as any, // Type assertion since we've verified status is 'published'
          siteSettings,
          'page'
        )
      : {
          title: 'Draft Page',
          description: 'This page is not yet published',
          keywords: undefined,
          image: undefined,
          url: undefined,
          type: 'website',
        };
  const metaTags = generateMetaTags(seo);
  return htmlToReactRouterMeta(metaTags);
};

export async function loader({
  params,
}: {
  params: { slug: string };
}): Promise<LoaderData> {
  try {
    const [page, siteSettings] = await Promise.all([
      payloadClient.getPage(params.slug),
      payloadClient.getSiteSettings(),
    ]);
    return { page, siteSettings };
  } catch (error) {
    console.error(`Error loading pages:`, error);
    throw new Response('Not Found', { status: 404 });
  }
}

export default function PagesDetail({
  loaderData,
}: {
  loaderData: LoaderData;
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
