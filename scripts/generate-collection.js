#!/usr/bin/env node

import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const collectionTemplates = {
  blog: {
    name: 'Blog',
    slug: 'blog',
    fields: [
      {
        name: 'title',
        type: 'text',
        required: true,
        admin: { description: 'The title of the blog post' },
      },
      {
        name: 'slug',
        type: 'text',
        required: true,
        unique: true,
        admin: { description: 'URL-friendly version of the title' },
      },
      {
        name: 'excerpt',
        type: 'textarea',
        admin: { description: 'Short description of the blog post' },
      },
      {
        name: 'content',
        type: 'richText',
        required: true,
        admin: { description: 'Main content of the blog post' },
      },
      {
        name: 'featuredImage',
        type: 'upload',
        relationTo: 'media',
        admin: { description: 'Featured image for the blog post' },
      },
      {
        name: 'author',
        type: 'relationship',
        relationTo: 'users',
        required: true,
        admin: { description: 'Author of the blog post' },
      },
      {
        name: 'publishedDate',
        type: 'date',
        admin: { description: 'When the blog post was published' },
      },
      {
        name: 'tags',
        type: 'array',
        fields: [
          {
            name: 'tag',
            type: 'text',
            required: true,
          },
        ],
        admin: { description: 'Tags for categorizing the blog post' },
      },
      {
        name: 'seo',
        type: 'group',
        fields: [
          {
            name: 'title',
            type: 'text',
            admin: { description: 'SEO title (if different from main title)' },
          },
          {
            name: 'description',
            type: 'textarea',
            admin: { description: 'SEO description' },
          },
          {
            name: 'image',
            type: 'upload',
            relationTo: 'media',
            admin: { description: 'SEO image' },
          },
        ],
      },
    ],
    access: {
      read: () => true,
      create: ({ req: { user } }) => !!user,
      update: ({ req: { user } }) => !!user,
      delete: ({ req: { user } }) => !!user,
    },
    admin: {
      useAsTitle: 'title',
      defaultColumns: ['title', 'author', 'publishedDate', 'updatedAt'],
    },
  },

  product: {
    name: 'Product',
    slug: 'products',
    fields: [
      {
        name: 'name',
        type: 'text',
        required: true,
        admin: { description: 'Product name' },
      },
      {
        name: 'slug',
        type: 'text',
        required: true,
        unique: true,
        admin: { description: 'URL-friendly version of the name' },
      },
      {
        name: 'description',
        type: 'richText',
        required: true,
        admin: { description: 'Product description' },
      },
      {
        name: 'price',
        type: 'number',
        required: true,
        admin: { description: 'Product price' },
      },
      {
        name: 'images',
        type: 'array',
        fields: [
          {
            name: 'image',
            type: 'upload',
            relationTo: 'media',
            required: true,
          },
          {
            name: 'alt',
            type: 'text',
            admin: { description: 'Alt text for accessibility' },
          },
        ],
        admin: { description: 'Product images' },
      },
      {
        name: 'category',
        type: 'relationship',
        relationTo: 'categories',
        admin: { description: 'Product category' },
      },
      {
        name: 'inStock',
        type: 'checkbox',
        defaultValue: true,
        admin: { description: 'Is the product in stock?' },
      },
      {
        name: 'featured',
        type: 'checkbox',
        defaultValue: false,
        admin: { description: 'Is this a featured product?' },
      },
    ],
    access: {
      read: () => true,
      create: ({ req: { user } }) => !!user,
      update: ({ req: { user } }) => !!user,
      delete: ({ req: { user } }) => !!user,
    },
    admin: {
      useAsTitle: 'name',
      defaultColumns: ['name', 'price', 'inStock', 'featured', 'updatedAt'],
    },
  },

  event: {
    name: 'Event',
    slug: 'events',
    fields: [
      {
        name: 'title',
        type: 'text',
        required: true,
        admin: { description: 'Event title' },
      },
      {
        name: 'slug',
        type: 'text',
        required: true,
        unique: true,
        admin: { description: 'URL-friendly version of the title' },
      },
      {
        name: 'description',
        type: 'richText',
        required: true,
        admin: { description: 'Event description' },
      },
      {
        name: 'startDate',
        type: 'date',
        required: true,
        admin: { description: 'Event start date and time' },
      },
      {
        name: 'endDate',
        type: 'date',
        admin: { description: 'Event end date and time' },
      },
      {
        name: 'location',
        type: 'group',
        fields: [
          {
            name: 'name',
            type: 'text',
            admin: { description: 'Venue name' },
          },
          {
            name: 'address',
            type: 'textarea',
            admin: { description: 'Full address' },
          },
          {
            name: 'city',
            type: 'text',
            admin: { description: 'City' },
          },
          {
            name: 'country',
            type: 'text',
            admin: { description: 'Country' },
          },
        ],
      },
      {
        name: 'featuredImage',
        type: 'upload',
        relationTo: 'media',
        admin: { description: 'Event featured image' },
      },
      {
        name: 'ticketPrice',
        type: 'number',
        admin: { description: 'Ticket price (0 for free events)' },
      },
      {
        name: 'maxAttendees',
        type: 'number',
        admin: { description: 'Maximum number of attendees' },
      },
    ],
    access: {
      read: () => true,
      create: ({ req: { user } }) => !!user,
      update: ({ req: { user } }) => !!user,
      delete: ({ req: { user } }) => !!user,
    },
    admin: {
      useAsTitle: 'title',
      defaultColumns: [
        'title',
        'startDate',
        'location.name',
        'ticketPrice',
        'updatedAt',
      ],
    },
  },
};

const generateCollectionFile = (template, customName = null) => {
  const collectionName = customName || template.name;
  const slug = template.slug;

  const fileContent = `import type { CollectionConfig } from 'payload';

export const ${collectionName}: CollectionConfig = {
  slug: '${slug}',
  admin: ${JSON.stringify(template.admin, null, 4)},
  access: ${JSON.stringify(template.access, null, 4)},
  fields: ${JSON.stringify(template.fields, null, 4)},
};
`;

  return fileContent;
};

const updatePayloadConfig = collectionName => {
  const configPath = join(
    __dirname,
    '..',
    'apps',
    'cms',
    'src',
    'payload.config.ts'
  );

  if (!existsSync(configPath)) {
    console.log(
      '⚠️  payload.config.ts not found. Please add the collection manually.'
    );
    return;
  }

  // This would require parsing and modifying the TypeScript file
  // For now, we'll just provide instructions
  console.log(`\n📝 Next steps:`);
  console.log(`1. Add this import to apps/cms/src/payload.config.ts:`);
  console.log(
    `   import { ${collectionName} } from './collections/${collectionName}';`
  );
  console.log(`2. Add ${collectionName} to the collections array`);
  console.log(`3. Run: pnpm generate:types`);
};

// CLI interface
const args = process.argv.slice(2);

if (args.includes('--help') || args.includes('-h') || args.length === 0) {
  console.log(`
Collection Generator for Overland Stack

Usage: node scripts/generate-collection.js <template> [options]

Available Templates:
${Object.keys(collectionTemplates)
  .map(
    key => `  ${key.padEnd(12)} - ${collectionTemplates[key].name} collection`
  )
  .join('\n')}

Options:
  --name <name>         Custom collection name (default: template name)
  --slug <slug>         Custom slug (default: template slug)
  --help, -h            Show this help

Examples:
  node scripts/generate-collection.js blog
  node scripts/generate-collection.js product --name "Product"
  node scripts/generate-collection.js event --slug "events"
`);
  process.exit(0);
}

const templateName = args[0];
const customName = args.includes('--name')
  ? args[args.indexOf('--name') + 1]
  : null;
const customSlug = args.includes('--slug')
  ? args[args.indexOf('--slug') + 1]
  : null;

if (!collectionTemplates[templateName]) {
  console.error(`❌ Unknown template: ${templateName}`);
  console.log(
    `Available templates: ${Object.keys(collectionTemplates).join(', ')}`
  );
  process.exit(1);
}

const template = collectionTemplates[templateName];
if (customSlug) template.slug = customSlug;

try {
  const collectionName = customName || template.name;
  const fileName = `${collectionName}.ts`;
  const filePath = join(
    __dirname,
    '..',
    'apps',
    'cms',
    'src',
    'collections',
    fileName
  );

  // Ensure collections directory exists
  const collectionsDir = dirname(filePath);
  if (!existsSync(collectionsDir)) {
    mkdirSync(collectionsDir, { recursive: true });
  }

  // Check if file already exists
  if (existsSync(filePath)) {
    console.log(`❌ Collection file already exists: ${fileName}`);
    console.log('Use a different name or delete the existing file.');
    process.exit(1);
  }

  // Generate and write the collection file
  const fileContent = generateCollectionFile(template, collectionName);
  writeFileSync(filePath, fileContent);

  console.log(`✅ Generated collection: ${collectionName}`);
  console.log(`📁 Created: apps/cms/src/collections/${fileName}`);

  updatePayloadConfig(collectionName);
} catch (error) {
  console.error('❌ Failed to generate collection:', error.message);
  process.exit(1);
}
