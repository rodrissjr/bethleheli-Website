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

export const destination = defineType({
  name: 'destination',
  title: 'Destination',
  type: 'document',
  icon: EarthGlobeIcon,
  fields: [
    defineField({
      name: 'title',
      title: 'Destination name',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {source: 'title', maxLength: 96},
      validation: (rule) => rule.required().custom(validateCoordinates),
    }),
    defineField({
      name: 'location',
      title: 'Standard map location',
      type: 'geopoint',
      description:
        'The destination’s standard latitude and longitude. A trip can override this point for a specific route.',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'summary',
      title: 'Short map description',
      type: 'text',
      rows: 3,
      description: 'Used as the default route description when a trip does not provide its own copy.',
    }),
  ],
  preview: {
    select: {title: 'title', subtitle: 'slug.current'},
  },
})
