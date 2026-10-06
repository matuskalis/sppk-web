import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { existsSync } from 'node:fs'

// Gallery page rebuilt from the delivered design, in inline CSS like the rest, and
// filled with the 48 real albums instead of placeholders.

const ROOT = new URL('../', import.meta.url).pathname
const BASE = ROOT + 'design/html-kody/html-homepage/homepage.html'
const ALBUMS = JSON.parse(
  await readFile(process.env.HOME + '/projects/sppk-redesign/scraper/data-full/galeria.json', 'utf8'),
)
const PER_PAGE = 12

const source = await readFile(BASE, 'utf8')
const lines = source.split('\n')
const slice = (from, to) => {
  const a = lines.findIndex((l) => l.includes(from))
  const b = lines.findIndex((l, i) => i > a && l.includes(to))
  return lines.slice(a, b).join('\n').trimEnd()
}
const css = source.split('<style>')[1].split('</style>')[0]
const fonts = lines.filter((l) => l.includes('fonts.googleapis') || l.includes('fonts.gstatic')).join('\n')
const header = slice('UPPER HEADER', 'HERO CAROUSEL').replace('src="../images/sppk-logo.png"', 'src="images/sppk-logo.png"')
const legal = slice('LEGAL FOOTER', '<script>')
const script = source.split('<script>').pop().split('</script>')[0]

// Only the header's own behaviour; no carousel, no calendar.
const keepFn = (name) => {
  const m = script.match(new RegExp(`function ${name}\\([^)]*\\)\\s*\\{`))
  if (!m) return ''
  let depth = 0
  for (let j = m.index + m[0].length - 1; j < script.length; j++) {
    if (script[j] === '{') depth++
    else if (script[j] === '}' && --depth === 0) return script.slice(m.index, j + 1)
  }
  return ''
}
const headerJs = 'let loginOpen = false;\nlet mobileOpen = false;\n' +
  ['toggleLogin', 'closeLogin', 'setNavActive', 'toggleMobileMenu', 'mobileNavClick']
    .map(keepFn).filter(Boolean).join('\n')

// ── album covers, saved next to the page ──
await mkdir(ROOT + 'templates/images/galeria', { recursive: true })
let saved = 0
for (const album of ALBUMS) {
  const id = album.href.split('/').pop()
  const file = `${ROOT}templates/images/galeria/${id}.jpg`
  album.local = `images/galeria/${id}.jpg`
  if (existsSync(file)) { saved++; continue }
  try {
    const response = await fetch('https://www.sppk.sk' + album.cover, {
      headers: { 'user-agent': 'SPPK-redesign-crawler (contracted site rebuild)' },
    })
    if (!response.ok) throw new Error(String(response.status))
    await writeFile(file, Buffer.from(await response.arrayBuffer()))
    saved++
  } catch (error) {
    console.warn(`obálka ${album.href}: ${error.message}`)
    album.local = null
  }
}
console.log(`obálok: ${saved}/${ALBUMS.length}`)

const escape = (t) => t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

const card = (album) => `        <a class="album-card" href="${album.href}">
          <div class="album-cover">
            ${album.local
              ? `<img src="${album.local}" alt="${escape(album.title)}" loading="lazy" />`
              : '<span class="album-missing">bez obálky</span>'}
            <span class="album-count">${album.photos} obr.</span>
          </div>
          <span class="album-title">${escape(album.title)}</span>
        </a>`

const page = ALBUMS.slice(0, PER_PAGE)
const totalPages = Math.ceil(ALBUMS.length / PER_PAGE)
const pager = Array.from({ length: totalPages }, (_, i) =>
  `        <a class="pager-num${i === 0 ? ' active' : ''}" href="?strana=${i + 1}">${i + 1}</a>`,
).join('\n')

const html = `<!DOCTYPE html>
<html lang="sk">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Galéria – Fotogaléria a videoarchív | SPPK</title>
${fonts}
  <style>
${css}
    /* ── Galéria ─────────────────────────────────────────── */
    .page-section { max-width:1200px; margin:0 auto; padding:48px 24px 80px; }

    .breadcrumb { font-size:12.5px; color:#777; margin-bottom:24px; letter-spacing:0.02em; }
    .breadcrumb a { color:#777; text-decoration:none; }
    .breadcrumb a:hover { color:#009a44; }
    .breadcrumb span { color:#ccc; margin:0 7px; }

    .page-title {
      margin:0 0 8px; font-family:'DM Serif Display',serif; font-weight:400; color:#000;
      font-size:clamp(28px,3.4vw,34px); line-height:1.15; letter-spacing:-0.01em;
    }
    .page-lead { margin:0 0 40px; font-size:15px; color:#666; line-height:1.7; }

    .section-heading {
      margin:0 0 24px; font-family:'DM Serif Display',serif; font-weight:400; color:#000;
      font-size:clamp(24px,2.8vw,30px); line-height:1.2;
    }

    .album-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:24px; }

    .album-card { display:flex; flex-direction:column; gap:12px; text-decoration:none; }

    .album-cover {
      position:relative; aspect-ratio:4/3; border-radius:12px; overflow:hidden;
      background:#e6f5ed; display:flex; align-items:center; justify-content:center;
    }
    .album-cover img {
      width:100%; height:100%; object-fit:cover; display:block;
      transition:transform 0.4s cubic-bezier(0.4,0,0.2,1);
    }
    .album-card:hover .album-cover img { transform:scale(1.05); }
    .album-missing { font-size:11px; color:#9bb3a5; font-style:italic; }

    .album-count {
      position:absolute; right:10px; bottom:10px; background:rgba(0,0,0,0.62); color:#fff;
      font-size:11px; font-weight:600; letter-spacing:0.04em; padding:4px 9px; border-radius:20px;
      backdrop-filter:blur(3px);
    }

    .album-title {
      font-size:14px; font-weight:600; color:#000; line-height:1.45;
      transition:color 0.2s ease;
      display:-webkit-box; -webkit-line-clamp:3; -webkit-box-orient:vertical; overflow:hidden;
    }
    .album-card:hover .album-title { color:#009a44; }

    .pager-row { display:flex; align-items:center; justify-content:center; gap:6px; margin-top:48px; }
    .pager-num {
      min-width:36px; height:36px; display:flex; align-items:center; justify-content:center;
      border:1px solid rgba(0,0,0,0.10); border-radius:8px; text-decoration:none;
      font-size:13px; font-weight:600; color:#444; transition:all 0.2s ease;
    }
    .pager-num:hover { border-color:#009a44; color:#009a44; }
    .pager-num.active { background:#009a44; border-color:#009a44; color:#fff; }

    .video-empty {
      border:1.5px dashed rgba(0,154,68,0.35); border-radius:12px; padding:40px 24px;
      text-align:center; font-size:13.5px; color:#8aa89a; line-height:1.8;
    }

    @media (max-width:1024px) { .album-grid { grid-template-columns:repeat(3,1fr); } }
    @media (max-width:768px) {
      .album-grid { grid-template-columns:repeat(2,1fr); gap:16px; }
      .page-section { padding:28px 14px 56px; }
    }
  </style>
</head>
<body>

${header}

<main class="page-section">

  <nav class="breadcrumb">
    <a href="/">Úvod</a><span>/</span><a href="/galeria">Galéria</a><span>/</span>Fotogaléria
  </nav>

  <h1 class="page-title">Galéria</h1>
  <p class="page-lead">${ALBUMS.length} albumov, ${ALBUMS.reduce((s, a) => s + a.photos, 0)} fotografií z podujatí, výstav a rokovaní komory.</p>

  <!-- ═══════════════ SEKCIA 1 — Fotogaléria ═══════════════ -->
  <section aria-labelledby="nadpis-foto">
    <h2 class="section-heading" id="nadpis-foto">Fotogaléria</h2>

    <div class="album-grid">
${page.map(card).join('\n')}
    </div>

    <nav class="pager-row" aria-label="Stránkovanie galérie">
${pager}
    </nav>
  </section>

  <!-- ═══════════════ SEKCIA 2 — Videoarchív ═══════════════ -->
  <section aria-labelledby="nadpis-video" style="margin-top:72px;">
    <h2 class="section-heading" id="nadpis-video">Videoarchív</h2>
    <div class="video-empty">
      Na sppk.sk zatiaľ videoarchív neexistuje, sekcia je pripravená a čaká na videá.<br />
      Karty majú rovnaký formát ako albumy vyššie, s náhľadom a dĺžkou záznamu.
    </div>
  </section>

</main>

${legal}

<script>
${headerJs}
</script>
</body>
</html>
`

await writeFile(ROOT + 'templates/galeria.html', html)
console.log(`templates/galeria.html — ${ALBUMS.length} albumov, ${totalPages} strán po ${PER_PAGE}`)
