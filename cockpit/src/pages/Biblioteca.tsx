import { useState } from 'react'
import { BookOpen, Code2, Layers, Type, Zap } from 'lucide-react'
import { REFERENCES } from '../data/references'
import { MOTION_PATTERNS } from '../data/motionPatterns'
import { COPY_PATTERNS } from '../data/copyPatterns'

type Tab = 'referencias' | 'motion' | 'copy'

const TABS: { id: Tab; icon: React.ReactNode; label: string; count: number }[] = [
  { id: 'referencias', icon: <BookOpen size={12} />, label: 'REFERÊNCIAS', count: REFERENCES.length },
  { id: 'motion', icon: <Zap size={12} />, label: 'MOTION PATTERNS', count: MOTION_PATTERNS.length },
  { id: 'copy', icon: <Type size={12} />, label: 'COPY PATTERNS', count: COPY_PATTERNS.length },
]

const s = {
  page: { flex: 1, overflowY: 'auto' as const, padding: '28px 30px 90px', maxWidth: 1180, width: '100%' },
  panel: { background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 13, padding: 18, marginBottom: 12 },
  label: { fontFamily: 'var(--f-mono)', fontSize: 10, color: 'var(--text-3)', letterSpacing: '0.08em', textTransform: 'uppercase' as const, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 7 },
  tag: { fontFamily: 'var(--f-mono)', fontSize: 9, letterSpacing: '0.06em', padding: '3px 8px', borderRadius: 5, border: '1px solid var(--border)' },
  code: { fontFamily: 'var(--f-mono)', fontSize: 10.5, lineHeight: 1.6, padding: '10px 12px', background: 'var(--bg-panel)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--cyan)', wordBreak: 'break-all' as const },
}

export default function Biblioteca() {
  const [tab, setTab] = useState<Tab>('referencias')

  return (
    <div style={s.page}>
      <header style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 20, marginBottom: 24, flexWrap: 'wrap' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, color: 'var(--text-3)', font: '10px var(--f-mono)', letterSpacing: '0.1em', marginBottom: 8 }}>
            <Layers size={12} /> ARSENAL CRIATIVO
          </div>
          <h1 style={{ fontFamily: 'var(--f-display)', fontSize: 34, color: 'var(--text)', lineHeight: 1, marginBottom: 6, letterSpacing: '0.01em' }}>BIBLIOTECA</h1>
          <div style={{ fontFamily: 'var(--f-mono)', fontSize: 10, color: 'var(--text-3)', letterSpacing: '0.06em' }}>REFERÊNCIAS DE PRODUTO · MOTION · COPY — USADAS PELO EXECUTOR</div>
        </div>
      </header>

      <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap', marginBottom: 18 }}>
        {TABS.map(item => {
          const active = tab === item.id
          return (
            <button
              key={item.id}
              onClick={() => setTab(item.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '8px 14px', borderRadius: 999, cursor: 'pointer',
                background: active ? 'var(--accent)' : 'var(--bg-card)',
                color: active ? '#070907' : 'var(--text-2)',
                border: `1px solid ${active ? 'var(--accent)' : 'var(--border-bright)'}`,
                fontFamily: 'var(--f-mono)', fontSize: 10.5, letterSpacing: '0.05em',
                fontWeight: active ? 700 : 400, transition: 'all 0.15s',
              }}
            >
              {item.icon} {item.label}
              <span style={{ opacity: 0.55 }}>{item.count}</span>
            </button>
          )
        })}
      </div>

      {tab === 'referencias' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 12 }}>
          {REFERENCES.map(ref => (
            <div key={ref.id} style={{ ...s.panel, marginBottom: 0, display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10, marginBottom: 8 }}>
                <div>
                  <div style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--text)' }}>{ref.nome}</div>
                  {ref.url && <div style={{ fontFamily: 'var(--f-mono)', fontSize: 10, color: 'var(--text-3)', marginTop: 3 }}>{ref.url}</div>}
                </div>
                <span style={{ ...s.tag, color: 'var(--cyan)', borderColor: 'rgba(0,212,255,.3)', background: 'rgba(0,212,255,.07)' }}>{ref.categoria}</span>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 10 }}>
                {ref.setor.map(segment => (
                  <span key={segment} style={{ ...s.tag, color: 'var(--text-3)', background: 'var(--bg-hover)' }}>{segment}</span>
                ))}
              </div>
              <ul style={{ listStyle: 'none', padding: 0, marginTop: 'auto' }}>
                {ref.o_que_aproveitar.map(item => (
                  <li key={item} style={{ fontSize: 11, color: 'var(--text-2)', marginBottom: 4, paddingLeft: 12, position: 'relative', lineHeight: 1.5 }}>
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {MOTION_PATTERNS.map(pattern => (
            <div key={pattern.id} style={s.panel}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
                <div style={{ fontFamily: 'var(--f-display)', fontSize: 30, color: 'var(--accent)', lineHeight: 1, flexShrink: 0, letterSpacing: '0.02em' }}>
                  {String(pattern.codigo.split('_')[1] || '—')}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 9, flexWrap: 'wrap', marginBottom: 6 }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>{pattern.nome}</span>
                    <span style={{ ...s.tag, color: 'var(--text-3)', background: 'var(--bg-hover)' }}>{pattern.codigo}</span>
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-2)', lineHeight: 1.6, marginBottom: 8 }}>{pattern.descricao}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-3)', marginBottom: 8 }}>
                    <strong style={{ color: 'var(--text-2)' }}>Uso:</strong> {pattern.uso}
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: pattern.framerSnippet ? 10 : 0 }}>
                    {pattern.indicado.map(segment => (
                      <span key={segment} style={{ ...s.tag, color: 'var(--green)', borderColor: 'rgba(0,255,136,.25)', background: 'rgba(0,255,136,.06)' }}>{segment}</span>
                    ))}
                  </div>
                  {pattern.framerSnippet && <div style={{ ...s.code, marginTop: 10 }}>{pattern.framerSnippet}</div>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'copy' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {COPY_PATTERNS.map(pattern => (
            <div key={pattern.id} style={s.panel}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', marginBottom: 10 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>{pattern.nome}</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                  {pattern.nichos.map(niche => (
                    <span key={niche} style={{ ...s.tag, color: 'var(--text-3)', background: 'var(--bg-hover)' }}>{niche}</span>
                  ))}
                </div>
              </div>
              <div style={{ ...s.code, color: 'var(--cyan)', marginBottom: 12, background: 'rgba(0,212,255,.05)' }}>{pattern.estrutura}</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
                <div style={{ padding: '11px 13px', background: 'rgba(255,45,85,.05)', border: '1px solid rgba(255,45,85,.22)', borderRadius: 9 }}>
                  <div style={{ fontFamily: 'var(--f-mono)', fontSize: 9, color: 'var(--red)', marginBottom: 6, letterSpacing: '0.07em' }}>EVITAR</div>
                  <div style={{ fontSize: 12, color: 'var(--text-2)', lineHeight: 1.55, fontStyle: 'italic' }}>{pattern.exemplo_ruim}</div>
                </div>
                <div style={{ padding: '11px 13px', background: 'rgba(0,255,136,.05)', border: '1px solid rgba(0,255,136,.22)', borderRadius: 9 }}>
                  <div style={{ fontFamily: 'var(--f-mono)', fontSize: 9, color: 'var(--green)', marginBottom: 6, letterSpacing: '0.07em' }}>USAR</div>
                  <div style={{ fontSize: 12, color: 'var(--text)', lineHeight: 1.55, fontStyle: 'italic' }}>{pattern.exemplo_bom}</div>
                </div>
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-3)' }}>
                <strong style={{ color: 'var(--text-2)' }}>Quando:</strong> {pattern.quando_usar}
              </div>
            </div>
          ))}
        </div>
      )}

      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 14, color: 'var(--text-3)', fontFamily: 'var(--f-mono)', fontSize: 10 }}>
        <Code2 size={12} /> Arsenal local compartilhado com o executor (skills/design-brief).
      </div>
    </div>
  )
}
