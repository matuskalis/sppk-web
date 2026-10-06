import { readFile, writeFile, readdir, mkdir, copyFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { join, dirname } from 'node:path'

// imgur is unreachable from this network (the TLS chain does not verify), so the
// portraits that an earlier build already downloaded are recovered from a previous
// archive instead. People are matched by name, not by position, because the order of
// sections on the office page changed.
//
//   node scripts/portrety-z-archivu.mjs <rozbalený starý web>

const ROOT = new URL('../', import.meta.url).pathname
const OUT = ROOT + 'web'
const OLD = process.argv[2]
if (!OLD) throw new Error('usage: node scripts/portrety-z-archivu.mjs <cesta k starému web/>')

const PAGES = [
  'kontakt/urad komory',
  'kontakt/predstavenstvo SPPK',
  'kontakt/dozorna rada SPPK',
  'kontakt/piami clenovia',
  'kontakt/zvazy, zdruzenia, unie',
  'media/hovorca',
]

const portraits = (html) => {
  const found = new Map()
  for (const match of html.matchAll(/<img src="(obrazky\/portret-[^"]+)" alt="([^"]*)"/g)) {
    if (match[2].trim()) found.set(match[2].trim(), match[1])
  }
  return found
}

const pending = []
let restored = 0
let missing = 0

for (const page of PAGES) {
  const oldFile = join(OLD, page, 'index.html')
  const newFile = join(OUT, page, 'index.html')
  if (!existsSync(oldFile) || !existsSync(newFile)) continue

  const byName = portraits(await readFile(oldFile, 'utf8'))
  let html = await readFile(newFile, 'utf8')
  let index = 0

  html = html.replaceAll(/<img src="(https?:\/\/[^"]+)" alt="([^"]*)"/g, (whole, url, name) => {
    const source = byName.get(name.trim())
    if (!source) {
      missing++
      return whole
    }
    const target = `obrazky/portret-${++index}${source.slice(source.lastIndexOf('.'))}`
    pending.push([join(OLD, page, source), join(OUT, page, target)])
    restored++
    return `<img src="${target}" alt="${name}"`
  })

  await writeFile(newFile, html)
}

// copies are queued so the regex stays synchronous
async function flush() {
  for (const [from, to] of pending) {
    await mkdir(dirname(to), { recursive: true })
    await copyFile(from, to)
  }
}
await flush()

console.log(`portrétov obnovených: ${restored}, bez zhody podľa mena: ${missing}`)
