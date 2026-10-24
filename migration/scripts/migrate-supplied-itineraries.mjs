import {randomUUID} from 'node:crypto'
import {mkdirSync, writeFileSync} from 'node:fs'
import {createRequire} from 'node:module'
import {dirname, resolve} from 'node:path'
import {fileURLToPath, pathToFileURL} from 'node:url'

import {suppliedItinerariesSource} from '../supplied-itineraries-source.mjs'

const scriptDirectory = dirname(fileURLToPath(import.meta.url))
const repositoryRoot = resolve(scriptDirectory, '../..')
const reportDirectory = resolve(repositoryRoot, 'migration/reports')
const writeMode = process.env.BETHELI_SUPPLIED_ITINERARIES_WRITE === '1'

const allowedCategories = new Set(['safari', 'zanzibar', 'kilimanjaro'])
const allowedMealPlans = new Set([
  'breakfast',
  'lunch',
  'breakfastLunch',
  'lunchDinner',
  'halfBoard',
  'fullBoard',
])
const allowedTiers = new Set(['budget', 'midRange', 'luxury'])
const allowedStyles = new Set([
  'safariCamp',
  'tentedSuite',
  'forestLodge',
  'gardenLodge',
  'hotel',
  'resort',
  'villa',
  'privateSuite',
  'mountainHut',
  'mountainCamp',
])
const allowedDestinationGroups = new Set(['safariMainland', 'zanzibar', 'mountain'])

const validateSource = () => {
  const errors = []
  const warnings = [
    suppliedItinerariesSource.inventory.duplicateDecision,
    suppliedItinerariesSource.inventory.publishingDecision,
    suppliedItinerariesSource.inventory.priceDecision,
    suppliedItinerariesSource.inventory.researchDecision,
  ]
  const tripSlugs = suppliedItinerariesSource.trips.map(({slug}) => slug)
  const newAccommodationSlugs = suppliedItinerariesSource.accommodations.map(({slug}) => slug)
  const accommodationSlugs = new Set([
    ...suppliedItinerariesSource.existingAccommodationSlugs,
    ...newAccommodationSlugs,
  ])

  if (new Set(tripSlugs).size !== tripSlugs.length) errors.push('Trip slugs must be unique.')
  if (new Set(newAccommodationSlugs).size !== newAccommodationSlugs.length) {
    errors.push('New accommodation slugs must be unique.')
  }

  for (const accommodation of suppliedItinerariesSource.accommodations) {
    if (!allowedTiers.has(accommodation.tier)) errors.push(`${accommodation.slug}: unknown tier.`)
    if (!allowedStyles.has(accommodation.style)) errors.push(`${accommodation.slug}: unknown style.`)
    if (!allowedDestinationGroups.has(accommodation.destinationGroup)) {
      errors.push(`${accommodation.slug}: unknown destination group.`)
    }
    if (!accommodation.description || !accommodation.location) {
      errors.push(`${accommodation.slug}: location and description are required.`)
    }
  }

  for (const trip of suppliedItinerariesSource.trips) {
    if (trip.itinerary.length !== trip.durationDays) {
      errors.push(`${trip.slug}: expected ${trip.durationDays} itinerary days; found ${trip.itinerary.length}.`)
    }
    if (!trip.categories.length || trip.categories.some((value) => !allowedCategories.has(value))) {
      errors.push(`${trip.slug}: categories are missing or invalid.`)
    }
    trip.itinerary.forEach((entry, index) => {
      if (!allowedMealPlans.has(entry.mealPlan)) {
        errors.push(`${trip.slug} day ${index + 1}: invalid meal plan ${entry.mealPlan}.`)
      }
      entry.accommodationSlugs.forEach((slug) => {
        if (!accommodationSlugs.has(slug)) {
          errors.push(`${trip.slug} day ${index + 1}: unknown accommodation ${slug}.`)
        }
      })
    })
    if (trip.seo.title.length < 20 || trip.seo.title.length > 60) {
      errors.push(`${trip.slug}: SEO title must be 20–60 characters.`)
    }
    if (trip.seo.description.length < 70 || trip.seo.description.length > 160) {
      errors.push(`${trip.slug}: SEO description must be 70–160 characters.`)
    }
    if (trip.seo.canonicalPath !== `/trips/${trip.slug}`) {
      errors.push(`${trip.slug}: canonical path is incorrect.`)
    }
  }

  return {errors, warnings}
}

const writeReport = (name, report) => {
  mkdirSync(reportDirectory, {recursive: true})
  const path = resolve(reportDirectory, name)
  writeFileSync(path, `${JSON.stringify(report, null, 2)}\n`)
  return path
}

const {errors, warnings} = validateSource()
const counts = {
  sourceDocuments: suppliedItinerariesSource.inventory.sourceDocuments.length,
  uniqueTrips: suppliedItinerariesSource.trips.length,
  newAccommodationDrafts: suppliedItinerariesSource.accommodations.length,
  itineraryDays: suppliedItinerariesSource.trips.reduce(
    (total, trip) => total + trip.itinerary.length,
    0,
  ),
  images: 0,
}
const baseReport = {
  generatedAt: new Date().toISOString(),
  mode: writeMode ? 'draft-write' : 'dry-run',
  projectId: 'ife51h63',
  dataset: 'production',
  source: suppliedItinerariesSource.inventory,
  counts,
  warnings,
  qualityIssues: errors,
}

if (errors.length) {
  const path = writeReport('supplied-itineraries-dry-run.json', {...baseReport, status: 'failed'})
  console.error(`Supplied itinerary validation failed. Report: ${path}`)
  errors.forEach((error) => console.error(`- ${error}`))
  process.exitCode = 1
} else if (!writeMode) {
  const path = writeReport('supplied-itineraries-dry-run.json', {
    ...baseReport,
    status: 'ready-for-draft-import',
  })
  console.log('Supplied itinerary dry run passed. No content was written to Sanity.')
  console.log(`Report: ${path}`)
  console.log(JSON.stringify(counts, null, 2))
} else {
  const studioRequire = createRequire(resolve(repositoryRoot, 'studio/package.json'))
  const studioSanityCli = studioRequire.resolve('sanity/cli')
  const {getCliClient} = await import(pathToFileURL(studioSanityCli).href)
  const client = getCliClient({apiVersion: '2026-10-20'}).withConfig({perspective: 'raw'})
  const accommodationIds = {}
  const written = {accommodations: [], trips: []}

  const findBySlug = (type, slug) =>
    client.fetch(
      `*[_type == $type && slug.current == $slug] | order(_updatedAt desc)[0]._id`,
      {type, slug},
    )

  const baseId = (id) => id.replace(/^drafts\./, '')

  const draftUpsertBySlug = async (type, slug, document) => {
    const existingId = await findBySlug(type, slug)
    const id = baseId(existingId || randomUUID())
    const result = await client.createOrReplace({...document, _id: `drafts.${id}`})
    return {...result, baseId: id}
  }

  for (const slug of suppliedItinerariesSource.existingAccommodationSlugs) {
    const existingId = await findBySlug('accommodation', slug)
    if (!existingId) throw new Error(`Required existing accommodation was not found: ${slug}`)
    accommodationIds[slug] = baseId(existingId)
  }

  for (const accommodation of suppliedItinerariesSource.accommodations) {
    const result = await draftUpsertBySlug('accommodation', accommodation.slug, {
      _type: 'accommodation',
      propertyName: accommodation.propertyName,
      slug: {_type: 'slug', current: accommodation.slug},
      tier: accommodation.tier,
      style: accommodation.style,
      destinationGroup: accommodation.destinationGroup,
      location: accommodation.location,
      description: accommodation.description,
    })
    accommodationIds[accommodation.slug] = result.baseId
    written.accommodations.push({slug: accommodation.slug, draftId: result._id})
    console.log(`Upserted accommodation draft: ${accommodation.propertyName}`)
  }

  for (const trip of suppliedItinerariesSource.trips) {
    const result = await draftUpsertBySlug('trip', trip.slug, {
      _type: 'trip',
      title: trip.title,
      slug: {_type: 'slug', current: trip.slug},
      categories: trip.categories,
      durationDays: trip.durationDays,
      heroSummary: trip.heroSummary,
      overviewParagraphs: trip.overviewParagraphs,
      itineraryFor: trip.itineraryFor,
      travelDatesText: trip.travelDatesText,
      guestsText: trip.guestsText,
      destinations: trip.destinations,
      planningTitle: trip.planningTitle,
      planningDescription: trip.planningDescription,
      itinerary: trip.itinerary.map((entry, dayIndex) => ({
        _key: `day-${dayIndex + 1}`,
        _type: 'itineraryDay',
        title: entry.title,
        summary: entry.summary,
        experience: entry.experience,
        mealPlan: entry.mealPlan,
        accommodations: entry.accommodationSlugs.map((slug, accommodationIndex) => ({
          _key: `day-${dayIndex + 1}-stay-${accommodationIndex + 1}`,
          _type: 'reference',
          _ref: accommodationIds[slug],
          _weak: true,
        })),
      })),
      landscapesTitle: trip.landscapesTitle,
      landscapes: trip.landscapes.map((entry, index) => ({
        _key: `landscape-${index + 1}`,
        _type: 'landscape',
        ...entry,
      })),
      inclusionsEyebrow: trip.inclusionsEyebrow,
      inclusionsTitle: trip.inclusionsTitle,
      inclusionsDescription: trip.inclusionsDescription,
      includedServiceKeys: trip.includedServiceKeys,
      notIncluded: trip.notIncluded,
      seo: {_type: 'seo', ...trip.seo},
    })
    written.trips.push({slug: trip.slug, draftId: result._id})
    console.log(`Upserted trip draft: ${trip.title}`)
  }

  const report = {
    ...baseReport,
    status: 'drafts-written',
    written,
  }
  const path = writeReport('supplied-itineraries-write.json', report)
  console.log(`Draft import completed. Report: ${path}`)
}
