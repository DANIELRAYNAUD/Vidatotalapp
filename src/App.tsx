import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AppLayout } from '@/components/layout/AppLayout'
import { Toaster } from '@/components/ui/toaster'
import { AlarmManager } from '@/components/modules/AlarmManager'
import { useAuthStore } from '@/lib/authStore'
import { ProtectedRoute } from '@/components/ProtectedRoute'

// Pages
import { Login } from '@/pages/Login'
import { Register } from '@/pages/Register'
import { Dashboard } from '@/pages/Dashboard'
import { Habitos } from '@/pages/Habitos'
import { Agenda } from '@/pages/Agenda'
import { Financas } from '@/pages/Financas'
import { Projetos } from '@/pages/Projetos'
import { Alimentacao } from '@/pages/Alimentacao'
import { Treinos } from '@/pages/Treinos'
import { Saude } from '@/pages/Saude'
import { Sono } from '@/pages/Sono'
import { Leitura } from '@/pages/Leitura'
import { Idiomas } from '@/pages/Idiomas'
import { Estudos } from '@/pages/Estudos'
import { Notas } from '@/pages/Notas'
import { Foco } from '@/pages/Foco'
import { Metas } from '@/pages/Metas'
import { Configuracoes } from '@/pages/Configuracoes'
import { ServicoSenhor } from '@/pages/ServicoSenhor'
import { ServicoMedico } from '@/pages/ServicoMedico'
import { Familia } from '@/pages/Familia'
import { Casamento } from '@/pages/Casamento'

function App() {
    const checkAuth = useAuthStore((state) => state.checkAuth)

    useEffect(() => {
        checkAuth()
    }, [checkAuth])

    return (
        <BrowserRouter>
            <Routes>
                {/* Rotas Públicas */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* Rotas Privadas */}
                <Route path="/" element={
                    <ProtectedRoute>
                        <AlarmManager />
                        <AppLayout />
                    </ProtectedRoute>
                }>
                    <Route index element={<Dashboard />} />
                    <Route path="habitos" element={<Habitos />} />
                    <Route path="agenda" element={<Agenda />} />
                    <Route path="financas" element={<Financas />} />
                    <Route path="projetos" element={<Projetos />} />
                    <Route path="alimentacao" element={<Alimentacao />} />
                    <Route path="treinos" element={<Treinos />} />
                    <Route path="saude" element={<Saude />} />
                    <Route path="sono" element={<Sono />} />
                    <Route path="leitura" element={<Leitura />} />
                    <Route path="idiomas" element={<Idiomas />} />
                    <Route path="estudos" element={<Estudos />} />
                    <Route path="notas" element={<Notas />} />
                    <Route path="foco" element={<Foco />} />
                    <Route path="metas" element={<Metas />} />
                    <Route path="servico-senhor" element={<ServicoSenhor />} />
                    <Route path="servico-medico" element={<ServicoMedico />} />
                    <Route path="familia" element={<Familia />} />
                    <Route path="casamento" element={<Casamento />} />
                    <Route path="configuracoes" element={<Configuracoes />} />
                </Route>

                {/* Fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
            <Toaster />
        </BrowserRouter>
    )
}

export default App
