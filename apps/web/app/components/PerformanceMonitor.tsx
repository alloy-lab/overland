import { Analytics } from '@vercel/analytics/react';
import { useEffect, useState } from 'react';
import { usePerformanceMonitoring } from '~/lib/performance';

interface PerformanceMonitorProps {
  enabled?: boolean;
}

export function PerformanceMonitor({
  enabled = process.env.NODE_ENV === 'development',
}: PerformanceMonitorProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [metrics, setMetrics] = useState<any[]>([]);
  const analytics = usePerformanceMonitoring();

  useEffect(() => {
    if (!enabled || !analytics) return;

    // Listen for custom performance events
    const handlePerformanceEvent = (event: CustomEvent) => {
      setMetrics(prev => [event.detail, ...prev].slice(0, 10));
    };

    window.addEventListener(
      'performance-metric',
      handlePerformanceEvent as EventListener
    );

    return () => {
      window.removeEventListener(
        'performance-metric',
        handlePerformanceEvent as EventListener
      );
    };
  }, [enabled, analytics]);

  if (!enabled) return null;

  const formatValue = (value: number, name: string): string => {
    switch (name) {
      case 'CLS':
        return value.toFixed(3);
      case 'FID':
      case 'FCP':
      case 'LCP':
      case 'TTFB':
        return `${Math.round(value)}ms`;
      default:
        return value.toString();
    }
  };

  const getStatusColor = (name: string, value: number): string => {
    const budgets = {
      CLS: 0.1,
      FID: 100,
      FCP: 1800,
      LCP: 2500,
      TTFB: 800,
    };

    const budget = budgets[name as keyof typeof budgets];
    if (!budget) return 'text-gray-600';

    return value > budget ? 'text-red-600' : 'text-green-600';
  };

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={() => setIsVisible(!isVisible)}
        className='fixed bottom-4 right-4 z-50 bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition-colors'
        title='Performance Monitor'
      >
        <svg
          className='w-6 h-6'
          fill='none'
          stroke='currentColor'
          viewBox='0 0 24 24'
        >
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth={2}
            d='M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z'
          />
        </svg>
      </button>

      {/* Monitor Panel */}
      {isVisible && (
        <div className='fixed bottom-20 right-4 z-50 bg-white border border-gray-200 rounded-lg shadow-xl w-96 max-h-96 overflow-hidden'>
          <div className='bg-gray-50 px-4 py-2 border-b border-gray-200 flex justify-between items-center'>
            <h3 className='font-semibold text-gray-800'>Performance Monitor</h3>
            <button
              onClick={() => setIsVisible(false)}
              className='text-gray-500 hover:text-gray-700'
            >
              <svg
                className='w-4 h-4'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M6 18L18 6M6 6l12 12'
                />
              </svg>
            </button>
          </div>

          <div className='p-4 space-y-4'>
            {/* Web Vitals Info */}
            <div className='text-sm text-gray-600'>
              <p>Web Vitals are automatically tracked by Vercel Analytics.</p>
              <p>Check your Vercel dashboard for detailed metrics.</p>
            </div>

            {/* Recent Metrics */}
            {metrics.length > 0 && (
              <div>
                <h4 className='text-sm font-medium text-gray-700 mb-2'>
                  Recent Metrics
                </h4>
                <div className='space-y-2 max-h-48 overflow-y-auto'>
                  {metrics.map((metric, index) => (
                    <div
                      key={index}
                      className='text-xs border-l-2 border-gray-200 pl-2'
                    >
                      <div className='flex justify-between items-center'>
                        <span className='font-mono text-gray-600'>
                          {metric.name}
                        </span>
                        <span
                          className={`font-semibold ${getStatusColor(metric.name, metric.value)}`}
                        >
                          {formatValue(metric.value, metric.name)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {metrics.length === 0 && (
              <div className='text-gray-500 text-center py-4'>
                <p>No custom metrics yet</p>
                <p className='text-xs mt-1'>
                  Web Vitals are tracked automatically
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Vercel Analytics */}
      <Analytics />
    </>
  );
}
