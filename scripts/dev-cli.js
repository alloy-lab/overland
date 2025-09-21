#!/usr/bin/env node

import { execSync } from 'child_process';
import { existsSync } from 'fs';

const commands = {
  setup: {
    description: 'Complete development setup',
    action: () => {
      console.log('🚀 Starting complete setup...');
      execSync('./scripts/setup.sh', { stdio: 'inherit' });
    },
  },

  start: {
    description: 'Start development servers',
    action: () => {
      console.log('🏃 Starting development servers...');
      execSync('pnpm dev', { stdio: 'inherit' });
    },
  },

  build: {
    description: 'Build all applications',
    action: () => {
      console.log('🔨 Building applications...');
      execSync('pnpm build', { stdio: 'inherit' });
    },
  },

  test: {
    description: 'Run all tests',
    action: () => {
      console.log('🧪 Running tests...');
      execSync('pnpm test', { stdio: 'inherit' });
    },
  },

  lint: {
    description: 'Lint all code',
    action: () => {
      console.log('🔍 Linting code...');
      execSync('pnpm lint', { stdio: 'inherit' });
    },
  },

  format: {
    description: 'Format code with Prettier',
    action: () => {
      console.log('✨ Formatting code...');
      execSync('pnpm format', { stdio: 'inherit' });
    },
  },

  generate: {
    description: 'Generate types and API clients',
    action: () => {
      console.log('⚡ Generating types and API clients...');
      execSync('pnpm generate:types', { stdio: 'inherit' });
    },
  },

  'new-collection': {
    description: 'Create a new CMS collection',
    action: args => {
      if (args.length === 0) {
        console.log('📝 Available collection templates:');
        execSync('node scripts/generate-collection.js --help', {
          stdio: 'inherit',
        });
      } else {
        console.log(`📝 Creating new collection: ${args[0]}`);
        execSync(`node scripts/generate-collection.js ${args.join(' ')}`, {
          stdio: 'inherit',
        });
      }
    },
  },

  config: {
    description: 'Show or apply auto-detected configuration',
    action: args => {
      if (args.includes('--apply')) {
        console.log('🔧 Applying auto-detected configuration...');
        execSync('node scripts/auto-config.js --apply', { stdio: 'inherit' });
      } else {
        console.log('🔍 Detecting optimal configuration...');
        execSync('node scripts/auto-config.js', { stdio: 'inherit' });
      }
    },
  },

  env: {
    description: 'Generate environment configuration',
    action: args => {
      console.log('🌍 Generating environment configuration...');
      execSync(`node scripts/generate-env.js ${args.join(' ')}`, {
        stdio: 'inherit',
      });
    },
  },

  docker: {
    description: 'Start Docker development environment',
    action: () => {
      console.log('🐳 Starting Docker development environment...');
      execSync('docker-compose -f docker-compose.dev.yml up -d', {
        stdio: 'inherit',
      });
    },
  },

  status: {
    description: 'Show development environment status',
    action: () => {
      console.log('📊 Development Environment Status');
      console.log('==================================');

      // Check if .env exists
      if (existsSync('.env')) {
        console.log('✅ Environment file: .env exists');
      } else {
        console.log('❌ Environment file: .env missing');
      }

      // Check if node_modules exists
      if (existsSync('node_modules')) {
        console.log('✅ Dependencies: Installed');
      } else {
        console.log('❌ Dependencies: Not installed');
      }

      // Check if Docker is running
      try {
        execSync('docker ps', { stdio: 'ignore' });
        console.log('✅ Docker: Running');
      } catch (error) {
        console.log('❌ Docker: Not running or not installed');
      }

      // Check if ports are available
      try {
        execSync('lsof -i :3000', { stdio: 'ignore' });
        console.log('⚠️  Port 3000: In use');
      } catch (error) {
        console.log('✅ Port 3000: Available');
      }

      try {
        execSync('lsof -i :3001', { stdio: 'ignore' });
        console.log('⚠️  Port 3001: In use');
      } catch (error) {
        console.log('✅ Port 3001: Available');
      }
    },
  },
};

const showHelp = () => {
  console.log(`
🏔️  Overland Stack Development CLI

Usage: node scripts/dev-cli.js <command> [options]

Available Commands:
${Object.entries(commands)
  .map(([cmd, info]) => `  ${cmd.padEnd(15)} - ${info.description}`)
  .join('\n')}

Examples:
  node scripts/dev-cli.js setup
  node scripts/dev-cli.js start
  node scripts/dev-cli.js new-collection blog
  node scripts/dev-cli.js config --apply
  node scripts/dev-cli.js status

Quick Start:
  1. node scripts/dev-cli.js setup
  2. node scripts/dev-cli.js start
`);
};

// Main execution
const args = process.argv.slice(2);
const command = args[0];
const commandArgs = args.slice(1);

if (!command || command === '--help' || command === '-h') {
  showHelp();
  process.exit(0);
}

if (!commands[command]) {
  console.error(`❌ Unknown command: ${command}`);
  console.log('Run with --help to see available commands');
  process.exit(1);
}

try {
  commands[command].action(commandArgs);
} catch (error) {
  console.error(`❌ Command failed: ${error.message}`);
  process.exit(1);
}
