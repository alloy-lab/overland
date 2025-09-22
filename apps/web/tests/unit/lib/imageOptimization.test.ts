import { describe, expect, it, vi } from 'vitest';
import {
  autoOptimizeImage,
  batchOptimizeImages,
  extractImageMetadata,
  generateImagePlaceholder,
  generateResponsiveImages,
  optimizeImage,
} from '~/lib/imageOptimization';

// Mock Sharp
vi.mock('sharp', () => ({
  default: vi.fn(() => ({
    resize: vi.fn().mockReturnThis(),
    webp: vi.fn().mockReturnThis(),
    jpeg: vi.fn().mockReturnThis(),
    png: vi.fn().mockReturnThis(),
    avif: vi.fn().mockReturnThis(),
    blur: vi.fn().mockReturnThis(),
    toBuffer: vi.fn().mockResolvedValue(Buffer.from('optimized-image-data')),
    metadata: vi.fn().mockResolvedValue({
      width: 800,
      height: 600,
      format: 'jpeg',
      hasAlpha: false,
      density: 72,
      space: 'srgb',
    }),
  })),
}));

describe('Image Optimization', () => {
  const mockImageBuffer = Buffer.from('mock-image-data');
  const mockImageBufferLarge = Buffer.from(
    'mock-large-image-data'.repeat(1000)
  );

  describe('optimizeImage', () => {
    it('should optimize image with default settings', async () => {
      const result = await optimizeImage(mockImageBuffer);

      expect(result).toMatchObject({
        format: 'jpeg',
        width: 800,
        height: 600,
        size: expect.any(Number),
        originalSize: mockImageBuffer.length,
        compressionRatio: expect.any(Number),
      });
    });

    it('should optimize image with custom options', async () => {
      const result = await optimizeImage(mockImageBuffer, {
        width: 400,
        height: 300,
        quality: 90,
        format: 'webp',
        fit: 'cover',
      });

      expect(result).toMatchObject({
        format: 'jpeg',
        width: 800,
        height: 600,
        size: expect.any(Number),
        originalSize: mockImageBuffer.length,
        compressionRatio: expect.any(Number),
      });
    });
  });

  describe('generateResponsiveImages', () => {
    it('should generate multiple image sizes', async () => {
      const sizes = [320, 640, 1024];
      const results = await generateResponsiveImages(mockImageBuffer, sizes);

      expect(results).toHaveLength(3);
      results.forEach((result, index) => {
        expect(result).toMatchObject({
          size: sizes[index],
          buffer: expect.any(Buffer),
          format: 'jpeg',
        });
      });
    });

    it('should use default sizes when none provided', async () => {
      const results = await generateResponsiveImages(mockImageBuffer);

      expect(results).toHaveLength(4);
      expect(results.map(r => r.size)).toEqual([320, 640, 1024, 1920]);
    });
  });

  describe('generateImagePlaceholder', () => {
    it('should generate base64 placeholder', async () => {
      const placeholder = await generateImagePlaceholder(mockImageBuffer, 20);

      expect(placeholder).toMatch(/^data:image\/jpeg;base64,/);
    });

    it('should generate placeholder with custom dimensions', async () => {
      const placeholder = await generateImagePlaceholder(
        mockImageBuffer,
        40,
        30
      );

      expect(placeholder).toMatch(/^data:image\/jpeg;base64,/);
    });
  });

  describe('extractImageMetadata', () => {
    it('should extract image metadata', async () => {
      const metadata = await extractImageMetadata(mockImageBuffer);

      expect(metadata).toMatchObject({
        width: 800,
        height: 600,
        format: 'jpeg',
        size: mockImageBuffer.length,
        hasAlpha: false,
        density: 72,
        space: 'srgb',
      });
    });
  });

  describe('autoOptimizeImage', () => {
    it('should auto-optimize JPEG image', async () => {
      const result = await autoOptimizeImage(mockImageBuffer, 'image/jpeg');

      expect(result).toMatchObject({
        format: 'jpeg',
        width: 800,
        height: 600,
        size: expect.any(Number),
        originalSize: mockImageBuffer.length,
        compressionRatio: expect.any(Number),
      });
    });

    it('should auto-optimize PNG image with alpha', async () => {
      const result = await autoOptimizeImage(mockImageBuffer, 'image/png');

      expect(result).toMatchObject({
        format: 'jpeg', // Mock returns jpeg format
        width: 800,
        height: 600,
        size: expect.any(Number),
        originalSize: mockImageBuffer.length,
        compressionRatio: expect.any(Number),
      });
    });

    it('should resize large images', async () => {
      const result = await autoOptimizeImage(
        mockImageBufferLarge,
        'image/jpeg'
      );

      expect(result).toMatchObject({
        format: 'jpeg',
        width: 800,
        height: 600,
        size: expect.any(Number),
        originalSize: mockImageBufferLarge.length,
        compressionRatio: expect.any(Number),
      });
    });
  });

  describe('batchOptimizeImages', () => {
    it('should optimize multiple images', async () => {
      const images = [
        {
          buffer: mockImageBuffer,
          filename: 'image1.jpg',
          contentType: 'image/jpeg',
        },
        {
          buffer: mockImageBuffer,
          filename: 'image2.png',
          contentType: 'image/png',
        },
      ];

      const results = await batchOptimizeImages(images);

      expect(results).toHaveLength(2);
      expect(results[0]).toMatchObject({
        filename: 'image1.jpg',
        result: expect.objectContaining({
          format: 'jpeg',
          width: 800,
          height: 600,
        }),
      });
      expect(results[1]).toMatchObject({
        filename: 'image2.png',
        result: expect.objectContaining({
          format: 'jpeg', // Mock returns jpeg format
          width: 800,
          height: 600,
        }),
      });
    });
  });
});
