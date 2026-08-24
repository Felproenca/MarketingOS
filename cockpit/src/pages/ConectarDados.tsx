import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  ArrowRight, Camera, Check, ChevronRight, CircleHelp, Cloud,
  Database, LockKeyhole, Network, Play, RefreshCw,
  ShieldCheck, Sparkles,
} from 'lucide-react'
import { apiFetch } from '../lib/auth'

const API_URL = import.meta.env.VITE_API_URL || ''

type Source = {
  id: string
  name: string
  description: string
  icon: typeof Camera
  tone: string
  state: 'available' | 'soon'
}

const SOURCES: Source[] = [
  { id: 'meta', name: 'Meta', description: 'Instagram, Página e anúncios', icon: Camera, tone: 'pink', state: 'available' },
  { id: 'youtube', name: 'YouTube', description: 'Canal e Analytics', icon: Play, tone: 'red', state: 'soon' },
  { id: 'google-ads', name: 'Google Ads', description: 'Campanhas e conversões', icon: Cloud, tone: 'blue', state: 'soon' },
]

type MetaStatus = { connected: boolean; igUsername?: string | null; expiresAt?: string | null }

export default function ConectarDados() {
  const [clientId, setClientId] = useState(() => new URLSearchParams(window.location.search).get('client_id') || 'felipe-proenca')
  const [selectedSource, setSelectedSource] = useState('meta')
  const [status, setStatus] = useState<MetaStatus | null>(null)
  const [checking, setChecking] = useState(false)
  const [notice, setNotice] = useState('')

  async function checkStatus() {
    if (!clientId.trim()) return
    setChecking(true)
    try {
      const response = await apiFetch(`${API_URL}/api/integrations/meta/client?action=status&clientId=${encodeURIComponent(clientId.trim())}`)
      if (!response.ok) throw new Error('status unavailable')
      setStatus(await response.json())
      setNotice('Status atualizado.')
    } catch {
      setStatus(null)
      setNotice('O cockpit está pronto. Quando o backend estiver publicado, o status aparecerá aqui.')
    } finally {
      setChecking(false)
    }
  }

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get('meta') === 'connected') setNotice('Meta conectada. A primeira sincronização já pode começar.')
    if (params.get('meta') === 'error') setNotice(`A Meta autorizou, mas a conexão não foi concluída na MK/OS. Etapa: ${params.get('stage') || 'desconhecida'}. ${params.get('reason') || 'Tente novamente.'}`)
    void checkStatus()
  }, [])

  function connectMeta() {
    if (!clientId.trim()) {
      setNotice('Informe o identificador interno do cliente antes de continuar.')
      return
    }
    void (async () => {
      const response = await apiFetch(`${API_URL}/api/integrations/meta/client?action=connect&clientId=${encodeURIComponent(clientId.trim())}`, { method: 'POST' })
      const body = await response.json()
      if (!response.ok) { setNotice(body.error || 'Não foi possível iniciar a conexão.'); return }
      window.location.href = body.url
    })()
  }

  return (
    <div className="connect-page">
      <header className="connect-header">
        <div>
          <div className="connect-kicker"><Sparkles size={13} /> DATA NOW · PRIMEIRO PASSO</div>
          <h1>Conecte os sinais.<br /><em>Veja o que está acontecendo.</em></h1>
          <p className="connect-lead">Uma camada segura para transformar dados reais de cada cliente em decisões mais claras — sem planilhas perdidas, sem adivinhação.</p>
        </div>
        <div className="connect-progress-card">
          <div className="progress-top"><span>CONFIGURAÇÃO DO ESPAÇO</span><b>1 de 3</b></div>
          <div className="progress-track"><span /></div>
          <small>Comece conectando a primeira fonte de dados.</small>
        </div>
      </header>

      <div className="connect-layout">
        <main>
          <section className="connect-section-head">
            <div><span className="section-number">01</span><div><span className="section-eyebrow">CLIENTE</span><h2>Para quem vamos coletar?</h2></div></div>
            <span className="section-state"><span className="state-dot" /> obrigatório</span>
          </section>

          <section className="client-setup-card">
            <div className="client-avatar">MK</div>
            <div className="client-field"><label htmlFor="client-id">Identificador interno</label><input id="client-id" value={clientId} onChange={event => setClientId(event.target.value)} placeholder="ex.: cliente-001" /><small>Esse identificador vincula os dados ao cliente certo. Nunca é uma senha.</small></div>
            <button className="icon-button" onClick={() => void checkStatus()} aria-label="Atualizar status" title="Atualizar status"><RefreshCw size={16} className={checking ? 'spin' : ''} /></button>
          </section>

          <section className="connect-section-head source-head">
            <div><span className="section-number">02</span><div><span className="section-eyebrow">FONTE DE DADOS</span><h2>Escolha onde o crescimento acontece</h2></div></div>
            <span className="section-state"><LockKeyhole size={13} /> somente leitura</span>
          </section>

          <div className="source-grid">
            {SOURCES.map(source => {
              const Icon = source.icon
              const active = source.id === selectedSource
              return <motion.button whileHover={{ y: -3 }} whileTap={{ scale: .985 }} key={source.id} className={`source-card ${active ? 'active' : ''} ${source.state}`} onClick={() => setSelectedSource(source.id)}>
                <div className={`source-icon ${source.tone}`}><Icon size={22} strokeWidth={1.8} /></div>
                <div className="source-copy"><strong>{source.name}</strong><span>{source.description}</span></div>
                {source.state === 'soon' ? <span className="coming-chip">em breve</span> : <span className={`radio-check ${active ? 'checked' : ''}`}>{active && <Check size={12} />}</span>}
                {active && source.state === 'available' && <div className="active-line" />}
              </motion.button>
            })}
          </div>

          <section className="meta-action-card">
            <div className="meta-card-glow" />
            <div className="meta-card-icon"><Network size={22} /></div>
            <div className="meta-card-copy"><span className="section-eyebrow">META · CONEXÃO OFICIAL</span><h3>Pronto para conectar Instagram e anúncios?</h3><p>Você será levado à Meta para autorizar somente o acesso necessário. A MK/OS não vê sua senha e não altera campanhas.</p>
              <div className="permission-list"><span><Check size={12} /> Insights</span><span><Check size={12} /> Página vinculada</span><span><Check size={12} /> Conta de anúncios</span></div>
            </div>
            <button className="connect-cta" onClick={connectMeta}>Conectar Meta <ArrowRight size={17} /></button>
          </section>
          {notice && <div className="connect-notice"><CircleHelp size={15} /> {notice}</div>}
        </main>

        <aside className="connect-aside">
          <div className="aside-card readiness-card">
            <div className="aside-card-head"><span className="section-eyebrow">VISÃO DO ESPAÇO</span><Database size={16} /></div>
            <div className="readiness-score"><strong>{status?.connected ? '01' : '00'}</strong><span>fontes conectadas</span></div>
            <div className="readiness-list"><div><span className="readiness-icon done"><Check size={13} /></span><span>Cliente identificado</span><b>feito</b></div><div><span className={`readiness-icon ${status?.connected ? 'done' : ''}`}>{status?.connected ? <Check size={13} /> : <span>2</span>}</span><span>Primeira fonte</span><b>{status?.connected ? 'feito' : 'agora'}</b></div><div><span className="readiness-icon"><span>3</span></span><span>Dados normalizados</span><b>próximo</b></div></div>
          </div>
          <div className="aside-card privacy-card"><div className="privacy-icon"><ShieldCheck size={18} /></div><div><strong>Seus dados ficam protegidos</strong><p>Guardamos o bruto, o normalizado e o histórico separados por cliente. Você pode revogar a conexão a qualquer momento.</p><a href="https://mkos.online/privacy.html" target="_blank" rel="noreferrer">Ler política de dados <ChevronRight size={13} /></a></div></div>
          <div className="aside-tip"><span className="tip-mark">✦</span><div><strong>Uma fonte por vez</strong><p>Comece pelo canal que já está ativo. Depois adicionamos as outras peças do seu sistema de crescimento.</p></div></div>
        </aside>
      </div>
    </div>
  )
}
