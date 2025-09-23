import { useEffect, useState } from 'react';
import { usePerformanceMonitoring } from '~/lib/performance';
import * as Sentry from '@sentry/react';

interface DevToolsProps {
  enabled?: boolean;
}

type DevToolTab = 'performance' | 'errors' | 'network' | 'info';

export function DevTools({
  enabled = process.env.NODE_ENV === 'development',
}: DevToolsProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [activeTab, setActiveTab] = useState<DevToolTab>('performance');
  const [metrics, setMetrics] = useState<any[]>([]);
  const [errors, setErrors] = useState<any[]>([]);
  const analytics = usePerformanceMonitoring();

  useEffect(() => {
    if (!enabled || !analytics) return;

    // Listen for custom performance events
    const handlePerformanceEvent = (event: CustomEvent) => {
      setMetrics(prev => [event.detail, ...prev].slice(0, 10));
    };

    // Listen for error events
    const handleErrorEvent = (event: CustomEvent) => {
      setErrors(prev => [event.detail, ...prev].slice(0, 10));
    };

    // Listen for global errors
    const handleGlobalError = (event: ErrorEvent) => {
      setErrors(prev =>
        [
          {
            type: 'JavaScript Error',
            message: event.message,
            filename: event.filename,
            lineno: event.lineno,
            colno: event.colno,
            timestamp: new Date().toISOString(),
          },
          ...prev,
        ].slice(0, 10)
      );
    };

    window.addEventListener(
      'performance-metric',
      handlePerformanceEvent as EventListener
    );
    window.addEventListener(
      'dev-tools-error',
      handleErrorEvent as EventListener
    );
    window.addEventListener('error', handleGlobalError);

    // Initialize Sentry breadcrumb (silent)
    Sentry.addBreadcrumb({
      message: 'Dev Tools initialized',
      level: 'info',
      data: { component: 'DevTools' },
    });

    return () => {
      window.removeEventListener(
        'performance-metric',
        handlePerformanceEvent as EventListener
      );
      window.removeEventListener(
        'dev-tools-error',
        handleErrorEvent as EventListener
      );
      window.removeEventListener('error', handleGlobalError);
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

  const tabs = [
    { id: 'performance' as const, label: 'Perf', icon: '📊' },
    { id: 'errors' as const, label: 'Errors', icon: '🚨' },
    { id: 'network' as const, label: 'Network', icon: '🌐' },
    { id: 'info' as const, label: 'Info', icon: 'ℹ️' },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'performance':
        return (
          <div className='space-y-3'>
            {metrics.length > 0 ? (
              <div className='space-y-1 max-h-32 overflow-y-auto'>
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
            ) : (
              <div className='text-gray-500 text-center py-2 text-xs'>
                No metrics yet
              </div>
            )}
          </div>
        );

      case 'errors':
        return (
          <div className='space-y-3'>
            {errors.length > 0 ? (
              <div className='space-y-1 max-h-32 overflow-y-auto'>
                {errors.map((error, index) => (
                  <div
                    key={index}
                    className='text-xs border-l-2 border-red-200 pl-2'
                  >
                    <div className='font-mono text-red-600'>
                      {error.type || 'Error'}
                    </div>
                    <div className='text-gray-500 truncate'>
                      {error.message}
                    </div>
                    {error.filename && (
                      <div className='text-gray-400 text-xs'>
                        {error.filename}:{error.lineno}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className='text-gray-500 text-center py-2 text-xs'>
                No errors detected
              </div>
            )}
          </div>
        );

      case 'network':
        return (
          <div className='space-y-3'>
            <div className='text-gray-500 text-center py-2 text-xs'>
              Network monitoring coming soon
            </div>
          </div>
        );

      case 'info':
        return (
          <div className='space-y-3'>
            <div className='space-y-1 text-xs'>
              <div className='flex justify-between'>
                <span className='text-gray-500'>Environment:</span>
                <span className='font-mono'>{import.meta.env.MODE}</span>
              </div>
              <div className='flex justify-between'>
                <span className='text-gray-500'>Sentry:</span>
                <span className='font-mono'>
                  {import.meta.env.VITE_SENTRY_DSN ? 'Enabled' : 'Disabled'}
                </span>
              </div>
              <div className='flex justify-between'>
                <span className='text-gray-500'>React Router:</span>
                <span className='font-mono'>v7</span>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

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

          {/* Tabs */}
          <div className='flex border-b border-gray-200'>
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 px-2 py-1 text-xs font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                <span className='mr-1'>{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className='p-3'>{renderTabContent()}</div>
        </div>
      )}
    </>
  );
}
