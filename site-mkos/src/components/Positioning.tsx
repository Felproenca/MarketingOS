import { useRef, useState, useCallback } from 'react'
import { motion, useInView } from 'framer-motion'

const PILLARS = [
  {
    num: '01',
    title: 'PERCEPÇÃO PRIMEIRO',
    body: 'Antes de qualquer código, definimos como a marca deve ser percebida nos primeiros 15 segundos. Isso determina tudo.',
    accent: '#D4FF00',
  },
  {
    num: '02',
    title: 'NARRATIVA COMO ESTRUTURA',
    body: 'Cada seção existe por um motivo. O visitante não lê uma página — ele percorre uma história com início, tensão e resolução.',
    accent: '#00D4FF',
  },
  {
    num: '03',
    title: 'MOVIMENTO COM INTENÇÃO',
    body: 'Nenhuma animação existe sem responder: por que isso se move? Cada transição comunica valor, hierarquia ou emoção.',
    accent: '#B8A0FF',
  },
]

function MagnetCard({ pillar, index, inView }: { pillar: typeof PILLARS[0]; index: number; inView: boolean }) {
  const cardRef = useRef<HTMLDivElement>(null)
  const [tilt, setTilt] = useState({ x: 0, y: 0 })
  const [lantern, setLantern] = useState({ x: 50, y: 50, active: false })

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const card = cardRef.current
    if (!card) return
    const rect = card.getBoundingClientRect()
    const cx = rect.left + rect.width / 2
    const cy = rect.top + rect.height / 2
    setTilt({ x: (e.clientX - cx) * 0.04, y: (e.clientY - cy) * 0.04 })
    setLantern({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
      active: true,
    })
  }, [])

  const handleMouseLeave = useCallback(() => {
    setTilt({ x: 0, y: 0 })
    setLantern(prev => ({ ...prev, active: false }))
  }, [])

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8, delay: 0.15 + index * 0.12, ease: [0.16, 1, 0.3, 1] }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        position: 'relative',
        padding: '36px 32px 32px',
        background: 'var(--bg)',
        border: `1px solid ${lantern.active ? pillar.accent + '33' : 'var(--border)'}`,
        borderRadius: 16,
        overflow: 'hidden',
        cursor: 'crosshair',
        transform: `translate(${tilt.x}px, ${tilt.y}px)`,
        transition: 'transform 0.3s cubic-bezier(0.16,1,0.3,1), border-color 0.3s',
        willChange: 'transform',
      }}
    >
      {/* Lantern spotlight */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none', borderRadius: 16,
        background: `radial-gradient(circle 200px at ${lantern.x}% ${lantern.y}%, ${pillar.accent}16 0%, transparent 70%)`,
        opacity: lantern.active ? 1 : 0,
        transition: 'opacity 0.35s',
      }} />

      {/* Bottom accent line — inside the card at bottom edge */}
      <div style={{
        position: 'absolute',
        bottom: 0, left: 0,
        height: 1,
        width: lantern.active ? '100%' : '0%',
        background: `linear-gradient(to right, ${pillar.accent}, transparent)`,
        transition: 'width 0.5s cubic-bezier(0.16,1,0.3,1)',
      }} />

      {/* Content */}
      <div style={{ position: 'relative', zIndex: 1 }}>
        <div style={{
          fontFamily: 'monospace', fontSize: 11, letterSpacing: '0.12em',
          color: pillar.accent, marginBottom: 20, opacity: 0.7,
        }}>
          {pillar.num}
        </div>

        <h3 style={{
          fontFamily: "'Anton', sans-serif",
          fontSize: 24,
          letterSpacing: '0.02em',
          lineHeight: 1.1,
          marginBottom: 16,
          color: lantern.active ? pillar.accent : 'var(--text)',
          transition: 'color 0.3s',
        }}>
          {pillar.title}
        </h3>

        <p style={{ fontSize: 14, color: 'var(--text-2)', lineHeight: 1.75, margin: 0 }}>
          {pillar.body}
        </p>
      </div>
    </motion.div>
  )
}

export default function Positioning() {
  const ref = useRef<HTMLElement>(null)
  const inView = useInView(ref, { once: true, margin: '-100px' })

  return (
    <section ref={ref} id="processo" style={{ background: 'var(--bg-2)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          style={{ marginBottom: 64, maxWidth: 800 }}
        >
          <span className="tag" style={{ marginBottom: 24, display: 'inline-flex' }}>Princípio</span>
          <p style={{
            fontFamily: "'Anton', sans-serif",
            fontSize: 'clamp(28px, 4vw, 52px)',
            lineHeight: 1.1,
            letterSpacing: '0.02em',
            color: 'var(--text)',
          }}>
            Não criamos páginas.{' '}
            <span style={{ color: 'var(--accent)' }}>Criamos percepção.</span>
          </p>
          <p style={{ marginTop: 20, fontSize: 14, color: 'var(--text-3)', lineHeight: 1.75 }}>
            Passe o cursor pelos cards.
          </p>
        </motion.div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }}>
          {PILLARS.map((p, i) => (
            <MagnetCard key={p.num} pillar={p} index={i} inView={inView} />
          ))}
        </div>
      </div>
    </section>
  )
}
