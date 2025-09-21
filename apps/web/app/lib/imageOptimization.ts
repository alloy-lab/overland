import type { NextFunction, Request, Response } from 'express';
import logger from './logger.js';
import { IMAGE_CONFIG, optimizeImage } from './performance.js';

// Image optimization middleware
export const imageOptimizationMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Only process image requests
  if (!req.url.match(/\.(jpg|jpeg|png|webp|avif)$/i)) {
    return next();
  }

  // Parse query parameters for optimization options
  const { w, h, q, f } = req.query;
  const width = w ? parseInt(w as string, 10) : undefined;
  const height = h ? parseInt(h as string, 10) : undefined;
  const quality = q ? parseInt(q as string, 10) : undefined;
  const format = f as string;

  // Validate parameters
  if (width && (width < 1 || width > 4000)) {
    res.status(400).json({ error: 'Width must be between 1 and 4000' });
    return;
  }

  if (height && (height < 1 || height > 4000)) {
    res.status(400).json({ error: 'Height must be between 1 and 4000' });
    return;
  }

  if (quality && (quality < 1 || quality > 100)) {
    res.status(400).json({ error: 'Quality must be between 1 and 100' });
    return;
  }

  if (format && !IMAGE_CONFIG.formats.includes(format as any)) {
    res.status(400).json({
      error: `Format must be one of: ${IMAGE_CONFIG.formats.join(', ')}`,
    });
    return;
  }

  // Store optimization options for later use
  (req as any).imageOptimization = {
    width,
    height,
    quality,
    format: format || 'webp', // Default to webp for better compression
  };

  next();
};

// Image processing endpoint
export const processImage = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { imageOptimization } = req as any;
    if (!imageOptimization) {
      res
        .status(400)
        .json({ error: 'No image optimization parameters provided' });
      return;
    }

    // This would typically read from a file or database
    // For now, we'll assume the image data is available
    const imageBuffer = await getImageBuffer(req.url);
    if (!imageBuffer) {
      res.status(404).json({ error: 'Image not found' });
      return;
    }

    const optimizedBuffer = await optimizeImage(imageBuffer, imageOptimization);

    // Set appropriate headers
    res.set({
      'Content-Type': `image/${imageOptimization.format}`,
      'Content-Length': optimizedBuffer.length.toString(),
      'Cache-Control': `public, max-age=${IMAGE_CONFIG.cache.maxAge}, immutable`,
      ETag: `"${generateETag(optimizedBuffer)}"`,
    });

    res.send(optimizedBuffer);

    logger.debug('Image optimized', {
      originalSize: imageBuffer.length,
      optimizedSize: optimizedBuffer.length,
      compressionRatio:
        (
          ((imageBuffer.length - optimizedBuffer.length) / imageBuffer.length) *
          100
        ).toFixed(2) + '%',
      format: imageOptimization.format,
      dimensions: `${imageOptimization.width || 'auto'}x${imageOptimization.height || 'auto'}`,
    });
  } catch (error) {
    logger.error('Image optimization failed', error);
    res.status(500).json({ error: 'Image optimization failed' });
  }
};

// Helper function to get image buffer (placeholder)
const getImageBuffer = async (url: string): Promise<Buffer | null> => {
  // This would typically read from file system or database
  // For now, return null to indicate not implemented
  logger.warn('getImageBuffer not implemented', { url });
  return null;
};

// Generate ETag for caching
const generateETag = (buffer: Buffer): string => {
  const crypto = require('crypto');
  return crypto.createHash('md5').update(buffer).digest('hex');
};

// Image optimization route handler
export const imageOptimizationHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  // Check if this is an image optimization request
  if (req.url.includes('/api/images/optimize')) {
    return processImage(req, res);
  }

  next();
};
