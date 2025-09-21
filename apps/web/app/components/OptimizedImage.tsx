import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/blur.css';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  placeholder?: string;
  effect?: 'blur' | 'black-and-white' | 'opacity';
  threshold?: number;
  onLoad?: () => void;
  onError?: () => void;
}

export function OptimizedImage({
  src,
  alt,
  width,
  height,
  className = '',
  placeholder,
  effect = 'blur',
  threshold = 100,
  onLoad,
  onError,
}: OptimizedImageProps) {
  // Generate optimized URL with query parameters for image optimization
  const getOptimizedSrc = (originalSrc: string) => {
    if (!originalSrc) return originalSrc;

    // If it's already an external URL, return as-is
    if (originalSrc.startsWith('http')) return originalSrc;

    // For local images, add optimization parameters
    const url = new URL(originalSrc, window.location.origin);

    if (width) url.searchParams.set('w', width.toString());
    if (height) url.searchParams.set('h', height.toString());
    url.searchParams.set('q', '85'); // Quality
    url.searchParams.set('f', 'webp'); // Format

    return url.toString();
  };

  const optimizedSrc = getOptimizedSrc(src);

  return (
    <LazyLoadImage
      src={optimizedSrc}
      alt={alt}
      width={width}
      height={height}
      className={className}
      placeholderSrc={placeholder}
      effect={effect}
      threshold={threshold}
      onLoad={onLoad}
      onError={onError}
      // Additional props for better performance
      loading='lazy'
      decoding='async'
    />
  );
}

// Hook for image optimization
export const useImageOptimization = (
  src: string,
  options?: {
    width?: number;
    height?: number;
    quality?: number;
    format?: 'jpeg' | 'png' | 'webp' | 'avif';
  }
) => {
  if (!src) return { optimizedSrc: src, isOptimizing: false };

  const url = new URL(
    src,
    typeof window !== 'undefined' ? window.location.origin : ''
  );

  if (options?.width) url.searchParams.set('w', options.width.toString());
  if (options?.height) url.searchParams.set('h', options.height.toString());
  if (options?.quality) url.searchParams.set('q', options.quality.toString());
  if (options?.format) url.searchParams.set('f', options.format);

  return {
    optimizedSrc: url.toString(),
    isOptimizing: false,
  };
};
