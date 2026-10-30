import {createReadStream, existsSync, mkdirSync, writeFileSync} from 'node:fs'
import {createRequire} from 'node:module'
import {basename, dirname, resolve} from 'node:path'
import {fileURLToPath, pathToFileURL} from 'node:url'

import {docxTripSource} from '../docx-trips-source.mjs'

const scriptDirectory = dirname(fileURLToPath(import.meta.url))
const repositoryRoot = resolve(scriptDirectory, '../..')
const reportDirectory = resolve(repositoryRoot, 'migration/reports')
const writeMode = process.env.BETHELI_DOCX_TRIPS_WRITE === '1'

const stableKey = (value) =>
  value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 80)

const isSourceImage = (value) =>
  value && typeof value === 'object' && typeof value.path === 'string' && typeof value.alt === 'string'

const collectImages = (value, results = new Map()) => {
  if (isSourceImage(value)) {
    results.set(value.path, value)
    return results
  }
  if (Array.isArray(value)) {
    value.forEach((item) => collectImages(item, results))
    return results
  }
  if (value && typeof value === 'object') {
    Object.values(value).forEach((item) => collectImages(item, results))
  }
  return results
}

const validateSource = () => {
  const errors = []
  const warnings = []
  const images = collectImages(docxTripSource)
  const newAccommodationSlugs = docxTripSource.accommodations.map(({slug}) => slug)
  const accommodationSlugs = new Set([
    ...docxTripSource.existingAccommodationSlugs,
    ...newAccommodationSlugs,
  ])
  const tripSlugs = docxTripSource.trips.map(({slug}) => slug)
  const allowedCategories = new Set(['safari', 'zanzibar', 'kilimanjaro'])
  const allowedMealPlans = new Set([
    'breakfast',
    'lunch',
    'breakfastLunch',
    'lunchDinner',
    'halfBoard',
    'fullBoard',
  ])
  const availableIcons = new Set([
    'backpack',
    'clipboard',
    'droplets',
    'heart',
    'message',
    'mountain',
    'route',
    'tent',
    'ticket',
    'utensils',
  ])

  if (new Set(newAccommodationSlugs).size !== newAccommodationSlugs.length) {
    errors.push('New accommodation slugs must be unique.')
  }
  if (new Set(tripSlugs).size !== tripSlugs.length) errors.push('Trip slugs must be unique.')

  for (const trip of docxTripSource.trips) {
    if (trip.itinerary.length !== trip.durationDays) {
      errors.push(`${trip.slug}: duration is ${trip.durationDays} days but ${trip.itinerary.length} days were supplied.`)
    }
    if (!trip.categories.length || new Set(trip.categories).size !== trip.categories.length) {
      errors.push(`${trip.slug}: categories must contain one or more unique values.`)
    }
    if (trip.categories.includes('kilimanjaro') && /kilimanjaro/i.test(trip.title)) {
      const trekkingDayCount = trip.itinerary.filter(({dayType}) => dayType === 'trekking').length
      if (trip.trekkingDays !== trekkingDayCount) {
        errors.push(`${trip.slug}: trekkingDays must match the itinerary days marked as trekking.`)
      }
      if (trip.trekkingDays > 1 && !trip.routeDistanceKm) {
        errors.push(`${trip.slug}: multi-day Kilimanjaro routes require a route distance.`)
      }
    }
    for (const category of trip.categories) {
      if (!allowedCategories.has(category)) errors.push(`${trip.slug}: unknown category ${category}.`)
    }
    if (!trip.startingPrice?.amount || trip.startingPrice.amount <= 0) {
      errors.push(`${trip.slug}: starting price must be greater than zero.`)
    }
    for (const [index, itineraryDay] of trip.itinerary.entries()) {
      if (!allowedMealPlans.has(itineraryDay.mealPlan)) {
        errors.push(`${trip.slug} day ${index + 1}: unknown meal plan ${itineraryDay.mealPlan}.`)
      }
      if (!itineraryDay.accommodationSlugs.length) {
        errors.push(`${trip.slug} day ${index + 1}: at least one accommodation is required.`)
      }
      for (const slug of itineraryDay.accommodationSlugs) {
        if (!accommodationSlugs.has(slug)) {
          errors.push(`${trip.slug} day ${index + 1}: unknown accommodation ${slug}.`)
        }
      }
    }
    for (const group of trip.inclusionGroups) {
      for (const item of group.items) {
        if (!availableIcons.has(item.iconKey)) {
          errors.push(`${trip.slug}: unsupported inclusion icon ${item.iconKey}.`)
        }
      }
    }
    if (trip.seo.title.length < 20 || trip.seo.title.length > 60) {
      errors.push(`${trip.slug}: SEO title must be between 20 and 60 characters.`)
    }
    if (trip.seo.description.length < 70 || trip.seo.description.length > 160) {
      errors.push(`${trip.slug}: SEO description must be between 70 and 160 characters.`)
    }
    if (trip.seo.canonicalPath !== `/trips/${trip.slug}`) {
      errors.push(`${trip.slug}: canonical path must match /trips/${trip.slug}.`)
    }
    for (const relatedTrip of trip.relatedTrips) {
      if (!relatedTrip.href.startsWith('/')) errors.push(`${trip.slug}: related trip path must begin with /.`)
    }
  }

  images.forEach(({path, alt}) => {
    if (!existsSync(resolve(repositoryRoot, path))) errors.push(`Missing image: ${path}`)
    if (alt.trim().length < 5) errors.push(`Image alt text is too short: ${path}`)
  })

  warnings.push(docxTripSource.inventory.priceDecision)
  warnings.push(docxTripSource.inventory.assetDecision)
  return {errors, warnings, images}
}

const writeReport = (name, report) => {
  mkdirSync(reportDirectory, {recursive: true})
  const path = resolve(reportDirectory, name)
  writeFileSync(path, `${JSON.stringify(report, null, 2)}\n`)
  return path
}

const {errors, warnings, images} = validateSource()
const counts = {
  sourceDocuments: docxTripSource.inventory.sourceDocuments.length,
  trips: docxTripSource.trips.length,
  newAccommodations: docxTripSource.accommodations.length,
  itineraryDays: docxTripSource.trips.reduce((total, trip) => total + trip.itinerary.length, 0),
  uniqueImages: images.size,
}
const baseReport = {
  generatedAt: new Date().toISOString(),
  mode: writeMode ? 'production-write' : 'dry-run',
  projectId: 'ife51h63',
  dataset: 'production',
  source: docxTripSource.inventory,
  counts,
  warnings,
  qualityIssues: errors,
}

if (errors.length) {
  const path = writeReport('docx-trips-dry-run.json', {...baseReport, status: 'failed'})
  console.error(`DOCX trip migration source validation failed. Report: ${path}`)
  errors.forEach((error) => console.error(`- ${error}`))
  process.exitCode = 1
} else if (!writeMode) {
  const path = writeReport('docx-trips-dry-run.json', {...baseReport, status: 'ready-for-review'})
  console.log('DOCX trip migration dry run passed. No content was written to Sanity.')
  console.log(`Report: ${path}`)
  console.log(JSON.stringify(counts, null, 2))
} else {
  const studioRequire = createRequire(resolve(repositoryRoot, 'studio/package.json'))
  const studioSanityCli = studioRequire.resolve('sanity/cli')
  const {getCliClient} = await import(pathToFileURL(studioSanityCli).href)
  const client = getCliClient({apiVersion: '2026-10-20'})
  const uploadedAssets = new Map()
  const accommodationIds = {}
  const tripIds = {}

  for (const [relativePath] of images) {
    const absolutePath = resolve(repositoryRoot, relativePath)
    const asset = await client.assets.upload('image', createReadStream(absolutePath), {
      filename: basename(absolutePath),
    })
    uploadedAssets.set(relativePath, asset._id)
    console.log(`Uploaded ${relativePath}`)
  }

  const contentImage = (value) => ({
    _type: 'contentImage',
    asset: {_type: 'reference', _ref: uploadedAssets.get(value.path)},
    alt: value.alt,
  })
  const money = (value) => ({_type: 'money', ...value})
  const seo = (value) => ({
    _type: 'seo',
    title: value.title,
    description: value.description,
    canonicalPath: value.canonicalPath,
    shareImage: contentImage(value.shareImage),
  })

  const upsertBySlug = async (type, slug, document) => {
    const existingId = await client.fetch(
      '*[_type == $type && slug.current == $slug][0]._id',
      {type, slug},
    )
    return existingId
      ? client.createOrReplace({...document, _id: existingId})
      : client.create(document)
  }

  for (const slug of docxTripSource.existingAccommodationSlugs) {
    const id = await client.fetch(
      '*[_type == "accommodation" && slug.current == $slug][0]._id',
      {slug},
    )
    if (!id) throw new Error(`Required existing accommodation was not found: ${slug}`)
    accommodationIds[slug] = id
  }

  for (const accommodation of docxTripSource.accommodations) {
    const document = {
      _type: 'accommodation',
      propertyName: accommodation.propertyName,
      slug: {_type: 'slug', current: accommodation.slug},
      tier: accommodation.tier,
      style: accommodation.style,
      destinationGroup: accommodation.destinationGroup,
      location: accommodation.location,
      description: accommodation.description,
      coverImage: contentImage(accommodation.coverImage),
      gallery: accommodation.gallery.map((entry, index) => ({
        ...contentImage(entry),
        _key: `${stableKey(accommodation.slug)}-gallery-${index + 1}`,
      })),
    }
    const result = await upsertBySlug('accommodation', accommodation.slug, document)
    accommodationIds[accommodation.slug] = result._id
    console.log(`Upserted accommodation ${accommodation.propertyName}`)
  }

  for (const trip of docxTripSource.trips) {
    const document = {
      _type: 'trip',
      title: trip.title,
      cardTitle: trip.cardTitle,
      slug: {_type: 'slug', current: trip.slug},
      categories: trip.categories,
      locationLabel: trip.locationLabel,
      durationDays: trip.durationDays,
      ...(trip.trekkingDays ? {trekkingDays: trip.trekkingDays} : {}),
      ...(trip.routeDistanceKm ? {routeDistanceKm: trip.routeDistanceKm} : {}),
      startingPrice: money(trip.startingPrice),
      cardImage: contentImage(trip.cardImage),
      heroImage: contentImage(trip.heroImage),
      heroSummary: trip.heroSummary,
      overviewParagraphs: trip.overviewParagraphs,
      overviewImages: trip.overviewImages.map((entry, index) => ({
        ...contentImage(entry),
        _key: `overview-image-${index + 1}`,
      })),
      itineraryFor: trip.itineraryFor,
      travelDatesText: trip.travelDatesText,
      guestsText: trip.guestsText,
      destinations: trip.destinations,
      planningTitle: trip.planningTitle,
      planningDescription: trip.planningDescription,
      itinerary: trip.itinerary.map((entry, dayIndex) => ({
        _key: `day-${dayIndex + 1}`,
        _type: 'itineraryDay',
        dayType: entry.dayType,
        title: entry.title,
        summary: entry.summary,
        image: contentImage(entry.image),
        experience: entry.experience,
        mealPlan: entry.mealPlan,
        accommodations: entry.accommodationSlugs.map((slug, accommodationIndex) => ({
          _key: `day-${dayIndex + 1}-stay-${accommodationIndex + 1}`,
          _type: 'reference',
          _ref: accommodationIds[slug],
        })),
      })),
      landscapesTitle: trip.landscapesTitle,
      landscapes: trip.landscapes.map((entry, index) => ({
        _key: `landscape-${index + 1}`,
        _type: 'landscape',
        name: entry.name,
        descriptor: entry.descriptor,
        iconKey: entry.iconKey,
        image: contentImage(entry.image),
        description: entry.description,
      })),
      inclusionsEyebrow: trip.inclusionsEyebrow,
      inclusionsTitle: trip.inclusionsTitle,
      inclusionsDescription: trip.inclusionsDescription,
      inclusionGroups: trip.inclusionGroups.map((group, groupIndex) => ({
        _key: `inclusion-group-${groupIndex + 1}`,
        _type: 'inclusionGroup',
        marker: group.marker,
        title: group.title,
        description: group.description,
        items: group.items.map((item, itemIndex) => ({
          _key: `inclusion-${groupIndex + 1}-${itemIndex + 1}`,
          _type: 'inclusionItem',
          iconKey: item.iconKey,
          title: item.title,
          description: item.description,
        })),
      })),
      relatedTrips: trip.relatedTrips.map((entry, index) => ({
        _key: `related-trip-${index + 1}`,
        _type: 'relatedTripCard',
        title: entry.title,
        summary: entry.summary,
        durationLabel: entry.durationLabel,
        image: contentImage(entry.image),
        href: entry.href,
      })),
      seo: seo(trip.seo),
    }
    const result = await upsertBySlug('trip', trip.slug, document)
    tripIds[trip.slug] = result._id
    console.log(`Upserted trip ${trip.title}`)
  }

  const path = writeReport('docx-trips-import.json', {
    ...baseReport,
    status: 'import-complete-pending-validation',
    documentIds: {accommodations: accommodationIds, trips: tripIds},
  })
  console.log(`DOCX trip migration completed. Report: ${path}`)
}
