import { Link } from 'react-router';

export function meta() {
  return [
    { title: 'Page Not Found - Overland Stack' },
    {
      name: 'description',
      content: 'The page you are looking for could not be found.',
    },
  ];
}

export default function NotFound() {
  return (
    <div className='min-h-screen flex items-center justify-center bg-gray-50'>
      <div className='max-w-md w-full bg-white shadow-lg rounded-lg p-8 text-center'>
        <div className='flex items-center justify-center w-16 h-16 mx-auto bg-blue-100 rounded-full mb-6'>
          <svg
            className='w-8 h-8 text-blue-600'
            fill='none'
            stroke='currentColor'
            viewBox='0 0 24 24'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M9.172 16.172a4 4 0 015.656 0M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
            />
          </svg>
        </div>
        <h1 className='text-4xl font-bold text-gray-900 mb-4'>404</h1>
        <h2 className='text-xl font-semibold text-gray-700 mb-4'>
          Page Not Found
        </h2>
        <p className='text-gray-600 mb-8'>
          Sorry, we couldn't find the page you're looking for. It might have
          been moved, deleted, or you entered the wrong URL.
        </p>
        <div className='space-y-4'>
          <Link
            to='/'
            className='block w-full px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors'
          >
            Go Home
          </Link>
          <button
            onClick={() => window.history.back()}
            className='block w-full px-6 py-3 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors'
          >
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
}
