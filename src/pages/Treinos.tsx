import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Dumbbell, Plus, TrendingUp, Flame, Target } from 'lucide-react'
import { cn } from '@/lib/utils'
import { treinosAPI } from '@/lib/api'

interface Exercicio {
    id: string
    nome: string
    grupoMuscular: string
    series: Serie[]
}

interface Serie {
    reps: number
    peso: number
    completa: boolean
}

interface Treino {
    id: string
    nome: string
    tipo: string
    exercicios: Exercicio[]
    duracao?: number
    volumeTotal?: number
}

interface HistoricoItem {
    data: Date
    treino: string
    duracao: number
    volume: number
}

export function Treinos() {
    const [treinos, setTreinos] = useState<Treino[]>([])
    const [historico, setHistorico] = useState<HistoricoItem[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        carregarDados()
    }, [])

    const carregarDados = async () => {
        try {
            setLoading(true)
            const treinosRes = await treinosAPI.listar()

            // O backend retorna treinos com exercicios como string JSON se não usar include corretamente
            // Mas no backend implementamos include: { exercicios: true }?
            // Verificando backend: treinos.js usa include: { exercicios: true }? Não, usa JSON.parse na leitura se for string.
            // O schema diz que exercicios é String (JSON).

            const treinosFormatados = (treinosRes.data as any).map((t: any) => ({
                id: t.id,
                nome: t.nome,
                tipo: t.tipo,
                exercicios: typeof t.exercicios === 'string' ? JSON.parse(t.exercicios) : t.exercicios || [],
                duracao: t.duracaoEstimada,
                volumeTotal: 0 // Calcular se necessário
            }))

            setTreinos(treinosFormatados)

            // Histórico seria uma tabela separada ou logs de execução de treino.
            // Como não temos tabela de "Execução de Treino" ainda (apenas Treino e Plano),
            // vamos manter o histórico vazio ou mockado por enquanto até implementarmos a execução.
            // O usuário pediu para integrar módulos existentes.

            setHistorico([])

        } catch (error) {
            console.error('Erro ao carregar treinos:', error)
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return <div className="p-8 text-center text-text-secondary">Carregando treinos...</div>
    }

    const treinoAtual = treinos.length > 0 ? treinos[0] : null

    if (!treinoAtual) {
        return (
            <div className="space-y-xl">
                <div>
                    <h1 className="text-h1 font-bold text-text-primary mb-sm">
                        💪 Treinos
                    </h1>
                    <p className="text-body-lg text-text-secondary">
                        Planeje e registre seus treinos
                    </p>
                </div>
                <div className="text-center py-xl">
                    <p className="text-text-secondary mb-md">
                        Nenhum treino encontrado.
                    </p>
                    <Button>
                        <Plus size={16} className="mr-2" />
                        Adicionar Treino
                    </Button>
                </div>
            </div>
        )
    }

    const totalSeries = treinoAtual.exercicios.reduce(
        (acc, ex) => acc + ex.series.length,
        0
    )
    const seriesCompletas = treinoAtual.exercicios.reduce(
        (acc, ex) => acc + ex.series.filter((s) => s.completa).length,
        0
    )
    const progressoTreino = totalSeries > 0 ? (seriesCompletas / totalSeries) * 100 : 0

    return (
        <div className="space-y-xl">
            <div>
                <h1 className="text-h1 font-bold text-text-primary mb-sm">
                    💪 Treinos
                </h1>
                <p className="text-body-lg text-text-secondary">
                    Planeje e registre seus treinos
                </p>
            </div>

            {/* Estatísticas */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-md">
                <Card className="bg-gradient-to-br from-primary-orange/20 to-transparent">
                    <CardContent className="p-lg">
                        <div className="flex items-center justify-between mb-2">
                            <Dumbbell className="text-primary-orange" size={24} />
                            <Flame className="text-primary-orange" size={20} />
                        </div>
                        <p className="text-h2 font-bold text-text-primary">12</p>
                        <p className="text-caption text-text-secondary">Treinos este mês</p>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-accent-success/20 to-transparent">
                    <CardContent className="p-lg">
                        <div className="flex items-center justify-between mb-2">
                            <Target className="text-accent-success" size={24} />
                        </div>
                        <p className="text-h2 font-bold text-text-primary">18.5</p>
                        <p className="text-caption text-text-secondary">Toneladas levantadas</p>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-accent-info/20 to-transparent">
                    <CardContent className="p-lg">
                        <div className="flex items-center justify-between mb-2">
                            <TrendingUp className="text-accent-info" size={24} />
                        </div>
                        <p className="text-h2 font-bold text-text-primary">+12%</p>
                        <p className="text-caption text-text-secondary">Aumento de carga</p>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-primary-gold/20 to-transparent">
                    <CardContent className="p-lg">
                        <div className="flex items-center justify-between mb-2">
                            <Flame className="text-primary-gold" size={24} />
                        </div>
                        <p className="text-h2 font-bold text-text-primary">23</p>
                        <p className="text-caption text-text-secondary">Dias de sequência</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-xl">
                {/* Treino Atual */}
                <div className="lg:col-span-2">
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle>{treinoAtual.nome}</CardTitle>
                                <div className="flex items-center gap-2">
                                    <span className="text-caption text-text-secondary">
                                        {seriesCompletas}/{totalSeries} séries
                                    </span>
                                    <span className="text-h3 font-bold text-accent-success">
                                        {Math.round(progressoTreino)}%
                                    </span>
                                </div>
                            </div>
                            <Progress value={progressoTreino} className="mt-2" />
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-lg">
                                {treinoAtual.exercicios.map((exercicio, exIndex) => (
                                    <div key={exercicio.id} className="glass-card p-md rounded-lg">
                                        <div className="flex items-center gap-3 mb-md">
                                            <div className="w-8 h-8 rounded-full bg-primary-orange/20 flex items-center justify-center">
                                                <span className="text-body font-bold text-primary-orange">
                                                    {exIndex + 1}
                                                </span>
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="text-body-lg font-semibold text-text-primary">
                                                    {exercicio.nome}
                                                </h4>
                                                <p className="text-caption text-text-secondary">
                                                    {exercicio.grupoMuscular}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Tabela de Séries */}
                                        <div className="space-y-2">
                                            <div className="grid grid-cols-4 gap-2 text-caption font-semibold text-text-secondary px-2">
                                                <span>Série</span>
                                                <span className="text-center">Reps</span>
                                                <span className="text-center">Peso (kg)</span>
                                                <span className="text-center">✓</span>
                                            </div>

                                            {exercicio.series.map((serie, serieIndex) => (
                                                <div
                                                    key={serieIndex}
                                                    className={cn(
                                                        'grid grid-cols-4 gap-2 p-2 rounded-lg transition-all',
                                                        serie.completa
                                                            ? 'bg-accent-success/10 border border-accent-success/20'
                                                            : 'bg-white/5 hover:bg-white/10'
                                                    )}
                                                >
                                                    <span className="text-body text-text-primary">
                                                        {serieIndex + 1}ª
                                                    </span>
                                                    <span className="text-body text-text-primary text-center font-semibold">
                                                        {serie.reps}
                                                    </span>
                                                    <span className="text-body text-text-primary text-center font-semibold">
                                                        {serie.peso}
                                                    </span>
                                                    <div className="flex justify-center">
                                                        <button
                                                            className={cn(
                                                                'w-6 h-6 rounded flex items-center justify-center transition-all',
                                                                serie.completa
                                                                    ? 'bg-accent-success text-background'
                                                                    : 'bg-white/10 hover:bg-white/20'
                                                            )}
                                                        >
                                                            {serie.completa && '✓'}
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {treinoAtual.exercicios.length === 0 && (
                                <div className="text-center py-xl">
                                    <p className="text-text-secondary mb-md">
                                        Nenhum exercício adicionado ainda
                                    </p>
                                    <Button>
                                        <Plus size={16} className="mr-2" />
                                        Adicionar Exercício
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Histórico e Planos */}
                <div className="space-y-lg">
                    {/* Plano de Treino */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Plano de Treino</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-md">
                                {treinos.map((treino, index) => (
                                    <button
                                        key={treino.id}
                                        className={cn(
                                            'w-full p-md rounded-lg transition-all text-left',
                                            index === 0
                                                ? 'bg-primary-orange text-white'
                                                : 'bg-white/5 hover:bg-white/10'
                                        )}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-body font-semibold">{treino.nome}</p>
                                                <p className="text-caption opacity-80">{treino.tipo}</p>
                                            </div>
                                            {index === 0 && (
                                                <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                                            )}
                                        </div>
                                    </button>
                                ))}
                            </div>

                            <Button className="w-full mt-md" variant="outline">
                                <Plus size={16} className="mr-2" />
                                Novo Plano
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Histórico */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Histórico Recente</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-md">
                                {historico.map((h, index) => (
                                    <div
                                        key={index}
                                        className="p-md rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                                    >
                                        <p className="text-body font-medium text-text-primary mb-1">
                                            {h.treino}
                                        </p>
                                        <div className="flex items-center justify-between text-caption text-text-secondary">
                                            <span>
                                                {h.data.toLocaleDateString('pt-BR', {
                                                    day: '2-digit',
                                                    month: 'short',
                                                })}
                                            </span>
                                            <span>{h.duracao} min</span>
                                            <span>{h.volume} kg</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
