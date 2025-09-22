import { type RouteConfig, index, route } from '@react-router/dev/routes';

export default [
  index('routes/home.tsx'),
  route('pages', 'routes/pages._index.tsx'),
  route('pages/:slug', 'routes/pages.$slug.tsx'),
  route('api/pages', 'routes/api.pages.ts'),
  route('api/pages/:id', 'routes/api.pages.$id.ts'),
  route('api/images/optimize', 'routes/api.images.optimize.ts'),
  route('robots.txt', 'routes/robots.txt.ts'),
  route('sitemap.xml', 'routes/sitemap.xml.ts'),
] satisfies RouteConfig;
