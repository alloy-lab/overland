import * as Sentry from '@sentry/react';

// Performance monitoring with Sentry
export const initPerformanceMonitoring = () => {
  if (typeof globalThis === 'undefined' || !('window' in globalThis)) return;

  // Sentry automatically captures Web Vitals (LCP, CLS, INP, FCP, FID, TTFB)
  // No additional setup needed - they're captured by the BrowserTracing integration

  // Sentry automatically handles Web Vitals - no console logging needed
};

// Performance monitoring hook
export const usePerformanceMonitoring = () => {
  if (typeof globalThis === 'undefined' || !('window' in globalThis))
    return null;

  // Initialize performance monitoring
  initPerformanceMonitoring();

  // Return Sentry-based analytics functions
  return {
    // Track custom performance metrics
    track: (name: string, value: number, tags?: Record<string, string>) => {
      Sentry.addBreadcrumb({
        message: `Performance metric: ${name}`,
        level: 'info',
        data: { value, ...tags },
      });

      // Also send as a custom measurement
      Sentry.setMeasurement(name, value, 'millisecond');
    },

    // Track page views
    page: (name: string, tags?: Record<string, string>) => {
      Sentry.addBreadcrumb({
        message: `Page view: ${name}`,
        level: 'info',
        data: tags,
      });
    },

    // Start a custom transaction
    startTransaction: (name: string, op: string = 'navigation') => {
      return Sentry.startTransaction({ name, op });
    },

    // Add custom span to current transaction
    addSpan: (description: string, op: string = 'custom') => {
      const transaction = Sentry.getCurrentHub().getScope()?.getTransaction();
      if (transaction) {
        return transaction.startChild({ description, op });
      }
      return null;
    },
  };
};

// Simple performance budget checker (silent - only used for UI indicators)
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
    // Budget exceeded - this is handled by the UI color coding
    return { exceeded: true, budget, delta: metric.value - budget };
  }
  return { exceeded: false };
};
