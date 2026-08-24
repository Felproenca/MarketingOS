import { useEffect, useState } from 'react'
import { Activity, ArrowUpRight, BarChart3, Camera, CheckCircle2, LogOut, Megaphone, RefreshCw, ShieldCheck } from 'lucide-react'
import { apiFetch, signOut } from '../lib/auth'

type Data = { clientId: string; connected: boolean; account?: { username?: string; name?: string; followers?: number; mediaCount?: number }; insights?: Record<string, any>; media?: { fetched: number; items: any[] }; period?: { since: string; until: string } }
type AdsData = { adAccounts?: any[]; rows?: any[]; errors?: any[]; period?: { since: string; until: string } }
type ResultsData = { artifacts?: { id: string; title: string; artifact_type: string; status: string; current_version: number; metadata?: { preview_url?: string } }[]; jobs?: { id: string; job_type: string; capability: string; status: string; created_at: string; error?: string }[]; requests?: { id: string; title: string; request_type: string; status: string; objective?: string }[]; versions?: { artifact_id: string; version: number; qa?: { status?: string } }[]; approvals?: { artifact_id: string; version: number; actor_role: string; decision: string; feedback?: string }[] }
// Resolved from the authenticated user's memberships during load.
const num = (value: any) => value == null ? '—' : Number(value).toLocaleString('pt-BR')
const metric = (item: any, key: string) => item?.metrics?.[key] == null ? '—' : num(item.metrics[key])

export default function Portal() {
  const [data, setData] = useState<Data | null>(null)
  const [ads, setAds] = useState<AdsData | null>(null)
  const [results, setResults] = useState<ResultsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  async function load() {
    setLoading(true); setError('')
    try {
      const clientsResponse = await apiFetch('/api/admin/clients')
      const clientsBody = await clientsResponse.json()
      if (!clientsResponse.ok) throw new Error(clientsBody.error || 'NÃ£o foi possÃ­vel identificar seu cliente.')
      const requestedClient = new URLSearchParams(window.location.search).get('client_id')
      const selected = (clientsBody.clients || []).find((item: any) => item.client_id === requestedClient) || clientsBody.clients?.[0]
      if (!selected?.client_id) throw new Error('Nenhum cliente associado Ã  sua conta.')
      const [organicResponse, adsResponse] = await Promise.all([
        apiFetch(`/api/integrations/meta/client?action=insights&clientId=${encodeURIComponent(selected.client_id)}&limit=50`),
        apiFetch(`/api/integrations/meta/client?action=ads&clientId=${encodeURIComponent(selected.client_id)}`),
      ])
      const organic = await organicResponse.json()
      const paid = await adsResponse.json()
      if (!organicResponse.ok) throw new Error(organic.error || 'Não foi possível carregar seus dados.')
      setData(organic)
      setAds(adsResponse.ok ? paid : null)
      setResults(organic.results || null)
      if (!adsResponse.ok && paid.error) setError(`Dados orgânicos carregados. Mídia paga: ${paid.error}`)
    } catch (e) { setError(e instanceof Error ? e.message : 'Falha ao carregar dados.') }
    finally { setLoading(false) }
  }

  async function reviewArtifact(artifactId: string, decision: 'approved' | 'changes_requested') {
    const feedback = decision === 'changes_requested' ? window.prompt('Descreva o ajuste necessário:') : null
    if (decision === 'changes_requested' && !feedback?.trim()) return
    setError('')
    const response = await apiFetch('/api/admin/artifacts', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ artifactId, decision, feedback }) })
    const body = await response.json().catch(() => ({}))
    if (!response.ok) { setError(body.error || 'Não foi possível registrar a revisão.'); return }
    await load()
  }

  useEffect(() => { void load() }, [])
  const cards = [
    { label: 'Seguidores', value: num(data?.account?.followers), icon: Activity },
    { label: 'Alcance recente', value: num(data?.insights?.reach?.total_value?.value), icon: BarChart3 },
    { label: 'Visitas ao perfil', value: num(data?.insights?.profile_views?.total_value?.value), icon: ArrowUpRight },
    { label: 'Conteúdos analisados', value: num(data?.media?.fetched), icon: Camera },
  ]
  const paidSpend = ads?.rows?.reduce((total, row) => total + Number(row.spend || 0), 0) || 0
  const paidReach = ads?.rows?.reduce((total, row) => total + Number(row.reach || 0), 0) || 0

  return <div className="portal-page">
    <header className="portal-header"><div><div className="portal-kicker"><span className="spark-mark">✦</span> ESPAÇO DE CRESCIMENTO</div><h1>Olá, {data?.account?.name?.split(' ')[0] || 'bem-vindo'}.</h1><p>Seus dados reais, organizados para decisões mais inteligentes.</p></div><div className="portal-header-actions"><button className="portal-refresh" onClick={() => void load()}><RefreshCw size={15} className={loading ? 'spin' : ''} /> Atualizar</button><button className="portal-refresh" onClick={() => { signOut(); window.location.href = '/login' }}><LogOut size={15} /> Sair</button></div></header>
    {error && <div className="portal-error">{error}</div>}
    <section className="portal-hero"><div><span className="live-pill"><i /> {data?.connected ? 'CONEXÃO ATIVA' : 'CONEXÃO PENDENTE'}</span><h2>Seu crescimento<br /><em>em movimento.</em></h2><p>{data?.account?.username ? `@${data.account.username} · últimos dados disponíveis` : 'Conecte os canais para começar a receber sinais reais.'}</p></div><div className="hero-orb"><Camera size={58} strokeWidth={1} /></div></section>
    <div className="portal-section-title"><span>VISÃO RÁPIDA</span><small>{data?.period ? `Atualizado até ${new Date(data.period.until).toLocaleDateString('pt-BR')}` : 'carregando dados'}</small></div>
    <section className="portal-stats">{cards.map(card => <div className="portal-stat" key={card.label}><div className="stat-icon"><card.icon size={17} /></div><strong>{loading ? '...' : card.value}</strong><span>{card.label}</span></div>)}</section>
    <div className="portal-grid">
      <section className="portal-panel"><div className="panel-head"><div><span className="panel-eyebrow">ORGÂNICO</span><h3>Conteúdo e engajamento</h3></div><Camera size={18} /></div>{data?.media?.items?.slice(0, 12).map((item: any) => <div className="content-row" key={item.id}><div className="content-thumb">{item.thumbnailUrl ? <img src={item.thumbnailUrl} alt="" /> : <Camera size={17} />}</div><div className="content-info"><strong>{item.caption?.slice(0, 55) || 'Conteúdo do Instagram'}</strong><span>{item.productType || item.mediaType} · {item.timestamp ? new Date(item.timestamp).toLocaleDateString('pt-BR') : '—'}</span></div><div className="content-metrics"><span>alcance <b>{metric(item, 'reach')}</b></span><span>♥ <b>{num(item.likeCount)}</b></span><span>coment. <b>{num(item.commentsCount)}</b></span><span>salvos <b>{metric(item, 'saved')}</b></span><span>comp. <b>{metric(item, 'shares')}</b></span><span>seguiram <b>{metric(item, 'follows')}</b></span></div></div>)}{!loading && !data?.media?.items?.length && <div className="empty-state">Ainda não há conteúdos disponíveis para análise.</div>}</section>
      <aside className="portal-side"><div className="portal-mini"><div className="mini-icon green"><CheckCircle2 size={17} /></div><div><b>Dados orgânicos</b><span>{data?.media?.fetched || 0} conteúdos lidos</span></div></div><div className="portal-mini"><div className="mini-icon blue"><Megaphone size={17} /></div><div><b>Meta Ads</b><span>{ads ? `${ads.adAccounts?.length || 0} contas · ${ads.rows?.length || 0} anúncios` : 'não disponível'}</span></div></div><div className="portal-trust"><ShieldCheck size={18} /><div><b>Seu espaço é privado</b><p>Seus dados ficam separados e protegidos. A MK/OS não publica nem altera campanhas.</p></div></div></aside>
    </div>
    <section className="portal-paid"><div className="panel-head"><div><span className="panel-eyebrow">MÍDIA PAGA</span><h3>Meta Ads</h3></div><Megaphone size={18} /></div>{ads ? <><div className="paid-summary"><div><strong>R$ {paidSpend.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong><span>investimento no período</span></div><div><strong>{num(paidReach)}</strong><span>alcance somado</span></div><div><strong>{num(ads.rows?.length)}</strong><span>anúncios com dados</span></div></div><div className="ad-table">{ads.rows?.slice(0, 8).map((row: any) => <div className="ad-row" key={`${row.ad_id}-${row.date_start}`}><div><b>{row.campaign_name || 'Campanha sem nome'}</b><span>{row.adset_name || 'Conjunto'} · {row.ad_name || 'Anúncio'}</span></div><span>{num(row.impressions)} impressões</span><span>{num(row.clicks)} cliques</span><strong>R$ {Number(row.spend || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong></div>)}</div></> : <div className="empty-state">A conta de anúncios ainda não foi autorizada ou não possui dados no período.</div>}</section>
    <section className="portal-paid"><div className="panel-head"><div><span className="panel-eyebrow">RESULTADOS DA OPERAÇÃO</span><h3>Entregas e próximos passos</h3></div><CheckCircle2 size={18} /></div><div className="paid-summary"><div><strong>{num(results?.artifacts?.length)}</strong><span>entregas registradas</span></div><div><strong>{num(results?.artifacts?.filter(item => item.status === 'approved').length)}</strong><span>aprovadas</span></div><div><strong>{num(results?.jobs?.filter(item => ['queued', 'running', 'review'].includes(item.status)).length)}</strong><span>em andamento</span></div></div>{results?.artifacts?.length ? <div className="ad-table">{results.artifacts.slice(0, 8).map(item => <div className="ad-row" key={item.id}><div><b>{item.title}</b><span>{item.artifact_type} · versão {item.current_version}</span><small>QA: {results.versions?.find(version => version.artifact_id === item.id && version.version === item.current_version)?.qa?.status || 'não registrado'} · decisão: {results.approvals?.find(approval => approval.artifact_id === item.id && approval.version === item.current_version)?.decision || 'aguardando revisão'}</small></div><span>{item.status}</span>{item.metadata?.preview_url && <a href={item.metadata.preview_url} target="_blank" rel="noreferrer">Abrir preview</a>}{item.status === 'review' && <div className="portal-review-actions"><button onClick={() => void reviewArtifact(item.id, 'approved')}>Aprovar</button><button onClick={() => void reviewArtifact(item.id, 'changes_requested')}>Pedir ajuste</button></div>}</div>)}</div> : <div className="empty-state">As primeiras entregas aparecerão aqui quando um job for executado e gerar um artifact.</div>}<div className="portal-next-steps"><div className="panel-head"><div><span className="panel-eyebrow">FLUXO DE TRABALHO</span><h3>Pedidos e próximos passos</h3></div><Activity size={18} /></div>{results?.requests?.length ? results.requests.slice(0, 8).map(item => <div className="ad-row" key={item.id}><div><b>{item.title}</b><span>{item.request_type} · {item.objective || 'Objetivo em definição'}</span></div><span>{item.status}</span><strong>{item.status === 'review' ? 'Aguardando sua revisão' : item.status === 'approved' ? 'Aprovado' : 'Em processamento'}</strong></div>) : <div className="empty-state">Nenhum pedido operacional registrado.</div>}</div></section>
  </div>
}
