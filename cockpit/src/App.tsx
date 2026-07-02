import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import Dashboard from './pages/Dashboard'
import Missoes from './pages/Missoes'
import NovaMissao from './pages/NovaMissao'
import MissaoDetail from './pages/MissaoDetail'
import Clientes from './pages/Clientes'
import Aquisicao from './pages/Aquisicao'
import Conteudo from './pages/Conteudo'
import Biblioteca from './pages/Biblioteca'
import Logs from './pages/Logs'

export default function App() {
  return (
    <BrowserRouter>
      <div style={{ display: 'flex', minHeight: '100svh', background: 'var(--bg-base)' }}>
        <Sidebar />
        <main style={{ flex: 1, display: 'flex', minHeight: '100svh' }}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/missoes" element={<Missoes />} />
            <Route path="/missoes/nova" element={<NovaMissao />} />
            <Route path="/missoes/:id" element={<MissaoDetail />} />
            <Route path="/clientes" element={<Clientes />} />
            <Route path="/aquisicao" element={<Aquisicao />} />
            <Route path="/conteudo" element={<Conteudo />} />
            <Route path="/biblioteca" element={<Biblioteca />} />
            <Route path="/logs" element={<Logs />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}
