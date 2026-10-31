import {createReadStream, mkdirSync, writeFileSync} from 'node:fs'
import {createRequire} from 'node:module'
import {dirname, resolve} from 'node:path'
import {fileURLToPath, pathToFileURL} from 'node:url'

const scriptDirectory = dirname(fileURLToPath(import.meta.url))
const repositoryRoot = resolve(scriptDirectory, '../..')
const reportDirectory = resolve(repositoryRoot, 'migration/reports')
const imagePath = resolve(repositoryRoot, 'public/images/northern-serengeti-migration.webp')
const writeMode = process.env.BETHELI_NORTHERN_SERENGETI_IMAGE_WRITE === '1'

const studioRequire = createRequire(resolve(repositoryRoot, 'studio/package.json'))
const studioSanityCli = studioRequire.resolve('sanity/cli')
const {getCliClient} = await import(pathToFileURL(studioSanityCli).href)
const client = getCliClient({apiVersion: '2026-10-31'}).withConfig({
  perspective: 'raw',
  useCdn: false,
})

const candidates = await client.fetch(
  `*[_type == "trip" && !(_id in path("drafts.**")) && (
    slug.current == "northern-serengeti" ||
    title match "*Northern Serengeti*"
  )] {
    _id,
    title,
    "slug": slug.current,
    "currentHeroAsset": heroImage.asset._ref,
    "currentCardAsset": cardImage.asset._ref,
    "currentShareAsset": seo.shareImage.asset._ref
  } | order(_updatedAt desc)`,
)

const trip = candidates[0]

if (!trip?._id) throw new Error('Missing published Northern Serengeti trip matching the title or canonical slug')

const report = {
  generatedAt: new Date().toISOString(),
  status: writeMode ? 'written' : 'dry-run',
  trip,
  replacement: {
    filename: 'northern-serengeti-migration.webp',
    alt: 'Great Migration wildebeest in the Northern Serengeti',
  },
}

if (writeMode) {
  const asset = await client.assets.upload('image', createReadStream(imagePath), {
    filename: 'northern-serengeti-migration.webp',
  })
  const contentImage = {
    _type: 'image',
    asset: {_type: 'reference', _ref: asset._id},
    alt: report.replacement.alt,
  }

  await client
    .patch(trip._id)
    .set({
      heroImage: contentImage,
      cardImage: contentImage,
      'seo.shareImage': contentImage,
    })
    .commit({visibility: 'sync'})

  report.replacement.assetId = asset._id
  console.log(`Updated Northern Serengeti imagery: ${trip._id}`)
}

mkdirSync(reportDirectory, {recursive: true})
const reportPath = resolve(reportDirectory, 'northern-serengeti-image.json')
writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`)
console.log(JSON.stringify(report, null, 2))
console.log(`Report: ${reportPath}`)
