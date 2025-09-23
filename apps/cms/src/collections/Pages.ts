import type { CollectionConfig } from 'payload';

export const Pages: CollectionConfig = {
  slug: 'pages',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', 'status', 'updatedAt'],
  },
  access: {
    read: () => true, // Public read access
  },
  versions: {
    drafts: true,
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      admin: {
        position: 'sidebar',
        description: 'URL-friendly version of the title (e.g., "about-us")',
      },
    },
    {
      name: 'excerpt',
      type: 'textarea',
      maxLength: 200,
      admin: {
        description: 'Brief description for search results and previews',
      },
    },
    {
      name: 'content',
      type: 'richText',
      required: true,
    },
    {
      name: 'featuredImage',
      type: 'upload',
      relationTo: 'media',
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'status',
      type: 'select',
      options: [
        {
          label: 'Draft',
          value: 'draft',
        },
        {
          label: 'Scheduled',
          value: 'scheduled',
        },
        {
          label: 'Published',
          value: 'published',
        },
        {
          label: 'Archived',
          value: 'archived',
        },
      ],
      defaultValue: 'draft',
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'publishedDate',
      type: 'date',
      admin: {
        position: 'sidebar',
        date: {
          pickerAppearance: 'dayAndTime',
        },
        description: 'When this page was or will be published',
      },
    },
    {
      name: 'scheduledDate',
      type: 'date',
      admin: {
        position: 'sidebar',
        date: {
          pickerAppearance: 'dayAndTime',
        },
        description: 'Schedule this page to be published at a specific time',
        condition: data => data.status === 'scheduled',
      },
    },
    {
      name: 'expirationDate',
      type: 'date',
      admin: {
        position: 'sidebar',
        date: {
          pickerAppearance: 'dayAndTime',
        },
        description:
          'Automatically archive this page after this date (optional)',
      },
    },
    {
      name: 'template',
      type: 'select',
      options: [
        {
          label: 'Default',
          value: 'default',
        },
        {
          label: 'Full Width',
          value: 'full-width',
        },
        {
          label: 'Sidebar',
          value: 'sidebar',
        },
        {
          label: 'Landing Page',
          value: 'landing',
        },
      ],
      defaultValue: 'default',
      admin: {
        position: 'sidebar',
        description: 'Page layout template',
      },
    },
    {
      name: 'showInNavigation',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        position: 'sidebar',
        description: 'Include this page in the main navigation menu',
      },
    },
    {
      name: 'navigationOrder',
      type: 'number',
      admin: {
        position: 'sidebar',
        description: 'Order in navigation menu (lower numbers appear first)',
        condition: data => data.showInNavigation,
      },
    },
    {
      name: 'parentPage',
      type: 'relationship',
      relationTo: 'pages' as any,
      admin: {
        position: 'sidebar',
        description: 'Parent page for hierarchical navigation',
      },
    },
    {
      name: 'seo',
      type: 'group',
      fields: [
        {
          name: 'title',
          type: 'text',
          admin: {
            description: 'Custom SEO title (defaults to page title)',
          },
        },
        {
          name: 'description',
          type: 'textarea',
          admin: {
            description: 'Meta description for search engines',
          },
        },
        {
          name: 'keywords',
          type: 'text',
          admin: {
            description: 'Comma-separated keywords',
          },
        },
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          admin: {
            description: 'Social sharing image',
          },
        },
        {
          name: 'noIndex',
          type: 'checkbox',
          defaultValue: false,
          admin: {
            description: 'Prevent search engines from indexing this page',
          },
        },
      ],
    },
  ],
  hooks: {
    beforeChange: [
      ({ data, operation, req }) => {
        // Auto-generate slug from title if not provided
        if (data.title && !data.slug) {
          data.slug = data.title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');
        }

        // Handle content scheduling
        if (data.status === 'scheduled') {
          // Validate scheduled date is in the future
          if (
            data.scheduledDate &&
            new Date(data.scheduledDate) <= new Date()
          ) {
            throw new Error('Scheduled date must be in the future');
          }

          // Set published date to scheduled date
          if (data.scheduledDate) {
            data.publishedDate = data.scheduledDate;
          }
        } else if (data.status === 'published') {
          // Set published date when status changes to published
          if (!data.publishedDate) {
            data.publishedDate = new Date().toISOString();
          }

          // Clear scheduled date when publishing
          data.scheduledDate = null;
        }

        // Handle expiration
        if (
          data.expirationDate &&
          new Date(data.expirationDate) <= new Date()
        ) {
          data.status = 'archived';
        }
      },
    ],
    afterChange: [
      async ({ doc, operation, req }) => {
        // Log content scheduling events
        if (doc.status === 'scheduled' && doc.scheduledDate) {
          console.log(`Page "${doc.title}" scheduled for ${doc.scheduledDate}`);
        }

        if (doc.status === 'published' && operation === 'update') {
          console.log(`Page "${doc.title}" published`);
        }
      },
    ],
  },
};
