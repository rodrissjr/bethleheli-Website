import {mkdirSync, readFileSync, writeFileSync} from 'node:fs'
import {createRequire} from 'node:module'
import {dirname, resolve} from 'node:path'
import {fileURLToPath, pathToFileURL} from 'node:url'

const scriptDirectory = dirname(fileURLToPath(import.meta.url))
const repositoryRoot = resolve(scriptDirectory, '../..')
const reportDirectory = resolve(repositoryRoot, 'migration/reports')
const reportPath = resolve(reportDirectory, 'all-trip-route-maps-dry-run.json')
const writeMode = process.env.BETHELI_ALL_ROUTE_MAPS_WRITE === '1'
const stableKey = (value) => value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

async function loadRouteCatalog() {
  const rootRequire = createRequire(resolve(repositoryRoot, 'package.json'))
  const typescript = rootRequire('typescript')
  const source = readFileSync(resolve(repositoryRoot, 'src/lib/trip-route-catalog.ts'), 'utf8')
  const transpiled = typescript.transpileModule(source, {
    compilerOptions: {
      module: typescript.ModuleKind.ESNext,
      target: typescript.ScriptTarget.ES2022,
    },
  }).outputText
  const moduleUrl = `data:text/javascript;base64,${Buffer.from(transpiled).toString('base64')}`
  return import(moduleUrl)
}

const {tripRouteLocations, tripRouteProfiles} = await loadRouteCatalog()
const profileEntries = Object.entries(tripRouteProfiles)
const errors = []
const locationTitles = new Map()
const normalizedProfiles = []

for (const [tripSlug, stops] of profileEntries) {
  if (!Array.isArray(stops) || stops.length < 2) {
    errors.push(`${tripSlug}: at least two route stops are required.`)
    continue
  }

  const seenLocations = new Set()
  const normalizedStops = stops.map((stop, index) => {
    const locationKey = (stop.locationKey || stop.name).toLowerCase()
    const location = tripRouteLocations[locationKey]
    if (!location) errors.push(`${tripSlug}: missing coordinates for ${stop.name} (${locationKey}).`)
    if (!stop.dayLabel?.trim()) errors.push(`${tripSlug}: ${stop.name} has no day label.`)
    if (location && (!Number.isFinite(location.lat) || location.lat < -90 || location.lat > 90)) {
      errors.push(`${tripSlug}: ${stop.name} has an invalid latitude.`)
    }
    if (location && (!Number.isFinite(location.lng) || location.lng < -180 || location.lng > 180)) {
      errors.push(`${tripSlug}: ${stop.name} has an invalid longitude.`)
    }

    if (!locationTitles.has(locationKey)) locationTitles.set(locationKey, stop.name)
    const allowDuplicateCoordinates = seenLocations.has(locationKey)
    seenLocations.add(locationKey)

    return {
      name: stop.name,
      dayLabel: stop.dayLabel,
      locationKey,
      markerLabel: String(index + 1).padStart(2, '0'),
      allowDuplicateCoordinates,
    }
  })
  normalizedProfiles.push({tripSlug, stops: normalizedStops})
}

if (profileEntries.length !== 15) errors.push(`Expected 15 trip route profiles, found ${profileEntries.length}.`)
if (new Set(profileEntries.map(([slug]) => slug)).size !== profileEntries.length) {
  errors.push('Trip route profile slugs must be unique.')
}

const kilimanjaroSlugs = new Set([
  'mount-meru-trek',
  'marangu-route-hotel-stay',
  'umbwe-route-hotel-stay',
  'machame-route',
  'northern-circuit-route',
])
const dayTripSlugs = new Set([
  'chemka-hot-springs-day-trip',
  'kilimanjaro-day-hike-marangu-route',
  'shira-plateau-day-hike',
  'materuni-waterfall-and-coffee-day-trip',
  'serval-wildlife-day-trip',
])

function routeLinkFor(tripSlug, locationKey) {
  if (locationKey === 'zanzibar') return '/zanzibar'
  if (kilimanjaroSlugs.has(tripSlug)) return '/kilimanjaro'
  if (dayTripSlugs.has(tripSlug)) return '/trips?category=Day%20Trips'
  return '/safari'
}

const totalRouteStopCount = normalizedProfiles.reduce((total, profile) => total + profile.stops.length, 0)
const report = {
  generatedAt: new Date().toISOString(),
  mode: writeMode ? 'production-write' : 'dry-run',
  projectId: 'ife51h63',
  dataset: 'production',
  tripCount: normalizedProfiles.length,
  destinationCount: locationTitles.size,
  routeStopCount: totalRouteStopCount,
  profiles: normalizedProfiles.map(({tripSlug, stops}) => ({
    tripSlug,
    routeStopCount: stops.length,
    routeOrder: stops.map(({name, dayLabel}) => ({name, dayLabel})),
  })),
  qualityIssues: errors,
  status: errors.length ? 'failed' : writeMode ? 'written' : 'ready-for-review',
}

mkdirSync(reportDirectory, {recursive: true})

if (errors.length || !writeMode) {
  writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`)
  if (errors.length) {
    console.error(`All-trip route map validation failed. Report: ${reportPath}`)
    process.exitCode = 1
  } else {
    console.log(`Dry run passed for ${normalizedProfiles.length} trips and ${totalRouteStopCount} route stops.`)
    console.log('No content was written to Sanity.')
    console.log(`Report: ${reportPath}`)
  }
} else {
  const studioRequire = createRequire(resolve(repositoryRoot, 'studio/package.json'))
  const studioSanityCli = studioRequire.resolve('sanity/cli')
  const {getCliClient} = await import(pathToFileURL(studioSanityCli).href)
  const client = getCliClient({apiVersion: '2026-11-17'})
  const destinationIds = new Map()

  for (const [locationKey, title] of locationTitles) {
    const slug = stableKey(locationKey)
    const location = tripRouteLocations[locationKey]
    const existingId = await client.fetch(
      '*[_type == "destination" && !(_id in path("drafts.**")) && slug.current == $slug][0]._id',
      {slug},
    )
    const document = {
      _type: 'destination',
      title,
      slug: {_type: 'slug', current: slug},
      location: {_type: 'geopoint', lat: location.lat, lng: location.lng},
      summary: location.description,
    }
    const written = existingId
      ? await client.patch(existingId).set(document).commit()
      : await client.create(document)
    destinationIds.set(locationKey, written._id)
  }

  let writtenTripDocuments = 0
  for (const {tripSlug, stops} of normalizedProfiles) {
    const tripIds = await client.fetch('*[_type == "trip" && slug.current == $slug]._id', {slug: tripSlug})
    if (!tripIds.length) throw new Error(`Trip not found: ${tripSlug}`)

    const routeStops = stops.map((stop, index) => ({
      _type: 'routeStop',
      _key: `route-stop-${stableKey(stop.locationKey)}-${index + 1}`,
      destination: {_type: 'reference', _ref: destinationIds.get(stop.locationKey)},
      displayName: stop.name,
      dayLabel: stop.dayLabel,
      markerLabel: stop.markerLabel,
      allowDuplicateCoordinates: stop.allowDuplicateCoordinates,
      destinationPageLink: routeLinkFor(tripSlug, stop.locationKey),
    }))

    for (const tripId of tripIds) {
      await client.patch(tripId).set({routeStops}).commit()
      writtenTripDocuments += 1
    }
  }

  report.writtenTripDocuments = writtenTripDocuments
  writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`)
  console.log(
    `Wrote ${totalRouteStopCount} route stops across ${writtenTripDocuments} Sanity trip documents. Report: ${reportPath}`,
  )
}
