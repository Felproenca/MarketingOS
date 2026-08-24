import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { ArrowRight, Eye, EyeOff, LockKeyhole, Mail, ShieldCheck, Sparkles } from 'lucide-react'
import { restoreSessionFromUrl, resolveHome, sendMagicLink, signIn } from '../lib/auth'

type Mode = 'operator' | 'cliente'

const COPY: Record<Mode, { kicker: string; titleA: string; titleB: string; subtitle: string; privacy: string; proof: string }> = {
  operator: {
    kicker: 'CONSOLE DO OPERADOR',
    titleA: 'Bem-vindo',
    titleB: 'ao console.',
    subtitle: 'Acesse a operação: solicitações, jobs, revisões e saúde do sistema.',
    privacy: 'Acesso restrito à equipe de operação.',
    proof: 'DATA NOW · GROWTH INTELLIGENCE',
  },
  cliente: {
    kicker: 'ESPAÇO DO CLIENTE',
    titleA: 'Seu espaço',
    titleB: 'de crescimento.',
    subtitle: 'Veja seus dados, cotas, entregas e próximos passos — somente o que é seu.',
    privacy: 'Seus dados são protegidos e usados apenas para gerar sua análise.',
    proof: 'SUA CONTA · SEUS DADOS · SEU RESULTADO',
  },
}

export function LoginScreen({ mode }: { mode: Mode }) {
  const copy = COPY[mode]
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const [magic, setMagic] = useState(false)

  useEffect(() => {
    if (!window.location.hash.includes('access_token=')) return
    setBusy(true)
    void (async () => {
      try {
        await restoreSessionFromUrl()
        window.location.href = await resolveHome()
      } catch (error) { setMessage(error instanceof Error ? error.message : 'Não foi possível validar o link.') }
      finally { setBusy(false) }
    })()
  }, [])

  async function submit(event: FormEvent) {
    event.preventDefault(); setBusy(true); setMessage('')
    try {
      if (magic) { await sendMagicLink(email, mode === 'cliente' ? '/login/cliente' : '/login'); setMessage('Link seguro enviado. Verifique seu e-mail para entrar.') }
      else {
        await signIn(email, password)
        window.location.href = await resolveHome()
      }
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Não foi possível entrar.') }
    finally { setBusy(false) }
  }

  return <main className="login-shell">
    <div className="login-orbit orbit-one" /><div className="login-orbit orbit-two" />
    <section className="login-brand">
      <div className="brand-mark">MK<span>/</span>OS</div>
      <div className="brand-line" />
      <p>Inteligência operacional para transformar sinais reais em crescimento.</p>
      <div className="login-proof"><Sparkles size={15} /> {copy.proof}</div>
    </section>
    <section className="login-card">
      <div className="login-card-top"><div className="login-icon">{mode === 'cliente' ? <ShieldCheck size={18} /> : <LockKeyhole size={18} />}</div><span>{copy.kicker}</span></div>
      <h1>{copy.titleA}<br /><em>{copy.titleB}</em></h1>
      <p className="login-subtitle">{copy.subtitle}</p>
      <form onSubmit={submit}>
        <label><span>E-mail</span><div className="login-input"><Mail size={16} /><input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="seu@email.com" required /></div></label>
        {!magic && <label><span>Senha</span><div className="login-input"><LockKeyhole size={16} /><input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="Sua senha" required minLength={6} /><button type="button" onClick={() => setShowPassword(value => !value)} aria-label="Mostrar senha">{showPassword ? <EyeOff size={16} /> : <Eye size={16} />}</button></div></label>}
        {message && <div className="login-message">{message}</div>}
        <button className="login-submit" disabled={busy}>{busy ? 'Aguarde...' : magic ? 'Enviar link seguro' : 'Entrar'} <ArrowRight size={17} /></button>
      </form>
      <button className="login-switch" onClick={() => { setMagic(value => !value); setMessage('') }}>{magic ? 'Entrar com senha' : 'Entrar por link mágico'}</button>
      {mode === 'cliente' && (
        <button className="login-switch" onClick={() => window.location.href = '/login'} style={{ marginTop: 6 }}>Sou da equipe de operação →</button>
      )}
      <small className="login-privacy">{copy.privacy}</small>
    </section>
  </main>
}

export default function Login() { return <LoginScreen mode="operator" /> }
export function ClientLogin() { return <LoginScreen mode="cliente" /> }
