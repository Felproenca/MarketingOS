import { useRef, useState, useCallback } from 'react'
import { motion, useInView, useMotionValue, useSpring, useTransform } from 'framer-motion'

/* ─── Magnetic button ─── */
function MagneticCTA() {
  const ref = useRef<HTMLAnchorElement>(null)
  const [hovered, setHovered] = useState(false)

  const rawX = useMotionValue(0)
  const rawY = useMotionValue(0)
  const x = useSpring(rawX, { stiffness: 200, damping: 15 })
  const y = useSpring(rawY, { stiffness: 200, damping: 15 })

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLAnchorElement>) => {
    const el = ref.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const cx = rect.left + rect.width / 2
    const cy = rect.top + rect.height / 2
    rawX.set((e.clientX - cx) * 0.35)
    rawY.set((e.clientY - cy) * 0.35)
  }, [rawX, rawY])

  const handleMouseLeave = useCallback(() => {
    rawX.set(0)
    rawY.set(0)
    setHovered(false)
  }, [rawX, rawY])

  return (
    <motion.a
      ref={ref}
      href="https://wa.me/5511999999999?text=Quero+ver+minha+marca+nesse+nível"
      target="_blank"
      rel="noopener noreferrer"
      style={{ x, y, display: 'inline-block', textDecoration: 'none' }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={handleMouseLeave}
    >
      <div style={{
        position: 'relative',
        padding: '22px 52px',
        borderRadius: 12,
        overflow: 'hidden',
        background: hovered ? '#E8FF33' : 'var(--accent)',
        transition: 'background 0.2s',
        boxShadow: hovered
          ? '0 0 80px rgba(212,255,0,0.35), 0 0 160px rgba(212,255,0,0.1)'
          : '0 0 40px rgba(212,255,0,0.15)',
      }}>
        {/* Shine sweep on hover */}
        <motion.div
          animate={hovered ? { x: ['−200%', '200%'] } : { x: '-200%' }}
          transition={{ duration: 0.6, ease: 'easeInOut' }}
          style={{
            position: 'absolute', top: 0, bottom: 0,
            width: '60%',
            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.25), transparent)',
            pointerEvents: 'none',
          }}
        />
        <span style={{
          display: 'flex', alignItems: 'center', gap: 14,
          fontFamily: "'Anton', sans-serif",
          fontSize: 18, letterSpacing: '0.05em',
          color: '#000',
          position: 'relative', zIndex: 1,
          userSelect: 'none',
        }}>
          QUERO VER MINHA MARCA NESSE NÍVEL
          <motion.span
            animate={hovered ? { x: 6 } : { x: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 20 }}
            style={{ display: 'flex' }}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M3 10h14M10 3l7 7-7 7" stroke="#000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </motion.span>
        </span>
      </div>
    </motion.a>
  )
}

/* ─── Secondary ghost button ─── */
function GhostButton({ children, href }: { children: React.ReactNode; href: string }) {
  const [hovered, setHovered] = useState(false)
  return (
    <motion.a
      href={href}
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.97 }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 8,
        padding: '14px 28px',
        borderRadius: 10,
        fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 500,
        textDecoration: 'none',
        color: hovered ? 'var(--accent)' : 'var(--text-2)',
        border: `1px solid ${hovered ? 'rgba(212,255,0,0.4)' : 'var(--border)'}`,
        background: hovered ? 'rgba(212,255,0,0.06)' : 'transparent',
        transition: 'all 0.2s',
      }}
    >
      {children}
    </motion.a>
  )
}

export default function CTA() {
  const ref = useRef<HTMLElement>(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section
      ref={ref}
      id="contato"
      style={{ position: 'relative', overflow: 'hidden', textAlign: 'center' }}
    >
      {/* Ambient glow */}
      <motion.div
        animate={{ scale: [1, 1.15, 1], opacity: [0.4, 0.7, 0.4] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          position: 'absolute', top: '50%', left: '50%',
          width: 900, height: 900,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(212,255,0,0.05) 0%, transparent 65%)',
          transform: 'translate(-50%,-50%)',
          pointerEvents: 'none',
        }}
      />

      <div style={{ maxWidth: 800, margin: '0 auto', position: 'relative', zIndex: 2 }}>
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        >
          <span className="tag" style={{ marginBottom: 36, display: 'inline-flex' }}>Próximo Passo</span>

          <h2 style={{
            fontFamily: "'Anton', sans-serif",
            fontSize: 'clamp(44px, 7.5vw, 88px)',
            letterSpacing: '0.02em',
            lineHeight: 1.0,
            color: 'var(--text)',
            marginBottom: 28,
          }}>
            SEU CLIENTE VAI<br />
            <span style={{
              color: 'var(--accent)',
              textShadow: '0 0 60px rgba(212,255,0,0.25)',
            }}>
              PERCEBER A DIFERENÇA
            </span><br />
            NO PRIMEIRO SCROLL.
          </h2>

          <p style={{
            fontSize: 17, color: 'var(--text-2)', lineHeight: 1.75,
            maxWidth: 500, margin: '0 auto 52px',
          }}>
            Briefing. Percepção. Direção. Código.<br />Em 7 dias, um site que representa o que sua marca realmente vale.
          </p>

          {/* CTA group */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
            <MagneticCTA />
            <div style={{ display: 'flex', gap: 16, marginTop: 4 }}>
              <GhostButton href="#processo">Ver o processo</GhostButton>
              <GhostButton href="#sistema">Conhecer os agentes</GhostButton>
            </div>
            <p style={{ marginTop: 8, fontSize: 11, color: 'var(--text-3)', fontFamily: 'monospace', letterSpacing: '0.08em' }}>
              CONVERSA SEM COMPROMISSO · DIAGNÓSTICO EM 24H
            </p>
          </div>
        </motion.div>
      </div>

      {/* Footer */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : {}}
        transition={{ duration: 0.8, delay: 0.7 }}
        style={{
          marginTop: 100, paddingTop: 32,
          borderTop: '1px solid var(--border)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          maxWidth: 1100, margin: '100px auto 0',
          flexWrap: 'wrap', gap: 16,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
          <span style={{ fontFamily: "'Anton', sans-serif", fontSize: 14, color: 'var(--text)', letterSpacing: '0.04em' }}>
            MARKETING
          </span>
          <span style={{ fontFamily: "'Anton', sans-serif", fontSize: 14, color: 'var(--accent)', letterSpacing: '0.04em' }}>
            /OS
          </span>
          <span style={{ fontFamily: 'monospace', fontSize: 10, color: 'var(--accent)', marginLeft: 1 }}>™</span>
        </div>
        <span style={{ fontFamily: 'monospace', fontSize: 10, color: 'var(--text-3)', letterSpacing: '0.06em' }}>
          EXPERIENCE ENGINE v1.0
        </span>
        <span style={{ fontFamily: 'monospace', fontSize: 10, color: 'var(--text-3)' }}>
          © {new Date().getFullYear()}
        </span>
      </motion.footer>
    </section>
  )
}
