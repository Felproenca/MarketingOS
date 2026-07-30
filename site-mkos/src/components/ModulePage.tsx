import { useRef } from 'react'
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { motion, useInView } from 'framer-motion'
import HubLayout from './HubLayout'

export interface ModulePageProps {
  label: string
  name: string
  tagline: string
  accent: string
  intelligence: string
  signal: 'ATIVO' | 'EM BREVE'
  heroDesc: string
  sections: {
    title: string
    body: string
    icon?: string
  }[]
  deliverables: {
    name: string
    desc: string
    time?: string
  }[]
  cta: {
    title: string
    body: string
    btnLabel: string
  }
  children?: ReactNode
}

function FadeIn({ children, delay = 0 }: { children: ReactNode; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 32 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.65, delay, ease: [0.25, 0, 0, 1] }}
    >
      {children}
    </motion.div>
  )
}

export default function ModulePage({
  label, name, tagline, accent, intelligence, signal,
  heroDesc, sections, deliverables, cta, children,
}: ModulePageProps) {
  return (
    <HubLayout>
      {/* ── Hero ── */}
      <section style={{
        minHeight: '70vh', padding: '80px 6vw 80px',
        display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
        borderBottom: '1px solid var(--border)', position: 'relative', overflow: 'hidden',
      }}>
        {/* Accent glow */}
        <div style={{
          position: 'absolute', top: '-20%', right: '-10%',
          width: '60vw', height: '60vw',
          background: `radial-gradient(ellipse, ${accent}08 0%, transparent 65%)`,
          pointerEvents: 'none',
        }} />
        {/* Grid */}
        <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.02, pointerEvents: 'none' }}>
          <defs>
            <pattern id="mgrid" width="60" height="60" patternUnits="userSpaceOnUse">
              <path d="M 60 0 L 0 0 0 60" fill="none" stroke={accent} strokeWidth="0.5"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#mgrid)" />
        </svg>

        <div style={{ position: 'relative', zIndex: 1, maxWidth: 860 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 28 }}>
            <span style={{
              fontFamily: 'Anton, sans-serif', fontSize: 72, color: `${accent}10`, lineHeight: 1,
            }}>
              {label}
            </span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <span style={{
                fontFamily: 'monospace', fontSize: 8, letterSpacing: '0.14em',
                padding: '4px 10px',
                background: signal === 'ATIVO' ? `${accent}15` : 'rgba(255,255,255,0.04)',
                border: `1px solid ${signal === 'ATIVO' ? accent + '40' : 'rgba(255,255,255,0.08)'}`,
                color: signal === 'ATIVO' ? accent : 'var(--text-3)',
                borderRadius: 20, width: 'fit-content',
              }}>
                ● {signal}
              </span>
              <span style={{
                fontFamily: 'monospace', fontSize: 8, letterSpacing: '0.1em',
                color: `${accent}80`, textTransform: 'uppercase',
              }}>
                ◈ {intelligence}
              </span>
            </div>
          </div>

          <h1 style={{
            fontFamily: 'Anton, sans-serif',
            fontSize: 'clamp(44px, 7.5vw, 96px)',
            lineHeight: 0.93, letterSpacing: '0.01em',
            color: 'var(--text)', marginBottom: 24,
          }}>
            {name.split(' ').map((word, i) => (
              <span key={i}>
                <span style={{ color: i === 0 ? accent : 'var(--text)' }}>{word}</span>
                {i < name.split(' ').length - 1 && ' '}
              </span>
            ))}
          </h1>

          <p style={{
            fontSize: 20, color: 'var(--text-2)', lineHeight: 1.65, maxWidth: 560, marginBottom: 32,
          }}>
            {tagline}
          </p>

          <p style={{
            fontSize: 15, color: 'var(--text-3)', lineHeight: 1.8, maxWidth: 640, marginBottom: 44,
          }}>
            {heroDesc}
          </p>

          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center' }}>
            <Link to="/#cta" style={{
              fontFamily: 'Anton, sans-serif', fontSize: 13, letterSpacing: '0.06em',
              background: accent, color: '#000', padding: '14px 32px', textDecoration: 'none',
            }}>
              {cta.btnLabel}
            </Link>
            <Link to="/hub" style={{
              fontFamily: 'monospace', fontSize: 9, letterSpacing: '0.12em',
              color: 'var(--text-3)', textDecoration: 'none',
              borderBottom: '1px solid var(--border)', paddingBottom: 2,
            }}>
              ← VER TODOS OS MÓDULOS
            </Link>
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section style={{ padding: '80px 6vw', borderBottom: '1px solid var(--border)' }}>
        <FadeIn>
          <span className="tag" style={{ marginBottom: 20, display: 'inline-flex' }}>Como funciona</span>
          <h2 style={{
            fontFamily: 'Anton, sans-serif',
            fontSize: 'clamp(32px, 4.5vw, 56px)',
            color: 'var(--text)', lineHeight: 1.05, marginBottom: 56,
          }}>
            A INTELIGÊNCIA<br />
            <span style={{ color: accent }}>POR DENTRO.</span>
          </h2>
        </FadeIn>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: 2,
        }}>
          {sections.map((s, i) => (
            <FadeIn key={i} delay={i * 0.08}>
              <div style={{
                background: 'var(--bg-2)', border: '1px solid var(--border)',
                padding: '32px 28px', height: '100%',
              }}>
                <div style={{
                  fontFamily: 'monospace', fontSize: 22, marginBottom: 18,
                  lineHeight: 1, color: accent,
                }}>
                  {s.icon || String(i + 1).padStart(2, '0')}
                </div>
                <h3 style={{
                  fontFamily: 'Anton, sans-serif', fontSize: 18, letterSpacing: '0.03em',
                  color: 'var(--text)', marginBottom: 12, lineHeight: 1.1,
                }}>
                  {s.title}
                </h3>
                <p style={{ fontSize: 14, color: 'var(--text-3)', lineHeight: 1.75 }}>
                  {s.body}
                </p>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* ── Custom section slot ── */}
      {children}

      {/* ── Deliverables ── */}
      <section style={{ padding: '80px 6vw', borderBottom: '1px solid var(--border)', background: 'var(--bg-2)' }}>
        <FadeIn>
          <span className="tag" style={{ marginBottom: 20, display: 'inline-flex' }}>Entregáveis</span>
          <h2 style={{
            fontFamily: 'Anton, sans-serif',
            fontSize: 'clamp(32px, 4.5vw, 56px)',
            color: 'var(--text)', lineHeight: 1.05, marginBottom: 56,
          }}>
            O QUE VOCÊ<br />
            <span style={{ color: accent }}>RECEBE.</span>
          </h2>
        </FadeIn>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {deliverables.map((d, i) => (
            <FadeIn key={i} delay={i * 0.06}>
              <div style={{
                background: 'var(--bg)', border: '1px solid var(--border)',
                padding: '24px 32px',
                display: 'grid', gridTemplateColumns: '1fr 3fr auto',
                gap: 24, alignItems: 'center',
              }}>
                <div style={{
                  fontFamily: 'Anton, sans-serif', fontSize: 15, letterSpacing: '0.03em',
                  color: 'var(--text)',
                }}>
                  {d.name}
                </div>
                <div style={{ fontSize: 14, color: 'var(--text-3)', lineHeight: 1.6 }}>
                  {d.desc}
                </div>
                {d.time && (
                  <div style={{
                    fontFamily: 'monospace', fontSize: 9, letterSpacing: '0.1em',
                    color: accent, padding: '4px 10px',
                    border: `1px solid ${accent}35`, borderRadius: 20, whiteSpace: 'nowrap',
                  }}>
                    {d.time}
                  </div>
                )}
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ padding: '100px 6vw', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{
          position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
          width: '80vw', height: '50vh',
          background: `radial-gradient(ellipse, ${accent}06 0%, transparent 65%)`,
          pointerEvents: 'none',
        }} />
        <FadeIn>
          <h2 style={{
            fontFamily: 'Anton, sans-serif',
            fontSize: 'clamp(44px, 7vw, 88px)',
            color: 'var(--text)', lineHeight: 0.95, marginBottom: 24,
          }}>
            {cta.title}
          </h2>
          <p style={{
            fontSize: 17, color: 'var(--text-2)', lineHeight: 1.75,
            maxWidth: 560, margin: '0 auto 44px',
          }}>
            {cta.body}
          </p>
          <Link to="/#cta" style={{
            fontFamily: 'Anton, sans-serif', fontSize: 15, letterSpacing: '0.06em',
            background: accent, color: '#000', padding: '18px 40px', textDecoration: 'none', display: 'inline-block',
          }}>
            {cta.btnLabel}
          </Link>
        </FadeIn>
      </section>
    </HubLayout>
  )
}
