// Custom field types for enhanced CMS functionality
// These fields provide better developer experience and more powerful content management

export { ColorPicker, CustomColor } from './ColorPicker';
export { ConditionalFields } from './ConditionalFields';
export { ContactInfo } from './ContactInfo';
export { DateRange } from './DateRange';
export { MediaGallery } from './MediaGallery';

// Field combinations for common use cases
export const ThemeFields = {
  name: 'theme',
  type: 'group',
  fields: [
    {
      name: 'primaryColor',
      type: 'select',
      options: [
        { label: 'Blue', value: '#3B82F6' },
        { label: 'Green', value: '#10B981' },
        { label: 'Purple', value: '#8B5CF6' },
        { label: 'Red', value: '#EF4444' },
        { label: 'Custom', value: 'custom' },
      ],
      admin: {
        description: 'Primary theme color',
      },
    },
    {
      name: 'customPrimaryColor',
      type: 'text',
      admin: {
        condition: data => data.theme?.primaryColor === 'custom',
        description: 'Custom hex color (e.g., #FF5733)',
      },
    },
    {
      name: 'fontFamily',
      type: 'select',
      options: [
        { label: 'System Default', value: 'system' },
        { label: 'Inter', value: 'inter' },
        { label: 'Roboto', value: 'roboto' },
        { label: 'Open Sans', value: 'open-sans' },
        { label: 'Lato', value: 'lato' },
      ],
      defaultValue: 'system',
      admin: {
        description: 'Font family for the site',
      },
    },
    {
      name: 'layout',
      type: 'select',
      options: [
        { label: 'Centered', value: 'centered' },
        { label: 'Full Width', value: 'full-width' },
        { label: 'Sidebar', value: 'sidebar' },
      ],
      defaultValue: 'centered',
      admin: {
        description: 'Page layout style',
      },
    },
  ],
  admin: {
    description: 'Theme customization options',
  },
};

export const SEOFields = {
  name: 'seo',
  type: 'group',
  fields: [
    {
      name: 'title',
      type: 'text',
      maxLength: 60,
      admin: {
        description: 'SEO title (recommended: 50-60 characters)',
      },
    },
    {
      name: 'description',
      type: 'textarea',
      maxLength: 160,
      admin: {
        description: 'Meta description (recommended: 150-160 characters)',
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
        description: 'Social sharing image (1200x630px recommended)',
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
    {
      name: 'canonicalUrl',
      type: 'text',
      admin: {
        description: 'Canonical URL (if different from page URL)',
      },
    },
  ],
  admin: {
    description: 'Search engine optimization settings',
  },
};
