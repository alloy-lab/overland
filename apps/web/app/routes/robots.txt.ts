import { siteSettingsClient } from '~/lib/clients/site-settings';
import { generateRobotsTxt } from '~/lib/sitemap';

export async function loader({ request }: { request: Request }) {
  try {
    // Get site settings for base URL
    const siteSettings = await siteSettingsClient.getSiteSettings();
    const baseUrl = new URL(request.url).origin;

    // Generate robots.txt content using utility function
    const robotsTxt = generateRobotsTxt(baseUrl);

    return new Response(robotsTxt, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain',
        'Cache-Control': 'public, max-age=86400', // Cache for 24 hours
      },
    });
  } catch (error) {
    console.error('Error generating robots.txt:', error);

    // Return default robots.txt on error
    const defaultRobotsTxt = generateRobotsTxt(new URL(request.url).origin);
    return new Response(defaultRobotsTxt, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain',
        'Cache-Control': 'public, max-age=3600', // Shorter cache on error
      },
    });
  }
}
