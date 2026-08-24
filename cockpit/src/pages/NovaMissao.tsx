import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Check, CheckCircle2, ClipboardList, Loader2, Route, ShieldCheck, Sparkles, Target, Users } from 'lucide-react'
import { getOperations, getReport, createRequest, type ClientProfile, type Reference } from '../lib/api'
import { brl, num, pct } from '../lib/formatters'

type Field = { key: string; label: string; placeholder: string; required?: boolean; multiline?: boolean }
type Intent = {
  id: string
  label: string
  description: string
  requestType: string
  titlePrefix: string
  fields: Field[]
}

const INTENTS: Intent[] = [
  {
    id: 'content', label: 'Criar conteúdo', requestType: 'carousel',
    titlePrefix: 'Criar conteúdo para ',
    description: 'Carrossel, post ou peça para um canal. Você define o objetivo; o sistema decide o formato.',
    fields: [
      { key: 'objective', label: 'Objetivo', placeholder: 'Ex.: gerar inscrições para a masterclass', required: true },
      { key: 'audience', label: 'Público', placeholder: 'Quem precisa ser alcançado (opcional)' },
      { key: 'tone', label: 'Tom / restrições', placeholder: 'Tom, o que não pode dizer, CTA desejado', multiline: true },
    ],
  },
  {
    id: 'strategy', label: 'Criar estratégia', requestType: 'strategy',
    titlePrefix: 'Plano de estratégia para ',
    description: 'Transforme um objetivo comercial em plano de ação com diagnóstico, prioridades e riscos.',
    fields: [
      { key: 'objective', label: 'Objetivo comercial', placeholder: 'Ex.: dobrar leads qualificados em 90 dias', required: true },
      { key: 'audience', label: 'Público / mercado', placeholder: 'Segmentos, dores e desejos (opcional)' },
      { key: 'tone', label: 'Contexto extra', placeholder: 'Oferta atual, restrições, prioridades', multiline: true },
    ],
  },
  {
    id: 'research', label: 'Pesquisar mercado', requestType: 'research',
    titlePrefix: 'Pesquisa de mercado para ',
    description: 'Encontre sinais, concorrentes e oportunidades com fontes explícitas.',
    fields: [
      { key: 'objective', label: 'Pergunta da pesquisa', placeholder: 'Ex.: quem são os concorrentes diretos e o que estão ofertando?', required: true },
      { key: 'sources', label: 'Fontes sugeridas (uma por linha)', placeholder: 'URLs ou caminhos de arquivo. O executor bloqueia pesquisa sem fontes.', multiline: true },
      { key: 'tone', label: 'Foco adicional', placeholder: 'Mercado, região ou recorte de interesse', multiline: true },
    ],
  },
  {
    id: 'analysis', label: 'Analisar dados', requestType: 'analysis',
    titlePrefix: 'Análise de dados de ',
    description: 'Entenda o que está acontecendo e o próximo movimento com base nos dados do cliente.',
    fields: [
      { key: 'objective', label: 'Pergunta da análise', placeholder: 'Ex.: por que o alcance caiu nas últimas 2 semanas?', required: true },
      { key: 'tone', label: 'Contexto / período', placeholder: 'Período de interesse, hipóteses, restrições', multiline: true },
    ],
  },
  {
    id: 'funnel', label: 'Montar um funil', requestType: 'funnel',
    titlePrefix: 'Funil para ',
    description: 'Estruture etapas, mensagens, gatilhos e métricas até a conversão.',
    fields: [
      { key: 'objective', label: 'Objetivo do funil', placeholder: 'Ex.: converter visitantes do perfil em agendamentos', required: true },
      { key: 'audience', label: 'Público', placeholder: 'Quem entra no funil e em qual etapa (opcional)' },
      { key: 'tone', label: 'Oferta / restrições', placeholder: 'Oferta principal, garantias, limites', multiline: true },
    ],
  },
]

const s = {
  page: { maxWidth: 860, margin: '0 auto', padding: '40px 24px 90px', width: '100%' },
  h1: { fontFamily: 'var(--f-display)', fontSize: 28, color: 'var(--text)', margin: 0, letterSpacing: '0.01em' },
  sub: { color: 'var(--text-2)', fontSize: 13, margin: '8px 0 26px', lineHeight: 1.6 },
  steps: { display: 'flex', gap: 8, marginBottom: 26, flexWrap: 'wrap' as const },
  step: (active: boolean, done: boolean) => ({
    display: 'flex', alignItems: 'center', gap: 7, padding: '7px 12px', borderRadius: 999,
    border: `1px solid ${active ? 'var(--accent)' : 'var(--border-bright)'}`,
    background: active ? 'var(--accent-glow)' : 'var(--bg-card)',
    color: active ? 'var(--accent)' : done ? 'var(--green)' : 'var(--text-2)',
    font: '9px var(--f-mono)', letterSpacing: '0.08em', textTransform: 'uppercase' as const,
  }),
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(215px, 1fr))', gap: 10, marginBottom: 22 },
  card: (active: boolean) => ({
    cursor: 'pointer', borderRadius: 12, padding: '14px 15px',
    background: active ? 'var(--accent-glow)' : 'var(--bg-card)',
    border: `1px solid ${active ? 'var(--accent)' : 'var(--border)'}`,
    transition: 'all .15s',
  }),
  cardLabel: { fontSize: 13, fontWeight: 600, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 8 },
  cardDesc: { fontSize: 11, color: 'var(--text-2)', lineHeight: 1.5, marginTop: 5 },
  field: { marginBottom: 14 },
  label: { display: 'block', fontFamily: 'var(--f-mono)', fontSize: 10, color: 'var(--text-2)', letterSpacing: '0.07em', marginBottom: 6, textTransform: 'uppercase' as const },
  input: { width: '100%', background: 'var(--bg-card)', border: '1px solid var(--border-bright)', borderRadius: 9, padding: '11px 13px', fontSize: 13, color: 'var(--text)', outline: 'none', fontFamily: 'var(--f-body)' },
  textarea: { width: '100%', background: 'var(--bg-card)', border: '1px solid var(--border-bright)', borderRadius: 9, padding: '11px 13px', fontSize: 13, color: 'var(--text)', outline: 'none', minHeight: 84, resize: 'vertical' as const, fontFamily: 'var(--f-body)' },
  btn: { display: 'inline-flex', alignItems: 'center', gap: 8, background: 'var(--accent)', color: '#070907', border: 'none', borderRadius: 9, padding: '12px 18px', fontSize: 13, fontWeight: 800, cursor: 'pointer', fontFamily: 'var(--f-body)' },
  btnGhost: { display: 'inline-flex', alignItems: 'center', gap: 8, background: 'transparent', color: 'var(--text-2)', border: '1px solid var(--border-bright)', borderRadius: 9, padding: '12px 16px', fontSize: 13, cursor: 'pointer', fontFamily: 'var(--f-body)' },
  box: { background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 13, padding: 18, marginBottom: 14 },
}

export default function NovaMissao() {
  const navigate = useNavigate()
  const [clients, setClients] = useState<ClientProfile[]>([])
  const [references, setReferences] = useState<Reference[]>([])
  const [clientId, setClientId] = useState('')
  const [intentId, setIntentId] = useState('content')
  const [fields, setFields] = useState<Record<string, string>>({})
  const [title, setTitle] = useState('')
  const [report, setReport] = useState<Awaited<ReturnType<typeof getReport>> | null>(null)
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const intent = INTENTS.find(i => i.id === intentId) || INTENTS[0]

  useEffect(() => {
    getOperations()
      .then(d => {
        setClients(d.clients)
        setReferences(d.references)
        const saved = localStorage.getItem('mkos.client')
        setClientId(saved && d.clients.some(c => c.client_id === saved) ? saved : (d.clients[0]?.client_id || ''))
        setError('')
      })
      .catch(e => setError(e instanceof Error ? e.message : 'Falha ao carregar clientes.'))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (step === 3 && clientId) {
      getReport(clientId).then(setReport).catch(() => setReport(null))
    }
  }, [step, clientId])

  const client = clients.find(c => c.client_id === clientId)
  const reference = references.find(r => r.client_id === clientId)
  const missing = intent.fields.filter(f => f.required && !fields[f.key]?.trim())

  function selectIntent(id: string) {
    setIntentId(id)
    setFields({})
    setTitle(`${INTENTS.find(i => i.id === id)?.titlePrefix || ''}${client?.display_name || ''}`.trim())
  }

  function chooseClient(id: string) {
    setClientId(id)
    localStorage.setItem('mkos.client', id)
    setTitle(`${intent.titlePrefix}${clients.find(c => c.client_id === id)?.display_name || ''}`.trim())
  }

  async function submit() {
    if (missing.length) { setError('Preencha os campos obrigatórios do briefing.'); return }
    setSubmitting(true)
    setError('')
    try {
      const payload: Record<string, unknown> = {
        clientId,
        title,
        requestType: intent.requestType,
        objective: fields.objective || '',
        priority: 'normal',
        prompt: [fields.objective, fields.audience, fields.tone].filter(Boolean).join('\n\n'),
      }
      if (fields.sources) payload.sources = fields.sources.split(/\r?\n|,/).map(x => x.trim()).filter(Boolean)
      const res = await createRequest(payload)
      navigate(`/operacao/${res.request.id}`)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Falha ao criar solicitação.')
      setSubmitting(false)
    }
  }

  const steps = ['Cliente', 'Intenção', 'Briefing', 'Confirmar']

  return (
    <div style={s.page}>
      <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--text-3)', textDecoration: 'none', fontSize: 13, marginBottom: 18 }}>
        <ArrowLeft size={14} /> Command Center
      </Link>
      <h1 style={s.h1}>Nova solicitação</h1>
      <p style={s.sub}>Diga o que precisa em linguagem simples. O backend valida contexto, quota, rota técnica e execução — você não escolhe skill.</p>

      <div style={s.steps}>
        {steps.map((label, i) => (
          <div key={label} style={s.step(step === i, i < step)}>
            {i < step ? <Check size={11} /> : <span>{String(i + 1).padStart(2, '0')}</span>} {label}
          </div>
        ))}
      </div>

      {error && (
        <div style={{ ...s.box, borderColor: 'rgba(255,45,85,.4)', display: 'flex', gap: 8, alignItems: 'flex-start', color: '#ff9ab0', fontSize: 12 }}>
          <span style={{ flexShrink: 0 }}>⚠</span> {error}
        </div>
      )}

      {loading ? (
        <div style={{ ...s.box, display: 'flex', alignItems: 'center', gap: 10, color: 'var(--text-2)', fontSize: 13 }}>
          <Loader2 size={16} className="spin" /> Carregando clientes e contexto…
        </div>
      ) : step === 0 ? (
        <div style={s.box}>
          <div style={s.label}><Users size={12} style={{ verticalAlign: -2 }} /> PARA QUAL CLIENTE?</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(215px, 1fr))', gap: 10 }}>
            {clients.map(c => (
              <div key={c.client_id} style={s.card(clientId === c.client_id)} onClick={() => chooseClient(c.client_id)}>
                <div style={s.cardLabel}><span style={{ display: 'grid', placeItems: 'center', width: 26, height: 26, borderRadius: 7, background: 'var(--accent-glow)', color: 'var(--accent)', font: '700 10px var(--f-mono)' }}>{c.display_name.slice(0, 2).toUpperCase()}</span> {c.display_name}</div>
                <div style={s.cardDesc}>{c.company_name || c.client_id} · {references.some(r => r.client_id === c.client_id) ? 'referência ativa' : 'sem referência'}</div>
              </div>
            ))}
          </div>
          <button style={{ ...s.btn, marginTop: 6 }} disabled={!clientId} onClick={() => setStep(1)}>Continuar <ArrowRight size={14} /></button>
        </div>
      ) : step === 1 ? (
        <div>
          <div style={s.grid}>
            {INTENTS.map(it => (
              <div key={it.id} style={s.card(intentId === it.id)} onClick={() => selectIntent(it.id)}>
                <div style={s.cardLabel}><Sparkles size={13} color="var(--accent)" /> {it.label}</div>
                <div style={s.cardDesc}>{it.description}</div>
              </div>
            ))}
          </div>
          <button style={s.btnGhost} onClick={() => setStep(0)}><ArrowLeft size={14} /> Cliente</button>
          <button style={{ ...s.btn, marginLeft: 10 }} onClick={() => setStep(2)}>Continuar <ArrowRight size={14} /></button>
        </div>
      ) : step === 2 ? (
        <div style={s.box}>
          <div style={s.label}>TÍTULO DA SOLICITAÇÃO</div>
          <input style={{ ...s.input, marginBottom: 16 }} value={title} onChange={e => setTitle(e.target.value)} />
          {intent.fields.map(f => (
            <div style={s.field} key={f.key}>
              <label style={s.label}>{f.label}{f.required ? ' *' : ''}</label>
              {f.multiline ? (
                <textarea style={s.textarea} value={fields[f.key] || ''} onChange={e => setFields({ ...fields, [f.key]: e.target.value })} placeholder={f.placeholder} />
              ) : (
                <input style={s.input} value={fields[f.key] || ''} onChange={e => setFields({ ...fields, [f.key]: e.target.value })} placeholder={f.placeholder} />
              )}
            </div>
          ))}
          <button style={s.btnGhost} onClick={() => setStep(1)}><ArrowLeft size={14} /> Intenção</button>
          <button style={{ ...s.btn, marginLeft: 10 }} disabled={missing.length > 0} onClick={() => setStep(3)}>Revisar contexto e custo <Route size={14} /></button>
          {missing.length > 0 && <div style={{ marginTop: 10, color: 'var(--amber)', fontSize: 11 }}>Campos obrigatórios pendentes: {missing.map(m => m.label).join(', ')}.</div>}
        </div>
      ) : (
        <div>
          <div style={s.box}>
            <div style={s.label}><ClipboardList size={12} style={{ verticalAlign: -2 }} /> O QUE SERÁ ENVIADO</div>
            <div style={{ display: 'grid', gap: 10, fontSize: 13 }}>
              <div><b style={{ color: 'var(--text)' }}>Cliente:</b> <span style={{ color: 'var(--text-2)' }}>{client?.display_name}</span></div>
              <div><b style={{ color: 'var(--text)' }}>Intenção:</b> <span style={{ color: 'var(--text-2)' }}>{intent.label} ({intent.requestType})</span></div>
              <div><b style={{ color: 'var(--text)' }}>Título:</b> <span style={{ color: 'var(--text-2)' }}>{title}</span></div>
              <div><b style={{ color: 'var(--text)' }}>Objetivo:</b> <span style={{ color: 'var(--text-2)' }}>{fields.objective || '—'}</span></div>
              {fields.sources && <div><b style={{ color: 'var(--text)' }}>Fontes:</b> <span style={{ color: 'var(--text-2)' }}>{fields.sources.split(/\r?\n|,/).filter(Boolean).length} fornecida(s)</span></div>}
            </div>
            <div style={{ marginTop: 14, padding: '12px 13px', border: '1px dashed var(--border-bright)', borderRadius: 9, fontSize: 11, color: 'var(--text-2)', lineHeight: 1.5 }}>
              <Route size={12} style={{ verticalAlign: -2, color: 'var(--accent)' }} /> A rota técnica (capability → skill → executor) e o custo final são decididos pelo backend conforme o contexto e a quota.
            </div>
          </div>

          <div style={s.box}>
            <div style={s.label}><ShieldCheck size={12} style={{ verticalAlign: -2 }} /> CONTEXTO DISPONÍVEL</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: reference ? 'var(--green)' : 'var(--amber)' }}>
              <CheckCircle2 size={14} />
              {reference ? 'Client Truth / referência ativa será usada como contexto.' : 'Sem referência cadastrada — a execução usará apenas o briefing.'}
            </div>
            <div style={{ marginTop: 10, fontSize: 11, color: 'var(--text-3)', lineHeight: 1.5 }}>
              {reference?.brand_profile?.positioning ? `Posicionamento: ${reference.brand_profile.positioning}` : 'Cadastre a referência do cliente em Operação → Referência para outputs mais fiéis.'}
            </div>
          </div>

          <div style={s.box}>
            <div style={s.label}><Target size={12} style={{ verticalAlign: -2 }} /> QUOTA E CUSTO (informado pelo backend)</div>
            {report ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 10, marginBottom: 12 }}>
                <MiniStat label="Tokens usados" value={`${num(report.cota.usados)} / ${num(report.cota.total_tokens)}`} />
                <MiniStat label="Restantes" value={num(report.cota.restantes)} />
                <MiniStat label="Custo do mês" value={brl(report.cota.custo_usado_brl)} />
                <MiniStat label="Teto operacional" value={brl(report.cota.teto_custo_brl)} />
                <MiniStat label="Margem" value={pct(report.margem.margem_pct)} />
              </div>
            ) : (
              <div style={{ color: 'var(--text-3)', fontSize: 12 }}>Quota indisponível para este cliente — a execução validará o limite no backend.</div>
            )}
            <div style={{ fontSize: 11, color: 'var(--text-3)' }}>O front apenas exibe os dados. O backend autoriza e cobra a execução.</div>
          </div>

          <button style={s.btnGhost} onClick={() => setStep(2)}><ArrowLeft size={14} /> Briefing</button>
          <button style={{ ...s.btn, marginLeft: 10 }} disabled={submitting || missing.length > 0} onClick={submit}>
            {submitting ? <Loader2 size={15} className="spin" /> : <Sparkles size={15} />}
            {submitting ? 'Criando solicitação…' : 'Criar solicitação'}
          </button>
          {submitting && <div style={{ marginTop: 10, color: 'var(--text-3)', fontSize: 11 }}>Enviando para o roteador… a confirmação do pedido chega em instantes.</div>}
        </div>
      )}
    </div>
  )
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ padding: '11px 13px', border: '1px solid var(--border)', borderRadius: 9, background: 'rgba(10,10,15,.5)' }}>
      <div style={{ color: 'var(--text-3)', font: '8px var(--f-mono)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</div>
      <div style={{ color: 'var(--text)', fontSize: 16, fontWeight: 700, marginTop: 5 }}>{value}</div>
    </div>
  )
}
