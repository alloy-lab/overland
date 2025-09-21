import { describe, expect, it } from 'vitest';
import {
  generateRobotsTxt,
  generateSitemapUrls,
  generateSitemapXML,
} from '~/lib/sitemap';
import type { Pages } from '~/lib/types/pages';
import type { SiteSettings } from '~/lib/types/site-settings';

describe('Sitemap Generation', () => {
  const mockSiteSettings: SiteSettings = {
    id: '1',
    title: 'Test Site',
    description: 'Test Description',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  };

  const mockPages: Pages[] = [
    {
      id: '1',
      title: 'Home Page',
      slug: 'home',
      status: 'published',
      content: [],
      seo: {
        title: 'Home Page SEO',
        description: 'Home page description',
        noIndex: false,
      },
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
    },
    {
      id: '2',
      title: 'About Page',
      slug: 'about',
      status: 'published',
      content: [],
      seo: {
        title: 'About Page SEO',
        description: 'About page description',
        noIndex: false,
      },
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
    },
    {
      id: '3',
      title: 'Private Page',
      slug: 'private',
      status: 'published',
      content: [],
      seo: {
        title: 'Private Page SEO',
        description: 'Private page description',
        noIndex: true, // Should be excluded
      },
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
    },
    {
      id: '4',
      title: 'Draft Page',
      slug: 'draft',
      status: 'draft', // Should be excluded
      content: [],
      seo: {
        title: 'Draft Page SEO',
        description: 'Draft page description',
        noIndex: false,
      },
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
    },
  ];

  describe('generateSitemapUrls', () => {
    it('should generate URLs for published pages only', () => {
      const urls = generateSitemapUrls(mockPages, mockSiteSettings, {
        baseUrl: 'https://example.com',
      });

      expect(urls).toHaveLength(3); // Homepage + 2 published pages
      expect(urls[0].loc).toBe('https://example.com');
      expect(urls[1].loc).toBe('https://example.com/pages/home');
      expect(urls[2].loc).toBe('https://example.com/pages/about');
    });

    it('should exclude pages with noIndex: true', () => {
      const urls = generateSitemapUrls(mockPages, mockSiteSettings, {
        baseUrl: 'https://example.com',
      });
      const privatePageUrl = urls.find(url => url.loc.includes('private'));
      expect(privatePageUrl).toBeUndefined();
    });

    it('should exclude draft pages', () => {
      const urls = generateSitemapUrls(mockPages, mockSiteSettings, {
        baseUrl: 'https://example.com',
      });
      const draftPageUrl = urls.find(url => url.loc.includes('draft'));
      expect(draftPageUrl).toBeUndefined();
    });

    it('should set correct priorities', () => {
      const urls = generateSitemapUrls(mockPages, mockSiteSettings, {
        baseUrl: 'https://example.com',
      });

      expect(urls[0].priority).toBe(1.0); // Homepage
      expect(urls[1].priority).toBe(0.8); // Pages
      expect(urls[2].priority).toBe(0.8); // Pages
    });

    it('should set correct changefreq', () => {
      const urls = generateSitemapUrls(mockPages, mockSiteSettings, {
        baseUrl: 'https://example.com',
      });

      expect(urls[0].changefreq).toBe('daily'); // Homepage
      expect(urls[1].changefreq).toBe('weekly'); // Pages
      expect(urls[2].changefreq).toBe('weekly'); // Pages
    });
  });

  describe('generateSitemapXML', () => {
    it('should generate valid XML sitemap', () => {
      const urls = generateSitemapUrls(mockPages, mockSiteSettings, {
        baseUrl: 'https://example.com',
      });
      const xml = generateSitemapXML(urls);

      expect(xml).toContain('<?xml version="1.0" encoding="UTF-8"?>');
      expect(xml).toContain(
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'
      );
      expect(xml).toContain('</urlset>');
      expect(xml).toContain('<loc>https://example.com</loc>');
      expect(xml).toContain('<loc>https://example.com/pages/home</loc>');
      expect(xml).toContain('<loc>https://example.com/pages/about</loc>');
    });

    it('should escape XML special characters', () => {
      const urls = [
        {
          loc: 'https://example.com/pages/test&page',
          lastmod: '2024-01-01T00:00:00.000Z',
          changefreq: 'weekly' as const,
          priority: 0.8,
        },
      ];
      const xml = generateSitemapXML(urls);

      expect(xml).toContain(
        '<loc>https://example.com/pages/test&amp;page</loc>'
      );
    });
  });

  describe('generateRobotsTxt', () => {
    it('should generate valid robots.txt', () => {
      const robotsTxt = generateRobotsTxt('https://example.com');

      expect(robotsTxt).toContain('User-agent: *');
      expect(robotsTxt).toContain('Allow: /');
      expect(robotsTxt).toContain('Disallow: /admin/');
      expect(robotsTxt).toContain('Disallow: /api/');
      expect(robotsTxt).toContain('Disallow: /_next/');
      expect(robotsTxt).toContain('Disallow: /build/');
      expect(robotsTxt).toContain('Disallow: /uploads/');
      expect(robotsTxt).toContain('Sitemap: https://example.com/sitemap.xml');
    });

    it('should include sitemap reference', () => {
      const robotsTxt = generateRobotsTxt('https://example.com');
      expect(robotsTxt).toContain('Sitemap: https://example.com/sitemap.xml');
    });
  });
});
