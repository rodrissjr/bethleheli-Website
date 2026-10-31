import {createHash, randomUUID} from 'node:crypto'
import {createReadStream, existsSync, mkdirSync, readFileSync, statSync, writeFileSync} from 'node:fs'
import {createRequire} from 'node:module'
import {basename, dirname, resolve} from 'node:path'
import {fileURLToPath, pathToFileURL} from 'node:url'

import {dayTripsSource} from '../day-trips-source.mjs'

const scriptDirectory = dirname(fileURLToPath(import.meta.url))
const repositoryRoot = resolve(scriptDirectory, '../..')
const reportDirectory = resolve(repositoryRoot, 'migration/reports')
const writeMode = process.env.BETHELI_DAY_TRIPS_WRITE === '1'
const allowedCategories = new Set(['dayTrip', 'safari', 'zanzibar', 'kilimanjaro'])
const allowedMealPlans = new Set([
  'breakfast',
  'lunch',
  'breakfastLunch',
  'lunchDinner',
  'halfBoard',
  'fullBoard',
])

const sourceImages = dayTripsSource.trips.flatMap((trip) => [
  trip.heroImage,
  ...trip.overviewImages,
  ...trip.itinerary.flatMap((day) => (day.image ? [day.image] : [])),
])
const uniqueSourceImages = [...new Map(sourceImages.map((image) => [image.path, image])).values()]

const validateSource = () => {
  const errors = []
  const slugs = dayTripsSource.trips.map((trip) => trip.slug)

  if (new Set(slugs).size !== slugs.length) errors.push('Day-trip slugs must be unique.')

  for (const document of dayTripsSource.inventory.sourceDocuments) {
    if (!existsSync(resolve(repositoryRoot, document.localPath))) {
      errors.push(`Missing source document: ${document.localPath}`)
    }
  }

  for (const image of uniqueSourceImages) {
    const path = resolve(repositoryRoot, image.path)
    if (!existsSync(path)) {
      errors.push(`Missing image: ${image.path}`)
      continue
    }
    const size = statSync(path).size
    if (size >= 250_000) errors.push(`${image.path}: ${size} bytes is not below 250 KB.`)
    if (!image.alt || image.alt.length < 5) errors.push(`${image.path}: meaningful alt text is required.`)
  }

  for (const trip of dayTripsSource.trips) {
    if (!trip.categories.includes('dayTrip')) errors.push(`${trip.slug}: missing dayTrip category.`)
    if (trip.categories.some((category) => !allowedCategories.has(category))) {
      errors.push(`${trip.slug}: includes an invalid category.`)
    }
    if (trip.durationDays !== trip.itinerary.length) {
      errors.push(`${trip.slug}: duration must match the day-by-day itinerary length.`)
    }
    if (!trip.heroImage || !trip.overviewImages.length) {
      errors.push(`${trip.slug}: hero and overview images are required.`)
    }
    if (!trip.notIncluded.length || !trip.includedServiceKeys.length) {
      errors.push(`${trip.slug}: inclusions and exclusions are required.`)
    }
    if (!trip.practicalInformation?.length) {
      errors.push(`${trip.slug}: practical information is required.`)
    }
    for (const item of trip.practicalInformation || []) {
      if (!item.title || !item.details || item.details.length < 20) {
        errors.push(`${trip.slug}: every practical information item needs a heading and details.`)
      }
    }
    for (const day of trip.itinerary) {
      if (day.mealPlan && !allowedMealPlans.has(day.mealPlan)) {
        errors.push(`${trip.slug}: invalid meal plan ${day.mealPlan}.`)
      }
    }
    if (trip.categories.includes('kilimanjaro')) {
      const trekkingDays = trip.itinerary.filter((day) => day.dayType === 'trekking').length
      if (trip.trekkingDays !== trekkingDays) {
        errors.push(`${trip.slug}: trekkingDays must match itinerary days marked trekking.`)
      }
    }
    if (trip.seo.title.length < 20 || trip.seo.title.length > 60) {
      errors.push(`${trip.slug}: SEO title must be 20–60 characters.`)
    }
    if (trip.seo.description.length < 70 || trip.seo.description.length > 160) {
      errors.push(`${trip.slug}: SEO description must be 70–160 characters.`)
    }
  }

  return errors
}

const imageManifest = uniqueSourceImages.map((image) => {
  const path = resolve(repositoryRoot, image.path)
  return {
    path: image.path,
    alt: image.alt,
    bytes: existsSync(path) ? statSync(path).size : null,
    sha256: existsSync(path)
      ? createHash('sha256').update(readFileSync(path)).digest('hex')
      : null,
  }
})

const writeReport = (name, report) => {
  mkdirSync(reportDirectory, {recursive: true})
  const path = resolve(reportDirectory, name)
  writeFileSync(path, `${JSON.stringify(report, null, 2)}\n`)
  return path
}

const errors = validateSource()
const baseReport = {
  generatedAt: new Date().toISOString(),
  mode: writeMode ? 'draft-write' : 'dry-run',
  projectId: 'ife51h63',
  dataset: 'production',
  source: dayTripsSource.inventory,
  counts: {
    trips: dayTripsSource.trips.length,
    itineraryDays: dayTripsSource.trips.reduce((total, trip) => total + trip.itinerary.length, 0),
    uniqueImages: imageManifest.length,
  },
  imageManifest,
  qualityIssues: errors,
}

if (errors.length) {
  const path = writeReport('day-trips-dry-run.json', {...baseReport, status: 'failed'})
  console.error(`Day-trip validation failed. Report: ${path}`)
  errors.forEach((error) => console.error(`- ${error}`))
  process.exitCode = 1
} else if (!writeMode) {
  const path = writeReport('day-trips-dry-run.json', {
    ...baseReport,
    status: 'ready-for-draft-import',
  })
  console.log('Day-trip dry run passed. No content was written to Sanity.')
  console.log(`Report: ${path}`)
  console.log(JSON.stringify(baseReport.counts, null, 2))
} else {
  const studioRequire = createRequire(resolve(repositoryRoot, 'studio/package.json'))
  const studioSanityCli = studioRequire.resolve('sanity/cli')
  const {getCliClient} = await import(pathToFileURL(studioSanityCli).href)
  const client = getCliClient({apiVersion: '2026-10-31'}).withConfig({
    perspective: 'raw',
    useCdn: false,
  })
  const assetIds = new Map()
  const written = []

  const findBySlug = (slug) =>
    client.fetch(
      `*[_type == "trip" && slug.current == $slug] | order(_updatedAt desc)[0]._id`,
      {slug},
    )

  const uploadImage = async (image) => {
    const path = resolve(repositoryRoot, image.path)
    let assetId = assetIds.get(path)
    if (!assetId) {
      const filename = basename(path)
      assetId = await client.fetch(
        `*[_type == "sanity.imageAsset" && originalFilename == $filename][0]._id`,
        {filename},
      )
      if (!assetId) {
        const asset = await client.assets.upload('image', createReadStream(path), {filename})
        assetId = asset._id
        console.log(`Uploaded image: ${filename}`)
      } else {
        console.log(`Reused image asset: ${filename}`)
      }
      assetIds.set(path, assetId)
    }
    return {
      _type: 'contentImage',
      asset: {_type: 'reference', _ref: assetId},
      alt: image.alt,
    }
  }

  for (const trip of dayTripsSource.trips) {
    const existingId = await findBySlug(trip.slug)
    const baseId = (existingId || randomUUID()).replace(/^drafts\./, '')
    const heroImage = await uploadImage(trip.heroImage)
    const itinerary = await Promise.all(
      trip.itinerary.map(async (day, index) => ({
        _key: `day-${index + 1}`,
        _type: 'itineraryDay',
        dayType: day.dayType,
        title: day.title,
        summary: day.summary,
        experience: day.experience,
        ...(day.mealPlan ? {mealPlan: day.mealPlan} : {}),
        ...(day.image ? {image: await uploadImage(day.image)} : {}),
        accommodations: [],
      })),
    )
    const document = {
      _id: `drafts.${baseId}`,
      _type: 'trip',
      title: trip.title,
      slug: {_type: 'slug', current: trip.slug},
      categories: trip.categories,
      durationDays: trip.durationDays,
      ...(trip.trekkingDays ? {trekkingDays: trip.trekkingDays} : {}),
      ...(trip.routeDistanceKm ? {routeDistanceKm: trip.routeDistanceKm} : {}),
      heroImage,
      heroSummary: trip.heroSummary,
      overviewParagraphs: trip.overviewParagraphs,
      overviewImages: await Promise.all(trip.overviewImages.map(uploadImage)),
      itineraryFor: trip.itineraryFor,
      travelDatesText: trip.travelDatesText,
      guestsText: trip.guestsText,
      destinations: trip.destinations,
      planningTitle: trip.planningTitle,
      planningDescription: trip.planningDescription,
      itinerary,
      practicalInformation: trip.practicalInformation.map((item, index) => ({
        _key: `practical-${index + 1}`,
        _type: 'practicalInfoItem',
        title: item.title,
        details: item.details,
      })),
      landscapesTitle: '',
      landscapes: [],
      inclusionsEyebrow: trip.inclusionsEyebrow,
      inclusionsTitle: trip.inclusionsTitle,
      inclusionsDescription: trip.inclusionsDescription,
      includedServiceKeys: trip.includedServiceKeys,
      notIncluded: trip.notIncluded,
      relatedTrips: [],
      seo: {
        _type: 'seo',
        title: trip.seo.title,
        description: trip.seo.description,
        canonicalPath: `/trips/${trip.slug}`,
        shareImage: heroImage,
      },
    }

    const result = await client.createOrReplace(document)
    written.push({slug: trip.slug, draftId: result._id})
    console.log(`Upserted day-trip draft: ${trip.title}`)
  }

  const path = writeReport('day-trips-write.json', {
    ...baseReport,
    status: 'drafts-written',
    written,
  })
  console.log(`Day-trip draft import completed. Report: ${path}`)
}
