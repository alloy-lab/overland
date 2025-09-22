import type { Field } from 'payload';

/**
 * Color picker field with predefined color options
 * Perfect for theme customization and brand colors
 */
export const ColorPicker: Field = {
  name: 'color',
  type: 'select',
  options: [
    { label: 'Primary Blue', value: '#3B82F6' },
    { label: 'Secondary Gray', value: '#6B7280' },
    { label: 'Success Green', value: '#10B981' },
    { label: 'Warning Yellow', value: '#F59E0B' },
    { label: 'Error Red', value: '#EF4444' },
    { label: 'Purple', value: '#8B5CF6' },
    { label: 'Pink', value: '#EC4899' },
    { label: 'Indigo', value: '#6366F1' },
    { label: 'Teal', value: '#14B8A6' },
    { label: 'Orange', value: '#F97316' },
    { label: 'Custom', value: 'custom' },
  ],
  admin: {
    description:
      'Choose a predefined color or select custom for a color picker',
  },
};

/**
 * Custom color field that appears when "Custom" is selected
 */
export const CustomColor: Field = {
  name: 'customColor',
  type: 'text',
  admin: {
    description: 'Enter a custom hex color (e.g., #FF5733)',
    condition: data => data.color === 'custom',
  },
  validate: (value, { siblingData }) => {
    if (siblingData.color === 'custom' && value) {
      const hexPattern = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
      if (!hexPattern.test(value)) {
        return 'Please enter a valid hex color (e.g., #FF5733)';
      }
    }
    return true;
  },
};
