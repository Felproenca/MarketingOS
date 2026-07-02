import { useRef, useEffect, useState } from 'react'
import { motion, useInView, useAnimationFrame } from 'framer-motion'

/* ─── Marquee band ─── */
const MARQUEE_ITEMS = [
  'PERCEPÇÃO', '·', 'NARRATIVA', '·', 'MOTION', '·', 'CÓDIGO', '·',
  'REFERÊNCIA', '·', 'DNA VISUAL', '·', 'QA 8.5+', '·',
]

function Marquee({ speed = 0.4, reverse = false }: { speed?: number; reverse?: boolean }) {
  const x = useRef(0)
  const ref = useRef<HTMLDivElement>(null)

  useAnimationFrame((_, delta) => {
    const dir = reverse ? 1 : -1
    x.current += dir * speed * (delta / 16)
    const el = ref.current
    if (!el) return
    const half = el.scrollWidth / 2
    if (!reverse && x.current < -half) x.current = 0
    if (reverse && x.current > 0) x.current = -half
    el.style.transform = `translateX(${x.current}px)`
  })

  const items = [...MARQUEE_ITEMS, ...MARQUEE_ITEMS]

  return (
    <div style={{ overflow: 'hidden', width: '100%' }}>
      <div ref={ref} style={{ display: 'flex', gap: 32, whiteSpace: 'nowrap', willChange: 'transform' }}>
        {items.map((item, i) => (
          <span key={i} style={{
            fontFamily: "'Anton', sans-serif",
            fontSize: 13,
            letterSpacing: '0.1em',
            color: item === '·' ? 'var(--accent)' : 'var(--text-3)',
            flexShrink: 0,
          }}>
            {item}
          </span>
        ))}
      </div>
    </div>
  )
}

/* ─── Animated counter ─── */
function Counter({ target, suffix = '' }: { target: number; suffix?: string }) {
  const [val, setVal] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true })

  useEffect(() => {
    if (!inView) return
    let start = 0
    const step = target / 60
    const timer = setInterval(() => {
      start += step
      if (start >= target) { setVal(target); clearInterval(timer) }
      else setVal(Math.floor(start * 10) / 10)
    }, 16)
    return () => clearInterval(timer)
  }, [inView, target])

  return <span ref={ref}>{val.toFixed(suffix === '' ? 0 : 1)}{suffix}</span>
}

/* ─── Radar pulse ─── */
function Radar() {
  return (
    <div style={{ position: 'relative', width: 200, height: 200, flexShrink: 0 }}>
      {[1, 2, 3].map(i => (
        <motion.div
          key={i}
          animate={{ scale: [1, 2.4], opacity: [0.4, 0] }}
          transition={{ duration: 2.4, repeat: Infinity, delay: i * 0.7, ease: 'easeOut' }}
          style={{
            position: 'absolute', inset: 0,
            borderRadius: '50%',
            border: '1px solid rgba(212,255,0,0.5)',
          }}
        />
      ))}
      <div style={{
        position: 'absolute', inset: 0,
        borderRadius: '50%',
        border: '1px solid rgba(212,255,0,0.2)',
        background: 'radial-gradient(circle, rgba(212,255,0,0.08) 0%, transparent 70%)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
          style={{
            width: '100%', height: '100%',
            borderRadius: '50%',
            background: 'conic-gradient(from 0deg, transparent 70%, rgba(212,255,0,0.4) 100%)',
          }}
        />
        <div style={{
          position: 'absolute',
          fontFamily: "'Anton', sans-serif",
          fontSize: 28,
          color: 'var(--accent)',
          letterSpacing: '0.04em',
        }}>
          9.7
        </div>
      </div>
    </div>
  )
}

/* ─── Score items ─── */
const SCORE_ITEMS = [
  { label: 'Impacto inicial', score: 9.8, color: '#D4FF00' },
  { label: 'Qualidade visual', score: 9.6, color: '#00D4FF' },
  { label: 'Copy', score: 9.5, color: '#B8A0FF' },
  { label: 'Motion', score: 9.7, color: '#D4FF00' },
  { label: 'Assets', score: 9.4, color: '#FF8C42' },
  { label: 'Memorabilidade', score: 9.8, color: '#4DFF91' },
]

export default function WowMoment() {
  const ref = useRef<HTMLElement>(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section
      ref={ref}
      id="resultados"
      style={{
        background: 'var(--bg)',
        borderTop: '1px solid var(--border)',
        borderBottom: '1px solid var(--border)',
        padding: 0,
        overflow: 'hidden',
      }}
    >
      {/* ── Marquee top band ── */}
      <div style={{
        borderBottom: '1px solid var(--border)',
        padding: '14px 0',
        background: 'rgba(212,255,0,0.03)',
      }}>
        <Marquee />
      </div>

      {/* ── Main content ── */}
      <div style={{ padding: '80px 6vw' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>

          {/* Headline row */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.9 }}
            style={{ marginBottom: 64 }}
          >
            <span className="tag" style={{ marginBottom: 24, display: 'inline-flex' }}>Gate de Qualidade</span>
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 40, flexWrap: 'wrap' }}>
              <h2 style={{
                fontFamily: "'Anton', sans-serif",
                fontSize: 'clamp(42px, 6vw, 80px)',
                letterSpacing: '0.02em',
                lineHeight: 1.0,
                color: 'var(--text)',
                margin: 0,
              }}>
                SE NÃO DÁ{' '}
                <span style={{
                  color: 'var(--accent)',
                  textShadow: '0 0 40px rgba(212,255,0,0.3)',
                }}>
                  "CARAMBA"
                </span>
                <br />NÃO SAI.
              </h2>
              <p style={{ fontSize: 15, color: 'var(--text-2)', lineHeight: 1.7, maxWidth: 320 }}>
                Nenhum projeto sai com nota abaixo de <strong style={{ color: 'var(--accent)' }}>8.5</strong> em qualquer dimensão. Se sair, revisamos.
              </p>
            </div>
          </motion.div>

          {/* Stats + Radar + Scores */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: 48, alignItems: 'start' }}>

            {/* Left — stats */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              {[
                { val: 97, suffix: '%', label: 'dos clientes aprovam na 1ª entrega' },
                { val: 9.7, suffix: '/10', label: 'score médio de percepção' },
                { val: 7, suffix: 'd', label: 'da briefing ao site ao vivo' },
              ].map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, x: -20 }}
                  animate={inView ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.7, delay: 0.2 + i * 0.12 }}
                  style={{
                    padding: '24px 28px',
                    background: 'var(--bg-2)',
                    border: '1px solid var(--border)',
                    borderRadius: 12,
                  }}
                >
                  <div style={{
                    fontFamily: "'Anton', sans-serif",
                    fontSize: 48,
                    color: 'var(--accent)',
                    lineHeight: 1,
                    letterSpacing: '0.02em',
                  }}>
                    <Counter target={stat.val} suffix={stat.suffix} />
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--text-2)', marginTop: 8 }}>{stat.label}</div>
                </motion.div>
              ))}
            </div>

            {/* Center — radar */}
            <motion.div
              initial={{ opacity: 0, scale: 0.6 }}
              animate={inView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 1, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}
            >
              <Radar />
              <span style={{ fontFamily: 'monospace', fontSize: 10, color: 'var(--text-3)', letterSpacing: '0.1em' }}>
                PERCEPTION QA
              </span>
            </motion.div>

            {/* Right — score list */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {SCORE_ITEMS.map((item, i) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, x: 20 }}
                  animate={inView ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.6, delay: 0.3 + i * 0.08 }}
                  style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '12px 16px',
                    background: 'var(--bg-2)',
                    border: '1px solid var(--border)',
                    borderRadius: 8,
                    borderLeft: `2px solid ${item.color}`,
                  }}
                >
                  <span style={{ fontSize: 13, color: 'var(--text-2)' }}>{item.label}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 60, height: 2, background: 'var(--bg-3)', borderRadius: 2, overflow: 'hidden' }}>
                      <motion.div
                        initial={{ width: 0 }}
                        animate={inView ? { width: `${item.score * 10}%` } : {}}
                        transition={{ duration: 1.2, delay: 0.5 + i * 0.08, ease: [0.16, 1, 0.3, 1] }}
                        style={{ height: '100%', background: item.color, borderRadius: 2 }}
                      />
                    </div>
                    <span style={{ fontFamily: 'monospace', fontSize: 12, color: item.color, minWidth: 28 }}>
                      {item.score}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Marquee bottom band (reverse) ── */}
      <div style={{
        borderTop: '1px solid var(--border)',
        padding: '14px 0',
        background: 'rgba(212,255,0,0.03)',
      }}>
        <Marquee reverse speed={0.3} />
      </div>
    </section>
  )
}
