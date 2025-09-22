import type { Field } from 'payload';

/**
 * Date range field for events, campaigns, etc.
 */
export const DateRange: Field = {
  name: 'dateRange',
  type: 'group',
  fields: [
    {
      name: 'startDate',
      type: 'date',
      required: true,
      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
        },
        description: 'Start date and time',
      },
    },
    {
      name: 'endDate',
      type: 'date',
      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
        },
        description: 'End date and time (optional)',
      },
    },
    {
      name: 'allDay',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description: 'This is an all-day event',
      },
    },
  ],
  admin: {
    description: 'Date range for events, campaigns, or time-sensitive content',
  },
  validate: value => {
    if (value?.startDate && value?.endDate) {
      const start = new Date(value.startDate);
      const end = new Date(value.endDate);

      if (end <= start) {
        return 'End date must be after start date';
      }
    }
    return true;
  },
};
