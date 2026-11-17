import {mkdirSync, writeFileSync} from 'node:fs'
import {createRequire} from 'node:module'
import {dirname, resolve} from 'node:path'
import {fileURLToPath, pathToFileURL} from 'node:url'

import {interactiveTripMapSource as source} from '../interactive-trip-map-source.mjs'

const scriptDirectory = dirname(fileURLToPath(import.meta.url))
const repositoryRoot = resolve(scriptDirectory, '../..')
const reportDirectory = resolve(repositoryRoot, 'migration/reports')
const writeMode = process.env.BETHELI_INTERACTIVE_MAP_WRITE === '1'
const stableKey = (value) => value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

const errors = []
const destinationSlugs = source.destinations.map(({slug}) => slug)
if (new Set(destinationSlugs).size !== destinationSlugs.length) errors.push('Destination slugs must be unique.')
if (source.routeStops.length < 2) errors.push('At least two route stops are required for this connected route.')

for (const destination of source.destinations) {
  const {lat, lng} = destination.location
  if (!Number.isFinite(lat) || lat < -90 || lat > 90) errors.push(`${destination.slug}: invalid latitude.`)
  if (!Number.isFinite(lng) || lng < -180 || lng > 180) errors.push(`${destination.slug}: invalid longitude.`)
}
for (const stop of source.routeStops) {
  if (!destinationSlugs.includes(stop.destinationSlug)) errors.push(`Unknown destination: ${stop.destinationSlug}.`)
}

const report = {
  generatedAt: new Date().toISOString(),
  mode: writeMode ? 'production-write' : 'dry-run',
  projectId: 'ife51h63',
  dataset: 'production',
  tripSlug: source.tripSlug,
  destinationCount: source.destinations.length,
  routeStopCount: source.routeStops.length,
  routeOrder: source.routeStops.map(({destinationSlug}) => destinationSlug),
  qualityIssues: errors,
  status: errors.length ? 'failed' : writeMode ? 'written' : 'ready-for-review',
}

mkdirSync(reportDirectory, {recursive: true})
const reportPath = resolve(reportDirectory, 'interactive-trip-map-dry-run.json')

if (errors.length || !writeMode) {
  writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`)
  if (errors.length) {
    console.error(`Interactive map migration validation failed. Report: ${reportPath}`)
    process.exitCode = 1
  } else {
    console.log('Dry run passed. No content was written to Sanity.')
    console.log(`Report: ${reportPath}`)
  }
} else {
  const studioRequire = createRequire(resolve(repositoryRoot, 'studio/package.json'))
  const studioSanityCli = studioRequire.resolve('sanity/cli')
  const {getCliClient} = await import(pathToFileURL(studioSanityCli).href)
  const client = getCliClient({apiVersion: '2026-10-16'})
  const destinationIds = new Map()

  for (const destination of source.destinations) {
    const existingId = await client.fetch(
      '*[_type == "destination" && slug.current == $slug][0]._id',
      {slug: destination.slug},
    )
    const document = {
      _type: 'destination',
      title: destination.title,
      slug: {_type: 'slug', current: destination.slug},
      location: {_type: 'geopoint', ...destination.location},
      summary: destination.summary,
    }
    const written = existingId
      ? await client.patch(existingId).set(document).commit()
      : await client.create(document)
    destinationIds.set(destination.slug, written._id)
  }

  const tripId = await client.fetch('*[_type == "trip" && slug.current == $slug][0]._id', {slug: source.tripSlug})
  if (!tripId) throw new Error(`Trip not found: ${source.tripSlug}`)
  await client.patch(tripId).set({
    routeStops: source.routeStops.map((stop, index) => ({
      _type: 'routeStop',
      _key: `route-stop-${stableKey(stop.destinationSlug)}-${index + 1}`,
      destination: {_type: 'reference', _ref: destinationIds.get(stop.destinationSlug)},
      dayLabel: stop.dayLabel,
      markerLabel: stop.markerLabel,
      destinationPageLink: stop.destinationPageLink,
    })),
  }).commit()
  writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`)
  console.log(`Interactive route written for ${source.tripSlug}. Report: ${reportPath}`)
}
