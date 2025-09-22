import type { Field } from 'payload';

/**
 * Conditional field example - shows/hides fields based on other field values
 * This demonstrates how to create dynamic forms
 */
export const ConditionalFields: Field = {
  name: 'conditionalContent',
  type: 'group',
  fields: [
    {
      name: 'contentType',
      type: 'select',
      options: [
        { label: 'Text', value: 'text' },
        { label: 'Image', value: 'image' },
        { label: 'Video', value: 'video' },
        { label: 'Embed', value: 'embed' },
      ],
      required: true,
      admin: {
        description: 'Choose the type of content to display',
      },
    },
    {
      name: 'textContent',
      type: 'richText',
      admin: {
        condition: data => data.conditionalContent?.contentType === 'text',
        description: 'Rich text content',
      },
    },
    {
      name: 'imageContent',
      type: 'upload',
      relationTo: 'media',
      admin: {
        condition: data => data.conditionalContent?.contentType === 'image',
        description: 'Upload an image',
      },
    },
    {
      name: 'videoContent',
      type: 'group',
      fields: [
        {
          name: 'videoFile',
          type: 'upload',
          relationTo: 'media',
          admin: {
            description: 'Upload a video file',
          },
        },
        {
          name: 'videoUrl',
          type: 'text',
          admin: {
            description: 'Or paste a video URL (YouTube, Vimeo, etc.)',
          },
        },
        {
          name: 'autoplay',
          type: 'checkbox',
          defaultValue: false,
          admin: {
            description: 'Autoplay video when page loads',
          },
        },
      ],
      admin: {
        condition: data => data.conditionalContent?.contentType === 'video',
      },
    },
    {
      name: 'embedContent',
      type: 'textarea',
      admin: {
        condition: data => data.conditionalContent?.contentType === 'embed',
        description: 'Paste embed code (HTML, iframe, etc.)',
      },
    },
  ],
  admin: {
    description: 'Conditional content that changes based on selected type',
  },
};
