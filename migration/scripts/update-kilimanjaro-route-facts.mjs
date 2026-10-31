import {mkdirSync, writeFileSync} from 'node:fs'
import {createRequire} from 'node:module'
import {dirname, resolve} from 'node:path'
import {fileURLToPath, pathToFileURL} from 'node:url'

const scriptDirectory = dirname(fileURLToPath(import.meta.url))
const repositoryRoot = resolve(scriptDirectory, '../..')
const reportDirectory = resolve(repositoryRoot, 'migration/reports')
const writeMode = process.env.BETHELI_KILIMANJARO_FACTS_WRITE === '1'

const factsBySlug = {
  'marangu-route-hotel-stay': {
    trekkingDays: 6,
    routeDistanceKm: 66.9,
    startingPrice: {amount: 2050, currency: 'USD'},
    title: '6-Day Kilimanjaro Marangu Route',
    heroSummary: 'A six-day hut-based Kilimanjaro climb with an acclimatization day at Horombo Hut. Hotel accommodation can be arranged separately on request.',
    seoTitle: '6-Day Marangu Route | Betheli',
    dayTypes: ['arrival', 'trekking', 'trekking', 'trekking', 'trekking', 'trekking', 'trekking', 'departure'],
  },
  'umbwe-route-hotel-stay': {
    trekkingDays: 6,
    routeDistanceKm: 46.3,
    startingPrice: {amount: 2317, currency: 'USD'},
    title: '6-Day Kilimanjaro Umbwe Route',
    heroSummary: 'A steep and quiet six-day Kilimanjaro climb via Umbwe. Hotel accommodation can be arranged separately on request.',
    seoTitle: '6-Day Umbwe Route | Betheli',
    dayTypes: ['arrival', 'trekking', 'trekking', 'trekking', 'trekking', 'trekking', 'trekking', 'departure'],
  },
  'northern-circuit-route': {
    trekkingDays: 9,
    routeDistanceKm: 97,
    startingPrice: {amount: 3265, currency: 'USD'},
    dayTypes: Array(9).fill('trekking'),
  },
  'shira-plateau-day-hike': {
    trekkingDays: 1,
    dayTypes: ['trekking'],
  },
}

const studioRequire = createRequire(resolve(repositoryRoot, 'studio/package.json'))
const studioSanityCli = studioRequire.resolve('sanity/cli')
const {getCliClient} = await import(pathToFileURL(studioSanityCli).href)
const client = getCliClient({apiVersion: '2026-10-30'}).withConfig({
  perspective: 'raw',
  useCdn: false,
})

const slugs = Object.keys(factsBySlug)
const documents = await client.fetch(
  `*[_type == "trip" && !(_id in path("drafts.**")) && slug.current in $slugs] {
    _id,
    title,
    heroSummary,
    "slug": slug.current,
    durationDays,
    trekkingDays,
    routeDistanceKm,
    startingPrice,
    itinerary[] { _key, title, dayType },
    seo { title }
  } | order(slug asc, _id asc)`,
  {slugs},
)

const publishedSlugs = new Set(
  documents.filter(({_id}) => !_id.startsWith('drafts.')).map(({slug}) => slug),
)
const missingPublished = slugs.filter((slug) => !publishedSlugs.has(slug))
if (missingPublished.length) throw new Error(`Missing published trips: ${missingPublished.join(', ')}`)

const changes = documents.map((document) => {
  const facts = factsBySlug[document.slug]
  if (document.itinerary.length !== facts.dayTypes.length) {
    throw new Error(
      `${document.slug}: expected ${facts.dayTypes.length} itinerary days, found ${document.itinerary.length}`,
    )
  }
  const after = {
    trekkingDays: facts.trekkingDays,
    ...(facts.routeDistanceKm ? {routeDistanceKm: facts.routeDistanceKm} : {}),
    ...(facts.startingPrice ? {startingPrice: facts.startingPrice} : {}),
    ...(facts.title ? {title: facts.title} : {}),
    ...(facts.heroSummary ? {heroSummary: facts.heroSummary} : {}),
    ...(facts.seoTitle ? {'seo.title': facts.seoTitle} : {}),
  }
  return {
    _id: document._id,
    slug: document.slug,
    before: {
      title: document.title,
      durationDays: document.durationDays,
      trekkingDays: document.trekkingDays,
      routeDistanceKm: document.routeDistanceKm,
      startingPrice: document.startingPrice ?? null,
      heroSummary: document.heroSummary ?? null,
      dayTypes: document.itinerary.map(({dayType}) => dayType ?? null),
    },
    after: {
      title: facts.title ?? document.title,
      totalItineraryDays: document.durationDays,
      trekkingDays: facts.trekkingDays,
      routeDistanceKm: facts.routeDistanceKm ?? null,
      startingPrice: facts.startingPrice ?? document.startingPrice ?? null,
      heroSummary: facts.heroSummary ?? document.heroSummary ?? null,
      dayTypes: facts.dayTypes,
    },
    dayTypePatches: document.itinerary.map((day, index) => ({
      key: day._key,
      value: facts.dayTypes[index],
    })),
    patch: after,
  }
})

if (writeMode) {
  for (const change of changes) {
    let patch = client.patch(change._id).set(change.patch)
    for (const dayTypePatch of change.dayTypePatches) {
      patch = patch.set({
        [`itinerary[_key=="${dayTypePatch.key}"].dayType`]: dayTypePatch.value,
      })
    }
    await patch.commit({visibility: 'sync'})
    console.log(`Updated Kilimanjaro facts: ${change.slug} (${change._id})`)
  }
}

const report = {
  generatedAt: new Date().toISOString(),
  status: writeMode ? 'written' : 'dry-run',
  sourceNote:
    'Distances are gate-to-gate and include descent. Standard route values use GPS-tracked distances; Northern Circuit is approximately 97 km.',
  changes: changes.map(({_id, slug, before, after}) => ({_id, slug, before, after})),
}
mkdirSync(reportDirectory, {recursive: true})
const reportPath = resolve(reportDirectory, 'kilimanjaro-route-facts.json')
writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`)
console.log(JSON.stringify(report, null, 2))
console.log(`Report: ${reportPath}`)
