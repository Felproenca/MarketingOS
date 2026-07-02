import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ChevronRight, Globe, FileText, Radio, Zap, AlertCircle } from 'lucide-react'
import type { MissionMode } from '../types'
import { createMission } from '../lib/api'

const MODES: { value: MissionMode; label: string; desc: string; icon: React.ReactNode; color: string }[] = [
  { value: 'prospeccao', label: 'Site Prospecção', desc: 'Site premium para abordar um prospect. Rápido, impactante, persuasivo.', icon: <Globe size={18} />, color: 'var(--accent)' },
  { value: 'premium',    label: 'Site Premium', desc: 'Site completo para cliente fechado. Mais iterações, mais refinamento.', icon: <Zap size={18} />, color: 'var(--cyan)' },
  { value: 'conteudo',   label: 'Conteúdo', desc: 'Post, carrossel, reels ou sequência editorial para Instagram.', icon: <FileText size={18} />, color: 'var(--green)' },
  { value: 'aquisicao',  label: 'Aquisição', desc: 'Abordagem, pitch, funil ou sequência de prospecção ativa.', icon: <Radio size={18} />, color: 'var(--amber)' },
]

const TOMS = ['Premium, sofisticado', 'Direto, sem enrolação', 'Acolhedor, humano', 'Técnico, autoridade', 'Jovem, irreverente', 'Urgente, escassez']
const OBJETIVOS = ['Gerar agendamentos via WhatsApp', 'Capturar leads por formulário', 'Demonstrar portfólio', 'Vender produto/serviço online', 'Gerar pedidos de orçamento', 'Construir autoridade']

const Input = ({ label, ...props }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) => (
  <div>
    <label style={{ display: 'block', fontFamily: 'var(--f-mono)', fontSize: 10, color: 'var(--text-3)', letterSpacing: '0.07em', marginBottom: 5 }}>
      {label.toUpperCase()}
    </label>
    <input
      {...props}
      style={{
        width: '100%',
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: 7,
        padding: '9px 12px',
        fontSize: 13,
        color: 'var(--text)',
        fontFamily: 'var(--f-body)',
        outline: 'none',
        transition: 'border-color 0.15s',
      }}
      onFocus={e => (e.target as HTMLElement).style.borderColor = 'var(--accent)'}
      onBlur={e => (e.target as HTMLElement).style.borderColor = 'var(--border)'}
    />
  </div>
)

const Select = ({ label, children, ...props }: { label: string } & React.SelectHTMLAttributes<HTMLSelectElement>) => (
  <div>
    <label style={{ display: 'block', fontFamily: 'var(--f-mono)', fontSize: 10, color: 'var(--text-3)', letterSpacing: '0.07em', marginBottom: 5 }}>
      {label.toUpperCase()}
    </label>
    <select
      {...props}
      style={{
        width: '100%',
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: 7,
        padding: '9px 12px',
        fontSize: 13,
        color: 'var(--text)',
        fontFamily: 'var(--f-body)',
        outline: 'none',
        cursor: 'pointer',
      }}
    >
      {children}
    </select>
  </div>
)

const Textarea = ({ label, ...props }: { label: string } & React.TextareaHTMLAttributes<HTMLTextAreaElement>) => (
  <div>
    <label style={{ display: 'block', fontFamily: 'var(--f-mono)', fontSize: 10, color: 'var(--text-3)', letterSpacing: '0.07em', marginBottom: 5 }}>
      {label.toUpperCase()}
    </label>
    <textarea
      {...props}
      rows={3}
      style={{
        width: '100%',
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: 7,
        padding: '9px 12px',
        fontSize: 13,
        color: 'var(--text)',
        fontFamily: 'var(--f-body)',
        outline: 'none',
        resize: 'vertical',
        transition: 'border-color 0.15s',
      }}
      onFocus={e => (e.target as HTMLElement).style.borderColor = 'var(--accent)'}
      onBlur={e => (e.target as HTMLElement).style.borderColor = 'var(--border)'}
    />
  </div>
)

export default function NovaMissao() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const [modo, setModo] = useState<MissionMode>((params.get('modo') as MissionMode) || 'prospeccao')
  const [form, setForm] = useState({
    empresa: '', urlAtual: '', instagram: '', nicho: '', cidade: '',
    oferta: '', publico: '', tom: TOMS[0], objetivo: OBJETIVOS[0], observacoes: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm(prev => ({ ...prev, [field]: e.target.value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const mission = await createMission({ ...form, modo })
      navigate(`/missoes/${mission.slug}`)
    } catch {
      setError('Servidor offline. Rode: npm run dev:all')
      setLoading(false)
    }
  }

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '28px 32px', maxWidth: 800 }}>
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontFamily: 'var(--f-mono)', fontSize: 10, color: 'var(--text-3)', letterSpacing: '0.08em', marginBottom: 8 }}>
          NOVA MISSÃO
        </div>
        <h1 className="display" style={{ fontSize: 32, color: 'var(--text)', lineHeight: 1 }}>
          BRIEFING
        </h1>
      </div>

      {/* Mode selector */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontFamily: 'var(--f-mono)', fontSize: 10, color: 'var(--text-3)', letterSpacing: '0.08em', marginBottom: 12 }}>
          TIPO DE MISSÃO
        </div>
        <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
          {MODES.map(m => (
            <button
              key={m.value}
              type="button"
              onClick={() => setModo(m.value)}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 12,
                padding: '14px 16px',
                background: modo === m.value ? `${m.color}10` : 'var(--bg-card)',
                border: `1px solid ${modo === m.value ? m.color : 'var(--border)'}`,
                borderRadius: 10,
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.15s',
              }}
            >
              <span style={{ color: m.color, marginTop: 1 }}>{m.icon}</span>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: modo === m.value ? m.color : 'var(--text)', marginBottom: 3 }}>
                  {m.label}
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-2)', lineHeight: 1.5 }}>{m.desc}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        <div style={{ background: 'var(--bg-panel)', border: '1px solid var(--border)', borderRadius: 10, padding: '20px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ fontFamily: 'var(--f-mono)', fontSize: 10, color: 'var(--accent)', letterSpacing: '0.08em' }}>
            EMPRESA / PROSPECT
          </div>
          <div className="grid gap-4" style={{ gridTemplateColumns: '1fr 1fr' }}>
            <Input label="Nome da Empresa *" required value={form.empresa} onChange={set('empresa')} placeholder="Ex: Clínica Essence" />
            <Input label="Nicho / Segmento *" required value={form.nicho} onChange={set('nicho')} placeholder="Ex: Clínica Estética" />
          </div>
          <div className="grid gap-4" style={{ gridTemplateColumns: '1fr 1fr 1fr' }}>
            <Input label="Site Atual" value={form.urlAtual} onChange={set('urlAtual')} placeholder="https://..." />
            <Input label="Instagram" value={form.instagram} onChange={set('instagram')} placeholder="@usuario" />
            <Input label="Cidade" value={form.cidade} onChange={set('cidade')} placeholder="Ex: Florianópolis/SC" />
          </div>
        </div>

        <div style={{ background: 'var(--bg-panel)', border: '1px solid var(--border)', borderRadius: 10, padding: '20px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ fontFamily: 'var(--f-mono)', fontSize: 10, color: 'var(--cyan)', letterSpacing: '0.08em' }}>
            ESTRATÉGIA
          </div>
          <Textarea label="Oferta Principal *" required value={form.oferta} onChange={set('oferta')} placeholder="O que a empresa vende? Qual o produto/serviço central?" />
          <Textarea label="Público-Alvo *" required value={form.publico} onChange={set('publico')} placeholder="Quem compra? Faixa etária, perfil, dores principais." />
          <div className="grid gap-4" style={{ gridTemplateColumns: '1fr 1fr' }}>
            <Select label="Tom de Comunicação" value={form.tom} onChange={set('tom')}>
              {TOMS.map(t => <option key={t} value={t}>{t}</option>)}
            </Select>
            <Select label="Objetivo Principal" value={form.objetivo} onChange={set('objetivo')}>
              {OBJETIVOS.map(o => <option key={o} value={o}>{o}</option>)}
            </Select>
          </div>
          <Textarea label="Observações" value={form.observacoes} onChange={set('observacoes')} placeholder="Referências visuais, cores existentes, restrições, preferências..." />
        </div>

        {error && (
          <div className="flex items-center gap-2" style={{ padding: '12px 16px', background: 'rgba(255,45,85,0.08)', border: '1px solid rgba(255,45,85,0.3)', borderRadius: 8, fontSize: 13, color: 'var(--red)' }}>
            <AlertCircle size={14} /> {error}
          </div>
        )}
        <button
          type="submit"
          disabled={loading}
          className="flex items-center justify-center gap-2"
          style={{
            background: 'var(--accent)',
            color: '#000',
            fontFamily: 'var(--f-display)',
            fontSize: 16,
            fontWeight: 700,
            letterSpacing: '0.05em',
            padding: '14px 24px',
            borderRadius: 10,
            border: 'none',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.7 : 1,
            transition: 'opacity 0.15s',
            boxShadow: '0 0 24px var(--accent-glow-strong)',
          }}
        >
          {loading ? 'CRIANDO...' : 'INICIAR MISSÃO'}
          {!loading && <ChevronRight size={18} strokeWidth={2.5} />}
        </button>
      </form>
    </div>
  )
}
