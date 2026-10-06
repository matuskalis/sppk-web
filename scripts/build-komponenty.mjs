import { readFile, writeFile, mkdir, readdir, copyFile } from 'node:fs/promises'
import { join } from 'node:path'

// Header, menu, footer and the sidebar arrive as their own finished pages. They are
// copied into their structure folders with the delivered images wired up, and the
// menu is filled with the site's real top-level sections instead of placeholders.

const ROOT = new URL('../', import.meta.url).pathname
const SRC = ROOT + 'design/komponenty'
const OUT = ROOT + 'web'
const COMPONENTS = new Set(['Header', 'Footer', 'Menu', 'tretina'])

/** The nine top-level sections the client's own structure defines. */
const sections = (await readdir(ROOT + 'struktura', { withFileTypes: true }))
  .filter((e) => e.isDirectory() && !COMPONENTS.has(e.name))
  .map((e) => e.name)
  .sort()

const NAV_TREE = JSON.parse(
  await readFile(process.env.HOME + '/projects/sppk-redesign/scraper/data-full/nav.json', 'utf8'),
)

/** Folder lookup so menu entries point at the pages we generated, not at sppk.sk. */
const slugOf = (text) =>
  (text ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')

const folderBySlug = new Map()
async function scan(dir, parts) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    if (!entry.isDirectory() || entry.name === 'obrazky') continue
    const next = [...parts, entry.name]
    // Shallowest wins: `legislativa` must stay the top section, not the deep folder
    // of the same name under vzdelavanie.
    const key = slugOf(entry.name)
    if (!COMPONENTS.has(next[0]) && !folderBySlug.has(key)) folderBySlug.set(key, next.join('/'))
    await scan(join(dir, entry.name), next)
  }
}
await scan(ROOT + 'struktura', [])

function grams(text) {
  return new Set(Array.from({ length: Math.max(text.length - 2, 1) }, (_, i) => text.slice(i, i + 3)))
}
const years = (text) => (text.match(/\b(19|20)\d{2}\b/g) ?? []).join(',')

function closestFolder(key) {
  const a = grams(key)
  let best = null
  let score = 0
  for (const candidate of folderBySlug.keys()) {
    // "za rok 2026" must not fall back to "za rok 2020"; trigrams cannot see the digit.
    if (years(key) !== years(candidate)) continue
    const b = grams(candidate)
    let hits = 0
    for (const g of a) if (b.has(g)) hits++
    const s = (2 * hits) / (a.size + b.size)
    if (s > score || (s === score && candidate.length > (best?.length ?? 0))) {
      score = s
      best = candidate
    }
  }
  return score >= 0.68 ? folderBySlug.get(best) : null
}

/**
 * Links are root-relative: the menu is a component that gets merged into pages at
 * many depths, so no single "../" prefix would work for all of them.
 */
function hrefFor(item) {
  const target = folderBySlug.get(slugOf(item.label)) ?? closestFolder(slugOf(item.label))
  // encodeURI, not encodeURIComponent: folder names contain commas, which are legal
  // in a path and must not come out as %2C.
  if (target) return encodeURI('/' + target + '/index.html')
  return item.href && item.href !== '#' ? 'https://www.sppk.sk' + item.href : '#'
}

const escape = (t) =>
  (t ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

let linked = 0
let offsite = 0
function countLink(href) {
  if (href.startsWith('/')) linked++
  else if (href.startsWith('http')) offsite++
}

/**
 * The whole menu of sppk.sk. It runs five levels deep in places (Valné zhromaždenia →
 * Nitra 2024), so the renderer recurses instead of assuming a fixed depth.
 */
/**
 * Only the main subsections show when a section opens. Anything deeper waits until
 * the mouse is on its own parent, otherwise the panel dumps the whole tree at once.
 */
function renderBranch(items, level) {
  return items.map((item) => {
    const href = hrefFor(item)
    countLink(href)
    const children = item.children ?? []
    const cls = level === 1 ? 'nav-sub' : 'nav-leaf'
    const indent = '  '.repeat(level + 5)
    const link = `${indent}<a class="${cls}" href="${href}">${escape(item.label)}` +
      (children.length ? `<span class="nav-more">›</span>` : '') + `</a>`
    if (!children.length) return link
    return `${indent}<div class="nav-branch">\n${link}\n` +
      `${indent}  <div class="nav-flyout">\n${renderBranch(children, level + 1)}\n${indent}  </div>\n${indent}</div>`
  }).join('\n')
}

function renderMenu(tree) {
  return tree.map((top) => {
    const href = hrefFor(top)
    countLink(href)
    const children = top.children ?? []
    const panel = children.length
      ? `\n        <div class="nav-panel">\n${renderBranch(children, 1)}\n        </div>`
      : ''
    return `      <div class="nav-item">\n` +
      `        <a class="nav-btn" href="${href}">${escape(top.label)}</a>` +
      panel + `\n      </div>`
  }).join('\n')
}

const MENU_CSS = `
    /* the delivered component styled <button>; these are links now */
    .nav-btn { text-decoration: none; display: inline-block; }
    .drawer-btn { text-decoration: none; display: block; }
    .nav-item { position: relative; }
    .nav-item:hover .nav-panel { display: block; }
    .nav-panel {
      display: none; position: absolute; top: 100%; left: 0; z-index: 300;
      /* No overflow here: it would clip the flyouts that open to the side. */
      min-width: 280px; max-width: 380px;
      background: #fff; border: 1px solid rgba(0,154,68,0.18); border-radius: 0 0 12px 12px;
      box-shadow: 0 12px 32px rgba(0,0,0,0.12); padding: 10px 0;
    }
    .nav-group { padding: 4px 0; }
    .nav-sub {
      display: block; padding: 8px 18px; font-size: 13.5px; font-weight: 600; color: #000;
      text-decoration: none; line-height: 1.35;
    }
    .nav-sub:hover { color: #009a44; background: rgba(0,154,68,0.06); }
    .nav-leaf {
      display: block; padding: 6px 18px 6px 32px; font-size: 12.5px; font-weight: 400;
      color: #555; text-decoration: none; line-height: 1.35;
    }
    .nav-leaf:hover { color: #009a44; background: rgba(0,154,68,0.05); }
    .nav-branch { position: relative; }
    .nav-branch > .nav-flyout { display: none; }
    .nav-branch:hover > .nav-flyout { display: block; }
    .nav-flyout {
      position: absolute; top: -10px; left: 100%; z-index: 320;
      min-width: 260px; max-width: 340px;
      background: #fff; border: 1px solid rgba(0,154,68,0.18); border-radius: 12px;
      box-shadow: 0 12px 32px rgba(0,0,0,0.12); padding: 10px 0;
    }
    .nav-more { float: right; color: #009a44; font-weight: 700; opacity: 0.7; }
    .drawer-group { border-bottom: 1px solid rgba(0,0,0,0.06); }
    .drawer-sub {
      display: block; padding: 9px 24px 9px 36px; font-size: 13.5px; color: #333;
      text-decoration: none;
    }
    .drawer-leaf {
      display: block; padding: 7px 24px 7px 50px; font-size: 12.5px; color: #666;
      text-decoration: none;
    }
    @media (max-width: 768px) { .nav-panel { display: none !important; } }
`

/** Swap the delivered six placeholders for the real tree, keeping its look. */
/** The video archive is ours, not on sppk.sk, so it is grafted onto Galéria. */
function withVideoArchive(tree) {
  return tree.map((top) => {
    if (!/gal[ée]ria/i.test(top.label)) return top
    const children = [...(top.children ?? [])]
    if (!children.some((c) => /videoarch/i.test(c.label))) {
      children.push({ label: 'Videoarchív SPPK', href: '#', children: [] })
    }
    return { ...top, children }
  })
}

function buildMenu(html) {
  const tree = withVideoArchive(NAV_TREE)
  const desktop = renderMenu(tree)
  const drawerBranch = (items, level) => items.map((item) => {
    const cls = level === 1 ? 'drawer-sub' : 'drawer-leaf'
    return `      <a class="${cls}" style="padding-left:${24 + level * 14}px" href="${hrefFor(item)}">${escape(item.label)}</a>` +
      ((item.children ?? []).length ? `\n${drawerBranch(item.children, level + 1)}` : '')
  }).join('\n')

  const drawer = tree.map((top) => {
    const children = (top.children ?? []).length ? `\n${drawerBranch(top.children, 1)}` : ''
    return `    <div class="drawer-group">\n` +
      `      <a class="drawer-btn" href="${hrefFor(top)}">${escape(top.label)}</a>` +
      children + `\n    </div>`
  }).join('\n')

  return html
    .replace('</style>', MENU_CSS + '  </style>')
    .replace(
      /<div class="desktop-nav-links" id="desktopNav">\s*<\/div>/,
      `<div class="desktop-nav-links" id="desktopNav">\n${desktop}\n    </div>`,
    )
    .replace(
      /(<div[^>]*id="mobileDrawer"[^>]*>)\s*(<\/div>)/,
      `$1\n${drawer}\n  $2`,
    )
    // The component rendered its placeholders from JS; the markup is static now, so
    // only the call sites go. Anchored to a whole line, otherwise the pattern also
    // matches inside `function renderDesktop() {` and breaks the whole script.
    .replace(/^[ \t]*render(?:Desktop|Drawer)\(\);?[ \t]*\r?\n/gm, '')
}

const SOCIAL = {
  Facebook: 'https://www.facebook.com/sppk.sk',
  Instagram: 'https://www.instagram.com/hovorme_o_jedle',
  LinkedIn: 'https://www.linkedin.com/company/slovensk%C3%A1-po%C4%BEnohospod%C3%A1rska-a-potravin%C3%A1rska-komora/',
}
/** The language pages live in the structure under Header/, built from sppk.sk. */
const LANGS = {
  EN: encodeURI('/Header/english/index.html'),
  DE: encodeURI('/Header/deutsch/index.html'),
  FR: encodeURI('/Header/francais/index.html'),
}

/** The delivered header ships inert buttons; these are the real destinations. */
function wireHeader(html) {
  for (const [name, url] of Object.entries(SOCIAL)) {
    html = html.replace(
      new RegExp(`<button class="social-btn" aria-label="${name}">([\\s\\S]*?)</button>`),
      `<a class="social-btn" aria-label="${name}" href="${url}" target="_blank" rel="noopener noreferrer">$1</a>`,
    )
  }
  for (const [code, url] of Object.entries(LANGS)) {
    html = html.replace(
      new RegExp(`<button class="lang-btn">${code}</button>`),
      `<a class="lang-btn" href="${url}">${code}</a>`,
    )
  }
  return html.replace('</style>', `
    .social-btn, .lang-btn { text-decoration: none; }
  </style>`)
}

/**
 * The delivered footer builds the partner grid from JS, but its image paths point at
 * ../src/imports/, which the zip does not contain — every logo fell back to its name
 * as plain text. The files ship in obrazky-sponzori/, so the paths are repointed.
 */
function wireFooterLogos(html, files) {
  const normalise = (name) => name.toLowerCase().replace(/\.[a-z]+$/, '').replace(/[_\s-]+/g, '')
  const byKey = new Map(files.map((file) => [normalise(file), file]))
  return html.replace(/img: "\.\.\/src\/imports\/([^"]+)"/g, (whole, ref) => {
    const file = byKey.get(normalise(ref))
    if (!file) {
      console.warn(`  logo partnera bez súboru: ${ref}`)
      return whole
    }
    return `img: "obrazky-sponzori/${file.replace(/ /g, '%20')}"`
  })
}

function wireFooter(html) {
  return html
    .replace('<a href="#">Prevádzka: IZPI Nitra</a>',
      '<a href="https://www.izpi.sk/" target="_blank" rel="noopener noreferrer">Prevádzka: IZPI Nitra</a>')
    // the copyright line is not a link anywhere
    // Not a link any more, but it has to read exactly like the ones beside it.
    .replace('<a href="#">Copyright ©2026 SPPK</a>',
      '<span class="legal-static">Copyright ©2026 SPPK</span>')
    .replace('</style>', `
    .legal-bar-inner .legal-static {
      color: #ffffff;
      font-size: 12.5px;
      font-weight: 400;
      letter-spacing: 0.03em;
    }
  </style>`)
}

function wireSidebar(html) {
  return html
    .replace('<div class="card-title">Rozhodcovský súd SPPK</div>', '<div class="card-title">Arbitrážny súd</div>')
    .replace('<a href="#" class="card-link">Zistiť viac o rozhodcovskom súde →</a>',
      '<a href="http://www.arbitraznysud.sk/dokumenty.html" class="card-link" target="_blank" rel="noopener noreferrer">Zistiť viac o arbitrážnom súde →</a>')
    .replace('<a href="#" class="card-link">Viac informácií o členstve →</a>',
      `<a href="${encodeURI('/uvod/stan sa clenom SPPK/index.html')}" class="card-link">Viac informácií o členstve →</a>`)
    .replace('<div class="weather-title">Agrometeo / Počasie</div>',
      '<div class="weather-title"><a href="https://www.shmu.sk/sk/?page=1" target="_blank" ' +
      'rel="noopener noreferrer" style="color:inherit;text-decoration:none;">Počasie</a></div>')
    .replace('</style>', `
    .weather-title { font-size: 22px !important; }
  </style>`)
}

const TARGETS = [
  ['header-html', 'Header'],
  ['menu-html', 'Menu'],
  ['footer-html', 'Footer'],
  ['tretina-html', 'tretina'],
]

for (const [source, folder] of TARGETS) {
  const outDir = join(OUT, folder)
  await mkdir(outDir, { recursive: true })
  let html = await readFile(join(SRC, source, 'index.html'), 'utf8')

  // copy the images that came with the component and point the markup at them
  for (const entry of await readdir(join(SRC, source), { withFileTypes: true })) {
    if (entry.isDirectory()) {
      await mkdir(join(outDir, entry.name), { recursive: true })
      for (const file of await readdir(join(SRC, source, entry.name))) {
        await copyFile(join(SRC, source, entry.name, file), join(outDir, entry.name, file))
      }
    }
  }

  // One logo for the whole site, kept in templates/images so the homepage and the
  // header component can never drift apart.
  if (/sppk[_ -]?logo/i.test(html)) {
    await copyFile(ROOT + 'templates/images/sppk-logo.png', join(outDir, 'sppk-logo.png'))
    html = html.replace(/src="[^"]*sppk[_ -]?logo[^"]*"/gi, 'src="sppk-logo.png"')
  }

  if (folder === 'Menu') html = buildMenu(html)
  if (folder === 'Header') html = wireHeader(html)
  if (folder === 'Footer') {
    html = wireFooter(html)
    html = wireFooterLogos(html, await readdir(join(SRC, source, 'obrazky-sponzori')))
  }
  if (folder === 'tretina') html = wireSidebar(html)

  await writeFile(join(outDir, 'index.html'), html)
  console.log(`web/${folder}/index.html`)
}

console.log(`menu: ${NAV_TREE.length} sekcií, ${linked} odkazov na naše stránky, ${offsite} na sppk.sk`)
