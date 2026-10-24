import {EarthGlobeIcon} from '@sanity/icons/EarthGlobe'
import {defineArrayMember, defineField, defineType} from 'sanity'
import {inclusionServiceOptions} from '../../../shared/inclusion-catalog'

export const trip = defineType({
  name: 'trip',
  title: 'Trip',
  type: 'document',
  icon: EarthGlobeIcon,
  groups: [
    {name: 'hero', title: '1. Hero', default: true},
    {name: 'overview', title: '2. Overview'},
    {name: 'itinerary', title: '3. Itinerary'},
    {name: 'landscapes', title: '4. Landscapes'},
    {name: 'inclusions', title: '5. Inclusions'},
    {name: 'relationships', title: '6. Related Trips'},
    {name: 'seo', title: '7. SEO'},
  ],
  fields: [
    defineField({
      name: 'title',
      title: 'Trip Title',
      type: 'string',
      group: 'hero',
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      group: 'hero',
      options: {source: 'title', maxLength: 96},
    }),
    defineField({
      name: 'categories',
      title: 'Categories',
      type: 'array',
      group: 'hero',
      description: 'Select every category this itinerary belongs to.',
      of: [defineArrayMember({type: 'string'})],
      options: {
        list: [
          {title: 'Safari', value: 'safari'},
          {title: 'Zanzibar', value: 'zanzibar'},
          {title: 'Kilimanjaro', value: 'kilimanjaro'},
        ],
        layout: 'grid',
      },
      validation: (rule) => rule.max(3).unique(),
    }),
    defineField({
      name: 'category',
      title: 'Legacy Category',
      type: 'string',
      hidden: true,
      readOnly: true,
      deprecated: {reason: 'Replaced by the multi-select Categories field.'},
    }),
    defineField({
      name: 'durationDays',
      title: 'Duration in Days',
      type: 'number',
      group: 'hero',
      validation: (rule) => rule.integer().min(1),
    }),
    defineField({
      name: 'startingPrice',
      title: 'Starting Price Per Person',
      type: 'money',
      group: 'hero',
    }),
    defineField({
      name: 'heroImage',
      title: 'Hero Image',
      type: 'contentImage',
      group: 'hero',
    }),
    defineField({
      name: 'heroSummary',
      title: 'Hero Summary',
      type: 'text',
      rows: 3,
      group: 'hero',
    }),
    defineField({
      name: 'overviewParagraphs',
      title: 'Overview Paragraphs',
      type: 'array',
      group: 'overview',
      of: [defineArrayMember({type: 'text', rows: 4})],
    }),
    defineField({
      name: 'overviewImages',
      title: 'Overview Images',
      type: 'array',
      group: 'overview',
      description: 'These images rotate automatically in the trip overview slider.',
      of: [defineArrayMember({type: 'contentImage'})],
      options: {layout: 'grid'},
      validation: (rule) => rule.max(10),
    }),
    defineField({
      name: 'overviewImage',
      title: 'Legacy Overview Image',
      type: 'contentImage',
      group: 'overview',
      hidden: true,
      readOnly: true,
      deprecated: {reason: 'Replaced by the Overview Images slider.'},
    }),
    defineField({
      name: 'itineraryFor',
      title: 'Itinerary For',
      type: 'string',
      group: 'overview',
    }),
    defineField({
      name: 'travelDatesText',
      title: 'Travel Dates Text',
      type: 'string',
      group: 'overview',
    }),
    defineField({
      name: 'guestsText',
      title: 'Guests Text',
      type: 'string',
      group: 'overview',
    }),
    defineField({
      name: 'destinations',
      title: 'Destinations Included',
      type: 'array',
      group: 'itinerary',
      of: [defineArrayMember({type: 'string'})],
      validation: (rule) => rule.unique(),
    }),
    defineField({
      name: 'planningTitle',
      title: 'Planning Panel Title',
      type: 'string',
      group: 'itinerary',
    }),
    defineField({
      name: 'planningDescription',
      title: 'Planning Panel Description',
      type: 'text',
      rows: 3,
      group: 'itinerary',
    }),
    defineField({
      name: 'itinerary',
      title: 'Daily Itinerary',
      type: 'array',
      group: 'itinerary',
      of: [defineArrayMember({type: 'itineraryDay'})],
    }),
    defineField({
      name: 'landscapesTitle',
      title: 'Landscapes Section Title',
      type: 'string',
      group: 'landscapes',
      description: 'Heading shown above the landscape cards, for example “From savannah to the Indian Ocean”.',
    }),
    defineField({
      name: 'landscapes',
      title: 'Landscape Cards',
      type: 'array',
      group: 'landscapes',
      description: 'Add one card for each environment visited. This entire website section stays hidden when no cards are added.',
      of: [defineArrayMember({type: 'landscape'})],
    }),
    defineField({
      name: 'inclusionsEyebrow',
      title: 'Inclusions Eyebrow',
      type: 'string',
      group: 'inclusions',
    }),
    defineField({
      name: 'inclusionsTitle',
      title: 'Inclusions Title',
      type: 'string',
      group: 'inclusions',
    }),
    defineField({
      name: 'inclusionsDescription',
      title: 'Inclusions Description',
      type: 'text',
      rows: 3,
      group: 'inclusions',
    }),
    defineField({
      name: 'includedServiceKeys',
      title: 'What Is Included',
      type: 'array',
      group: 'inclusions',
      description: 'Select every service included in this trip. The website adds the correct groups, icons and descriptions automatically.',
      of: [defineArrayMember({type: 'string'})],
      options: {
        list: inclusionServiceOptions,
        layout: 'grid',
      },
      validation: (rule) => rule.unique(),
    }),
    defineField({
      name: 'notIncluded',
      title: 'What Is Not Included',
      type: 'array',
      group: 'inclusions',
      description: 'Items explicitly excluded by the source itinerary or final proposal.',
      of: [defineArrayMember({type: 'string'})],
      validation: (rule) => rule.unique(),
    }),
    defineField({
      name: 'inclusionGroups',
      title: 'Legacy Inclusion Groups',
      type: 'array',
      group: 'inclusions',
      description: 'Existing manually entered inclusions. New trips should use the checklist above.',
      of: [defineArrayMember({type: 'inclusionGroup'})],
      readOnly: true,
      hidden: true,
      deprecated: {reason: 'Replaced by the What Is Included checklist.'},
    }),
    defineField({
      name: 'relatedTrips',
      title: 'Related Trips',
      type: 'array',
      group: 'relationships',
      description: 'Cards linking to existing trip or Kilimanjaro route pages.',
      of: [defineArrayMember({type: 'relatedTripCard'})],
      validation: (rule) => rule.unique(),
    }),
    defineField({
      name: 'seo',
      title: 'SEO',
      type: 'seo',
      group: 'seo',
    }),
    defineField({
      name: 'cardTitle',
      title: 'Legacy Trip Card Title',
      type: 'string',
      hidden: true,
      readOnly: true,
      deprecated: {reason: 'Trip cards now use Trip Title.'},
    }),
    defineField({
      name: 'locationLabel',
      title: 'Legacy Card Location Label',
      type: 'string',
      hidden: true,
      readOnly: true,
      deprecated: {reason: 'Trip cards now use Categories for filtering.'},
    }),
    defineField({
      name: 'cardImage',
      title: 'Legacy Trip Card Image',
      type: 'contentImage',
      hidden: true,
      readOnly: true,
      deprecated: {reason: 'Trip cards now use the Hero Image.'},
    }),
  ],
  validation: (rule) =>
    rule.custom((document) => {
      const durationDays = document?.durationDays as number | undefined
      const itinerary = document?.itinerary as unknown[] | undefined

      if (durationDays && itinerary && itinerary.length !== durationDays) {
        return `Daily itinerary must contain exactly ${durationDays} days.`
      }

      return true
    }),
  preview: {
    select: {
      title: 'title',
      categories: 'categories',
      durationDays: 'durationDays',
      media: 'heroImage',
    },
    prepare({title, categories, durationDays, media}) {
      const categoryLabel = Array.isArray(categories)
        ? categories
            .map((category) => category.charAt(0).toUpperCase() + category.slice(1))
            .join(', ')
        : ''
      return {
        title,
        subtitle: [categoryLabel, durationDays ? `${durationDays} days` : null]
          .filter(Boolean)
          .join(' · '),
        media,
      }
    },
  },
})
