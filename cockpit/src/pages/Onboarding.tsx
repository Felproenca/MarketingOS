import { Link } from 'react-router-dom'
import { ArrowRight, BarChart3, LockKeyhole, Sparkles } from 'lucide-react'
import { getSession } from '../lib/auth'

export default function Onboarding() {
  const session = getSession()
  const clientId = new URLSearchParams(window.location.search).get('client_id') || 'felipe-proenca'
  const firstName = session?.user?.email?.split('@')[0] || 'bem-vindo'
  return <main className="onboarding-page"><div className="onboarding-top"><div className="brand-mark">MK<span>/</span>OS</div><span><LockKeyhole size={14} /> espaço privado</span></div><section className="onboarding-content"><div className="onboarding-kicker"><Sparkles size={14} /> PRIMEIRO ACESSO</div><h1>Olá, <em>{firstName}.</em><br />vamos começar.</h1><p>Este é o seu espaço de crescimento. Aqui você vai acompanhar o que está acontecendo, entender os sinais e decidir os próximos movimentos com dados reais.</p><div className="onboarding-points"><div><BarChart3 size={18} /><span><b>Dados organizados</b><small>Instagram, anúncios e outras fontes em um só lugar.</small></span></div><div><LockKeyhole size={18} /><span><b>Conexões seguras</b><small>Você autoriza cada plataforma sem compartilhar sua senha.</small></span></div></div><Link className="onboarding-cta" to={`/conectar?client_id=${encodeURIComponent(clientId)}`}>Conectar minhas fontes <ArrowRight size={17} /></Link><small className="onboarding-note">Você poderá conectar ou revogar fontes a qualquer momento.</small></section><div className="onboarding-footer">MARKETINGOS · DATA NOW</div></main>
}
