import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard, Crosshair, Users, BookOpen,
  Radar, FileText, Activity, Zap
} from 'lucide-react'

const NAV = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { to: '/missoes', label: 'Missões', icon: Crosshair },
  { to: '/clientes', label: 'Clientes', icon: Users },
  { to: '/aquisicao', label: 'Aquisição', icon: Radar },
  { to: '/conteudo', label: 'Conteúdo', icon: FileText },
  { to: '/biblioteca', label: 'Biblioteca', icon: BookOpen },
  { to: '/logs', label: 'Logs', icon: Activity },
]

export default function Sidebar() {
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
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--green)' }} className="pulse" />
          <span style={{ fontFamily: 'var(--f-mono)', fontSize: 10, color: 'var(--text-2)', letterSpacing: '0.05em' }}>
            SISTEMA ONLINE
          </span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto" style={{ padding: '8px 8px' }}>
        {NAV.map(({ to, label, icon: Icon, exact }) => (
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
      </div>
    </aside>
  )
}
