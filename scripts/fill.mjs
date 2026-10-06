import * as cheerio from 'cheerio'
import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { extname } from 'node:path'

const ROOT = new URL('../', import.meta.url).pathname
const TEMPLATE = ROOT + 'templates/prispevok.html'
const SCRAPER = process.env.HOME + '/projects/sppk-redesign/scraper/'
const SOURCES = [SCRAPER + 'data-full/articles/', SCRAPER + 'data.bak-20260904/articles/']
/**
 * Article headers are missing from the detail page for older articles. Both the front
 * page listing and the category feeds carry them, and only the two together cover the
 * whole corpus, so both are indexed.
 */
const LISTING = new Map()
for (const item of JSON.parse(await readFile(SCRAPER + 'data-full/articles.json', 'utf8'))) {
  LISTING.set(item.id, item)
}
for (const page of JSON.parse(await readFile(SCRAPER + 'data-full/pages.json', 'utf8'))) {
  for (const item of page.items ?? []) if (!LISTING.has(item.id)) LISTING.set(item.id, item)
}

const MONTHS = [
  'januára', 'februára', 'marca', 'apríla', 'mája', 'júna',
  'júla', 'augusta', 'septembra', 'októbra', 'novembra', 'decembra',
]

/**
 * 830 of 4673 scraped articles carry a multi-line blob instead of a date, with the
 * real date buried inside it, so the date is extracted rather than matched whole.
 */
function formatDate(raw) {
  const match = raw?.match(/(\d{1,2})[./](\d{1,2})[./](\d{4})/)
  if (!match) return ''
  const [, day, month, year] = match
  return `${Number(day)}. ${MONTHS[Number(month) - 1]} ${year}`
}

const escapeHtml = (value) =>
  value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

const clean = (value) => (value ?? '').replace(/\s+/g, ' ').trim()
const isBlank = (text) => !text.replace(/ /g, ' ').trim()

const BLOCK = 'p, div, ul, ol, table, figure, h1, h2, h3, h4, h5, h6, blockquote'
const MEDIA = 'img, iframe, embed, object, video'

/** Spacer rows: the old layout used &nbsp; lines where CSS margins now do the work. */
function dropBlankParagraphs($) {
  $('p').each((_, el) => {
    const node = $(el)
    if (!node.find(MEDIA).length && isBlank(node.text())) node.remove()
  })
}

/**
 * Editors write body copy as <div> as often as <p>. Everything downstream — the
 * typography, the figure lifting, the perex — assumes paragraphs, so containers
 * are unwrapped and leaf divs become paragraphs before anything else runs.
 */
function normalizeBlocks($) {
  let changed = true
  while (changed) {
    changed = false
    $('div').each((_, el) => {
      const node = $(el)
      if (node.children(BLOCK).length) {
        node.replaceWith(node.contents())
        changed = true
      }
    })
  }
  $('div').each((_, el) => {
    const node = $(el)
    node.replaceWith($('<p></p>').append(node.contents()))
  })
  dropBlankParagraphs($)
}

/**
 * The perex is marked two different ways depending on the editor's era: bold, or a
 * dark-green <span style="color:#006400">, usually inside <big>. Both markers are
 * destroyed by cleanInlineStyles, so this has to run before it.
 */
function takeIntro($) {
  const first = $('p, figure, table').first()
  if (!first.length || !first.is('p')) return ''
  const text = clean(first.text())
  if (!text || first.find(MEDIA).length) return ''
  const marker = first.find('strong, b, big, span[style*="color"]').first()
  if (!marker.length) return ''
  // A single bolded word inside a normal paragraph is not a perex.
  if (clean(marker.text()).length < text.length * 0.8) return ''
  first.remove()
  return text
}

function cleanInlineStyles($) {
  $('[style], [align]').each((_, el) => {
    $(el).removeAttr('style').removeAttr('align')
  })
  // Legacy presentational tags the editors left behind.
  $('big, font, center').each((_, el) => $(el).replaceWith($(el).contents()))
  // Hard pixel sizing on tables blows out the mobile layout.
  $('table, td, th, col, colgroup').each((_, el) => {
    $(el).removeAttr('width').removeAttr('height').removeAttr('border').removeAttr('cellpadding')
  })
  // Word paste leaves MsoNormal and friends behind; the design supplies the styling.
  $('[class]').each((_, el) => {
    const node = $(el)
    const kept = (node.attr('class') ?? '')
      .split(/\s+/)
      .filter((name) => name && !/^Mso/i.test(name))
    if (kept.length) node.attr('class', kept.join(' '))
    else node.removeAttr('class')
  })
}

/** Folder and file names follow the structure the client delivered: no diacritics. */
function slugify(text) {
  return clean(text)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
}

/**
 * One folder per page with its own obrazky/, mirroring struktura/. The breadcrumb on
 * the live site is the section path.
 */
function pagePath(article) {
  const sections = (article.breadcrumb ?? [])
    .map((crumb) => crumb.label)
    .filter((label) => label && slugify(label) !== 'uvod')
    .map(slugify)
    .filter(Boolean)
  const leaf = slugify(article.title) || `clanok-${article.id}`
  return [...sections, leaf].join('/')
}

/**
 * Images live next to the page as struktura/ does, so the folder can be opened from
 * disk. imgur rejects requests without a browser user-agent.
 */
async function localiseImages($, dir) {
  const targets = $('.doc-figure img[src^="http"]').toArray()
  if (!targets.length) return 0
  await mkdir(dir + '/obrazky', { recursive: true })
  let saved = 0
  for (const [index, img] of targets.entries()) {
    const node = $(img)
    const src = node.attr('src')
    const name = `${String(index + 1).padStart(2, '0')}${extname(new URL(src).pathname) || '.jpg'}`
    try {
      const response = await fetch(src, { headers: { 'user-agent': 'Mozilla/5.0' } })
      if (!response.ok) throw new Error(String(response.status))
      await writeFile(`${dir}/obrazky/${name}`, Buffer.from(await response.arrayBuffer()))
      node.attr('src', `obrazky/${name}`)
      saved++
    } catch (error) {
      console.warn(`  obrazok ${src}: ${error.message}, ostava povodna adresa`)
    }
  }
  return saved
}

const OWN_HOSTS = ['sppk.sk', 'www.sppk.sk']

/** Links off the chamber's own site open in a new tab and carry an outbound marker. */
function markExternalLinks($) {
  $('a[href]').each((_, el) => {
    const node = $(el)
    const href = (node.attr('href') ?? '').trim()
    if (!/^https?:\/\//i.test(href)) return
    let host = ''
    try {
      host = new URL(href).hostname
    } catch {
      return
    }
    if (OWN_HOSTS.includes(host)) return
    node.addClass('external')
    node.attr('target', '_blank')
    node.attr('rel', 'noopener noreferrer')
  })
}

/** The live site puts "Zdroj: X" as a trailing line of body copy, not a field. */
function extractSource($) {
  for (const el of $('p').toArray().reverse().slice(0, 3)) {
    const match = clean($(el).text()).match(/^Zdroj:\s*(.+)$/i)
    if (match) {
      $(el).remove()
      return match[1].trim()
    }
  }
  return ''
}

/**
 * Images and video embeds on sppk.sk sit inside paragraphs with hard pixel sizes.
 * Lifting them into standalone figures is what keeps body copy continuous instead
 * of wrapping. A linked image keeps its anchor, otherwise the link is lost when the
 * emptied paragraph is dropped.
 */
function liftMedia($) {
  $(MEDIA).each((_, node) => {
    const el = $(node)
    if (el.closest('.doc-figure').length) return
    el.removeAttr('style').removeAttr('align').removeAttr('hspace').removeAttr('vspace')
    el.removeAttr('border')
    if (el.is('img')) el.removeAttr('width').removeAttr('height')
    const anchor = el.parent('a')
    const lifted = anchor.length && clean(anchor.text()) === '' ? anchor : el
    const figure = $('<figure class="doc-figure"></figure>').append(lifted.clone())
    const parent = el.closest('p')
    if (parent.length) {
      parent.before(figure)
      lifted.remove()
    } else {
      lifted.replaceWith(figure)
    }
  })
  dropBlankParagraphs($)
  $('.doc-figure img').each((index, img) => {
    if (index > 0) $(img).attr('loading', 'lazy')
    if (!$(img).attr('alt')) $(img).attr('alt', '')
  })
}

/**
 * The old editor has no heading button, so section headings are written as a short
 * fully-bold paragraph. Promoting them is what makes the design's green
 * .doc-subheading appear at all — but a bolded sentence or a bolded link is not a
 * heading, so those are left alone.
 */
function promoteSubheadings($) {
  $('p').each((_, el) => {
    const node = $(el)
    const text = clean(node.text())
    const bold = node.children('strong, b')
    if (bold.length !== 1 || node.children().length !== 1) return
    if (!text || text.length > 100 || clean(bold.text()) !== text) return
    if (/[.!?]$/.test(text) || /https?:|www\.|@/.test(text)) return
    if (node.find('a').length) return
    node.replaceWith($('<h2 class="doc-subheading"></h2>').append(bold.contents()))
  })
}

/** The page already has an h1; body headings from the CMS must not compete with it. */
function demoteHeadings($) {
  $('h1').each((_, el) => {
    const node = $(el)
    node.replaceWith($('<h2></h2>').append(node.contents()))
  })
}

/** Wide legacy tables scroll inside their own box instead of the page. */
function wrapTables($) {
  $('table').each((_, el) => {
    const node = $(el)
    if (node.parent('.doc-table').length) return
    node.wrap('<div class="doc-table"></div>')
  })
}

async function build(id) {
  // The first data-full pass wrote empty headers for some articles; prefer whichever
  // source actually has a title.
  let article = null
  for (const base of SOURCES) {
    if (!existsSync(base + id + '.json')) continue
    const candidate = JSON.parse(await readFile(base + id + '.json', 'utf8'))
    if (!article || (!article.title && candidate.title)) article = candidate
    if (article.title) break
  }
  if (!article) throw new Error(`article ${id}: not found in scraper data`)
  // Older articles carry no header on the detail page; the listing row has it.
  const row = LISTING.get(id)
  for (const key of ['title', 'date', 'author']) {
    if (!article[key] && row?.[key]) article[key] = row[key]
  }
  const date = formatDate(article.date) || formatDate(row?.date)
  if (!clean(article.html)) {
    console.warn(`POZOR ukazka-${id}: článok nemá na sppk.sk žiadne telo, stránka bude prázdna`)
  }

  const $ = cheerio.load(article.html, null, false)
  normalizeBlocks($)
  const intro = takeIntro($)
  cleanInlineStyles($)
  const source = extractSource($)
  liftMedia($)
  promoteSubheadings($)
  demoteHeadings($)
  wrapTables($)
  markExternalLinks($)

  const meta = [clean(article.author), date, source ? `Zdroj: ${source}` : '']
    .filter(Boolean)
    // inline-block keeps a segment on one line unless it alone is too long.
    .map((part) => `<span class="doc-meta-item">${escapeHtml(part)}</span>`)
    .join('<span class="doc-meta-sep">•</span>')

  const dir = `${process.env.OUT_DIR ?? ROOT + 'stranky'}/${pagePath(article)}`
  const images = process.env.SKIP_IMAGES ? 0 : await localiseImages($, dir)

  const body = $.html()
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => '          ' + line)
    .join('\n')

  const html = (await readFile(TEMPLATE, 'utf8'))
    // Function replacements: article copy contains $ and ' sequences that would
    // otherwise be read as replacement patterns.
    .replaceAll('{{TITLE}}', () => escapeHtml(article.title))
    .replace('{{META}}', () => meta)
    .replace('{{INTRO}}', () => escapeHtml(intro))
    .replace('{{BODY}}', () => body)
    // Drop the intro block entirely when the article has no perex.
    .replace(/\s*<!-- Intro paragraph -->\n\s*<p class="doc-intro"><\/p>/, '')

  await mkdir(dir, { recursive: true })
  await writeFile(dir + '/index.html', html)
  console.log(
    `${pagePath(article)}/index.html — perex: ${intro ? 'áno' : 'nie'}, ` +
      `zdroj: ${source || '—'}, obrázky: ${images}`,
  )
}

const ids = process.argv.slice(2)
if (!ids.length) throw new Error('usage: node fill.mjs <article-id> [...]')
for (const id of ids) await build(id)
