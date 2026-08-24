import { useEffect, useState } from 'react'
import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard, Crosshair, Users, BookOpen,
  Radar, FileText, Activity, Zap, Link2, GitBranch, Eye, LogOut
} from 'lucide-react'
import { apiFetch, signOut } from '../lib/auth'
import { getClients } from '../lib/api'

const NAV: { to: string; label: string; icon: typeof LayoutDashboard; exact?: boolean; clientOnly?: boolean }[] = [
  { to: '/', label: 'Command Center', icon: LayoutDashboard, exact: true },
  { to: '/missoes', label: 'Missões', icon: Crosshair },
  { to: '/missoes/nova', label: 'Nova solicitação', icon: Zap },
  { to: '/clientes', label: 'Clientes', icon: Users },
  { to: '/operacao', label: 'Operação', icon: GitBranch },
  { to: `/dados/${encodeURIComponent(localStorage.getItem('mkos.client') || '')}`, label: 'Portal do cliente', icon: Eye, clientOnly: true },
  { to: '/aquisicao', label: 'Aquisição', icon: Radar },
  { to: '/conteudo', label: 'Conteúdo', icon: FileText },
  { to: '/biblioteca', label: 'Biblioteca', icon: BookOpen },
  { to: '/logs', label: 'Logs', icon: Activity },
  { to: '/conectar', label: 'Conectar dados', icon: Link2 },
]

export default function Sidebar() {
  const [hardeningReady, setHardeningReady] = useState<boolean | null>(null)
  const [clients, setClients] = useState<{ client_id: string; display_name: string }[]>([])

  useEffect(() => {
    apiFetch('/api/admin/operations').then(async response => {
      if (!response.ok) return
      const body = await response.json().catch(() => ({}))
      setHardeningReady(Boolean(body.systemStatus?.mediaos?.hardening))
    }).catch(() => {})
    getClients().then(d => setClients(d.clients)).catch(() => {})
  }, [])

  return (
    <aside
      style={{ background: 'var(--bg-panel)', borderRight: '1px solid var(--border)', width: 220, flexShrink: 0 }}
      className="flex flex-col h-screen sticky top-0"
    >
      {/* Logo */}
      <div style={{ borderBottom: '1px solid var(--border)', padding: '20px 20px 18px' }}>
        <div className="flex items-baseline gap-1">
          <span
            className="display"
            style={{ fontSize: 20, color: 'var(--text)', letterSpacing: '0.04em', lineHeight: 1 }}
          >
            MARKETING
          </span>
          <span
            style={{ fontFamily: 'var(--f-mono)', fontSize: 11, color: 'var(--accent)', fontWeight: 500, lineHeight: 1 }}
          >
            OS
          </span>
        </div>
        <div style={{ fontFamily: 'var(--f-mono)', fontSize: 10, color: 'var(--text-3)', marginTop: 4, letterSpacing: '0.06em' }}>
          COCKPIT v1.0
        </div>
      </div>

      {/* Status pill */}
      <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)' }}>
        <div className="flex items-center gap-2" style={{ padding: '6px 10px', background: 'var(--bg-card)', borderRadius: 6 }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: hardeningReady === null ? 'var(--text-3)' : hardeningReady ? 'var(--green)' : 'var(--amber)' }} className="pulse" />
          <span style={{ fontFamily: 'var(--f-mono)', fontSize: 10, color: 'var(--text-2)', letterSpacing: '0.05em' }}>
            {hardeningReady === null ? 'VERIFICANDO SISTEMA' : hardeningReady ? 'SISTEMA ONLINE' : 'HARDENING PENDENTE'}
          </span>
        </div>
      </div>

      {/* Cliente atual */}
      <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ fontFamily: 'var(--f-mono)', fontSize: 9, color: 'var(--text-3)', letterSpacing: '0.08em', marginBottom: 6 }}>CLIENTE ATUAL</div>
        <select
          style={{ width: '100%', padding: '8px 9px', border: '1px solid var(--border-bright)', borderRadius: 7, background: 'var(--bg-card)', color: 'var(--text-2)', fontSize: 11, fontFamily: 'var(--f-mono)', outline: 'none' }}
          value={localStorage.getItem('mkos.client') || ''}
          onChange={e => { localStorage.setItem('mkos.client', e.target.value); window.dispatchEvent(new Event('mkos.client')) }}
        >
          <option value="">— sem contexto —</option>
          {clients.map(c => <option key={c.client_id} value={c.client_id}>{c.display_name}</option>)}
        </select>
        {clients.some(c => c.client_id === localStorage.getItem('mkos.client')) && (
          <NavLink to={`/dados/${encodeURIComponent(localStorage.getItem('mkos.client') || '')}`} style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 7, color: 'var(--accent)', fontSize: 10, textDecoration: 'none', fontFamily: 'var(--f-mono)' }}>
            <Eye size={11} /> Ver portal do cliente
          </NavLink>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto" style={{ padding: '8px 8px' }}>
        {NAV.filter(n => !n.clientOnly || Boolean(localStorage.getItem('mkos.client'))).map(({ to, label, icon: Icon, exact }) => (
          <NavLink
            key={to}
            to={to}
            end={exact}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '8px 12px',
              borderRadius: 6,
              marginBottom: 2,
              fontSize: 13,
              fontWeight: 500,
              textDecoration: 'none',
              color: isActive ? 'var(--accent)' : 'var(--text-2)',
              background: isActive ? 'var(--accent-glow)' : 'transparent',
              transition: 'all 0.15s',
            })}
          >
            <Icon size={15} strokeWidth={1.5} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Bottom */}
      <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border)' }}>
        <div className="flex items-center gap-2">
          <Zap size={12} style={{ color: 'var(--accent)' }} />
          <span style={{ fontFamily: 'var(--f-mono)', fontSize: 10, color: 'var(--text-3)' }}>
            Claude Code — Executor
          </span>
        </div>
        <button onClick={() => { signOut(); window.location.href = '/login' }} style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 12, border: 0, background: 'transparent', color: 'var(--text-3)', fontFamily: 'var(--f-mono)', fontSize: 10, cursor: 'pointer', padding: 0 }}>
          <LogOut size={12} /> Sair da sessão
        </button>
      </div>
    </aside>
  )
}
