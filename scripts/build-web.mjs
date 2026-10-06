import { readFile, writeFile, mkdir, readdir, copyFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { join, relative, extname } from 'node:path'

// Walks the folder structure the client delivered and writes one index.html per
// folder, filled with the matching real content from the scraper where there is any.

const ROOT = new URL('../', import.meta.url).pathname
const STRUCTURE = ROOT + 'struktura'
const OUT = ROOT + 'web'
const CACHE = ROOT + '.cache-portrety'
const SCRAPER = process.env.HOME + '/projects/sppk-redesign/scraper/data-full/'
const ORIGIN = 'https://www.sppk.sk'

const COMPONENTS = new Set(['Header', 'Footer', 'Menu', 'tretina'])

/** Gallery subsection the client's structure has no folder for. */
const VIDEO_FOLDER = 'Videoarchív SPPK'

const slug = (text) =>
  (text ?? '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

/** Folder names come in lowercase without diacritics; at least start them upper. */
const pretty = (name) => (name ?? '').charAt(0).toUpperCase() + (name ?? '').slice(1)

const clean = (t) => (t ?? '').replace(/\s+/g, ' ').trim()

/** Listing rows were scraped as rendered text, so they carry Cloudflare's placeholder. */
const stripHidden = (t) => clean(t).replace(/\[email\s*(&nbsp;)?protected\]/gi, '').replace(/\s{2,}/g, ' ').trim()

const escape = (t) =>
  (t ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

const MONTHS = ['januára','februára','marca','apríla','mája','júna','júla','augusta','septembra','októbra','novembra','decembra']
const formatDate = (raw) => {
  const m = raw?.match(/(\d{1,2})[./](\d{1,2})[./](\d{4})/)
  return m ? `${Number(m[1])}. ${MONTHS[Number(m[2]) - 1]} ${m[3]}` : ''
}

// ── data ──────────────────────────────────────────────────────────────────────
const pages = JSON.parse(await readFile(SCRAPER + 'pages.json', 'utf8'))
const albums = JSON.parse(await readFile(SCRAPER + 'galeria.json', 'utf8'))
const listing = JSON.parse(await readFile(SCRAPER + 'articles.json', 'utf8'))

const articleTitles = new Map()
const articlesById = new Map()
for (const file of await readdir(SCRAPER + 'articles')) {
  const article = JSON.parse(await readFile(SCRAPER + 'articles/' + file, 'utf8'))
  articlesById.set(article.id, article)
  if (article.title) articleTitles.set(slug(article.title), article)
}
const listingById = new Map(listing.map((item) => [item.id, item]))
for (const page of pages) for (const item of page.items ?? []) if (!listingById.has(item.id)) listingById.set(item.id, item)

const pageBySlug = new Map()
for (const page of pages) {
  if (page.type !== 'content' && page.type !== 'category') continue
  const keys = [slug(page.href.replace(/^\//, '')), slug(page.title)]
  for (const key of keys) if (key && !pageBySlug.has(key)) pageBySlug.set(key, page)
}
const albumBySlug = new Map(albums.map((a) => [slug(a.title), a]))

/** Folder names carry typos the real URLs do not, so an exact miss falls back to
 *  the closest key by trigram overlap. */
const yearsIn = (text) => (text.match(/\b(19|20)\d{2}\b/g) ?? []).join(',')

function closest(needle, keys, minScore) {
  const grams = (s) => new Set(Array.from({ length: Math.max(s.length - 2, 1) }, (_, i) => s.slice(i, i + 3)))
  const a = grams(needle)
  let best = null
  let bestScore = 0
  for (const key of keys) {
    // Trigrams cannot see the one digit that carries the meaning, so "za rok 2026"
    // would happily match "za rok 2020".
    if (yearsIn(needle) !== yearsIn(key)) continue
    const b = grams(key)
    let hits = 0
    for (const g of a) if (b.has(g)) hits++
    const score = (2 * hits) / (a.size + b.size)
    if (score > bestScore || (score === bestScore && key.length > (best?.length ?? 0))) {
      bestScore = score
      best = key
    }
  }
  return bestScore >= minScore ? best : null
}
const pageKeys = [...pageBySlug.keys()]
const articleKeys = [...articleTitles.keys()]
const albumKeys = [...albumBySlug.keys()]

// ── where every article page lands ────────────────────────────────────────────
/**
 * Titles become folder names as they read on sppk.sk. Path separators, the URI
 * reserved characters that would split a link into a query or fragment, and trailing
 * dots or spaces all have to go.
 */
const folderName = (title) =>
  clean(title)
    .replace(/[/\\?#&]/g, '-')
    .replace(/\s+/g, ' ')
    .slice(0, 120)
    .replace(/^[.\s]+|[.\s]+$/g, '')
    .trim() || 'clanok'

const folderBySlug = new Map()
const listingFolders = []
async function scanStructure(dir, parts) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    if (!entry.isDirectory() || entry.name === 'obrazky') continue
    const next = [...parts, entry.name]
    if (!COMPONENTS.has(next[0])) {
      // Shallowest wins, so a deep folder cannot shadow a top-level section.
      const key = slug(entry.name)
      if (!folderBySlug.has(key)) folderBySlug.set(key, next.join('/'))
      listingFolders.push(next)
    }
    await scanStructure(join(dir, entry.name), next)
  }
}

// ── shared chrome ─────────────────────────────────────────────────────────────
const homepage = await readFile(ROOT + 'design/html-kody/html-homepage/homepage.html', 'utf8')
const hpLines = homepage.split('\n')
const between = (from, to) => {
  const a = hpLines.findIndex((l) => l.includes(from))
  const b = hpLines.findIndex((l, i) => i > a && l.includes(to))
  return hpLines.slice(a, b).join('\n').trimEnd()
}
const baseCss = homepage.split('<style>')[1].split('</style>')[0]
const fonts = hpLines.filter((l) => l.includes('fonts.goog') || l.includes('fonts.gstatic')).join('\n')
const headerHtml = between('UPPER HEADER', 'HERO CAROUSEL')
const legalHtml = between('LEGAL FOOTER', '<script>')
const hpScript = homepage.split('<script>').pop().split('</script>')[0]
const takeFn = (name) => {
  const m = hpScript.match(new RegExp(`function ${name}\\([^)]*\\)\\s*\\{`))
  if (!m) return ''
  let depth = 0
  for (let j = m.index + m[0].length - 1; j < hpScript.length; j++) {
    if (hpScript[j] === '{') depth++
    else if (hpScript[j] === '}' && --depth === 0) return hpScript.slice(m.index, j + 1)
  }
  return ''
}
const chromeJs = 'let loginOpen = false;\nlet mobileOpen = false;\n' +
  ['toggleLogin','closeLogin','setNavActive','toggleMobileMenu','mobileNavClick'].map(takeFn).filter(Boolean).join('\n')

const PAGE_CSS = await readFile(ROOT + 'templates/_stranka.css', 'utf8')

// The delivered design ships this page's copy; nothing on sppk.sk matches it.
const charakteristika = await readFile(ROOT + 'design/charakteristika-sppk.html', 'utf8')
const CHARAKTERISTIKA = '  <article>\n' +
  charakteristika
    .split('<article>')[1].split('</article>')[0]
    .replace(/class="doc-para-\d"/g, 'class="doc-para"')
    .replace(/<h1 class="doc-title">/, '<h1 class="doc-title">')
    .trim() + '\n  </article>'

/**
 * Only the subpage itself. Header, menu and footer are separate files and get
 * merged in later, so nothing shared is baked into a page.
 */
function shell({ title, depth, breadcrumb, body }) {
  return `<!DOCTYPE html>
<html lang="sk">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escape(title)} — Slovenská poľnohospodárska a potravinárska komora</title>
${fonts}
  <style>
${baseCss}
${PAGE_CSS}
  </style>
</head>
<body>

<main class="page-section">

  <nav class="breadcrumb">${breadcrumb}</nav>

${body}

</main>

</body>
</html>
`
}

function crumbs(parts, depth) {
  const out = [`<a href="${'../'.repeat(depth)}index.html">Úvod</a>`]
  parts.forEach((part, i) => {
    const back = '../'.repeat(parts.length - 1 - i)
    const label = escape(part)
    out.push(i === parts.length - 1 ? label : `<a href="${back}index.html">${label}</a>`)
  })
  return out.join('<span>/</span>')
}

/** sppk.sk hides addresses behind Cloudflare; the real one is a XOR of the first byte. */
function decodeCfEmail(hex) {
  const bytes = Buffer.from(hex, 'hex')
  if (!bytes.length) return ''
  return [...bytes.slice(1)].map((b) => String.fromCharCode(b ^ bytes[0])).join('')
}

function revealEmails($) {
  $('a[href*="/cdn-cgi/l/email-protection"]').each((_, el) => {
    const node = $(el)
    const inner = node.find('[data-cfemail]').attr('data-cfemail')
    const fromHref = (node.attr('href') ?? '').split('#')[1]
    const address = decodeCfEmail(inner ?? fromHref ?? '')
    if (!address) return
    // A visible label that is not the placeholder is a split address ("jana." + rest).
    const label = node.text().replace(/\s+/g, ' ').trim()
    const visible = label && !/\[email\s*protected\]/i.test(label) ? label : address
    node.replaceWith($('<a></a>').attr('href', 'mailto:' + address).text(visible))
  })
  $('[data-cfemail]').each((_, el) => {
    const node = $(el)
    const address = decodeCfEmail(node.attr('data-cfemail') ?? '')
    if (address) node.replaceWith($('<a></a>').attr('href', 'mailto:' + address).text(address))
  })
}

/**
 * The old editor has no heading button, so section headings are written as a short
 * fully-bold paragraph. Promoting them is what makes the green secondary heading
 * appear at all — a bolded sentence or a bolded link is not a heading.
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

/** The page already has an h1; headings from the CMS must not compete with it. */
function demoteBodyHeadings($) {
  $('h1').each((_, el) => {
    const node = $(el)
    node.replaceWith($('<h2 class="doc-subheading"></h2>').append(node.contents()))
  })
}

// ── body builders ─────────────────────────────────────────────────────────────
const BLOCK = 'p, div, ul, ol, table, figure, h1, h2, h3, h4, h5, h6, blockquote'

async function articleBody(record, title) {
  const cheerio = await import('cheerio')
  const $ = cheerio.load(record.html || '', null, false)
  revealEmails($)
  $('[style], [align]').each((_, el) => $(el).removeAttr('style').removeAttr('align'))
  $('big, font, center').each((_, el) => $(el).replaceWith($(el).contents()))
  $('table, td, th').each((_, el) => $(el).removeAttr('width').removeAttr('height').removeAttr('border'))
  let changed = true
  while (changed) {
    changed = false
    $('div').each((_, el) => {
      const node = $(el)
      if (node.children(BLOCK).length) { node.replaceWith(node.contents()); changed = true }
    })
  }
  $('div').each((_, el) => $(el).replaceWith($('<p></p>').append($(el).contents())))
  $('p').each((_, el) => {
    const node = $(el)
    if (!node.find('img, iframe, embed, video').length && !node.text().replace(/ /g, ' ').trim()) node.remove()
  })
  $('img, iframe, embed, video').each((_, el) => {
    const node = $(el)
    node.removeAttr('style').removeAttr('width').removeAttr('height').removeAttr('align')
    const anchor = node.parent('a')
    const lifted = anchor.length && !anchor.text().trim() ? anchor : node
    const figure = $('<figure class="doc-figure"></figure>').append(lifted.clone())
    const parent = node.closest('p')
    if (parent.length) { parent.before(figure); lifted.remove() } else { lifted.replaceWith(figure) }
  })
  $('a[href^="http"]').each((_, el) => {
    const node = $(el)
    try {
      if (!/(^|\.)sppk\.sk$/.test(new URL(node.attr('href')).hostname)) {
        node.addClass('external').attr('target', '_blank').attr('rel', 'noopener noreferrer')
      }
    } catch {}
  })
  // Word paste left file:///C:/Users/... references behind; they are broken on the
  // live site too. Images go, links keep their text and become mailto: where they
  // clearly name an address.
  $('[src*="file:"]').each((_, el) => $(el).remove())
  $('[class*="Mso"]').each((_, el) => {
    const node = $(el)
    const kept = (node.attr('class') ?? '').split(/\s+/).filter((n) => n && !/^Mso/i.test(n))
    if (kept.length) node.attr('class', kept.join(' '))
    else node.removeAttr('class')
  })
  $('a[href*="file:"]').each((_, el) => {
    const node = $(el)
    const address = decodeURIComponent(node.attr('href')).match(/[\w.+-]+@[\w.-]+\.[a-z]{2,}/i)
    if (address) node.attr('href', 'mailto:' + address[0])
    else node.replaceWith(node.contents())
  })

  // Dead references pasted in over the years: blob URLs, about:blank, and plain text
  // that ended up in an href. None of them resolve anywhere, on our copy or theirs.
  $('[src^="blob:"], [src^="about:"]').each((_, el) => $(el).remove())
  // Facebook attribution markup rides along in pasted content.
  $('[attributionsrc]').each((_, el) => $(el).removeAttr('attributionsrc'))
  $('a[href]').each((_, el) => {
    const node = $(el)
    const value = clean(node.attr('href'))
    const dead = /^(blob:|about:|javascript:)/i.test(value)
    const notAUrl = value && !/^(https?:|mailto:|tel:|#|\/|\.)/i.test(value) && !/^[\w.-]+\.[a-z]{2,6}\//i.test(value)
    if (dead || notAUrl || !value) node.replaceWith(node.contents())
  })

  // Legacy copy carries site-relative, protocol-relative and even scheme-less URLs.
  $('[src], [href]').each((_, el) => {
    const node = $(el)
    for (const attr of ['src', 'href']) {
      const value = node.attr(attr)
      if (!value) continue
      if (value.startsWith('//')) node.attr(attr, 'https:' + value)
      else if (value.startsWith('/')) node.attr(attr, ORIGIN + value)
      else if (/^[\w.-]+\.[a-z]{2,6}\//i.test(value)) node.attr(attr, 'https://' + value)
    }
  })
  // A few authors are themselves a protected address the scraper only saw as a
  // placeholder; there is nothing to decode, so the field is dropped.
  const author = /\[email/i.test(record.author ?? '') ? '' : record.author
  promoteSubheadings($)
  demoteBodyHeadings($)

  const meta = [author, formatDate(record.date)].filter(Boolean)
    .map((part) => `<span class="doc-meta-item">${escape(part)}</span>`)
    .join('<span class="doc-meta-sep">•</span>')
  const empty = !$.html().trim()
  // 900 articles are visible to members only; the output has to say so.
  const members = record.membersOnly
    ? '    <p class="members-note">Tento text je na sppk.sk prístupný len prihláseným členom komory.</p>\n'
    : ''
  return `  <article>
    <h1 class="doc-title">${escape(title)}</h1>
    ${meta ? `<p class="doc-meta">${meta}</p>` : ''}
${members}
    <div class="doc-body">
${empty ? '      <p class="page-empty">Táto stránka zatiaľ nemá obsah.</p>' : $.html()}
    </div>
  </article>`
}

function listingBody(page, title, parts) {
  // Every row, otherwise the generated detail pages have no inbound link.
  const rows = (page.items ?? []).map((item) => {
    const row = listingById.get(item.id) ?? item
    // Link to the generated page when there is one, otherwise back to the live site.
    const target = articlePath.get(item.id)
    const href = target
      ? encodeURI(relative(parts.join('/'), target) + '/index.html')
      : `${ORIGIN}/clanok/${row.id}`
    return `      <article class="feed-card">
        <div class="feed-text">
          <div class="feed-date">${formatDate(row.date)}</div>
          <h3 class="feed-title"><a href="${href}">${escape(stripHidden(row.title))}</a></h3>
          <p class="feed-excerpt">${escape(stripHidden(row.excerpt))}</p>
          ${stripHidden(row.author) ? `<div class="feed-author">${escape(stripHidden(row.author))}</div>` : ''}
        </div>
        ${row.image ? `<a class="feed-thumb" href="${href}"><img src="${row.image.startsWith('http') ? row.image : ORIGIN + row.image}" alt="" loading="lazy" /></a>` : ''}
      </article>`
  }).join('\n')
  const total = page.items?.length ?? 0
  return `  <h1 class="page-title">${escape(title)}</h1>
  <p class="page-lead">${total} ${total === 1 ? 'článok' : total < 5 ? 'články' : 'článkov'} v tejto sekcii.</p>

  <section aria-label="Zoznam článkov">
${rows || '    <p class="page-empty">Sekcia zatiaľ nemá články.</p>'}
  </section>`
}

/**
 * The contact article is a stack of <table>s: a green header row naming the
 * department, then one cell per person (photo, bold name, role, phone, e-mail and a
 * "Pracovná náplň" list). That maps onto the cards in html-kontakt/kontakt-novy.html.
 */
async function contactBody(record, title, outDir, onlySection) {
  const cheerio = await import('cheerio')
  const $ = cheerio.load(record.html || '', null, false)
  revealEmails($)

  const sections = []
  $('table').each((_, table) => {
    const node = $(table)
    const heading = clean(node.find('th, td[colspan]').first().text())
    const cards = []
    node.find('td').each((_, cell) => {
      const td = $(cell)
      if (td.attr('colspan')) return
      const text = clean(td.text())
      if (!text) return

      const photo = td.find('img').attr('src') ?? null
      const name = clean(td.find('strong, b').first().text())
      const emails = td.find('a[href^="mailto:"]').toArray()
        .map((a) => $(a).attr('href').slice(7))
      const lines = td.text().split(/\n|<br\s*\/?>/).map(clean).filter(Boolean)

      const phones = []
      const duties = []
      let role = ''
      let inDuties = false
      for (const line of lines) {
        if (/^Pracovn[áa] n[áa]pl[ňn]/i.test(line)) { inDuties = true; continue }
        if (inDuties) {
          const duty = line.replace(/^[-–—•]\s*/, '')
          if (duty && duty !== line) duties.push(duty)
          continue
        }
        if (/^(mobil|tel\.?|telef[óo]n)/i.test(line)) { phones.push(line); continue }
        if (/^E-?mail/i.test(line)) continue
        if (!role && line !== name && !line.includes('@') && line.length < 90) role = line
      }
      if (!name && !emails.length && !phones.length) return
      cards.push({ photo, name, role, phones, emails, duties })
    })
    if (cards.length) sections.push({ heading, cards })
  })

  // Filter into a new array; `sections` is reused below and must not be aliased.
  const shown = onlySection ? sections.filter((s) => onlySection.test(s.heading)) : sections.slice()
  if (!shown.length) return null

  // Requested reading order: leadership, then the secretariat, then the departments,
  // with the press office last because it carries the spokesperson's contact.
  const rank = (heading) => {
    if (/^vedenie/i.test(heading)) return 0
    if (/sekretari/i.test(heading)) return 1
    if (/tla[čc]ov/i.test(heading)) return 3
    return 2
  }
  shown.sort((a, b) => rank(a.heading) - rank(b.heading))

  // Portraits are the point of this page, so they travel with it instead of being
  // fetched from imgur every time.
  await mkdir(join(outDir, 'obrazky'), { recursive: true })
  let saved = 0
  for (const person of shown.flatMap((s) => s.cards)) {
    if (!person.photo?.startsWith('http')) continue
    const name = `portret-${++saved}${extname(new URL(person.photo).pathname) || '.jpg'}`
    const file = join(outDir, 'obrazky', name)
    // Cached outside web/ so a rebuild does not re-download every portrait.
    const cached = join(CACHE, `${record.id}-${name}`)
    try {
      if (!existsSync(cached)) {
        const response = await fetch(person.photo, { headers: { 'user-agent': 'Mozilla/5.0' } })
        if (!response.ok) throw new Error(String(response.status))
        await writeFile(cached, Buffer.from(await response.arrayBuffer()))
      }
      await copyFile(cached, file)
      person.photo = `obrazky/${name}`
    } catch (error) {
      console.warn(`  portrét ${person.photo}: ${error.message}`)
    }
  }

  const initials = (name) =>
    name.split(/\s+/).filter((w) => /^[A-ZÁÄČĎÉÍĽĹŇÓÔŔŠŤÚÝŽ]/.test(w)).slice(-2)
      .map((w) => w[0]).join('') || 'SPPK'

  const card = (person) => `      <article class="card${person.photo ? ' card-portrait' : ''}">
        ${person.photo ? `<div class="portrait size-portrait"><img src="${escape(person.photo)}" alt="${escape(person.name)}" loading="lazy" /></div>` : ''}
        <div class="card-body">
          ${person.role ? `<p class="role-label">${escape(person.role)}</p>` : ''}
          ${person.name ? `<p class="person-name">${escape(person.name)}</p>` : ''}
          <div class="contact-stack">
${person.phones.map((phone) => `            <div class="contact-row"><span class="contact-value">${escape(phone)}</span></div>`).join('\n')}
${person.emails.map((mail) => `            <div class="contact-row"><span class="contact-label">E-mail:</span><a class="contact-email" href="mailto:${escape(mail)}">${escape(mail)}</a></div>`).join('\n')}
          </div>
          ${person.duties.length ? `<div class="duty-divider">
            <p class="duty-heading">Pracovná náplň</p>
            <ul class="duty-list">
${person.duties.map((duty) => `              <li><span class="duty-dash">–</span><span class="duty-text">${escape(duty)}</span></li>`).join('\n')}
            </ul>
          </div>` : ''}
        </div>
      </article>`

  const blocks = shown.map((section) => `    <section class="section">
      <div class="section-heading"><h2>${escape(section.heading || 'Kontakt')}</h2><div class="rule"></div></div>
${section.cards.map(card).join('\n')}
    </section>`).join('\n\n')

  return `  <div class="contact-page">
    <h1 class="page-title">${escape(title)}</h1>

${blocks}
  </div>`
}

function albumBody(album, title) {
  const tiles = album.thumbs.map((thumb, i) =>
    `      <a class="photo" href="${ORIGIN}${album.photoLinks[i] ?? album.href}"><img src="${ORIGIN}${thumb}" alt="" loading="lazy" /></a>`,
  ).join('\n')
  return `  <h1 class="page-title">${escape(title)}</h1>
  <p class="page-lead">${album.photos} fotografií</p>

  <section aria-label="Fotografie">
    <div class="photo-grid">
${tiles}
    </div>
  </section>`
}

/** Cards link to the folders that actually exist, not to the album titles on
 *  sppk.sk — the client renamed several of them. */
function galleryIndexBody(folders) {
  let photos = 0
  const cards = folders.map((folder) => {
    const key = slug(folder)
    const album = albumBySlug.get(key) ?? albumBySlug.get(closest(key, albumKeys, 0.45) ?? '')
    photos += album?.photos ?? 0
    return `      <a class="album-card" href="${encodeURI(folder)}/index.html">
        <div class="album-cover">${album ? `<img src="${ORIGIN}${album.cover}" alt="" loading="lazy" />` : ''}${album ? `<span class="album-count">${album.photos} obr.</span>` : ''}</div>
        <span class="album-title">${escape(folder)}</span>
      </a>`
  }).join('\n')
  return `  <h1 class="page-title">Galéria</h1>
  <p class="page-lead">${folders.length} albumov, ${photos} fotografií.</p>

  <section aria-label="Albumy">
    <div class="album-grid">
${cards}
    </div>
  </section>`
}

function sectionBody(title, children, depth) {
  const cards = children.map((child) =>
    `      <a class="section-card" href="${encodeURI(child)}/index.html">${escape(pretty(child))}</a>`,
  ).join('\n')
  return `  <h1 class="page-title">${escape(title)}</h1>
  <p class="page-lead">${children.length} podstránok v tejto sekcii.</p>

  <section aria-label="Podstránky">
    <div class="section-grid">
${cards}
    </div>
  </section>`
}

// ── walk ──────────────────────────────────────────────────────────────────────

/** Folder → the sppk.sk article that holds its contact tables. */
const CONTACT_PAGES = {
  'kontakt/urad komory': '723',
  'kontakt/predstavenstvo SPPK': '724',
  'kontakt/dozorna rada SPPK': '725',
  'kontakt/Sekcie SPPK': '865',
  'kontakt/regionalne polnohospodarske a potravinarske komory': '27',
  'kontakt/zvazy, zdruzenia, unie': '728',
  'kontakt/piami clenovia': '726',
  'media/hovorca': '723',
}

/** The spokesperson page is the press-office block of the office page, nothing else. */
const CONTACT_ONLY = { 'media/hovorca': /tla[čc]ov/i }
const CONTACT_TITLE = { 'media/hovorca': 'Hovorkyňa' }

const stats = { page: 0, listing: 0, article: 0, album: 0, section: 0, contact: 0, detail: 0, skipped: 0, images: 0 }

async function walk(dir, parts) {
  const entries = await readdir(dir, { withFileTypes: true })
  const childDirs = entries.filter((e) => e.isDirectory() && e.name !== 'obrazky').map((e) => e.name)
  const files = entries.filter((e) => e.isFile() && !e.name.startsWith('.')).map((e) => e.name)

  if (parts.length && COMPONENTS.has(parts[0])) { stats.skipped++; return }

  if (parts.length) {
    const name = parts[parts.length - 1]
    const key = slug(name)
    const depth = parts.length
    const outDir = join(OUT, ...parts)
    await mkdir(outDir, { recursive: true })

    // images that belong to this page travel with it
    for (const source of [dir, join(dir, 'obrazky')]) {
      if (!existsSync(source)) continue
      for (const file of await readdir(source)) {
        if (!/\.(jpe?g|png|gif|svg|webp)$/i.test(file)) continue
        await mkdir(join(outDir, 'obrazky'), { recursive: true })
        await copyFile(join(source, file), join(outDir, 'obrazky', file))
        stats.images++
      }
    }

    let body = null
    let title = pretty(name)

    if (parts[0] === 'galeria' && parts.length === 1) {
      body = galleryIndexBody([...childDirs, VIDEO_FOLDER])
      title = 'Galéria'
      stats.album++
    }
    if (!body && parts[0] === 'galeria' && parts.length > 1) {
      const hit = albumBySlug.get(key) ?? albumBySlug.get(closest(key, albumKeys, 0.45) ?? '')
      if (hit) { body = albumBody(hit, name); title = hit.title || name; stats.album++ }
    }
    // Only the chamber's own office for now; the other contact folders stay empty.
    if (!body && CONTACT_PAGES[parts.join('/')]) {
      const record = articlesById.get(CONTACT_PAGES[parts.join('/')])
      const key = parts.join('/')
      const heading = CONTACT_TITLE[key] || record?.title || pretty(name)
      const rendered = record
        ? await contactBody(record, heading, outDir, CONTACT_ONLY[key])
        : null
      if (rendered) {
        body = rendered
        title = heading
        stats.contact++
      } else if (record) {
        // No contact tables in the source: keep the mapped article rather than let
        // the fuzzy page matcher pick a different one.
        body = await articleBody(record, record.title || heading)
        title = record.title || heading
        stats.page++
      }
    }
    if (!body) {
      const hit = pageBySlug.get(key) ?? pageBySlug.get(closest(key, pageKeys, 0.62) ?? '')
      if (hit?.type === 'category' && !(hit.items ?? []).length && childDirs.length) {
        // An empty feed with subfolders is a section, not a listing.
        body = sectionBody(pretty(name), childDirs, depth)
        title = hit.title || pretty(name)
        stats.section++
      } else if (hit?.type === 'category') {
        body = listingBody(hit, hit.title || name, parts)
        title = hit.title || name
        stats.listing++
      }
      else if (hit) {
        const rendered = await articleBody(hit, hit.title || name)
        if (!rendered.includes('zatiaľ nemá obsah') || !childDirs.length) {
          body = rendered
          title = hit.title || name
          stats.page++
        }
      }
    }
    if (!body && key === 'charakteristika-sppk') {
      body = CHARAKTERISTIKA
      title = 'Charakteristika SPPK'
      stats.page++
    }
    if (!body) {
      const hit = articleTitles.get(key) ?? articleTitles.get(closest(key, articleKeys, 0.7) ?? '')
      if (hit) { body = await articleBody(hit, hit.title); title = hit.title; stats.article++ }
    }
    if (!body) {
      body = childDirs.length
        ? sectionBody(pretty(name), childDirs, depth)
        : `  <h1 class="page-title">${escape(pretty(name))}</h1>\n  <p class="page-empty">Táto stránka zatiaľ nemá obsah. Priečinok obsahuje ${files.length} obrázkov.</p>`
      stats.section++
    }

    // A page with subfolders always lists them, whatever its own type is, otherwise
    // those subpages have no inbound link anywhere.
    const listsChildren = body.includes('class="section-grid"')
    if (childDirs.length && !listsChildren) {
      body += `\n\n  <section aria-label="Podstránky" style="margin-top:56px;">
    <h2 class="section-heading-plain">Podstránky</h2>
    <div class="section-grid">
${childDirs.map((child) => `      <a class="section-card" href="${encodeURI(child)}/index.html">${escape(pretty(child))}</a>`).join('\n')}
    </div>
  </section>`
    }

    await writeFile(
      join(outDir, 'index.html'),
      shell({ title, depth, breadcrumb: crumbs(parts, depth), body }),
    )
  }

  for (const child of childDirs) await walk(join(dir, child), [...parts, child])
}

await scanStructure(STRUCTURE, [])

/**
 * One page per article, placed in the section its breadcrumb names. Where the
 * breadcrumb does not match a folder, the first listing that carries the article
 * wins; anything left over goes to `ostatne/`.
 */
const articlePath = new Map()
const listingOf = new Map()
for (const parts of listingFolders) {
  const key = slug(parts[parts.length - 1])
  const hit = pageBySlug.get(key) ?? pageBySlug.get(closest(key, pageKeys, 0.62) ?? '')
  if (hit?.type !== 'category') continue
  for (const item of hit.items ?? []) if (!listingOf.has(item.id)) listingOf.set(item.id, parts)
}
for (const [id, parts] of listingOf) {
  const article = articlesById.get(id)
  const title = article?.title || listingById.get(id)?.title
  if (!title) continue
  const crumb = (article?.breadcrumb ?? [])
    .map((c) => c.label)
    .filter((label) => label && slug(label) !== 'uvod')
    .pop()
  const viaCrumb = crumb
    ? folderBySlug.get(slug(crumb)) ?? folderBySlug.get(closest(slug(crumb), [...folderBySlug.keys()], 0.7) ?? '')
    : null
  // The front page feed is not a section; articles never live under it.
  const home = viaCrumb ?? (parts[0] === 'uvod' && parts.length === 1 ? null : parts.join('/'))
  const dir = home ?? 'ostatne'
  articlePath.set(id, `${dir}/${folderName(title)}`)
}

/**
 * Titles repeat across years ("Začala sa žatva" four times in Tlačové správy), and
 * macOS compares paths case-insensitively. Without this the later article silently
 * overwrote the earlier one — 158 articles were being lost.
 */
let disambiguated = 0
const taken = new Set()
for (const [id, rel] of articlePath) {
  let candidate = rel
  if (taken.has(candidate.toLowerCase())) {
    const article = articlesById.get(id)
    const year = (article?.date ?? listingById.get(id)?.date ?? '').match(/(19|20)\d{2}/)?.[0]
    candidate = year ? `${rel} (${year})` : rel
    // Same title, same year, still colliding: fall back to the article id.
    if (taken.has(candidate.toLowerCase())) candidate = `${rel} (${id})`
    disambiguated++
  }
  taken.add(candidate.toLowerCase())
  articlePath.set(id, candidate)
}
console.log(`článkov na rozmiestnenie: ${articlePath.size}, z toho odlíšených ${disambiguated}`)

await mkdir(OUT, { recursive: true })
await mkdir(CACHE, { recursive: true })
await walk(STRUCTURE, [])

// ── detail pages ──────────────────────────────────────────────────────────────
for (const [id, rel] of articlePath) {
  const article = articlesById.get(id)
  if (!article) continue
  const row = listingById.get(id)
  const title = article.title || row?.title || `Článok ${id}`
  const record = { ...article }
  for (const key of ['title', 'date', 'author']) if (!record[key] && row?.[key]) record[key] = row[key]
  const parts = rel.split('/')
  const outDir = join(OUT, ...parts)
  await mkdir(outDir, { recursive: true })
  await writeFile(
    join(outDir, 'index.html'),
    shell({
      title,
      depth: parts.length,
      breadcrumb: crumbs(parts, parts.length),
      body: await articleBody(record, title),
    }),
  )
  stats.detail++
}

/**
 * Articles whose section is not a folder in the structure land in `ostatne/`, and any
 * folder that ends up holding articles but has no page of its own needs one, otherwise
 * its breadcrumb points at nothing.
 */
const holders = new Map()
for (const rel of articlePath.values()) {
  const parts = rel.split('/')
  const dir = parts.slice(0, -1).join('/')
  if (!holders.has(dir)) holders.set(dir, [])
  holders.get(dir).push(parts[parts.length - 1])
}
for (const [dir, children] of holders) {
  const parts = dir.split('/')
  const file = join(OUT, ...parts, 'index.html')
  if (existsSync(file)) continue
  children.sort((a, b) => a.localeCompare(b, 'sk'))
  await mkdir(join(OUT, ...parts), { recursive: true })
  await writeFile(
    file,
    shell({
      title: pretty(parts[parts.length - 1]),
      depth: parts.length,
      breadcrumb: crumbs(parts, parts.length),
      body: sectionBody(pretty(parts[parts.length - 1]), children, parts.length),
    }),
  )
  stats.section++
}

/**
 * Video archive: a gallery subsection the structure does not have a folder for. The
 * delivered file was Tailwind and left-aligned; this is the same content in inline
 * CSS with everything centred, including the channel block.
 */
const videoBody = `  <h1 class="page-title" style="text-align:center;">Videoarchív SPPK</h1>
  <p class="page-lead" style="text-align:center;max-width:640px;margin-left:auto;margin-right:auto;">
    Záznamy zo spravodajských relácií, reportáží z terénu a dokumentárnych filmov
    zo slovenského poľnohospodárstva.
  </p>

  <section aria-label="YouTube kanál">
    <div class="yt-card">
      <div class="yt-mark" aria-hidden="true">
        <svg width="26" height="20" viewBox="0 0 26 20" fill="none">
          <path d="M25.4 3.13A3.27 3.27 0 0 0 23.1.8C21.1.28 13 .28 13 .28S4.9.28 2.9.8A3.27 3.27 0 0 0 .6 3.13 34.3 34.3 0 0 0 .1 10a34.3 34.3 0 0 0 .5 6.87A3.27 3.27 0 0 0 2.9 19.2C4.9 19.72 13 19.72 13 19.72s8.1 0 10.1-.52a3.27 3.27 0 0 0 2.3-2.33A34.3 34.3 0 0 0 25.9 10a34.3 34.3 0 0 0-.5-6.87z" fill="white" fill-opacity="0.15"/>
          <polygon points="10.5,14.5 18,10 10.5,5.5" fill="white"/>
        </svg>
      </div>
      <p class="yt-label">Oficiálny YouTube kanál</p>
      <p class="yt-text">Navštívte náš kanál a odoberajte naše agro-spravodajstvo.</p>
      <a class="yt-btn" href="https://www.youtube.com/@sppkbratislava" target="_blank" rel="noopener noreferrer">Otvoriť YouTube kanál SPPK @sppkbratislava&nbsp;→</a>
    </div>
  </section>`

{
  const parts = ['galeria', VIDEO_FOLDER]
  await mkdir(join(OUT, ...parts), { recursive: true })
  await writeFile(
    join(OUT, ...parts, 'index.html'),
    shell({
      title: 'Videoarchív SPPK',
      depth: parts.length,
      breadcrumb: crumbs(parts, parts.length),
      body: videoBody,
    }),
  )
  stats.page++
}

// The three language versions sit under Header/ in the client's structure, but the
// walk skips component folders, so they are written here in the article template.
const LANG_PAGES = [
  ['Header/english', '/en'],
  ['Header/deutsch', '/de'],
  ['Header/francais', '/fr'],
]
for (const [folder, href] of LANG_PAGES) {
  const page = pages.find((candidate) => candidate.href === href)
  if (!page) continue
  const parts = folder.split('/')
  await mkdir(join(OUT, ...parts), { recursive: true })
  await writeFile(
    join(OUT, ...parts, 'index.html'),
    shell({
      title: page.title || parts[parts.length - 1],
      depth: parts.length,
      breadcrumb: crumbs(parts, parts.length),
      body: await articleBody(page, page.title || pretty(parts[parts.length - 1])),
    }),
  )
  stats.page++
}

// the note that ships with the archive
await copyFile(ROOT + 'templates/README-vystup.txt', OUT + '/README.txt')

// site root: the delivered homepage, plus the shared image folder
/**
 * The homepage now follows the same rule as every other page: only its own content.
 * Header, nav, the partners footer and the legal footer are separate components that
 * get merged in at deploy time.
 */
{
  const homepage = await readFile(ROOT + 'templates/uvod-navrh.html', 'utf8')
  const lines = homepage.split('\n')
  const cut = (from, to) => {
    const a = lines.findIndex((l) => l && l.includes(from))
    if (a < 0) return
    const b = to ? lines.findIndex((l, i) => i > a && l && l.includes(to)) : lines.length
    for (let i = a; i < (b < 0 ? lines.length : b); i++) lines[i] = null
  }
  cut('UPPER HEADER', 'HERO CAROUSEL')
  cut('NAV BAR', 'HERO CAROUSEL')
  cut('Login backdrop', 'HERO CAROUSEL')
  cut('PARTNERS FOOTER', 'LEGAL FOOTER')
  cut('LEGAL FOOTER', '<script>')
  await writeFile(OUT + '/index.html', lines.filter((l) => l !== null).join('\n'))
}
await mkdir(OUT + '/images', { recursive: true })
for (const file of await readdir(ROOT + 'templates/images')) {
  if (/\.(jpe?g|png|gif|svg)$/i.test(file)) await copyFile(ROOT + 'templates/images/' + file, OUT + '/images/' + file)
}

console.log(JSON.stringify(stats, null, 2))
