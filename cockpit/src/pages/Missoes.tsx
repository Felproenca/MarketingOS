import { Link } from 'react-router-dom'
import { Plus, Search } from 'lucide-react'
import { useState, useEffect } from 'react'
import MissionCard from '../components/MissionCard'
import { getMissions } from '../lib/api'
import { MOCK_MISSIONS } from '../data/mockData'
import type { Mission, MissionStatus } from '../types'

const STATUS_FILTERS: { value: MissionStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'Todas' },
  { value: 'running', label: 'Executando' },
  { value: 'done', label: 'Concluídas' },
  { value: 'draft', label: 'Rascunhos' },
]

export default function Missoes() {
  const [statusFilter, setStatusFilter] = useState<MissionStatus | 'all'>('all')
  const [search, setSearch] = useState('')
  const [missions, setMissions] = useState<Mission[]>(MOCK_MISSIONS)

  useEffect(() => {
    getMissions().then(setMissions).catch(() => setMissions(MOCK_MISSIONS))
  }, [])

  const filtered = missions.filter(m => {
    if (statusFilter !== 'all' && m.status !== statusFilter) return false
    if (search && !m.nome?.toLowerCase().includes(search.toLowerCase()) && !m.empresa?.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '28px 32px', maxWidth: 1000 }}>
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <div style={{ fontFamily: 'var(--f-mono)', fontSize: 10, color: 'var(--text-3)', letterSpacing: '0.08em', marginBottom: 6 }}>
            OPERAÇÕES
          </div>
          <h1 className="display" style={{ fontSize: 32, color: 'var(--text)', lineHeight: 1 }}>
            MISSÕES
          </h1>
        </div>
        <Link
          to="/missoes/nova"
          className="flex items-center gap-2"
          style={{
            background: 'var(--accent)', color: '#000',
            fontFamily: 'var(--f-display)', fontSize: 14, letterSpacing: '0.04em',
            padding: '10px 18px', borderRadius: 8, textDecoration: 'none',
          }}
        >
          <Plus size={14} strokeWidth={2.5} />
          NOVA MISSÃO
        </Link>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-6">
        {/* Search */}
        <div className="flex items-center gap-2 flex-1" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, padding: '8px 12px', maxWidth: 320 }}>
          <Search size={13} style={{ color: 'var(--text-3)' }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar missão..."
            style={{ background: 'none', border: 'none', outline: 'none', fontSize: 13, color: 'var(--text)', flex: 1 }}
          />
        </div>

        {/* Status pills */}
        <div className="flex gap-2">
          {STATUS_FILTERS.map(f => (
            <button
              key={f.value}
              onClick={() => setStatusFilter(f.value)}
              style={{
                fontFamily: 'var(--f-mono)', fontSize: 11, letterSpacing: '0.04em',
                padding: '6px 12px', borderRadius: 6, border: 'none', cursor: 'pointer',
                background: statusFilter === f.value ? 'var(--accent)' : 'var(--bg-card)',
                color: statusFilter === f.value ? '#000' : 'var(--text-2)',
                fontWeight: statusFilter === f.value ? 700 : 400,
                transition: 'all 0.15s',
              }}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <div className="display" style={{ fontSize: 40, color: 'var(--text-3)', marginBottom: 12 }}>0</div>
          <div style={{ color: 'var(--text-2)', fontSize: 13 }}>Nenhuma missão encontrada.</div>
          <Link to="/missoes/nova" style={{ display: 'inline-block', marginTop: 16, fontFamily: 'var(--f-mono)', fontSize: 11, color: 'var(--accent)', textDecoration: 'none' }}>
            + CRIAR PRIMEIRA MISSÃO
          </Link>
        </div>
      ) : (
        <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))' }}>
          {filtered.map(m => <MissionCard key={m.id} mission={m} />)}
        </div>
      )}
    </div>
  )
}
