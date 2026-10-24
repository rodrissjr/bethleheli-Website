import {mkdirSync, writeFileSync} from 'node:fs'
import {createRequire} from 'node:module'
import {dirname, resolve} from 'node:path'
import {fileURLToPath, pathToFileURL} from 'node:url'

import {suppliedItinerariesSource} from '../supplied-itineraries-source.mjs'

const scriptDirectory = dirname(fileURLToPath(import.meta.url))
const repositoryRoot = resolve(scriptDirectory, '../..')
const reportDirectory = resolve(repositoryRoot, 'migration/reports')
const studioRequire = createRequire(resolve(repositoryRoot, 'studio/package.json'))
const studioSanityCli = studioRequire.resolve('sanity/cli')
const {getCliClient} = await import(pathToFileURL(studioSanityCli).href)
const client = getCliClient({apiVersion: '2026-10-20'}).withConfig({perspective: 'raw'})

const tripSlugs = suppliedItinerariesSource.trips.map(({slug}) => slug)
const newAccommodationSlugs = suppliedItinerariesSource.accommodations.map(({slug}) => slug)
const allAccommodationSlugs = [
  ...suppliedItinerariesSource.existingAccommodationSlugs,
  ...newAccommodationSlugs,
]

const data = await client.fetch(
  `{
    "trips": *[_type == "trip" && slug.current in $tripSlugs && _id in path("drafts.**")] | order(slug.current asc) {
      _id,
      title,
      "slug": slug.current,
      categories,
      durationDays,
      "itineraryCount": count(itinerary),
      "daysWithoutTitles": count(itinerary[!defined(title)]),
      "daysWithoutExperience": count(itinerary[!defined(experience)]),
      "accommodationReferenceIds": itinerary[].accommodations[]._ref,
      "landscapeCount": count(landscapes),
      "includedServiceCount": count(includedServiceKeys),
      "notIncludedCount": count(notIncluded),
      "hasHeroImage": defined(heroImage.asset->_id),
      "overviewImageCount": count(overviewImages),
      "dayImageCount": count(itinerary[defined(image.asset->_id)]),
      "seoTitleLength": length(seo.title),
      "seoDescriptionLength": length(seo.description),
      "canonicalPath": seo.canonicalPath
    },
    "accommodations": *[_type == "accommodation" && slug.current in $allAccommodationSlugs] | order(slug.current asc) {
      _id,
      "slug": slug.current,
      propertyName,
      tier,
      style,
      destinationGroup,
      location,
      "hasDescription": defined(description),
      "hasCoverImage": defined(coverImage.asset->_id),
      "galleryCount": count(gallery)
    }
  }`,
  {tripSlugs, allAccommodationSlugs},
)

const errors = []
const warnings = []
const availableAccommodationIds = new Set(
  data.accommodations.map(({_id}) => _id.replace(/^drafts\./, '')),
)

for (const expected of suppliedItinerariesSource.trips) {
  const trip = data.trips.find(({slug}) => slug === expected.slug)
  if (!trip) {
    errors.push(`Missing trip draft: ${expected.slug}.`)
    continue
  }
  if (trip.durationDays !== expected.durationDays || trip.itineraryCount !== expected.durationDays) {
    errors.push(`${trip.slug}: duration and itinerary count do not match.`)
  }
  if (trip.daysWithoutTitles || trip.daysWithoutExperience) {
    errors.push(`${trip.slug}: one or more itinerary days are incomplete.`)
  }
  const unresolvedAccommodationReferences = (trip.accommodationReferenceIds || []).filter(
    (id) => !availableAccommodationIds.has(id.replace(/^drafts\./, '')),
  )
  if (unresolvedAccommodationReferences.length) {
    errors.push(`${trip.slug}: ${unresolvedAccommodationReferences.length} accommodation references are unresolved.`)
  }
  if (trip.landscapeCount !== expected.landscapes.length) {
    errors.push(`${trip.slug}: landscape content count is incorrect.`)
  }
  if (trip.includedServiceCount !== expected.includedServiceKeys.length) {
    errors.push(`${trip.slug}: included-service count is incorrect.`)
  }
  if (trip.notIncludedCount !== expected.notIncluded.length) {
    errors.push(`${trip.slug}: exclusion count is incorrect.`)
  }
  if (trip.seoTitleLength < 20 || trip.seoTitleLength > 60) {
    errors.push(`${trip.slug}: SEO title length is invalid.`)
  }
  if (trip.seoDescriptionLength < 70 || trip.seoDescriptionLength > 160) {
    errors.push(`${trip.slug}: SEO description length is invalid.`)
  }
  if (trip.canonicalPath !== `/trips/${trip.slug}`) {
    errors.push(`${trip.slug}: canonical path is incorrect.`)
  }
  if (!trip.hasHeroImage || !trip.overviewImageCount || trip.dayImageCount < expected.durationDays) {
    warnings.push(`${trip.slug}: images remain intentionally incomplete; keep this document as a draft until they are added.`)
  }
}

for (const expected of suppliedItinerariesSource.accommodations) {
  const accommodation = data.accommodations.find(({slug}) => slug === expected.slug)
  if (!accommodation) {
    errors.push(`Missing accommodation draft: ${expected.slug}.`)
    continue
  }
  if (!accommodation.propertyName || !accommodation.tier || !accommodation.style ||
      !accommodation.destinationGroup || !accommodation.location || !accommodation.hasDescription) {
    errors.push(`${expected.slug}: required accommodation metadata is incomplete.`)
  }
  if (!accommodation.hasCoverImage || !accommodation.galleryCount) {
    warnings.push(`${expected.slug}: accommodation images remain intentionally incomplete.`)
  }
}

const report = {
  generatedAt: new Date().toISOString(),
  projectId: 'ife51h63',
  dataset: 'production',
  status: errors.length ? 'failed' : 'passed-with-expected-image-warnings',
  counts: {
    tripDrafts: data.trips.length,
    accommodationsFound: data.accommodations.length,
  },
  errors,
  warnings: [...new Set(warnings)],
  sample: data,
}
mkdirSync(reportDirectory, {recursive: true})
const reportPath = resolve(reportDirectory, 'supplied-itineraries-validation.json')
writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`)
console.log(`Supplied itinerary validation ${report.status}. Report: ${reportPath}`)
errors.forEach((error) => console.error(`- ${error}`))
warnings.forEach((warning) => console.warn(`- ${warning}`))
if (errors.length) process.exitCode = 1
