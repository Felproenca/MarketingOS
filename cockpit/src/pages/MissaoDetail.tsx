import { useParams, Link } from 'react-router-dom'
import { useState, useEffect, useCallback } from 'react'
import { ArrowLeft, ExternalLink, Download, Check, Loader, Globe, FolderOpen } from 'lucide-react'
import StepBadge from '../components/StepBadge'
import LogStream from '../components/LogStream'
import { REFERENCES } from '../data/references'
import { getMission, executeMission } from '../lib/api'
import type { Mission } from '../types'

const QA_CHECKLIST = [
  'Hero prende atenção em 3 segundos?',
  'Headline é específica ao nicho?',
  'Copy evita frases genéricas?',
  'Site não parece template?',
  'CTA está visível e claro?',
  'Visual comunica premium?',
  'Motion ajuda a narrativa?',
  'Mobile responsivo?',
  '3 referências foram registradas?',
  'Mensagem de abordagem gerada?',
]

export default function MissaoDetail() {
  const { id } = useParams()

  const [mission, setMission] = useState<Mission | null>(null)
  const [loading, setLoading] = useState(true)
  const [executing, setExecuting] = useState(false)
  const [qaChecked, setQaChecked] = useState<Record<string, boolean>>({})

  const refs3 = REFERENCES.slice(0, 3)

  const load = useCallback(async () => {
    if (!id) return
    try {
      const m = await getMission(id)
      setMission(m)
    } catch {
      setMission(null)
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => { load() }, [load])

  const toggleQa = (item: string) => setQaChecked(prev => ({ ...prev, [item]: !prev[item] }))

  const handleExecute = async () => {
    if (!mission || executing) return
    setExecuting(true)
    // Polling: o servidor retorna a missão completa quando finaliza
    try {
      const updated = await executeMission(mission.slug)
      setMission(updated)
    } catch (err) {
      console.error(err)
    } finally {
      setExecuting(false)
    }
  }

  if (loading) {
    return (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 40 }}>
        <div className="flex items-center gap-3" style={{ fontFamily: 'var(--f-mono)', fontSize: 12, color: 'var(--text-3)' }}>
          <Loader size={14} className="pulse" /> CARREGANDO...
        </div>
      </div>
    )
  }

  if (!mission) {
    return (
      <div style={{ flex: 1, padding: 40 }}>
        <p style={{ color: 'var(--text-2)', marginBottom: 16 }}>
          Missão não encontrada. O servidor pode estar offline.
        </p>
        <Link to="/missoes" style={{ fontFamily: 'var(--f-mono)', fontSize: 11, color: 'var(--accent)', textDecoration: 'none' }}>
          ← VOLTAR
        </Link>
      </div>
    )
  }

  const doneSteps = mission.steps.filter(s => s.status === 'done').length
  const totalSteps = mission.steps.length
  const progress = totalSteps > 0 ? (doneSteps / totalSteps) * 100 : 0

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '28px 32px' }}>
      {/* Back + header */}
      <div style={{ marginBottom: 24 }}>
        <Link
          to="/missoes"
          className="flex items-center gap-2"
          style={{ fontFamily: 'var(--f-mono)', fontSize: 11, color: 'var(--text-3)', textDecoration: 'none', marginBottom: 16 }}
        >
          <ArrowLeft size={12} /> MISSÕES
        </Link>
        <div className="flex items-start justify-between gap-4">
          <div>
            <div style={{ fontFamily: 'var(--f-mono)', fontSize: 10, color: 'var(--text-3)', letterSpacing: '0.08em', marginBottom: 6 }}>
              {mission.modo.toUpperCase()} · {mission.empresa}
            </div>
            <h1 className="display" style={{ fontSize: 26, color: 'var(--text)', lineHeight: 1.1, marginBottom: 8 }}>
              {mission.nome.toUpperCase()}
            </h1>
            <div className="flex items-center gap-3">
              <div
                className="tag flex items-center gap-1"
                style={{
                  color: mission.status === 'done' ? 'var(--green)' : mission.status === 'running' ? 'var(--accent)' : 'var(--text-3)',
                  background: 'var(--bg-hover)',
                  border: '1px solid var(--border)',
                }}
              >
                {mission.status === 'running' && <span className="pulse" style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--accent)', display: 'inline-block' }} />}
                {mission.status === 'done' && <Check size={9} />}
                {mission.status.toUpperCase()}
              </div>
              <span style={{ fontFamily: 'var(--f-mono)', fontSize: 10, color: 'var(--text-3)' }}>
                {doneSteps}/{totalSteps} etapas · {Math.round(progress)}%
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {mission.status === 'draft' && (
              <button
                onClick={handleExecute}
                disabled={executing}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  background: 'var(--accent)', color: '#000',
                  fontFamily: 'var(--f-display)', fontSize: 14, letterSpacing: '0.05em',
                  padding: '10px 18px', borderRadius: 8, border: 'none',
                  cursor: executing ? 'not-allowed' : 'pointer',
                  opacity: executing ? 0.7 : 1,
                }}
              >
                {executing ? <Loader size={13} className="pulse" /> : <Globe size={13} />}
                {executing ? 'GERANDO...' : 'EXECUTAR'}
              </button>
            )}
            {mission.status === 'done' && (
              <button
                onClick={() => window.open(`http://localhost:4201/preview/${mission.slug}/site/index.html`, '_blank')}
                className="flex items-center gap-2"
                style={{
                  fontFamily: 'var(--f-mono)', fontSize: 11, color: 'var(--accent)',
                  background: 'var(--accent-glow)', border: '1px solid var(--border-accent)',
                  borderRadius: 7, padding: '8px 14px', cursor: 'pointer',
                }}
              >
                <ExternalLink size={12} /> ABRIR PREVIEW
              </button>
            )}
            {mission.status === 'done' && (
              <button
                onClick={() => window.open(`http://localhost:4201/preview/${mission.slug}/`, '_blank')}
                className="flex items-center gap-2"
                style={{
                  fontFamily: 'var(--f-mono)', fontSize: 11, color: 'var(--text-2)',
                  background: 'var(--bg-card)', border: '1px solid var(--border)',
                  borderRadius: 7, padding: '8px 14px', cursor: 'pointer',
                }}
              >
                <FolderOpen size={12} /> DOSSIÊ
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ height: 4, background: 'var(--bg-hover)', borderRadius: 2, overflow: 'hidden', marginBottom: 12 }}>
          <div
            style={{
              height: '100%', width: `${progress}%`,
              background: progress === 100 ? 'var(--green)' : executing ? 'var(--accent)' : 'var(--accent)',
              transition: 'width 0.5s ease',
              boxShadow: `0 0 12px ${progress === 100 ? 'rgba(0,255,136,0.5)' : 'var(--accent-glow-strong)'}`,
            }}
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {mission.steps.map((step, i) => (
            <StepBadge key={step.id} label={step.label} status={step.status} index={i + 1} />
          ))}
        </div>
      </div>

      {/* Executing notice */}
      {executing && (
        <div style={{ marginBottom: 24, padding: '12px 16px', background: 'var(--accent-glow)', border: '1px solid var(--border-accent)', borderRadius: 10 }}>
          <div className="flex items-center gap-2">
            <Loader size={13} style={{ color: 'var(--accent)' }} className="pulse" />
            <span style={{ fontFamily: 'var(--f-mono)', fontSize: 11, color: 'var(--accent)' }}>
              Gerando dossiê e site... isso leva ~10 segundos
            </span>
          </div>
        </div>
      )}

      {/* Content grid */}
      <div className="grid gap-6" style={{ gridTemplateColumns: '1fr 340px' }}>
        <div className="flex flex-col gap-5">
          {/* References */}
          <div style={{ background: 'var(--bg-panel)', border: '1px solid var(--border)', borderRadius: 10, padding: '18px 20px' }}>
            <div style={{ fontFamily: 'var(--f-mono)', fontSize: 10, color: 'var(--text-3)', letterSpacing: '0.08em', marginBottom: 14 }}>
              3 REFERÊNCIAS OBRIGATÓRIAS
            </div>
            <div className="flex flex-col gap-3">
              {refs3.map((ref, i) => (
                <div key={ref.id} style={{ display: 'flex', gap: 12, padding: '12px 14px', background: 'var(--bg-card)', borderRadius: 8 }}>
                  <div className="display flex-shrink-0" style={{ fontSize: 22, color: 'var(--accent)', width: 32, lineHeight: 1, paddingTop: 2 }}>
                    {i + 1}
                  </div>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>
                      {ref.nome}
                      {ref.url && <span style={{ fontFamily: 'var(--f-mono)', fontSize: 10, color: 'var(--text-3)', marginLeft: 8 }}>{ref.url}</span>}
                    </div>
                    <div style={{ fontFamily: 'var(--f-mono)', fontSize: 10, color: 'var(--cyan)', marginBottom: 6 }}>
                      {ref.categoria.toUpperCase()}
                    </div>
                    <ul style={{ listStyle: 'none', padding: 0 }}>
                      {ref.o_que_aproveitar.map(item => (
                        <li key={item} style={{ fontSize: 11, color: 'var(--text-2)', marginBottom: 2, paddingLeft: 10, position: 'relative' }}>
                          <span style={{ position: 'absolute', left: 0, color: 'var(--accent)' }}>›</span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* QA Checklist */}
          <div style={{ background: 'var(--bg-panel)', border: '1px solid var(--border)', borderRadius: 10, padding: '18px 20px' }}>
            <div className="flex items-center justify-between mb-4">
              <div style={{ fontFamily: 'var(--f-mono)', fontSize: 10, color: 'var(--text-3)', letterSpacing: '0.08em' }}>
                QA CHECKLIST
              </div>
              <div style={{ fontFamily: 'var(--f-mono)', fontSize: 10, color: 'var(--green)' }}>
                {Object.values(qaChecked).filter(Boolean).length}/{QA_CHECKLIST.length}
              </div>
            </div>
            <div className="flex flex-col gap-2">
              {QA_CHECKLIST.map(item => (
                <button
                  key={item}
                  type="button"
                  onClick={() => toggleQa(item)}
                  className="flex items-center gap-3"
                  style={{
                    padding: '8px 12px',
                    background: qaChecked[item] ? 'rgba(0,255,136,0.06)' : 'var(--bg-card)',
                    border: `1px solid ${qaChecked[item] ? 'rgba(0,255,136,0.25)' : 'var(--border)'}`,
                    borderRadius: 7, cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s',
                  }}
                >
                  <div style={{
                    width: 16, height: 16, borderRadius: 4,
                    border: `1.5px solid ${qaChecked[item] ? 'var(--green)' : 'var(--border-bright)'}`,
                    background: qaChecked[item] ? 'var(--green)' : 'transparent',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  }}>
                    {qaChecked[item] && <Check size={10} color="#000" strokeWidth={3} />}
                  </div>
                  <span style={{ fontSize: 12, color: qaChecked[item] ? 'var(--text-2)' : 'var(--text)', textDecoration: qaChecked[item] ? 'line-through' : 'none' }}>
                    {item}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Outreach message */}
          {mission.status === 'done' && (
            <div style={{ background: 'var(--bg-panel)', border: '1px solid var(--border)', borderRadius: 10, padding: '18px 20px' }}>
              <div className="flex items-center justify-between mb-4">
                <div style={{ fontFamily: 'var(--f-mono)', fontSize: 10, color: 'var(--text-3)', letterSpacing: '0.08em' }}>
                  MENSAGEM DE ABORDAGEM
                </div>
                <button
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    fontFamily: 'var(--f-mono)', fontSize: 10, color: 'var(--green)',
                    background: 'rgba(0,255,136,0.08)', border: '1px solid rgba(0,255,136,0.2)',
                    borderRadius: 5, padding: '4px 10px', cursor: 'pointer',
                  }}
                  onClick={() => navigator.clipboard.writeText(`Oi! Vi a presença online da ${mission.empresa} e montei uma versão conceito do site com uma abordagem mais premium, focada em gerar mais resultados. Fiz só para você ver o potencial. Posso te mandar o preview?`)}
                >
                  <Download size={10} /> COPIAR
                </button>
              </div>
              <div style={{ fontSize: 13, color: 'var(--text)', lineHeight: 1.7, background: 'var(--bg-card)', borderRadius: 8, padding: '14px 16px', fontStyle: 'italic' }}>
                "Oi! Vi a presença online da {mission.empresa} e montei uma versão conceito do site com uma abordagem mais premium, focada em gerar mais resultados. Fiz só para você ver o potencial. Posso te mandar o preview?"
              </div>
            </div>
          )}
        </div>

        {/* Right: logs */}
        <div>
          <div style={{ fontFamily: 'var(--f-mono)', fontSize: 10, color: 'var(--text-3)', letterSpacing: '0.08em', marginBottom: 10 }}>
            EXECUTION LOG
          </div>
          <LogStream />
        </div>
      </div>
    </div>
  )
}
