# Collection Registry System

## Overview

The Collection Registry is an automated system that bridges the gap between Payload CMS collections and web app development. It automatically generates TypeScript types, API client methods, React components, and route files based on your Payload collections.

## How It Works

### 1. Collection Scanning

The system scans the `apps/cms/src/collections/` directory and automatically detects:

- Collection slugs and display names
- Field types and configurations
- Special features (slug, status, SEO, navigation, etc.)
- Public access settings

### 2. Type Generation

Based on the detected collections, it generates:

- **TypeScript interfaces** for each collection
- **Base types** (PayloadResponse, Media, QueryOptions, etc.)
- **Form schemas** and validation types
- **Navigation and SEO types**

### 3. API Client Methods

Automatically generates methods for each collection:

- `get{CollectionName}()` - Get all items with filtering
- `get{ItemName}(slug)` - Get single item by slug
- `getPublished{CollectionName}()` - Get only published items
- `get{CollectionName}ForNavigation()` - Get navigation items

### 4. Route Files

Creates React Router routes for each collection:

- `{collection}._index.tsx` - List page
- `{collection}.$slug.tsx` - Detail page

## Usage

### Generate All Types

```bash
# Generate Payload types and web app types
pnpm generate:types

# Generate only web app types (if Payload types already exist)
pnpm generate:web-types
```

### Workflow

1. **Create Collection** in `apps/cms/src/collections/`
2. **Add to Payload Config** in `apps/cms/src/payload.config.ts`
3. **Generate Types** with `pnpm generate:types`
4. **Use Generated Code** in your web app

## Generated Files

### Types (`apps/web/app/lib/types.ts`)

```typescript
export interface Page {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  content: any;
  featuredImage?: Media;
  status: 'draft' | 'published';
  // ... more fields
}
```

### API Client (`apps/web/app/lib/payloadClient.ts`)

```typescript
// Auto-generated methods
async getPages(options?: QueryOptions): Promise<PayloadResponse<Page>>
async getPage(slug: string, draft = false): Promise<Page>
async getPublishedPages(options?: Omit<QueryOptions, 'where'>): Promise<Page[]>
async getPagesForNavigation(): Promise<Page[]>
```

### Routes (`apps/web/app/routes/`)

- `pages._index.tsx` - Lists all pages
- `pages.$slug.tsx` - Shows individual page

## Collection Features Detection

The system automatically detects these features:

| Feature            | Detection                        | Generated Methods                |
| ------------------ | -------------------------------- | -------------------------------- |
| **Slug**           | `name: 'slug'` field             | `get{Item}(slug)`                |
| **Status**         | `name: 'status'` field           | `getPublished{Collection}()`     |
| **SEO**            | `name: 'seo'` field              | SEO meta generation              |
| **Navigation**     | `name: 'showInNavigation'` field | `get{Collection}ForNavigation()` |
| **Featured Image** | `name: 'featuredImage'` field    | Image handling                   |
| **Excerpt**        | `name: 'excerpt'` field          | Preview text                     |
| **Tags**           | `name: 'tags'` field             | Tag filtering                    |
| **Author**         | `name: 'author'` field           | Author information               |

## Customization

### Adding New Features

To add support for new collection features:

1. **Update Detection Logic** in `scripts/collection-registry.js`:

```javascript
// In extractCollectionMetadata()
hasCustomFeature: fields.some(f => f.name === 'customField'),
```

2. **Add Type Generation**:

```javascript
// In generateCollectionType()
if (collection.hasCustomFeature) {
  // Add custom field handling
}
```

3. **Generate Custom Methods**:

```javascript
// In generateCollectionMethods()
if (collection.hasCustomFeature) {
  methods.push(`
  async get${displayName}WithCustomFeature(): Promise<${displayName}[]> {
    // Custom method implementation
  }`);
}
```

### Custom Field Types

Add new field type mappings in `getTypeScriptType()`:

```javascript
const typeMap = {
  customField: 'CustomType',
  // ... existing mappings
};
```

## Advanced Features

### Form Generation

The system can generate form schemas for content creation:

```typescript
export interface FormSchema {
  fields: FormField[];
  validation?: any;
}
```

### Validation Rules

Automatically generates validation based on field requirements:

```typescript
// Required fields
required: field.required;

// Field-specific validation
type: field.type;
```

### SEO Integration

Generates SEO meta tags based on collection fields:

```typescript
export interface SEOData {
  title: string;
  description: string;
  image?: string;
  url?: string;
  type?: string;
}
```

## Best Practices

### Collection Design

1. **Use Standard Field Names**:
   - `slug` for URL-friendly identifiers
   - `status` for draft/published workflow
   - `seo` for SEO configuration
   - `showInNavigation` for menu inclusion

2. **Consistent Field Types**:
   - Use `text` for titles and names
   - Use `textarea` for excerpts
   - Use `richText` for content
   - Use `upload` for images

3. **Public Access**:
   - Set `read: () => true` for public collections
   - Use proper access controls for admin-only content

### Development Workflow

1. **Design First**: Plan your collection structure
2. **Create Collection**: Add to Payload CMS
3. **Generate Types**: Run `pnpm generate:types`
4. **Customize**: Modify generated code as needed
5. **Test**: Verify everything works correctly

## Troubleshooting

### Common Issues

**Types Not Generated**

- Ensure Payload types exist: `pnpm --filter cms generate:types`
- Check collection files are valid TypeScript
- Verify collection is added to `payload.config.ts`

**Missing Methods**

- Check field names match expected patterns
- Verify collection has required features (slug, status, etc.)
- Regenerate types after collection changes

**Route Errors**

- Ensure collection has `slug` field for detail routes
- Check route file syntax
- Verify loader functions are properly typed

### Debug Mode

Add logging to see what's being detected:

```javascript
console.log('Collection metadata:', metadata);
console.log('Detected fields:', fields);
```

## Future Enhancements

### Planned Features

- **GraphQL Schema Generation**
- **Form Component Generation**
- **Validation Schema Generation**
- **API Documentation Generation**
- **Testing Utilities Generation**
- **Migration Scripts**

### Integration Ideas

- **Storybook Stories** for generated components
- **Jest Tests** for generated utilities
- **OpenAPI Specs** for API documentation
- **Prisma Schema** for database integration

## Contributing

To improve the Collection Registry:

1. **Add Feature Detection** for new collection patterns
2. **Enhance Type Generation** for better TypeScript support
3. **Improve Route Generation** for more complex layouts
4. **Add Custom Templates** for different use cases

The system is designed to be extensible and can be customized for specific project needs.
