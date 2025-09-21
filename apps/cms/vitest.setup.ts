// Any setup scripts you might need go here

// Load .env files
import 'dotenv/config';

// Set required environment variables for testing
process.env.PAYLOAD_SECRET = 'test-secret-key-for-development-only';
process.env.DATABASE_URI =
  'postgresql://postgres:password@localhost:5432/overland';
process.env.PAYLOAD_PUBLIC_SERVER_URL = 'http://localhost:3001';
process.env.PAYLOAD_PUBLIC_CMS_URL = 'http://localhost:3001/admin';
