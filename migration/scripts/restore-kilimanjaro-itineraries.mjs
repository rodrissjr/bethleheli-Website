import {mkdirSync, writeFileSync} from 'node:fs'
import {createRequire} from 'node:module'
import {dirname, resolve} from 'node:path'
import {fileURLToPath, pathToFileURL} from 'node:url'

import {docxTripSource} from '../docx-trips-source.mjs'

const scriptDirectory = dirname(fileURLToPath(import.meta.url))
const repositoryRoot = resolve(scriptDirectory, '../..')
const reportDirectory = resolve(repositoryRoot, 'migration/reports')
const writeMode = process.env.BETHELI_KILIMANJARO_ITINERARIES_WRITE === '1'
const targetSlugs = [
  'marangu-route-hotel-stay',
  'umbwe-route-hotel-stay',
  'northern-circuit-route',
  'shira-plateau-day-hike',
]

const sourceTrips = docxTripSource.trips.filter(({slug}) => targetSlugs.includes(slug))
if (sourceTrips.length !== targetSlugs.length) {
  throw new Error(`Expected ${targetSlugs.length} Kilimanjaro source trips; found ${sourceTrips.length}.`)
}

const accommodationSlugs = [...new Set(
  sourceTrips.flatMap(({itinerary}) => itinerary.flatMap(({accommodationSlugs: slugs}) => slugs)),
)]

const studioRequire = createRequire(resolve(repositoryRoot, 'studio/package.json'))
const studioSanityCli = studioRequire.resolve('sanity/cli')
const {getCliClient} = await import(pathToFileURL(studioSanityCli).href)
const client = getCliClient({apiVersion: '2026-10-30'}).withConfig({
  perspective: 'raw',
  useCdn: false,
})

const {trips, accommodations} = await client.fetch(
  `{
    "trips": *[_type == "trip" && !(_id in path("drafts.**")) && slug.current in $tripSlugs] {
      _id,
      "slug": slug.current,
      "itineraryCount": count(itinerary)
    },
    "accommodations": *[_type == "accommodation" && !(_id in path("drafts.**")) && slug.current in $accommodationSlugs] {
      _id,
      "slug": slug.current
    }
  }`,
  {tripSlugs: targetSlugs, accommodationSlugs},
)

const tripBySlug = new Map(trips.map((trip) => [trip.slug, trip]))
const accommodationBySlug = new Map(accommodations.map((item) => [item.slug, item._id]))
const missingTrips = targetSlugs.filter((slug) => !tripBySlug.has(slug))
const missingAccommodations = accommodationSlugs.filter((slug) => !accommodationBySlug.has(slug))
if (missingTrips.length) throw new Error(`Missing published trips: ${missingTrips.join(', ')}`)
if (missingAccommodations.length) {
  throw new Error(`Missing published accommodations: ${missingAccommodations.join(', ')}`)
}

const changes = sourceTrips.map((source) => {
  const document = tripBySlug.get(source.slug)
  const itinerary = source.itinerary.map((entry, dayIndex) => ({
    _key: `day-${dayIndex + 1}`,
    _type: 'itineraryDay',
    dayType: entry.dayType,
    title: entry.title,
    summary: entry.summary,
    experience: entry.experience,
    mealPlan: entry.mealPlan,
    accommodations: entry.accommodationSlugs.map((slug, accommodationIndex) => ({
      _key: `day-${dayIndex + 1}-stay-${accommodationIndex + 1}`,
      _type: 'reference',
      _ref: accommodationBySlug.get(slug),
    })),
  }))

  return {
    _id: document._id,
    slug: source.slug,
    beforeCount: document.itineraryCount,
    restoredCount: itinerary.length,
    itinerary,
  }
})

if (writeMode) {
  for (const change of changes) {
    await client.patch(change._id).set({itinerary: change.itinerary}).commit({visibility: 'sync'})
    console.log(`Restored complete itinerary content: ${change.slug}`)
  }
}

const verification = writeMode
  ? await client.fetch(
      `*[_type == "trip" && !(_id in path("drafts.**")) && slug.current in $tripSlugs] {
        "slug": slug.current,
        "dayCount": count(itinerary),
        "daysWithSummary": count(itinerary[defined(summary) && summary != ""]),
        "daysWithExperience": count(itinerary[defined(experience) && experience != ""]),
        "daysWithMealPlan": count(itinerary[defined(mealPlan)]),
        "daysWithStays": count(itinerary[count(accommodations[defined(@->_id)]) > 0])
      } | order(slug asc)`,
      {tripSlugs: targetSlugs},
    )
  : []

if (writeMode) {
  const incomplete = verification.filter((trip) =>
    [trip.daysWithSummary, trip.daysWithExperience, trip.daysWithMealPlan, trip.daysWithStays]
      .some((count) => count !== trip.dayCount),
  )
  if (incomplete.length) throw new Error(`Incomplete restored itineraries: ${JSON.stringify(incomplete)}`)
}

const report = {
  generatedAt: new Date().toISOString(),
  status: writeMode ? 'restored' : 'dry-run',
  scope: 'Published Kilimanjaro trips only; drafts and all non-itinerary fields are preserved.',
  changes: changes.map(({_id, slug, beforeCount, restoredCount}) => ({_id, slug, beforeCount, restoredCount})),
  verification,
}
mkdirSync(reportDirectory, {recursive: true})
const reportPath = resolve(reportDirectory, 'kilimanjaro-itinerary-restore.json')
writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`)
console.log(JSON.stringify(report, null, 2))
console.log(`Report: ${reportPath}`)
