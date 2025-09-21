import { describe, expect, it } from 'vitest';
import {
  generateStructuredData,
  generateFAQSchema,
  generateLocalBusinessSchema,
  generateProductSchema,
} from '~/lib/structuredData';
import type { Pages } from '~/lib/types/pages';
import type { SiteSettings } from '~/lib/types/site-settings';

describe('Structured Data Generation', () => {
  const mockSiteSettings: SiteSettings = {
    id: '1',
    title: 'Test Site',
    description: 'Test Description',
    logo: {
      id: '1',
      url: 'https://example.com/logo.png',
      alt: 'Test Site Logo',
      filename: 'logo.png',
      mimeType: 'image/png',
      filesize: 1000,
      width: 200,
      height: 100,
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
    },
    social: {
      twitter: 'https://twitter.com/testsite',
      github: 'https://github.com/testsite',
    },
    contact: {
      email: 'contact@example.com',
      phone: '+1-555-123-4567',
      address: '123 Test St, Test City, TC 12345',
    },
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  };

  const mockPage: Pages = {
    id: '1',
    title: 'Test Page',
    slug: 'test-page',
    status: 'published',
    content: [],
    excerpt: 'This is a test page excerpt',
    featuredImage: {
      id: '2',
      url: 'https://example.com/page-image.jpg',
      alt: 'Test Page Image',
      filename: 'page-image.jpg',
      mimeType: 'image/jpeg',
      filesize: 2000,
      width: 800,
      height: 600,
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
    },
    seo: {
      title: 'Test Page SEO Title',
      description: 'Test page SEO description',
      keywords: 'test, page, seo',
      noIndex: false,
    },
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-02T00:00:00.000Z',
    publishedDate: '2024-01-01T12:00:00.000Z',
  };

  describe('generateStructuredData', () => {
    it('should generate website schema for homepage', () => {
      const structuredData = generateStructuredData({
        baseUrl: 'https://example.com',
        siteSettings: mockSiteSettings,
      });

      const parsed = JSON.parse(structuredData);
      expect(parsed).toHaveLength(1);
      expect(parsed[0]['@context']).toBe('https://schema.org');
      expect(parsed[0]['@type']).toBe('WebSite');
      expect(parsed[0].name).toBe('Test Site');
      expect(parsed[0].url).toBe('https://example.com');
    });

    it('should generate article schema for pages', () => {
      const structuredData = generateStructuredData({
        baseUrl: 'https://example.com',
        siteSettings: mockSiteSettings,
        page: mockPage,
      });

      const parsed = JSON.parse(structuredData);
      expect(parsed).toHaveLength(2); // Website + Article

      const articleSchema = parsed.find(
        (item: any) => item['@type'] === 'Article'
      );
      expect(articleSchema).toBeDefined();
      expect(articleSchema.headline).toBe('Test Page');
      expect(articleSchema.url).toBe('https://example.com/pages/test-page');
      expect(articleSchema.datePublished).toBe('2024-01-01T12:00:00.000Z');
      expect(articleSchema.dateModified).toBe('2024-01-02T00:00:00.000Z');
    });

    it('should generate breadcrumb schema when provided', () => {
      const breadcrumbs = [
        { name: 'Home', url: '/' },
        { name: 'Category', url: '/category' },
        { name: 'Page', url: '/category/page' },
      ];

      const structuredData = generateStructuredData({
        baseUrl: 'https://example.com',
        siteSettings: mockSiteSettings,
        page: mockPage,
        breadcrumbs,
      });

      const parsed = JSON.parse(structuredData);
      expect(parsed).toHaveLength(3); // Website + Article + Breadcrumb

      const breadcrumbSchema = parsed.find(
        (item: any) => item['@type'] === 'BreadcrumbList'
      );
      expect(breadcrumbSchema).toBeDefined();
      expect(breadcrumbSchema.itemListElement).toHaveLength(3);
      expect(breadcrumbSchema.itemListElement[0].name).toBe('Home');
      expect(breadcrumbSchema.itemListElement[0].item).toBe(
        'https://example.com/'
      );
    });

    it('should include organization details in website schema', () => {
      const structuredData = generateStructuredData({
        baseUrl: 'https://example.com',
        siteSettings: mockSiteSettings,
      });

      const parsed = JSON.parse(structuredData);
      const websiteSchema = parsed[0];

      expect(websiteSchema.publisher['@type']).toBe('Organization');
      expect(websiteSchema.publisher.logo['@type']).toBe('ImageObject');
      expect(websiteSchema.publisher.logo.url).toBe(
        'https://example.com/logo.png'
      );
      expect(websiteSchema.publisher.sameAs).toEqual([
        'https://twitter.com/testsite',
        'https://github.com/testsite',
      ]);
    });

    it('should include search action in website schema', () => {
      const structuredData = generateStructuredData({
        baseUrl: 'https://example.com',
        siteSettings: mockSiteSettings,
      });

      const parsed = JSON.parse(structuredData);
      const websiteSchema = parsed[0];

      expect(websiteSchema.potentialAction['@type']).toBe('SearchAction');
      expect(websiteSchema.potentialAction.target.urlTemplate).toBe(
        'https://example.com/search?q={search_term_string}'
      );
    });
  });

  describe('generateFAQSchema', () => {
    it('should generate FAQ schema', () => {
      const faqs = [
        {
          question: 'What is this site about?',
          answer: 'This site is about testing structured data.',
        },
        {
          question: 'How do I contact you?',
          answer: 'You can contact us via email or phone.',
        },
      ];

      const schema = generateFAQSchema(faqs);

      expect(schema['@context']).toBe('https://schema.org');
      expect(schema['@type']).toBe('FAQPage');
      expect(schema.mainEntity).toHaveLength(2);
      expect(schema.mainEntity[0]['@type']).toBe('Question');
      expect(schema.mainEntity[0].name).toBe('What is this site about?');
      expect(schema.mainEntity[0].acceptedAnswer['@type']).toBe('Answer');
    });
  });

  describe('generateLocalBusinessSchema', () => {
    it('should generate local business schema when address is provided', () => {
      const schema = generateLocalBusinessSchema(
        'https://example.com',
        mockSiteSettings
      );

      expect(schema).toBeDefined();
      expect(schema['@context']).toBe('https://schema.org');
      expect(schema['@type']).toBe('LocalBusiness');
      expect(schema.name).toBe('Test Site');
      expect(schema.address['@type']).toBe('PostalAddress');
      expect(schema.address.streetAddress).toBe(
        '123 Test St, Test City, TC 12345'
      );
      expect(schema.telephone).toBe('+1-555-123-4567');
      expect(schema.email).toBe('contact@example.com');
    });

    it('should return null when no address is provided', () => {
      const siteSettingsWithoutAddress = {
        ...mockSiteSettings,
        contact: { email: 'test@example.com' },
      };

      const schema = generateLocalBusinessSchema(
        'https://example.com',
        siteSettingsWithoutAddress
      );
      expect(schema).toBeNull();
    });
  });

  describe('generateProductSchema', () => {
    it('should generate product schema', () => {
      const product = {
        name: 'Test Product',
        description: 'A great test product',
        price: 29.99,
        currency: 'USD',
        image: 'https://example.com/product.jpg',
        availability: 'https://schema.org/InStock',
      };

      const schema = generateProductSchema('https://example.com', product);

      expect(schema['@context']).toBe('https://schema.org');
      expect(schema['@type']).toBe('Product');
      expect(schema.name).toBe('Test Product');
      expect(schema.offers['@type']).toBe('Offer');
      expect(schema.offers.price).toBe(29.99);
      expect(schema.offers.priceCurrency).toBe('USD');
    });

    it('should generate product schema without offers when price is not provided', () => {
      const product = {
        name: 'Test Product',
        description: 'A great test product',
        image: 'https://example.com/product.jpg',
      };

      const schema = generateProductSchema('https://example.com', product);

      expect(schema['@context']).toBe('https://schema.org');
      expect(schema['@type']).toBe('Product');
      expect(schema.name).toBe('Test Product');
      expect(schema.offers).toBeUndefined();
    });
  });
});
