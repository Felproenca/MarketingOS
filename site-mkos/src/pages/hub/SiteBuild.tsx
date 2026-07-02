import { useRef } from 'react'
import { useInView } from 'framer-motion'
import { Link } from 'react-router-dom'
import ModulePage from '../../components/ModulePage'

const SHOWCASE = [
  { name: 'Aura Clínica', sector: 'Estética', accent: '#B8955A', href: '/showcase/aura-clinic.html' },
  { name: 'Apex Motors', sector: 'Automotivo', accent: '#0057FF', href: '/showcase/apex-motors.html' },
  { name: 'Forge Gym', sector: 'Fitness', accent: '#E8D800', href: '/showcase/forge-gym.html' },
]

function ShowcaseStrip() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true })

  return (
    <section ref={ref} style={{ padding: '80px 6vw', borderBottom: '1px solid var(--border)' }}>
      <span className="tag" style={{ marginBottom: 20, display: 'inline-flex' }}>Projetos Recentes</span>
      <h2 style={{
        fontFamily: 'Anton, sans-serif',
        fontSize: 'clamp(32px, 4.5vw, 56px)',
        color: 'var(--text)', lineHeight: 1.05, marginBottom: 48,
      }}>
        SITES QUE O<br /><span style={{ color: '#B8A0FF' }}>MERCADO NÃO ESQUECE.</span>
      </h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2 }}>
        {SHOWCASE.map((s, i) => (
          <a
            key={i}
            href={s.href}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'block', textDecoration: 'none',
              background: 'var(--bg-2)', border: '1px solid var(--border)',
              padding: '32px 28px',
              transition: 'border-color 0.25s',
            }}
            onMouseEnter={e => (e.currentTarget as HTMLAnchorElement).style.borderColor = `${s.accent}50`}
            onMouseLeave={e => (e.currentTarget as HTMLAnchorElement).style.borderColor = 'var(--border)'}
          >
            <div style={{
              width: '100%', aspectRatio: '16/7',
              background: `radial-gradient(ellipse at 50% 50%, ${s.accent}12 0%, transparent 60%)`,
              marginBottom: 20,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: `1px solid ${s.accent}15`,
            }}>
              <span style={{
                fontFamily: 'Anton, sans-serif', fontSize: 14, letterSpacing: '0.1em',
                color: `${s.accent}70`, textTransform: 'uppercase',
              }}>
                {s.sector}
              </span>
            </div>
            <div style={{
              fontFamily: 'Anton, sans-serif', fontSize: 18, letterSpacing: '0.02em',
              color: 'var(--text)', marginBottom: 8,
            }}>
              {s.name}
            </div>
            <div style={{
              fontFamily: 'monospace', fontSize: 9, letterSpacing: '0.1em',
              color: s.accent,
            }}>
              ABRIR SITE →
            </div>
          </a>
        ))}
      </div>
      <div style={{ marginTop: 24, textAlign: 'right' }}>
        <Link to="/" style={{
          fontFamily: 'monospace', fontSize: 9, letterSpacing: '0.1em',
          color: 'var(--text-3)', textDecoration: 'none',
          borderBottom: '1px solid var(--border)', paddingBottom: 2,
        }}>
          VER SHOWCASE COMPLETO →
        </Link>
      </div>
    </section>
  )
}

export default function SiteBuild() {
  return (
    <ModulePage
      label="02"
      name="SITE BUILD"
      tagline="Do zero ao ar — site cinematográfico com direção de arte, motion e copy de aquisição."
      accent="#B8A0FF"
      intelligence="Creative Direction Engine + Visual DNA System"
      signal="ATIVO"
      heroDesc="Não construímos sites. Construímos a primeira impressão que faz alguém querer continuar. Cada projeto começa com percepção — nunca com template. O resultado é um site que o mercado reconhece antes de ler o nome."
      sections={[
        {
          icon: '◈',
          title: 'Direção de Arte',
          body: 'Visual DNA único por marca: paleta, tipografia, espaçamento e linguagem de movimento derivados da percepção mapeada. Nenhuma escolha estética arbitrária.',
        },
        {
          icon: '◎',
          title: 'Motion Design',
          body: 'Física de scroll, transições com spring, parallax e microinterações. O movimento comunica — não decora. Cada animação serve a uma intenção narrativa.',
        },
        {
          icon: '▸',
          title: 'Copy Estratégica',
          body: 'Hero, seções e CTAs escritos para mover uma crença específica por etapa. Hierarquia de informação planejada como funil, não como brochura.',
        },
        {
          icon: '◐',
          title: 'Perfomance & Deploy',
          body: 'Build otimizado para Core Web Vitals. Deploy no Vercel ou Cloudflare Pages. Analytics, pixels e SEO técnico configurados desde o dia zero.',
        },
      ]}
      deliverables={[
        {
          name: 'Brief de Percepção',
          desc: 'Perception Map + Visual DNA da marca. Define o DNA de tudo que vem depois.',
          time: 'Dia 2',
        },
        {
          name: 'Wireframes + Copy',
          desc: 'Estrutura de cada seção com copy definitiva. Aprovação antes de codificar.',
          time: 'Dia 5',
        },
        {
          name: 'Design System',
          desc: 'Paleta, tipografia, componentes e variáveis de motion documentados.',
          time: 'Dia 8',
        },
        {
          name: 'Site no ar',
          desc: 'Site completo publicado com motion, copy, SEO e analytics configurados.',
          time: 'Dia 14',
        },
        {
          name: 'Kit de manutenção',
          desc: 'Documentação, variáveis de ambiente, guia de edição de copy e design system.',
          time: 'Dia 15',
        },
      ]}
      cta={{
        title: 'SEU PRÓXIMO\nSITE\nCOMEÇA AQUI.',
        body: 'Conversa de 30 min para entender o que sua marca precisa provocar. Sem compromisso — só clareza.',
        btnLabel: 'FALAR SOBRE O PROJETO',
      }}
    >
      <ShowcaseStrip />
    </ModulePage>
  )
}
