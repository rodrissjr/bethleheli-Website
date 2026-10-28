import {mkdirSync, writeFileSync} from 'node:fs'
import {createRequire} from 'node:module'
import {dirname, resolve} from 'node:path'
import {fileURLToPath, pathToFileURL} from 'node:url'

import {suppliedItinerariesSource} from '../supplied-itineraries-source.mjs'

const scriptDirectory = dirname(fileURLToPath(import.meta.url))
const repositoryRoot = resolve(scriptDirectory, '../..')
const reportDirectory = resolve(repositoryRoot, 'migration/reports')
const writeMode = process.env.BETHELI_SUPPLIED_ITINERARIES_PUBLISH === '1'

const studioRequire = createRequire(resolve(repositoryRoot, 'studio/package.json'))
const studioSanityCli = studioRequire.resolve('sanity/cli')
const {getCliClient} = await import(pathToFileURL(studioSanityCli).href)
const client = getCliClient({apiVersion: '2026-10-20'}).withConfig({
  perspective: 'raw',
  useCdn: false,
})

const targets = [
  {
    type: 'accommodation',
    slugs: suppliedItinerariesSource.accommodations.map(({slug}) => slug),
  },
  {
    type: 'trip',
    slugs: suppliedItinerariesSource.trips.map(({slug}) => slug),
  },
]

const draftsByType = new Map()
const errors = []

for (const {type, slugs} of targets) {
  const drafts = await client.fetch(
    `*[_type == $type && _id in path("drafts.**") && slug.current in $slugs] | order(slug.current asc)`,
    {type, slugs},
  )
  const found = new Set(drafts.map((document) => document.slug?.current))
  const missing = slugs.filter((slug) => !found.has(slug))

  if (missing.length) errors.push(`Missing ${type} drafts: ${missing.join(', ')}`)
  if (drafts.length !== slugs.length) {
    errors.push(`Expected ${slugs.length} ${type} drafts; found ${drafts.length}.`)
  }

  for (const document of drafts) {
    if (type === 'accommodation' && !document.coverImage?.asset?._ref) {
      errors.push(`${document.slug.current}: accommodation cover image is missing.`)
    }
    if (type === 'trip' && !document.heroImage?.asset?._ref) {
      errors.push(`${document.slug.current}: trip hero image is missing.`)
    }
    if (type === 'trip' && !document.overviewImages?.length) {
      errors.push(`${document.slug.current}: trip overview images are missing.`)
    }
  }

  draftsByType.set(type, drafts)
}

if (errors.length) {
  console.error('Supplied itinerary publish preflight failed:')
  errors.forEach((error) => console.error(`- ${error}`))
  process.exitCode = 1
} else if (!writeMode) {
  console.log('Supplied itinerary publish preflight passed. No documents were published.')
  console.log(JSON.stringify({
    accommodationsReady: draftsByType.get('accommodation').length,
    tripsReady: draftsByType.get('trip').length,
  }, null, 2))
} else {
  const published = {accommodations: [], trips: []}

  for (const {type} of targets) {
    for (const draft of draftsByType.get(type)) {
      const publishedId = draft._id.replace(/^drafts\./, '')
      const publishedDocument = {...draft, _id: publishedId}

      delete publishedDocument._rev
      delete publishedDocument._createdAt
      delete publishedDocument._updatedAt

      await client
        .transaction()
        .createOrReplace(publishedDocument)
        .delete(draft._id)
        .commit({visibility: 'sync'})

      const entry = {slug: draft.slug.current, publishedId}
      if (type === 'accommodation') published.accommodations.push(entry)
      else published.trips.push(entry)
      console.log(`Published ${type}: ${draft.slug.current}`)
    }
  }

  const tripSlugs = targets.find(({type}) => type === 'trip').slugs
  const publicTrips = await client.fetch(
    `*[_type == "trip" && !(_id in path("drafts.**")) && slug.current in $tripSlugs] {
      _id,
      "slug": slug.current,
      "hasHeroImage": defined(heroImage.asset),
      "overviewImageCount": count(overviewImages),
      "accommodationReferenceCount": count(itinerary[].accommodations[]._ref),
      "resolvedAccommodationCount": count(itinerary[].accommodations[]->._id)
    } | order(slug asc)`,
    {tripSlugs},
  )

  const unresolved = publicTrips.filter(
    (trip) => trip.accommodationReferenceCount !== trip.resolvedAccommodationCount,
  )
  if (publicTrips.length !== tripSlugs.length || unresolved.length) {
    throw new Error('Post-publish verification failed: public trip or accommodation references are incomplete.')
  }

  mkdirSync(reportDirectory, {recursive: true})
  const reportPath = resolve(reportDirectory, 'supplied-itineraries-publish.json')
  writeFileSync(reportPath, `${JSON.stringify({
    generatedAt: new Date().toISOString(),
    projectId: 'ife51h63',
    dataset: 'production',
    status: 'published',
    published,
    publicTrips,
  }, null, 2)}\n`)

  console.log(`Published ${published.accommodations.length} accommodations and ${published.trips.length} trips.`)
  console.log(`Report: ${reportPath}`)
}
