import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { FileText, Film, Image, Layout, Loader2, Mic, Sparkles, Zap } from 'lucide-react'
import { getOperations, type Artifact } from '../lib/api'
import { dateShort, statusMeta } from '../lib/formatters'

const CONTENT_TYPES = [
  {
    icon: <Layout size={20} />,
    label: 'Carrossel',
    desc: 'Slides para Instagram com navegação e copy estratégica.',
    color: 'var(--accent)',
    action: '/missoes/nova',
  },
  {
    icon: <FileText size={20} />,
    label: 'Post',
    desc: 'Post de feed, story ou texto curto com direção visual.',
    color: 'var(--cyan)',
    action: '/missoes/nova',
  },
  {
    icon: <Film size={20} />,
    label: 'Reel',
    desc: 'Vídeo animado com motion pattern e texto revelado.',
    color: 'var(--green)',
    action: '/missoes/nova',
  },
  {
    icon: <Mic size={20} />,
    label: 'Roteiro',
    desc: 'Script estruturado para vídeo falado ou narrado.',
    color: 'var(--amber)',
    action: '/missoes/nova',
  },
  {
    icon: <Image size={20} />,
    label: 'Imagem',
    desc: 'Prompt + geração de imagem de apoio ou visual temático.',
    color: 'var(--red)',
    action: '/missoes/nova',
  },
]

const CONTENT_PRINCIPLES = [
  { text: '70% problemas universais de aquisição', color: 'var(--accent)', bg: 'var(--accent-glow)' },
  { text: '20% build in public — processo e bastidores', color: 'var(--cyan)', bg: 'rgba(0,212,255,0.08)' },
  { text: '10% casos específicos de clientes', color: 'var(--amber)', bg: 'rgba(255,184,0,0.08)' },
]

const s = {
  page: { flex: 1, overflowY: 'auto' as const, padding: '28px 30px 90px', maxWidth: 1180, width: '100%' },
  grid4: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 14 },
  stat: { background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 11, padding: '15px 17px' },
  statV: { fontFamily: 'var(--f-display)', fontSize: 30, lineHeight: 1, marginBottom: 4 },
  statL: { fontSize: 12, color: 'var(--text)', fontWeight: 600, marginBottom: 2 },
  statS: { fontFamily: 'var(--f-mono)', fontSize: 9, color: 'var(--text-3)', textTransform: 'uppercase' as const },
  panel: { background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 13, padding: 18, marginBottom: 14 },
  label: { fontFamily: 'var(--f-mono)', fontSize: 10, color: 'var(--text-3)', letterSpacing: '0.08em', textTransform: 'uppercase' as const, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 7 },
  card: { display: 'flex', alignItems: 'flex-start', gap: 13, padding: '15px 16px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 11, textDecoration: 'none', transition: 'all 0.15s', cursor: 'pointer' },
  empty: { color: 'var(--text-3)', fontSize: 12, textAlign: 'center' as const, padding: '26px 0' },
}

const CONTENT_CAPABILITIES = ['carousel', 'post', 'design', 'image_generate', 'video_edit', 'content', 'copy', 'reel']

export default function Conteudo() {
  const [artifacts, setArtifacts] = useState<Artifact[]>([])
  const [requestIds, setRequestIds] = useState<Record<string, string>>({})
  const [clientFilter, setClientFilter] = useState(() => localStorage.getItem('mkos.client') || '')
  const [clients, setClients] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    getOperations()
      .then(d => {
        setArtifacts(d.artifacts || [])
        setClients([...new Set((d.clients || []).map(c => c.client_id).filter(Boolean))])
        const map: Record<string, string> = {}
        for (const job of d.jobs || []) {
          const request = (d.requests || []).find(r => r.id === job.request_id)
          if (job.id && request?.id) map[job.id] = request.id
        }
        setRequestIds(map)
        setError('')
      })
      .catch(e => setError(e instanceof Error ? e.message : 'Falha ao carregar produções.'))
      .finally(() => setLoading(false))
  }, [])

  const recent = artifacts
    .filter(a => !clientFilter || a.client_id === clientFilter)
    .filter(a => CONTENT_CAPABILITIES.includes(a.artifact_type) || CONTENT_CAPABILITIES.some(c => a.artifact_type.includes(c)))
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 6)

  const byClient = (clientId: string) => !clientFilter || clientId === clientFilter
  const approved = artifacts.filter(a => byClient(a.client_id) && a.status === 'approved').length
  const review = artifacts.filter(a => byClient(a.client_id) && a.status === 'review').length
  const errored = artifacts.filter(a => byClient(a.client_id) && ['error', 'blocked'].includes(a.status)).length

  return (
    <div style={s.page}>
      <header style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 20, marginBottom: 24, flexWrap: 'wrap' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, color: 'var(--text-3)', font: '10px var(--f-mono)', letterSpacing: '0.1em', marginBottom: 8 }}>
            <Zap size={12} /> PRODUÇÃO · CONTEÚDO
          </div>
          <h1 style={{ fontFamily: 'var(--f-display)', fontSize: 34, color: 'var(--text)', lineHeight: 1, marginBottom: 6, letterSpacing: '0.01em' }}>CONTEÚDO</h1>
          <div style={{ fontFamily: 'var(--f-mono)', fontSize: 10, color: 'var(--text-3)', letterSpacing: '0.06em' }}>VOCÊ DEFINE O OBJETIVO — O SISTEMA DECIDE O FORMATO E A ROTA</div>
        </div>
        <div style={{ display: 'flex', gap: 9, alignItems: 'center', flexWrap: 'wrap' }}>
          <select
            value={clientFilter}
            onChange={e => { setClientFilter(e.target.value); localStorage.setItem('mkos.client', e.target.value) }}
            style={{ padding: '10px 13px', border: '1px solid var(--border-bright)', borderRadius: 9, background: 'var(--bg-card)', color: 'var(--text-2)', fontSize: 12, fontFamily: 'var(--f-mono)', outline: 'none' }}
          >
            <option value="">Todos os clientes</option>
            {clients.map(id => <option key={id} value={id}>{id}</option>)}
          </select>
          <Link to="/missoes/nova" style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--accent)', color: '#070907', fontWeight: 800, fontSize: 13, padding: '11px 18px', borderRadius: 9, textDecoration: 'none', fontFamily: 'var(--f-display)', letterSpacing: '0.04em' }}>
            <Sparkles size={15} strokeWidth={2.5} /> NOVA PEÇA
          </Link>
        </div>
      </header>

      {error && <div style={{ ...s.panel, borderColor: 'rgba(255,45,85,.4)', color: '#ff9ab0', fontSize: 12.5 }}>{error}</div>}

      <div style={s.grid4}>
        <Stat value={String(artifacts.filter(a => byClient(a.client_id)).length)} label="Peças geradas" color="var(--text)" sub={clientFilter || 'todos os clientes'} />
        <Stat value={String(approved)} label="Aprovadas" color="var(--green)" sub="prontas para publicar" />
        <Stat value={String(review)} label="Em revisão" color="var(--amber)" sub="aguardando decisão" />
        <Stat value={String(errored)} label="Com problema" color={errored ? 'var(--red)' : 'var(--text-3)'} sub={errored ? 'bloqueadas ou com erro' : 'nenhum problema'} />
      </div>

      <div style={s.panel}>
        <div style={s.label}><FileText size={12} /> DISTRIBUIÇÃO EDITORIAL</div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {CONTENT_PRINCIPLES.map(principle => (
            <span key={principle.text} style={{ fontFamily: 'var(--f-mono)', fontSize: 10, letterSpacing: '0.04em', padding: '6px 11px', borderRadius: 999, color: principle.color, background: principle.bg, border: '1px solid transparent' }}>
              {principle.text}
            </span>
          ))}
        </div>
      </div>

      <div style={{ ...s.label, marginBottom: 10, marginTop: 4 }}>CRIAR NOVA PEÇA</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))', gap: 10, marginBottom: 26 }}>
        {CONTENT_TYPES.map(type => (
          <Link key={type.label} to={type.action} style={s.card} onMouseEnter={e => { e.currentTarget.style.borderColor = type.color }} onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)' }}>
            <span style={{ color: type.color, marginTop: 1, flexShrink: 0 }}>{type.icon}</span>
            <div>
              <div style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>{type.label}</div>
              <div style={{ fontSize: 11, color: 'var(--text-2)', lineHeight: 1.5 }}>{type.desc}</div>
            </div>
          </Link>
        ))}
      </div>

      <div style={s.label}><Zap size={12} /> PRODUÇÕES RECENTES</div>
      <div style={s.panel}>
        {loading && <div style={{ ...s.empty, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}><Loader2 size={15} className="spin" /> Carregando produções…</div>}
        {!loading && recent.length === 0 && <div style={s.empty}>Nenhuma peça gerada ainda. Crie a primeira solicitação.</div>}
        {recent.map(artifact => {
          const meta = statusMeta(artifact.status)
          const requestId = artifact.job_id ? requestIds[artifact.job_id] : ''
          return (
            <Link
              key={artifact.id}
              to={requestId ? `/operacao/${requestId}` : '/operacao'}
              style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 0', borderTop: '1px solid var(--border)', textDecoration: 'none', flexWrap: 'wrap' }}
            >
              <div style={{ display: 'grid', placeItems: 'center', width: 34, height: 34, flexShrink: 0, borderRadius: 9, background: 'var(--accent-glow)', color: 'var(--accent)' }}>
                {artifact.artifact_type.includes('video') || artifact.artifact_type.includes('reel') ? <Film size={14} /> : artifact.artifact_type.includes('image') ? <Image size={14} /> : <Layout size={14} />}
              </div>
              <div style={{ flex: 1, minWidth: 180 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{artifact.title}</div>
                <div style={{ fontSize: 10, color: 'var(--text-3)', fontFamily: 'var(--f-mono)', marginTop: 2 }}>{artifact.artifact_type} · v{artifact.current_version} · {artifact.client_id} · {dateShort(artifact.created_at)}</div>
              </div>
              <span style={{ padding: '3px 9px', borderRadius: 999, border: `1px solid ${meta.color}55`, color: meta.color, font: '9px var(--f-mono)', textTransform: 'uppercase' }}>{meta.label}</span>
              <span style={{ color: 'var(--accent)', font: '10px var(--f-mono)' }}>ABRIR →</span>
            </Link>
          )
        })}
      </div>

      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 8, color: 'var(--text-3)', fontFamily: 'var(--f-mono)', fontSize: 10 }}>
        <Zap size={12} /> Produções reais: GET /api/admin/operations → artifacts por tipo de conteúdo.
      </div>
    </div>
  )
}

function Stat({ value, label, color, sub }: { value: string; label: string; color: string; sub: string }) {
  return (
    <div style={s.stat}>
      <div style={{ ...s.statV, color }}>{value}</div>
      <div style={s.statL}>{label}</div>
      <div style={s.statS}>{sub}</div>
    </div>
  )
}
