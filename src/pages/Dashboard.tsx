import { useState, useEffect } from 'react'
import { InsightCard } from '@/components/ui/insight-card'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
    CheckCircle2,
    Loader2,
    Calendar,
    Heart,
    Stethoscope,
    Users,
    Brain,
    Dumbbell,
    Plus,
    Book
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { habitosAPI, agendaAPI, focoAPI, servicoMedicoAPI, familiaAPI, casamentoAPI } from '@/lib/api'

export function Dashboard() {
    const [loading, setLoading] = useState(true)
    const [dashboardData, setDashboardData] = useState<any>({
        habitos: [],
        eventos: [],
        sessoesFoco: [],
        servicoMedicoStats: null,
        familiaData: [],
        casamentoStats: null,
    })
    const navigate = useNavigate()

    useEffect(() => {
        carregarDados()

        const handleUpdate = () => {
            carregarDados()
        }

        window.addEventListener('habit-updated', handleUpdate)
        return () => window.removeEventListener('habit-updated', handleUpdate)
    }, [])

    const carregarDados = async () => {
        try {
            setLoading(true)

            const hoje = new Date()
            const inicioHoje = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate()).toISOString()
            // Buscar eventos dos próximos 7 dias
            const fimProximos7Dias = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate() + 7).toISOString()

            const [habitosRes, eventosRes, focoRes, medicoRes, familiaRes, casamentoRes] = await Promise.all([
                habitosAPI.listar().catch(() => ({ data: [] })),
                // Usa listarTodos para buscar eventos agregados de todos os módulos
                agendaAPI.listarTodos({ inicio: inicioHoje, fim: fimProximos7Dias }).catch(() => ({ data: [] })),
                focoAPI.listarSessoes().catch(() => ({ data: [] })),
                servicoMedicoAPI.estatisticas().catch(() => ({ data: null })),
                familiaAPI.listarMembros().catch(() => ({ data: [] })),
                casamentoAPI.estatisticas().catch(() => ({ data: null })),
            ])

            setDashboardData({
                habitos: habitosRes.data || [],
                eventos: eventosRes.data || [],
                sessoesFoco: focoRes.data || [],
                servicoMedicoStats: medicoRes.data,
                familiaData: familiaRes.data || [],
                casamentoStats: casamentoRes.data,
            })
        } catch (error) {
            console.error('Erro ao carregar dashboard:', error)
        } finally {
            setLoading(false)
        }
    }

    const calcularPontuacaoVida = () => {
        let pontos = 0
        let fatores = 0

        if (dashboardData.habitos.length > 0) {
            const completados = dashboardData.habitos.filter((h: any) => h.completoHoje).length
            pontos += (completados / dashboardData.habitos.length) * 30
            fatores++
        }

        if (dashboardData.sessoesFoco.length > 0) {
            const minutos = dashboardData.sessoesFoco.reduce((sum: number, s: any) => sum + (s.duracao || 0), 0)
            pontos += Math.min((minutos / 180) * 25, 25)
            fatores++
        }

        if (dashboardData.casamentoStats?.qualidadeMedia) {
            pontos += (dashboardData.casamentoStats.qualidadeMedia / 10) * 25
            fatores++
        }

        if (dashboardData.servicoMedicoStats?.valorReceber) {
            pontos += Math.min((dashboardData.servicoMedicoStats.valorReceber / 10000) * 20, 20)
            fatores++
        }

        return fatores > 0 ? Math.round(pontos) : 0
    }

    const habitosCompletos = dashboardData.habitos.filter((h: any) => h.completoHoje).length
    const totalHabitos = dashboardData.habitos.length
    const tempoFoco = dashboardData.sessoesFoco.reduce((sum: number, s: any) => sum + (s.duracao || 0), 0)
    const horasFoco = Math.floor(tempoFoco / 60)
    const minutosFoco = tempoFoco % 60

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader2 className="h-8 w-8 animate-spin text-primary-green" />
            </div>
        )
    }

    return (
        <div className="space-y-xl">
            <div>
                <h1 className="text-h1 font-bold text-text-primary mb-sm">
                    Bem-vindo de volta! 👋
                </h1>
                <p className="text-body-lg text-text-secondary">
                    Aqui está um resumo do seu progresso hoje
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-lg">
                <InsightCard
                    valor={calcularPontuacaoVida().toString()}
                    unidade="%"
                    titulo="Pontuação de Vida"
                    descricao="Baseada em hábitos, foco, relacionamento e finanças"
                    tendencia={{ direcao: 'cima', valor: 12 }}
                    gradiente="green-gold"
                />

                <InsightCard
                    valor={habitosCompletos.toString()}
                    unidade={`/${totalHabitos}`}
                    titulo="Hábitos Completados"
                    descricao={`Você completou ${totalHabitos > 0 ? Math.round((habitosCompletos / totalHabitos) * 100) : 0}% hoje`}
                    tendencia={habitosCompletos >= totalHabitos / 2 ? { direcao: 'cima', valor: 5 } : undefined}
                    gradiente="teal"
                />

                <InsightCard
                    valor={horasFoco.toString()}
                    unidade={`h ${minutosFoco}m`}
                    titulo="Tempo de Foco"
                    descricao="Total de tempo em flow state hoje"
                    tendencia={{ direcao: 'cima', valor: 18 }}
                    gradiente="purple"
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-md">
                <Card
                    className="cursor-pointer hover:border-accent-error transition-all"
                    onClick={() => navigate('/servico-medico')}
                >
                    <CardContent className="p-lg">
                        <div className="flex items-center justify-between mb-3">
                            <Stethoscope className="text-accent-error" size={32} />
                            <span className="text-caption text-text-secondary">
                                {dashboardData.servicoMedicoStats?.totalPlantoes || 0} plantões
                            </span>
                        </div>
                        <h3 className="text-body-lg font-semibold text-text-primary mb-2">
                            Serviço Médico
                        </h3>
                        <p className="text-h3 font-bold text-primary-gold mb-1">
                            R$ {dashboardData.servicoMedicoStats?.valorReceber?.toFixed(2) || '0.00'}
                        </p>
                        <p className="text-caption text-text-secondary">a receber</p>
                    </CardContent>
                </Card>

                <Card
                    className="cursor-pointer hover:border-primary-teal transition-all"
                    onClick={() => navigate('/familia')}
                >
                    <CardContent className="p-lg">
                        <div className="flex items-center justify-between mb-3">
                            <Users className="text-primary-teal" size={32} />
                            <span className="text-caption text-text-secondary">
                                {dashboardData.familiaData.length} membros
                            </span>
                        </div>
                        <h3 className="text-body-lg font-semibold text-text-primary mb-2">
                            Família
                        </h3>
                        <p className="text-body text-text-secondary">
                            Gestão familiar integral
                        </p>
                    </CardContent>
                </Card>

                <Card
                    className="cursor-pointer hover:border-pink-400 transition-all"
                    onClick={() => navigate('/casamento')}
                >
                    <CardContent className="p-lg">
                        <div className="flex items-center justify-between mb-3">
                            <Heart className="text-pink-400" size={32} />
                            <span className="text-caption text-text-secondary">
                                {dashboardData.casamentoStats?.totalCheckins || 0} check-ins
                            </span>
                        </div>
                        <h3 className="text-body-lg font-semibold text-text-primary mb-2">
                            Casamento
                        </h3>
                        <p className="text-h3 font-bold text-pink-400 mb-1">
                            {dashboardData.casamentoStats?.qualidadeMedia?.toFixed(1) || '-'}/10
                        </p>
                        <p className="text-caption text-text-secondary">qualidade média</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-lg">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <CheckCircle2 className="text-primary-green" size={24} />
                            Hábitos de Hoje
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {dashboardData.habitos.length === 0 ? (
                            <p className="text-center text-text-secondary py-8">
                                Nenhum hábito cadastrado
                            </p>
                        ) : (
                            <div className="space-y-md">
                                {dashboardData.habitos.slice(0, 5).map((habit: any) => (
                                    <div key={habit.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/5">
                                        <div className={`w-6 h-6 rounded-full flex items-center justify-center ${habit.completoHoje ? 'bg-accent-success' : 'bg-white/10'
                                            }`}>
                                            {habit.completoHoje && <CheckCircle2 size={16} className="text-background" />}
                                        </div>
                                        <span className="text-body text-text-primary">
                                            {habit.icone} {habit.nome}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Calendar className="text-primary-blue" size={24} />
                            Próximos Eventos
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {dashboardData.eventos.length === 0 ? (
                            <p className="text-center text-text-secondary py-8">
                                Nenhum evento nos próximos 7 dias
                            </p>
                        ) : (
                            <div className="space-y-md">
                                {dashboardData.eventos.slice(0, 5).map((event: any) => {
                                    const eventDate = new Date(event.dataHoraInicio || event.inicio)
                                    const today = new Date()
                                    const tomorrow = new Date(today)
                                    tomorrow.setDate(tomorrow.getDate() + 1)

                                    const isToday = eventDate.toDateString() === today.toDateString()
                                    const isTomorrow = eventDate.toDateString() === tomorrow.toDateString()
                                    const dateLabel = isToday ? 'Hoje' : isTomorrow ? 'Amanhã' : eventDate.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: 'short' })

                                    // Cor baseada no tipo do evento
                                    const getEventColor = (tipo: string) => {
                                        switch (tipo) {
                                            case 'plantao': return 'bg-red-500'
                                            case 'tarefa': return 'bg-blue-500'
                                            case 'consulta': return 'bg-pink-500'
                                            case 'fatura_cartao': return 'bg-yellow-500'
                                            case 'conta_pagar': return 'bg-orange-500'
                                            case 'conta_receber': return 'bg-green-500'
                                            default: return event.cor || 'bg-primary-blue'
                                        }
                                    }

                                    return (
                                        <div key={event.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 cursor-pointer" onClick={() => navigate('/agenda')}>
                                            <div className={`w-1 h-12 rounded-full ${getEventColor(event.tipo)}`} />
                                            <div className="flex-1 min-w-0">
                                                <p className="text-body font-medium text-text-primary truncate">{event.titulo}</p>
                                                <div className="flex items-center gap-2 text-caption text-text-secondary">
                                                    <span className={isToday ? 'text-accent-success font-medium' : ''}>{dateLabel}</span>
                                                    {!event.diaInteiro && (
                                                        <>
                                                            <span>•</span>
                                                            <span>{eventDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })}
                                {dashboardData.eventos.length > 5 && (
                                    <button
                                        onClick={() => navigate('/agenda')}
                                        className="w-full text-center text-caption text-primary-blue hover:underline py-2"
                                    >
                                        Ver mais {dashboardData.eventos.length - 5} eventos
                                    </button>
                                )}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Ações Rápidas</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-md">
                        <Button
                            className="h-auto flex flex-col items-center gap-2 py-4"
                            onClick={() => navigate('/projetos')}
                        >
                            <Plus size={24} />
                            <span className="text-body">Nova Tarefa</span>
                        </Button>
                        <Button
                            className="h-auto flex flex-col items-center gap-2 py-4"
                            variant="secondary"
                            onClick={() => navigate('/treinos')}
                        >
                            <Dumbbell size={24} />
                            <span className="text-body">Registrar Treino</span>
                        </Button>
                        <Button
                            className="h-auto flex flex-col items-center gap-2 py-4"
                            variant="outline"
                            onClick={() => navigate('/leitura')}
                        >
                            <Book size={24} />
                            <span className="text-body">Sessão Leitura</span>
                        </Button>
                        <Button
                            className="h-auto flex flex-col items-center gap-2 py-4"
                            variant="outline"
                            onClick={() => navigate('/foco')}
                        >
                            <Brain size={24} />
                            <span className="text-body">Iniciar Pomodoro</span>
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
