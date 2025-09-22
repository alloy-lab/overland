import type { CollectionConfig } from 'payload';
import {
  ColorPicker,
  ConditionalFields,
  ContactInfo,
  CustomColor,
  DateRange,
  MediaGallery,
  SEOFields,
  ThemeFields,
} from '../fields';

/**
 * Examples collection demonstrating all custom field types
 * This serves as a reference for developers on how to use the custom fields
 */
export const Examples: CollectionConfig = {
  slug: 'examples',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'type', 'status', 'updatedAt'],
    description: 'Examples of custom field types and their usage',
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      admin: {
        description: 'Title of this example',
      },
    },
    {
      name: 'type',
      type: 'select',
      options: [
        { label: 'Color Picker', value: 'color' },
        { label: 'Date Range', value: 'date-range' },
        { label: 'Contact Info', value: 'contact' },
        { label: 'Media Gallery', value: 'gallery' },
        { label: 'Conditional Fields', value: 'conditional' },
        { label: 'Theme Fields', value: 'theme' },
        { label: 'SEO Fields', value: 'seo' },
      ],
      required: true,
      admin: {
        description: 'Type of field example',
      },
    },
    {
      name: 'description',
      type: 'textarea',
      admin: {
        description: 'Description of what this example demonstrates',
      },
    },
    {
      name: 'status',
      type: 'select',
      options: [
        { label: 'Draft', value: 'draft' },
        { label: 'Published', value: 'published' },
        { label: 'Archived', value: 'archived' },
      ],
      defaultValue: 'draft',
      admin: {
        position: 'sidebar',
      },
    },

    // Color Picker Example
    ColorPicker,
    CustomColor,

    // Date Range Example
    DateRange,

    // Contact Info Example
    ContactInfo,

    // Media Gallery Example
    MediaGallery,

    // Conditional Fields Example
    ConditionalFields,

    // Theme Fields Example
    ThemeFields,

    // SEO Fields Example
    SEOFields,

    // Additional metadata
    {
      name: 'tags',
      type: 'text',
      admin: {
        description: 'Comma-separated tags for organization',
      },
    },
    {
      name: 'featured',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        position: 'sidebar',
        description: 'Mark as featured example',
      },
    },
    {
      name: 'difficulty',
      type: 'select',
      options: [
        { label: 'Beginner', value: 'beginner' },
        { label: 'Intermediate', value: 'intermediate' },
        { label: 'Advanced', value: 'advanced' },
      ],
      defaultValue: 'beginner',
      admin: {
        position: 'sidebar',
        description: 'Difficulty level',
      },
    },
  ],
  hooks: {
    beforeChange: [
      ({ data }) => {
        // Auto-generate slug from title if not provided
        if (data.title && !data.slug) {
          data.slug = data.title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');
        }
      },
    ],
  },
};
