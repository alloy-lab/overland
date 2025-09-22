import type { CollectionConfig } from 'payload';

export const Media: CollectionConfig = {
  slug: 'media',
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
      admin: {
        description: 'Alternative text for accessibility',
      },
    },
    {
      name: 'caption',
      type: 'text',
      admin: {
        description: 'Optional caption for the image',
      },
    },
    {
      name: 'folder',
      type: 'text',
      admin: {
        description:
          'Organize media into folders (e.g., "heroes", "gallery", "icons")',
      },
    },
    {
      name: 'tags',
      type: 'text',
      admin: {
        description: 'Comma-separated tags for better organization',
      },
    },
    {
      name: 'metadata',
      type: 'group',
      fields: [
        {
          name: 'width',
          type: 'number',
          admin: {
            readOnly: true,
            description: 'Image width in pixels',
          },
        },
        {
          name: 'height',
          type: 'number',
          admin: {
            readOnly: true,
            description: 'Image height in pixels',
          },
        },
        {
          name: 'format',
          type: 'text',
          admin: {
            readOnly: true,
            description: 'Image format (JPEG, PNG, WebP, etc.)',
          },
        },
        {
          name: 'size',
          type: 'number',
          admin: {
            readOnly: true,
            description: 'File size in bytes',
          },
        },
        {
          name: 'optimized',
          type: 'checkbox',
          defaultValue: false,
          admin: {
            readOnly: true,
            description: 'Whether this image has been optimized',
          },
        },
      ],
    },
    {
      name: 'usage',
      type: 'group',
      fields: [
        {
          name: 'pages',
          type: 'relationship',
          relationTo: 'pages',
          hasMany: true,
          admin: {
            readOnly: true,
            description: 'Pages that use this media',
          },
        },
        {
          name: 'lastUsed',
          type: 'date',
          admin: {
            readOnly: true,
            description: 'When this media was last used',
          },
        },
      ],
    },
  ],
  upload: {
    staticDir: 'uploads',
    imageSizes: [
      {
        name: 'thumbnail',
        width: 300,
        height: 300,
        position: 'centre',
      },
      {
        name: 'medium',
        width: 800,
        height: 600,
        position: 'centre',
      },
      {
        name: 'large',
        width: 1920,
        height: 1080,
        position: 'centre',
      },
    ],
    adminThumbnail: 'thumbnail',
    mimeTypes: ['image/*'],
  },
  hooks: {
    beforeChange: [
      async ({ data, req }) => {
        // Auto-extract metadata when image is uploaded
        if (data.filename && req.file) {
          try {
            const sharp = await import('sharp');
            const metadata = await sharp.default(req.file.data).metadata();

            data.metadata = {
              width: metadata.width,
              height: metadata.height,
              format: metadata.format,
              size: req.file.size,
              optimized: false,
            };
          } catch (error) {
            console.error('Failed to extract image metadata:', error);
          }
        }

        // Auto-generate folder based on upload date if not provided
        if (!data.folder) {
          const now = new Date();
          const year = now.getFullYear();
          const month = String(now.getMonth() + 1).padStart(2, '0');
          data.folder = `${year}/${month}`;
        }

        return data;
      },
    ],
  },
};
