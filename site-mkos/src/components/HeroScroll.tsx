import { useEffect, useRef } from 'react'
import { motion, useMotionValue, useSpring, useTransform, useScroll } from 'framer-motion'
import Hero from './Hero'

const REFS = [
  {
    id: 'noir-ink',
    url: '/showcase/noir-ink.html',
    name: 'Noir Ink Studio',
    category: 'Estúdio de Tatuagem',
    year: '2025',
    accent: '#C41E3A',
    bg: 'linear-gradient(135deg, #080808 0%, #120508 60%, #080808 100%)',
    word: 'ARTE',
    tagline: 'Pele é tela. Arte é permanente.',
    score: '9.7',
    tags: ['Tattoo', 'Premium'],
  },
  {
    id: 'aura-clinic',
    url: '/showcase/aura-clinic.html',
    name: 'Aura Clínica',
    category: 'Harmonização Facial',
    year: '2025',
    accent: '#B8955A',
    bg: 'linear-gradient(135deg, #FAF8F5 0%, #F2EDE5 60%, #EDE7DC 100%)',
    word: 'BELEZA',
    tagline: 'A beleza que você sempre foi.',
    score: '9.8',
    tags: ['Estética', 'Luxo'],
  },
  {
    id: 'apex-motors',
    url: '/showcase/apex-motors.html',
    name: 'Apex Motors',
    category: 'Loja de Veículos Premium',
    year: '2025',
    accent: '#0057FF',
    bg: 'linear-gradient(135deg, #060A12 0%, #090E18 60%, #060A12 100%)',
    word: 'APEX',
    tagline: 'Cada curva tem um propósito.',
    score: '9.6',
    tags: ['Automotivo', 'Import'],
  },
  {
    id: 'forge-gym',
    url: '/showcase/forge-gym.html',
    name: 'Forge Gym',
    category: 'Academia de Alta Performance',
    year: '2025',
    accent: '#E8D800',
    bg: 'linear-gradient(135deg, #0A0A0A 0%, #111111 60%, #0A0A0A 100%)',
    word: 'FORGE',
    tagline: 'Não tem atalho.',
    score: '9.9',
    tags: ['Fitness', 'Performance'],
  },
]

type SiteRef = typeof REFS[0]

function ShowcaseCard({ site }: { site: SiteRef }) {
  return (
    <a
      href={site.url}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        display: 'flex', flexDirection: 'column',
        borderRadius: 14, overflow: 'hidden',
        border: '1px solid rgba(255,255,255,0.07)',
        flex: '1 1 0', minWidth: 0,
        textDecoration: 'none',
        cursor: 'pointer',
        transition: 'border-color 0.25s, transform 0.25s',
      }}
      onMouseEnter={e => {
        ;(e.currentTarget as HTMLAnchorElement).style.borderColor = `${site.accent}55`
        ;(e.currentTarget as HTMLAnchorElement).style.transform = 'translateY(-4px)'
      }}
      onMouseLeave={e => {
        ;(e.currentTarget as HTMLAnchorElement).style.borderColor = 'rgba(255,255,255,0.07)'
        ;(e.currentTarget as HTMLAnchorElement).style.transform = 'translateY(0)'
      }}
    >
      {/* Visual block — tipografia como arte, sem fake browser UI */}
      <div style={{
        position: 'relative', height: 200, overflow: 'hidden',
        background: site.bg,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <div style={{
          position: 'absolute', inset: 0,
          background: `radial-gradient(ellipse at 60% 40%, ${site.accent}20 0%, transparent 65%)`,
          pointerEvents: 'none',
        }} />
        {/* Big background word */}
        <div style={{
          fontFamily: "'Anton', sans-serif",
          fontSize: 'clamp(64px, 8vw, 100px)',
          letterSpacing: '0.04em',
          color: site.id === 'aura-clinic' ? `${site.accent}28` : `${site.accent}16`,
          userSelect: 'none',
          lineHeight: 1,
          position: 'absolute',
        }}>
          {site.word}
        </div>
        {/* Score */}
        <div style={{
          position: 'absolute', top: 14, right: 14,
          fontFamily: 'monospace', fontSize: 11,
          color: site.accent,
          padding: '4px 9px',
          background: `${site.accent}15`,
          border: `1px solid ${site.accent}35`,
          borderRadius: 20,
        }}>
          ★ {site.score}
        </div>
        {/* Category */}
        <div style={{
          position: 'absolute', top: 14, left: 14,
          fontFamily: 'monospace', fontSize: 9,
          color: site.id === 'aura-clinic' ? 'rgba(28,23,19,0.35)' : 'rgba(255,255,255,0.3)',
          letterSpacing: '0.08em',
        }}>
          {site.category.toUpperCase()}
        </div>
        {/* Tagline */}
        <div style={{
          position: 'relative', zIndex: 1,
          fontFamily: 'Inter, sans-serif',
          fontSize: 13, fontWeight: 500,
          color: site.id === 'aura-clinic' ? 'rgba(28,23,19,0.7)' : 'rgba(255,255,255,0.72)',
          lineHeight: 1.6,
          textAlign: 'center',
          maxWidth: '78%',
        }}>
          {site.tagline}
        </div>
      </div>

      {/* Info strip */}
      <div style={{
        padding: '14px 18px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        borderTop: `1px solid ${site.accent}18`,
        background: 'var(--bg-2)',
      }}>
        <div>
          <div style={{
            fontFamily: "'Anton', sans-serif",
            fontSize: 14, letterSpacing: '0.02em',
            color: 'var(--text)', marginBottom: 5,
          }}>
            {site.name.toUpperCase()}
          </div>
          <div style={{ display: 'flex', gap: 5 }}>
            {site.tags.map(t => (
              <span key={t} style={{
                fontFamily: 'monospace', fontSize: 9,
                color: site.accent,
                padding: '2px 7px',
                background: `${site.accent}10`,
                border: `1px solid ${site.accent}22`,
                borderRadius: 20, letterSpacing: '0.05em',
              }}>
                {t}
              </span>
            ))}
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
          <div style={{
            fontFamily: 'monospace', fontSize: 9,
            color: site.accent, letterSpacing: '0.08em',
            padding: '3px 8px', border: `1px solid ${site.accent}40`,
            borderRadius: 20,
          }}>
            ABRIR →
          </div>
          <div style={{
            fontFamily: 'monospace', fontSize: 9,
            color: 'rgba(255,255,255,0.18)', letterSpacing: '0.06em',
          }}>
            {site.year}
          </div>
        </div>
      </div>
    </a>
  )
}

export default function HeroScroll() {
  const wrapperRef = useRef<HTMLDivElement>(null)

  // useScroll() sem target = window scroll — Lenis alimenta este valor via eventos
  const { scrollY } = useScroll()

  const heroProgress  = useMotionValue(0)
  const panelProgress = useMotionValue(0)
  const cardsProgress = useMotionValue(0)

  // Springs — stiffness baixo para movimento fluido com Lenis
  const heroSpring  = useSpring(heroProgress,  { stiffness: 55, damping: 16, restDelta: 0.001 })
  const panelSpring = useSpring(panelProgress, { stiffness: 55, damping: 16, restDelta: 0.001 })
  const cardsSpring = useSpring(cardsProgress, { stiffness: 45, damping: 14, restDelta: 0.001 })

  const heroX   = useTransform(heroSpring,  [0, 1], ['0%',   '-110%'])
  const heroOp  = useTransform(heroSpring,  [0, 0.6], [1, 0])
  const panelX  = useTransform(panelSpring, [0, 1], ['110%', '0%'])
  const panelOp = useTransform(panelSpring, [0, 0.4], [0, 1])

  const card0Y  = useTransform(cardsSpring, [0, 1], [70, 0])
  const card1Y  = useTransform(cardsSpring, [0.1, 1], [90, 0])
  const card2Y  = useTransform(cardsSpring, [0.2, 1], [110, 0])
  const card3Y  = useTransform(cardsSpring, [0.3, 1], [130, 0])
  const cardsOp = useTransform(cardsSpring, [0, 0.5], [0, 1])
  const ctaOp   = useTransform(cardsSpring, [0.65, 1], [0, 1])

  useEffect(() => {
    // Subscrever ao MotionValue scrollY do FM — actualizado pelo Lenis
    const unsub = scrollY.on('change', (y) => {
      const wrapper = wrapperRef.current
      if (!wrapper) return
      const wrapperTop = wrapper.offsetTop
      const wrapperH   = wrapper.offsetHeight - window.innerHeight
      if (wrapperH <= 0) return

      const raw = clamp((y - wrapperTop) / wrapperH)

      heroProgress.set(clamp((raw - 0.28) / 0.28))

      const inT  = clamp((raw - 0.26) / 0.28)
      const outT = clamp((raw - 0.72) / 0.22)
      panelProgress.set(Math.max(0, inT - outT))

      cardsProgress.set(clamp((raw - 0.30) / 0.28))
    })

    return () => unsub()
  }, [scrollY, heroProgress, panelProgress, cardsProgress])

  return (
    <div ref={wrapperRef} style={{ height: '280vh' }}>
      <div style={{ position: 'sticky', top: 0, height: '100vh', overflow: 'hidden' }}>

        {/* ── Hero ── */}
        <motion.div style={{ position: 'absolute', inset: 0, x: heroX, opacity: heroOp }}>
          <Hero />
        </motion.div>

        {/* ── Showcase panel ── */}
        <motion.div style={{
          position: 'absolute', inset: 0,
          x: panelX, opacity: panelOp,
          background: 'var(--bg)',
          display: 'flex', flexDirection: 'column', justifyContent: 'center',
          padding: '72px 6vw', overflow: 'hidden',
        }}>
          <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.02, pointerEvents: 'none' }}>
            <defs>
              <pattern id="sgrid" width="60" height="60" patternUnits="userSpaceOnUse">
                <path d="M 60 0 L 0 0 0 60" fill="none" stroke="#D4FF00" strokeWidth="0.5"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#sgrid)" />
          </svg>

          <div style={{ maxWidth: 1400, margin: '0 auto', width: '100%', position: 'relative', zIndex: 2 }}>
            <div style={{
              marginBottom: 32,
              display: 'flex', justifyContent: 'space-between',
              alignItems: 'flex-end', flexWrap: 'wrap', gap: 16,
            }}>
              <div>
                <span className="tag" style={{ marginBottom: 14, display: 'inline-flex' }}>Showcase</span>
                <h2 style={{
                  fontFamily: "'Anton', sans-serif",
                  fontSize: 'clamp(28px, 4vw, 52px)',
                  letterSpacing: '0.02em',
                  color: 'var(--text)', lineHeight: 1.0, margin: 0,
                }}>
                  SITES QUE O MERCADO<br />
                  <span style={{ color: 'var(--accent)' }}>NÃO ESQUECE.</span>
                </h2>
              </div>
              <p style={{ fontSize: 13, color: 'var(--text-2)', lineHeight: 1.7, maxWidth: 220 }}>
                Cada projeto começa pela percepção — nunca pelo template.
              </p>
            </div>

            <motion.div style={{ opacity: cardsOp, display: 'flex', gap: 10 }}>
              {REFS.map((site, i) => (
                <motion.div key={site.id} style={{ y: [card0Y, card1Y, card2Y, card3Y][i], flex: '1 1 0', minWidth: 0 }}>
                  <ShowcaseCard site={site} />
                </motion.div>
              ))}
            </motion.div>

            <motion.div style={{
              opacity: ctaOp, marginTop: 20,
              display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 14,
            }}>
              <span style={{ fontFamily: 'monospace', fontSize: 10, color: 'var(--text-3)', letterSpacing: '0.08em' }}>
                CONTINUE PARA VER O PROCESSO
              </span>
              <motion.div
                animate={{ scaleY: [0.4, 1, 0.4] }}
                transition={{ duration: 1.6, repeat: Infinity }}
                style={{ width: 1, height: 28, background: 'linear-gradient(to bottom, var(--accent), transparent)' }}
              />
            </motion.div>
          </div>
        </motion.div>

      </div>
    </div>
  )
}

function clamp(v: number) { return Math.max(0, Math.min(1, v)) }
