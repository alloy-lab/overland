import type { Field } from 'payload';

/**
 * Media gallery field for multiple images
 * Perfect for portfolios, galleries, and image collections
 */
export const MediaGallery: Field = {
  name: 'gallery',
  type: 'array',
  fields: [
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      required: true,
    },
    {
      name: 'caption',
      type: 'text',
      admin: {
        description: 'Optional caption for this image',
      },
    },
    {
      name: 'alt',
      type: 'text',
      required: true,
      admin: {
        description: 'Alternative text for accessibility',
      },
    },
    {
      name: 'link',
      type: 'text',
      admin: {
        description: 'Optional link when image is clicked',
      },
      validate: (value: string | null | undefined) => {
        if (value && !value.startsWith('http') && !value.startsWith('/')) {
          return 'Link must be a valid URL or start with /';
        }
        return true;
      },
    },
    {
      name: 'displayOrder',
      type: 'number',
      defaultValue: 0,
      admin: {
        description: 'Order in which images appear (lower numbers first)',
      },
    },
  ],
  admin: {
    description: 'Add multiple images to create a gallery',
    initCollapsed: true,
  },
  minRows: 0,
  maxRows: 50,
};
