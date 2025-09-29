import { generateStructuredData } from '~/lib/structuredData';
import type { Pages } from '~/lib/types/pages';
import type { SiteSettings } from '~/lib/types/site-settings';

interface StructuredDataProps {
  baseUrl: string;
  siteSettings: SiteSettings;
  page?: Pages;
  breadcrumbs?: Array<{
    name: string;
    url: string;
  }>;
}

/**
 * StructuredData component for injecting JSON-LD into pages
 */
export function StructuredData({
  baseUrl,
  siteSettings,
  page,
  breadcrumbs,
}: StructuredDataProps) {
  // Only generate structured data for published pages
  if (!page || page.status !== 'published') {
    return null;
  }

  const structuredData = generateStructuredData({
    baseUrl,
    siteSettings,
    page: page as any, // Type assertion since we've verified status is 'published'
    breadcrumbs,
  });

  return (
    <script
      type='application/ld+json'
      dangerouslySetInnerHTML={{ __html: structuredData }}
    />
  );
}

/**
 * Hook for generating structured data in components
 */
export function useStructuredData(
  baseUrl: string,
  siteSettings: SiteSettings,
  page?: Pages,
  breadcrumbs?: Array<{ name: string; url: string }>
) {
  // Only generate structured data for published pages
  if (!page || page.status !== 'published') {
    return null;
  }

  return generateStructuredData({
    baseUrl,
    siteSettings,
    page: page as any, // Type assertion since we've verified status is 'published'
    breadcrumbs,
  });
}
