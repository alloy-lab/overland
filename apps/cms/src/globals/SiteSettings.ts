import type { GlobalConfig } from 'payload'

export const SiteSettings: GlobalConfig = {
  slug: 'site',
  admin: {
    group: 'Settings',
  },
  access: {
    read: () => true, // Public read access
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      defaultValue: 'Overland Stack',
    },
    {
      name: 'description',
      type: 'textarea',
      required: true,
      defaultValue: 'A modern, full-stack web application built with React Router SSR and Payload CMS',
    },
    {
      name: 'logo',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'favicon',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'social',
      type: 'group',
      fields: [
        {
          name: 'twitter',
          type: 'text',
          admin: {
            description: 'Twitter username (without @)',
          },
        },
        {
          name: 'github',
          type: 'text',
          admin: {
            description: 'GitHub username',
          },
        },
        {
          name: 'linkedin',
          type: 'text',
          admin: {
            description: 'LinkedIn profile URL',
          },
        },
      ],
    },
    {
      name: 'contact',
      type: 'group',
      fields: [
        {
          name: 'email',
          type: 'email',
        },
        {
          name: 'phone',
          type: 'text',
        },
        {
          name: 'address',
          type: 'textarea',
        },
      ],
    },
    {
      name: 'analytics',
      type: 'group',
      fields: [
        {
          name: 'googleAnalyticsId',
          type: 'text',
          admin: {
            description: 'Google Analytics tracking ID (e.g., G-XXXXXXXXXX)',
          },
        },
        {
          name: 'googleTagManagerId',
          type: 'text',
          admin: {
            description: 'Google Tag Manager container ID (e.g., GTM-XXXXXXX)',
          },
        },
      ],
    },
  ],
}
