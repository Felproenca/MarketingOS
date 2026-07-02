import { useState } from 'react'
import { BookOpen, Zap, Type } from 'lucide-react'
import { REFERENCES } from '../data/references'
import { MOTION_PATTERNS } from '../data/motionPatterns'
import { COPY_PATTERNS } from '../data/copyPatterns'

type Tab = 'referencias' | 'motion' | 'copy'

const TabBtn = ({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) => (
  <button
    onClick={onClick}
    className="flex items-center gap-2"
    style={{
      padding: '8px 16px', borderRadius: 7, border: 'none', cursor: 'pointer',
      background: active ? 'var(--accent)' : 'var(--bg-card)',
      color: active ? '#000' : 'var(--text-2)',
      fontFamily: 'var(--f-mono)', fontSize: 11, letterSpacing: '0.05em',
      fontWeight: active ? 700 : 400, transition: 'all 0.15s',
    }}
  >
    {icon}
    {label}
  </button>
)

export default function Biblioteca() {
  const [tab, setTab] = useState<Tab>('referencias')

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '28px 32px', maxWidth: 1000 }}>
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontFamily: 'var(--f-mono)', fontSize: 10, color: 'var(--text-3)', letterSpacing: '0.08em', marginBottom: 6 }}>ARSENAL</div>
        <h1 className="display" style={{ fontSize: 32, color: 'var(--text)', lineHeight: 1 }}>BIBLIOTECA</h1>
      </div>

      <div className="flex gap-2 mb-8">
        <TabBtn active={tab === 'referencias'} onClick={() => setTab('referencias')} icon={<BookOpen size={12} />} label="REFERÊNCIAS" />
        <TabBtn active={tab === 'motion'} onClick={() => setTab('motion')} icon={<Zap size={12} />} label="MOTION PATTERNS" />
        <TabBtn active={tab === 'copy'} onClick={() => setTab('copy')} icon={<Type size={12} />} label="COPY PATTERNS" />
      </div>

      {tab === 'referencias' && (
        <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
          {REFERENCES.map(ref => (
            <div key={ref.id} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, padding: '16px 18px' }}>
              <div className="flex items-start justify-between mb-2">
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>{ref.nome}</div>
                <span className="tag" style={{ color: 'var(--cyan)', background: 'rgba(0,212,255,0.08)', border: '1px solid rgba(0,212,255,0.2)' }}>
                  {ref.categoria}
                </span>
              </div>
              {ref.url && <div style={{ fontFamily: 'var(--f-mono)', fontSize: 10, color: 'var(--text-3)', marginBottom: 8 }}>{ref.url}</div>}
              <div className="flex flex-wrap gap-1 mb-3">
                {ref.setor.map(s => (
                  <span key={s} className="tag" style={{ color: 'var(--text-3)', background: 'var(--bg-hover)', border: '1px solid var(--border)' }}>{s}</span>
                ))}
              </div>
              <ul style={{ listStyle: 'none', padding: 0 }}>
                {ref.o_que_aproveitar.map(item => (
                  <li key={item} style={{ fontSize: 11, color: 'var(--text-2)', marginBottom: 3, paddingLeft: 10, position: 'relative' }}>
                    <span style={{ position: 'absolute', left: 0, color: 'var(--accent)' }}>›</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}

      {tab === 'motion' && (
        <div className="flex flex-col gap-4">
          {MOTION_PATTERNS.map(mp => (
            <div key={mp.id} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, padding: '18px 20px' }}>
              <div className="flex items-start gap-4">
                <div className="display" style={{ fontSize: 28, color: 'var(--accent)', lineHeight: 1, flexShrink: 0 }}>
                  {mp.codigo.split('_')[1]}
                </div>
                <div style={{ flex: 1 }}>
                  <div className="flex items-center gap-3 mb-2">
                    <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>{mp.nome}</div>
                    <span className="tag" style={{ fontFamily: 'var(--f-mono)', color: 'var(--text-3)', background: 'var(--bg-hover)', border: '1px solid var(--border)' }}>
                      {mp.codigo}
                    </span>
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-2)', marginBottom: 8, lineHeight: 1.6 }}>{mp.descricao}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-3)', marginBottom: 8 }}>
                    <strong style={{ color: 'var(--text-2)' }}>Uso:</strong> {mp.uso}
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {mp.indicado.map(s => (
                      <span key={s} className="tag" style={{ color: 'var(--green)', background: 'rgba(0,255,136,0.07)', border: '1px solid rgba(0,255,136,0.2)' }}>{s}</span>
                    ))}
                  </div>
                  {mp.framerSnippet && (
                    <div style={{ marginTop: 10, padding: '8px 12px', background: 'var(--bg-panel)', border: '1px solid var(--border)', borderRadius: 6, fontFamily: 'var(--f-mono)', fontSize: 10, color: 'var(--cyan)', lineHeight: 1.6, wordBreak: 'break-all' }}>
                      {mp.framerSnippet}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'copy' && (
        <div className="flex flex-col gap-5">
          {COPY_PATTERNS.map(cp => (
            <div key={cp.id} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, padding: '18px 20px' }}>
              <div className="flex items-start justify-between gap-4 mb-3">
                <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>{cp.nome}</div>
                <div className="flex flex-wrap gap-1">
                  {cp.nichos.map(n => (
                    <span key={n} className="tag" style={{ color: 'var(--text-3)', background: 'var(--bg-hover)', border: '1px solid var(--border)' }}>{n}</span>
                  ))}
                </div>
              </div>
              <div style={{ fontSize: 12, color: 'var(--cyan)', fontFamily: 'var(--f-mono)', marginBottom: 12, padding: '8px 12px', background: 'rgba(0,212,255,0.06)', borderRadius: 6 }}>
                {cp.estrutura}
              </div>
              <div className="grid gap-3" style={{ gridTemplateColumns: '1fr 1fr', marginBottom: 8 }}>
                <div style={{ padding: '10px 12px', background: 'rgba(255,45,85,0.06)', border: '1px solid rgba(255,45,85,0.2)', borderRadius: 7 }}>
                  <div style={{ fontFamily: 'var(--f-mono)', fontSize: 9, color: 'var(--red)', marginBottom: 5, letterSpacing: '0.06em' }}>EVITAR</div>
                  <div style={{ fontSize: 12, color: 'var(--text-2)', lineHeight: 1.5, fontStyle: 'italic' }}>{cp.exemplo_ruim}</div>
                </div>
                <div style={{ padding: '10px 12px', background: 'rgba(0,255,136,0.06)', border: '1px solid rgba(0,255,136,0.2)', borderRadius: 7 }}>
                  <div style={{ fontFamily: 'var(--f-mono)', fontSize: 9, color: 'var(--green)', marginBottom: 5, letterSpacing: '0.06em' }}>USAR</div>
                  <div style={{ fontSize: 12, color: 'var(--text)', lineHeight: 1.5, fontStyle: 'italic' }}>{cp.exemplo_bom}</div>
                </div>
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-3)' }}>
                <strong style={{ color: 'var(--text-2)' }}>Quando:</strong> {cp.quando_usar}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
