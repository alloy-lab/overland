import type { Pages } from '~/lib/types/pages';
import type { SiteSettings } from '~/lib/types/site-settings';
import { generateStructuredData } from '~/lib/structuredData';

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
 * Completely transparent - automatically generates from CMS data
 */
export function StructuredData({
  baseUrl,
  siteSettings,
  page,
  breadcrumbs,
}: StructuredDataProps) {
  const structuredData = generateStructuredData({
    baseUrl,
    siteSettings,
    page,
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
  return generateStructuredData({
    baseUrl,
    siteSettings,
    page,
    breadcrumbs,
  });
}
