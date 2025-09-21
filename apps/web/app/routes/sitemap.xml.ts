import { pagesClient } from '~/lib/clients/pages';
import { siteSettingsClient } from '~/lib/clients/site-settings';
import { generateSitemapUrls, generateSitemapXML } from '~/lib/sitemap';

export async function loader({ request }: { request: Request }) {
  try {
    // Get all published pages
    const pages = await pagesClient.getPages({
      where: {
        status: {
          equals: 'published',
        },
      },
      limit: 1000, // Reasonable limit for sitemap
    });

    // Get site settings for base URL
    const siteSettings = await siteSettingsClient.getSiteSettings();
    const baseUrl = new URL(request.url).origin;

    // Generate sitemap URLs using utility function
    const sitemapUrls = generateSitemapUrls(pages.docs || [], siteSettings, {
      baseUrl,
    });

    // Generate XML sitemap
    const sitemap = generateSitemapXML(sitemapUrls);

    return new Response(sitemap, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
      },
    });
  } catch (error) {
    console.error('Error generating sitemap:', error);

    // Return empty sitemap on error to avoid breaking crawlers
    const emptySitemap = generateSitemapXML([]);
    return new Response(emptySitemap, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=300', // Shorter cache on error
      },
    });
  }
}
