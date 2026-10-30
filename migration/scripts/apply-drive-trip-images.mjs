import {createReadStream, mkdirSync, writeFileSync} from 'node:fs'
import {createRequire} from 'node:module'
import {dirname, resolve} from 'node:path'
import {fileURLToPath, pathToFileURL} from 'node:url'

const scriptDirectory = dirname(fileURLToPath(import.meta.url))
const repositoryRoot = resolve(scriptDirectory, '../..')
const reportDirectory = resolve(repositoryRoot, 'migration/reports')
const writeMode = process.env.BETHELI_DRIVE_IMAGES_WRITE === '1'

const image = (filename, alt) => ({filename, alt})

const routeTrips = {
  'northern-circuit-route': {
    hero: image('northern-circuit-hero.webp', 'Trekkers crossing Kilimanjaro on the Northern Circuit'),
    overview: [
      image('northern-circuit-trail.webp', 'Trekkers on the Northern Circuit trail'),
      image('northern-circuit-rainforest.webp', 'Trekkers in Kilimanjaro rainforest'),
      image('lemosho-shira-plateau.webp', 'Trekkers crossing the Shira Plateau'),
    ],
    days: ['northern-circuit-rainforest.webp', 'lemosho-shira-plateau.webp', 'northern-circuit-trail.webp', 'lemosho-moorland.webp', 'umbwe-alpine.webp', 'northern-circuit-hero.webp', 'umbwe-camp.webp', 'marangu-summit.webp', 'marangu-trail.webp'],
  },
  'marangu-route-hotel-stay': {
    hero: image('marangu-hero.webp', 'Trekkers on the Marangu Route'),
    overview: [
      image('marangu-huts.webp', 'Mountain huts on the Marangu Route'),
      image('marangu-trail.webp', 'Trekkers crossing the Marangu landscape'),
      image('marangu-rainforest.webp', 'Trekkers in the Marangu rainforest'),
    ],
    days: ['marangu-rainforest.webp', 'marangu-trail.webp', 'marangu-huts.webp', 'marangu-trail.webp', 'marangu-summit.webp', 'marangu-rainforest.webp', 'marangu-trail.webp', 'marangu-hero.webp'],
  },
  'umbwe-route-hotel-stay': {
    hero: image('umbwe-hero.webp', 'Trekkers high on the Umbwe Route'),
    overview: [
      image('umbwe-trail.webp', 'Trekkers on the Umbwe trail'),
      image('umbwe-alpine.webp', 'Trekkers in Kilimanjaro alpine desert'),
      image('umbwe-rainforest.webp', 'The Umbwe rainforest trail'),
    ],
    days: ['umbwe-rainforest.webp', 'umbwe-trail.webp', 'umbwe-camp.webp', 'umbwe-alpine.webp', 'umbwe-camp.webp', 'marangu-summit.webp', 'marangu-trail.webp', 'umbwe-hero.webp'],
  },
  'shira-plateau-day-hike': {
    hero: image('lemosho-shira-plateau.webp', 'Trekkers crossing the Shira Plateau'),
    overview: [
      image('lemosho-hero.webp', 'Trekkers beneath Kilimanjaro on the western route'),
      image('lemosho-moorland.webp', 'Trekkers crossing Kilimanjaro moorland'),
    ],
    days: ['lemosho-shira-plateau.webp'],
  },
}

const safariDays = [
  'safari-guides.webp',
  'safari-road.webp',
  'safari-vehicle.webp',
  'safari-crater-road.webp',
  'safari-flamingos.webp',
  'safari-picnic.webp',
  'safari-viewpoint.webp',
  'safari-community.webp',
  'safari-migration.webp',
  'safari-team.webp',
]

const safariTrips = [
  'african-nights-and-circle-of-life-safari',
  'east-african-safari-and-beach-bliss',
  'tanzanian-traffic-jam-the-great-migration',
]

const studioRequire = createRequire(resolve(repositoryRoot, 'studio/package.json'))
const studioSanityCli = studioRequire.resolve('sanity/cli')
const {getCliClient} = await import(pathToFileURL(studioSanityCli).href)
const client = getCliClient({apiVersion: '2026-10-29'}).withConfig({
  perspective: 'raw',
  useCdn: false,
})

const slugs = [...Object.keys(routeTrips), ...safariTrips]
const documents = await client.fetch(
  `*[_type == "trip" && !(_id in path("drafts.**")) && slug.current in $slugs] {
    _id,
    title,
    "slug": slug.current,
    itinerary,
    heroImage,
    seo
  }`,
  {slugs},
)

const missing = slugs.filter((slug) => !documents.some((document) => document.slug === slug))
if (missing.length) throw new Error(`Missing published trips: ${missing.join(', ')}`)

const files = new Set()
for (const config of Object.values(routeTrips)) {
  files.add(config.hero.filename)
  config.overview.forEach(({filename}) => files.add(filename))
  config.days.forEach((filename) => files.add(filename))
}
safariDays.forEach((filename) => files.add(filename))

const assetDirectory = resolve(repositoryRoot, 'public/images/drive-library')
const localAssets = [...files].map((filename) => ({
  filename,
  path: resolve(assetDirectory, filename),
}))

if (!writeMode) {
  console.log(JSON.stringify({
    status: 'dry-run',
    tripsToUpdate: documents.map(({slug, title}) => ({slug, title})),
    assetsToUpload: localAssets.map(({filename}) => filename),
  }, null, 2))
  process.exit(0)
}

const uploaded = new Map()
for (const {filename, path} of localAssets) {
  const asset = await client.assets.upload('image', createReadStream(path), {filename})
  uploaded.set(filename, asset._id)
  console.log(`Uploaded ${filename}`)
}

const contentImage = ({filename, alt}) => ({
  _type: 'image',
  asset: {_type: 'reference', _ref: uploaded.get(filename)},
  alt,
})

const dayImage = (filename, title) => contentImage({filename, alt: title})

for (const document of documents) {
  const route = routeTrips[document.slug]
  const dayFiles = route?.days ?? safariDays
  const itinerary = (document.itinerary ?? []).map((entry, index) => ({
    ...entry,
    image: dayImage(dayFiles[index % dayFiles.length], `${document.title} — day ${index + 1}`),
  }))

  const patch = {
    itinerary,
    ...(route ? {} : {cardImage: document.heroImage}),
  }
  if (route) {
    const heroImage = contentImage(route.hero)
    patch.cardImage = heroImage
    patch.heroImage = heroImage
    patch.overviewImages = route.overview.map(contentImage)
    patch.seo = {...document.seo, _type: 'seo', shareImage: heroImage}
  }

  await client.patch(document._id).set(patch).commit({visibility: 'sync'})
  console.log(`Updated trip images: ${document.slug}`)
}

const verified = await client.fetch(
  `*[_type == "trip" && !(_id in path("drafts.**")) && slug.current in $slugs] {
    "slug": slug.current,
    "hasHero": defined(heroImage.asset),
    "hasCard": defined(cardImage.asset),
    "overviewCount": count(overviewImages[defined(asset)]),
    "dayCount": count(itinerary),
    "daysWithImages": count(itinerary[defined(image.asset)])
  } | order(slug asc)`,
  {slugs},
)

const incomplete = verified.filter((trip) => !trip.hasHero || !trip.hasCard || trip.overviewCount < 1 || trip.daysWithImages !== trip.dayCount)
if (incomplete.length) throw new Error(`Post-write verification failed: ${JSON.stringify(incomplete)}`)

mkdirSync(reportDirectory, {recursive: true})
const reportPath = resolve(reportDirectory, 'drive-trip-images.json')
writeFileSync(reportPath, `${JSON.stringify({
  generatedAt: new Date().toISOString(),
  status: 'updated',
  uploadedAssets: [...uploaded.keys()],
  verified,
}, null, 2)}\n`)
console.log(`Drive image update complete. Report: ${reportPath}`)
