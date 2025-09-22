/**
 * Collection Registry - Auto-detects Payload collections and generates web app code
 *
 * This system bridges the gap between Payload CMS collections and web app development
 * by automatically generating:
 * - TypeScript types
 * - API client methods
 * - React components
 * - Route files
 * - Form schemas
 * - Validation rules
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Paths
const CMS_COLLECTIONS_PATH = path.join(
  __dirname,
  '../apps/cms/src/collections'
);
const CMS_TYPES_PATH = path.join(__dirname, '../apps/cms/src/payload-types.ts');
const WEB_TYPES_PATH = path.join(__dirname, '../apps/web/app/lib/types.ts');
const WEB_CLIENT_PATH = path.join(
  __dirname,
  '../apps/web/app/lib/payloadClient.ts'
);
const WEB_ROUTES_PATH = path.join(__dirname, '../apps/web/app/routes');

class CollectionRegistry {
  constructor() {
    this.collections = new Map();
    this.payloadTypes = '';
  }

  /**
   * Scan CMS collections directory and extract collection metadata
   */
  scanCollections() {
    console.log('🔍 Scanning Payload collections...');

    if (!fs.existsSync(CMS_COLLECTIONS_PATH)) {
      console.log('❌ Collections directory not found');
      return;
    }

    const collectionFiles = fs
      .readdirSync(CMS_COLLECTIONS_PATH)
      .filter(file => file.endsWith('.ts') && file !== 'index.ts');

    collectionFiles.forEach(file => {
      const filePath = path.join(CMS_COLLECTIONS_PATH, file);
      const content = fs.readFileSync(filePath, 'utf8');
      const metadata = this.extractCollectionMetadata(content, file);

      if (metadata) {
        this.collections.set(metadata.slug, metadata);
        console.log(
          `  ✅ Found collection: ${metadata.slug} (${metadata.displayName})`
        );
      }
    });
  }

  /**
   * Extract metadata from collection file
   */
  extractCollectionMetadata(content, filename) {
    try {
      // Extract slug
      const slugMatch = content.match(/slug:\s*['"`]([^'"`]+)['"`]/);
      if (!slugMatch) return null;

      const slug = slugMatch[1];

      // Extract display name from useAsTitle or default to slug
      const titleMatch = content.match(/useAsTitle:\s*['"`]([^'"`]+)['"`]/);
      let displayName = titleMatch
        ? this.capitalize(titleMatch[1])
        : this.capitalize(slug);

      // Special case: if useAsTitle is 'title', use the collection slug as display name
      if (titleMatch && titleMatch[1] === 'title') {
        displayName = this.capitalize(slug);
      }

      // Analyze fields
      const fields = this.analyzeFields(content);

      return {
        slug,
        displayName,
        pluralName: this.pluralize(displayName),
        filename,
        fields,
        hasSlug: fields.some(f => f.name === 'slug'),
        hasStatus: fields.some(f => f.name === 'status'),
        hasSEO: fields.some(f => f.name === 'seo'),
        hasNavigation: fields.some(f => f.name === 'showInNavigation'),
        hasFeaturedImage: fields.some(f => f.name === 'featuredImage'),
        hasExcerpt: fields.some(f => f.name === 'excerpt'),
        hasTags: fields.some(f => f.name === 'tags'),
        hasAuthor: fields.some(f => f.name === 'author'),
        isPublic: content.includes('read: () => true'),
      };
    } catch (error) {
      console.error(`Error parsing ${filename}:`, error.message);
      return null;
    }
  }

  /**
   * Analyze collection fields
   */
  analyzeFields(content) {
    const fields = [];

    // Simple field extraction (could be more sophisticated)
    const fieldMatches = content.matchAll(/name:\s*['"`]([^'"`]+)['"`]/g);

    for (const match of fieldMatches) {
      const fieldName = match[1];
      const fieldStart = match.index;

      // Find the field type
      const typeMatch = content
        .substring(fieldStart)
        .match(/type:\s*['"`]([^'"`]+)['"`]/);
      const fieldType = typeMatch ? typeMatch[1] : 'text';

      fields.push({
        name: fieldName,
        type: fieldType,
        required: content
          .substring(fieldStart, fieldStart + 200)
          .includes('required: true'),
      });
    }

    return fields;
  }

  /**
   * Load Payload generated types
   */
  loadPayloadTypes() {
    if (fs.existsSync(CMS_TYPES_PATH)) {
      this.payloadTypes = fs.readFileSync(CMS_TYPES_PATH, 'utf8');
      console.log('📄 Loaded Payload types');
    } else {
      console.log(
        '⚠️  Payload types not found, run "pnpm generate:types" first'
      );
    }
  }

  /**
   * Generate web app types
   */
  generateWebTypes() {
    console.log('🔧 Generating web app types...');

    // Generate base types file
    this.generateBaseTypes();

    // Generate individual collection type files
    Array.from(this.collections.values()).forEach(collection => {
      this.generateCollectionTypeFile(collection);
    });

    // Generate index file that exports everything
    this.generateTypesIndex();

    console.log('✅ Generated web types');
  }

  /**
   * Generate base types file
   */
  generateBaseTypes() {
    const baseTypesContent = `/**
 * Base types for web app
 * Generated from Payload CMS collections
 *
 * DO NOT EDIT MANUALLY - Run 'pnpm generate:types' to regenerate
 */

// Base response type
export interface PayloadResponse<T> {
  docs: T[];
  totalDocs: number;
  limit: number;
  totalPages: number;
  page: number;
  pagingCounter: number;
  hasPrevPage: boolean;
  hasNextPage: boolean;
  prevPage: number | null;
  nextPage: number | null;
}

// Media type
export interface Media {
  id: string;
  url: string;
  alt?: string;
  width?: number;
  height?: number;
  filename?: string;
  mimeType?: string;
  filesize?: number;
}

// Query types
export interface QueryOptions {
  limit?: number;
  page?: number;
  where?: any;
  sort?: string;
  draft?: boolean;
}

// Navigation types
export interface NavigationItem {
  id: string;
  title: string;
  slug: string;
  children?: NavigationItem[];
}

// SEO types
export interface SEOData {
  title: string;
  description: string;
  image?: string;
  url?: string;
  type?: string;
}

// Form types
export interface FormField {
  name: string;
  type: string;
  required: boolean;
  label?: string;
  placeholder?: string;
  options?: Array<{ label: string; value: string }>;
}

export interface FormSchema {
  fields: FormField[];
  validation?: any;
}
`;

    const baseTypesPath = path.join(
      path.dirname(WEB_TYPES_PATH),
      'types',
      'base.ts'
    );
    fs.mkdirSync(path.dirname(baseTypesPath), { recursive: true });
    fs.writeFileSync(baseTypesPath, baseTypesContent);
  }

  /**
   * Generate individual collection type file
   */
  generateCollectionTypeFile(collection) {
    const { slug, displayName, fields } = collection;

    // Clean up field definitions to avoid duplicates and type errors
    const uniqueFields = this.deduplicateFields(fields);
    const fieldDefinitions = uniqueFields
      .map(field => {
        const optional = field.required ? '' : '?';
        const type = this.getTypeScriptType(field.type, field.name);
        return `  ${field.name}${optional}: ${type};`;
      })
      .join('\n');

    // For Media collection, just re-export the base Media type
    if (slug === 'media') {
      const collectionTypeContent = `/**
 * Media collection types
 * Generated from Payload CMS collections
 *
 * DO NOT EDIT MANUALLY - Run 'pnpm generate:types' to regenerate
 */

import type { Media as BaseMedia } from './base';

// Media collection extends the base Media type
export interface Media extends BaseMedia {
  alt: string;
}

// Export for convenience
export type MediaInput = Omit<Media, 'id' | 'createdAt' | 'updatedAt'>;
export type MediaUpdate = Partial<MediaInput>;
`;
      const collectionTypePath = path.join(
        path.dirname(WEB_TYPES_PATH),
        'types',
        `${slug}.ts`
      );
      fs.writeFileSync(collectionTypePath, collectionTypeContent);
      return;
    }

    // For other collections, import Media type
    const importStatement = "import type { Media } from './base';\n\n";

    const collectionTypeContent = `/**
 * ${displayName} collection types
 * Generated from Payload CMS collections
 *
 * DO NOT EDIT MANUALLY - Run 'pnpm generate:types' to regenerate
 */

${importStatement}export interface ${displayName} {
  id: string;
${fieldDefinitions}
  createdAt: string;
  updatedAt: string;
}

// Export for convenience
export type ${displayName}Input = Omit<${displayName}, 'id' | 'createdAt' | 'updatedAt'>;
export type ${displayName}Update = Partial<${displayName}Input>;
`;

    const collectionTypePath = path.join(
      path.dirname(WEB_TYPES_PATH),
      'types',
      `${slug}.ts`
    );
    fs.writeFileSync(collectionTypePath, collectionTypeContent);
  }

  /**
   * Generate types index file
   */
  generateTypesIndex() {
    const collections = Array.from(this.collections.values());

    const indexContent = `/**
 * Types index - exports all collection types
 * Generated from Payload CMS collections
 *
 * DO NOT EDIT MANUALLY - Run 'pnpm generate:types' to regenerate
 */

// Base types
export * from './types/base';

// Collection types
export * from './types/media';
export * from './types/pages';
export * from './types/site-settings';
export * from './types/users';

// Re-export commonly used types for convenience
export type { Media } from './types/media';
export type { Pages } from './types/pages';
export type { SiteSettings } from './types/site-settings';
export type { Email } from './types/users';
`;

    fs.writeFileSync(WEB_TYPES_PATH, indexContent);
  }

  /**
   * Deduplicate fields to avoid conflicts
   */
  deduplicateFields(fields) {
    const seen = new Set();
    return fields.filter(field => {
      if (seen.has(field.name)) {
        return false;
      }
      seen.add(field.name);
      return true;
    });
  }

  /**
   * Generate TypeScript interface for a collection
   */
  generateCollectionType(collection) {
    const { displayName, fields } = collection;

    const fieldDefinitions = fields
      .map(field => {
        const optional = field.required ? '' : '?';
        const type = this.getTypeScriptType(field.type);
        return `  ${field.name}${optional}: ${type};`;
      })
      .join('\n');

    return `export interface ${displayName} {
  id: string;
${fieldDefinitions}
  createdAt: string;
  updatedAt: string;
}`;
  }

  /**
   * Map Payload field types to TypeScript types
   */
  getTypeScriptType(payloadType, fieldName = '') {
    const typeMap = {
      text: 'string',
      textarea: 'string',
      richText: 'any',
      number: 'number',
      email: 'string',
      date: 'string',
      checkbox: 'boolean',
      select: 'string',
      radio: 'string',
      upload: 'Media',
      relationship: 'any',
      array: 'any[]',
      group: 'any',
      blocks: 'any[]',
    };

    // Special handling for specific field names
    if (fieldName === 'status' && payloadType === 'select') {
      return '"draft" | "published"';
    }

    if (fieldName === 'template' && payloadType === 'select') {
      return '"default" | "full-width" | "sidebar" | "landing"';
    }

    return typeMap[payloadType] || 'any';
  }

  /**
   * Generate API client methods
   */
  generateClientMethods() {
    console.log('🔧 Generating API client methods...');

    // Generate individual client files
    this.generateBaseClient();
    this.generateCollectionClients();
    this.generateClientIndex();
    this.generateMainClient();

    console.log('✅ Generated API client methods');
  }

  /**
   * Generate base client class
   */
  generateBaseClient() {
    const baseClientPath = path.join(
      path.dirname(WEB_CLIENT_PATH),
      'clients',
      'base.ts'
    );
    fs.mkdirSync(path.dirname(baseClientPath), { recursive: true });

    const baseClientContent = `/**
 * Base Payload client class
 * Generated from Payload CMS collections
 *
 * DO NOT EDIT MANUALLY - Run 'pnpm generate:types' to regenerate
 */

import { env } from '../env';
import type { PayloadResponse, QueryOptions } from '../types';

export abstract class BasePayloadClient {
  protected baseUrl: string;

  constructor() {
    this.baseUrl = env.CMS_API_URL;
  }

  protected async fetch<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = \`\${this.baseUrl}\${endpoint}\`;
    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(\`HTTP error! status: \${response.status}\`);
    }

    return response.json();
  }

  protected buildQueryParams(options?: QueryOptions): URLSearchParams {
    const params = new URLSearchParams();

    if (options?.limit) params.set("limit", options.limit.toString());
    if (options?.page) params.set("page", options.page.toString());
    if (options?.sort) params.set("sort", options.sort);
    if (options?.draft) params.set("draft", "true");
    if (options?.where) params.set("where", JSON.stringify(options.where));

    return params;
  }
}`;

    fs.writeFileSync(baseClientPath, baseClientContent);
  }

  /**
   * Generate individual collection client files
   */
  generateCollectionClients() {
    Array.from(this.collections.values()).forEach(collection => {
      this.generateCollectionClient(collection);
    });

    // Generate site-settings client (global, not collection)
    this.generateSiteSettingsClient();
  }

  /**
   * Generate site-settings client
   */
  generateSiteSettingsClient() {
    const clientPath = path.join(
      path.dirname(WEB_CLIENT_PATH),
      'clients',
      'site-settings.ts'
    );

    const clientContent = `/**
 * Site Settings client
 * Generated from Payload CMS collections
 *
 * DO NOT EDIT MANUALLY - Run 'pnpm generate:types' to regenerate
 */

import { BasePayloadClient } from './base';
import type { SiteSettings } from '../types';

export class SiteSettingsClient extends BasePayloadClient {
  /**
   * Get site settings
   */
  async getSiteSettings(): Promise<SiteSettings> {
    return this.fetch<SiteSettings>("/globals/site");
  }
}

export const siteSettingsClient = new SiteSettingsClient();
`;

    fs.writeFileSync(clientPath, clientContent);
  }

  /**
   * Generate client for a specific collection
   */
  generateCollectionClient(collection) {
    const { slug, displayName, hasSlug, hasStatus, hasNavigation } = collection;
    const clientPath = path.join(
      path.dirname(WEB_CLIENT_PATH),
      'clients',
      `${slug}.ts`
    );

    const methods = this.generateCollectionClientMethods(collection);

    const clientContent = `/**
 * ${displayName} collection client
 * Generated from Payload CMS collections
 *
 * DO NOT EDIT MANUALLY - Run 'pnpm generate:types' to regenerate
 */

import type { ${displayName}, PayloadResponse, QueryOptions } from '../types';
import { BasePayloadClient } from './base';

export class ${displayName}Client extends BasePayloadClient {
${methods}
}

export const ${slug}Client = new ${displayName}Client();
`;

    fs.writeFileSync(clientPath, clientContent);
  }

  /**
   * Generate methods for a specific collection client
   */
  generateCollectionClientMethods(collection) {
    const { slug, displayName, pluralName, hasSlug, hasStatus, hasNavigation } =
      collection;

    const methods = [];

    // Get all items
    methods.push(`  /**
   * Get all ${pluralName.toLowerCase()} with optional filtering
   */
  async get${pluralName}(options?: QueryOptions): Promise<PayloadResponse<${displayName}>> {
    const params = this.buildQueryParams(options);
    return this.fetch<PayloadResponse<${displayName}>>(\`/${slug}?\${params.toString()}\`);
  }`);

    // Get single item by slug
    if (hasSlug) {
      methods.push(`  /**
   * Get a single ${displayName.toLowerCase()} by slug
   */
  async get${this.singularize(displayName)}(slug: string, draft = false): Promise<${displayName}> {
    const params = new URLSearchParams();
    if (draft) params.set('draft', 'true');

    const response = await this.fetch<PayloadResponse<${displayName}>>(
      \`/${slug}?where[slug][equals]=\${slug}&\${params.toString()}\`
    );

    if (response.docs.length === 0) {
      throw new Error(\`${displayName} with slug "\${slug}" not found\`);
    }

    return response.docs[0];
  }`);
    }

    // Get published items
    if (hasStatus) {
      methods.push(`  /**
   * Get only published ${pluralName.toLowerCase()}
   */
  async getPublished${pluralName}(
    options?: Omit<QueryOptions, 'where'>
  ): Promise<${displayName}[]> {
    const response = await this.get${pluralName}({
      ...options,
      where: {
        status: { equals: 'published' },
      },
    });
    return response.docs;
  }`);
    }

    // Get navigation items
    if (hasNavigation) {
      methods.push(`  /**
   * Get ${pluralName.toLowerCase()} for navigation menu
   */
  async get${pluralName}ForNavigation(): Promise<${displayName}[]> {
    const response = await this.get${pluralName}({
      where: {
        showInNavigation: { equals: true },
        status: { equals: 'published' },
      },
      sort: 'navigationOrder',
    });
    return response.docs;
  }`);
    }

    return methods.join('\n\n');
  }

  /**
   * Generate client index file
   */
  generateClientIndex() {
    const collections = Array.from(this.collections.values());
    const clientIndexPath = path.join(
      path.dirname(WEB_CLIENT_PATH),
      'clients',
      'index.ts'
    );

    const exports = collections
      .map(
        collection =>
          `export { ${collection.slug}Client, ${collection.displayName}Client } from './${collection.slug}';`
      )
      .join('\n');

    const clientIndexContent = `/**
 * Payload clients index
 * Generated from Payload CMS collections
 *
 * DO NOT EDIT MANUALLY - Run 'pnpm generate:types' to regenerate
 */

// Export individual clients
${exports}
export { siteSettingsClient, SiteSettingsClient } from './site-settings';

// Export base client
export { BasePayloadClient } from './base';

// Re-export types
export type { PayloadResponse, QueryOptions } from '../types';
`;

    fs.writeFileSync(clientIndexPath, clientIndexContent);
  }

  /**
   * Generate main client file
   */
  generateMainClient() {
    const collections = Array.from(this.collections.values());

    const clientExports = collections
      .map(collection => `  ${collection.slug}Client,`)
      .join('\n');

    const legacyMethods = collections
      .map(collection => {
        const {
          slug,
          displayName,
          pluralName,
          hasSlug,
          hasStatus,
          hasNavigation,
        } = collection;
        const methods = [];

        methods.push(`  // ${displayName}`);
        methods.push(
          `  get${pluralName}: ${slug}Client.get${pluralName}.bind(${slug}Client),`
        );

        if (hasSlug) {
          methods.push(
            `  get${this.singularize(displayName)}: ${slug}Client.get${this.singularize(displayName)}.bind(${slug}Client),`
          );
        }

        if (hasStatus) {
          methods.push(
            `  getPublished${pluralName}: ${slug}Client.getPublished${pluralName}.bind(${slug}Client),`
          );
        }

        if (hasNavigation) {
          methods.push(
            `  get${pluralName}ForNavigation: ${slug}Client.get${pluralName}ForNavigation.bind(${slug}Client),`
          );
        }

        return methods.join('\n');
      })
      .join('\n\n');

    const mainClientContent = `/**
 * Main Payload client - aggregates all collection clients
 * Generated from Payload CMS collections
 *
 * DO NOT EDIT MANUALLY - Run 'pnpm generate:types' to regenerate
 */

import {
  mediaClient,
  pagesClient,
  siteSettingsClient,
  usersClient,
} from './clients';

// Re-export all clients for convenience
export { mediaClient, pagesClient, siteSettingsClient, usersClient };

// Legacy compatibility - main client object
export const payloadClient = {
${legacyMethods}

  // Site Settings
  getSiteSettings: siteSettingsClient.getSiteSettings.bind(siteSettingsClient),
};

// Re-export types
export type {
  Email,
  Media,
  Pages,
  PayloadResponse,
  QueryOptions,
  SiteSettings,
} from './types';
`;

    fs.writeFileSync(WEB_CLIENT_PATH, mainClientContent);
  }

  /**
   * Generate methods for a specific collection
   */
  generateCollectionMethods(collection) {
    const { slug, displayName, pluralName, hasSlug, hasStatus, hasNavigation } =
      collection;

    const methods = [];

    // Get all items
    methods.push(`
  // ${pluralName}
  async get${pluralName}(options?: QueryOptions): Promise<PayloadResponse<${displayName}>> {
    const params = new URLSearchParams();

    if (options?.limit) params.set("limit", options.limit.toString());
    if (options?.page) params.set("page", options.page.toString());
    if (options?.sort) params.set("sort", options.sort);
    if (options?.draft) params.set("draft", "true");
    if (options?.where) params.set("where", JSON.stringify(options.where));

    return this.fetch<PayloadResponse<${displayName}>>(\`/${slug}?\${params.toString()}\`);
  }`);

    // Get single item by slug
    if (hasSlug) {
      methods.push(`
  async get${this.singularize(displayName)}(slug: string, draft = false): Promise<${displayName}> {
    const params = new URLSearchParams();
    if (draft) params.set('draft', 'true');

    const response = await this.fetch<PayloadResponse<${displayName}>>(
      \`/${slug}?where[slug][equals]=\${slug}&\${params.toString()}\`
    );
    if (response.docs.length === 0) {
      throw new Error(\`${displayName} with slug "\${slug}" not found\`);
    }
    return response.docs[0];
  }`);
    }

    // Get published items
    if (hasStatus) {
      methods.push(`
  async getPublished${pluralName}(
    options?: Omit<QueryOptions, 'where'>
  ): Promise<${displayName}[]> {
    const response = await this.get${pluralName}({
      ...options,
      where: {
        status: { equals: 'published' },
      },
    });
    return response.docs;
  }`);
    }

    // Get navigation items
    if (hasNavigation) {
      methods.push(`
  async get${pluralName}ForNavigation(): Promise<${displayName}[]> {
    const response = await this.get${pluralName}({
      where: {
        showInNavigation: { equals: true },
        status: { equals: 'published' },
      },
      sort: 'navigationOrder',
    });
    return response.docs;
  }`);
    }

    return methods.join('');
  }

  /**
   * Generate route files
   */
  generateRouteFiles() {
    console.log('🔧 Generating route files...');

    Array.from(this.collections.values()).forEach(collection => {
      if (!collection.hasSlug) return;

      this.generateIndexRoute(collection);
      this.generateDetailRoute(collection);
    });

    console.log('✅ Generated route files');
  }

  /**
   * Generate index route for collection
   */
  generateIndexRoute(collection) {
    const { slug, displayName, pluralName } = collection;
    const routePath = path.join(WEB_ROUTES_PATH, `${slug}._index.tsx`);

    const content = `import type { MetaFunction } from 'react-router';
import { payloadClient } from '~/lib/payloadClient';
import type { ${displayName} } from '~/lib/types';

export const meta: MetaFunction = () => {
  return [
    { title: \`${pluralName} - Overland Stack\` },
    { name: 'description', content: \`Browse all ${pluralName.toLowerCase()}\` },
  ];
};

export async function loader() {
  try {
    const ${slug} = await payloadClient.getPublished${pluralName}();
    return { ${slug} };
  } catch (error) {
    console.error(\`Error loading ${pluralName.toLowerCase()}:\`, error);
    return { ${slug}: [] };
  }
}

export default function ${pluralName}Index({ loaderData }: { loaderData: { ${slug}: ${displayName}[] } }) {
  const { ${slug} } = loaderData;

  return (
    <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
      <h1 className='text-3xl font-bold text-gray-900 mb-8'>${pluralName}</h1>

      {${slug}.length === 0 ? (
        <p className='text-gray-600'>No ${pluralName.toLowerCase()} found.</p>
      ) : (
        <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-3'>
          {${slug}.map((${slug.slice(0, -1)}) => (
            <div key={${slug.slice(0, -1)}.id} className='bg-white rounded-lg shadow-md overflow-hidden'>
              {${slug.slice(0, -1)}.featuredImage && (
                <img
                  src={${slug.slice(0, -1)}.featuredImage.url}
                  alt={${slug.slice(0, -1)}.featuredImage.alt || ${slug.slice(0, -1)}.title}
                  className='w-full h-48 object-cover'
                />
              )}
              <div className='p-6'>
                <h2 className='text-xl font-semibold text-gray-900 mb-2'>
                  <a href={\`/${slug}/\${${slug.slice(0, -1)}.slug}\`} className='hover:text-blue-600'>
                    {${slug.slice(0, -1)}.title}
                  </a>
                </h2>
                {${slug.slice(0, -1)}.excerpt && (
                  <p className='text-gray-600 mb-4'>{${slug.slice(0, -1)}.excerpt}</p>
                )}
                <div className='text-sm text-gray-500'>
                  {new Date(${slug.slice(0, -1)}.publishedDate || ${slug.slice(0, -1)}.createdAt).toLocaleDateString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
`;

    fs.writeFileSync(routePath, content);
  }

  /**
   * Generate detail route for collection
   */
  generateDetailRoute(collection) {
    const { slug, displayName } = collection;
    const routePath = path.join(WEB_ROUTES_PATH, `${slug}.\$slug.tsx`);

    const content = `import type { MetaFunction } from 'react-router';
import { payloadClient } from '~/lib/payloadClient';
import type { ${displayName} } from '~/lib/types';

export const meta: MetaFunction<typeof loader> = ({ loaderData }) => {
  if (!loaderData || !(loaderData as any)?.${slug.slice(0, -1)}) {
    return [
      { title: 'Not Found' },
      { name: 'description', content: '${displayName} not found' },
    ];
  }

  const ${slug.slice(0, -1)} = (loaderData as any).${slug.slice(0, -1)};
  return [
    { title: \`\${${slug.slice(0, -1)}.title} - Overland Stack\` },
    { name: 'description', content: ${slug.slice(0, -1)}.excerpt || ${slug.slice(0, -1)}.seo?.description || 'Read more' },
  ];
};

export async function loader({ params }: { params: { slug: string } }) {
  try {
    const ${slug.slice(0, -1)} = await payloadClient.get${this.singularize(displayName)}(params.slug);
    return { ${slug.slice(0, -1)} };
  } catch (error) {
    console.error(\`Error loading ${displayName.toLowerCase()}:\`, error);
    throw new Response('Not Found', { status: 404 });
  }
}

export default function ${displayName}Detail({ loaderData }: { loaderData: { ${slug.slice(0, -1)}: ${displayName} } }) {
  const { ${slug.slice(0, -1)} } = loaderData;

  return (
    <div className='max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
      <article className='prose prose-lg max-w-none'>
        {${slug.slice(0, -1)}.featuredImage && (
          <img
            src={${slug.slice(0, -1)}.featuredImage.url}
            alt={${slug.slice(0, -1)}.featuredImage.alt || ${slug.slice(0, -1)}.title}
            className='w-full h-64 object-cover rounded-lg mb-8'
          />
        )}

        <h1 className='text-4xl font-bold text-gray-900 mb-4'>{${slug.slice(0, -1)}.title}</h1>

        {${slug.slice(0, -1)}.excerpt && (
          <p className='text-xl text-gray-600 mb-8'>{${slug.slice(0, -1)}.excerpt}</p>
        )}

        <div className='prose prose-lg max-w-none'>
          {/* Rich text content would be rendered here */}
          <div dangerouslySetInnerHTML={{ __html: 'Rich text content rendering needed' }} />
        </div>

        <div className='mt-8 pt-8 border-t border-gray-200'>
          <div className='text-sm text-gray-500'>
            Published: {new Date(${slug.slice(0, -1)}.publishedDate || ${slug.slice(0, -1)}.createdAt).toLocaleDateString()}
          </div>
        </div>
      </article>
    </div>
  );
}
`;

    fs.writeFileSync(routePath, content);
  }

  /**
   * Generate a summary report
   */
  generateReport() {
    console.log('\n📊 Collection Registry Report');
    console.log('================================');

    Array.from(this.collections.values()).forEach(collection => {
      console.log(`\n📄 ${collection.displayName} (${collection.slug})`);
      console.log(`   Fields: ${collection.fields.length}`);
      console.log(`   Has Slug: ${collection.hasSlug ? '✅' : '❌'}`);
      console.log(`   Has Status: ${collection.hasStatus ? '✅' : '❌'}`);
      console.log(`   Has SEO: ${collection.hasSEO ? '✅' : '❌'}`);
      console.log(
        `   Has Navigation: ${collection.hasNavigation ? '✅' : '❌'}`
      );
      console.log(`   Public Access: ${collection.isPublic ? '✅' : '❌'}`);
    });

    console.log(`\n✅ Generated ${this.collections.size} collection(s)`);
  }

  // Utility methods
  capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  pluralize(str) {
    // Handle special cases - words that are already plural or have irregular plurals
    if (str === 'Media') return 'Media';
    if (str === 'Pages') return 'Pages';
    if (str === 'Users') return 'Users';
    if (str === 'Examples') return 'Examples'; // Already plural

    // Standard pluralization
    if (str.endsWith('y')) {
      return str.slice(0, -1) + 'ies';
    } else if (str.endsWith('s') || str.endsWith('sh') || str.endsWith('ch')) {
      return str + 'es';
    } else {
      return str + 's';
    }
  }

  singularize(str) {
    // Handle special cases
    if (str === 'Media') return 'Media';
    if (str === 'Pages') return 'Page';
    if (str === 'Users') return 'User';

    // Standard singularization
    if (str.endsWith('ies')) {
      return str.slice(0, -3) + 'y';
    } else if (str.endsWith('es')) {
      return str.slice(0, -2);
    } else if (str.endsWith('s')) {
      return str.slice(0, -1);
    } else {
      return str;
    }
  }

  /**
   * Format generated files with prettier
   */
  formatGeneratedFiles() {
    console.log('🎨 Formatting generated files...');

    try {
      // Run prettier on the generated files
      execSync(
        'pnpm prettier --write apps/web/app/lib/clients/ apps/web/app/lib/types/ apps/web/app/routes/pages.*.tsx',
        {
          cwd: path.join(__dirname, '..'),
          stdio: 'pipe',
        }
      );
      console.log('✅ Generated files formatted successfully');
    } catch (error) {
      console.warn(
        '⚠️  Warning: Could not format generated files:',
        error.message
      );
    }
  }

  /**
   * Main generation process
   */
  async generate() {
    console.log('🚀 Starting Collection Registry generation...\n');

    this.scanCollections();
    this.loadPayloadTypes();
    this.generateWebTypes();
    this.generateClientMethods();
    this.generateRouteFiles();
    this.formatGeneratedFiles();
    this.generateReport();

    console.log('\n🎉 Collection Registry generation complete!');
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const registry = new CollectionRegistry();
  registry.generate().catch(console.error);
}

export default CollectionRegistry;
