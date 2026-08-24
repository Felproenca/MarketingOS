import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { AlertTriangle, CheckCircle2, Coins, FileCheck2, GitBranch, Loader2, Plus, RefreshCw, Route, ShieldCheck, Zap } from 'lucide-react'
import { getOperations, getReport, type OperationsData, type ClientReport } from '../lib/api'
import { brl, dateShort, num, statusMeta } from '../lib/formatters'

const s = {
  page: { flex: 1, overflowY: 'auto' as const, padding: '28px 30px 90px', maxWidth: 1180, width: '100%' },
  head: { display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 20, marginBottom: 24, flexWrap: 'wrap' as const },
  h1: { fontFamily: 'var(--f-display)', fontSize: 34, color: 'var(--text)', lineHeight: 1, marginBottom: 6, letterSpacing: '0.01em' },
  date: { fontFamily: 'var(--f-mono)', fontSize: 10, color: 'var(--text-3)', letterSpacing: '0.06em' },
  cta: { display: 'flex', alignItems: 'center', gap: 8, background: 'var(--accent)', color: '#070907', fontWeight: 800, fontSize: 13, padding: '11px 18px', borderRadius: 9, textDecoration: 'none', fontFamily: 'var(--f-display)', letterSpacing: '0.04em' },
  refresh: { display: 'flex', alignItems: 'center', gap: 7, padding: '10px 13px', border: '1px solid var(--border-bright)', borderRadius: 9, color: 'var(--text-2)', background: 'var(--bg-card)', cursor: 'pointer', fontSize: 12 },
  grid4: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 14 },
  stat: { background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 11, padding: '15px 17px' },
  statV: { fontFamily: 'var(--f-display)', fontSize: 30, lineHeight: 1, marginBottom: 4 },
  statL: { fontSize: 12, color: 'var(--text)', fontWeight: 600, marginBottom: 2 },
  statS: { fontFamily: 'var(--f-mono)', fontSize: 9, color: 'var(--text-3)', textTransform: 'uppercase' as const },
  panel: { background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 13, padding: 20, marginBottom: 14 },
  label: { fontFamily: 'var(--f-mono)', fontSize: 10, color: 'var(--text-3)', letterSpacing: '0.08em', textTransform: 'uppercase' as const, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 7 },
  row: { display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderTop: '1px solid var(--border)', textDecoration: 'none', flexWrap: 'wrap' as const },
  link: { color: 'var(--accent)', textDecoration: 'none', fontSize: 12, fontFamily: 'var(--f-mono)' },
}

export default function Dashboard() {
  const [ops, setOps] = useState<OperationsData | null>(null)
  const [reports, setReports] = useState<Record<string, ClientReport>>({})
  const [clientFilter, setClientFilter] = useState(() => localStorage.getItem('mkos.client') || '')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  async function load() {
    setLoading(true)
    setError('')
    try {
      const d = await getOperations()
      setOps(d)
      // Cotas por cliente (até 6, em paralelo, sem travar a tela)
      const slugs = d.clients.slice(0, 6).map(c => c.client_id)
      const results = await Promise.allSettled(slugs.map(slug => getReport(slug)))
      const map: Record<string, ClientReport> = {}
      results.forEach((r, i) => { if (r.status === 'fulfilled') map[slugs[i]] = r.value })
      setReports(map)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Falha ao carregar o Command Center.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { void load() }, [])

  const jobs = ops?.jobs || []
  const requests = ops?.requests || []
  const artifacts = ops?.artifacts || []
  const byClient = (c: { client_id?: string }) => !clientFilter || c.client_id === clientFilter
  const running = jobs.filter(j => byClient(j) && ['queued', 'routed', 'referenced', 'running'].includes(j.status))
  const review = artifacts.filter(a => byClient(a) && a.status === 'review')
  const problems = jobs.filter(j => byClient(j) && ['blocked', 'error', 'stale'].includes(j.status))
  const awaiting = requests.filter(r => byClient(r) && r.status === 'awaiting_input')
  const health = ops?.systemStatus
  const totalTokens = Object.values(reports).reduce((sum, r) => sum + (r.cota?.usados || 0), 0)
  const totalTeto = Object.values(reports).reduce((sum, r) => sum + (r.cota?.teto_custo_brl || 0), 0)
  const totalCusto = Object.values(reports).reduce((sum, r) => sum + (r.cota?.custo_usado_brl || 0), 0)

  const requestIdForJob = (jobId: string | null | undefined): string => {
    if (!jobId) return ''
    const job = jobs.find(j => j.id === jobId)
    return requests.find(r => r.id === job?.request_id)?.id || ''
  }

  return (
    <div style={s.page}>
      <header style={s.head}>
        <div>
          <h1 style={s.h1}>COMMAND CENTER</h1>
          <div style={s.date}>{new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' }).toUpperCase()}</div>
        </div>
        <div style={{ display: 'flex', gap: 9, alignItems: 'center', flexWrap: 'wrap' }}>
          <select
            value={clientFilter}
            onChange={e => { setClientFilter(e.target.value); localStorage.setItem('mkos.client', e.target.value) }}
            style={{ padding: '10px 13px', border: '1px solid var(--border-bright)', borderRadius: 9, background: 'var(--bg-card)', color: 'var(--text-2)', fontSize: 12, fontFamily: 'var(--f-mono)', outline: 'none' }}
          >
            <option value="">Todos os clientes</option>
            {(ops?.clients || []).map(c => <option key={c.client_id} value={c.client_id}>{c.display_name}</option>)}
          </select>
          <button style={s.refresh} onClick={() => void load()} disabled={loading}><RefreshCw size={14} className={loading ? 'spin' : ''} /> Atualizar</button>
          <Link to="/missoes/nova" style={s.cta}><Plus size={15} strokeWidth={2.5} /> NOVA SOLICITAÇÃO</Link>
        </div>
      </header>

      {error && <div style={{ ...s.panel, borderColor: 'rgba(255,45,85,.4)', color: '#ff9ab0', fontSize: 13 }}>{error}</div>}

      {loading && !ops ? (
        <div style={{ ...s.panel, display: 'flex', alignItems: 'center', gap: 10, color: 'var(--text-2)', fontSize: 13 }}><Loader2 size={16} className="spin" /> Carregando operação…</div>
      ) : (
        <>
          <div style={s.grid4}>
            <Stat value={num(running.length)} label="Jobs em execução" color="var(--accent)" sub={running.length ? 'queued · routed · running' : 'fila vazia'} />
            <Stat value={num(review.length)} label="Em revisão" color="var(--amber)" sub={review.length ? 'aprovação pendente' : 'sem pendências'} />
            <Stat value={num(problems.length)} label="Bloqueios / erros" color={problems.length ? 'var(--red)' : 'var(--green)'} sub={problems.length ? 'precisam de ação' : 'tudo operacional'} />
            <Stat value={num(awaiting.length)} label="Aguardando input" color={awaiting.length ? 'var(--amber)' : 'var(--text-3)'} sub={awaiting.length ? 'arquivo/credencial' : 'nada pendente'} />
          </div>

          <div style={{ ...s.panel, marginBottom: 14 }}>
            <div style={s.label}><Coins size={12} /> COTAS E CUSTO (CLIENTES)</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: 10 }}>
              {Object.entries(reports).map(([slug, r]) => {
                const used = r.cota.total_tokens ? Math.min(100, Math.round((r.cota.usados / r.cota.total_tokens) * 100)) : 0
                return (
                  <Link key={slug} to={`/dados/${encodeURIComponent(slug)}`} style={{ textDecoration: 'none' }}>
                    <div style={{ padding: '12px 13px', border: '1px solid var(--border)', borderRadius: 10, background: 'rgba(10,10,15,.5)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 5 }}>
                        <b style={{ color: 'var(--text)' }}>{slug}</b>
                        <span style={{ color: 'var(--text-3)', fontFamily: 'var(--f-mono)' }}>{pctLocal(used)}</span>
                      </div>
                      <div style={{ height: 5, borderRadius: 99, background: 'var(--bg-hover)', overflow: 'hidden', marginBottom: 7 }}>
                        <div style={{ width: `${used}%`, height: '100%', background: used >= 90 ? 'var(--red)' : 'var(--accent)', borderRadius: 99 }} />
                      </div>
                      <div style={{ fontFamily: 'var(--f-mono)', fontSize: 9, color: 'var(--text-3)' }}>{num(r.cota.restantes)} tokens · custo {brl(r.cota.custo_usado_brl)} · margem {r.margem.margem_pct != null ? `${r.margem.margem_pct}%` : '—'}</div>
                    </div>
                  </Link>
                )
              })}
              {Object.keys(reports).length === 0 && <div style={{ color: 'var(--text-3)', fontSize: 12 }}>Sem cotas disponíveis para os clientes.</div>}
            </div>
            {Object.keys(reports).length > 0 && (
              <div style={{ marginTop: 12, fontFamily: 'var(--f-mono)', fontSize: 10, color: 'var(--text-3)' }}>
                Total: {num(totalTokens)} tokens usados · {brl(totalCusto)} custo vs teto {brl(totalTeto)}
              </div>
            )}
          </div>

          <div style={{ ...s.panel, marginBottom: 14 }}>
            <div style={s.label}><ShieldCheck size={12} /> SAÚDE DO SISTEMA</div>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <HealthPill ok={!!health?.mediaos?.hardening} label="Hardening MediaOS" />
              <HealthPill ok={health?.aiRouter?.status === 'connected'} label={`AI Router (${health?.aiRouter?.connections ?? 0} conexões)`} />
              <HealthPill ok={health?.database?.ok !== false} label="Banco de dados" />
              <HealthPill ok={health?.worker?.online !== false} label="Worker" />
            </div>
          </div>

          <div style={{ ...s.panel, marginBottom: 14 }}>
            <div style={{ ...s.label, justifyContent: 'space-between' }}>
              <span><GitBranch size={12} /> SOLICITAÇÕES RECENTES</span>
              <Link to="/operacao" style={s.link}>VER TODAS →</Link>
            </div>
            {requests.length === 0 && <div style={{ color: 'var(--text-3)', fontSize: 12 }}>Nenhuma solicitação ainda — abra a primeira.</div>}
            {requests.filter(r => byClient(r)).slice(0, 8).map(r => {
              const meta = statusMeta(r.status)
              return (
                <Link key={r.id} to={`/operacao/${r.id}`} style={s.row}>
                  <div style={{ flex: 1, minWidth: 180 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{r.title}</div>
                    <div style={{ fontSize: 10, color: 'var(--text-3)', fontFamily: 'var(--f-mono)', marginTop: 2 }}>{r.client_id} · {r.request_type} · {dateShort(r.created_at)}</div>
                  </div>
                  <span style={{ padding: '3px 9px', borderRadius: 999, border: `1px solid ${meta.color}55`, color: meta.color, font: '9px var(--f-mono)', textTransform: 'uppercase' }}>{meta.label}</span>
                </Link>
              )
            })}
          </div>

          <div style={s.panel}>
            <div style={s.label}><FileCheck2 size={12} /> ARTIFACTS EM REVISÃO</div>
            {review.length === 0 && <div style={{ color: 'var(--text-3)', fontSize: 12 }}>Nenhum output aguardando revisão.</div>}
            {review.filter(a => byClient(a)).slice(0, 6).map(a => (
              <div key={a.id} style={s.row}>
                <div style={{ flex: 1, minWidth: 180 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{a.title}</div>
                  <div style={{ fontSize: 10, color: 'var(--text-3)', fontFamily: 'var(--f-mono)', marginTop: 2 }}>{a.artifact_type} · v{a.current_version} · {a.client_id}</div>
                </div>
                <Link to={`/operacao/${requestIdForJob(a.job_id)}`} style={s.link}>REVISAR →</Link>
              </div>
            ))}
          </div>

          {problems.length > 0 && (
            <div style={{ ...s.panel, borderColor: 'rgba(255,45,85,.35)' }}>
              <div style={{ ...s.label, color: '#ff9ab0' }}><AlertTriangle size={12} /> JOBS COM PROBLEMA</div>
              {problems.filter(j => byClient(j)).slice(0, 6).map(j => (
                <div key={j.id} style={s.row}>
                  <div style={{ flex: 1, minWidth: 180 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{j.job_type || j.capability || j.id.slice(0, 8)}</div>
                    <div style={{ fontSize: 10, color: 'var(--text-3)', fontFamily: 'var(--f-mono)', marginTop: 2 }}>{j.status} · {j.client_id}</div>
                  </div>
                  <span style={{ color: 'var(--red)', fontSize: 11, fontFamily: 'var(--f-mono)', maxWidth: 320, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{j.error || j.status}</span>
                  <Link to={`/operacao/${requestIdForJob(j.id)}`} style={s.link}><Zap size={12} /> VER</Link>
                </div>
              ))}
            </div>
          )}

          <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 8, color: 'var(--text-3)', fontFamily: 'var(--f-mono)', fontSize: 10 }}>
            <Route size={12} /> Fonte: GET /api/admin/operations + relatórios por cliente. O backend é a autoridade de status, rota, QA e custo.
          </div>
        </>
      )}
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

function HealthPill({ ok, label }: { ok: boolean; label: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '8px 12px', border: `1px solid ${ok ? 'rgba(0,255,136,.3)' : 'var(--border-bright)'}`, borderRadius: 999, fontSize: 11, color: ok ? 'var(--green)' : 'var(--text-2)' }}>
      <CheckCircle2 size={12} /> {label}
    </div>
  )
}

function pctLocal(v: number) { return `${v.toLocaleString('pt-BR')}%` }
