#!/usr/bin/env node

/**
 * Auto-generate web app types and utilities from Payload CMS collections
 *
 * This script:
 * 1. Reads Payload generated types
 * 2. Generates web app specific types
 * 3. Creates API client methods
 * 4. Generates React components
 * 5. Creates route files
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CMS_TYPES_PATH = path.join(__dirname, '../apps/cms/src/payload-types.ts');
const WEB_TYPES_PATH = path.join(__dirname, '../apps/web/app/lib/types.ts');
const WEB_CLIENT_PATH = path.join(
  __dirname,
  '../apps/web/app/lib/payloadClient.ts'
);

// Collection configurations
const COLLECTIONS = {
  pages: {
    slug: 'pages',
    displayName: 'Page',
    pluralName: 'Pages',
    route: '/pages',
    hasSlug: true,
    hasStatus: true,
    hasSEO: true,
    hasNavigation: true,
  },
  // Add more collections as they're created
  // posts: {
  //   slug: 'posts',
  //   displayName: 'Post',
  //   pluralName: 'Posts',
  //   route: '/posts',
  //   hasSlug: true,
  //   hasStatus: true,
  //   hasSEO: true,
  //   hasTags: true,
  // },
};

function generateWebTypes() {
  console.log('🔄 Generating web app types from Payload collections...');

  // Read Payload types
  const payloadTypes = fs.readFileSync(CMS_TYPES_PATH, 'utf8');

  // Extract collection interfaces
  const collectionTypes = {};
  Object.keys(COLLECTIONS).forEach(collectionName => {
    const config = COLLECTIONS[collectionName];
    const interfaceName = config.displayName;

    // Find the interface in Payload types
    const interfaceRegex = new RegExp(
      `export interface ${interfaceName}\\s*{([^}]+)}`,
      's'
    );
    const match = payloadTypes.match(interfaceRegex);

    if (match) {
      collectionTypes[collectionName] = {
        config,
        interfaceContent: match[1],
        fullInterface: match[0],
      };
    }
  });

  // Generate web types
  const webTypesContent = generateWebTypesContent(collectionTypes);
  fs.writeFileSync(WEB_TYPES_PATH, webTypesContent);

  // Generate API client methods
  const clientMethods = generateClientMethods(collectionTypes);
  updatePayloadClient(clientMethods);

  // Generate route files
  generateRouteFiles(collectionTypes);

  console.log('✅ Web app types and utilities generated successfully!');
}

function generateWebTypesContent(collectionTypes) {
  return `/**
 * Auto-generated types for web app
 * Generated from Payload CMS collections
 *
 * DO NOT EDIT MANUALLY - Run 'pnpm generate:web-types' to regenerate
 */

// Base types
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

// Collection types
${Object.entries(collectionTypes)
  .map(([name, { config, interfaceContent }]) => {
    return `export interface ${config.displayName} {
  id: string;
  ${interfaceContent
    .split('\n')
    .map(line => {
      const trimmed = line.trim();
      if (trimmed.includes('id: number')) return '  id: string;';
      if (trimmed.includes('createdAt:') || trimmed.includes('updatedAt:')) {
        return `  ${trimmed.replace('number', 'string')}`;
      }
      return trimmed;
    })
    .join('\n')}
}`;
  })
  .join('\n\n')}

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
`;
}

function generateClientMethods(collectionTypes) {
  return Object.entries(collectionTypes)
    .map(([name, { config }]) => {
      const methods = [];

      // Get all items
      methods.push(`
  // ${config.pluralName}
  async get${config.pluralName}(options?: QueryOptions): Promise<PayloadResponse<${config.displayName}>> {
    const params = new URLSearchParams();

    if (options?.limit) params.set("limit", options.limit.toString());
    if (options?.page) params.set("page", options.page.toString());
    if (options?.sort) params.set("sort", options.sort);
    if (options?.draft) params.set("draft", "true");
    if (options?.where) params.set("where", JSON.stringify(options.where));

    return this.fetch<PayloadResponse<${config.displayName}>>(\`/${config.slug}?\${params.toString()}\`);
  }`);

      // Get single item by slug (if has slug)
      if (config.hasSlug) {
        methods.push(`
  async get${config.displayName}(slug: string, draft = false): Promise<${config.displayName}> {
    const params = new URLSearchParams();
    if (draft) params.set("draft", "true");

    const response = await this.fetch<PayloadResponse<${config.displayName}>>(
      \`/${config.slug}?where[slug][equals]=\${slug}&\${params.toString()}\`
    );
    if (response.docs.length === 0) {
      throw new Error(\`${config.displayName} with slug "\${slug}" not found\`);
    }
    return response.docs[0];
  }`);
      }

      // Get published items (if has status)
      if (config.hasStatus) {
        methods.push(`
  async getPublished${config.pluralName}(options?: Omit<QueryOptions, 'where'>): Promise<${config.displayName}[]> {
    const response = await this.get${config.pluralName}({
      ...options,
      where: {
        status: { equals: "published" },
        ...options?.where,
      },
    });
    return response.docs;
  }`);
      }

      // Get navigation items (if has navigation)
      if (config.hasNavigation) {
        methods.push(`
  async get${config.pluralName}ForNavigation(): Promise<${config.displayName}[]> {
    const response = await this.get${config.pluralName}({
      where: {
        showInNavigation: { equals: true },
        status: { equals: "published" },
      },
      sort: "navigationOrder",
    });
    return response.docs;
  }`);
      }

      return methods.join('');
    })
    .join('');
}

function updatePayloadClient(clientMethods) {
  // Read current client
  let clientContent = fs.readFileSync(WEB_CLIENT_PATH, 'utf8');

  // Remove old collection methods (keep base methods)
  const baseMethodsEnd = clientContent.indexOf('  // Site Settings');
  const siteSettingsStart = clientContent.indexOf('  // Site Settings');
  const siteSettingsEnd = clientContent.indexOf('}');

  const baseContent = clientContent.substring(0, baseMethodsEnd);
  const siteSettingsContent = clientContent.substring(siteSettingsStart);

  // Insert new methods
  const newContent = baseContent + clientMethods + '\n' + siteSettingsContent;

  fs.writeFileSync(WEB_CLIENT_PATH, newContent);
}

function generateRouteFiles(collectionTypes) {
  Object.entries(collectionTypes).forEach(([name, { config }]) => {
    if (!config.hasSlug) return;

    // Generate index route
    const indexRoutePath = path.join(
      __dirname,
      `../apps/web/app/routes/${config.slug}._index.tsx`
    );
    const indexRouteContent = generateIndexRoute(config);
    fs.writeFileSync(indexRoutePath, indexRouteContent);

    // Generate detail route
    const detailRoutePath = path.join(
      __dirname,
      `../apps/web/app/routes/${config.slug}.\$slug.tsx`
    );
    const detailRouteContent = generateDetailRoute(config);
    fs.writeFileSync(detailRoutePath, detailRouteContent);
  });
}

function generateIndexRoute(config) {
  return `import type { MetaFunction } from "react-router";
import { payloadClient } from "~/lib/payloadClient";
import type { ${config.displayName} } from "~/lib/types";

export const meta: MetaFunction = () => {
  return [
    { title: \`${config.pluralName} - Overland Stack\` },
    { name: "description", content: \`Browse all ${config.pluralName.toLowerCase()}\` },
  ];
};

export async function loader() {
  try {
    const ${config.slug} = await payloadClient.getPublished${config.pluralName}();
    return { ${config.slug} };
  } catch (error) {
    console.error(\`Error loading ${config.pluralName.toLowerCase()}:\`, error);
    return { ${config.slug}: [] };
  }
}

export default function ${config.pluralName}Index({ loaderData }: { loaderData: { ${config.slug}: ${config.displayName}[] } }) {
  const { ${config.slug} } = loaderData;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">${config.pluralName}</h1>

      {${config.slug}.length === 0 ? (
        <p className="text-gray-600">No ${config.pluralName.toLowerCase()} found.</p>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {${config.slug}.map((${config.slug.slice(0, -1)}) => (
            <div key={${config.slug.slice(0, -1)}.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              {${config.slug.slice(0, -1)}.featuredImage && (
                <img
                  src={${config.slug.slice(0, -1)}.featuredImage.url}
                  alt={${config.slug.slice(0, -1)}.featuredImage.alt || ${config.slug.slice(0, -1)}.title}
                  className="w-full h-48 object-cover"
                />
              )}
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  <a href={\`/${config.slug}/\${${config.slug.slice(0, -1)}.slug}\`} className="hover:text-blue-600">
                    {${config.slug.slice(0, -1)}.title}
                  </a>
                </h2>
                {${config.slug.slice(0, -1)}.excerpt && (
                  <p className="text-gray-600 mb-4">{${config.slug.slice(0, -1)}.excerpt}</p>
                )}
                <div className="text-sm text-gray-500">
                  {new Date(${config.slug.slice(0, -1)}.publishedDate || ${config.slug.slice(0, -1)}.createdAt).toLocaleDateString()}
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
}

function generateDetailRoute(config) {
  return `import type { MetaFunction } from "react-router";
import { payloadClient } from "~/lib/payloadClient";
import type { ${config.displayName} } from "~/lib/types";

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  if (!data?.${config.slug.slice(0, -1)}) {
    return [
      { title: "Not Found" },
      { name: "description", content: "${config.displayName} not found" },
    ];
  }

  const ${config.slug.slice(0, -1)} = data.${config.slug.slice(0, -1)};
  return [
    { title: \`\${${config.slug.slice(0, -1)}.title} - Overland Stack\` },
    { name: "description", content: ${config.slug.slice(0, -1)}.excerpt || ${config.slug.slice(0, -1)}.seo?.description || "Read more" },
  ];
};

export async function loader({ params }: { params: { slug: string } }) {
  try {
    const ${config.slug.slice(0, -1)} = await payloadClient.get${config.displayName}(params.slug);
    return { ${config.slug.slice(0, -1)} };
  } catch (error) {
    console.error(\`Error loading ${config.displayName.toLowerCase()}:\`, error);
    throw new Response("Not Found", { status: 404 });
  }
}

export default function ${config.displayName}Detail({ loaderData }: { loaderData: { ${config.slug.slice(0, -1)}: ${config.displayName} } }) {
  const { ${config.slug.slice(0, -1)} } = loaderData;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <article className="prose prose-lg max-w-none">
        {${config.slug.slice(0, -1)}.featuredImage && (
          <img
            src={${config.slug.slice(0, -1)}.featuredImage.url}
            alt={${config.slug.slice(0, -1)}.featuredImage.alt || ${config.slug.slice(0, -1)}.title}
            className="w-full h-64 object-cover rounded-lg mb-8"
          />
        )}

        <h1 className="text-4xl font-bold text-gray-900 mb-4">{${config.slug.slice(0, -1)}.title}</h1>

        {${config.slug.slice(0, -1)}.excerpt && (
          <p className="text-xl text-gray-600 mb-8">{${config.slug.slice(0, -1)}.excerpt}</p>
        )}

        <div className="prose prose-lg max-w-none">
          {/* Rich text content would be rendered here */}
          <div dangerouslySetInnerHTML={{ __html: 'Rich text content rendering needed' }} />
        </div>

        <div className="mt-8 pt-8 border-t border-gray-200">
          <div className="text-sm text-gray-500">
            Published: {new Date(${config.slug.slice(0, -1)}.publishedDate || ${config.slug.slice(0, -1)}.createdAt).toLocaleDateString()}
          </div>
        </div>
      </article>
    </div>
  );
}
`;
}

// Run the generator
generateWebTypes();
