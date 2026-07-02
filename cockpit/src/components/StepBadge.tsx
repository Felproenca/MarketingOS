import type { StepStatus } from '../types'
import { Check, AlertCircle, Loader } from 'lucide-react'

const CONFIG: Record<StepStatus, { color: string; bg: string; icon: React.ReactNode }> = {
  pending: {
    color: 'var(--text-3)',
    bg: 'var(--bg-hover)',
    icon: <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--text-3)', display: 'inline-block' }} />,
  },
  running: {
    color: 'var(--accent)',
    bg: 'var(--accent-glow)',
    icon: <Loader size={10} className="pulse" />,
  },
  done: {
    color: 'var(--green)',
    bg: 'rgba(0,255,136,0.08)',
    icon: <Check size={10} strokeWidth={2.5} />,
  },
  error: {
    color: 'var(--red)',
    bg: 'rgba(255,45,85,0.08)',
    icon: <AlertCircle size={10} />,
  },
}

interface Props {
  label: string
  status: StepStatus
  index: number
}

export default function StepBadge({ label, status, index }: Props) {
  const { color, bg, icon } = CONFIG[status]
  return (
    <div
      className="flex items-center gap-2"
      style={{
        padding: '5px 10px',
        background: bg,
        border: `1px solid ${color}30`,
        borderRadius: 5,
        fontSize: 11,
        color,
        fontFamily: 'var(--f-mono)',
        fontWeight: status === 'running' ? 500 : 400,
        transition: 'all 0.3s',
      }}
    >
      <span style={{ opacity: 0.4 }}>{String(index).padStart(2, '0')}</span>
      {icon}
      <span>{label}</span>
    </div>
  )
}
