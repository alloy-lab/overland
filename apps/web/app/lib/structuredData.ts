import type { Pages } from './types/pages';
import type { SiteSettings } from './types/site-settings';

export interface StructuredDataConfig {
  baseUrl: string;
  siteSettings: SiteSettings;
  page?: Pages;
  breadcrumbs?: Array<{
    name: string;
    url: string;
  }>;
}

/**
 * Generate JSON-LD structured data
 * Completely transparent - no developer configuration needed
 */
export function generateStructuredData(config: StructuredDataConfig): string {
  const { baseUrl, siteSettings, page, breadcrumbs } = config;

  const structuredData: any[] = [];

  // Website/Organization schema (always included)
  structuredData.push(generateWebsiteSchema(baseUrl, siteSettings));

  // Page-specific schemas
  if (page) {
    structuredData.push(generateArticleSchema(baseUrl, siteSettings, page));
  }

  // Breadcrumb schema (if provided)
  if (breadcrumbs && breadcrumbs.length > 0) {
    structuredData.push(generateBreadcrumbSchema(baseUrl, breadcrumbs));
  }

  return JSON.stringify(structuredData, null, 2);
}

/**
 * Generate Website/Organization schema
 */
function generateWebsiteSchema(
  baseUrl: string,
  siteSettings: SiteSettings
): any {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: siteSettings.title,
    description: siteSettings.description,
    url: baseUrl,
    publisher: {
      '@type': 'Organization',
      name: siteSettings.title,
      description: siteSettings.description,
      url: baseUrl,
      ...(siteSettings.logo && {
        logo: {
          '@type': 'ImageObject',
          url: siteSettings.logo.url,
        },
      }),
      ...(siteSettings.social && {
        sameAs: Object.values(siteSettings.social).filter(Boolean),
      }),
      ...(siteSettings.contact && {
        contactPoint: {
          '@type': 'ContactPoint',
          ...(siteSettings.contact.email && {
            email: siteSettings.contact.email,
          }),
          ...(siteSettings.contact.phone && {
            telephone: siteSettings.contact.phone,
          }),
        },
      }),
    },
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${baseUrl}/search?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

/**
 * Generate Article schema for Pages
 */
function generateArticleSchema(
  baseUrl: string,
  siteSettings: SiteSettings,
  page: Pages
): any {
  const pageUrl = `${baseUrl}/pages/${page.slug}`;
  const publishedDate = page.publishedDate || page.createdAt;
  const modifiedDate = page.updatedAt;

  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: page.title,
    description:
      page.seo?.description || page.excerpt || siteSettings.description,
    url: pageUrl,
    datePublished: publishedDate,
    dateModified: modifiedDate,
    author: {
      '@type': 'Organization',
      name: siteSettings.title,
      url: baseUrl,
    },
    publisher: {
      '@type': 'Organization',
      name: siteSettings.title,
      url: baseUrl,
      ...(siteSettings.logo && {
        logo: {
          '@type': 'ImageObject',
          url: siteSettings.logo.url,
        },
      }),
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': pageUrl,
    },
    ...(page.featuredImage && {
      image: {
        '@type': 'ImageObject',
        url: page.featuredImage.url,
        ...(page.featuredImage.alt && { caption: page.featuredImage.alt }),
      },
    }),
    ...(page.seo?.keywords && {
      keywords: page.seo.keywords,
    }),
  };
}

/**
 * Generate Breadcrumb schema
 */
function generateBreadcrumbSchema(
  baseUrl: string,
  breadcrumbs: Array<{ name: string; url: string }>
): any {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbs.map((crumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: crumb.name,
      item: crumb.url.startsWith('http') ? crumb.url : `${baseUrl}${crumb.url}`,
    })),
  };
}

/**
 * Generate FAQ schema (for future use)
 */
export function generateFAQSchema(
  faqs: Array<{ question: string; answer: string }>
): any {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}

/**
 * Generate LocalBusiness schema (for future use)
 */
export function generateLocalBusinessSchema(
  baseUrl: string,
  siteSettings: SiteSettings
): any {
  if (!siteSettings.contact?.address) return null;

  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: siteSettings.title,
    description: siteSettings.description,
    url: baseUrl,
    ...(siteSettings.logo && {
      image: siteSettings.logo.url,
    }),
    address: {
      '@type': 'PostalAddress',
      streetAddress: siteSettings.contact.address,
    },
    ...(siteSettings.contact.phone && {
      telephone: siteSettings.contact.phone,
    }),
    ...(siteSettings.contact.email && {
      email: siteSettings.contact.email,
    }),
  };
}

/**
 * Generate Product schema (for future use)
 */
export function generateProductSchema(
  baseUrl: string,
  product: {
    name: string;
    description: string;
    price?: number;
    currency?: string;
    image?: string;
    availability?: string;
  }
): any {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    url: baseUrl,
    ...(product.image && {
      image: product.image,
    }),
    ...(product.price &&
      product.currency && {
        offers: {
          '@type': 'Offer',
          price: product.price,
          priceCurrency: product.currency,
          availability: product.availability || 'https://schema.org/InStock',
        },
      }),
  };
}
