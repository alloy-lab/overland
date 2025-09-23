import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from 'react-router';

import type { Route } from './+types/root';
import './app.css';
import { DevTools } from './components/PerformanceMonitor';
import { ErrorBoundary as AppErrorBoundary } from './lib/ErrorBoundary';
import logger from './lib/logger';

// Initialize Sentry for React Router v7
import './lib/errorHandler';

export const links: Route.LinksFunction = () => [
  { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
  {
    rel: 'preconnect',
    href: 'https://fonts.gstatic.com',
    crossOrigin: 'anonymous',
  },
  {
    rel: 'stylesheet',
    href: 'https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap',
  },
];

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang='en'>
      <head>
        <meta charSet='utf-8' />
        <meta name='viewport' content='width=device-width, initial-scale=1' />
        <Meta />
        <Links />
      </head>
      <body>
        <AppErrorBoundary>{children}</AppErrorBoundary>
        <DevTools />
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  // Log the error
  logger.error('React Router ErrorBoundary caught an error:', {
    error: error instanceof Error ? error.message : String(error),
    stack: error instanceof Error ? error.stack : undefined,
  });

  let message = 'Oops!';
  let details = 'An unexpected error occurred.';
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? '404' : 'Error';
    details =
      error.status === 404
        ? 'The requested page could not be found.'
        : error.statusText || details;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <div className='min-h-screen flex items-center justify-center bg-gray-50'>
      <div className='max-w-md w-full bg-white shadow-lg rounded-lg p-8 text-center'>
        <div className='flex items-center justify-center w-16 h-16 mx-auto bg-red-100 rounded-full mb-6'>
          <svg
            className='w-8 h-8 text-red-600'
            fill='none'
            stroke='currentColor'
            viewBox='0 0 24 24'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z'
            />
          </svg>
        </div>
        <h1 className='text-4xl font-bold text-gray-900 mb-4'>{message}</h1>
        <h2 className='text-xl font-semibold text-gray-700 mb-4'>{details}</h2>
        <div className='space-y-4'>
          <button
            onClick={() => window.location.reload()}
            className='block w-full px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors'
          >
            Refresh Page
          </button>
          <button
            onClick={() => window.history.back()}
            className='block w-full px-6 py-3 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors'
          >
            Go Back
          </button>
        </div>
        {stack && import.meta.env.DEV && (
          <details className='mt-6 p-4 bg-gray-100 rounded-md text-left'>
            <summary className='cursor-pointer font-medium text-gray-700'>
              Error Details (Development)
            </summary>
            <pre className='mt-2 text-xs text-gray-600 overflow-auto'>
              {stack}
            </pre>
          </details>
        )}
      </div>
    </div>
  );
}
