import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion, useInView } from 'framer-motion'
import HubLayout from '../components/HubLayout'

const MODULES = [
  {
    id: 'site',
    href: '/hub/site',
    label: '01',
    name: 'SITE INTELIGENTE',
    tagline: 'Seu site diagnosticado e reescrito pela percepção do mercado.',
    intelligence: 'Perception Engine + Commercial Audit',
    signal: 'ATIVO',
    accent: '#D4FF00',
    desc: 'Auditamos o site atual pela ótica do cliente — o que ele sente, o que entende e por que não converte. Entregamos um novo site com DNA visual único e copy de aquisição.',
    metrics: ['Auditoria em 48h', 'Percepção mapeada', 'Site entregue em 14 dias'],
  },
  {
    id: 'build',
    href: '/hub/build',
    label: '02',
    name: 'SITE BUILD',
    tagline: 'Sites cinematográficos que o mercado não esquece.',
    intelligence: 'Creative Direction Engine + Visual DNA',
    signal: 'ATIVO',
    accent: '#B8A0FF',
    desc: 'Do zero ao ar. Site completo com direção de arte, motion design, copy de aquisição e deploy. Cada projeto começa pela percepção — nunca pelo template.',
    metrics: ['14 dias de entrega', 'Motion design incluso', 'Copy de aquisição'],
  },
  {
    id: 'social',
    href: '/hub/social',
    label: '03',
    name: 'AGENTE SOCIAL',
    tagline: 'Todas as redes operam como sistema de aquisição.',
    intelligence: 'Topic Intelligence + Content Engine',
    signal: 'EM BREVE',
    accent: '#00D4FF',
    desc: 'IA que pesquisa, planeja, cria e publica conteúdo alinhado à aquisição — em Instagram, LinkedIn, TikTok e YouTube. Não é agendamento. É estratégia executada.',
    metrics: ['4 redes simultâneas', 'Pauta inteligente semanal', 'Métricas de aquisição'],
  },
  {
    id: 'trafego',
    href: '/hub/trafego',
    label: '04',
    name: 'AGENTE TRÁFEGO',
    tagline: 'Mídia paga com inteligência de diagnóstico, não de volume.',
    intelligence: 'Acquisition Intelligence + Signal Layer',
    signal: 'EM BREVE',
    accent: '#FF6B35',
    desc: 'Agente que monitora campanhas, detecta gargalos de conversão e ajusta copy e segmentação. O tráfego serve ao funil — não o contrário.',
    metrics: ['Google + Meta integrado', 'Diagnóstico de funil', 'Ajuste semanal'],
  },
  {
    id: 'aquisicao',
    href: '/hub/aquisicao',
    label: '05',
    name: 'AGENTE AQUISIÇÃO',
    tagline: 'O sistema que sabe de onde vai vir o próximo cliente.',
    intelligence: 'Acquisition Funnel + Automation Layer',
    signal: 'EM BREVE',
    accent: '#4DFF91',
    desc: 'Follow-up automático com aprovação humana. Captação por DM, comentário e lead magnet. CRM de sinais que prioriza os mais quentes. Aquisição observável e ajustável.',
    metrics: ['Follow-up com aprovação', 'Score de leads', 'Pipeline de sinais'],
  },
]

function ModuleCard({ mod, index }: { mod: typeof MODULES[0]; index: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: index * 0.1, ease: [0.25, 0, 0, 1] }}
      style={{ position: 'relative' }}
    >
      <Link
        to={mod.href}
        style={{ textDecoration: 'none', display: 'block', height: '100%' }}
      >
        <div
          className="module-card"
          style={{
            background: 'var(--bg-2)',
            border: '1px solid var(--border)',
            padding: '36px 32px',
            height: '100%',
            display: 'flex', flexDirection: 'column',
            position: 'relative', overflow: 'hidden',
            transition: 'border-color 0.3s',
            cursor: 'pointer',
          }}
          onMouseEnter={e => {
            ;(e.currentTarget as HTMLDivElement).style.borderColor = `${mod.accent}50`
          }}
          onMouseLeave={e => {
            ;(e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border)'
          }}
        >
          {/* Accent top bar */}
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, height: 2,
            background: `linear-gradient(to right, ${mod.accent}, transparent)`,
          }} />

          {/* Header row */}
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
            marginBottom: 24,
          }}>
            <span style={{
              fontFamily: 'Anton, sans-serif', fontSize: 40,
              color: `${mod.accent}18`, lineHeight: 1, letterSpacing: '0.02em',
            }}>
              {mod.label}
            </span>
            <span style={{
              fontFamily: 'monospace', fontSize: 8, letterSpacing: '0.12em',
              padding: '4px 10px',
              background: mod.signal === 'ATIVO' ? `${mod.accent}15` : 'rgba(255,255,255,0.04)',
              border: `1px solid ${mod.signal === 'ATIVO' ? mod.accent + '40' : 'rgba(255,255,255,0.08)'}`,
              color: mod.signal === 'ATIVO' ? mod.accent : 'var(--text-3)',
              borderRadius: 20,
            }}>
              ● {mod.signal}
            </span>
          </div>

          {/* Name */}
          <div style={{
            fontFamily: 'Anton, sans-serif', fontSize: 22, letterSpacing: '0.03em',
            color: 'var(--text)', lineHeight: 1.1, marginBottom: 12,
          }}>
            {mod.name}
          </div>

          {/* Tagline */}
          <p style={{
            fontSize: 14, color: 'var(--text-2)', lineHeight: 1.65, marginBottom: 20,
          }}>
            {mod.tagline}
          </p>

          {/* Intelligence badge */}
          <div style={{
            fontFamily: 'monospace', fontSize: 8, letterSpacing: '0.1em',
            color: `${mod.accent}90`, textTransform: 'uppercase', marginBottom: 20,
            paddingBottom: 20, borderBottom: '1px solid var(--border)',
          }}>
            ◈ {mod.intelligence}
          </div>

          {/* Description */}
          <p style={{
            fontSize: 13, color: 'var(--text-3)', lineHeight: 1.75, marginBottom: 24, flex: 1,
          }}>
            {mod.desc}
          </p>

          {/* Metrics */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 28 }}>
            {mod.metrics.map(m => (
              <div key={m} style={{
                display: 'flex', alignItems: 'center', gap: 10,
                fontFamily: 'monospace', fontSize: 10, color: 'var(--text-2)', letterSpacing: '0.06em',
              }}>
                <span style={{ color: mod.accent, fontSize: 8 }}>▸</span>
                {m}
              </div>
            ))}
          </div>

          {/* CTA */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <span style={{
              fontFamily: 'monospace', fontSize: 9, letterSpacing: '0.12em',
              color: mod.accent, textTransform: 'uppercase',
            }}>
              CONHECER MÓDULO →
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}

export default function Hub() {
  const titleRef = useRef<HTMLDivElement>(null)
  const titleInView = useInView(titleRef, { once: true })

  return (
    <HubLayout>
      {/* Hero Hub */}
      <section style={{
        minHeight: '60vh', padding: '80px 6vw 60px',
        display: 'flex', flexDirection: 'column', justifyContent: 'center',
        borderBottom: '1px solid var(--border)', position: 'relative', overflow: 'hidden',
      }}>
        {/* Grid bg */}
        <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.025, pointerEvents: 'none' }}>
          <defs>
            <pattern id="hubgrid" width="80" height="80" patternUnits="userSpaceOnUse">
              <path d="M 80 0 L 0 0 0 80" fill="none" stroke="#D4FF00" strokeWidth="0.5"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#hubgrid)" />
        </svg>

        <div ref={titleRef} style={{ maxWidth: 900, position: 'relative', zIndex: 1 }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={titleInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
          >
            <span className="tag" style={{ marginBottom: 24, display: 'inline-flex' }}>
              Ecosystem
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={titleInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.1 }}
            style={{
              fontFamily: 'Anton, sans-serif',
              fontSize: 'clamp(52px, 9vw, 120px)',
              lineHeight: 0.92, letterSpacing: '0.01em',
              color: 'var(--text)', marginBottom: 32,
            }}
          >
            O SISTEMA<br />
            <span style={{ color: 'var(--accent)' }}>OPERACIONAL</span><br />
            DE AQUISIÇÃO.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={titleInView ? { opacity: 1 } : {}}
            transition={{ duration: 0.6, delay: 0.3 }}
            style={{
              fontSize: 18, color: 'var(--text-2)', lineHeight: 1.75,
              maxWidth: 620, marginBottom: 40,
            }}
          >
            Cinco módulos integrados. Cada um com inteligência própria.
            Todos apontando para a mesma pergunta: <em style={{ color: 'var(--text)', fontStyle: 'normal' }}>de onde vai vir o próximo cliente?</em>
          </motion.p>

          <motion.div
            initial={{ opacity: 0 }}
            animate={titleInView ? { opacity: 1 } : {}}
            transition={{ duration: 0.6, delay: 0.45 }}
            style={{ display: 'flex', gap: 20, alignItems: 'center', flexWrap: 'wrap' }}
          >
            <Link to="/#cta" style={{
              fontFamily: 'Anton, sans-serif', fontSize: 14, letterSpacing: '0.06em',
              background: 'var(--accent)', color: '#000',
              padding: '16px 32px', textDecoration: 'none',
            }}>
              DIAGNÓSTICO GRATUITO
            </Link>
            <span style={{ fontFamily: 'monospace', fontSize: 10, color: 'var(--text-3)', letterSpacing: '0.1em' }}>
              ↓ EXPLORE OS MÓDULOS
            </span>
          </motion.div>
        </div>

        {/* Status indicators right */}
        <div style={{
          position: 'absolute', right: '6vw', top: '50%', transform: 'translateY(-50%)',
          display: 'flex', flexDirection: 'column', gap: 10,
        }}>
          {MODULES.map(m => (
            <div key={m.id} style={{
              display: 'flex', alignItems: 'center', gap: 10,
              fontFamily: 'monospace', fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase',
              color: m.signal === 'ATIVO' ? m.accent : 'var(--text-3)',
              opacity: m.signal === 'ATIVO' ? 1 : 0.5,
            }}>
              <motion.div
                animate={m.signal === 'ATIVO' ? { opacity: [1, 0.3, 1] } : {}}
                transition={{ duration: 2, repeat: Infinity, delay: MODULES.indexOf(m) * 0.4 }}
                style={{ width: 5, height: 5, borderRadius: '50%', background: m.accent, flexShrink: 0 }}
              />
              {m.name}
            </div>
          ))}
        </div>
      </section>

      {/* Modules Grid */}
      <section style={{ padding: '80px 6vw' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
          gap: 2,
        }}>
          {MODULES.map((mod, i) => (
            <ModuleCard key={mod.id} mod={mod} index={i} />
          ))}
        </div>
      </section>

      {/* How it connects */}
      <section style={{
        padding: '80px 6vw', borderTop: '1px solid var(--border)',
        background: 'var(--bg-2)',
      }}>
        <div style={{ maxWidth: 760, margin: '0 auto', textAlign: 'center' }}>
          <span className="tag" style={{ marginBottom: 24, display: 'inline-flex' }}>Integração</span>
          <h2 style={{
            fontFamily: 'Anton, sans-serif',
            fontSize: 'clamp(36px, 5vw, 64px)',
            color: 'var(--text)', lineHeight: 1.05, marginBottom: 28,
          }}>
            CADA MÓDULO FALA<br />
            <span style={{ color: 'var(--accent)' }}>COM O SISTEMA.</span>
          </h2>
          <p style={{ fontSize: 16, color: 'var(--text-2)', lineHeight: 1.8, marginBottom: 48 }}>
            O Site Inteligente alimenta o Agente Social com DNA visual.
            O Agente Social gera sinais para o Agente de Aquisição.
            O Tráfego converge para o mesmo funil. Tudo observável no mesmo painel.
          </p>
          <Link to="/#cta" style={{
            fontFamily: 'Anton, sans-serif', fontSize: 14, letterSpacing: '0.06em',
            background: 'var(--accent)', color: '#000', padding: '16px 36px', textDecoration: 'none', display: 'inline-block',
          }}>
            QUERO UM DIAGNÓSTICO
          </Link>
        </div>
      </section>
    </HubLayout>
  )
}
