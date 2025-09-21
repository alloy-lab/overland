#!/usr/bin/env node

import { randomBytes } from 'crypto';
import { existsSync, writeFileSync } from 'fs';

const generateSecureSecret = () => randomBytes(32).toString('hex');

const generateEnvFile = (options = {}) => {
  const {
    environment = 'development',
    databaseUrl = 'postgresql://postgres:password@localhost:5432/overland',
    domain = 'localhost',
    ports = { web: 3000, cms: 3001 },
  } = options;

  const isProduction = environment === 'production';
  const protocol = isProduction ? 'https' : 'http';

  const envContent = `# Auto-generated environment configuration
# Generated on: ${new Date().toISOString()}
# Environment: ${environment}

# Database
DATABASE_URI=${databaseUrl}

# Payload CMS
PAYLOAD_SECRET=${generateSecureSecret()}
PAYLOAD_PUBLIC_SERVER_URL=${protocol}://${domain}:${ports.web}
PAYLOAD_PUBLIC_CMS_URL=${protocol}://${domain}:${ports.cms}/admin

# Web App
WEB_PORT=${ports.web}
CMS_PORT=${ports.cms}
NODE_ENV=${environment}

# Security (auto-configured)
ENABLE_CORS=true
ENABLE_RATE_LIMITING=true
ENABLE_CSRF=false
API_KEY=${generateSecureSecret()}
ADMIN_TOKEN=${generateSecureSecret()}

# Logging
LOG_LEVEL=${isProduction ? 'warn' : 'info'}

# File Uploads
MAX_FILE_SIZE=10MB
ALLOWED_FILE_TYPES=image/jpeg,image/png,image/gif,image/webp,application/pdf,text/plain

# CORS Origins (auto-configured for development)
ALLOWED_ORIGIN_1=${protocol}://${domain}:${ports.web}
ALLOWED_ORIGIN_2=${protocol}://${domain}:${ports.cms}

${
  isProduction
    ? `
# Production-specific settings
# Update these for your production environment:
# PAYLOAD_PUBLIC_SERVER_URL=https://your-domain.com
# PAYLOAD_PUBLIC_CMS_URL=https://your-domain.com/admin
# ALLOWED_ORIGIN_1=https://your-domain.com
# ALLOWED_ORIGIN_2=https://your-domain.com
`
    : ''
}
`;

  return envContent;
};

// CLI interface
const args = process.argv.slice(2);
const envFile = '.env';

if (args.includes('--help') || args.includes('-h')) {
  console.log(`
Environment Generator for Overland Stack

Usage: node scripts/generate-env.js [options]

Options:
  --env <environment>    Environment (development|production) [default: development]
  --db <url>            Database URL [default: postgresql://postgres:password@localhost:5432/overland]
  --domain <domain>     Domain name [default: localhost]
  --web-port <port>     Web app port [default: 3000]
  --cms-port <port>     CMS port [default: 3001]
  --force               Overwrite existing .env file
  --help, -h            Show this help

Examples:
  node scripts/generate-env.js
  node scripts/generate-env.js --env production --domain myapp.com
  node scripts/generate-env.js --db postgresql://user:pass@db:5432/mydb
`);
  process.exit(0);
}

// Parse arguments
const options = {
  environment: 'development',
  databaseUrl: 'postgresql://postgres:password@localhost:5432/overland',
  domain: 'localhost',
  ports: { web: 3000, cms: 3001 },
};

for (let i = 0; i < args.length; i++) {
  switch (args[i]) {
    case '--env':
      options.environment = args[++i];
      break;
    case '--db':
      options.databaseUrl = args[++i];
      break;
    case '--domain':
      options.domain = args[++i];
      break;
    case '--web-port':
      options.ports.web = parseInt(args[++i]);
      break;
    case '--cms-port':
      options.ports.cms = parseInt(args[++i]);
      break;
  }
}

// Check if .env already exists
if (existsSync(envFile) && !args.includes('--force')) {
  console.log('❌ .env file already exists. Use --force to overwrite.');
  process.exit(1);
}

// Generate and write .env file
try {
  const envContent = generateEnvFile(options);
  writeFileSync(envFile, envContent);
  console.log('✅ Environment file generated successfully!');
  console.log(`📁 Created: ${envFile}`);
  console.log(`🌍 Environment: ${options.environment}`);
  console.log(
    `🔐 Generated secure secrets for PAYLOAD_SECRET, API_KEY, and ADMIN_TOKEN`
  );

  if (options.environment === 'development') {
    console.log('\n🚀 Ready to start development:');
    console.log('   pnpm dev');
  }
} catch (error) {
  console.error('❌ Failed to generate environment file:', error.message);
  process.exit(1);
}
