import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

// Memoization utilities
export const useStableCallback = <T extends (...args: any[]) => any>(
  callback: T
): T => {
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  return useCallback((...args: Parameters<T>) => {
    return callbackRef.current(...args);
  }, []) as T;
};

export const useStableValue = <T>(value: T): T => {
  const valueRef = useRef(value);
  const prevValueRef = useRef(value);

  if (prevValueRef.current !== value) {
    valueRef.current = value;
    prevValueRef.current = value;
  }

  return valueRef.current;
};

// Performance monitoring for React components
export const useRenderCount = (componentName?: string) => {
  const renderCount = useRef(0);
  const startTime = useRef(performance.now());

  useEffect(() => {
    renderCount.current += 1;

    if (process.env.NODE_ENV === 'development' && componentName) {
      const renderTime = performance.now() - startTime.current;
      console.log(
        `${componentName} rendered ${renderCount.current} times in ${renderTime.toFixed(2)}ms`
      );
    }
  });

  return renderCount.current;
};

// Debounced value hook
export const useDebouncedValue = <T>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

// Throttled callback hook
export const useThrottledCallback = <T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T => {
  const lastCall = useRef(0);
  const lastCallTimer = useRef<NodeJS.Timeout | undefined>(undefined);

  return useCallback(
    (...args: Parameters<T>) => {
      const now = Date.now();

      if (now - lastCall.current >= delay) {
        lastCall.current = now;
        return callback(...args);
      } else {
        if (lastCallTimer.current) {
          clearTimeout(lastCallTimer.current);
        }

        lastCallTimer.current = setTimeout(
          () => {
            lastCall.current = Date.now();
            callback(...args);
          },
          delay - (now - lastCall.current)
        );
      }
    },
    [callback, delay]
  ) as T;
};

// Virtual scrolling utilities
export const useVirtualScroll = <T>(
  items: T[],
  itemHeight: number,
  containerHeight: number,
  overscan: number = 5
) => {
  const [scrollTop, setScrollTop] = useState(0);

  const visibleStart = Math.max(
    0,
    Math.floor(scrollTop / itemHeight) - overscan
  );
  const visibleEnd = Math.min(
    items.length - 1,
    Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
  );

  const visibleItems = items.slice(visibleStart, visibleEnd + 1);
  const totalHeight = items.length * itemHeight;
  const offsetY = visibleStart * itemHeight;

  return {
    visibleItems,
    totalHeight,
    offsetY,
    setScrollTop,
    visibleStart,
    visibleEnd,
  };
};

// Intersection Observer hook for lazy loading
export const useIntersectionObserver = (
  elementRef: React.RefObject<Element>,
  options: IntersectionObserverInit = {}
) => {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [hasIntersected, setHasIntersected] = useState(false);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(([entry]) => {
      setIsIntersecting(entry.isIntersecting);
      if (entry.isIntersecting && !hasIntersected) {
        setHasIntersected(true);
      }
    }, options);

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, [elementRef, options, hasIntersected]);

  return { isIntersecting, hasIntersected };
};

// Performance optimization for expensive computations
export const useExpensiveComputation = <T, R>(
  computation: (value: T) => R,
  value: T,
  deps: React.DependencyList = []
): R => {
  return useMemo(() => {
    const startTime = performance.now();
    const result = computation(value);
    const endTime = performance.now();

    if (process.env.NODE_ENV === 'development') {
      console.log(
        `Expensive computation took ${(endTime - startTime).toFixed(2)}ms`
      );
    }

    return result;
  }, [value, ...deps]);
};

// Bundle size optimization utilities
export const createLazyComponent = <T extends React.ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>,
  fallback?: React.ComponentType
): React.LazyExoticComponent<T> => {
  return React.lazy(() => {
    const startTime = performance.now();

    return importFunc().then(module => {
      const endTime = performance.now();

      if (process.env.NODE_ENV === 'development') {
        console.log(
          `Lazy component loaded in ${(endTime - startTime).toFixed(2)}ms`
        );
      }

      return module;
    });
  });
};

// Preload critical resources
export const preloadCriticalResources = (
  resources: Array<{
    href: string;
    as: 'script' | 'style' | 'image' | 'font' | 'fetch';
    crossorigin?: 'anonymous' | 'use-credentials';
  }>
) => {
  useEffect(() => {
    resources.forEach(resource => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.href = resource.href;
      link.as = resource.as;

      if (resource.crossorigin) {
        link.crossOrigin = resource.crossorigin;
      }

      document.head.appendChild(link);
    });
  }, []);
};

// Performance budget monitoring
export const usePerformanceBudget = () => {
  const [violations, setViolations] = useState<
    Array<{
      type: string;
      message: string;
      actual: number;
      budget: number;
      timestamp: string;
    }>
  >([]);

  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') return;

    const eventSource = new EventSource(
      '/api/performance/budget-violations?stream=true'
    );

    eventSource.onmessage = event => {
      try {
        const violation = JSON.parse(event.data);
        if (violation.type !== 'connected') {
          setViolations(prev => [violation, ...prev].slice(0, 20));
        }
      } catch (error) {
        console.error('Failed to parse budget violation:', error);
      }
    };

    return () => eventSource.close();
  }, []);

  return violations;
};

// Memory usage monitoring
export const useMemoryUsage = () => {
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
