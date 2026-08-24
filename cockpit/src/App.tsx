import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import type { ReactNode } from 'react'
import Sidebar from './components/Sidebar'
import Dashboard from './pages/Dashboard'
import Missoes from './pages/Missoes'
import NovaMissao from './pages/NovaMissao'
import MissaoDetail from './pages/MissaoDetail'
import Clientes from './pages/Clientes'
import Operacao from './pages/Operacao'
import Aquisicao from './pages/Aquisicao'
import Conteudo from './pages/Conteudo'
import Biblioteca from './pages/Biblioteca'
import Logs from './pages/Logs'
import ConectarDados from './pages/ConectarDados'
import Login, { ClientLogin } from './pages/Login'
import Portal from './pages/Portal'
import PortalCliente from './pages/PortalCliente'
import RequestDetail from './pages/RequestDetail'
import Onboarding from './pages/Onboarding'
import { getSession } from './lib/auth'

function Protected({ children }: { children: ReactNode }) {
  return getSession() ? <>{children}</> : <Navigate to="/login" replace />
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/login/cliente" element={<ClientLogin />} />
        <Route path="/portal/:slug" element={<Protected><PortalCliente /></Protected>} />
        <Route path="/dados/:slug" element={<Protected><PortalCliente /></Protected>} />
        <Route path="/portal" element={<Protected><Portal /></Protected>} />
        <Route path="/onboarding" element={<Protected><Onboarding /></Protected>} />
        <Route path="*" element={<Protected><div style={{ display: 'flex', minHeight: '100svh', background: 'var(--bg-base)', width: '100%' }}><Sidebar /><main style={{ flex: 1, display: 'flex', minHeight: '100svh' }}><Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/missoes" element={<Missoes />} />
            <Route path="/missoes/nova" element={<NovaMissao />} />
            <Route path="/missoes/:id" element={<MissaoDetail />} />
            <Route path="/clientes" element={<Clientes />} />
            <Route path="/operacao" element={<Operacao />} />
            <Route path="/operacao/:id" element={<RequestDetail />} />
            <Route path="/aquisicao" element={<Aquisicao />} />
            <Route path="/conteudo" element={<Conteudo />} />
            <Route path="/biblioteca" element={<Biblioteca />} />
            <Route path="/logs" element={<Logs />} />
            <Route path="/conectar" element={<ConectarDados />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes></main></div></Protected>} />
      </Routes>
    </BrowserRouter>
  )
}
