import {mkdirSync, writeFileSync} from 'node:fs'
import {createRequire} from 'node:module'
import {dirname, resolve} from 'node:path'
import {fileURLToPath, pathToFileURL} from 'node:url'

const scriptDirectory = dirname(fileURLToPath(import.meta.url))
const repositoryRoot = resolve(scriptDirectory, '../..')
const reportDirectory = resolve(repositoryRoot, 'migration/reports')
const writeMode = process.env.BETHELI_TRIP_EXCLUSIONS_WRITE === '1'

const commonSafariExclusions = [
  'International airfare to and from Tanzania',
  'Tanzanian visa and travel-document costs',
  'Travel, medical and evacuation insurance',
  'Guide and driver gratuities',
  'Premium drinks and drinks not specifically listed',
  'Personal expenses such as laundry, telephone calls and shopping',
  'Optional activities not listed in the confirmed itinerary',
]

const commonMountainExclusions = [
  'International airfare to and from Tanzania',
  'Tanzanian visa and travel-document costs',
  'Travel, medical, evacuation and high-altitude insurance',
  'Personal climbing clothing, footwear, equipment and sleeping bag',
  'Guide, porter and cook gratuities',
  'Drinks, snacks and meals not specifically listed',
  'Personal expenses such as laundry, telephone calls and shopping',
  'Additional hotel nights, transfers or activities not listed in the confirmed itinerary',
]

const exclusionsBySlug = {
  'african-nights-and-circle-of-life-safari': [
    'International airfare to and from Tanzania',
    'Premium drinks and drinks not specifically listed',
    'Visas and travel documents',
    'Personal expenses including telephone calls, laundry and postage',
  ],
  'east-african-safari-and-beach-bliss': [
    'International airfare to Kilimanjaro International Airport and onward from Zanzibar',
    'Premium drinks and drinks not specifically listed',
    'Visas and travel documents',
    'Personal expenses including telephone calls, laundry and postage',
    'Optional Zanzibar activities not listed as included in the final quote',
  ],
  'lake-natron-oldoinyo-lengai': [
    'International airfare to and from Tanzania',
    'Tanzanian visa and travel-document costs',
    'Travel, medical, evacuation and mountain-rescue insurance',
    'Personal hiking clothing, footwear, equipment and sleeping bag',
    'Guide, driver and support-team gratuities',
    'Alcoholic and premium drinks not specifically listed',
    'Personal expenses and optional activities not listed in the confirmed itinerary',
  ],
  'marangu-route-hotel-stay': commonMountainExclusions,
  'mount-meru-trek': commonMountainExclusions,
  'northern-circuit-route': commonMountainExclusions,
  'northern-serengeti': commonSafariExclusions,
  'shira-plateau-day-hike': [
    'International and domestic airfare',
    'Tanzanian visa and travel-document costs',
    'Travel, medical and evacuation insurance',
    'Personal hiking clothing, footwear and equipment',
    'Guide and driver gratuities',
    'Accommodation, meals and transfers outside the confirmed day-hike package',
    'Personal expenses and optional activities',
  ],
  'tanzanian-traffic-jam-the-great-migration': [
    'International airfare to and from Tanzania',
    'Premium drinks and drinks not specifically listed',
    'Visas and travel documents',
    'Personal expenses including telephone calls, laundry and postage',
    'Any optional activity not listed in the final quote',
  ],
  'umbwe-route-hotel-stay': commonMountainExclusions,
}

const studioRequire = createRequire(resolve(repositoryRoot, 'studio/package.json'))
const studioSanityCli = studioRequire.resolve('sanity/cli')
const {getCliClient} = await import(pathToFileURL(studioSanityCli).href)
const client = getCliClient({apiVersion: '2026-10-20'}).withConfig({
  perspective: 'raw',
  useCdn: false,
})

const slugs = Object.keys(exclusionsBySlug)
const documents = await client.fetch(
  `*[_type == "trip" && slug.current in $slugs] {
    _id,
    title,
    "slug": slug.current,
    notIncluded
  } | order(slug asc, _id asc)`,
  {slugs},
)

const publishedSlugs = new Set(
  documents.filter(({_id}) => !_id.startsWith('drafts.')).map(({slug}) => slug),
)
const missingPublished = slugs.filter((slug) => !publishedSlugs.has(slug))
if (missingPublished.length) {
  throw new Error(`Missing published trips: ${missingPublished.join(', ')}`)
}

const changes = documents.flatMap((document) => {
  const after = exclusionsBySlug[document.slug]
  if (JSON.stringify(document.notIncluded ?? []) === JSON.stringify(after)) return []
  return [{
    _id: document._id,
    slug: document.slug,
    title: document.title,
    before: document.notIncluded ?? [],
    after,
  }]
})

if (!writeMode) {
  console.log(JSON.stringify({
    status: 'dry-run',
    publishedTrips: publishedSlugs.size,
    documentsToUpdate: changes.length,
    changes,
  }, null, 2))
  process.exit(0)
}

for (const change of changes) {
  await client.patch(change._id).set({notIncluded: change.after}).commit({visibility: 'sync'})
  console.log(`Updated exclusions: ${change.slug} (${change._id})`)
}

const verified = await client.fetch(
  `*[_type == "trip" && !(_id in path("drafts.**")) && slug.current in $slugs] {
    _id,
    "slug": slug.current,
    "exclusionCount": count(notIncluded)
  } | order(slug asc)`,
  {slugs},
)
const incomplete = verified.filter(({exclusionCount}) => exclusionCount < 1)
if (verified.length !== slugs.length || incomplete.length) {
  throw new Error('Post-write verification failed: one or more published trips has no exclusions.')
}

mkdirSync(reportDirectory, {recursive: true})
const reportPath = resolve(reportDirectory, 'trip-exclusions.json')
writeFileSync(reportPath, `${JSON.stringify({
  generatedAt: new Date().toISOString(),
  projectId: 'ife51h63',
  dataset: 'production',
  status: 'updated',
  publishedTrips: verified.length,
  updatedDocuments: changes.length,
  verified,
}, null, 2)}\n`)

console.log(`Exclusions update complete. Report: ${reportPath}`)
