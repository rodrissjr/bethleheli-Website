import {EarthGlobeIcon} from '@sanity/icons/EarthGlobe'
import {defineField, defineType} from 'sanity'

function validateCoordinates(value: unknown) {
  const point = value as {lat?: unknown; lng?: unknown} | undefined
  if (!point) return true
  if (typeof point.lat !== 'number' || point.lat < -90 || point.lat > 90) {
    return 'Latitude must be between -90 and 90.'
  }
  if (typeof point.lng !== 'number' || point.lng < -180 || point.lng > 180) {
    return 'Longitude must be between -180 and 180.'
  }
  return true
}

export const routeStop = defineType({
  name: 'routeStop',
  title: 'Route stop',
  type: 'object',
  icon: EarthGlobeIcon,
  fields: [
    defineField({
      name: 'destination',
      title: 'Destination',
      type: 'reference',
      to: [{type: 'destination'}],
      description: 'Select the reusable destination whose standard coordinates should be used.',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'displayName',
      title: 'Custom display name',
      type: 'string',
      description: 'Optional trip-specific name. Leave blank to use the destination title.',
    }),
    defineField({
      name: 'coordinateOverride',
      title: 'Coordinate override',
      type: 'geopoint',
      description:
        'Optional trip-specific latitude and longitude. When present, these coordinates take priority over the destination location.',
      validation: (rule) => rule.custom(validateCoordinates),
    }),
    defineField({
      name: 'dayLabel',
      title: 'Day label',
      type: 'string',
      description: 'For example “Day 1” or “Days 5–6”.',
      validation: (rule) => rule.max(40),
    }),
    defineField({
      name: 'description',
      title: 'Route description',
      type: 'text',
      rows: 3,
      description: 'Short copy shown when this stop is selected. Falls back to the destination summary.',
      validation: (rule) => rule.max(320),
    }),
    defineField({
      name: 'destinationPageLink',
      title: 'Destination page link',
      type: 'string',
      description: 'Optional website path such as /safari, or a complete https:// URL.',
      validation: (rule) =>
        rule.custom((value) => {
          if (!value) return true
          if (value.startsWith('/') && !value.startsWith('//')) return true
          try {
            return new URL(value).protocol === 'https:' || 'Use a relative path or a complete HTTPS URL.'
          } catch {
            return 'Use a relative path or a complete HTTPS URL.'
          }
        }),
    }),
    defineField({
      name: 'markerLabel',
      title: 'Marker label',
      type: 'string',
      description: 'Optional short marker label. Array order is used when this is empty.',
      validation: (rule) => rule.max(4),
    }),
    defineField({
      name: 'allowDuplicateCoordinates',
      title: 'Intentional return stop',
      type: 'boolean',
      initialValue: false,
      description:
        'Enable only when this itinerary intentionally returns to coordinates already used by another route stop.',
    }),
  ],
  preview: {
    select: {
      destination: 'destination.title',
      displayName: 'displayName',
      dayLabel: 'dayLabel',
    },
    prepare({destination, displayName, dayLabel}) {
      return {title: displayName || destination || 'Route stop', subtitle: dayLabel || 'Day not set'}
    },
  },
})
