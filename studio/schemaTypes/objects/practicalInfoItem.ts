import {DocumentTextIcon} from '@sanity/icons/DocumentText'
import {defineField, defineType} from 'sanity'

export const practicalInfoItem = defineType({
  name: 'practicalInfoItem',
  title: 'Practical Information Item',
  type: 'object',
  icon: DocumentTextIcon,
  fields: [
    defineField({
      name: 'title',
      title: 'Heading',
      type: 'string',
      validation: (rule) => rule.required().min(3).max(80),
    }),
    defineField({
      name: 'details',
      title: 'Details',
      type: 'text',
      rows: 4,
      validation: (rule) => rule.required().min(20).max(700),
    }),
  ],
  preview: {select: {title: 'title', subtitle: 'details'}},
})
