#!/usr/bin/env node

/**
 * Collection Registry Runner - Uses the TypeScript collection-registry package
 *
 * This script uses the linked @alloylab/collection-registry package to generate
 * web app types and utilities from Payload CMS collections.
 */

import { fileURLToPath } from 'url';
import path from 'path';
import { CollectionRegistry } from '@alloylab/collection-registry';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration for the template project
const config = {
  collectionsPath: path.join(__dirname, '../apps/cms/src/collections'),
  outputPath: path.join(__dirname, '../apps/web/app/lib'),
  typesPath: path.join(__dirname, '../apps/cms/src/payload-types.ts'),
  format: true,
  baseUrl: 'env.CMS_API_URL',
  skipExamples: true,
};

// Run the collection registry
async function run() {
  try {
    const registry = new CollectionRegistry(config);
    await registry.generate();
    console.log('\n🎉 Collection Registry generation complete!');
  } catch (error) {
    console.error('❌ Error running collection registry:', error.message);
    process.exit(1);
  }
}

run();
