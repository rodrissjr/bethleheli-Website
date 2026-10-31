import {mkdirSync, writeFileSync} from 'node:fs'
import {createRequire} from 'node:module'
import {dirname, resolve} from 'node:path'
import {fileURLToPath, pathToFileURL} from 'node:url'

import {dayTripsSource} from '../day-trips-source.mjs'

const scriptDirectory = dirname(fileURLToPath(import.meta.url))
const repositoryRoot = resolve(scriptDirectory, '../..')
const writeMode = process.env.BETHELI_DAY_TRIPS_PUBLISH === '1'
const slugs = dayTripsSource.trips.map((trip) => trip.slug)
const studioRequire = createRequire(resolve(repositoryRoot, 'studio/package.json'))
const studioSanityCli = studioRequire.resolve('sanity/cli')
const {getCliClient} = await import(pathToFileURL(studioSanityCli).href)
const client = getCliClient({apiVersion: '2026-10-31'}).withConfig({
  perspective: 'raw',
  useCdn: false,
})

const drafts = await client.fetch(
  `*[_type == "trip" && _id in path("drafts.**") && slug.current in $slugs] | order(slug.current asc)`,
  {slugs},
)
const errors = []
const found = new Set(drafts.map((document) => document.slug?.current))

for (const slug of slugs) {
  if (!found.has(slug)) errors.push(`Missing trip draft: ${slug}`)
}

for (const draft of drafts) {
  if (!draft.categories?.includes('dayTrip')) errors.push(`${draft.slug.current}: dayTrip category missing.`)
  if (!draft.heroImage?.asset?._ref) errors.push(`${draft.slug.current}: hero image missing.`)
  if (!draft.overviewImages?.length) errors.push(`${draft.slug.current}: overview images missing.`)
  if (!draft.itinerary?.length) errors.push(`${draft.slug.current}: itinerary missing.`)
  if (!draft.notIncluded?.length) errors.push(`${draft.slug.current}: exclusions missing.`)
  if (!draft.seo?.shareImage?.asset?._ref) errors.push(`${draft.slug.current}: SEO image missing.`)
}

if (errors.length) {
  console.error('Day-trip publish preflight failed:')
  errors.forEach((error) => console.error(`- ${error}`))
  process.exitCode = 1
} else if (!writeMode) {
  console.log('Day-trip publish preflight passed. No documents were published.')
  console.log(JSON.stringify({tripsReady: drafts.length}, null, 2))
} else {
  const published = []

  for (const draft of drafts) {
    const publishedId = draft._id.replace(/^drafts\./, '')
    const document = {...draft, _id: publishedId}
    delete document._rev
    delete document._createdAt
    delete document._updatedAt

    await client
      .transaction()
      .createOrReplace(document)
      .delete(draft._id)
      .commit({visibility: 'sync'})

    published.push({slug: draft.slug.current, publishedId})
    console.log(`Published day trip: ${draft.slug.current}`)
  }

  const publicTrips = await client.fetch(
    `*[_type == "trip" && !(_id in path("drafts.**")) && slug.current in $slugs] {
      _id,
      title,
      "slug": slug.current,
      categories,
      durationDays,
      trekkingDays,
      routeDistanceKm,
      "heroAsset": heroImage.asset->_id,
      "overviewImageCount": count(overviewImages),
      "itineraryCount": count(itinerary),
      "itineraryImageCount": count(itinerary[defined(image.asset)]),
      "exclusionCount": count(notIncluded),
      "seoImage": seo.shareImage.asset->_id
    } | order(slug asc)`,
    {slugs},
  )

  const invalid = publicTrips.filter(
    (trip) =>
      !trip.categories?.includes('dayTrip') ||
      !trip.heroAsset ||
      !trip.overviewImageCount ||
      !trip.itineraryCount ||
      !trip.itineraryImageCount ||
      !trip.exclusionCount ||
      !trip.seoImage,
  )
  if (publicTrips.length !== slugs.length || invalid.length) {
    throw new Error('Post-publish verification failed for one or more day trips.')
  }

  const reportDirectory = resolve(repositoryRoot, 'migration/reports')
  mkdirSync(reportDirectory, {recursive: true})
  const reportPath = resolve(reportDirectory, 'day-trips-publish.json')
  writeFileSync(
    reportPath,
    `${JSON.stringify({
      generatedAt: new Date().toISOString(),
      projectId: 'ife51h63',
      dataset: 'production',
      status: 'published',
      published,
      publicTrips,
    }, null, 2)}\n`,
  )
  console.log(`Published and verified ${published.length} day trips.`)
  console.log(`Report: ${reportPath}`)
}
