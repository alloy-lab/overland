import sharp from 'sharp';

export interface ImageOptimizationOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'webp' | 'jpeg' | 'png' | 'avif';
  fit?: 'cover' | 'contain' | 'fill' | 'inside' | 'outside';
}

export interface OptimizedImageResult {
  buffer: Buffer;
  format: string;
  width: number;
  height: number;
  size: number;
  originalSize: number;
  compressionRatio: number;
}

/**
 * Optimize image with Sharp
 */
export async function optimizeImage(
  inputBuffer: Buffer,
  options: ImageOptimizationOptions = {}
): Promise<OptimizedImageResult> {
  const {
    width,
    height,
    quality = 80,
    format = 'webp',
    fit = 'cover',
  } = options;

  const originalSize = inputBuffer.length;

  let sharpInstance = sharp(inputBuffer);

  // Resize if dimensions provided
  if (width || height) {
    sharpInstance = sharpInstance.resize(width, height, {
      fit,
      withoutEnlargement: true,
    });
  }

  // Apply format-specific optimizations
  switch (format) {
    case 'webp':
      sharpInstance = sharpInstance.webp({ quality });
      break;
    case 'jpeg':
      sharpInstance = sharpInstance.jpeg({ quality, progressive: true });
      break;
    case 'png':
      sharpInstance = sharpInstance.png({ quality, progressive: true });
      break;
    case 'avif':
      sharpInstance = sharpInstance.avif({ quality });
      break;
  }

  const buffer = await sharpInstance.toBuffer();
  const metadata = await sharp(buffer).metadata();

  return {
    buffer,
    format: metadata.format || format,
    width: metadata.width || 0,
    height: metadata.height || 0,
    size: buffer.length,
    originalSize,
    compressionRatio: Math.round(
      ((originalSize - buffer.length) / originalSize) * 100
    ),
  };
}

/**
 * Generate multiple image sizes for responsive images
 */
export async function generateResponsiveImages(
  inputBuffer: Buffer,
  sizes: number[] = [320, 640, 1024, 1920]
): Promise<Array<{ size: number; buffer: Buffer; format: string }>> {
  const results = await Promise.all(
    sizes.map(async size => {
      const optimized = await optimizeImage(inputBuffer, {
        width: size,
        quality: 85,
        format: 'webp',
        fit: 'cover',
      });

      return {
        size,
        buffer: optimized.buffer,
        format: optimized.format,
      };
    })
  );

  return results;
}

/**
 * Generate image placeholder (blurred low-quality version)
 */
export async function generateImagePlaceholder(
  inputBuffer: Buffer,
  width: number = 20,
  height?: number
): Promise<string> {
  const placeholder = await sharp(inputBuffer)
    .resize(width, height, { fit: 'cover' })
    .blur(1)
    .jpeg({ quality: 20 })
    .toBuffer();

  return `data:image/jpeg;base64,${placeholder.toString('base64')}`;
}

/**
 * Extract image metadata
 */
export async function extractImageMetadata(inputBuffer: Buffer): Promise<{
  width: number;
  height: number;
  format: string;
  size: number;
  hasAlpha: boolean;
  density?: number;
  space: string;
}> {
  const metadata = await sharp(inputBuffer).metadata();

  return {
    width: metadata.width || 0,
    height: metadata.height || 0,
    format: metadata.format || 'unknown',
    size: inputBuffer.length,
    hasAlpha: metadata.hasAlpha || false,
    density: metadata.density,
    space: metadata.space || 'srgb',
  };
}

/**
 * Auto-optimize image based on content type and size
 */
export async function autoOptimizeImage(
  inputBuffer: Buffer,
  contentType: string
): Promise<OptimizedImageResult> {
  const metadata = await extractImageMetadata(inputBuffer);

  // Determine best format based on content type and image characteristics
  let format: 'webp' | 'jpeg' | 'png' | 'avif' = 'webp';

  if (contentType.includes('png') || metadata.hasAlpha) {
    format = 'png';
  } else if (contentType.includes('jpeg') || contentType.includes('jpg')) {
    format = 'jpeg';
  }

  // Determine quality based on image size
  let quality = 80;
  if (metadata.size > 1000000) {
    // > 1MB
    quality = 70;
  } else if (metadata.size > 500000) {
    // > 500KB
    quality = 75;
  }

  // Determine if we need to resize
  let width: number | undefined;
  let height: number | undefined;

  if (metadata.width > 1920) {
    width = 1920;
  }
  if (metadata.height > 1080) {
    height = 1080;
  }

  return optimizeImage(inputBuffer, {
    width,
    height,
    quality,
    format,
    fit: 'cover',
  });
}

/**
 * Batch optimize multiple images
 */
export async function batchOptimizeImages(
  images: Array<{ buffer: Buffer; filename: string; contentType: string }>
): Promise<Array<{ filename: string; result: OptimizedImageResult }>> {
  const results = await Promise.all(
    images.map(async ({ buffer, filename, contentType }) => {
      const result = await autoOptimizeImage(buffer, contentType);
      return { filename, result };
    })
  );

  return results;
}
