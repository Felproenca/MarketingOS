import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import Home from './pages/Home'
import Hub from './pages/Hub'
import SiteGeral from './pages/hub/SiteGeral'
import SiteBuild from './pages/hub/SiteBuild'
import Social from './pages/hub/Social'
import Trafego from './pages/hub/Trafego'
import Aquisicao from './pages/hub/Aquisicao'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/hub" element={<Hub />} />
        <Route path="/hub/site" element={<SiteGeral />} />
        <Route path="/hub/build" element={<SiteBuild />} />
        <Route path="/hub/social" element={<Social />} />
        <Route path="/hub/trafego" element={<Trafego />} />
        <Route path="/hub/aquisicao" element={<Aquisicao />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
