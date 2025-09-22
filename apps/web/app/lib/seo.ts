import { generateStructuredData } from './structuredData';
import type { Pages, SiteSettings } from './types';

export interface SEOData {
  title: string;
  description: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: string;
  structuredData?: string;
}

export function generateSEO(
  data: Pages | SiteSettings,
  siteSettings: SiteSettings,
  type: 'page' | 'home' = 'home',
  baseUrl?: string,
  breadcrumbs?: Array<{ name: string; url: string }>
): SEOData {
  const baseTitle = siteSettings.title;
  const baseDescription = siteSettings.description;

  let title = baseTitle;
  let description = baseDescription;
  let keywords: string | undefined;
  let image: string | undefined;

  if (type === 'page' && 'title' in data) {
    const page = data as Pages;
    title = page.seo?.title || `${page.title} | ${baseTitle}`;
    description = page.seo?.description || page.excerpt || baseDescription;
    keywords = page.seo?.keywords;
    image = page.seo?.image?.url || page.featuredImage?.url;
  }

  const seoData: SEOData = {
    title: title || 'Overland Stack',
    description: description || 'A modern web development stack',
    keywords,
    image,
    url:
      type === 'page' && 'slug' in data
        ? `${baseUrl}/pages/${data.slug}`
        : baseUrl,
    type: type === 'home' ? 'website' : 'article',
  };

  // Add structured data if baseUrl is provided
  if (baseUrl) {
    seoData.structuredData = generateStructuredData({
      baseUrl,
      siteSettings,
      page: type === 'page' ? (data as Pages) : undefined,
      breadcrumbs,
    });
  }

  return seoData;
}

export function generateMetaTags(seo: SEOData): string {
  const tags = [
    `<title>${seo.title}</title>`,
    `<meta name="description" content="${seo.description}" />`,
  ];

  if (seo.keywords) {
    tags.push(`<meta name="keywords" content="${seo.keywords}" />`);
  }

  // Open Graph tags
  tags.push(
    `<meta property="og:title" content="${seo.title}" />`,
    `<meta property="og:description" content="${seo.description}" />`,
    `<meta property="og:type" content="${seo.type || 'website'}" />`
  );

  if (seo.url) {
    tags.push(`<meta property="og:url" content="${seo.url}" />`);
  }

  if (seo.image) {
    tags.push(
      `<meta property="og:image" content="${seo.image}" />`,
      `<meta name="twitter:card" content="summary_large_image" />`,
      `<meta name="twitter:image" content="${seo.image}" />`
    );
  }

  // Twitter tags
  tags.push(
    `<meta name="twitter:title" content="${seo.title}" />`,
    `<meta name="twitter:description" content="${seo.description}" />`
  );

  return tags.join('\n    ');
}
