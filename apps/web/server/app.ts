import { createRequestHandler } from '@react-router/express';
import express from 'express';
import 'react-router';

// Import security middleware
import {
  apiSecurity,
  formatApiResponse,
  staticSecurity,
} from '../app/lib/security';

declare module 'react-router' {
  interface AppLoadContext {
    VALUE_FROM_EXPRESS: string;
  }
}

export const app = express();

// Apply security middleware
app.use(staticSecurity);
app.use(apiSecurity);
app.use(formatApiResponse);

app.use(
  createRequestHandler({
    build: () => import('virtual:react-router/server-build'),
    getLoadContext() {
      return {
        VALUE_FROM_EXPRESS: 'Hello from Express',
      };
    },
  })
);
