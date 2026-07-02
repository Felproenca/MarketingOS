import { useEffect, useRef, useState } from 'react'
import {
  motion, useMotionValue, useSpring, useTransform,
  useScroll, AnimatePresence,
} from 'framer-motion'

const HEADLINE_LINES = ['SEU SITE', 'NÃO DEVERIA', 'APENAS EXISTIR.']

const BOOT_SEQUENCE = [
  '> EXPERIENCE ENGINE v1.0',
  '> CARREGANDO PERCEPTION ENGINE...',
  '> REFERENCE LAB CONECTADO',
  '> 44 REFS INDEXADAS',
  '> ORQUESTRADOR ATIVO',
  '> 10 AGENTES ONLINE',
  '> SISTEMA PRONTO.',
]

const LIVE_STREAM = [
  '[ OK ] REFERENCE LAB — 3 refs carregadas',
  '[ OK ] PERCEPTION ENGINE — análise iniciada',
  '[ .. ] CREATIVE DIRECTOR — processando',
  '[ OK ] NARRATIVE DIRECTOR — beats definidos',
  '[ .. ] COPY DIRECTOR — em execução',
  '[ OK ] ART DIRECTOR — composição aprovada',
  '[ .. ] MOTION DIRECTOR — physics calibradas',
  '[ OK ] BUILD ENGINE — compilando',
  '[ .. ] PERCEPTION QA — revisando score',
  '[ OK ] SCORE FINAL: 9.7 / 10 ✓',
  '[ >> ] ENTREGA EM 7 DIAS',
  '[ OK ] CLIENTE SATISFEITO ✓',
  '─────────────────────────────',
  '[ >> ] NOVO BRIEFING RECEBIDO',
  '[ OK ] REFERENCE LAB — 3 refs carregadas',
  '[ .. ] PERCEPTION ENGINE — analisando...',
]

export default function Hero() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [bootDone, setBootDone] = useState(false)
  const [bootLines, setBootLines] = useState<string[]>([])
  const [liveLines, setLiveLines] = useState<string[]>([])
  const terminalRef = useRef<HTMLDivElement>(null)

  const mouseX = useMotionValue(0.5)
  const mouseY = useMotionValue(0.5)
  const springX = useSpring(mouseX, { stiffness: 40, damping: 18 })
  const springY = useSpring(mouseY, { stiffness: 40, damping: 18 })
  const orbX = useTransform(springX, [0, 1], ['-8%', '8%'])
  const orbY = useTransform(springY, [0, 1], ['-8%', '8%'])

  /* Scroll parallax — terminal drifts slower than headline */
  const { scrollY } = useScroll()
  const terminalY = useTransform(scrollY, [0, 600], [0, -40])
  const headlineY = useTransform(scrollY, [0, 600], [0, -80])
  const bgY = useTransform(scrollY, [0, 600], [0, 120])
  const overlayOpacity = useTransform(scrollY, [0, 300], [0, 0.7])

  /* Boot sequence */
  useEffect(() => {
    let i = 0
    const timer = setInterval(() => {
      i++
      setBootLines(BOOT_SEQUENCE.slice(0, i))
      if (i >= BOOT_SEQUENCE.length) {
        clearInterval(timer)
        setTimeout(() => setBootDone(true), 400)
      }
    }, 180)
    return () => clearInterval(timer)
  }, [])

  /* Live stream — starts after boot */
  useEffect(() => {
    if (!bootDone) return
    let i = 0
    const timer = setInterval(() => {
      i = (i + 1) % LIVE_STREAM.length
      setLiveLines(prev => {
        const next = [...prev, LIVE_STREAM[i]]
        return next.slice(-12) // keep last 12 lines
      })
      if (terminalRef.current) {
        terminalRef.current.scrollTop = terminalRef.current.scrollHeight
      }
    }, 900)
    return () => clearInterval(timer)
  }, [bootDone])

  /* Cursor */
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const onMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect()
      mouseX.set((e.clientX - rect.left) / rect.width)
      mouseY.set((e.clientY - rect.top) / rect.height)
    }
    el.addEventListener('mousemove', onMove)
    return () => el.removeEventListener('mousemove', onMove)
  }, [mouseX, mouseY])

  const wordVariant = {
    initial: { y: '105%', opacity: 0 },
    animate: { y: '0%', opacity: 1, transition: { duration: 0.85, ease: [0.16, 1, 0.3, 1] } },
  }

  return (
    <section
      ref={containerRef}
      style={{
        minHeight: '100svh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '120px 6vw 80px',
        position: 'relative',
        overflow: 'hidden',
        zIndex: 2,
      }}
    >
      {/* ── BG ── */}
      <motion.div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden', y: bgY }}>
        <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.03 }}>
          <defs>
            <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
              <path d="M 60 0 L 0 0 0 60" fill="none" stroke="#D4FF00" strokeWidth="0.5"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>

        <motion.div style={{
          position: 'absolute', top: '35%', left: '60%',
          width: 900, height: 900, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(212,255,0,0.08) 0%, rgba(212,255,0,0.02) 50%, transparent 70%)',
          transform: 'translate(-50%,-50%)',
          x: orbX, y: orbY, filter: 'blur(50px)',
        }} />

        {[500, 290].map((size, i) => (
          <motion.div key={size} style={{
            position: 'absolute', top: '35%', left: '60%',
            width: size, height: size, borderRadius: '50%',
            border: `1px solid rgba(212,255,0,${i === 0 ? 0.07 : 0.12})`,
            transform: 'translate(-50%,-50%)',
          }} />
        ))}

        <motion.div
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
          style={{
            position: 'absolute', top: '35%', left: '60%',
            width: 6, height: 6, borderRadius: '50%',
            background: 'var(--accent)',
            transform: 'translate(-50%,-50%)',
            boxShadow: '0 0 20px rgba(212,255,0,0.9)',
          }}
        />

        <div style={{
          position: 'absolute', top: 0, left: '6vw', width: 1, height: '100%',
          background: 'linear-gradient(to bottom, transparent, rgba(212,255,0,0.1) 50%, transparent)',
        }} />
      </motion.div>

      {/* Scroll fade overlay */}
      <motion.div style={{
        position: 'absolute', inset: 0, background: 'var(--bg)',
        opacity: overlayOpacity, pointerEvents: 'none', zIndex: 5,
      }} />

      {/* ── Boot overlay ── */}
      <AnimatePresence>
        {!bootDone && (
          <motion.div
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            style={{
              position: 'absolute', inset: 0, background: 'var(--bg)',
              zIndex: 20, display: 'flex', alignItems: 'center', padding: '0 6vw',
            }}
          >
            {/* Scanline */}
            <motion.div
              initial={{ top: '-1%' }}
              animate={{ top: '101%' }}
              transition={{ duration: 1.3, ease: 'easeInOut' }}
              style={{
                position: 'absolute', left: 0, right: 0, height: 2,
                background: 'linear-gradient(90deg, transparent, rgba(212,255,0,0.7) 40%, rgba(212,255,0,1) 50%, rgba(212,255,0,0.7) 60%, transparent)',
                boxShadow: '0 0 40px rgba(212,255,0,0.5)',
              }}
            />
            <div>
              {bootLines.map((line, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.12 }}
                  style={{
                    fontFamily: 'monospace', fontSize: 14, letterSpacing: '0.06em',
                    lineHeight: 2.2,
                    color: i === bootLines.length - 1 ? '#D4FF00' : 'rgba(212,255,0,0.35)',
                  }}
                >
                  {line}
                  {i === bootLines.length - 1 && (
                    <motion.span
                      animate={{ opacity: [1, 0] }}
                      transition={{ duration: 0.5, repeat: Infinity }}
                    > ▋</motion.span>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Main layout ── */}
      <div style={{
        position: 'relative', zIndex: 2,
        maxWidth: 1100, margin: '0 auto', width: '100%',
        display: 'grid',
        gridTemplateColumns: '1fr 340px',
        gap: 60,
        alignItems: 'center',
      }}>

        {/* LEFT — headline */}
        <motion.div style={{ y: headlineY }}>
          <AnimatePresence>
            {bootDone && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                style={{ marginBottom: 32 }}
              >
                <span className="tag">Experience Engine · MARKETING/OS</span>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {bootDone && (
              <motion.div
                initial="initial"
                animate="animate"
                variants={{ animate: { transition: { staggerChildren: 0.1, delayChildren: 0.05 } } }}
              >
                {HEADLINE_LINES.map((line, i) => (
                  <div key={i} style={{ overflow: 'hidden', lineHeight: 1 }}>
                    <motion.h1
                      variants={wordVariant}
                      style={{
                        fontFamily: "'Anton', sans-serif",
                        fontSize: 'clamp(50px, 8.5vw, 108px)',
                        letterSpacing: '0.02em',
                        lineHeight: 1.0,
                        color: i === 2 ? 'var(--accent)' : 'var(--text)',
                        display: 'block',
                        marginBottom: '0.06em',
                        textShadow: i === 2 ? '0 0 80px rgba(212,255,0,0.3)' : 'none',
                      }}
                    >
                      {line}
                    </motion.h1>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {bootDone && (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.5 }}
                style={{ marginTop: 36, display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'flex-start' }}
              >
                <p style={{ fontSize: 17, color: 'var(--text-2)', lineHeight: 1.7, maxWidth: 400, margin: 0 }}>
                  Deveria fazer o mercado perceber que sua marca vale mais — nos primeiros 15 segundos.
                </p>
                <div style={{ display: 'flex', gap: 12, marginTop: 8, flexWrap: 'wrap' }}>
                  <CTAButton primary href="#contato">Ver minha marca nesse nível</CTAButton>
                  <CTAButton href="#processo">Como funciona</CTAButton>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* RIGHT — terminal HUD */}
        <motion.div style={{ y: terminalY }}>
          <AnimatePresence>
            {bootDone && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                style={{
                  background: 'rgba(9,9,13,0.9)',
                  border: '1px solid rgba(212,255,0,0.15)',
                  borderRadius: 10,
                  overflow: 'hidden',
                  backdropFilter: 'blur(12px)',
                }}
              >
                {/* Terminal header */}
                <div style={{
                  padding: '10px 14px',
                  borderBottom: '1px solid rgba(212,255,0,0.1)',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  background: 'rgba(212,255,0,0.03)',
                }}>
                  <div style={{ display: 'flex', gap: 6 }}>
                    {['#FF5F57','#FEBC2E','#28C840'].map(c => (
                      <div key={c} style={{ width: 10, height: 10, borderRadius: '50%', background: c, opacity: 0.7 }} />
                    ))}
                  </div>
                  <span style={{ fontFamily: 'monospace', fontSize: 9, color: 'rgba(212,255,0,0.4)', letterSpacing: '0.08em' }}>
                    MARKETING/OS — LIVE
                  </span>
                  <motion.div
                    animate={{ opacity: [1, 0] }}
                    transition={{ duration: 1, repeat: Infinity }}
                    style={{ width: 6, height: 6, borderRadius: '50%', background: '#28C840' }}
                  />
                </div>

                {/* Terminal body */}
                <div
                  ref={terminalRef}
                  style={{
                    height: 280,
                    overflowY: 'hidden',
                    padding: '12px 14px',
                    display: 'flex', flexDirection: 'column', gap: 2,
                  }}
                >
                  {/* Boot lines (dimmed) */}
                  {BOOT_SEQUENCE.map((line, i) => (
                    <div key={`boot-${i}`} style={{
                      fontFamily: 'monospace', fontSize: 10,
                      color: 'rgba(212,255,0,0.18)',
                      letterSpacing: '0.04em', lineHeight: 1.6,
                    }}>
                      {line}
                    </div>
                  ))}

                  <div style={{ height: 8 }} />

                  {/* Live stream lines */}
                  {liveLines.map((line, i) => {
                    const isOk = line.startsWith('[ OK ]')
                    const isDots = line.startsWith('[ .. ]')
                    const isNew = line.startsWith('[ >> ]')
                    const isDivider = line.startsWith('──')
                    return (
                      <motion.div
                        key={`live-${i}-${line}`}
                        initial={{ opacity: 0, x: -6 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.2 }}
                        style={{
                          fontFamily: 'monospace', fontSize: 10,
                          color: isDivider ? 'rgba(212,255,0,0.1)'
                            : isOk ? 'rgba(77,255,145,0.7)'
                            : isDots ? 'rgba(212,255,0,0.45)'
                            : isNew ? '#D4FF00'
                            : 'rgba(212,255,0,0.3)',
                          letterSpacing: '0.03em', lineHeight: 1.8,
                          display: i === liveLines.length - 1 && !isDivider ? 'flex' : undefined,
                          alignItems: 'center', gap: 4,
                        }}
                      >
                        {line}
                        {i === liveLines.length - 1 && !isDivider && (
                          <motion.span
                            animate={{ opacity: [1, 0] }}
                            transition={{ duration: 0.6, repeat: Infinity }}
                          >▋</motion.span>
                        )}
                      </motion.div>
                    )
                  })}
                </div>

                {/* Status bar */}
                <div style={{
                  padding: '8px 14px',
                  borderTop: '1px solid rgba(212,255,0,0.08)',
                  background: 'rgba(212,255,0,0.02)',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                }}>
                  <span style={{ fontFamily: 'monospace', fontSize: 9, color: 'rgba(212,255,0,0.3)', letterSpacing: '0.06em' }}>
                    10 AGENTS · ONLINE
                  </span>
                  <span style={{ fontFamily: 'monospace', fontSize: 9, color: 'rgba(77,255,145,0.6)', letterSpacing: '0.06em' }}>
                    ● RUNNING
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Scroll hint */}
      <AnimatePresence>
        {bootDone && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
            style={{
              position: 'absolute', bottom: 36, left: '6vw',
              display: 'flex', alignItems: 'center', gap: 10, zIndex: 2,
            }}
          >
            <motion.div
              animate={{ scaleY: [0.3, 1, 0.3] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
              style={{
                width: 1, height: 48, transformOrigin: 'top',
                background: 'linear-gradient(to bottom, var(--accent), transparent)',
              }}
            />
            <span style={{ fontFamily: 'monospace', fontSize: 10, color: 'var(--text-3)', letterSpacing: '0.12em' }}>
              SCROLL
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}

function CTAButton({ children, primary, href }: { children: React.ReactNode; primary?: boolean; href: string }) {
  const [hovered, setHovered] = useState(false)
  return (
    <motion.a
      href={href}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 10,
        padding: primary ? '14px 28px' : '12px 22px',
        borderRadius: 8,
        fontFamily: primary ? "'Anton', sans-serif" : 'Inter, sans-serif',
        fontSize: primary ? 15 : 13,
        letterSpacing: primary ? '0.04em' : '0',
        fontWeight: primary ? undefined : 500,
        textDecoration: 'none', cursor: 'pointer',
        background: primary ? (hovered ? '#E8FF33' : 'var(--accent)') : 'transparent',
        color: primary ? '#000' : (hovered ? 'var(--text)' : 'var(--text-2)'),
        border: primary ? 'none' : `1px solid ${hovered ? 'rgba(212,255,0,0.3)' : 'var(--border)'}`,
        boxShadow: primary && hovered ? '0 0 40px rgba(212,255,0,0.25)' : 'none',
        transition: 'all 0.2s',
      }}
    >
      {children}
      {primary && (
        <motion.span animate={hovered ? { x: 4 } : { x: 0 }} transition={{ type: 'spring', stiffness: 400, damping: 20 }}>
          <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
            <path d="M1 7h12M8 2l5 5-5 5" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </motion.span>
      )}
    </motion.a>
  )
}
