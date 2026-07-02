import { motion, useScroll, useTransform } from 'framer-motion'
import { Link } from 'react-router-dom'

export default function Navbar() {
  const { scrollY } = useScroll()
  const bg = useTransform(scrollY, [0, 80], ['rgba(9,9,13,0)', 'rgba(9,9,13,0.92)'])
  const blur = useTransform(scrollY, [0, 80], ['blur(0px)', 'blur(20px)'])
  const borderOpacity = useTransform(scrollY, [0, 80], [0, 1])

  return (
    <motion.nav
      style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 6vw', height: 64,
        backgroundColor: bg,
        backdropFilter: blur,
      }}
    >
      <motion.div style={{ borderBottom: `1px solid rgba(26,26,38,${borderOpacity})`, position: 'absolute', bottom: 0, left: 0, right: 0, height: 1 }} />

      {/* Logo */}
      <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'baseline', gap: 2 }}>
        <span style={{ fontFamily: "'Anton', sans-serif", fontSize: 18, color: 'var(--text)', letterSpacing: '0.04em' }}>
          MARKETING
        </span>
        <span style={{ fontFamily: "'Anton', sans-serif", fontSize: 18, color: 'var(--accent)', letterSpacing: '0.04em' }}>
          /OS
        </span>
      </Link>

      {/* Links */}
      <div style={{ display: 'flex', gap: 28, alignItems: 'center' }}>
        <Link
          to="/hub"
          style={{
            fontFamily: 'monospace', fontSize: 10, letterSpacing: '0.1em',
            color: 'var(--accent)', textDecoration: 'none',
            padding: '4px 12px', border: '1px solid rgba(212,255,0,0.25)',
            background: 'rgba(212,255,0,0.06)', borderRadius: 20,
            textTransform: 'uppercase',
          }}
        >
          HUB
        </Link>
        <a
          href="#sistema"
          style={{ fontSize: 13, color: 'var(--text-2)', textDecoration: 'none', fontWeight: 500, transition: 'color 0.15s' }}
          onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = 'var(--text)'}
          onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = 'var(--text-2)'}
        >
          Sistema
        </a>
        <a
          href="#processo"
          style={{ fontSize: 13, color: 'var(--text-2)', textDecoration: 'none', fontWeight: 500, transition: 'color 0.15s' }}
          onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = 'var(--text)'}
          onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = 'var(--text-2)'}
        >
          Processo
        </a>
        <motion.a
          href="#contato"
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          style={{
            fontFamily: "'Anton', sans-serif", fontSize: 13, letterSpacing: '0.06em',
            color: '#000', padding: '9px 20px',
            textDecoration: 'none',
            background: 'var(--accent)',
          }}
        >
          DIAGNÓSTICO
        </motion.a>
      </div>
    </motion.nav>
  )
}
