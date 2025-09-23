import * as Sentry from '@sentry/react';
import { useEffect, useState } from 'react';
import { usePerformanceMonitoring } from '~/lib/performance';

interface DevToolsProps {
  enabled?: boolean;
}

type DevToolView = 'main' | 'settings';

export function DevTools({
  enabled = process.env.NODE_ENV === 'development',
}: DevToolsProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [currentView, setCurrentView] = useState<DevToolView>('main');
  const [metrics, setMetrics] = useState<any[]>([]);
  const analytics = usePerformanceMonitoring();

  useEffect(() => {
    if (!enabled) return;

    // Add some initial test data for demonstration
    setMetrics([
      { name: 'FCP', value: 1200, timestamp: Date.now() - 1000 },
      { name: 'LCP', value: 2100, timestamp: Date.now() - 2000 },
      { name: 'CLS', value: 0.05, timestamp: Date.now() - 3000 },
    ]);

    // Listen for custom performance events
    const handlePerformanceEvent = (event: CustomEvent) => {
      setMetrics(prev => [event.detail, ...prev].slice(0, 10));
    };

    window.addEventListener(
      'performance-metric',
      handlePerformanceEvent as EventListener
    );

    // Initialize Sentry breadcrumb (silent) - only if Sentry is available
    try {
      Sentry.addBreadcrumb({
        message: 'Dev Tools initialized',
        level: 'info',
        data: { component: 'DevTools' },
      });
    } catch (error) {
      // Sentry not available, continue without it
    }

    return () => {
      window.removeEventListener(
        'performance-metric',
        handlePerformanceEvent as EventListener
      );
    };
  }, [enabled]);

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

  const renderMainView = () => (
    <div className='space-y-3'>
      {/* Web Vitals in a single row */}
      <div className='flex items-center space-x-4'>
        {metrics.slice(0, 4).map((metric, index) => (
          <div key={index} className='flex items-center space-x-1'>
            <span className='text-xs text-gray-500 font-mono'>
              {metric.name}:
            </span>
            <span
              className={`text-xs font-semibold ${getStatusColor(metric.name, metric.value)}`}
            >
              {formatValue(metric.value, metric.name)}
            </span>
          </div>
        ))}
      </div>

      {/* Settings button on its own row */}
      <button
        onClick={() => setCurrentView('settings')}
        className='w-full flex items-center justify-center space-x-2 px-3 py-2 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors'
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
            d='M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z'
          />
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth={2}
            d='M15 12a3 3 0 11-6 0 3 3 0 016 0z'
          />
        </svg>
        <span>Settings</span>
      </button>
    </div>
  );

  const renderSettingsView = () => (
    <div className='space-y-3'>
      <div className='flex items-center space-x-2'>
        <button
          onClick={() => setCurrentView('main')}
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
              d='M15 19l-7-7 7-7'
            />
          </svg>
        </button>
        <h3 className='font-semibold text-gray-800 text-sm'>Settings</h3>
      </div>

      <div className='space-y-2 text-xs'>
        <div className='flex justify-between items-center'>
          <span className='text-gray-600'>Current Route:</span>
          <span className='font-mono text-gray-800'>
            {window.location.pathname}
          </span>
        </div>
        <div className='flex justify-between items-center'>
          <span className='text-gray-600'>React Router:</span>
          <span className='font-mono text-gray-800'>v7</span>
        </div>
        <div className='flex justify-between items-center'>
          <span className='text-gray-600'>Environment:</span>
          <span className='font-mono text-gray-800'>
            {import.meta.env.MODE}
          </span>
        </div>
      </div>

      <div className='pt-2 border-t border-gray-200 space-y-2'>
        <button
          onClick={() => {
            // Restart dev server functionality
            window.location.reload();
          }}
          className='w-full px-3 py-2 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors'
        >
          Restart Dev Server
        </button>
        <button
          onClick={() => {
            // Clear cache functionality
            if ('caches' in window) {
              caches.keys().then(names => {
                names.forEach(name => caches.delete(name));
              });
            }
            window.location.reload();
          }}
          className='w-full px-3 py-2 text-xs bg-orange-100 text-orange-700 rounded hover:bg-orange-200 transition-colors'
        >
          Clear Cache & Reload
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={() => setIsVisible(!isVisible)}
        className='fixed bottom-4 left-4 z-50 bg-gray-300 text-gray-700 p-2 rounded-lg shadow-lg hover:bg-gray-400 transition-colors'
        title='Development Tools'
      >
        <img src='/stratos-icon.png' alt='Stratos' className='w-4 h-4' />
      </button>

      {/* Dev Tools Panel */}
      {isVisible && (
        <div className='fixed bottom-16 left-4 z-50 bg-white border border-gray-200 rounded-lg shadow-xl w-80 max-h-80 overflow-hidden'>
          {/* Header */}
          <div className='bg-gray-50 px-3 py-2 border-b border-gray-200 flex justify-between items-center'>
            <h3 className='font-semibold text-gray-800 text-sm'>Dev Tools</h3>
            <button
              onClick={() => setIsVisible(false)}
              className='text-gray-500 hover:text-gray-700'
            >
              <svg
                className='w-3 h-3'
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

          {/* Content */}
          <div className='p-3'>
            {currentView === 'main' ? renderMainView() : renderSettingsView()}
          </div>
        </div>
      )}
    </>
  );
}
