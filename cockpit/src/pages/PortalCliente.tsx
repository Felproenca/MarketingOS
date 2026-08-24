import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Activity, ArrowUpRight, BarChart3, Camera, CheckCircle2, Clock, Coins, Link2, Loader2, RefreshCw, ShieldCheck, Sparkles, Target, TrendingUp } from 'lucide-react'
import { getClientOverview, approveArtifact, type ClientOverview } from '../lib/api'
import { apiFetch } from '../lib/auth'
import { brl, dateShort, metricValue, num, pct, statusMeta } from '../lib/formatters'

type ConnStatus = { connected: boolean; connectedAt: string | null; expiresAt: string | null }

const s = {
  page: { flex: 1, minWidth: 0, minHeight: '100svh', overflowY: 'auto' as const, padding: 'clamp(26px, 4vw, 54px) clamp(18px, 5vw, 72px) 80px', background: 'radial-gradient(circle at 80% 0%, rgba(212,255,0,.05), transparent 28%), var(--bg-base)' },
  wrap: { maxWidth: 1080, margin: '0 auto' },
  head: { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 20, marginBottom: 26, flexWrap: 'wrap' as const },
  kicker: { display: 'flex', alignItems: 'center', gap: 8, color: 'var(--accent)', font: '10px var(--f-mono)', letterSpacing: '.12em', textTransform: 'uppercase' as const },
  h1: { margin: '14px 0 6px', fontSize: 'clamp(28px, 4vw, 42px)', letterSpacing: '-.05em', color: 'var(--text)' },
  sub: { color: 'var(--text-2)', fontSize: 13 },
  btn: { display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 13px', border: '1px solid var(--border-bright)', borderRadius: 9, color: 'var(--text-2)', background: 'var(--bg-card)', cursor: 'pointer', fontSize: 12 },
  card: { border: '1px solid var(--border)', borderRadius: 14, padding: 20, background: 'rgba(20,20,32,.72)' },
  label: { fontFamily: 'var(--f-mono)', fontSize: 9, color: 'var(--text-3)', letterSpacing: '.08em', textTransform: 'uppercase' as const, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 7 },
  grid2: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 14, marginBottom: 14 },
}

export default function PortalCliente() {
  const { slug } = useParams<{ slug: string }>()
  const [data, setData] = useState<ClientOverview | null>(null)
  const [connections, setConnections] = useState<{ meta: ConnStatus | null; google: ConnStatus | null }>({ meta: null, google: null })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState('')

  async function loadConnections(clientId: string) {
    const [meta, google] = await Promise.allSettled([
      apiFetch(`/api/integrations/meta/client?action=status&clientId=${encodeURIComponent(clientId)}`),
      apiFetch(`/api/integrations/google?action=status&clientId=${encodeURIComponent(clientId)}`),
    ])
    const read = async (r: PromiseSettledResult<Response>) => r.status === 'fulfilled' ? (await r.value.json().catch(() => null)) : null
    setConnections({ meta: await read(meta), google: await read(google) })
  }

  async function load() {
    if (!slug) return
    setLoading(true)
    setError('')
    try {
      const overview = await getClientOverview(slug)
      setData(overview)
      void loadConnections(slug)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Falha ao carregar seu espaço.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { void load() }, [slug])

  async function decide(artifactId: string, decision: 'approved' | 'changes_requested') {
    const feedback = decision === 'changes_requested' ? window.prompt('Descreva o ajuste necessário:') : null
    if (decision === 'changes_requested' && !feedback?.trim()) return
    setBusy(artifactId)
    setError('')
    try {
      await approveArtifact(artifactId, decision, feedback)
      await load()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Não foi possível registrar a revisão.')
    } finally {
      setBusy('')
    }
  }

  async function connect(source: 'meta' | 'google') {
    if (!slug) return
    setBusy(`conn:${source}`)
    setError('')
    try {
      const base = source === 'meta' ? '/api/integrations/meta/client' : '/api/integrations/google'
      const response = await apiFetch(`${base}?action=connect&clientId=${encodeURIComponent(slug)}`, { method: 'POST' })
      const body = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(body.error || 'Não foi possível iniciar a conexão.')
      if (body.url) window.open(body.url, '_blank', 'noopener')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Falha ao iniciar conexão.')
    } finally {
      setBusy('')
    }
  }

  const cota = data?.cota
  const usedPct = cota?.total_tokens ? Math.min(100, Math.round((cota.usados / cota.total_tokens) * 100)) : 0
  const latestSources = Object.entries(data?.previsao || {}).slice(0, 4)

  return (
    <div style={s.page}>
      <div style={s.wrap}>
        <header style={s.head}>
          <div>
            <div style={s.kicker}><ShieldCheck size={12} /> ESPAÇO DO CLIENTE · {data?.cliente || slug}</div>
            <h1 style={s.h1}>{data ? `Olá, ${data.cliente}.` : 'Seu espaço de crescimento'}</h1>
            <p style={s.sub}>Seus dados, resultados e próximos passos — somente o que pertence a você.</p>
          </div>
          <button style={s.btn} onClick={() => void load()} disabled={loading}><RefreshCw size={14} className={loading ? 'spin' : ''} /> Atualizar</button>
        </header>

        {loading && <div style={{ ...s.card, display: 'flex', alignItems: 'center', gap: 10, color: 'var(--text-2)', fontSize: 13 }}><Loader2 size={16} className="spin" /> Carregando seus dados…</div>}
        {error && <div style={{ ...s.card, borderColor: 'rgba(255,45,85,.4)', color: '#ff9ab0', fontSize: 13, marginBottom: 14 }}>{error}</div>}

        {data && (
          <>
            {/* Cota */}
            <div style={{ ...s.card, marginBottom: 14, borderColor: cota && cota.restantes === 0 ? 'rgba(255,45,85,.4)' : 'var(--border)' }}>
              <div style={s.label}><Coins size={12} /> SUA COTA · {cota?.plano || 'plano'}</div>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 12, flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: 220 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 6 }}>
                    <span style={{ color: 'var(--text-2)' }}>{num(cota?.usados)} de {num(cota?.total_tokens)} tokens usados</span>
                    <span style={{ color: usedPct >= 90 ? 'var(--red)' : 'var(--accent)', fontWeight: 700 }}>{pct(usedPct)}</span>
                  </div>
                  <div style={{ height: 8, borderRadius: 99, background: 'var(--bg-hover)', overflow: 'hidden' }}>
                    <div style={{ width: `${usedPct}%`, height: '100%', borderRadius: 99, background: usedPct >= 90 ? 'var(--red)' : 'var(--accent)', boxShadow: '0 0 12px var(--accent-glow-strong)' }} />
                  </div>
                </div>
                <Stat value={num(cota?.restantes)} label="Tokens restantes" />
                <Stat value={brl(cota?.custo_usado_brl)} label="Custo do mês" />
                <Stat value={brl(cota?.teto_custo_brl)} label="Teto" />
                <Stat value={pct(data.margem.margem_pct)} label="Margem" />
              </div>
              {cota && cota.restantes === 0 && <div style={{ color: 'var(--red)', fontSize: 12 }}>Cota do mês esgotada — novos pedidos ficarão retidos até a reposição.</div>}
            </div>

            {/* Conexões de dados */}
            <div style={{ ...s.card, marginBottom: 14 }}>
              <div style={s.label}><ShieldCheck size={12} /> SUAS CONEXÕES DE DADOS</div>
              <div style={{ display: 'grid', gap: 10 }}>
                <ConnRow
                  icon={<Camera size={15} />}
                  name="Instagram"
                  desc="Dados orgânicos: alcance, engajamento e perfil"
                  status={connections.meta}
                  busy={busy === 'conn:meta'}
                  onConnect={() => void connect('meta')}
                />
                <ConnRow
                  icon={<Link2 size={15} />}
                  name="Google"
                  desc="YouTube e Google Ads: vídeos, campanhas e conversões"
                  status={connections.google}
                  busy={busy === 'conn:google'}
                  onConnect={() => void connect('google')}
                />
              </div>
              <div style={{ marginTop: 10, fontSize: 10, color: 'var(--text-3)' }}>Após autorizar no provedor, volte e clique em “Atualizar”. A conexão é exclusiva do seu cliente.</div>
            </div>

            <div style={s.grid2}>
              {/* Métricas */}
              <div style={s.card}>
                <div style={s.label}><BarChart3 size={12} /> MÉTRICAS RECENTES</div>
                {data.metricas.length === 0 && <div style={{ color: 'var(--text-3)', fontSize: 12 }}>Sem métricas sincronizadas ainda.</div>}
                {data.metricas.slice(0, 6).map((m, i) => {
                  const keys = Object.keys(m.metrics || {}).slice(0, 4)
                  return (
                    <div key={i} style={{ padding: '9px 0', borderTop: '1px solid var(--border)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 4 }}>
                        <span style={{ color: 'var(--text-2)', fontFamily: 'var(--f-mono)' }}>{m.source}</span>
                        <span style={{ color: 'var(--text-3)', fontFamily: 'var(--f-mono)' }}>{dateShort(m.observed_at)}</span>
                      </div>
                      <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
                        {keys.map(k => (
                          <span key={k} style={{ fontSize: 11, color: 'var(--text-3)' }}>{k}: <b style={{ color: 'var(--accent)', fontWeight: 600 }}>{num(metricValue(m.metrics, k))}</b></span>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Previsão */}
              <div style={s.card}>
                <div style={s.label}><TrendingUp size={12} /> PREVISÃO (média recente)</div>
                {latestSources.length === 0 && <div style={{ color: 'var(--text-3)', fontSize: 12 }}>Previsão disponível após mais coletas de dados.</div>}
                {latestSources.map(([source, values]) => (
                  <div key={source} style={{ padding: '9px 0', borderTop: '1px solid var(--border)' }}>
                    <div style={{ fontSize: 11, color: 'var(--text-2)', fontFamily: 'var(--f-mono)', marginBottom: 4 }}>{source}</div>
                    <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
                      {Object.entries(values).slice(0, 4).map(([k, v]) => (
                        <span key={k} style={{ fontSize: 11, color: 'var(--text-3)' }}>{k}: <b style={{ color: 'var(--text)', fontWeight: 600 }}>{num(v)}</b></span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Próximos passos */}
            <div style={{ ...s.card, marginBottom: 14 }}>
              <div style={s.label}><Target size={12} /> PRÓXIMOS PASSOS</div>
              {data.proximos_passos.length === 0 && <div style={{ color: 'var(--text-3)', fontSize: 12 }}>Nenhum trabalho em andamento.</div>}
              {data.proximos_passos.slice(0, 8).map((p, i) => {
                const meta = statusMeta(p.status)
                return (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderTop: '1px solid var(--border)' }}>
                    {p.status === 'running' ? <Clock size={14} style={{ color: 'var(--accent)' }} /> : <Activity size={14} style={{ color: meta.color }} />}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, color: 'var(--text)', fontWeight: 600 }}>{p.titulo}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-3)', fontFamily: 'var(--f-mono)' }}>{p.tipo}{p.capability ? ` · ${p.capability}` : ''}</div>
                    </div>
                    <span style={{ padding: '3px 9px', borderRadius: 999, border: `1px solid ${meta.color}55`, color: meta.color, font: '9px var(--f-mono)', textTransform: 'uppercase' }}>{meta.label}</span>
                  </div>
                )
              })}
            </div>

            {/* Resultados reais + aprovações */}
            <div style={s.card}>
              <div style={s.label}><Sparkles size={12} /> RESULTADOS REAIS E APROVAÇÕES</div>
              <div style={{ display: 'flex', gap: 18, marginBottom: 12, flexWrap: 'wrap', fontSize: 12 }}>
                <span style={{ color: 'var(--text-2)' }}>{num(data.resultados_reais.length)} entregas registradas</span>
                <span style={{ color: 'var(--green)' }}>{num(data.qualidade.aprovados)} aprovadas</span>
                <span style={{ color: 'var(--red)' }}>{num(data.qualidade.rejeitados)} rejeitadas</span>
                <span style={{ color: 'var(--text-2)' }}>taxa de aprovação {pct(data.qualidade.taxa_aprovacao)}</span>
              </div>
              {data.resultados_reais.length === 0 && <div style={{ color: 'var(--text-3)', fontSize: 12 }}>As primeiras entregas aparecerão aqui quando uma solicitação gerar resultado.</div>}
              {data.resultados_reais.slice(0, 10).map((a) => {
                const meta = statusMeta(a.status)
                return (
                  <div key={a.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderTop: '1px solid var(--border)', flexWrap: 'wrap' }}>
                    <div style={{ flex: 1, minWidth: 180 }}>
                      <div style={{ fontSize: 13, color: 'var(--text)', fontWeight: 600 }}>{a.titulo}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-3)', fontFamily: 'var(--f-mono)' }}>{a.tipo} · {dateShort(a.criado_em)}</div>
                    </div>
                    <span style={{ padding: '3px 9px', borderRadius: 999, border: `1px solid ${meta.color}55`, color: meta.color, font: '9px var(--f-mono)', textTransform: 'uppercase' }}>{meta.label}</span>
                    {a.status === 'review' && (
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button style={{ border: 0, background: 'var(--green)', color: '#061006', borderRadius: 8, padding: '8px 12px', fontSize: 11, fontWeight: 800, cursor: 'pointer' }} disabled={busy === a.id} onClick={() => void decide(a.id, 'approved')}>
                          {busy === a.id ? <Loader2 size={12} className="spin" /> : <CheckCircle2 size={12} />} Aprovar
                        </button>
                        <button style={{ border: '1px solid rgba(255,184,0,.4)', background: 'rgba(255,184,0,.08)', color: '#ffd774', borderRadius: 8, padding: '8px 12px', fontSize: 11, fontWeight: 800, cursor: 'pointer' }} disabled={busy === a.id} onClick={() => void decide(a.id, 'changes_requested')}>
                          Pedir ajuste
                        </button>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            <div style={{ display: 'flex', gap: 10, marginTop: 16, flexWrap: 'wrap' }}>
              <Link to="/" style={{ ...s.btn, textDecoration: 'none', color: 'var(--accent)' }}><ArrowUpRight size={13} /> Voltar ao console</Link>
              <span style={{ color: 'var(--text-3)', fontSize: 11, alignSelf: 'center' }}>Dados exibidos direto do backend · {data.gerado_em ? dateShort(data.gerado_em) : ''}</span>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div style={{ minWidth: 110, padding: '10px 13px', border: '1px solid var(--border)', borderRadius: 10, background: 'rgba(10,10,15,.5)' }}>
      <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)' }}>{value}</div>
      <div style={{ color: 'var(--text-3)', font: '8px var(--f-mono)', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: 3 }}>{label}</div>
    </div>
  )
}

function ConnRow({ icon, name, desc, status, busy, onConnect }: { icon: ReactNode; name: string; desc: string; status: ConnStatus | null; busy: boolean; onConnect: () => void }) {
  const connected = status?.connected
  const expired = status?.connected && status.expiresAt && new Date(status.expiresAt).getTime() < Date.now()
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 13px', border: '1px solid var(--border)', borderRadius: 10, background: 'rgba(10,10,15,.5)', flexWrap: 'wrap' }}>
      <div style={{ display: 'grid', placeItems: 'center', width: 34, height: 34, borderRadius: 9, color: 'var(--accent)', background: 'var(--accent-glow)' }}>{icon}</div>
      <div style={{ flex: 1, minWidth: 170 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{name}</div>
        <div style={{ fontSize: 10, color: 'var(--text-3)', marginTop: 2 }}>{desc}</div>
      </div>
      <span style={{ padding: '3px 9px', borderRadius: 999, border: `1px solid ${expired ? 'rgba(255,184,0,.4)' : connected ? 'rgba(0,255,136,.35)' : 'var(--border-bright)'}`, color: expired ? '#ffd774' : connected ? 'var(--green)' : 'var(--text-3)', font: '9px var(--f-mono)', textTransform: 'uppercase' }}>
        {status == null ? 'verificando' : expired ? 'expirou — reconectar' : connected ? 'conectado' : 'não conectado'}
      </span>
      <button
        onClick={onConnect}
        disabled={busy || (connected && !expired)}
        style={{ border: '1px solid var(--border-bright)', background: 'var(--bg-hover)', color: 'var(--text-2)', borderRadius: 8, padding: '8px 12px', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}
      >
        {busy ? <Loader2 size={12} className="spin" /> : connected ? (expired ? 'Reconectar' : 'Conectado') : 'Conectar'}
      </button>
    </div>
  )
}
