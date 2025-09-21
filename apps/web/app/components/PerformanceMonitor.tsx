import { useEffect, useState } from 'react';

interface PerformanceMetrics {
  requestId: string;
  method: string;
  url: string;
  duration?: number;
  statusCode?: number;
  memoryUsage?: {
    rss: number;
    heapUsed: number;
    heapTotal: number;
    external: number;
  };
}

interface PerformanceMonitorProps {
  enabled?: boolean;
  maxEntries?: number;
  showMemory?: boolean;
  showSlowRequests?: boolean;
  slowRequestThreshold?: number;
}

export function PerformanceMonitor({
  enabled = process.env.NODE_ENV === 'development',
  maxEntries = 50,
  showMemory = true,
  showSlowRequests = true,
  slowRequestThreshold = 1000,
}: PerformanceMonitorProps) {
  const [metrics, setMetrics] = useState<PerformanceMetrics[]>([]);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!enabled) return;

    // Listen for performance metrics from the server
    const eventSource = new EventSource('/api/performance/metrics');

    eventSource.onmessage = event => {
      try {
        const newMetric: PerformanceMetrics = JSON.parse(event.data);
        setMetrics(prev => {
          const updated = [newMetric, ...prev].slice(0, maxEntries);
          return updated;
        });
      } catch (error) {
        console.error('Failed to parse performance metric:', error);
      }
    };

    eventSource.onerror = error => {
      console.error('Performance metrics stream error:', error);
    };

    return () => {
      eventSource.close();
    };
  }, [enabled, maxEntries]);

  if (!enabled) return null;

  const slowRequests = metrics.filter(
    m => m.duration && m.duration > slowRequestThreshold
  );
  const averageResponseTime =
    metrics.length > 0
      ? metrics.reduce((sum, m) => sum + (m.duration || 0), 0) / metrics.length
      : 0;

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDuration = (ms: number): string => {
    if (ms < 1000) return `${ms.toFixed(0)}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  const getStatusColor = (statusCode?: number): string => {
    if (!statusCode) return 'text-gray-500';
    if (statusCode >= 200 && statusCode < 300) return 'text-green-600';
    if (statusCode >= 300 && statusCode < 400) return 'text-blue-600';
    if (statusCode >= 400 && statusCode < 500) return 'text-yellow-600';
    return 'text-red-600';
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
            {/* Summary Stats */}
            <div className='grid grid-cols-2 gap-4 text-sm'>
              <div>
                <div className='text-gray-500'>Total Requests</div>
                <div className='font-semibold'>{metrics.length}</div>
              </div>
              <div>
                <div className='text-gray-500'>Avg Response</div>
                <div className='font-semibold'>
                  {formatDuration(averageResponseTime)}
                </div>
              </div>
              {showSlowRequests && (
                <div>
                  <div className='text-gray-500'>Slow Requests</div>
                  <div className='font-semibold text-red-600'>
                    {slowRequests.length}
                  </div>
                </div>
              )}
              {showMemory && metrics[0]?.memoryUsage && (
                <div>
                  <div className='text-gray-500'>Memory</div>
                  <div className='font-semibold'>
                    {formatBytes(metrics[0].memoryUsage.heapUsed)}
                  </div>
                </div>
              )}
            </div>

            {/* Recent Requests */}
            <div>
              <h4 className='text-sm font-medium text-gray-700 mb-2'>
                Recent Requests
              </h4>
              <div className='space-y-2 max-h-48 overflow-y-auto'>
                {metrics.slice(0, 10).map((metric, index) => (
                  <div
                    key={metric.requestId}
                    className='text-xs border-l-2 border-gray-200 pl-2'
                  >
                    <div className='flex justify-between items-start'>
                      <div className='flex-1 min-w-0'>
                        <div className='font-mono text-gray-600 truncate'>
                          {metric.method} {metric.url}
                        </div>
                        {metric.duration && (
                          <div className='text-gray-500'>
                            {formatDuration(metric.duration)}
                          </div>
                        )}
                      </div>
                      {metric.statusCode && (
                        <span
                          className={`ml-2 font-semibold ${getStatusColor(metric.statusCode)}`}
                        >
                          {metric.statusCode}
                        </span>
                      )}
                    </div>
                    {showMemory && metric.memoryUsage && (
                      <div className='text-gray-400 mt-1'>
                        Memory: {formatBytes(metric.memoryUsage.heapUsed)}
                      </div>
                    )}
                  </div>
                ))}
                {metrics.length === 0 && (
                  <div className='text-gray-500 text-center py-4'>
                    No requests yet
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// Performance metrics hook
export const usePerformanceMetrics = () => {
  const [metrics, setMetrics] = useState<PerformanceMetrics[]>([]);

  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') return;

    const eventSource = new EventSource('/api/performance/metrics');

    eventSource.onmessage = event => {
      try {
        const newMetric: PerformanceMetrics = JSON.parse(event.data);
        setMetrics(prev => [newMetric, ...prev].slice(0, 100));
      } catch (error) {
        console.error('Failed to parse performance metric:', error);
      }
    };

    return () => eventSource.close();
  }, []);

  return metrics;
};

// Performance budget hook
export const usePerformanceBudget = () => {
  const [violations, setViolations] = useState<string[]>([]);

  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') return;

    const eventSource = new EventSource('/api/performance/budget-violations');

    eventSource.onmessage = event => {
      try {
        const violation = JSON.parse(event.data);
        setViolations(prev => [violation, ...prev].slice(0, 20));
      } catch (error) {
        console.error('Failed to parse budget violation:', error);
      }
    };

    return () => eventSource.close();
  }, []);

  return violations;
};
