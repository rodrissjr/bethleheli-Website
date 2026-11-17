import {mkdirSync, readFileSync, writeFileSync} from 'node:fs'
import {createRequire} from 'node:module'
import {dirname, resolve} from 'node:path'
import {fileURLToPath, pathToFileURL} from 'node:url'

const scriptDirectory = dirname(fileURLToPath(import.meta.url))
const repositoryRoot = resolve(scriptDirectory, '../..')
const reportDirectory = resolve(repositoryRoot, 'migration/reports')
const reportPath = resolve(reportDirectory, 'all-trip-route-maps-validation.json')

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

const {tripRouteProfiles} = await loadRouteCatalog()
const studioRequire = createRequire(resolve(repositoryRoot, 'studio/package.json'))
const studioSanityCli = studioRequire.resolve('sanity/cli')
const {getCliClient} = await import(pathToFileURL(studioSanityCli).href)
const client = getCliClient({apiVersion: '2026-11-17'})

const documents = await client.fetch(`
  *[_type == "trip" && !(_id in path("drafts.**")) && slug.current in $slugs] | order(slug.current asc) {
    title,
    "slug": slug.current,
    routeStops[] {
      displayName,
      dayLabel,
      markerLabel,
      allowDuplicateCoordinates,
      "destinationTitle": destination->title,
      "lat": destination->location.lat,
      "lng": destination->location.lng
    }
  }
`, {slugs: Object.keys(tripRouteProfiles)})

const documentsBySlug = new Map(documents.map((document) => [document.slug, document]))
const errors = []
const trips = []

for (const [slug, expectedStops] of Object.entries(tripRouteProfiles)) {
  const document = documentsBySlug.get(slug)
  if (!document) {
    errors.push(`${slug}: published trip not found.`)
    continue
  }
  const actualStops = document.routeStops || []
  if (actualStops.length !== expectedStops.length) {
    errors.push(`${slug}: expected ${expectedStops.length} route stops, found ${actualStops.length}.`)
  }

  expectedStops.forEach((expected, index) => {
    const actual = actualStops[index]
    if (!actual) return
    if (actual.displayName !== expected.name) {
      errors.push(`${slug}: stop ${index + 1} name is ${actual.displayName}, expected ${expected.name}.`)
    }
    if (actual.dayLabel !== expected.dayLabel) {
      errors.push(`${slug}: stop ${index + 1} day label is ${actual.dayLabel}, expected ${expected.dayLabel}.`)
    }
    if (!Number.isFinite(actual.lat) || !Number.isFinite(actual.lng)) {
      errors.push(`${slug}: stop ${index + 1} has no resolved coordinates.`)
    }
  })

  trips.push({slug, title: document.title, routeStopCount: actualStops.length})
}

const report = {
  generatedAt: new Date().toISOString(),
  projectId: 'ife51h63',
  dataset: 'production',
  validatedTripCount: trips.length,
  routeStopCount: trips.reduce((total, trip) => total + trip.routeStopCount, 0),
  trips,
  qualityIssues: errors,
  status: errors.length ? 'failed' : 'passed',
}

mkdirSync(reportDirectory, {recursive: true})
writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`)

if (errors.length) {
  console.error(`Production route map validation failed with ${errors.length} issue(s). Report: ${reportPath}`)
  process.exitCode = 1
} else {
  console.log(`Production validation passed for ${trips.length} trips and ${report.routeStopCount} route stops.`)
  console.log(`Report: ${reportPath}`)
}
