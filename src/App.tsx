import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { FinanceProvider } from '@/context/FinanceContext'
import Layout from '@/components/Layout'

// Pages
import Index from '@/pages/Index'
import Receitas from '@/pages/Receitas'
import Despesas from '@/pages/Despesas'
import Categorias from '@/pages/Categorias'
import Metas from '@/pages/Metas'
import OrcamentoMensal from '@/pages/OrcamentoMensal'
import Relatorios from '@/pages/Relatorios'
import Configuracoes from '@/pages/Configuracoes'
import PerfilUsuario from '@/pages/PerfilUsuario'
import NotFound from '@/pages/NotFound'

const App = () => (
  <BrowserRouter
    future={{ v7_startTransition: false, v7_relativeSplatPath: false }}
  >
    <TooltipProvider>
      <FinanceProvider>
        <Toaster />
        <Sonner />
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Index />} />
            <Route path="/receitas" element={<Receitas />} />
            <Route path="/despesas" element={<Despesas />} />
            <Route path="/categorias" element={<Categorias />} />
            <Route path="/metas" element={<Metas />} />
            <Route path="/orcamento" element={<OrcamentoMensal />} />
            <Route path="/relatorios" element={<Relatorios />} />
            <Route path="/configuracoes" element={<Configuracoes />} />
            <Route path="/perfil" element={<PerfilUsuario />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </FinanceProvider>
    </TooltipProvider>
  </BrowserRouter>
)

export default App
