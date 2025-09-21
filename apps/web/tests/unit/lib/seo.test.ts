import { describe, expect, it } from 'vitest';
import { generateMetaTags, generateSEO } from '~/lib/seo';
import type { Pages, SiteSettings } from '~/lib/types';

describe('SEO Utilities', () => {
  const mockSiteSettings: SiteSettings = {
    title: 'Overland Stack',
    description: 'A modern full-stack application',
    logo: {
      url: 'https://example.com/logo.png',
      alt: 'Overland Stack Logo',
    },
    social: {
      twitter: '@overlandstack',
      facebook: 'overlandstack',
    },
    seo: {
      title: 'Overland Stack - Modern Full-Stack App',
      description: 'Build modern applications with Overland Stack',
      keywords: 'full-stack, react, node, typescript',
    },
  };

  const mockPage: Pages = {
    id: '1',
    title: 'About Us',
    slug: 'about',
    excerpt: 'Learn more about our company',
    content: {},
    status: 'published',
    seo: {
      title: 'About Us - Overland Stack',
      description: 'Learn more about our company and mission',
      keywords: 'about, company, mission',
      image: {
        url: 'https://example.com/about-image.jpg',
        alt: 'About Us Image',
      },
    },
    featuredImage: {
      url: 'https://example.com/featured.jpg',
      alt: 'Featured Image',
    },
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  };

  describe('generateSEO', () => {
    it('should generate SEO data for home page', () => {
      const result = generateSEO(mockSiteSettings, mockSiteSettings, 'home');

      expect(result).toEqual({
        title: 'Overland Stack',
        description: 'A modern full-stack application',
        keywords: undefined,
        image: undefined,
        type: 'website',
      });
    });

    it('should generate SEO data for page', () => {
      const result = generateSEO(
        mockPage,
        mockSiteSettings,
        'page',
        'https://example.com'
      );

      expect(result).toEqual({
        title: 'About Us - Overland Stack',
        description: 'Learn more about our company and mission',
        keywords: 'about, company, mission',
        image: 'https://example.com/about-image.jpg',
        url: 'https://example.com/pages/about',
        type: 'article',
        structuredData: expect.any(String),
      });
    });

    it('should fallback to page excerpt when SEO description is missing', () => {
      const pageWithoutSeoDescription = {
        ...mockPage,
        seo: {
          ...mockPage.seo,
          description: undefined,
        },
      };

      const result = generateSEO(
        pageWithoutSeoDescription,
        mockSiteSettings,
        'page'
      );

      expect(result.description).toBe('Learn more about our company');
    });

    it('should fallback to featured image when SEO image is missing', () => {
      const pageWithoutSeoImage = {
        ...mockPage,
        seo: {
          ...mockPage.seo,
          image: undefined,
        },
      };

      const result = generateSEO(pageWithoutSeoImage, mockSiteSettings, 'page');

      expect(result.image).toBe('https://example.com/featured.jpg');
    });

    it('should fallback to site title when page SEO title is missing', () => {
      const pageWithoutSeoTitle = {
        ...mockPage,
        seo: {
          ...mockPage.seo,
          title: undefined,
        },
      };

      const result = generateSEO(pageWithoutSeoTitle, mockSiteSettings, 'page');

      expect(result.title).toBe('About Us | Overland Stack');
    });
  });

  describe('generateMetaTags', () => {
    it('should generate basic meta tags', () => {
      const seoData = {
        title: 'Test Page',
        description: 'Test description',
        type: 'article',
      };

      const result = generateMetaTags(seoData);

      expect(result).toContain('<title>Test Page</title>');
      expect(result).toContain(
        '<meta name="description" content="Test description" />'
      );
      expect(result).toContain(
        '<meta property="og:title" content="Test Page" />'
      );
      expect(result).toContain(
        '<meta property="og:description" content="Test description" />'
      );
      expect(result).toContain('<meta property="og:type" content="article" />');
      expect(result).toContain(
        '<meta name="twitter:title" content="Test Page" />'
      );
      expect(result).toContain(
        '<meta name="twitter:description" content="Test description" />'
      );
    });

    it('should include keywords when provided', () => {
      const seoData = {
        title: 'Test Page',
        description: 'Test description',
        keywords: 'test, keywords',
        type: 'article',
      };

      const result = generateMetaTags(seoData);

      expect(result).toContain(
        '<meta name="keywords" content="test, keywords" />'
      );
    });

    it('should include URL when provided', () => {
      const seoData = {
        title: 'Test Page',
        description: 'Test description',
        url: 'https://example.com/test',
        type: 'article',
      };

      const result = generateMetaTags(seoData);

      expect(result).toContain(
        '<meta property="og:url" content="https://example.com/test" />'
      );
    });

    it('should include image tags when provided', () => {
      const seoData = {
        title: 'Test Page',
        description: 'Test description',
        image: 'https://example.com/image.jpg',
        type: 'article',
      };

      const result = generateMetaTags(seoData);

      expect(result).toContain(
        '<meta property="og:image" content="https://example.com/image.jpg" />'
      );
      expect(result).toContain(
        '<meta name="twitter:card" content="summary_large_image" />'
      );
      expect(result).toContain(
        '<meta name="twitter:image" content="https://example.com/image.jpg" />'
      );
    });

    it('should default to website type when not provided', () => {
      const seoData = {
        title: 'Test Page',
        description: 'Test description',
      };

      const result = generateMetaTags(seoData);

      expect(result).toContain('<meta property="og:type" content="website" />');
    });
  });
});
