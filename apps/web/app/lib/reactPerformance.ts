// Re-export commonly used hooks from @react-hookz/web
export {
  useDebouncedState,
  useIntersectionObserver,
  useRenderCount,
  useThrottledState,
} from '@react-hookz/web';

// Re-export virtual scrolling from @tanstack/react-virtual
export { useVirtualizer } from '@tanstack/react-virtual';

// Simple performance monitoring hook
export const usePerformanceMonitoring = () => {
  if (typeof window === 'undefined') return null;

  const trackCustomMetric = (name: string, value: number) => {
    // Send to Vercel Analytics if available
    if (typeof window !== 'undefined' && (window as any).va) {
      (window as any).va('track', name, { value });
    }

    // Dispatch custom event for local monitoring
    window.dispatchEvent(
      new CustomEvent('performance-metric', {
        detail: { name, value, timestamp: Date.now() },
      })
    );
  };

  return { trackCustomMetric };
};

// Bundle analysis helper
export const analyzeBundle = (): void => {
  if (process.env.NODE_ENV !== 'development') return;

  console.log('Bundle analysis available in development mode');
  console.log('Consider running: npm run analyze to view bundle composition');
};

// Memory usage monitoring
export const useMemoryUsage = () => {
  if (typeof window === 'undefined') return null;

  const [memoryUsage, setMemoryUsage] = useState<{
    used: number;
    total: number;
    percentage: number;
  } | null>(null);

  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') return;

    const updateMemoryUsage = () => {
      if ('memory' in performance) {
        const memory = (performance as any).memory;
        setMemoryUsage({
          used: memory.usedJSHeapSize,
          total: memory.totalJSHeapSize,
          percentage: (memory.usedJSHeapSize / memory.totalJSHeapSize) * 100,
        });
      }
    };

    updateMemoryUsage();
    const interval = setInterval(updateMemoryUsage, 5000);

    return () => clearInterval(interval);
  }, []);

  return memoryUsage;
};

// Import React hooks for the custom implementations
import { useEffect, useState } from 'react';

// TypeScript declaration for window
declare const window: any;
