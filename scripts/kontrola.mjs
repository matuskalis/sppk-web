import { readdir, readFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { join, dirname, resolve } from 'node:path'

// Post-build check. Every defect it looks for is one that already shipped once.

const ROOT = new URL('../', import.meta.url).pathname
const OUT = ROOT + 'web'

const pages = []
async function walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name)
    if (entry.isDirectory()) await walk(full)
    else if (entry.name === 'index.html') pages.push(full)
  }
}
await walk(OUT)

const problems = []
const seenPaths = new Map()
let links = 0
let images = 0

for (const file of pages) {
  const html = await readFile(file, 'utf8')
  const dir = dirname(file)

  // 1. every relative and root-relative reference must resolve on disk
  for (const match of html.matchAll(/\b(href|src)="([^"]+)"/g)) {
    let value
    try {
      value = decodeURIComponent(match[2])
    } catch {
      value = match[2]
    }
    if (/^(https?:|mailto:|tel:|#|data:)/.test(value)) continue
    match[1] === 'src' ? images++ : links++
    const target = value.startsWith('/') ? join(OUT, value) : resolve(dir, value)
    if (!existsSync(target)) problems.push(`rozbitý odkaz  ${file} -> ${value}`)
  }

  // 2. inline component scripts must parse
  for (const script of html.matchAll(/<script>([\s\S]*?)<\/script>/g)) {
    try {
      new Function(script[1])
    } catch (error) {
      problems.push(`rozbitý JS     ${file}: ${error.message}`)
    }
  }

  // 3. leftovers from the old CMS that must never reach the output
  if (/\[email\s*(&nbsp;)?protected\]/i.test(html)) problems.push(`skrytý mail    ${file}`)
  if (/file:\/\/\//.test(html)) problems.push(`wordovský súbor ${file}`)
  if (/class="[^"]*\bMso[A-Z]/.test(html)) problems.push(`wordovská trieda ${file}`)

  // 4. two articles must never share a folder (macOS compares case-insensitively)
  const key = file.toLowerCase()
  if (seenPaths.has(key)) problems.push(`kolízia cesty  ${file}`)
  seenPaths.set(key, file)
}

// 5. a generated page nobody links to is a page nobody will ever see
const linked = new Set()
for (const file of pages) {
  const html = await readFile(file, 'utf8')
  const dir = dirname(file)
  for (const match of html.matchAll(/\bhref="([^"]+)"/g)) {
    let value
    try {
      value = decodeURIComponent(match[1])
    } catch {
      continue
    }
    if (/^(https?:|mailto:|tel:|#|data:)/.test(value)) continue
    linked.add(value.startsWith('/') ? join(OUT, value) : resolve(dir, value))
  }
}
const orphans = pages.filter((file) => !linked.has(file) && file !== join(OUT, 'index.html'))

console.log(`stránok ${pages.length} | odkazov ${links} | obrázkov ${images}`)
console.log(`stránok bez jediného odkazu: ${orphans.length}`)
for (const orphan of orphans.slice(0, 10)) console.log(`  ${orphan.replace(OUT + '/', '')}`)

if (problems.length) {
  console.log(`\nCHYBY: ${problems.length}`)
  for (const problem of problems.slice(0, 20)) console.log(`  ${problem}`)
  process.exit(1)
}
console.log('\nBEZ CHÝB')
