import { useRef, useState } from 'react'
import { motion, useInView } from 'framer-motion'

const AGENTS = [
  { id: '01', name: 'ORCHESTRATOR',       color: '#D4FF00', desc: 'Recebe o briefing, define objetivo de percepção, ativa os demais agentes.' },
  { id: '02', name: 'REFERENCE LAB',      color: '#00D4FF', desc: '3 referências obrigatórias antes de qualquer código. Extrai gramática visual, não copia.' },
  { id: '03', name: 'PERCEPTION ENGINE',  color: '#B8A0FF', desc: 'Define como a marca precisa ser percebida: 3s, 15s, 30s, 60s.' },
  { id: '04', name: 'CREATIVE DIRECTOR',  color: '#FF8C42', desc: 'Transforma percepção em linguagem: estilo, ritmo, densidade, atmosfera.' },
  { id: '05', name: 'NARRATIVE DIRECTOR', color: '#FF4D6D', desc: 'Define os beats: impacto → curiosidade → contexto → autoridade → conversão.' },
  { id: '06', name: 'COPY DIRECTOR',      color: '#4DFF91', desc: 'Copy que sustenta estética. Direta, específica, sem clichê.' },
  { id: '07', name: 'ART DIRECTOR',       color: '#FFD700', desc: 'Protagonista visual, iluminação, composição, profundidade.' },
  { id: '08', name: 'MOTION DIRECTOR',    color: '#00FFFF', desc: 'Movimento com intenção: Lenis + GSAP + Framer. Nunca decorativo.' },
  { id: '09', name: 'BUILD ENGINE',       color: '#D4FF00', desc: 'React + Tailwind + código limpo, pronto para rodar e gravar.' },
  { id: '10', name: 'PERCEPTION QA',      color: '#FF6B6B', desc: 'Nenhum projeto sai com nota abaixo de 8.5. Revisar ou reprovar.' },
]

const BEATS = [
  { n: '1', label: 'Impacto',      desc: 'Hero que prende em 3s',         color: '#D4FF00' },
  { n: '2', label: 'Curiosidade',  desc: 'Frase que obriga a continuar',  color: '#00D4FF' },
  { n: '3', label: 'Contexto',     desc: 'O problema reconhecido',        color: '#B8A0FF' },
  { n: '4', label: 'Autoridade',   desc: 'Por que você é a resposta',     color: '#FF8C42' },
  { n: '5', label: 'Demonstração', desc: 'Prova visual e de processo',    color: '#4DFF91' },
  { n: '6', label: 'Conversão',    desc: 'CTA no momento exato',          color: '#FFD700' },
]

function AgentCard({ agent, index, inView }: { agent: typeof AGENTS[0]; index: number; inView: boolean }) {
  const [hovered, setHovered] = useState(false)
  const [lantern, setLantern] = useState({ x: 50, y: 50 })

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.05, ease: [0.16, 1, 0.3, 1] }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onMouseMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect()
        setLantern({
          x: ((e.clientX - rect.left) / rect.width) * 100,
          y: ((e.clientY - rect.top) / rect.height) * 100,
        })
      }}
      style={{
        position: 'relative',
        display: 'grid',
        gridTemplateColumns: '28px 1fr',
        gap: 12,
        padding: '16px 18px',
        background: 'var(--bg-2)',
        border: '1px solid var(--border)',
        borderLeft: `2px solid ${hovered ? agent.color : agent.color + '55'}`,
        borderRadius: 10,
        overflow: 'hidden',
        transition: 'border-color 0.2s, background 0.2s',
        cursor: 'default',
      }}
    >
      {/* Lantern glow */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: `radial-gradient(circle 120px at ${lantern.x}% ${lantern.y}%, ${agent.color}12 0%, transparent 70%)`,
        opacity: hovered ? 1 : 0,
        transition: 'opacity 0.3s',
      }} />

      {/* Index */}
      <span style={{
        fontFamily: 'monospace', fontSize: 10, color: 'var(--text-3)',
        letterSpacing: '0.05em', paddingTop: 2, lineHeight: 1,
        opacity: hovered ? 1 : 0.5, transition: 'opacity 0.2s',
      }}>
        {agent.id}
      </span>

      {/* Content */}
      <div style={{ position: 'relative', zIndex: 1, minWidth: 0 }}>
        <div style={{
          fontFamily: "'Anton', sans-serif",
          fontSize: 13,
          letterSpacing: '0.06em',
          color: hovered ? agent.color : agent.color + 'BB',
          marginBottom: 5,
          transition: 'color 0.2s',
          lineHeight: 1.2,
        }}>
          {agent.name}
        </div>
        <p style={{
          fontSize: 12,
          color: hovered ? 'var(--text-2)' : 'var(--text-3)',
          lineHeight: 1.6,
          transition: 'color 0.2s',
          margin: 0,
        }}>
          {agent.desc}
        </p>
      </div>
    </motion.div>
  )
}

export default function Process() {
  const ref = useRef<HTMLElement>(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  const beatsRef = useRef<HTMLDivElement>(null)
  const beatsInView = useInView(beatsRef as React.RefObject<Element>, { once: true, margin: '-80px' })

  return (
    <section ref={ref} id="sistema" style={{ background: 'var(--bg-2)' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.9 }}
          style={{ marginBottom: 48 }}
        >
          <span className="tag" style={{ marginBottom: 20, display: 'inline-flex' }}>Sistema Multiagente</span>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 32, flexWrap: 'wrap' }}>
            <h2 style={{
              fontFamily: "'Anton', sans-serif",
              fontSize: 'clamp(36px, 5.5vw, 68px)',
              letterSpacing: '0.02em',
              color: 'var(--text)',
              lineHeight: 1.0,
              margin: 0,
            }}>
              10 AGENTES.<br />
              <span style={{ color: 'var(--accent)' }}>1 ENTREGA.</span>
            </h2>
            <p style={{ fontSize: 15, color: 'var(--text-2)', lineHeight: 1.75, maxWidth: 360 }}>
              Cada site passa por uma orquestra de agentes especializados — em sequência obrigatória, sem atalhos.
            </p>
          </div>
        </motion.div>

        {/* Agent grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 72 }}>
          {AGENTS.map((agent, i) => (
            <AgentCard key={agent.id} agent={agent} index={i} inView={inView} />
          ))}
        </div>

        {/* Narrative beats */}
        <div ref={beatsRef}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={beatsInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7 }}
            style={{ marginBottom: 28 }}
          >
            <span className="tag" style={{ marginBottom: 16, display: 'inline-flex' }}>Narrative Framework</span>
            <h3 style={{ fontFamily: "'Anton', sans-serif", fontSize: 28, letterSpacing: '0.02em', color: 'var(--text)' }}>
              OS 6 BEATS DE TODA EXPERIÊNCIA
            </h3>
          </motion.div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 10 }}>
            {BEATS.map((beat, i) => (
              <motion.div
                key={beat.n}
                initial={{ opacity: 0, y: 24 }}
                animate={beatsInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: i * 0.08 }}
                style={{
                  padding: '20px 14px',
                  background: 'var(--bg)',
                  border: '1px solid var(--border)',
                  borderTop: `2px solid ${beat.color}`,
                  borderRadius: '0 0 10px 10px',
                  textAlign: 'center',
                }}
              >
                <div style={{
                  fontFamily: "'Anton', sans-serif", fontSize: 36,
                  color: beat.color, lineHeight: 1, marginBottom: 10,
                  textShadow: `0 0 20px ${beat.color}44`,
                }}>
                  {beat.n}
                </div>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text)', marginBottom: 5, letterSpacing: '0.04em' }}>
                  {beat.label.toUpperCase()}
                </div>
                <div style={{ fontSize: 10, color: 'var(--text-3)', lineHeight: 1.5 }}>{beat.desc}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
