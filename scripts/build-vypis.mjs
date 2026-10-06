import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { existsSync } from 'node:fs'

// Article listing page, rebuilt from the delivered odkazy.html in inline CSS and
// filled with the real sections and the newest real articles.

const ROOT = new URL('../', import.meta.url).pathname
const BASE = ROOT + 'design/html-kody/html-homepage/homepage.html'
const SCRAPER = process.env.HOME + '/projects/sppk-redesign/scraper/data-full/'

const PER_PAGE = 6
const pages = JSON.parse(await readFile(SCRAPER + 'pages.json', 'utf8'))
const listing = JSON.parse(await readFile(SCRAPER + 'articles.json', 'utf8'))

// The real sections, biggest first — the delivered file used invented category names.
const SECTIONS = pages
  .filter((page) => page.type === 'category' && page.href !== '/uvod' && page.items?.length)
  .sort((a, b) => b.items.length - a.items.length)
  .slice(0, 5)
  .map((page) => ({ label: page.title || page.href.replace('/', ''), count: page.items.length }))

const MONTHS = ['januára','februára','marca','apríla','mája','júna','júla','augusta','septembra','októbra','novembra','decembra']
const formatDate = (raw) => {
  const m = raw?.match(/(\d{1,2})[./](\d{1,2})[./](\d{4})/)
  return m ? `${Number(m[1])}. ${MONTHS[Number(m[2]) - 1]} ${m[3]}` : ''
}
const escape = (t) => (t ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

const articles = listing.slice(0, PER_PAGE)

await mkdir(ROOT + 'templates/images/vypis', { recursive: true })
for (const article of articles) {
  article.local = null
  if (!article.image) continue
  const file = `${ROOT}templates/images/vypis/${article.id}.jpg`
  article.local = `images/vypis/${article.id}.jpg`
  if (existsSync(file)) continue
  try {
    const url = article.image.startsWith('http') ? article.image : 'https://www.sppk.sk' + article.image
    const response = await fetch(url, { headers: { 'user-agent': 'Mozilla/5.0' } })
    if (!response.ok) throw new Error(String(response.status))
    await writeFile(file, Buffer.from(await response.arrayBuffer()))
  } catch (error) {
    console.warn(`náhľad ${article.id}: ${error.message}`)
    article.local = null
  }
}

const source = await readFile(BASE, 'utf8')
const lines = source.split('\n')
const slice = (from, to) => {
  const a = lines.findIndex((l) => l.includes(from))
  const b = lines.findIndex((l, i) => i > a && l.includes(to))
  return lines.slice(a, b).join('\n').trimEnd()
}
const css = source.split('<style>')[1].split('</style>')[0]
const fonts = lines.filter((l) => l.includes('fonts.goog') || l.includes('fonts.gstatic')).join('\n')
const header = slice('UPPER HEADER', 'HERO CAROUSEL').replace('src="../images/sppk-logo.png"', 'src="images/sppk-logo.png"')
const legal = slice('LEGAL FOOTER', '<script>')
const script = source.split('<script>').pop().split('</script>')[0]
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
  ['toggleLogin','closeLogin','setNavActive','toggleMobileMenu','mobileNavClick'].map(keepFn).filter(Boolean).join('\n')

const chips = ['Všetky správy', ...SECTIONS.map((s) => s.label)]
  .map((label, i) => `        <button class="chip${i === 0 ? ' active' : ''}" onclick="setChip(this)">${escape(label)}</button>`)
  .join('\n')

const card = (article) => `      <article class="feed-card">
        <div class="feed-text">
          <div class="feed-date">${formatDate(article.date)}</div>
          <h3 class="feed-title"><a href="/clanok/${article.id}">${escape(article.title)}</a></h3>
          <p class="feed-excerpt">${escape(article.excerpt)}</p>
          ${article.author ? `<div class="feed-author">${escape(article.author)}</div>` : ''}
        </div>
        ${article.local ? `<a class="feed-thumb" href="/clanok/${article.id}"><img src="${article.local}" alt="${escape(article.title)}" loading="lazy" /></a>` : ''}
      </article>`

const html = `<!DOCTYPE html>
<html lang="sk">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Aktuálne informácie a správy – SPPK</title>
${fonts}
  <style>
${css}
    /* ── Výpis článkov ───────────────────────────────────── */
    .page-section { max-width:1200px; margin:0 auto; padding:48px 24px 80px; }

    .breadcrumb { font-size:12.5px; color:#777; margin-bottom:24px; letter-spacing:0.02em; }
    .breadcrumb a { color:#777; text-decoration:none; }
    .breadcrumb a:hover { color:#009a44; }
    .breadcrumb span { color:#ccc; margin:0 7px; }

    .page-title {
      margin:0 0 8px; font-family:'DM Serif Display',serif; font-weight:400; color:#000;
      font-size:clamp(28px,3.4vw,34px); line-height:1.15; letter-spacing:-0.01em;
    }
    .page-lead { margin:0 0 32px; font-size:15px; color:#666; line-height:1.7; }

    .chip-row { display:flex; flex-wrap:wrap; gap:8px; margin-bottom:40px;
      padding-bottom:24px; border-bottom:1px solid rgba(0,0,0,0.08); }
    .chip {
      background:#fff; border:1px solid rgba(0,0,0,0.12); border-radius:20px;
      padding:8px 16px; font-size:13px; font-weight:600; color:#555; cursor:pointer;
      font-family:'Inter',sans-serif; transition:all 0.2s ease; letter-spacing:0.02em;
    }
    .chip:hover { border-color:#009a44; color:#009a44; }
    .chip.active { background:#009a44; border-color:#009a44; color:#fff; }

    .feed-card {
      display:flex; gap:28px; align-items:flex-start;
      padding-bottom:28px; margin-bottom:28px; border-bottom:1px solid rgba(0,0,0,0.07);
    }
    .feed-card:last-of-type { border-bottom:0; }
    .feed-text { flex:1; min-width:0; }

    .feed-date { font-size:12px; font-weight:600; color:#009a44; letter-spacing:0.02em; margin-bottom:8px; }

    .feed-title { margin:0 0 10px; font-family:'DM Serif Display',serif; font-size:22px;
      font-weight:400; line-height:1.3; }
    .feed-title a { color:#000; text-decoration:none; transition:color 0.2s ease; }
    .feed-title a:hover { color:#009a44; }

    .feed-excerpt { margin:0 0 10px; font-size:14.5px; color:#555; line-height:1.7; font-weight:400;
      display:-webkit-box; -webkit-line-clamp:3; -webkit-box-orient:vertical; overflow:hidden; }

    .feed-author { font-size:12px; color:#999; font-style:italic; }

    .feed-thumb { width:200px; height:134px; border-radius:12px; overflow:hidden;
      flex-shrink:0; background:#e6f5ed; display:block; }
    .feed-thumb img { width:100%; height:100%; object-fit:cover; display:block;
      transition:transform 0.4s cubic-bezier(0.4,0,0.2,1); }
    .feed-thumb:hover img { transform:scale(1.05); }

    .pager-row { display:flex; align-items:center; justify-content:center; gap:6px; margin-top:48px; }
    .pager-num {
      min-width:36px; height:36px; display:flex; align-items:center; justify-content:center;
      border:1px solid rgba(0,0,0,0.10); border-radius:8px; text-decoration:none;
      font-size:13px; font-weight:600; color:#444; transition:all 0.2s ease;
    }
    .pager-num:hover { border-color:#009a44; color:#009a44; }
    .pager-num.active { background:#009a44; border-color:#009a44; color:#fff; }

    @media (max-width:768px) {
      .page-section { padding:28px 14px 56px; }
      .feed-card { flex-direction:column-reverse; gap:14px; }
      .feed-thumb { width:100%; height:190px; }
    }
  </style>
</head>
<body>

${header}

<main class="page-section">

  <nav class="breadcrumb">
    <a href="/">Úvod</a><span>/</span>Aktuálne informácie
  </nav>

  <h1 class="page-title">Aktuálne informácie</h1>
  <p class="page-lead">Správy, tlačové správy a analýzy komory.</p>

  <!-- ═══════════════ SEKCIA 1 — Filter kategórií ═══════════════ -->
  <section aria-label="Filter kategórií">
    <div class="chip-row">
${chips}
    </div>
  </section>

  <!-- ═══════════════ SEKCIA 2 — Výpis článkov ═══════════════ -->
  <section aria-label="Zoznam článkov">
${articles.map(card).join('\n')}

    <nav class="pager-row" aria-label="Stránkovanie">
      <a class="pager-num active" href="?strana=1">1</a>
      <a class="pager-num" href="?strana=2">2</a>
      <a class="pager-num" href="?strana=3">3</a>
      <a class="pager-num" href="?strana=4">4</a>
      <a class="pager-num" href="?strana=5">5</a>
      <a class="pager-num" href="?strana=2">›</a>
    </nav>
  </section>

</main>

${legal}

<script>
${headerJs}

function setChip(button) {
  document.querySelectorAll('.chip').forEach((chip) => chip.classList.remove('active'));
  button.classList.add('active');
}
</script>
</body>
</html>
`

await writeFile(ROOT + 'templates/vypis-clankov.html', html)
console.log(`templates/vypis-clankov.html — ${articles.length} článkov, kategórie: ${SECTIONS.map((s) => s.label).join(', ')}`)
