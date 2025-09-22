import type { Field } from 'payload';

/**
 * Contact information field group
 * Reusable across different content types
 */
export const ContactInfo: Field = {
  name: 'contactInfo',
  type: 'group',
  fields: [
    {
      name: 'name',
      type: 'text',
      admin: {
        description: 'Contact person or organization name',
      },
    },
    {
      name: 'email',
      type: 'email',
      admin: {
        description: 'Primary email address',
      },
    },
    {
      name: 'phone',
      type: 'text',
      admin: {
        description: 'Phone number (include country code if international)',
      },
    },
    {
      name: 'website',
      type: 'text',
      admin: {
        description: 'Website URL',
      },
      validate: (value: string | null | undefined) => {
        if (value && !value.startsWith('http')) {
          return 'Website URL must start with http:// or https://';
        }
        return true;
      },
    },
    {
      name: 'address',
      type: 'group',
      fields: [
        {
          name: 'street',
          type: 'text',
          admin: {
            description: 'Street address',
          },
        },
        {
          name: 'city',
          type: 'text',
          admin: {
            description: 'City',
          },
        },
        {
          name: 'state',
          type: 'text',
          admin: {
            description: 'State or province',
          },
        },
        {
          name: 'zipCode',
          type: 'text',
          admin: {
            description: 'ZIP or postal code',
          },
        },
        {
          name: 'country',
          type: 'text',
          admin: {
            description: 'Country',
          },
        },
      ],
    },
    {
      name: 'socialMedia',
      type: 'group',
      fields: [
        {
          name: 'twitter',
          type: 'text',
          admin: {
            description: 'Twitter handle (without @)',
          },
        },
        {
          name: 'linkedin',
          type: 'text',
          admin: {
            description: 'LinkedIn profile URL',
          },
        },
        {
          name: 'facebook',
          type: 'text',
          admin: {
            description: 'Facebook page URL',
          },
        },
        {
          name: 'instagram',
          type: 'text',
          admin: {
            description: 'Instagram handle (without @)',
          },
        },
      ],
    },
  ],
  admin: {
    description: 'Complete contact information',
  },
};
