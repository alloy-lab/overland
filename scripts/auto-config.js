#!/usr/bin/env node

import { execSync } from 'child_process';
import { existsSync, readFileSync, writeFileSync } from 'fs';

const detectDatabase = () => {
  // Check for common database configurations
  const dockerComposePath = 'docker-compose.yml';
  if (existsSync(dockerComposePath)) {
    try {
      const content = readFileSync(dockerComposePath, 'utf8');
      if (content.includes('postgres')) {
        return {
          type: 'postgres',
          url: 'postgresql://postgres:password@localhost:5432/overland',
          docker: true,
        };
      }
    } catch (error) {
      // Ignore errors
    }
  }

  // Check for local PostgreSQL
  try {
    execSync('pg_isready -h localhost -p 5432', { stdio: 'ignore' });
    return {
      type: 'postgres',
      url: 'postgresql://postgres:password@localhost:5432/overland',
      docker: false,
    };
  } catch (error) {
    // PostgreSQL not available
  }

  return {
    type: 'postgres',
    url: 'postgresql://postgres:password@localhost:5432/overland',
    docker: true,
    note: 'Using Docker PostgreSQL (recommended)',
  };
};

const detectPorts = () => {
  const usedPorts = new Set();

  // Check for running services
  try {
    const netstat = execSync(
      'netstat -tuln 2>/dev/null || ss -tuln 2>/dev/null',
      { encoding: 'utf8' }
    );
    const portMatches = netstat.match(/:(\d+)\s/g);
    if (portMatches) {
      portMatches.forEach(match => {
        const port = parseInt(match.slice(1, -1));
        if (port >= 3000 && port <= 3010) {
          usedPorts.add(port);
        }
      });
    }
  } catch (error) {
    // Ignore errors
  }

  // Find available ports
  let webPort = 3000;
  let cmsPort = 3001;

  while (usedPorts.has(webPort)) webPort++;
  while (usedPorts.has(cmsPort) || cmsPort === webPort) cmsPort++;

  return { webPort, cmsPort };
};

const detectEnvironment = () => {
  const nodeEnv = process.env.NODE_ENV || 'development';
  const isProduction = nodeEnv === 'production';

  return {
    environment: nodeEnv,
    isProduction,
    isDevelopment: !isProduction,
  };
};

const generateOptimalConfig = () => {
  const database = detectDatabase();
  const ports = detectPorts();
  const env = detectEnvironment();

  return {
    database,
    ports,
    environment: env,
    recommendations: [],
  };
};

const showConfig = () => {
  const config = generateOptimalConfig();

  console.log('🔍 Auto-Detected Configuration:');
  console.log('================================');
  console.log(`🌍 Environment: ${config.environment.environment}`);
  console.log(
    `🗄️  Database: ${config.database.type} (${config.database.docker ? 'Docker' : 'Local'})`
  );
  console.log(`🔗 Database URL: ${config.database.url}`);
  console.log(`🌐 Web Port: ${config.ports.webPort}`);
  console.log(`⚙️  CMS Port: ${config.ports.cmsPort}`);

  if (config.database.note) {
    console.log(`💡 Note: ${config.database.note}`);
  }

  console.log('\n📋 Recommended Environment Variables:');
  console.log('=====================================');
  console.log(`DATABASE_URI=${config.database.url}`);
  console.log(`WEB_PORT=${config.ports.webPort}`);
  console.log(`CMS_PORT=${config.ports.cmsPort}`);
  console.log(`NODE_ENV=${config.environment.environment}`);
  console.log(
    `PAYLOAD_PUBLIC_SERVER_URL=http://localhost:${config.ports.webPort}`
  );
  console.log(
    `PAYLOAD_PUBLIC_CMS_URL=http://localhost:${config.ports.cmsPort}/admin`
  );

  return config;
};

const applyConfig = () => {
  const config = generateOptimalConfig();

  // Update .env file if it exists
  const envPath = '.env';
  if (existsSync(envPath)) {
    try {
      let envContent = readFileSync(envPath, 'utf8');

      // Update key variables
      envContent = envContent.replace(
        /^DATABASE_URI=.*$/m,
        `DATABASE_URI=${config.database.url}`
      );
      envContent = envContent.replace(
        /^WEB_PORT=.*$/m,
        `WEB_PORT=${config.ports.webPort}`
      );
      envContent = envContent.replace(
        /^CMS_PORT=.*$/m,
        `CMS_PORT=${config.ports.cmsPort}`
      );
      envContent = envContent.replace(
        /^NODE_ENV=.*$/m,
        `NODE_ENV=${config.environment.environment}`
      );
      envContent = envContent.replace(
        /^PAYLOAD_PUBLIC_SERVER_URL=.*$/m,
        `PAYLOAD_PUBLIC_SERVER_URL=http://localhost:${config.ports.webPort}`
      );
      envContent = envContent.replace(
        /^PAYLOAD_PUBLIC_CMS_URL=.*$/m,
        `PAYLOAD_PUBLIC_CMS_URL=http://localhost:${config.ports.cmsPort}/admin`
      );

      writeFileSync(envPath, envContent);
      console.log('✅ Updated .env file with optimal configuration');
    } catch (error) {
      console.log('⚠️  Could not update .env file:', error.message);
    }
  } else {
    console.log('⚠️  No .env file found. Run the setup script first.');
  }
};

// CLI interface
const args = process.argv.slice(2);

if (args.includes('--help') || args.includes('-h')) {
  console.log(`
Auto-Configuration Detector for Overland Stack

Usage: node scripts/auto-config.js [options]

Options:
  --apply               Apply the detected configuration to .env
  --help, -h            Show this help

This script automatically detects:
  - Available database connections
  - Free ports for web and CMS services
  - Current environment settings
  - Optimal configuration recommendations
`);
  process.exit(0);
}

if (args.includes('--apply')) {
  showConfig();
  console.log('\n🔄 Applying configuration...');
  applyConfig();
} else {
  showConfig();
  console.log('\n💡 To apply this configuration, run:');
  console.log('   node scripts/auto-config.js --apply');
}
