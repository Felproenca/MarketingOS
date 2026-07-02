import { Link } from 'react-router-dom'
import { FileText, Image, Film, Layout, Mic } from 'lucide-react'

const CONTENT_TYPES = [
  {
    icon: <Layout size={22} />,
    label: 'Carrossel',
    desc: 'Slides para Instagram com navegação e copy estratégica.',
    color: 'var(--accent)',
    action: '/missoes/nova?modo=conteudo&tipo=carrossel',
  },
  {
    icon: <FileText size={22} />,
    label: 'Post',
    desc: 'Post de feed, story ou texto curto com direção visual.',
    color: 'var(--cyan)',
    action: '/missoes/nova?modo=conteudo&tipo=post',
  },
  {
    icon: <Film size={22} />,
    label: 'Reel',
    desc: 'Vídeo animado com motion pattern e texto revelado.',
    color: 'var(--green)',
    action: '/missoes/nova?modo=conteudo&tipo=reel',
  },
  {
    icon: <Mic size={22} />,
    label: 'Roteiro',
    desc: 'Script estruturado para vídeo falado ou narrado.',
    color: 'var(--amber)',
    action: '/missoes/nova?modo=conteudo&tipo=roteiro',
  },
  {
    icon: <Image size={22} />,
    label: 'Imagem',
    desc: 'Prompt + geração de imagem de apoio ou visual temático.',
    color: 'var(--red)',
    action: '/missoes/nova?modo=conteudo&tipo=imagem',
  },
]

const CONTENT_PRINCIPLES = [
  '70% problemas universais de aquisição',
  '20% build in public — processo e bastidores',
  '10% casos específicos de clientes',
]

export default function Conteudo() {
  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '28px 32px', maxWidth: 900 }}>
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontFamily: 'var(--f-mono)', fontSize: 10, color: 'var(--text-3)', letterSpacing: '0.08em', marginBottom: 6 }}>PRODUÇÃO</div>
        <h1 className="display" style={{ fontSize: 32, color: 'var(--text)', lineHeight: 1, marginBottom: 16 }}>CONTEÚDO</h1>

        {/* Distribution */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, padding: '14px 18px', display: 'flex', gap: 16, alignItems: 'center' }}>
          <div style={{ fontFamily: 'var(--f-mono)', fontSize: 10, color: 'var(--text-3)', letterSpacing: '0.06em', flexShrink: 0 }}>
            DISTRIBUIÇÃO EDITORIAL
          </div>
          <div className="flex gap-2 flex-wrap">
            {CONTENT_PRINCIPLES.map((p, i) => (
              <span
                key={p}
                className="tag"
                style={{
                  color: i === 0 ? 'var(--accent)' : i === 1 ? 'var(--cyan)' : 'var(--amber)',
                  background: i === 0 ? 'var(--accent-glow)' : i === 1 ? 'rgba(0,212,255,0.08)' : 'rgba(255,184,0,0.08)',
                  border: `1px solid ${i === 0 ? 'var(--border-accent)' : i === 1 ? 'rgba(0,212,255,0.2)' : 'rgba(255,184,0,0.2)'}`,
                }}
              >
                {p}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Content type grid */}
      <div style={{ marginBottom: 8, fontFamily: 'var(--f-mono)', fontSize: 10, color: 'var(--text-3)', letterSpacing: '0.08em' }}>
        CRIAR NOVA PEÇA
      </div>
      <div className="grid gap-4 mb-8" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))' }}>
        {CONTENT_TYPES.map(ct => (
          <Link
            key={ct.label}
            to={ct.action}
            style={{
              display: 'flex', alignItems: 'flex-start', gap: 14,
              padding: '16px 18px',
              background: 'var(--bg-card)', border: '1px solid var(--border)',
              borderRadius: 10, textDecoration: 'none',
              transition: 'all 0.15s',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.borderColor = ct.color
              ;(e.currentTarget as HTMLElement).style.background = 'var(--bg-hover)'
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'
              ;(e.currentTarget as HTMLElement).style.background = 'var(--bg-card)'
            }}
          >
            <span style={{ color: ct.color, marginTop: 2 }}>{ct.icon}</span>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>{ct.label}</div>
              <div style={{ fontSize: 11, color: 'var(--text-2)', lineHeight: 1.5 }}>{ct.desc}</div>
            </div>
          </Link>
        ))}
      </div>

      {/* Recent content missions */}
      <div style={{ fontFamily: 'var(--f-mono)', fontSize: 10, color: 'var(--text-3)', letterSpacing: '0.08em', marginBottom: 14 }}>
        PRODUÇÕES RECENTES
      </div>
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, padding: '16px 20px', color: 'var(--text-2)', fontSize: 12 }}>
        <div style={{ fontFamily: 'var(--f-mono)', fontSize: 11, color: 'var(--text-3)', marginBottom: 8 }}>
          Carrossel — Gargalos de Aquisição
        </div>
        <div style={{ fontSize: 13, color: 'var(--text)', fontWeight: 600, marginBottom: 4 }}>
          5 Razões que Travam sua Aquisição (e Como Identificar)
        </div>
        <div style={{ fontSize: 11, color: 'var(--text-2)', fontFamily: 'var(--f-mono)' }}>
          STATUS: CONCLUÍDO · 6 slides · Instagram Feed
        </div>
      </div>
    </div>
  )
}
