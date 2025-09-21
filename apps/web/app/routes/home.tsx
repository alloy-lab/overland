import { Welcome } from '../welcome/welcome';
import type { Route } from './+types/home';

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'Overland Stack' },
    {
      name: 'description',
      content:
        'A modern web application built with React Router SSR and Payload CMS',
    },
  ];
}

export function loader({ context }: Route.LoaderArgs) {
  return { message: 'Welcome to Overland Stack!' };
}

export default function Home({ loaderData }: Route.ComponentProps) {
  return <Welcome message={loaderData.message} />;
}
