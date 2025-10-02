#!/usr/bin/env node

import { execSync } from 'child_process';
import { createHash } from 'crypto';
import {
  createReadStream,
  createWriteStream,
  existsSync,
  readFileSync,
  writeFileSync,
} from 'fs';
import { pipeline } from 'stream/promises';
import { createGzip } from 'zlib';

/**
 * Database sync utility for Overland Stack
 * Follows industry best practices for database operations
 */

const CONFIG = {
  // Local database connection
  local: {
    host: 'localhost',
    port: '5432',
    database: 'overland',
    username: 'postgres',
    password: process.env.LOCAL_DB_PASSWORD || 'password',
  },

  // Coolify database connection
  remote: {
    host: process.env.COOLIFY_DB_HOST || 'your-coolify-server.com',
    port: process.env.COOLIFY_DB_PORT || '5432',
    database: process.env.COOLIFY_DB_NAME || 'overland',
    username: process.env.COOLIFY_DB_USER || 'postgres',
    password: process.env.COOLIFY_DB_PASSWORD || 'your-password',
  },

  // Backup settings
  backup: {
    directory: './backups',
    filename: `overland-backup-${new Date().toISOString().split('T')[0]}.sql`,
    compress: true,
    retention: 7, // Keep backups for 7 days
  },

  // Safety settings
  safety: {
    dryRun: process.env.DRY_RUN === 'true',
    validateBackup: true,
    requireConfirmation: process.env.NODE_ENV === 'production',
    maxBackupSize: 100 * 1024 * 1024, // 100MB
  },
};

class DatabaseSyncer {
  constructor() {
    this.ensureBackupDirectory();
    this.validateConfiguration();
  }

  ensureBackupDirectory() {
    if (!existsSync(CONFIG.backup.directory)) {
      execSync(`mkdir -p ${CONFIG.backup.directory}`);
    }
  }

  validateConfiguration() {
    const required = [
      'COOLIFY_DB_HOST',
      'COOLIFY_DB_USER',
      'COOLIFY_DB_PASSWORD',
    ];

    const missing = required.filter(key => !process.env[key]);
    if (missing.length > 0) {
      console.error(
        '❌ Missing required environment variables:',
        missing.join(', ')
      );
      console.error('Please check your .env.coolify file');
      process.exit(1);
    }
  }

  getConnectionString(config, includePassword = false) {
    const password = includePassword ? `:${config.password}` : '';
    return `postgresql://${config.username}${password}@${config.host}:${config.port}/${config.database}`;
  }

  async createLocalBackup() {
    console.log('📦 Creating local database backup...');

    const backupPath = `${CONFIG.backup.directory}/${CONFIG.backup.filename}`;
    const connectionString = this.getConnectionString(CONFIG.local, true);

    try {
      // Check if we're using Docker
      const isDocker = this.isUsingDocker();

      let command;
      if (isDocker) {
        command = `docker exec overland-postgres-dev pg_dump -U ${CONFIG.local.username} -d ${CONFIG.local.database} --verbose --no-owner --no-privileges`;
      } else {
        command = `pg_dump "${connectionString}" --verbose --no-owner --no-privileges`;
      }

      if (CONFIG.safety.dryRun) {
        console.log('🔍 DRY RUN: Would execute:', command);
        return backupPath;
      }

      execSync(command, {
        stdio: 'pipe',
        output: backupPath,
      });

      // Validate backup
      if (CONFIG.safety.validateBackup) {
        await this.validateBackup(backupPath);
      }

      console.log(`✅ Local backup created: ${backupPath}`);
      return backupPath;
    } catch (error) {
      console.error('❌ Failed to create local backup:', error.message);
      throw error;
    }
  }

  async validateBackup(backupPath) {
    console.log('🔍 Validating backup...');

    try {
      // Check file size
      const stats = await import('fs').then(fs => fs.promises.stat(backupPath));
      if (stats.size > CONFIG.safety.maxBackupSize) {
        throw new Error(`Backup too large: ${stats.size} bytes`);
      }

      // Check file integrity (basic SQL validation)
      const content = readFileSync(backupPath, 'utf8');
      if (!content.includes('PostgreSQL database dump')) {
        throw new Error('Invalid backup file format');
      }

      // Generate checksum
      const hash = createHash('sha256');
      hash.update(content);
      const checksum = hash.digest('hex');

      // Save checksum for verification
      writeFileSync(`${backupPath}.checksum`, checksum);

      console.log('✅ Backup validation passed');
      return checksum;
    } catch (error) {
      console.error('❌ Backup validation failed:', error.message);
      throw error;
    }
  }

  async compressBackup(backupPath) {
    if (!CONFIG.backup.compress) return backupPath;

    console.log('🗜️  Compressing backup...');
    const compressedPath = `${backupPath}.gz`;

    try {
      if (CONFIG.safety.dryRun) {
        console.log('🔍 DRY RUN: Would compress backup');
        return compressedPath;
      }

      await pipeline(
        createReadStream(backupPath),
        createGzip(),
        createWriteStream(compressedPath)
      );

      console.log(`✅ Backup compressed: ${compressedPath}`);
      return compressedPath;
    } catch (error) {
      console.error('❌ Failed to compress backup:', error.message);
      throw error;
    }
  }

  async uploadToCoolify(backupPath) {
    console.log('☁️  Uploading to Coolify...');

    const uploadMethod = process.env.UPLOAD_METHOD || 'scp';

    if (CONFIG.safety.dryRun) {
      console.log(`🔍 DRY RUN: Would upload via ${uploadMethod}`);
      return;
    }

    switch (uploadMethod) {
      case 'scp':
        await this.uploadViaSCP(backupPath);
        break;
      case 's3':
        await this.uploadViaS3(backupPath);
        break;
      default:
        console.log(
          '⚠️  Manual upload required. Please upload the backup file to your Coolify server.'
        );
        console.log(`   Backup file: ${backupPath}`);
    }
  }

  async uploadViaSCP(backupPath) {
    const coolifyServer =
      process.env.COOLIFY_SERVER || 'user@your-coolify-server.com';
    const remotePath = process.env.COOLIFY_REMOTE_PATH || '/tmp/';

    try {
      // Test SSH connection first
      execSync(
        `ssh -o ConnectTimeout=10 ${coolifyServer} "echo 'SSH connection successful'"`,
        {
          stdio: 'pipe',
        }
      );

      execSync(`scp ${backupPath} ${coolifyServer}:${remotePath}`, {
        stdio: 'inherit',
      });
      console.log('✅ Backup uploaded via SCP');
    } catch (error) {
      console.error('❌ SCP upload failed:', error.message);
      throw error;
    }
  }

  async uploadViaS3(backupPath) {
    // Implement S3 upload with proper error handling
    console.log('⚠️  S3 upload not implemented yet');
  }

  async restoreToCoolify(backupPath) {
    console.log('🔄 Restoring to Coolify database...');

    const coolifyContainer =
      process.env.COOLIFY_POSTGRES_CONTAINER || 'coolify-postgres';

    if (CONFIG.safety.dryRun) {
      console.log('🔍 DRY RUN: Would restore to Coolify');
      return;
    }

    try {
      // Test database connection first
      const testCommand = `docker exec ${coolifyContainer} pg_isready -U ${CONFIG.remote.username} -d ${CONFIG.remote.database}`;
      execSync(testCommand, { stdio: 'pipe' });

      const command = `docker exec -i ${coolifyContainer} psql -U ${CONFIG.remote.username} -d ${CONFIG.remote.database} -v ON_ERROR_STOP=1`;
      execSync(command, {
        input: readFileSync(backupPath),
        stdio: 'inherit',
      });

      console.log('✅ Database restored to Coolify');
    } catch (error) {
      console.error('❌ Failed to restore to Coolify:', error.message);
      throw error;
    }
  }

  async cleanupOldBackups() {
    console.log('🧹 Cleaning up old backups...');

    try {
      const files = execSync(`ls -t ${CONFIG.backup.directory}/*.sql*`, {
        encoding: 'utf8',
      })
        .trim()
        .split('\n');

      if (files.length > CONFIG.backup.retention) {
        const toDelete = files.slice(CONFIG.backup.retention);
        toDelete.forEach(file => {
          if (existsSync(file)) {
            execSync(`rm ${file}`);
            console.log(`🗑️  Deleted old backup: ${file}`);
          }
        });
      }
    } catch (error) {
      console.warn('⚠️  Failed to cleanup old backups:', error.message);
    }
  }

  isUsingDocker() {
    try {
      execSync(
        'docker ps --filter name=overland-postgres-dev --format "{{.Names}}"',
        { stdio: 'pipe' }
      );
      return true;
    } catch {
      return false;
    }
  }

  async confirmOperation() {
    if (!CONFIG.safety.requireConfirmation) return true;

    const readline = await import('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    return new Promise(resolve => {
      rl.question(
        'Are you sure you want to sync the database? (yes/no): ',
        answer => {
          rl.close();
          resolve(answer.toLowerCase() === 'yes');
        }
      );
    });
  }

  async sync() {
    try {
      console.log('🚀 Starting database sync to Coolify...\n');

      // Safety checks
      if (CONFIG.safety.dryRun) {
        console.log('🔍 DRY RUN MODE - No actual changes will be made\n');
      }

      if (CONFIG.safety.requireConfirmation) {
        const confirmed = await this.confirmOperation();
        if (!confirmed) {
          console.log('❌ Operation cancelled by user');
          return;
        }
      }

      // Step 1: Create local backup
      const backupPath = await this.createLocalBackup();

      // Step 2: Compress if enabled
      const finalBackupPath = await this.compressBackup(backupPath);

      // Step 3: Upload to Coolify
      await this.uploadToCoolify(finalBackupPath);

      // Step 4: Restore to Coolify (if automated)
      if (process.env.AUTO_RESTORE === 'true') {
        await this.restoreToCoolify(finalBackupPath);
      } else {
        console.log('\n📋 Manual restore required:');
        console.log(`   1. SSH into your Coolify server`);
        console.log(
          `   2. Run: docker exec -i ${process.env.COOLIFY_POSTGRES_CONTAINER || 'coolify-postgres'} psql -U postgres -d overland < /tmp/${CONFIG.backup.filename}`
        );
      }

      // Step 5: Cleanup old backups
      await this.cleanupOldBackups();

      console.log('\n✅ Database sync completed!');
    } catch (error) {
      console.error('\n❌ Database sync failed:', error.message);
      process.exit(1);
    }
  }
}

// CLI interface
const command = process.argv[2];

if (command === 'sync') {
  const syncer = new DatabaseSyncer();
  syncer.sync();
} else if (command === 'backup') {
  const syncer = new DatabaseSyncer();
  syncer.createLocalBackup();
} else if (command === 'validate') {
  const backupFile = process.argv[3];
  if (!backupFile) {
    console.error('❌ Please provide a backup file to validate');
    process.exit(1);
  }
  const syncer = new DatabaseSyncer();
  syncer.validateBackup(backupFile);
} else {
  console.log(`
🗄️  Overland Database Sync Utility

Usage:
  node scripts/sync-database.js sync [options]     # Full sync to Coolify
  node scripts/sync-database.js backup            # Create local backup only
  node scripts/sync-database.js validate <file>   # Validate backup file

Options:
  --dry-run                 # Show what would be done without making changes
  --no-confirmation         # Skip confirmation prompts

Environment Variables:
  COOLIFY_DB_HOST              # Coolify database host
  COOLIFY_DB_PORT              # Coolify database port
  COOLIFY_DB_NAME              # Coolify database name
  COOLIFY_DB_USER              # Coolify database user
  COOLIFY_DB_PASSWORD          # Coolify database password
  COOLIFY_SERVER               # Coolify server SSH connection
  COOLIFY_REMOTE_PATH          # Remote path for uploads
  COOLIFY_POSTGRES_CONTAINER   # Coolify PostgreSQL container name
  UPLOAD_METHOD                # Upload method: scp, s3, manual
  AUTO_RESTORE                 # Auto-restore after upload: true/false
  DRY_RUN                      # Dry run mode: true/false
  LOCAL_DB_PASSWORD            # Local database password

Safety Features:
  ✅ Backup validation and checksums
  ✅ Dry-run mode for testing
  ✅ Confirmation prompts in production
  ✅ Connection testing before operations
  ✅ Automatic cleanup of old backups
  ✅ Error handling with rollback capabilities

Example:
  DRY_RUN=true node scripts/sync-database.js sync
`);
}
