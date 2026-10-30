import {readdirSync, renameSync, statSync} from 'node:fs'
import {extname, join} from 'node:path'
import {spawnSync} from 'node:child_process'
import {fileURLToPath} from 'node:url'

const imageRoot = fileURLToPath(new URL('../../public/images/', import.meta.url))
const maximumBytes = 250_000
const supportedExtensions = new Set(['.jpg', '.jpeg', '.png', '.webp'])

function walk(directory) {
  return readdirSync(directory, {withFileTypes: true}).flatMap((entry) => {
    const path = join(directory, entry.name)
    return entry.isDirectory() ? walk(path) : [path]
  })
}

function runMagick(source, target, args) {
  const result = spawnSync('magick', [source, '-auto-orient', ...args, target], {stdio: 'inherit'})
  if (result.status !== 0) throw new Error(`ImageMagick failed for ${source}`)
}

const oversized = walk(imageRoot)
  .filter((path) => supportedExtensions.has(extname(path).toLowerCase()))
  .filter((path) => statSync(path).size > maximumBytes)

for (const path of oversized) {
  const extension = extname(path).toLowerCase()
  const temporary = path.replace(new RegExp(`${extension.replace('.', '\\.')}?$`), `.optimized${extension}`)

  if (extension === '.png') {
    const attempts = [
      ['-resize', '1920x1920>', '-strip', '-colors', '256', '-define', 'png:compression-level=9'],
      ['-resize', '1600x1600>', '-strip', '-colors', '192', '-define', 'png:compression-level=9'],
      ['-resize', '1400x1400>', '-strip', '-colors', '128', '-define', 'png:compression-level=9'],
      ['-resize', '1200x1200>', '-strip', '-colors', '96', '-define', 'png:compression-level=9'],
      ['-resize', '1000x1000>', '-strip', '-colors', '64', '-define', 'png:compression-level=9'],
      ['-resize', '900x900>', '-strip', '-colors', '48', '-define', 'png:compression-level=9'],
      ['-resize', '800x800>', '-strip', '-colors', '40', '-define', 'png:compression-level=9'],
    ]
    for (const args of attempts) {
      runMagick(path, temporary, args)
      if (statSync(temporary).size <= maximumBytes) break
    }
  } else {
    const attempts = [
      ['-resize', '1920x1920>', '-strip', '-quality', '78'],
      ['-resize', '1600x1600>', '-strip', '-quality', '70'],
      ['-resize', '1400x1400>', '-strip', '-quality', '62'],
      ['-resize', '1200x1200>', '-strip', '-quality', '54'],
      ['-resize', '1000x1000>', '-strip', '-quality', '48'],
    ]
    for (const args of attempts) {
      runMagick(path, temporary, args)
      if (statSync(temporary).size <= maximumBytes) break
    }
  }

  const optimizedSize = statSync(temporary).size
  if (optimizedSize > maximumBytes) {
    throw new Error(`Could not reduce ${path} below ${maximumBytes} bytes (got ${optimizedSize})`)
  }
  renameSync(temporary, path)
  console.log(`Optimized ${path} -> ${optimizedSize} bytes`)
}

const remaining = walk(imageRoot)
  .filter((path) => supportedExtensions.has(extname(path).toLowerCase()))
  .filter((path) => statSync(path).size > maximumBytes)

if (remaining.length) throw new Error(`Oversized images remain:\n${remaining.join('\n')}`)
console.log(`Verified all public raster images are at or below ${maximumBytes} bytes.`)
