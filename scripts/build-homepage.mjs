import { readFile, writeFile } from 'node:fs/promises'

// Four homepage variants off the one delivered design, so the base file stays the
// single source of truth for the header, carousel, feed and footer.

const ROOT = new URL('../', import.meta.url).pathname
const BASE = ROOT + 'design/html-kody/html-homepage/homepage.html'

const PARTNERS = [
  ['partner-agrokomplex.png', 'Agrokomplex'],
  ['partner-agropoistenie.png', 'Agropoistenie'],
  ['partner-cac-finance.jpg', 'CAC Finance'],
  ['partner-csob.png', 'ČSOB'],
  ['partner-polnoinfo.png', 'Poľnoinfo'],
  ['partner-slovensky-cukrovarsky-spolok.png', 'Slovenský cukrovarský spolok'],
  ['partner-unicredit-bank.jpg', 'UniCredit Bank'],
  ['partner-visegrad-fund.png', 'Visegrad Fund'],
  ['partner-zdruzenie-vyrobcov-liehu-a-liehovin-na-slovensku.gif', 'Združenie výrobcov liehu'],
  ['partner-zpo.jpg', 'Zväz priemyselných odvetví'],
]

const CARD = 'background:#fff;border-radius:12px;padding:22px 20px;' +
  'box-shadow:0 2px 16px rgba(0,0,0,0.07),0 1px 3px rgba(0,0,0,0.04);'
const CARD_TITLE = 'font-size:21px;font-weight:700;color:#000;margin-bottom:10px;line-height:1.3;'
const CARD_LINK = 'display:inline-flex;align-items:center;gap:4px;font-size:12px;font-weight:600;' +
  'color:#009a44;text-decoration:none;letter-spacing:0.04em;' +
  'border-bottom:1px solid rgba(0,154,68,0.3);padding-bottom:1px;'

/** The blocks the live sppk.sk actually shows in its right column today. */
const TODAY_SIDEBAR = `    <aside style="display:flex;flex-direction:column;gap:20px;">

      <div style="${CARD}">
        <div style="${CARD_TITLE}">Staň sa členom</div>
        <p style="margin:0 0 12px;font-size:13px;color:#555;line-height:1.6;">Ponuka výpočtu výživovej hodnoty potravín s 20 % zľavou pre členov SPPK.</p>
        <a href="#" style="${CARD_LINK}">Viac informácií o členstve →</a>
      </div>

      <div style="${CARD}">
        <div style="${CARD_TITLE}">Arbitrážny súd</div>
        <a href="#" style="${CARD_LINK}">Rozhodcovský súd SPPK →</a>
      </div>

      <div style="${CARD}">
        <div style="${CARD_TITLE}">Počasie</div>
        <div style="border-radius:12px;background:#f4f7f5;border:1px solid rgba(0,154,68,0.18);height:130px;display:flex;align-items:center;justify-content:center;">
          <span style="font-size:10.5px;color:#aaa;font-style:italic;letter-spacing:0.04em;">images/pocasie.png</span>
        </div>
      </div>

      <div style="${CARD}">
        <div style="${CARD_TITLE}">Najčítanejšie články</div>
        <ol style="margin:0;padding-left:18px;font-size:13.5px;line-height:1.6;color:#333;">
          <li style="margin-bottom:8px;"><a href="#" style="color:#333;text-decoration:none;" class="notice-item">Pozývame na Agrokomplex 2026</a></li>
          <li style="margin-bottom:8px;"><a href="#" style="color:#333;text-decoration:none;" class="notice-item">30 miliónov eur za sucho</a></li>
          <li style="margin-bottom:8px;"><a href="#" style="color:#333;text-decoration:none;" class="notice-item">Deň cukrovej repy</a></li>
          <li style="margin-bottom:8px;"><a href="#" style="color:#333;text-decoration:none;" class="notice-item">Prečítajte si dôležitú informáciu</a></li>
          <li><a href="#" style="color:#333;text-decoration:none;" class="notice-item">Úspech slovenských vín</a></li>
        </ol>
      </div>

      <div style="${CARD}">
        <div style="${CARD_TITLE}">O potravinách</div>
        <a href="#" style="${CARD_LINK}">opotravinach.sk →</a>
      </div>

      <div style="${CARD}">
        <div style="${CARD_TITLE}">Adresa</div>
        <address style="font-style:normal;font-size:13.5px;line-height:1.75;color:#444;">
          Slovenská poľnohospodárska<br />a potravinárska komora<br />
          Záhradnícka 21, 811 07 Bratislava<br />
          <a href="tel:+421255564111" style="color:#009a44;text-decoration:none;">02/555 64 111</a><br />
          <a href="mailto:sppk@sppk.sk" style="color:#009a44;text-decoration:none;">sppk@sppk.sk</a>
        </address>
      </div>

      <div style="${CARD}">
        <div style="${CARD_TITLE}">Trhové informácie</div>
        <a href="#" style="${CARD_LINK}">Poľnoinfo.sk →</a>
      </div>

    </aside>`

const EMPTY_SIDEBAR = `    <!-- Right third deliberately left empty: reserved slot the chamber fills itself. -->
    <aside aria-label="Voľný priestor" style="min-height:400px;border:1.5px dashed rgba(0,154,68,0.35);border-radius:12px;display:flex;align-items:center;justify-content:center;padding:24px;">
      <span style="font-size:12.5px;color:#9bb3a5;letter-spacing:0.05em;text-align:center;line-height:1.7;">Voľný priestor<br />na doplnenie obsahu</span>
    </aside>`

const source = await readFile(BASE, 'utf8')

const asideStart = source.indexOf('    <!-- Sidebar -->')
const asideEnd = source.indexOf('</aside>', asideStart) + '</aside>'.length
if (asideStart < 0) throw new Error('sidebar block not found in the delivered homepage')
const before = source.slice(0, asideStart)
const after = source.slice(asideEnd)

/** Real logo and the ten real sponsor logos, in place of the design's placeholders. */
function realAssets(html) {
  let out = html.replace('src="../images/sppk-logo.png"', 'src="images/sppk-logo.png"')
  const gridStart = out.indexOf('<div class="partners-grid"')
  const gridEnd = out.indexOf('</div>\n  </div>\n</section>', gridStart)
  const cells = PARTNERS.map(([file, name]) =>
    `      <a class="partner-logo" href="#" title="${name}" style="display:flex;align-items:center;` +
    `justify-content:center;padding:28px 24px;min-height:108px;` +
    `border-right:1px solid rgba(0,0,0,0.07);border-bottom:1px solid rgba(0,0,0,0.07);">` +
    `<img src="images/${file}" alt="${name}" style="max-width:100%;max-height:52px;width:auto;` +
    `height:auto;object-fit:contain;" /></a>`,
  ).join('\n')
  return out.slice(0, gridStart) +
    '<div class="partners-grid" style="display:grid;grid-template-columns:repeat(5,1fr);' +
    'border:1px solid rgba(0,0,0,0.07);border-top:0;border-left:0;border-radius:12px;' +
    `overflow:hidden;">\n${cells}\n    ` + out.slice(gridEnd)
}

const VARIANTS = [
  ['uvod-navrh.html', source, 'podľa dodaného návrhu'],
  ['uvod-volna-tretina.html', before + EMPTY_SIDEBAR + after, 'pravá tretina voľná'],
  ['uvod-dnesne-widgety.html', before + TODAY_SIDEBAR + after, 'pravá tretina ako dnes na sppk.sk'],
  [
    'uvod-cela-sirka.html',
    (before + after)
      .replace('grid-template-columns:2fr 1fr;gap:60px;', 'grid-template-columns:1fr;gap:60px;')
      .replace('<!-- Sidebar -->', ''),
    'bez bočného stĺpca, obsah cez celú šírku',
  ],
]

for (const [name, html, note] of VARIANTS) {
  await writeFile(ROOT + 'templates/' + name, realAssets(html))
  console.log(`templates/${name} — ${note}`)
}
