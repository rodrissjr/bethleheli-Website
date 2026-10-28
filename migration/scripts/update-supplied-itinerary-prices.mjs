import {mkdirSync, writeFileSync} from 'node:fs'
import {createRequire} from 'node:module'
import {dirname, resolve} from 'node:path'
import {fileURLToPath, pathToFileURL} from 'node:url'

import {suppliedItinerariesSource} from '../supplied-itineraries-source.mjs'

const scriptDirectory = dirname(fileURLToPath(import.meta.url))
const repositoryRoot = resolve(scriptDirectory, '../..')
const reportDirectory = resolve(repositoryRoot, 'migration/reports')
const writeMode = process.env.BETHELI_SUPPLIED_ITINERARY_PRICES_WRITE === '1'

const studioRequire = createRequire(resolve(repositoryRoot, 'studio/package.json'))
const studioSanityCli = studioRequire.resolve('sanity/cli')
const {getCliClient} = await import(pathToFileURL(studioSanityCli).href)
const client = getCliClient({apiVersion: '2026-10-20'}).withConfig({
  perspective: 'published',
  useCdn: false,
})

const expected = suppliedItinerariesSource.trips.map(({slug, startingPrice}) => ({
  slug,
  startingPrice,
}))
const slugs = expected.map(({slug}) => slug)
const publishedTrips = await client.fetch(
  `*[_type == "trip" && !(_id in path("drafts.**")) && slug.current in $slugs] {
    _id,
    title,
    "slug": slug.current,
    startingPrice
  } | order(slug asc)`,
  {slugs},
)

const tripsBySlug = new Map(publishedTrips.map((trip) => [trip.slug, trip]))
const missing = slugs.filter((slug) => !tripsBySlug.has(slug))

if (missing.length) {
  throw new Error(`Missing published supplied trips: ${missing.join(', ')}`)
}

const changes = expected.flatMap(({slug, startingPrice}) => {
  const current = tripsBySlug.get(slug)
  const currentAmount = current.startingPrice?.amount
  const currentCurrency = current.startingPrice?.currency
  const nextAmount = startingPrice?.amount
  const nextCurrency = startingPrice?.currency

  if (currentAmount === nextAmount && currentCurrency === nextCurrency) return []

  return [{
    _id: current._id,
    slug,
    title: current.title,
    before: current.startingPrice ?? null,
    after: startingPrice ?? null,
  }]
})

if (!writeMode) {
  console.log(JSON.stringify({status: 'dry-run', changes}, null, 2))
  process.exit(0)
}

for (const change of changes) {
  const patch = client.patch(change._id)
  if (change.after) patch.set({startingPrice: change.after})
  else patch.unset(['startingPrice'])
  await patch.commit({visibility: 'sync'})
  console.log(`Updated price: ${change.slug}`)
}

const verified = await client.fetch(
  `*[_type == "trip" && !(_id in path("drafts.**")) && slug.current in $slugs] {
    _id,
    "slug": slug.current,
    startingPrice
  } | order(slug asc)`,
  {slugs},
)

mkdirSync(reportDirectory, {recursive: true})
const reportPath = resolve(reportDirectory, 'supplied-itineraries-prices.json')
writeFileSync(reportPath, `${JSON.stringify({
  generatedAt: new Date().toISOString(),
  projectId: 'ife51h63',
  dataset: 'production',
  status: 'updated',
  changes,
  verified,
}, null, 2)}\n`)

console.log(`Price update complete. Report: ${reportPath}`)
