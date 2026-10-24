import {randomUUID} from 'node:crypto'
import {readFileSync, mkdirSync, writeFileSync} from 'node:fs'
import {createRequire} from 'node:module'
import {dirname, resolve} from 'node:path'
import {fileURLToPath, pathToFileURL} from 'node:url'

import {suppliedItinerariesSource} from '../supplied-itineraries-source.mjs'

const scriptDirectory = dirname(fileURLToPath(import.meta.url))
const repositoryRoot = resolve(scriptDirectory, '../..')
const reportDirectory = resolve(repositoryRoot, 'migration/reports')
const placeholderPath = resolve(repositoryRoot, 'public/images/trips-hero-serengeti.webp')
const placeholderFilename = 'betheli-temporary-itinerary-placeholder.webp'
const alt = 'Temporary Tanzania safari landscape placeholder — to be replaced with client photography.'

const studioRequire = createRequire(resolve(repositoryRoot, 'studio/package.json'))
const studioSanityCli = studioRequire.resolve('sanity/cli')
const {getCliClient} = await import(pathToFileURL(studioSanityCli).href)
const client = getCliClient({apiVersion: '2026-10-20'}).withConfig({perspective: 'raw', useCdn: false})

const tripSlugs = suppliedItinerariesSource.trips.map(({slug}) => slug)
const drafts = await client.fetch(
  '*[_type == "trip" && _id in path("drafts.**") && slug.current in $tripSlugs]{_id, _type, slug, seo}',
  {tripSlugs},
)

if (drafts.length !== tripSlugs.length) {
  const found = new Set(drafts.map((document) => document.slug?.current))
  const missing = tripSlugs.filter((slug) => !found.has(slug))
  throw new Error(`Missing supplied itinerary drafts: ${missing.join(', ')}`)
}

const existingAsset = await client.fetch(
  '*[_type == "sanity.imageAsset" && originalFilename == $filename][0]{_id}',
  {filename: placeholderFilename},
)
const asset = existingAsset || await client.assets.upload('image', readFileSync(placeholderPath), {
  filename: placeholderFilename,
  contentType: 'image/webp',
})

const imageValue = () => ({
  _type: 'image',
  asset: {_type: 'reference', _ref: asset._id},
  alt,
  hotspot: {x: 0.5, y: 0.5, height: 1, width: 1},
})

const published = []
for (const draft of drafts) {
  const draftId = draft._id
  const publishedId = draftId.replace(/^drafts\./, '')
  const enriched = {
    heroImage: imageValue(),
    overviewImages: [{...imageValue(), _key: `placeholder-${randomUUID()}`}],
    seo: {...draft.seo, shareImage: imageValue()},
  }

  await client.patch(draftId).set(enriched).commit()
  const fullDraft = await client.getDocument(draftId)
  if (!fullDraft) throw new Error(`Could not read updated draft: ${draftId}`)

  const document = {...fullDraft}
  delete document._rev
  delete document._createdAt
  delete document._updatedAt
  await client.createOrReplace({...document, _id: publishedId})
  published.push({slug: draft.slug.current, draftId, publishedId, assetId: asset._id})
}

mkdirSync(reportDirectory, {recursive: true})
const reportPath = resolve(reportDirectory, 'supplied-itineraries-placeholder-publish.json')
writeFileSync(reportPath, `${JSON.stringify({
  generatedAt: new Date().toISOString(),
  projectId: 'ife51h63',
  dataset: 'production',
  placeholder: {assetId: asset._id, filename: placeholderFilename, alt},
  published,
}, null, 2)}\n`)

console.log(`Published ${published.length} supplied itineraries with a temporary placeholder image.`)
console.log(`Report: ${reportPath}`)
