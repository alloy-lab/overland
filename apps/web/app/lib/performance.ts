import { getCLS, getFCP, getFID, getLCP, getTTFB } from 'web-vitals';

// TypeScript declaration for window
declare const window: any;

// Web Vitals monitoring
export const initWebVitals = () => {
  if (typeof window === 'undefined') return;

  // Send to Vercel Analytics via global function
  const sendToAnalytics = (metric: any) => {
    if (typeof window !== 'undefined' && (window as any).va) {
      (window as any).va('track', metric.name, { value: metric.value });
    }
  };

  getCLS(sendToAnalytics);
  getFID(sendToAnalytics);
  getFCP(sendToAnalytics);
  getLCP(sendToAnalytics);
  getTTFB(sendToAnalytics);

  // Also log to console in development
  if (process.env.NODE_ENV === 'development') {
    getCLS(console.log);
    getFID(console.log);
    getFCP(console.log);
    getLCP(console.log);
    getTTFB(console.log);
  }
};

// Performance monitoring hook
export const usePerformanceMonitoring = () => {
  if (typeof window === 'undefined') return null;

  // Initialize web vitals monitoring
  initWebVitals();

  // Return analytics functions for custom tracking
  return {
    track: (name: string, value: number) => {
      if (typeof window !== 'undefined' && (window as any).va) {
        (window as any).va('track', name, { value });
      }
    },
    page: (name: string) => {
      if (typeof window !== 'undefined' && (window as any).va) {
        (window as any).va('page', name);
      }
    },
  };
};

// Simple performance budget checker
export const checkPerformanceBudget = (metric: any) => {
  const budgets = {
    CLS: 0.1,
    FID: 100,
    FCP: 1800,
    LCP: 2500,
    TTFB: 800,
  };

  const budget = budgets[metric.name as keyof typeof budgets];
  if (budget && metric.value > budget) {
    console.warn(`Performance budget exceeded for ${metric.name}:`, {
      value: metric.value,
      budget,
      delta: metric.value - budget,
    });
  }
};
