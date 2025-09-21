import type { Pages } from './types/pages';
import type { SiteSettings } from './types/site-settings';

export interface SitemapUrl {
  loc: string;
  lastmod: string;
  changefreq:
    | 'always'
    | 'hourly'
    | 'daily'
    | 'weekly'
    | 'monthly'
    | 'yearly'
    | 'never';
  priority: number;
}

export interface SitemapConfig {
  baseUrl: string;
  includeHomepage?: boolean;
  homepagePriority?: number;
  pagePriority?: number;
  defaultChangefreq?: SitemapUrl['changefreq'];
}

/**
 * Generate sitemap URLs from Pages collection
 * Completely transparent - no developer configuration needed
 */
export function generateSitemapUrls(
  pages: Pages[],
  siteSettings: SiteSettings,
  config: Partial<SitemapConfig> = {}
): SitemapUrl[] {
  const {
    baseUrl = '',
    includeHomepage = true,
    homepagePriority = 1.0,
    pagePriority = 0.8,
    defaultChangefreq = 'weekly',
  } = config;

  const urls: SitemapUrl[] = [];
  const now = new Date().toISOString();

  // Add homepage if enabled
  if (includeHomepage) {
    urls.push({
      loc: baseUrl,
      lastmod: now,
      changefreq: 'daily',
      priority: homepagePriority,
    });
  }

  // Add all published pages that should be indexed
  pages.forEach(page => {
    if (shouldIncludePage(page)) {
      const url = `${baseUrl}/pages/${page.slug}`;
      const lastmod = page.updatedAt || page.publishedDate || now;

      urls.push({
        loc: url,
        lastmod: new Date(lastmod).toISOString(),
        changefreq: defaultChangefreq,
        priority: pagePriority,
      });
    }
  });

  return urls;
}

/**
 * Generate XML sitemap from URLs
 */
export function generateSitemapXML(urls: SitemapUrl[]): string {
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

  urls.forEach(url => {
    xml += '  <url>\n';
    xml += `    <loc>${escapeXml(url.loc)}</loc>\n`;
    xml += `    <lastmod>${url.lastmod}</lastmod>\n`;
    xml += `    <changefreq>${url.changefreq}</changefreq>\n`;
    xml += `    <priority>${url.priority}</priority>\n`;
    xml += '  </url>\n';
  });

  xml += '</urlset>';
  return xml;
}

/**
 * Determine if a page should be included in sitemap
 * Transparent logic - no developer configuration needed
 */
function shouldIncludePage(page: Pages): boolean {
  // Must have a slug
  if (!page.slug) return false;

  // Must be published
  if (page.status !== 'published') return false;

  // Must not be excluded from indexing
  if (page.seo?.noIndex) return false;

  return true;
}

/**
 * Escape XML special characters
 */
function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Generate robots.txt content
 */
export function generateRobotsTxt(baseUrl: string): string {
  let robots = '# Robots.txt for Overland Stack\n';
  robots += '# Generated automatically\n\n';

  // Allow all crawlers by default
  robots += 'User-agent: *\n';
  robots += 'Allow: /\n\n';

  // Disallow admin and API routes
  robots += '# Disallow admin and API routes\n';
  robots += 'Disallow: /admin/\n';
  robots += 'Disallow: /api/\n';
  robots += 'Disallow: /_next/\n';
  robots += 'Disallow: /build/\n';
  robots += 'Disallow: /uploads/\n\n';

  // Add sitemap reference
  robots += `# Sitemap\n`;
  robots += `Sitemap: ${baseUrl}/sitemap.xml\n`;

  return robots;
}
