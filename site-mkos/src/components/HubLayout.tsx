import { useEffect } from 'react'
import type { ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useLenis } from '../lib/useLenis'
import { useCursorSpotlight } from '../lib/useMousePosition'

const NAV_MODULES = [
  { href: '/hub/site',      label: 'SITE INTELIGENTE' },
  { href: '/hub/build',     label: 'SITE BUILD' },
  { href: '/hub/social',    label: 'SOCIAL AGENT' },
  { href: '/hub/trafego',   label: 'TRÁFEGO' },
  { href: '/hub/aquisicao', label: 'AQUISIÇÃO' },
]

export default function HubLayout({ children }: { children: ReactNode }) {
  useLenis()
  useCursorSpotlight()

  const { pathname } = useLocation()

  useEffect(() => { window.scrollTo(0, 0) }, [pathname])

  return (
    <>
      <div className="cursor-spotlight" />
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 200,
        padding: '0 6vw',
        display: 'flex', alignItems: 'center', gap: 0,
        background: 'rgba(9,9,13,0.94)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid var(--border)',
        height: 58,
      }}>
        <Link to="/" style={{
          fontFamily: 'Anton, sans-serif', fontSize: 18, letterSpacing: '0.04em',
          color: 'var(--text)', textDecoration: 'none', marginRight: 32, flexShrink: 0,
        }}>
          MARKETING<span style={{ color: 'var(--accent)' }}>/OS</span>
        </Link>

        <div style={{ width: 1, height: 24, background: 'var(--border)', marginRight: 32 }} />

        <Link to="/hub" style={{
          fontFamily: 'monospace', fontSize: 10, letterSpacing: '0.12em',
          color: pathname === '/hub' ? 'var(--accent)' : 'var(--text-2)',
          textDecoration: 'none', marginRight: 28, textTransform: 'uppercase',
        }}>
          HUB
        </Link>

        <div style={{ display: 'flex', gap: 20, overflowX: 'auto' }}>
          {NAV_MODULES.map(m => (
            <Link key={m.href} to={m.href} style={{
              fontFamily: 'monospace', fontSize: 9, letterSpacing: '0.1em',
              color: pathname === m.href ? 'var(--accent)' : 'var(--text-3)',
              textDecoration: 'none', textTransform: 'uppercase', whiteSpace: 'nowrap',
              paddingBottom: 2,
              borderBottom: pathname === m.href ? '1px solid var(--accent)' : '1px solid transparent',
              transition: 'color 0.2s, border-color 0.2s',
            }}>
              {m.label}
            </Link>
          ))}
        </div>

        <div style={{ marginLeft: 'auto', flexShrink: 0 }}>
          <Link to="/#cta" style={{
            fontFamily: 'Anton, sans-serif', fontSize: 11, letterSpacing: '0.08em',
            color: '#000', background: 'var(--accent)',
            padding: '8px 18px', textDecoration: 'none',
            display: 'inline-block',
          }}>
            DIAGNÓSTICO
          </Link>
        </div>
      </nav>

      <main style={{ paddingTop: 58 }}>
        {children}
      </main>

      <footer style={{
        padding: '32px 6vw',
        borderTop: '1px solid var(--border)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16,
        fontFamily: 'monospace', fontSize: 9, letterSpacing: '0.1em', color: 'var(--text-3)',
        textTransform: 'uppercase',
      }}>
        <span>MARKETING/OS © 2026 — SISTEMA OPERACIONAL DE AQUISIÇÃO</span>
        <div style={{ display: 'flex', gap: 28 }}>
          {NAV_MODULES.map(m => (
            <Link key={m.href} to={m.href} style={{ color: 'var(--text-3)', textDecoration: 'none', transition: 'color 0.2s' }}>
              {m.label}
            </Link>
          ))}
        </div>
      </footer>
    </>
  )
}
