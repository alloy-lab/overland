import logoDark from './logo-dark.svg';
import logoLight from './logo-light.svg';

export function Welcome({ message }: { message: string }) {
  return (
    <main className='flex h-screen items-center justify-center'>
      <div className='flex flex-col items-center gap-16'>
        <header className='flex flex-col items-center gap-2'>
          {/* React Router SVG Logos */}
          <div className='w-[500px] max-w-[100vw] p-4'>
            <img
              src={logoLight}
              alt='Overland'
              className='block w-full dark:hidden'
            />
            <img
              src={logoDark}
              alt='Overland'
              className='hidden w-full dark:block'
            />
          </div>
        </header>

        <div className='text-center max-w-2xl'>
          <p className='text-lg text-gray-600 mb-4'>
            A modern, full-stack web application starter built with React Router
            SSR and Payload CMS. Ready to build something amazing? Start by
            exploring the codebase and customizing to your needs.
          </p>
        </div>
      </div>
    </main>
  );
}

const resources = [
  {
    href: 'https://reactrouter.com/docs',
    text: 'React Router Docs',
    icon: (
      <svg
        xmlns='http://www.w3.org/2000/svg'
        width='24'
        height='20'
        viewBox='0 0 20 20'
        fill='none'
        className='stroke-gray-600 group-hover:stroke-current dark:stroke-gray-300'
      >
        <path
          d='M9.99981 10.0751V9.99992M17.4688 17.4688C15.889 19.0485 11.2645 16.9853 7.13958 12.8604C3.01467 8.73546 0.951405 4.11091 2.53116 2.53116C4.11091 0.951405 8.73546 3.01467 12.8604 7.13958C16.9853 11.2645 19.0485 15.889 17.4688 17.4688ZM2.53132 17.4688C0.951566 15.8891 3.01483 11.2645 7.13974 7.13963C11.2647 3.01471 15.8892 0.951453 17.469 2.53121C19.0487 4.11096 16.9854 8.73551 12.8605 12.8604C8.73562 16.9853 4.11107 19.0486 2.53132 17.4688Z'
          strokeWidth='1.5'
          strokeLinecap='round'
        />
      </svg>
    ),
  },
];
