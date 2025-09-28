import { generateMetaTags, generateSEO } from '@alloylab/seo';
import type { MetaFunction } from 'react-router';
import { payloadClient } from '~/lib/payloadClient';
import type { SiteSettings } from '~/lib/types';

interface LoaderData {
  siteSettings: SiteSettings;
}

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
  if (!loaderData?.siteSettings) {
    return [
      { title: 'Not Found' },
      { name: 'description', content: 'Page not found' },
    ];
  }

  const seo = generateSEO(
    loaderData.siteSettings,
    loaderData.siteSettings,
    'home'
  );
  const metaTags = generateMetaTags(seo);
  return htmlToReactRouterMeta(metaTags);
};

export async function loader(): Promise<LoaderData> {
  try {
    const siteSettings = await payloadClient.getSiteSettings();
    return { siteSettings };
  } catch (error) {
    console.error(`Error loading site settings:`, error);
    throw new Response('Not Found', { status: 404 });
  }
}

export default function HomePage({ loaderData }: { loaderData: LoaderData }) {
  const { siteSettings } = loaderData;

  return (
    <div className='max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
      <div className='text-center'>
        <h1 className='text-4xl font-bold text-gray-900 mb-4'>
          {siteSettings.siteName || 'Welcome'}
        </h1>

        {siteSettings.siteDescription && (
          <p className='text-xl text-gray-600 mb-8'>
            {siteSettings.siteDescription}
          </p>
        )}

        {siteSettings.logo?.url && (
          <img
            src={siteSettings.logo.url}
            alt={siteSettings.logo.alt || siteSettings.siteName || 'Logo'}
            className='mx-auto h-32 w-auto mb-8'
          />
        )}

        <div className='prose prose-lg max-w-none mx-auto'>
          <p>Welcome to our website! This is the home page.</p>
        </div>
      </div>
    </div>
  );
}
