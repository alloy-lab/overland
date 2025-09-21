import type { NextFunction, Request, Response } from 'express';
import React from 'react';
import sharp from 'sharp';
import logger from './logger.js';

// Image optimization configuration
export const IMAGE_CONFIG = {
  // Supported formats
  formats: ['jpeg', 'png', 'webp', 'avif'] as const,

  // Quality settings
  quality: {
    jpeg: 85,
    png: 90,
    webp: 85,
    avif: 80,
  },

  // Size presets
  sizes: {
    thumbnail: { width: 150, height: 150 },
    small: { width: 400, height: 300 },
    medium: { width: 800, height: 600 },
    large: { width: 1200, height: 900 },
    xlarge: { width: 1920, height: 1080 },
  },

  // Cache settings
  cache: {
    maxAge: 31536000, // 1 year
    immutable: true,
  },
} as const;

// Performance monitoring
export interface PerformanceMetrics {
  requestId: string;
  method: string;
  url: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  memoryUsage?: NodeJS.MemoryUsage;
  statusCode?: number;
}

const performanceMetrics = new Map<string, PerformanceMetrics>();

// Start performance monitoring
export const startPerformanceMonitoring = (req: Request): string => {
  const requestId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  const startTime = performance.now();

  const metrics: PerformanceMetrics = {
    requestId,
    method: req.method,
    url: req.url,
    startTime,
    memoryUsage: process.memoryUsage(),
  };

  performanceMetrics.set(requestId, metrics);
  return requestId;
};

// End performance monitoring
export const endPerformanceMonitoring = (
  requestId: string,
  statusCode: number
): void => {
  const metrics = performanceMetrics.get(requestId);
  if (!metrics) return;

  const endTime = performance.now();
  metrics.endTime = endTime;
  metrics.duration = endTime - metrics.startTime;
  metrics.statusCode = statusCode;

  // Log slow requests (> 1 second)
  if (metrics.duration > 1000) {
    logger.warn('Slow request detected', {
      requestId,
      method: metrics.method,
      url: metrics.url,
      duration: `${metrics.duration.toFixed(2)}ms`,
      statusCode,
    });
  }

  // Log memory usage for requests > 500ms
  if (metrics.duration > 500) {
    const currentMemory = process.memoryUsage();
    logger.debug('Memory usage for slow request', {
      requestId,
      duration: `${metrics.duration.toFixed(2)}ms`,
      memoryBefore: metrics.memoryUsage,
      memoryAfter: currentMemory,
      memoryDelta: {
        rss: currentMemory.rss - (metrics.memoryUsage?.rss || 0),
        heapUsed: currentMemory.heapUsed - (metrics.memoryUsage?.heapUsed || 0),
        heapTotal:
          currentMemory.heapTotal - (metrics.memoryUsage?.heapTotal || 0),
      },
    });
  }

  // Clean up old metrics (keep only last 100)
  if (performanceMetrics.size > 100) {
    const oldestKey = performanceMetrics.keys().next().value;
    if (oldestKey) {
      performanceMetrics.delete(oldestKey);
    }
  }
};

// Performance monitoring middleware
export const performanceMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const requestId = startPerformanceMonitoring(req);

  // Store requestId for later use
  (req as any).requestId = requestId;

  // Override res.end to capture response time
  const originalEnd = res.end;
  res.end = function (chunk?: any, encoding?: any) {
    endPerformanceMonitoring(requestId, res.statusCode || 200);
    return originalEnd.call(this, chunk, encoding);
  };

  next();
};

// Image optimization
export const optimizeImage = async (
  inputBuffer: Buffer,
  options: {
    width?: number;
    height?: number;
    format?: 'jpeg' | 'png' | 'webp' | 'avif';
    quality?: number;
  } = {}
): Promise<Buffer> => {
  const { width, height, format = 'webp', quality } = options;

  let sharpInstance = sharp(inputBuffer);

  // Resize if dimensions provided
  if (width || height) {
    sharpInstance = sharpInstance.resize(width, height, {
      fit: 'inside',
      withoutEnlargement: true,
    });
  }

  // Convert to specified format
  switch (format) {
    case 'jpeg':
      sharpInstance = sharpInstance.jpeg({
        quality: quality || IMAGE_CONFIG.quality.jpeg,
        progressive: true,
      });
      break;
    case 'png':
      sharpInstance = sharpInstance.png({
        quality: quality || IMAGE_CONFIG.quality.png,
        progressive: true,
      });
      break;
    case 'webp':
      sharpInstance = sharpInstance.webp({
        quality: quality || IMAGE_CONFIG.quality.webp,
      });
      break;
    case 'avif':
      sharpInstance = sharpInstance.avif({
        quality: quality || IMAGE_CONFIG.quality.avif,
      });
      break;
  }

  return await sharpInstance.toBuffer();
};

// Generate responsive image variants
export const generateImageVariants = async (
  inputBuffer: Buffer,
  baseName: string
): Promise<Record<string, Buffer>> => {
  const variants: Record<string, Buffer> = {};

  // Generate variants for each size and format
  for (const [sizeName, dimensions] of Object.entries(IMAGE_CONFIG.sizes)) {
    for (const format of IMAGE_CONFIG.formats) {
      const variantName = `${baseName}-${sizeName}.${format}`;
      variants[variantName] = await optimizeImage(inputBuffer, {
        ...dimensions,
        format: format as any,
      });
    }
  }

  return variants;
};

// Lazy loading utility for React components
export const createLazyComponent = <T extends React.ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>
): React.LazyExoticComponent<T> => {
  return React.lazy(importFunc);
};

// Preload critical resources
export const preloadCriticalResources = (resources: string[]): void => {
  if (typeof globalThis !== 'undefined' && 'document' in globalThis) {
    resources.forEach(resource => {
      const link = (globalThis as any).document.createElement('link');
      link.rel = 'preload';
      link.href = resource;

      // Determine as attribute based on file extension
      if (resource.endsWith('.css')) {
        link.as = 'style';
      } else if (resource.match(/\.(js|mjs)$/)) {
        link.as = 'script';
      } else if (resource.match(/\.(woff2?|ttf|otf)$/)) {
        link.as = 'font';
        link.crossOrigin = 'anonymous';
      } else if (resource.match(/\.(jpg|jpeg|png|webp|avif)$/)) {
        link.as = 'image';
      }

      (globalThis as any).document.head.appendChild(link);
    });
  }
};

// Bundle analysis and optimization suggestions
export const analyzeBundle = (): void => {
  if (process.env.NODE_ENV !== 'development') return;

  // This would integrate with webpack-bundle-analyzer or similar
  logger.info('Bundle analysis available in development mode');
  logger.info('Consider running: npm run analyze to view bundle composition');
};

// Memory usage monitoring
export const logMemoryUsage = (): void => {
  const usage = process.memoryUsage();
  logger.debug('Memory usage', {
    rss: `${Math.round(usage.rss / 1024 / 1024)} MB`,
    heapTotal: `${Math.round(usage.heapTotal / 1024 / 1024)} MB`,
    heapUsed: `${Math.round(usage.heapUsed / 1024 / 1024)} MB`,
    external: `${Math.round(usage.external / 1024 / 1024)} MB`,
  });
};

// Performance budget monitoring
export const checkPerformanceBudget = (
  metrics: PerformanceMetrics
): boolean => {
  const budgets = {
    maxResponseTime: 2000, // 2 seconds
    maxMemoryUsage: 100 * 1024 * 1024, // 100 MB
  };

  const violations = [];

  if (metrics.duration && metrics.duration > budgets.maxResponseTime) {
    violations.push(
      `Response time ${metrics.duration}ms exceeds budget of ${budgets.maxResponseTime}ms`
    );
  }

  if (
    metrics.memoryUsage &&
    metrics.memoryUsage.heapUsed > budgets.maxMemoryUsage
  ) {
    violations.push(
      `Memory usage ${metrics.memoryUsage.heapUsed} bytes exceeds budget of ${budgets.maxMemoryUsage} bytes`
    );
  }

  if (violations.length > 0) {
    logger.warn('Performance budget violations', {
      requestId: metrics.requestId,
      violations,
    });
    return false;
  }

  return true;
};
