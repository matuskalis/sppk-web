import { useState, useEffect } from 'react'

// ─── Data ────────────────────────────────────────────────────────────────────

const NAV_LINKS = ['Úvod', 'Tlačové správy', 'Dokumenty', 'Legislatíva', 'O nás', 'Kontakt']


const CAROUSEL_SLIDES = [
  {
    img: 'https://images.unsplash.com/photo-1581377193405-19de7f09248f?w=1600&h=700&fit=crop&auto=format',
    title: 'Slovenské poľnohospodárstvo v roku 2026',
    subtitle: 'Komora zastupuje záujmy farmárov a potravinárskych podnikov na celom Slovensku',
  },
  {
    img: 'https://images.unsplash.com/photo-1560693225-b8507d6f3aa9?w=1600&h=700&fit=crop&auto=format',
    title: 'Podpora udržateľného rozvoja vidieka',
    subtitle: 'Strategické programy pre modernizáciu agrárneho sektora 2026–2030',
  },
  {
    img: 'https://images.unsplash.com/photo-1557844352-761f2565b576?w=1600&h=700&fit=crop&auto=format',
    title: 'Kvalitné slovenské potraviny pre európske trhy',
    subtitle: 'Certifikácia, kontrola kvality a medzinárodné zastúpenie slovenských výrobcov',
  },
  {
    img: 'https://images.unsplash.com/photo-1629708204327-b94ee06c2cf6?w=1600&h=700&fit=crop&auto=format',
    title: 'Zelená budúcnosť slovenského vidieka',
    subtitle: 'Inovatívne prístupy k ekologickému poľnohospodárstvu a ochrane pôdy',
  },
]

const ARTICLES = [
  {
    date: '14. augusta 2026',
    title: 'SPPK víta schválenie nových podporných opatrení pre farmárov zo Slovenského parlamentu',
    snippet: 'Slovenská poľnohospodárska a potravinárska komora pozitívne hodnotí prijatie balíka podporných opatrení, ktoré pomôžu malým a stredným podnikom v agrárnom sektore.',
    img: 'https://images.unsplash.com/photo-1595976281013-8024ecc02575?w=200&h=160&fit=crop&auto=format',
    category: 'Tlačové správy',
  },
  {
    date: '12. augusta 2026',
    title: 'Výsledky agrárneho summitu v Bratislave: Nové partnerstvá pre export potravín do EÚ',
    snippet: 'Na medzinárodnom summite v Bratislave boli podpísané kľúčové dohody, ktoré otvoria nové exportné koridory pre slovenských výrobcov potravín na európskych trhoch.',
    img: 'https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=200&h=160&fit=crop&auto=format',
    category: 'Udalosti',
  },
  {
    date: '9. augusta 2026',
    title: 'SPPK upozorňuje na legislatívne zmeny v oblasti pesticídov platné od septembra 2026',
    snippet: 'Nové nariadenia Európskej komisie výrazne obmedzia používanie určitých látok. Komora organizuje bezplatné konzultácie pre svojich členov v celej SR.',
    img: 'https://images.unsplash.com/photo-1578853464641-ef3e6d47e16c?w=200&h=160&fit=crop&auto=format',
    category: 'Legislatíva',
  },
  {
    date: '7. augusta 2026',
    title: 'Správa: Tehoročná úroda obilia prekonala priemery posledných piatich rokov',
    snippet: 'Prvé výsledky žatevnej sezóny 2026 ukazujú nadpriemerné výnosy pšenice a kukurice. Komora zverejní komplexnú analýzu koncom mesiaca.',
    img: 'https://images.unsplash.com/photo-1646684662890-a5076aef9010?w=200&h=160&fit=crop&auto=format',
    category: 'Správy',
  },
  {
    date: '4. augusta 2026',
    title: 'Pozvánka na výstavu AGROKOMPLEX 2026 – záštita SPPK',
    snippet: 'Medzinárodná agrárna výstava AGROKOMPLEX v Nitre sa koná od 20. do 24. augusta. SPPK je generálnym partnerom podujatia a bude mať vlastný pavilón.',
    img: 'https://images.unsplash.com/photo-1566385101042-1a0aa0c1268c?w=200&h=160&fit=crop&auto=format',
    category: 'Udalosti',
  },
]

const CALENDAR_EVENTS = [
  { day: 16, month: 'Aug', title: 'Rokovanie rady SPPK', location: 'Bratislava' },
  { day: 20, month: 'Aug', title: 'AGROKOMPLEX 2026', location: 'Nitra' },
  { day: 28, month: 'Aug', title: 'Seminár: Agrárne právo EÚ', location: 'Online' },
  { day: 5, month: 'Sep', title: 'Konferencia – Udržateľné potraviny', location: 'Košice' },
]

const PARTNERS = [
  'Ministerstvo pôdohospodárstva SR',
  'Slovenská poľnohospodárska univerzita',
  'Agropodnik Nitra a.s.',
  'Mliekareň Žilina',
  'Vinárske závody Modra',
  'Agroslov s.r.o.',
  'Slovenský zväz výrobcov ovocia',
  'Potravinárska komora ČR',
  'COPA-COGECA Brussels',
  'Agro-Invest Trnava',
  'Slovenský mäsový priemysel',
  'Obilnársky zväz SR',
  'Zelená energia agro',
  'Bratislavský potravinársky klaster',
  'Farmárske trhy Slovensko',
]

// ─── Social Icons (SVG inline) ─────────────────────────────────────────────

function IconFacebook() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  )
}
function IconTwitter() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
    </svg>
  )
}
function IconLinkedin() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect x="2" y="9" width="4" height="12" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  )
}
function IconYoutube() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 0 0-1.95 1.96A29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.95 1.95C5.12 20 12 20 12 20s6.88 0 8.59-.47a2.78 2.78 0 0 0 1.95-1.95A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z" />
      <polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill="white" />
    </svg>
  )
}
function IconInstagram() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" />
    </svg>
  )
}
function IconSearch() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  )
}
function IconChevronLeft() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="15 18 9 12 15 6" />
    </svg>
  )
}
function IconChevronRight() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  )
}
function IconMapPin() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  )
}

// ─── Upper Header ─────────────────────────────────────────────────────────

function UpperHeader() {
  return (
    <header style={{ backgroundColor: '#009a44', width: '100%' }}>
      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 24px',
          display: 'flex',
          alignItems: 'stretch',
          justifyContent: 'space-between',
          minHeight: '80px',
        }}
      >
        {/* Logo + Name */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', paddingTop: '14px', paddingBottom: '14px' }}>
          {/* Logo slot — 52px height placeholder */}
          <div
            style={{
              width: '52px',
              height: '52px',
              borderRadius: '6px',
              backgroundColor: 'rgba(255,255,255,0.18)',
              border: '1.5px solid rgba(255,255,255,0.35)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              overflow: 'hidden',
            }}
          >
            <img
              src="images/sppk-logo.png"
              alt="SPPK logo"
              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
              onError={(e) => {
                const el = e.currentTarget
                el.style.display = 'none'
                const parent = el.parentElement
                if (parent) {
                  parent.innerHTML =
                    '<span style="color:white;font-size:11px;font-weight:700;text-align:center;line-height:1.2;padding:4px">SPPK</span>'
                }
              }}
            />
          </div>
          <div>
            <div
              style={{
                color: '#ffffff',
                fontFamily: "'DM Serif Display', serif",
                fontSize: '15px',
                fontWeight: 400,
                letterSpacing: '0.01em',
                lineHeight: 1.25,
                maxWidth: '360px',
              }}
            >
              Slovenská poľnohospodárska
            </div>
            <div
              style={{
                color: '#ffffff',
                fontFamily: "'DM Serif Display', serif",
                fontSize: '15px',
                fontWeight: 400,
                letterSpacing: '0.01em',
                lineHeight: 1.25,
              }}
            >
              a potravinárska komora
            </div>
          </div>
        </div>

        {/* Right: Search + Language + Social */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'flex-end',
            gap: '10px',
            paddingTop: '12px',
            paddingBottom: '12px',
          }}
        >
          {/* Top layer: search + languages */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: 'rgba(255,255,255,0.15)',
                border: '1px solid rgba(255,255,255,0.25)',
                borderRadius: '4px',
                padding: '6px 12px',
              }}
            >
              <IconSearch />
              <input
                type="text"
                placeholder="Hľadať na sppk.sk..."
                style={{
                  background: 'none',
                  border: 'none',
                  outline: 'none',
                  color: '#ffffff',
                  fontSize: '13px',
                  fontFamily: "'Inter', sans-serif",
                  width: '180px',
                  letterSpacing: '0.02em',
                }}
              />
            </div>
            <div
              style={{
                display: 'flex',
                gap: '4px',
                alignItems: 'center',
                color: '#ffffff',
                fontSize: '11.5px',
                fontWeight: 500,
                letterSpacing: '0.08em',
              }}
            >
              {['ENGLISH', 'DEUTSCH', 'FRANCAIS'].map((lang, i) => (
                <span key={lang} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <button
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#ffffff',
                      fontSize: '11.5px',
                      fontWeight: 500,
                      letterSpacing: '0.08em',
                      cursor: 'pointer',
                      padding: '2px 0',
                      fontFamily: "'Inter', sans-serif",
                    }}
                    onMouseEnter={e => (e.currentTarget.style.opacity = '0.7')}
                    onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
                  >
                    {lang}
                  </button>
                  {i < 2 && <span style={{ opacity: 0.4 }}>|</span>}
                </span>
              ))}
            </div>
          </div>

          {/* Bottom layer: social icons */}
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            {[
              { Icon: IconFacebook, label: 'Facebook' },
              { Icon: IconTwitter, label: 'Twitter / X' },
              { Icon: IconLinkedin, label: 'LinkedIn' },
              { Icon: IconYoutube, label: 'YouTube' },
              { Icon: IconInstagram, label: 'Instagram' },
            ].map(({ Icon, label }) => (
              <button
                key={label}
                aria-label={label}
                style={{
                  background: 'rgba(255,255,255,0.15)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '4px',
                  color: '#ffffff',
                  cursor: 'pointer',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'background 0.2s ease',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.28)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.15)')}
              >
                <Icon />
              </button>
            ))}
          </div>
        </div>
      </div>
    </header>
  )
}

// ─── Nav Bar ──────────────────────────────────────────────────────────────

function NavBar({ active, setActive }: { active: string; setActive: (v: string) => void }) {
  return (
    <nav
      style={{
        backgroundColor: '#ffffff',
        borderBottom: '1px solid #009a44',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        boxShadow: '0 2px 12px rgba(0,154,68,0.06)',
      }}
    >
      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 24px',
          display: 'flex',
          alignItems: 'center',
          gap: '2px',
        }}
      >
        {NAV_LINKS.map(link => (
          <button
            key={link}
            className="nav-link"
            onClick={() => setActive(link)}
            style={{
              background: 'none',
              border: 'none',
              color: active === link ? '#009a44' : '#000000',
              fontSize: '13.5px',
              fontWeight: active === link ? 600 : 400,
              letterSpacing: '0.03em',
              cursor: 'pointer',
              padding: '16px 18px',
              fontFamily: "'Inter', sans-serif",
              transition: 'color 0.2s ease',
              position: 'relative',
            }}
            onMouseEnter={e => {
              if (active !== link) e.currentTarget.style.color = '#009a44'
            }}
            onMouseLeave={e => {
              if (active !== link) e.currentTarget.style.color = '#000000'
            }}
          >
            {link}
            {active === link && (
              <span
                style={{
                  position: 'absolute',
                  bottom: 0,
                  left: '18px',
                  right: '18px',
                  height: '2px',
                  backgroundColor: '#009a44',
                  borderRadius: '1px 1px 0 0',
                }}
              />
            )}
          </button>
        ))}
      </div>
    </nav>
  )
}

// ─── Hero Carousel ────────────────────────────────────────────────────────

function HeroCarousel() {
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent(prev => (prev + 1) % CAROUSEL_SLIDES.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [])

  const prev = () => setCurrent(c => (c - 1 + CAROUSEL_SLIDES.length) % CAROUSEL_SLIDES.length)
  const next = () => setCurrent(c => (c + 1) % CAROUSEL_SLIDES.length)

  return (
    <div style={{ position: 'relative', width: '100%', height: '520px', overflow: 'hidden', backgroundColor: '#1a2a1f' }}>
      {CAROUSEL_SLIDES.map((slide, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            inset: 0,
            opacity: i === current ? 1 : 0,
            transition: 'opacity 0.9s cubic-bezier(0.4,0,0.2,1)',
            pointerEvents: i === current ? 'auto' : 'none',
          }}
        >
          <img
            src={slide.img}
            alt={slide.title}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
          {/* Gradient overlay */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(to right, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.2) 60%, transparent 100%)',
            }}
          />
          {/* Text badge */}
          <div
            style={{
              position: 'absolute',
              bottom: '72px',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '100%',
              maxWidth: '1200px',
              padding: '0 24px',
            }}
          >
            <div
              style={{
                display: 'inline-block',
                backgroundColor: '#009a44',
                color: '#ffffff',
                fontSize: '11px',
                fontWeight: 600,
                letterSpacing: '0.12em',
                padding: '5px 14px',
                borderRadius: '3px',
                marginBottom: '14px',
                textTransform: 'uppercase',
              }}
            >
              SPPK — Správy
            </div>
            <h2
              style={{
                color: '#ffffff',
                fontFamily: "'DM Serif Display', serif",
                fontSize: 'clamp(24px, 3.5vw, 42px)',
                fontWeight: 400,
                lineHeight: 1.15,
                margin: '0 0 12px',
                maxWidth: '640px',
                textShadow: '0 2px 12px rgba(0,0,0,0.3)',
              }}
            >
              {slide.title}
            </h2>
            <p
              style={{
                color: 'rgba(255,255,255,0.85)',
                fontSize: '15px',
                lineHeight: 1.55,
                margin: 0,
                maxWidth: '520px',
                fontWeight: 300,
              }}
            >
              {slide.subtitle}
            </p>
          </div>
        </div>
      ))}

      {/* Prev/Next controls */}
      {[
        { action: prev, side: 'left', icon: <IconChevronLeft /> },
        { action: next, side: 'right', icon: <IconChevronRight /> },
      ].map(({ action, side, icon }) => (
        <button
          key={side}
          onClick={action}
          style={{
            position: 'absolute',
            top: '50%',
            [side]: '20px',
            transform: 'translateY(-50%)',
            background: 'rgba(0,0,0,0.35)',
            border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: '50%',
            color: '#ffffff',
            width: '44px',
            height: '44px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'background 0.2s ease',
            backdropFilter: 'blur(4px)',
          }}
          onMouseEnter={e => (e.currentTarget.style.background = 'rgba(0,154,68,0.7)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'rgba(0,0,0,0.35)')}
        >
          {icon}
        </button>
      ))}

      {/* Slide indicators */}
      <div
        style={{
          position: 'absolute',
          bottom: '24px',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          gap: '8px',
        }}
      >
        {CAROUSEL_SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            style={{
              width: i === current ? '28px' : '8px',
              height: '8px',
              borderRadius: '4px',
              border: 'none',
              backgroundColor: i === current ? '#009a44' : 'rgba(255,255,255,0.5)',
              cursor: 'pointer',
              padding: 0,
              transition: 'all 0.3s ease',
            }}
          />
        ))}
      </div>
    </div>
  )
}

// ─── Article Card ─────────────────────────────────────────────────────────

function ArticleCard({ article }: { article: typeof ARTICLES[0] }) {
  const [hovered, setHovered] = useState(false)

  return (
    <article
      className="article-card"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex',
        gap: '20px',
        paddingBottom: '28px',
        marginBottom: '28px',
        borderBottom: '1px solid rgba(0,0,0,0.07)',
        cursor: 'pointer',
      }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
          <span
            style={{
              fontSize: '12px',
              fontWeight: 600,
              color: '#009a44',
              letterSpacing: '0.02em',
              fontFamily: "'Inter', sans-serif",
            }}
          >
            {article.date}
          </span>
          <span
            style={{
              fontSize: '11px',
              fontWeight: 500,
              color: '#ffffff',
              backgroundColor: '#009a44',
              padding: '2px 8px',
              borderRadius: '3px',
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
            }}
          >
            {article.category}
          </span>
        </div>
        <h3
          style={{
            margin: '0 0 8px',
            fontFamily: "'DM Serif Display', serif",
            fontSize: '18px',
            fontWeight: 400,
            color: hovered ? '#009a44' : '#000000',
            lineHeight: 1.3,
            transition: 'color 0.2s ease',
          }}
        >
          {article.title}
        </h3>
        <p
          style={{
            margin: 0,
            fontSize: '13.5px',
            color: '#555555',
            lineHeight: 1.6,
            fontWeight: 300,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {article.snippet}
        </p>
        <button
          style={{
            marginTop: '10px',
            background: 'none',
            border: 'none',
            color: '#009a44',
            fontSize: '12.5px',
            fontWeight: 600,
            letterSpacing: '0.05em',
            cursor: 'pointer',
            padding: 0,
            fontFamily: "'Inter', sans-serif",
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
          }}
        >
          Čítať viac →
        </button>
      </div>
      <div
        style={{
          width: '110px',
          height: '88px',
          borderRadius: '12px',
          overflow: 'hidden',
          flexShrink: 0,
          backgroundColor: '#e6f5ed',
        }}
      >
        <img
          src={article.img}
          alt={article.title}
          className="article-thumb"
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
        />
      </div>
    </article>
  )
}

// ─── Sidebar ──────────────────────────────────────────────────────────────

function Sidebar() {
  return (
    <aside style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Calendar widget */}
      <div
        style={{
          background: '#ffffff',
          borderRadius: '14px',
          padding: '22px 20px',
          boxShadow: '0 4px 24px rgba(0,0,0,0.07), 0 1px 4px rgba(0,0,0,0.04)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '16px',
          }}
        >
          <h4
            style={{
              margin: 0,
              fontSize: '14px',
              fontWeight: 700,
              color: '#000000',
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
            }}
          >
            Kalendár aktivít
          </h4>
          <span style={{ fontSize: '11px', color: '#009a44', fontWeight: 600, cursor: 'pointer' }}>
            Všetky →
          </span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {CALENDAR_EVENTS.map((ev, i) => (
            <div
              key={i}
              style={{
                display: 'flex',
                gap: '12px',
                alignItems: 'flex-start',
                padding: '10px',
                borderRadius: '8px',
                backgroundColor: 'rgba(0,154,68,0.04)',
                border: '1px solid rgba(0,154,68,0.1)',
                cursor: 'pointer',
                transition: 'background 0.2s ease',
              }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'rgba(0,154,68,0.09)')}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'rgba(0,154,68,0.04)')}
            >
              <div
                style={{
                  minWidth: '40px',
                  textAlign: 'center',
                  backgroundColor: '#009a44',
                  borderRadius: '6px',
                  padding: '4px 0',
                  flexShrink: 0,
                }}
              >
                <div style={{ color: '#ffffff', fontSize: '16px', fontWeight: 700, lineHeight: 1.1 }}>
                  {ev.day}
                </div>
                <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: '10px', fontWeight: 500, letterSpacing: '0.08em' }}>
                  {ev.month.toUpperCase()}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#000000', lineHeight: 1.3, marginBottom: '3px' }}>
                  {ev.title}
                </div>
                <div style={{ fontSize: '11.5px', color: '#777777', display: 'flex', alignItems: 'center', gap: '3px' }}>
                  <IconMapPin /> {ev.location}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Weather widget */}
      <div
        style={{
          background: 'linear-gradient(135deg, #009a44 0%, #006e30 100%)',
          borderRadius: '14px',
          padding: '22px 20px',
          boxShadow: '0 4px 24px rgba(0,154,68,0.25)',
          color: '#ffffff',
        }}
      >
        <h4
          style={{
            margin: '0 0 14px',
            fontSize: '14px',
            fontWeight: 700,
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
            opacity: 0.85,
          }}
        >
          Počasie — Nitra
        </h4>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
          <span className="weather-icon">⛅</span>
          <div>
            <div style={{ fontSize: '36px', fontFamily: "'DM Serif Display', serif", lineHeight: 1 }}>24°C</div>
            <div style={{ fontSize: '13px', opacity: 0.8, marginTop: '3px' }}>Čiastočne oblačno</div>
          </div>
        </div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '6px',
            paddingTop: '14px',
            borderTop: '1px solid rgba(255,255,255,0.2)',
          }}
        >
          {[
            { day: 'Pi', icon: '☀️', temp: '27°' },
            { day: 'So', icon: '⛅', temp: '23°' },
            { day: 'Ne', icon: '🌧', temp: '19°' },
            { day: 'Po', icon: '☀️', temp: '26°' },
          ].map(d => (
            <div key={d.day} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '10.5px', opacity: 0.7, marginBottom: '4px', fontWeight: 600, letterSpacing: '0.06em' }}>
                {d.day}
              </div>
              <div style={{ fontSize: '18px' }}>{d.icon}</div>
              <div style={{ fontSize: '12px', fontWeight: 700, marginTop: '3px' }}>{d.temp}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Notice box */}
      <div
        style={{
          borderRadius: '14px',
          padding: '20px',
          boxShadow: '0 4px 24px rgba(0,0,0,0.07)',
          backgroundColor: '#ffffff',
          border: '1px solid rgba(0,154,68,0.15)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '10px',
          }}
        >
          <div
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: '#009a44',
              flexShrink: 0,
            }}
          />
          <h4
            style={{
              margin: 0,
              fontSize: '12px',
              fontWeight: 700,
              color: '#009a44',
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
            }}
          >
            Aktívne výzvy
          </h4>
        </div>
        {[
          'Dotačná výzva PRV SR – uzávierka 31. aug. 2026',
          'Registrácia na AGROKOMPLEX 2026 – posledné miesta',
          'Konzultácie ku CAP 2025 plánu – SPPK Bratislava',
        ].map((notice, i) => (
          <div
            key={i}
            style={{
              fontSize: '12.5px',
              color: '#333333',
              padding: '8px 0',
              borderBottom: i < 2 ? '1px solid rgba(0,0,0,0.06)' : 'none',
              lineHeight: 1.45,
              cursor: 'pointer',
            }}
            onMouseEnter={e => (e.currentTarget.style.color = '#009a44')}
            onMouseLeave={e => (e.currentTarget.style.color = '#333333')}
          >
            → {notice}
          </div>
        ))}
      </div>
    </aside>
  )
}

// ─── Shared sub-components ────────────────────────────────────────────────────

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
      <h2
        style={{
          margin: 0,
          fontFamily: "'Inter', sans-serif",
          fontSize: '24px',
          fontWeight: 700,
          color: '#009a44',
          letterSpacing: '-0.01em',
          whiteSpace: 'nowrap',
        }}
      >
        {children}
      </h2>
      <div style={{ flex: 1, height: '1px', background: 'linear-gradient(to right, rgba(0,154,68,0.35), transparent)' }} />
    </div>
  )
}

function ContactLine({ label, value, href }: { label: string; value: string; href?: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <span
        style={{
          fontSize: '16px',
          fontFamily: "'Inter', sans-serif",
          color: '#333333',
          fontWeight: 600,
          minWidth: '58px',
          letterSpacing: '0.01em',
        }}
      >
        {label}
      </span>
      {href ? (
        <a
          href={href}
          style={{
            fontSize: '16px',
            fontFamily: "'Inter', sans-serif",
            color: '#009a44',
            fontWeight: 700,
            textDecoration: 'none',
            letterSpacing: '0.01em',
          }}
          onMouseEnter={e => (e.currentTarget.style.textDecoration = 'underline')}
          onMouseLeave={e => (e.currentTarget.style.textDecoration = 'none')}
        >
          {value}
        </a>
      ) : (
        <span
          style={{
            fontSize: '16px',
            fontFamily: "'Inter', sans-serif",
            color: '#222222',
            fontWeight: 400,
            letterSpacing: '0.02em',
          }}
        >
          {value}
        </span>
      )}
    </div>
  )
}

function PortraitPlaceholder({ initials, size = 96 }: { initials: string; size?: number }) {
  return (
    <div
      style={{
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: '12px',
        background: 'linear-gradient(145deg, #e8f5ee 0%, #c8e8d4 100%)',
        border: '1px solid rgba(0,154,68,0.18)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        overflow: 'hidden',
      }}
    >
      <span
        style={{
          fontFamily: "'DM Serif Display', serif",
          fontSize: `${Math.round(size * 0.32)}px`,
          color: '#009a44',
          fontWeight: 400,
          letterSpacing: '0.04em',
          userSelect: 'none',
        }}
      >
        {initials}
      </span>
    </div>
  )
}

// ─── Úrad komory – contacts directory ────────────────────────────────────────

const CARD_SHADOW = '0 4px 24px rgba(0,0,0,0.08), 0 1px 4px rgba(0,0,0,0.04)'
const ROLE_LABEL: React.CSSProperties = {
  fontSize: '11px',
  fontWeight: 700,
  letterSpacing: '0.12em',
  color: '#009a44',
  textTransform: 'uppercase' as const,
  marginBottom: '8px',
  fontFamily: "'Inter', sans-serif",
}

function UradKomory() {
  return (
    <div style={{ fontFamily: "'Inter', sans-serif" }}>

      {/* 1 · Breadcrumb */}
      <nav style={{ marginBottom: '28px' }}>
        {(['Úvod', 'Kontakt'] as const).map(crumb => (
          <span key={crumb}>
            <a
              href="#"
              style={{ fontSize: '13px', color: '#6c757d', textDecoration: 'none', letterSpacing: '0.02em' }}
              onMouseEnter={e => (e.currentTarget.style.color = '#009a44')}
              onMouseLeave={e => (e.currentTarget.style.color = '#6c757d')}
            >
              {crumb}
            </a>
            <span style={{ fontSize: '13px', color: '#b0b8c1', margin: '0 7px' }}>/</span>
          </span>
        ))}
        <span style={{ fontSize: '13px', color: '#009a44', fontWeight: 600 }}>Úrad komory</span>
      </nav>

      {/* 2 · Hero heading */}
      <h1
        style={{
          margin: '0 0 48px',
          fontFamily: "'Inter', sans-serif",
          fontSize: '36px',
          fontWeight: 800,
          color: '#009a44',
          lineHeight: 1.18,
          letterSpacing: '-0.02em',
        }}
      >
        Úrad Slovenskej poľnohospodárskej<br />
        a potravinárskej komory
      </h1>

      {/* 3 · Vedenie úradu */}
      <div style={{ marginBottom: '52px' }}>
        <SectionHeading>Vedenie úradu</SectionHeading>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>

          {/* Card – Riaditeľ */}
          <div
            style={{
              background: '#ffffff',
              borderRadius: '12px',
              padding: '28px 32px',
              boxShadow: CARD_SHADOW,
              display: 'flex',
              gap: '28px',
              alignItems: 'flex-start',
              width: '100%',
            }}
          >
            <PortraitPlaceholder initials="JA" size={96} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={ROLE_LABEL}>Riaditeľ úradu</div>
              <div style={{ fontSize: '20px', fontWeight: 700, color: '#000000', marginBottom: '4px', letterSpacing: '-0.01em', lineHeight: 1.25 }}>
                Ing. Jozef Artim, CSc.
              </div>
              <div style={{ fontSize: '14px', color: '#6c757d', marginBottom: '20px', fontWeight: 400 }}>
                riaditeľ úradu
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <ContactLine label="Mob.:" value="+421 903 588 106" />
                <ContactLine label="E-mail:" value="artim@sppk.sk" href="mailto:artim@sppk.sk" />
              </div>
            </div>
          </div>

          {/* Card – Sekretariát */}
          <div
            style={{
              background: '#ffffff',
              borderRadius: '12px',
              padding: '28px 32px',
              boxShadow: CARD_SHADOW,
              width: '100%',
            }}
          >
            <div style={ROLE_LABEL}>Sekretariát &amp; Podateľňa</div>
            <div style={{ fontSize: '20px', fontWeight: 700, color: '#000000', marginBottom: '4px', letterSpacing: '-0.01em' }}>
              Sekretariát SPPK
            </div>
            <div style={{ fontSize: '14px', color: '#6c757d', marginBottom: '20px' }}>
              príjem dokumentov a korešpondencie
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <ContactLine label="Mob.:" value="+421 903 588 106" />
              <ContactLine label="E-mail:" value="sppk@sppk.sk" href="mailto:sppk@sppk.sk" />
            </div>
          </div>

        </div>
      </div>

      {/* 4 · Hovorca a médiá */}
      <div style={{ marginBottom: '52px' }}>
        <SectionHeading>Hovorca a médiá</SectionHeading>

        <div
          style={{
            background: '#ffffff',
            borderRadius: '12px',
            padding: '28px 32px',
            boxShadow: CARD_SHADOW,
            display: 'flex',
            gap: '28px',
            alignItems: 'flex-start',
            width: '100%',
          }}
        >
          <PortraitPlaceholder initials="JH" size={96} />
          <div style={{ flex: 1 }}>
            <div style={ROLE_LABEL}>Tlačový odbor</div>
            <div style={{ fontSize: '20px', fontWeight: 700, color: '#000000', marginBottom: '4px', letterSpacing: '-0.01em' }}>
              Jana Holéciová
            </div>
            <div style={{ fontSize: '14px', color: '#6c757d', marginBottom: '20px' }}>
              hovorkyňa SPPK
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <ContactLine label="Mob.:" value="+421 911 123 456" />
              <ContactLine label="E-mail:" value="holeciova@sppk.sk" href="mailto:holeciova@sppk.sk" />
            </div>
          </div>
        </div>
      </div>

      {/* 5 · Odbory úradu */}
      <div>
        <SectionHeading>Odbory úradu</SectionHeading>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>

          {/* Dept 1 – Poľnohospodárstvo (with duties) */}
          <div
            style={{
              background: '#ffffff',
              borderRadius: '12px',
              padding: '28px 32px',
              boxShadow: CARD_SHADOW,
              width: '100%',
            }}
          >
            <div style={ROLE_LABEL}>Odbor poľnohospodárstva a služieb</div>
            <div style={{ fontSize: '20px', fontWeight: 700, color: '#000000', marginBottom: '4px', letterSpacing: '-0.01em' }}>
              Ing. Ján Baršváry
            </div>
            <div style={{ fontSize: '14px', color: '#6c757d', marginBottom: '20px' }}>
              riaditeľ odboru
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px' }}>
              <ContactLine label="Mob.:" value="+421 914 330 001" />
              <ContactLine label="E-mail:" value="barsvary@sppk.sk" href="mailto:barsvary@sppk.sk" />
            </div>
            <div
              style={{
                paddingTop: '20px',
                borderTop: '1px solid rgba(0,154,68,0.15)',
              }}
            >
              <div style={{ fontSize: '12px', fontWeight: 700, color: '#009a44', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '12px' }}>
                Pôsobnosť odboru
              </div>
              <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {[
                  'koordinácia činnosti odboru poľnohospodárstva',
                  'projektové podpory a štátna pomoc',
                  'spolupráca v rámci V4 a krajín 3 morí',
                ].map((duty, i) => (
                  <li key={i} style={{ display: 'flex', gap: '10px', alignItems: 'baseline' }}>
                    <span style={{ color: '#009a44', fontSize: '15px', flexShrink: 0, lineHeight: 1.6, fontWeight: 700 }}>–</span>
                    <span style={{ fontSize: '15px', color: '#333333', lineHeight: 1.6, fontWeight: 400 }}>{duty}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <DeptCard label="Odbor potravinárstva a obchodu" name="Meno Riaditeľa Odboru" title="riaditeľ odboru" phone="+421 905 XXX XXX" email="potravinarstvo@sppk.sk" />
          <DeptCard label="Ekonomický odbor" name="Meno Vedúceho Odboru" title="vedúci odboru" phone="+421 905 XXX XXX" email="ekonomicke@sppk.sk" />
          <DeptCard label="Právny odbor" name="Meno Právnika Odboru" title="vedúci právneho odboru" phone="+421 905 XXX XXX" email="pravne@sppk.sk" />

        </div>
      </div>
    </div>
  )
}

function DeptCard({
  label, name, title, phone, email,
}: {
  label: string; name: string; title: string; phone: string; email: string
}) {
  return (
    <div
      style={{
        background: '#ffffff',
        borderRadius: '12px',
        padding: '28px 32px',
        boxShadow: CARD_SHADOW,
        width: '100%',
      }}
    >
      <div style={ROLE_LABEL}>{label}</div>
      <div style={{ fontSize: '20px', fontWeight: 700, color: '#000000', marginBottom: '4px', letterSpacing: '-0.01em' }}>
        {name}
      </div>
      <div style={{ fontSize: '14px', color: '#6c757d', marginBottom: '20px' }}>{title}</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <ContactLine label="Mob.:" value={phone} />
        <ContactLine label="E-mail:" value={email} href={`mailto:${email}`} />
      </div>
    </div>
  )
}

// ─── Main Content ─────────────────────────────────────────────────────────

function MainContent({ page }: { page: string }) {
  return (
    <section style={{ maxWidth: '1200px', margin: '0 auto', padding: '60px 24px 80px' }}>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '2fr 1fr',
          gap: '60px',
          alignItems: 'start',
        }}
      >
        {/* Left column: article feed OR subpage content */}
        <div>
          {page === 'Kontakt' ? (
            <UradKomory />
          ) : (
            <>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'baseline',
                  justifyContent: 'space-between',
                  marginBottom: '32px',
                }}
              >
                <h2
                  style={{
                    margin: 0,
                    fontFamily: "'DM Serif Display', serif",
                    fontSize: '28px',
                    fontWeight: 400,
                    color: '#000000',
                  }}
                >
                  Najnovšie správy
                </h2>
                <button
                  style={{
                    background: 'none',
                    border: '1px solid #009a44',
                    color: '#009a44',
                    fontSize: '12px',
                    fontWeight: 600,
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                    padding: '7px 18px',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontFamily: "'Inter', sans-serif",
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.backgroundColor = '#009a44'
                    e.currentTarget.style.color = '#ffffff'
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.backgroundColor = 'transparent'
                    e.currentTarget.style.color = '#009a44'
                  }}
                >
                  Všetky správy
                </button>
              </div>
              {ARTICLES.map((article, i) => (
                <ArticleCard key={i} article={article} />
              ))}
            </>
          )}
        </div>

        {/* Sidebar always visible */}
        <Sidebar />
      </div>
    </section>
  )
}

// ─── Partners Footer ──────────────────────────────────────────────────────

function PartnersFooter() {
  const rows = []
  for (let i = 0; i < PARTNERS.length; i += 3) {
    rows.push(PARTNERS.slice(i, i + 3))
  }

  return (
    <section style={{ backgroundColor: '#ffffff', padding: '64px 0 48px', borderTop: '1px solid rgba(0,0,0,0.08)' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <div
            style={{
              fontSize: '11px',
              fontWeight: 700,
              letterSpacing: '0.14em',
              color: '#009a44',
              textTransform: 'uppercase',
              marginBottom: '10px',
            }}
          >
            Naši partneri
          </div>
          <h2
            style={{
              margin: 0,
              fontFamily: "'DM Serif Display', serif",
              fontSize: '26px',
              fontWeight: 400,
              color: '#000000',
            }}
          >
            Inštitúcie a organizácie spolupracujúce s SPPK
          </h2>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0px' }}>
          {rows.map((row, ri) => (
            <div
              key={ri}
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                borderBottom: ri < rows.length - 1 ? '1px solid rgba(0,0,0,0.07)' : 'none',
              }}
            >
              {row.map((partner, pi) => (
                <div
                  key={pi}
                  className="partner-logo"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '28px 32px',
                    borderRight: pi < row.length - 1 ? '1px solid rgba(0,0,0,0.07)' : 'none',
                    cursor: 'pointer',
                  }}
                >
                  <div
                    style={{
                      width: '100%',
                      maxWidth: '220px',
                      height: '52px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: '6px',
                      backgroundColor: 'rgba(0,154,68,0.05)',
                      border: '1px solid rgba(0,154,68,0.12)',
                    }}
                  >
                    <span
                      style={{
                        fontSize: '11.5px',
                        fontWeight: 600,
                        color: '#009a44',
                        textAlign: 'center',
                        padding: '0 12px',
                        lineHeight: 1.3,
                        letterSpacing: '0.02em',
                      }}
                    >
                      {partner}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Legal Footer ─────────────────────────────────────────────────────────

function LegalFooter() {
  return (
    <footer
      style={{
        backgroundColor: '#009a44',
        padding: '18px 24px',
        textAlign: 'center',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '4px',
          flexWrap: 'wrap',
        }}
      >
        {['Copyright ©2026 SPPK', 'Kontaktujte nás', 'Prevádzka: IZPI Nitra', 'Cookies'].map(
          (item, i) => (
            <span key={item} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <a
                href="#"
                style={{
                  color: '#ffffff',
                  fontSize: '12.5px',
                  fontWeight: 400,
                  letterSpacing: '0.03em',
                  textDecoration: 'none',
                  transition: 'opacity 0.2s ease',
                }}
                onMouseEnter={e => (e.currentTarget.style.opacity = '0.7')}
                onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
              >
                {item}
              </a>
              {i < 3 && (
                <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px' }}>|</span>
              )}
            </span>
          )
        )}
      </div>
    </footer>
  )
}

// ─── Galéria – Photo Albums ───────────────────────────────────────────────

const PHOTO_ALBUMS = [
  {
    title: '33. Valné zhromaždenie SPPK',
    count: 45,
    date: '14. jún 2026',
    img: 'https://images.unsplash.com/photo-1662968485284-c421ee71d4a5?w=640&h=360&fit=crop&auto=format',
    alt: 'Valné zhromaždenie SPPK – skupina účastníkov na výstave',
  },
  {
    title: 'Dožinkové slávnosti v regiónoch',
    count: 62,
    date: '28. august 2026',
    img: 'https://images.unsplash.com/photo-1743348230497-fb87be6bc436?w=640&h=360&fit=crop&auto=format',
    alt: 'Dožinkové slávnosti – tradičné kroje',
  },
  {
    title: 'Slávnostné vyhodnotenie Podpor svoj odbor',
    count: 28,
    date: '9. máj 2026',
    img: 'https://images.unsplash.com/photo-1743348230588-93da4d908e22?w=640&h=360&fit=crop&auto=format',
    alt: 'Slávnostné vyhodnotenie súťaže Podpor svoj odbor',
  },
  {
    title: 'AGROKOMPLEX 2026 – stánok SPPK',
    count: 54,
    date: '22. august 2026',
    img: 'https://images.unsplash.com/photo-1667063134166-5a9a68fd8e0c?w=640&h=360&fit=crop&auto=format',
    alt: 'AGROKOMPLEX 2026 – poľnohospodárska technika v teréne',
  },
  {
    title: 'Medzinárodné rokovanie COPA-COGECA',
    count: 33,
    date: '3. apríl 2026',
    img: 'https://images.unsplash.com/photo-1635174815450-337f1f0abf5a?w=640&h=360&fit=crop&auto=format',
    alt: 'Medzinárodné rokovanie COPA-COGECA – farmári pri technike',
  },
  {
    title: 'Seminár: Udržateľné poľnohospodárstvo EÚ',
    count: 19,
    date: '18. február 2026',
    img: 'https://images.unsplash.com/photo-1627920769541-daa658ed6b59?w=640&h=360&fit=crop&auto=format',
    alt: 'Seminár o udržateľnom poľnohospodárstve – pohľad z výšky na pole',
  },
]

const VIDEO_ITEMS = [
  {
    title: 'V obraze s SPPK: Spustili sme nový formát agro-spravodajstva',
    date: '20. augusta 2026',
    duration: '14:32',
    img: 'https://images.unsplash.com/photo-1627920769186-569f1e164a1d?w=640&h=360&fit=crop&auto=format',
    alt: 'Zelené pole – úvodný záber relácie V obraze s SPPK',
  },
  {
    title: 'Rozhovor: Kam smeruje slovenské potravinárstvo v roku 2026?',
    date: '14. augusta 2026',
    duration: '22:08',
    img: 'https://images.unsplash.com/photo-1600747476236-76579658b1b1?w=640&h=360&fit=crop&auto=format',
    alt: 'Poľnohospodárska technika na poli – vizuál reportáže',
  },
  {
    title: 'AGROKOMPLEX 2026: Reportáž zo stánku SPPK v Nitre',
    date: '23. augusta 2026',
    duration: '9:55',
    img: 'https://images.unsplash.com/photo-1667063134166-5a9a68fd8e0c?w=640&h=360&fit=crop&auto=format',
    alt: 'Reportáž z výstavy AGROKOMPLEX v Nitre',
  },
  {
    title: 'Žatva 2026: Rekordná úroda pšenice na juhu Slovenska',
    date: '5. augusta 2026',
    duration: '7:17',
    img: 'https://images.unsplash.com/photo-1627920769541-daa658ed6b59?w=640&h=360&fit=crop&auto=format',
    alt: 'Pohľad z výšky na kombajny pri žatve',
  },
]

function PlayIcon() {
  return (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
      <circle cx="24" cy="24" r="23" fill="rgba(0,0,0,0.55)" stroke="rgba(255,255,255,0.4)" strokeWidth="1" />
      <polygon points="20,15 36,24 20,33" fill="#ffffff" />
    </svg>
  )
}

function AlbumCard({ album }: { album: typeof PHOTO_ALBUMS[0] }) {
  const [hovered, setHovered] = useState(false)

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ cursor: 'pointer' }}
    >
      {/* Cover thumbnail */}
      <div
        style={{
          width: '100%',
          paddingBottom: '62.5%', // 16:10 ratio
          position: 'relative',
          borderRadius: '12px',
          overflow: 'hidden',
          backgroundColor: '#d4e8db',
          marginBottom: '14px',
          boxShadow: hovered
            ? '0 8px 32px rgba(0,154,68,0.18), 0 2px 8px rgba(0,0,0,0.08)'
            : '0 4px 16px rgba(0,0,0,0.08), 0 1px 4px rgba(0,0,0,0.04)',
          transition: 'box-shadow 0.25s ease',
        }}
      >
        <img
          src={album.img}
          alt={album.alt}
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: 'block',
            transform: hovered ? 'scale(1.04)' : 'scale(1)',
            transition: 'transform 0.4s cubic-bezier(0.25,0.46,0.45,0.94)',
          }}
        />
        {/* Folder corner accent */}
        <div
          style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            backgroundColor: 'rgba(0,154,68,0.85)',
            color: '#ffffff',
            fontSize: '11px',
            fontWeight: 700,
            letterSpacing: '0.06em',
            padding: '3px 9px',
            borderRadius: '20px',
            fontFamily: "'Inter', sans-serif",
            backdropFilter: 'blur(4px)',
          }}
        >
          {album.count} obr.
        </div>
      </div>

      {/* Card text */}
      <div>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: '8px', marginBottom: '4px' }}>
          <h3
            style={{
              margin: 0,
              fontFamily: "'Inter', sans-serif",
              fontSize: '15px',
              fontWeight: 700,
              color: hovered ? '#009a44' : '#000000',
              lineHeight: 1.35,
              letterSpacing: '-0.01em',
              transition: 'color 0.2s ease',
              flex: 1,
            }}
          >
            {album.title}
          </h3>
        </div>
        <div style={{ fontSize: '12px', color: '#888888', fontFamily: "'Inter', sans-serif", letterSpacing: '0.02em' }}>
          {album.date}
        </div>
      </div>
    </div>
  )
}

function VideoCard({ video }: { video: typeof VIDEO_ITEMS[0] }) {
  const [hovered, setHovered] = useState(false)

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ cursor: 'pointer' }}
    >
      {/* Video preview */}
      <div
        style={{
          width: '100%',
          paddingBottom: '56.25%', // 16:9
          position: 'relative',
          borderRadius: '12px',
          overflow: 'hidden',
          backgroundColor: '#111b14',
          marginBottom: '14px',
          boxShadow: hovered
            ? '0 8px 32px rgba(0,0,0,0.22), 0 2px 8px rgba(0,0,0,0.12)'
            : '0 4px 16px rgba(0,0,0,0.12), 0 1px 4px rgba(0,0,0,0.06)',
          transition: 'box-shadow 0.25s ease',
        }}
      >
        <img
          src={video.img}
          alt={video.alt}
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: 'block',
            opacity: hovered ? 0.65 : 0.5,
            transition: 'opacity 0.3s ease',
          }}
        />
        {/* Play button */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transform: hovered ? 'scale(1.08)' : 'scale(1)',
            transition: 'transform 0.25s ease',
          }}
        >
          <PlayIcon />
        </div>
        {/* Duration badge */}
        <div
          style={{
            position: 'absolute',
            bottom: '10px',
            right: '12px',
            backgroundColor: 'rgba(0,0,0,0.75)',
            color: '#ffffff',
            fontSize: '11px',
            fontWeight: 600,
            padding: '2px 7px',
            borderRadius: '4px',
            fontFamily: "'Inter', sans-serif",
            letterSpacing: '0.04em',
          }}
        >
          {video.duration}
        </div>
      </div>

      {/* Video meta */}
      <h3
        style={{
          margin: '0 0 5px',
          fontFamily: "'Inter', sans-serif",
          fontSize: '15px',
          fontWeight: 700,
          color: hovered ? '#009a44' : '#000000',
          lineHeight: 1.35,
          letterSpacing: '-0.01em',
          transition: 'color 0.2s ease',
        }}
      >
        {video.title}
      </h3>
      <div style={{ fontSize: '12px', color: '#888888', fontFamily: "'Inter', sans-serif", letterSpacing: '0.02em' }}>
        {video.date}
      </div>
    </div>
  )
}

function GaleriaPage() {
  return (
    <div style={{ fontFamily: "'Inter', sans-serif" }}>

      {/* ── Breadcrumb ─────────────────────────────────────────────────── */}
      <nav style={{ marginBottom: '28px' }}>
        {['Úvod', 'Galéria'].map(crumb => (
          <span key={crumb}>
            <a
              href="#"
              style={{ fontSize: '13px', color: '#6c757d', textDecoration: 'none', letterSpacing: '0.02em' }}
              onMouseEnter={e => (e.currentTarget.style.color = '#009a44')}
              onMouseLeave={e => (e.currentTarget.style.color = '#6c757d')}
            >
              {crumb}
            </a>
            <span style={{ fontSize: '13px', color: '#b0b8c1', margin: '0 7px' }}>/</span>
          </span>
        ))}
        <span style={{ fontSize: '13px', color: '#009a44', fontWeight: 600 }}>Fotogaléria a Videoarchív</span>
      </nav>

      {/* ══════════════════════════════════════════════════════════════════
          SECTION 1 — FOTOGALÉRIA
      ══════════════════════════════════════════════════════════════════ */}

      {/* Section heading */}
      <h1
        style={{
          margin: '0 0 8px',
          fontFamily: "'DM Serif Display', serif",
          fontSize: '34px',
          fontWeight: 400,
          color: '#009a44',
          lineHeight: 1.2,
          letterSpacing: '-0.01em',
        }}
      >
        Fotogaléria zo života komory
      </h1>
      <p
        style={{
          margin: '0 0 40px',
          fontSize: '15px',
          color: '#666666',
          lineHeight: 1.65,
          fontWeight: 300,
          maxWidth: '540px',
        }}
      >
        Fotografické záznamy z podujatí, rokovaní, výstav a regionálnych aktivít Slovenskej poľnohospodárskej a potravinárskej komory.
      </p>

      {/* Album grid — 3 columns */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '28px 24px',
          marginBottom: '16px',
        }}
      >
        {PHOTO_ALBUMS.map((album, i) => (
          <AlbumCard key={i} album={album} />
        ))}
      </div>

      {/* Show-more link */}
      <div style={{ textAlign: 'right', marginTop: '8px', marginBottom: '4px' }}>
        <button
          style={{
            background: 'none',
            border: 'none',
            color: '#009a44',
            fontSize: '13px',
            fontWeight: 600,
            letterSpacing: '0.04em',
            cursor: 'pointer',
            padding: 0,
            fontFamily: "'Inter', sans-serif",
          }}
          onMouseEnter={e => (e.currentTarget.style.opacity = '0.7')}
          onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
        >
          Zobraziť všetky albumy →
        </button>
      </div>

      {/* ══════════════════════════════════════════════════════════════════
          SECTION 2 — VIDEOARCHÍV
      ══════════════════════════════════════════════════════════════════ */}

      {/* Generous white-space separator */}
      <div style={{ paddingTop: '72px' }}>

        {/* Section heading */}
        <h2
          style={{
            margin: '0 0 8px',
            fontFamily: "'DM Serif Display', serif",
            fontSize: '34px',
            fontWeight: 400,
            color: '#009a44',
            lineHeight: 1.2,
            letterSpacing: '-0.01em',
          }}
        >
          Videoarchív SPPK
        </h2>
        <p
          style={{
            margin: '0 0 36px',
            fontSize: '15px',
            color: '#666666',
            lineHeight: 1.65,
            fontWeight: 300,
            maxWidth: '520px',
          }}
        >
          Záznamy zo spravodajských relácií, reportáží z terénu a dokumentárnych filmov zo sveta slovenského poľnohospodárstva.
        </p>

        {/* YouTube channel billboard */}
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '14px',
            padding: '28px 32px',
            boxShadow: '0 4px 28px rgba(0,0,0,0.07), 0 1px 4px rgba(0,0,0,0.04)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '28px',
            marginBottom: '40px',
            flexWrap: 'wrap',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flex: 1, minWidth: '200px' }}>
            {/* YouTube logo mark */}
            <div
              style={{
                width: '52px',
                height: '52px',
                borderRadius: '12px',
                backgroundColor: '#ff0000',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <svg width="26" height="20" viewBox="0 0 26 20" fill="none">
                <path d="M25.4 3.13A3.27 3.27 0 0 0 23.1.8C21.1.28 13 .28 13 .28S4.9.28 2.9.8A3.27 3.27 0 0 0 .6 3.13 34.3 34.3 0 0 0 .1 10a34.3 34.3 0 0 0 .5 6.87A3.27 3.27 0 0 0 2.9 19.2C4.9 19.72 13 19.72 13 19.72s8.1 0 10.1-.52a3.27 3.27 0 0 0 2.3-2.33A34.3 34.3 0 0 0 25.9 10a34.3 34.3 0 0 0-.5-6.87z" fill="white" fillOpacity="0.15" />
                <polygon points="10.5,14.5 18,10 10.5,5.5" fill="white" />
              </svg>
            </div>
            <div>
              <div
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  letterSpacing: '0.1em',
                  color: '#009a44',
                  textTransform: 'uppercase',
                  marginBottom: '5px',
                }}
              >
                Oficiálny YouTube kanál
              </div>
              <p style={{ margin: 0, fontSize: '14px', color: '#333333', lineHeight: 1.55, fontWeight: 400 }}>
                Navštívte náš kanál a odoberajte najnovšie agro-spravodajstvo z regiónov Slovenska.
              </p>
            </div>
          </div>

          <a
            href="https://www.youtube.com/@sppkbratislava"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: '#009a44',
              color: '#ffffff',
              fontSize: '13px',
              fontWeight: 600,
              letterSpacing: '0.02em',
              padding: '12px 22px',
              borderRadius: '100px',
              textDecoration: 'none',
              whiteSpace: 'nowrap',
              flexShrink: 0,
              boxShadow: '0 4px 14px rgba(0,154,68,0.35)',
              transition: 'background 0.2s ease, box-shadow 0.2s ease',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLAnchorElement).style.backgroundColor = '#007d36'
              ;(e.currentTarget as HTMLAnchorElement).style.boxShadow = '0 6px 20px rgba(0,154,68,0.45)'
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLAnchorElement).style.backgroundColor = '#009a44'
              ;(e.currentTarget as HTMLAnchorElement).style.boxShadow = '0 4px 14px rgba(0,154,68,0.35)'
            }}
          >
            Otvoriť YouTube kanál SPPK @sppkbratislava →
          </a>
        </div>

        {/* Video feed — 2-column grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '32px 24px',
          }}
        >
          {VIDEO_ITEMS.map((video, i) => (
            <VideoCard key={i} video={video} />
          ))}
        </div>

        {/* Archive link */}
        <div style={{ textAlign: 'right', marginTop: '28px' }}>
          <button
            style={{
              background: 'none',
              border: 'none',
              color: '#009a44',
              fontSize: '13px',
              fontWeight: 600,
              letterSpacing: '0.04em',
              cursor: 'pointer',
              padding: 0,
              fontFamily: "'Inter', sans-serif",
            }}
            onMouseEnter={e => (e.currentTarget.style.opacity = '0.7')}
            onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
          >
            Zobraziť celý videoarchív →
          </button>
        </div>

      </div>
    </div>
  )
}

// ─── Aktuálne informácie – Newsroom ──────────────────────────────────────

const NEWS_CATS = ['Všetky správy', 'Tlačové správy', 'Usmernenia a analýzy', 'Regióny'] as const
type NewsCat = typeof NEWS_CATS[number]

const NEWS_ARTICLES = [
  {
    date: '26. AUGUST 2026',
    dateRaw: '2026-08-26',
    title: 'Zvýšenie podpory pre slovenských potravinárov: Výkonný výbor schválil nové podmienky',
    snippet: 'Na zasadnutí Výkonného výboru SPPK boli prijaté nové podmienky pre čerpanie dotácií z programu Rozvoja vidieka. Opatrenia sa dotknú viac ako 3 200 potravinárskych podnikov na celom Slovensku.',
    category: 'Tlačové správy' as NewsCat,
    img: 'https://images.unsplash.com/photo-1595976281013-8024ecc02575?w=480&h=320&fit=crop&auto=format',
    alt: 'Zasadnutie Výkonného výboru SPPK',
  },
  {
    date: '22. AUGUST 2026',
    dateRaw: '2026-08-22',
    title: 'AGROKOMPLEX 2026 – záverečná správa: Rekordná účasť 42 000 návštevníkov',
    snippet: 'Medzinárodná agrárna výstava AGROKOMPLEX v Nitre sa uzavrela s rekordnou návštevnosťou. Stánok SPPK zaznamenal zvýšený záujem o informácie k CAP dotáciám na roky 2026–2030.',
    category: 'Tlačové správy' as NewsCat,
    img: 'https://images.unsplash.com/photo-1667063134166-5a9a68fd8e0c?w=480&h=320&fit=crop&auto=format',
    alt: 'AGROKOMPLEX 2026 výstava Nitra',
  },
  {
    date: '19. AUGUST 2026',
    dateRaw: '2026-08-19',
    title: 'Analýza: Dopad nových pesticídnych nariadení EÚ na slovenské poľnohospodárstvo 2026',
    snippet: 'SPPK zverejňuje komplexnú analýzu dopadov nariadenia (EÚ) 2023/1115 na výrobné náklady slovenských farmárov. Dokument je k dispozícii bezplatne pre všetkých členov komory.',
    category: 'Usmernenia a analýzy' as NewsCat,
    img: 'https://images.unsplash.com/photo-1578853464641-ef3e6d47e16c?w=480&h=320&fit=crop&auto=format',
    alt: 'Analýza pesticídnych nariadení',
  },
  {
    date: '15. AUGUST 2026',
    dateRaw: '2026-08-15',
    title: 'Regionálna komora Nitrianskeho kraja: Výsledky žatvy 2026 prekračujú plánované výnosy',
    snippet: 'Farmári v Nitrianskom kraji zaznamenali nadpriemerné výnosy pšenice 6,8 t/ha, čo je o 12 % nad celoslovenským priemerom. Komora koordinuje logistiku skladovania prebytkov.',
    category: 'Regióny' as NewsCat,
    img: 'https://images.unsplash.com/photo-1646684662890-a5076aef9010?w=480&h=320&fit=crop&auto=format',
    alt: 'Žatva obilia na Slovensku',
  },
  {
    date: '11. AUGUST 2026',
    dateRaw: '2026-08-11',
    title: 'SPPK a COPA-COGECA podpísali memorandum o posilnení pozície slovenských exportérov v EÚ',
    snippet: 'Podpisom memoranda v Bruseli SPPK posilnila zastúpenie slovenského agrárneho sektora v európskych rokovaniach. Dohoda sa zameriava na exportné koridory do Nemecka, Rakúska a Francúzska.',
    category: 'Tlačové správy' as NewsCat,
    img: 'https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=480&h=320&fit=crop&auto=format',
    alt: 'Podpis memoranda COPA-COGECA',
  },
  {
    date: '7. AUGUST 2026',
    dateRaw: '2026-08-07',
    title: 'Usmernenie pre žiadateľov o dotáciu z Programu rozvoja vidieka – aktualizácia podmienok',
    snippet: 'Pôdohospodárska platobná agentúra aktualizovala podmienky prideľovania priamych platieb. SPPK pripravila prehľadné usmernenie s chronológiou podania žiadostí do 15. septembra 2026.',
    category: 'Usmernenia a analýzy' as NewsCat,
    img: 'https://images.unsplash.com/photo-1560693225-b8507d6f3aa9?w=480&h=320&fit=crop&auto=format',
    alt: 'Dokumenty a usmernenia SPPK',
  },
  {
    date: '4. AUGUST 2026',
    dateRaw: '2026-08-04',
    title: 'Trnavský kraj: Prvé výsledky pilotného projektu precízneho poľnohospodárstva',
    snippet: 'Projekt digitálneho monitoringu poľnohospodárskych plôch v Trnavskom kraji vstúpil do druhej fázy. Zapojených je 18 fariem s celkovou výmerou 4 200 hektárov.',
    category: 'Regióny' as NewsCat,
    img: 'https://images.unsplash.com/photo-1557844352-761f2565b576?w=480&h=320&fit=crop&auto=format',
    alt: 'Precízne poľnohospodárstvo Trnavský kraj',
  },
]

function AktualneInformacie() {
  const [activeCat, setActiveCat] = useState<NewsCat>('Všetky správy')
  const [activePage, setActivePage] = useState(1)

  const PER_PAGE = 5
  const filtered = activeCat === 'Všetky správy'
    ? NEWS_ARTICLES
    : NEWS_ARTICLES.filter(a => a.category === activeCat)
  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE))
  const visible = filtered.slice((activePage - 1) * PER_PAGE, activePage * PER_PAGE)

  function switchCat(c: NewsCat) { setActiveCat(c); setActivePage(1) }

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", width: '100%', backgroundColor: '#ffffff' }}>

      {/* ─── 1 · Breadcrumb ────────────────────────────────────────────── */}
      <nav aria-label="Breadcrumb" style={{ marginBottom: '24px' }}>
        <a href="#"
          style={{ fontSize: '12px', color: '#6c757d', textDecoration: 'none', letterSpacing: '0.03em' }}
          onMouseEnter={e => (e.currentTarget.style.color = '#009a44')}
          onMouseLeave={e => (e.currentTarget.style.color = '#6c757d')}
        >Úvod</a>
        <span style={{ fontSize: '12px', color: '#d0d5da', margin: '0 8px' }} aria-hidden="true">/</span>
        <span style={{ fontSize: '12px', color: '#6c757d', letterSpacing: '0.03em' }}>Aktuálne informácie</span>
      </nav>

      {/* ─── 2 · Page title ────────────────────────────────────────────── */}
      <h1 style={{
        margin: '0 0 38px',
        fontFamily: "'Inter', sans-serif",
        fontSize: 'clamp(26px, 3.4vw, 38px)',
        fontWeight: 800,
        color: '#009a44',
        lineHeight: 1.08,
        letterSpacing: '-0.03em',
      }}>
        Aktuálne informácie<br />a správy SPPK
      </h1>

      {/* ─── 3 · Category filter ───────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: '32px', marginBottom: '44px' }}>
        {NEWS_CATS.map(cat => {
          const on = cat === activeCat
          return (
            <button key={cat} onClick={() => switchCat(cat)}
              style={{
                background: 'none', border: 'none',
                padding: '0 0 8px',
                cursor: 'pointer',
                fontFamily: "'Inter', sans-serif",
                fontSize: '13.5px',
                fontWeight: on ? 600 : 400,
                color: on ? '#009a44' : '#000000',
                letterSpacing: '0.01em',
                position: 'relative',
                transition: 'color 0.15s ease',
                lineHeight: 1,
              }}
              onMouseEnter={e => { if (!on) e.currentTarget.style.color = '#009a44' }}
              onMouseLeave={e => { if (!on) e.currentTarget.style.color = '#000000' }}
            >
              {cat}
              {/* active indicator: dot + line */}
              <span style={{
                position: 'absolute',
                bottom: 0,
                left: '50%',
                transform: 'translateX(-50%)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '2px',
                opacity: on ? 1 : 0,
                transition: 'opacity 0.15s ease',
              }}>
                <span style={{
                  width: '4px', height: '4px',
                  borderRadius: '50%',
                  backgroundColor: '#009a44',
                  display: 'block',
                }} />
                <span style={{
                  width: '28px', height: '2px',
                  borderRadius: '1px',
                  backgroundColor: '#009a44',
                  display: 'block',
                }} />
              </span>
            </button>
          )
        })}
      </div>

      {/* ─── 4 · Article feed ──────────────────────────────────────────── */}
      <div>
        {visible.length === 0 && (
          <p style={{ color: '#9ca3af', padding: '48px 0', fontSize: '15px', textAlign: 'center' }}>
            Žiadne správy v tejto kategórii.
          </p>
        )}
        {visible.map((a, i) => <NCard key={`${a.dateRaw}-${i}`} article={a} />)}
      </div>

      {/* ─── 5 · Pagination ────────────────────────────────────────────── */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        marginTop: '56px',
        paddingTop: '32px',
        borderTop: '1px solid rgba(0,0,0,0.07)',
      }}>
        <NPager label="← Predchádzajúca" isNum={false} active={false}
          disabled={activePage <= 1}
          onClick={() => setActivePage(p => Math.max(1, p - 1))} />

        {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
          <NPager key={n} label={String(n)} isNum active={n === activePage}
            disabled={false} onClick={() => setActivePage(n)} />
        ))}

        <NPager label="Nasledujúca strana →" isNum={false} active={false}
          disabled={activePage >= totalPages}
          onClick={() => setActivePage(p => Math.min(totalPages, p + 1))} />
      </div>

    </div>
  )
}

function NPager({ label, isNum, active, disabled, onClick }: {
  label: string; isNum: boolean; active: boolean; disabled: boolean; onClick: () => void
}) {
  const [hov, setHov] = useState(false)
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        fontFamily: "'Inter', sans-serif",
        fontSize: isNum ? '14px' : '13px',
        fontWeight: active ? 700 : 400,
        color: active ? '#ffffff' : disabled ? '#c8cfd6' : hov ? '#009a44' : '#000000',
        background: active ? '#009a44' : hov && !disabled ? 'rgba(0,154,68,0.05)' : 'transparent',
        border: `1px solid ${active ? '#009a44' : disabled ? 'rgba(0,0,0,0.08)' : hov ? 'rgba(0,154,68,0.4)' : 'rgba(0,0,0,0.13)'}`,
        borderRadius: '8px',
        padding: isNum ? '10px 0' : '10px 16px',
        minWidth: isNum ? '44px' : undefined,
        textAlign: 'center' as const,
        cursor: disabled ? 'default' : 'pointer',
        opacity: disabled ? 0.35 : 1,
        transition: 'all 0.15s ease',
        letterSpacing: '0.01em',
      }}
    >{label}</button>
  )
}

function NCard({ article }: { article: typeof NEWS_ARTICLES[0] }) {
  const [hov, setHov] = useState(false)

  return (
    <article
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'stretch',
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        marginBottom: '24px',
        overflow: 'hidden',
        cursor: 'pointer',
        boxShadow: hov
          ? '0 12px 40px rgba(0,0,0,0.10), 0 2px 6px rgba(0,0,0,0.05)'
          : '0 2px 20px rgba(0,0,0,0.065), 0 1px 4px rgba(0,0,0,0.03)',
        transition: 'box-shadow 0.22s ease, transform 0.2s ease',
        transform: hov ? 'translateY(-2px)' : 'translateY(0)',
      }}
    >
      {/* LEFT — square cover image, flush to card edge, 12px radius inherited via overflow:hidden */}
      <div style={{
        width: '164px',
        minWidth: '164px',
        position: 'relative',
        backgroundColor: '#c8e4d2',
        flexShrink: 0,
        overflow: 'hidden',
      }}>
        <img
          src={article.img}
          alt={article.alt}
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: 'block',
            transform: hov ? 'scale(1.07)' : 'scale(1)',
            transition: 'transform 0.45s cubic-bezier(0.25,0.46,0.45,0.94)',
          }}
        />
      </div>

      {/* RIGHT — content stack */}
      <div style={{
        flex: 1,
        minWidth: 0,
        padding: '26px 28px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
      }}>

        {/* TOP — date + category separator */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          marginBottom: '11px',
        }}>
          <span style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: '11px',
            fontWeight: 800,
            color: '#009a44',
            letterSpacing: '0.13em',
            textTransform: 'uppercase' as const,
            lineHeight: 1,
          }}>
            {article.date}
          </span>
          <span style={{
            width: '3px', height: '3px',
            borderRadius: '50%',
            backgroundColor: 'rgba(0,0,0,0.22)',
            flexShrink: 0,
          }} />
          <span style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: '10.5px',
            fontWeight: 500,
            color: '#909aa3',
            letterSpacing: '0.06em',
            textTransform: 'uppercase' as const,
            lineHeight: 1,
          }}>
            {article.category}
          </span>
        </div>

        {/* MIDDLE — title */}
        <h2 style={{
          margin: '0 0 11px',
          fontFamily: "'Inter', sans-serif",
          fontSize: '19px',
          fontWeight: 700,
          color: hov ? '#009a44' : '#000000',
          lineHeight: 1.33,
          letterSpacing: '-0.022em',
          transition: 'color 0.18s ease',
        }}>
          {article.title}
        </h2>

        {/* BOTTOM — excerpt */}
        <p style={{
          margin: '0 0 14px',
          fontFamily: "'Inter', sans-serif",
          fontSize: '14px',
          fontWeight: 400,
          color: '#3c3c3c',
          lineHeight: 1.72,
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical' as const,
          overflow: 'hidden',
        }}>
          {article.snippet}
        </p>

        {/* CTA link */}
        <span style={{
          fontFamily: "'Inter', sans-serif",
          fontSize: '11.5px',
          fontWeight: 700,
          color: '#009a44',
          letterSpacing: '0.07em',
          textTransform: 'uppercase' as const,
          opacity: hov ? 1 : 0.6,
          transition: 'opacity 0.18s ease',
        }}>
          Čítať viac →
        </span>

      </div>
    </article>
  )
}

// ─── Charakteristika SPPK ────────────────────────────────────────────────

function CharistikaSPPK() {
  return (
    <article
      style={{
        fontFamily: "'Inter', sans-serif",
        backgroundColor: '#ffffff',
        width: '100%',
      }}
    >


      {/* ── 3 · Main title ──────────────────────────────────────────────── */}
      <h1
        style={{
          margin: '0 0 52px',
          fontFamily: "'DM Serif Display', serif",
          fontSize: 'clamp(30px, 3.8vw, 42px)',
          fontWeight: 400,
          color: '#000000',
          lineHeight: 1.15,
          letterSpacing: '-0.01em',
        }}
      >
        Slovenská poľnohospodárska<br />
        a potravinárska komora
      </h1>

      {/* ── 4 · Intro paragraph ─────────────────────────────────────────── */}
      <p
        style={{
          margin: '0 0 52px',
          fontSize: '16px',
          fontWeight: 500,
          color: '#000000',
          lineHeight: 1.85,
          letterSpacing: '0.004em',
        }}
      >
        Slovenská poľnohospodárska a potravinárska komora (SPPK) je najväčšou neštátnou,
        verejnoprávnou a samosprávnou inštitúciou v slovenskom agropotravinárskom sektore.
        Bola zriadená zákonom Slovenskej národnej rady č.&nbsp;30/1992 Zb. o Slovenskej
        poľnohospodárskej a potravinárskej komore.
      </p>

      {/* ── 5 · Subheading 1 ────────────────────────────────────────────── */}
      <h2
        style={{
          margin: '0 0 24px',
          fontFamily: "'Inter', sans-serif",
          fontSize: '22px',
          fontWeight: 700,
          color: '#009a44',
          lineHeight: 1.25,
          letterSpacing: '-0.015em',
        }}
      >
        Hlavná činnosť a poslanie komory
      </h2>

      {/* ── 6 · Paragraph 2 ─────────────────────────────────────────────── */}
      <p
        style={{
          margin: '0 0 36px',
          fontSize: '16px',
          fontWeight: 400,
          color: '#000000',
          lineHeight: 1.85,
          letterSpacing: '0.004em',
        }}
      >
        Ústredný úrad SPPK v Bratislave koordinuje odborné, legislatívne a komunikačné
        aktivity komory v celom agropotravinárskom sektore. Zabezpečuje zastupovanie
        záujmov slovenských výrobcov a spracovateľov potravín na národnej aj európskej
        úrovni, a to predovšetkým prostredníctvom aktívnej účasti v medzinárodných
        organizáciách COPA-COGECA a CEJA so sídlom v Bruseli.
      </p>

      {/* ── 7 · Paragraph 3 ─────────────────────────────────────────────── */}
      <p
        style={{
          margin: '0 0 60px',
          fontSize: '16px',
          fontWeight: 400,
          color: '#000000',
          lineHeight: 1.85,
          letterSpacing: '0.004em',
        }}
      >
        Komora sa aktívne podieľa na tvorbe agrárnej politiky Slovenskej republiky —
        predkladá stanoviská k návrhom zákonov, vyjednáva podmienky implementácie
        európskych nariadení v oblasti priamych platieb, ochrany rastlín a potravinárskej
        bezpečnosti, a presadzuje záujmy svojich členov v rokovaniach s Ministerstvom
        pôdohospodárstva a rozvoja vidieka SR.
      </p>

      {/* ── 8 · Subheading 2 ────────────────────────────────────────────── */}
      <h2
        style={{
          margin: '0 0 24px',
          fontFamily: "'Inter', sans-serif",
          fontSize: '22px',
          fontWeight: 700,
          color: '#009a44',
          lineHeight: 1.25,
          letterSpacing: '-0.015em',
        }}
      >
        Regionálna štruktúra a sieť
      </h2>

      {/* ── 9 · Paragraph 4 ─────────────────────────────────────────────── */}
      <p
        style={{
          margin: '0 0 48px',
          fontSize: '16px',
          fontWeight: 400,
          color: '#000000',
          lineHeight: 1.85,
          letterSpacing: '0.004em',
        }}
      >
        Komora prevádzkuje hustú sieť 38 regionálnych pracovísk poľnohospodárskej
        a potravinárskej komory (RPPK) rozmiestnených vo všetkých okresoch Slovenska,
        ako aj 4 regionálne komory so špeciálnym štatútom (RKŠ). Táto štruktúra
        zabezpečuje priamy a každodenný kontakt s farmármi, potravinármi a ostatnými
        členmi komory v každom kúte republiky — od konzultácií k dotáciám až po
        právne poradenstvo a vzdelávacie programy priamo v teréne.
      </p>
    </article>
  )
}

// ─── App ──────────────────────────────────────────────────────────────────

export default function App() {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#ffffff' }}>
      <section style={{ maxWidth: '1200px', margin: '0 auto', padding: '60px 24px 80px' }}>
        <div>
          <CharistikaSPPK />
        </div>
      </section>
    </div>
  )
}
