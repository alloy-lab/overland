import { Link } from 'react-router';

export function meta() {
  return [
    { title: 'Server Error - Overland Stack' },
    {
      name: 'description',
      content: 'An internal server error occurred. Please try again later.',
    },
  ];
}

export default function ServerError() {
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
        <h1 className='text-4xl font-bold text-gray-900 mb-4'>500</h1>
        <h2 className='text-xl font-semibold text-gray-700 mb-4'>
          Internal Server Error
        </h2>
        <p className='text-gray-600 mb-8'>
          Something went wrong on our end. We're working to fix this issue.
          Please try again in a few minutes.
        </p>
        <div className='space-y-4'>
          <Link
            to='/'
            className='block w-full px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors'
          >
            Go Home
          </Link>
          <button
            onClick={() => window.location.reload()}
            className='block w-full px-6 py-3 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors'
          >
            Try Again
          </button>
        </div>
      </div>
    </div>
  );
}
