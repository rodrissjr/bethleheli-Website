import {mkdirSync, writeFileSync} from 'node:fs'
import {createRequire} from 'node:module'
import {dirname, resolve} from 'node:path'
import {fileURLToPath, pathToFileURL} from 'node:url'

import {docxTripSource} from '../docx-trips-source.mjs'

const scriptDirectory = dirname(fileURLToPath(import.meta.url))
const repositoryRoot = resolve(scriptDirectory, '../..')
const reportDirectory = resolve(repositoryRoot, 'migration/reports')
const studioRequire = createRequire(resolve(repositoryRoot, 'studio/package.json'))
const studioSanityCli = studioRequire.resolve('sanity/cli')
const {getCliClient} = await import(pathToFileURL(studioSanityCli).href)
const client = getCliClient({apiVersion: '2026-10-20'})

const tripSlugs = docxTripSource.trips.map(({slug}) => slug)
const accommodationSlugs = docxTripSource.accommodations.map(({slug}) => slug)
const data = await client.fetch(
  `{
    "trips": *[_type == "trip" && slug.current in $tripSlugs] | order(slug.current asc) {
      _id,
      title,
      "slug": slug.current,
      categories,
      durationDays,
      trekkingDays,
      routeDistanceKm,
      "overviewImageCount": count(overviewImages),
      "missingOverviewImages": count(overviewImages[!defined(asset->_id)]),
      "itineraryCount": count(itinerary),
      "trekkingDayCount": count(itinerary[dayType == "trekking"]),
      "missingDayImages": count(itinerary[!defined(image.asset->_id)]),
      "missingDaySummaries": count(itinerary[!defined(summary) || summary == ""]),
      "missingDayExperiences": count(itinerary[!defined(experience) || experience == ""]),
      "missingDayMealPlans": count(itinerary[!defined(mealPlan)]),
      "missingAccommodationReferences": count(itinerary[].accommodations[!defined(@->_id)]),
      "landscapeCount": count(landscapes),
      "missingLandscapeImages": count(landscapes[!defined(image.asset->_id)]),
      "inclusionGroupCount": count(inclusionGroups),
      "relatedTripCount": count(relatedTrips),
      "missingPrimaryImages": count([cardImage, heroImage, seo.shareImage][!defined(asset->_id)]),
      "seoTitleLength": length(seo.title),
      "seoDescriptionLength": length(seo.description),
      "canonicalPath": seo.canonicalPath
    },
    "accommodations": *[_type == "accommodation" && slug.current in $accommodationSlugs] | order(slug.current asc) {
      _id,
      "slug": slug.current,
      style,
      destinationGroup,
      "galleryCount": count(gallery),
      "hasCoverImage": defined(coverImage.asset->_id),
      "missingGalleryImages": count(gallery[!defined(asset->_id)])
    }
  }`,
  {tripSlugs, accommodationSlugs},
)

const errors = []
if (data.trips.length !== tripSlugs.length) {
  errors.push(`Expected ${tripSlugs.length} trips; found ${data.trips.length}.`)
}
if (data.accommodations.length !== accommodationSlugs.length) {
  errors.push(`Expected ${accommodationSlugs.length} new accommodations; found ${data.accommodations.length}.`)
}

for (const expected of docxTripSource.trips) {
  const trip = data.trips.find(({slug}) => slug === expected.slug)
  if (!trip) {
    errors.push(`Missing trip: ${expected.slug}.`)
    continue
  }
  if (!trip.categories?.length) errors.push(`${trip.slug}: categories are missing.`)
  if (trip.durationDays !== expected.durationDays) errors.push(`${trip.slug}: duration is incorrect.`)
  if (trip.itineraryCount !== expected.durationDays) errors.push(`${trip.slug}: itinerary count does not match duration.`)
  if (expected.categories.includes('kilimanjaro') && /kilimanjaro/i.test(expected.title)) {
    if (trip.trekkingDays !== expected.trekkingDays || trip.trekkingDayCount !== expected.trekkingDays) {
      errors.push(`${trip.slug}: trekking-day count is incorrect.`)
    }
    if (expected.routeDistanceKm && trip.routeDistanceKm !== expected.routeDistanceKm) {
      errors.push(`${trip.slug}: route distance is incorrect.`)
    }
  }
  if (trip.overviewImageCount < 1 || trip.missingOverviewImages) errors.push(`${trip.slug}: overview images are missing or unresolved.`)
  if (trip.missingDayImages) errors.push(`${trip.slug}: ${trip.missingDayImages} itinerary images are unresolved.`)
  if (trip.missingDaySummaries) errors.push(`${trip.slug}: ${trip.missingDaySummaries} itinerary summaries are missing.`)
  if (trip.missingDayExperiences) errors.push(`${trip.slug}: ${trip.missingDayExperiences} itinerary experiences are missing.`)
  if (trip.missingDayMealPlans) errors.push(`${trip.slug}: ${trip.missingDayMealPlans} itinerary meal plans are missing.`)
  if (trip.missingAccommodationReferences) errors.push(`${trip.slug}: ${trip.missingAccommodationReferences} accommodation references are unresolved.`)
  if (trip.landscapeCount < 1 || trip.missingLandscapeImages) errors.push(`${trip.slug}: landscapes are missing or unresolved.`)
  if (trip.inclusionGroupCount < 1) errors.push(`${trip.slug}: inclusion groups are missing.`)
  if (trip.relatedTripCount < 1) errors.push(`${trip.slug}: related trips are missing.`)
  if (trip.missingPrimaryImages) errors.push(`${trip.slug}: ${trip.missingPrimaryImages} primary images are unresolved.`)
  if (trip.seoTitleLength < 20 || trip.seoTitleLength > 60) errors.push(`${trip.slug}: SEO title length is invalid.`)
  if (trip.seoDescriptionLength < 70 || trip.seoDescriptionLength > 160) errors.push(`${trip.slug}: SEO description length is invalid.`)
  if (trip.canonicalPath !== `/trips/${trip.slug}`) errors.push(`${trip.slug}: canonical path is incorrect.`)
}

for (const accommodation of data.accommodations) {
  if (!accommodation.hasCoverImage) errors.push(`${accommodation.slug}: cover image is unresolved.`)
  if (accommodation.galleryCount < 1 || accommodation.missingGalleryImages) {
    errors.push(`${accommodation.slug}: gallery is empty or contains unresolved images.`)
  }
}

const report = {
  generatedAt: new Date().toISOString(),
  projectId: 'ife51h63',
  dataset: 'production',
  status: errors.length ? 'failed' : 'passed',
  counts: {trips: data.trips.length, accommodations: data.accommodations.length},
  errors,
  sample: data,
}
mkdirSync(reportDirectory, {recursive: true})
const reportPath = resolve(reportDirectory, 'docx-trips-validation.json')
writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`)
console.log(`DOCX trip validation ${report.status}. Report: ${reportPath}`)
errors.forEach((error) => console.error(`- ${error}`))
if (errors.length) process.exitCode = 1
