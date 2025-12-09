import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import {
    FolderKanban,
    Plus,
    MoreVertical,
    Clock,
    CheckCircle2,
    Circle,
    AlertCircle,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { projetosAPI } from '@/lib/api'

interface Tarefa {
    id: string
    titulo: string
    descricao?: string
    status: 'fazer' | 'fazendo' | 'revisar' | 'feito'
    prioridade: 'baixa' | 'normal' | 'alta' | 'urgente'
    prazo?: Date
    tags?: string[] | any // Backend retorna string JSON ou array dependendo da implementação
    projetoId?: string
}

interface Projeto {
    id: string
    nome: string
    categoria: string
    cor: string
    progresso: number
    tarefas: Tarefa[] // Backend include
    prazo?: Date
}



export function Projetos() {
    const [projetos, setProjetos] = useState<Projeto[]>([])
    const [tarefas, setTarefas] = useState<Tarefa[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        carregarDados()
    }, [])

    const carregarDados = async () => {
        try {
            setLoading(true)
            const projetosRes = await projetosAPI.listar()

            const projetosFormatados = (projetosRes.data as any).map((p: any) => ({
                ...p,
                prazo: p.prazo ? new Date(p.prazo) : undefined,
                tarefas: p.tarefas || []
            }))

            setProjetos(projetosFormatados)

            // Carregar todas as tarefas de todos os projetos (ou endpoint específico se houver)
            // Como não temos endpoint "listar todas tarefas", vamos agregar das tarefas retornadas nos projetos
            // Ou fazer chamadas individuais. O endpoint /projetos já retorna tarefas (include).

            // Se precisarmos de tarefas sem projeto ou uma visão geral, o ideal seria um endpoint específico.
            // Por enquanto, vamos extrair dos projetos.

            // Mas espere, o endpoint /projetos retorna tarefas com select: { id, status }.
            // Se quisermos detalhes para o Kanban, precisamos de mais dados.
            // Vamos ajustar o backend ou fazer chamadas extras.
            // O backend atual retorna: include: { tarefas: { select: { id: true, status: true } } }
            // Isso é insuficiente para o Kanban.

            // WORKAROUND: Vamos buscar tarefas detalhadas de cada projeto.
            const tarefasPromises = projetosFormatados.map((p: any) => projetosAPI.listarTarefas(p.id))
            const tarefasResponses = await Promise.all(tarefasPromises)

            const todasTarefas = tarefasResponses.flatMap((res: any) => res.data).map((t: any) => ({
                ...t,
                prazo: t.prazo ? new Date(t.prazo) : undefined,
                tags: typeof t.tags === 'string' ? JSON.parse(t.tags) : t.tags
            }))

            setTarefas(todasTarefas)

        } catch (error) {
            console.error('Erro ao carregar projetos:', error)
        } finally {
            setLoading(false)
        }
    }

    const colunas = [
        { id: 'fazer', nome: 'A Fazer', icone: Circle },
        { id: 'fazendo', nome: 'Em Andamento', icone: Clock },
        { id: 'revisar', nome: 'Em Revisão', icone: AlertCircle },
        { id: 'feito', nome: 'Concluído', icone: CheckCircle2 },
    ]

    const tarefasPorStatus = (status: string) =>
        tarefas.filter((t) => t.status === status)

    if (loading) {
        return <div className="p-8 text-center text-text-secondary">Carregando projetos...</div>
    }

    return (
        <div className="space-y-xl">
            <div>
                <h1 className="text-h1 font-bold text-text-primary mb-sm">
                    📁 Projetos & Tarefas
                </h1>
                <p className="text-body-lg text-text-secondary">
                    Organize e acompanhe seus projetos
                </p>
            </div>

            {/* Projetos Ativos */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-lg">
                {projetos.map((projeto) => (
                    <Card
                        key={projeto.id}
                        className="hover:scale-[1.02] transition-transform cursor-pointer"
                    >
                        <CardContent className="p-lg">
                            <div className="flex items-start justify-between mb-md">
                                <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center', projeto.cor)}>
                                    <FolderKanban className="text-white" size={24} />
                                </div>
                                <button className="text-text-secondary hover:text-text-primary">
                                    <MoreVertical size={20} />
                                </button>
                            </div>

                            <h3 className="text-h3 font-bold text-text-primary mb-sm">
                                {projeto.nome}
                            </h3>
                            <p className="text-caption text-text-secondary mb-md">
                                {projeto.categoria}
                            </p>

                            <div className="space-y-2">
                                <div className="flex items-center justify-between text-caption">
                                    <span className="text-text-secondary">Progresso</span>
                                    <span className="text-text-primary font-semibold">
                                        {projeto.progresso}%
                                    </span>
                                </div>
                                <Progress value={projeto.progresso} />

                                <div className="flex items-center justify-between text-caption text-text-secondary pt-2">
                                    <span>{projeto.tarefas.length} tarefas</span>
                                    {projeto.prazo && (
                                        <span>
                                            Até{' '}
                                            {projeto.prazo.toLocaleDateString('pt-BR', {
                                                day: '2-digit',
                                                month: 'short',
                                            })}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}

                {/* Card Adicionar Projeto */}
                <Card className="border-2 border-dashed border-white/20 hover:border-white/40 transition-colors cursor-pointer">
                    <CardContent className="p-lg flex flex-col items-center justify-center h-full min-h-[200px]">
                        <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center mb-md">
                            <Plus className="text-text-secondary" size={24} />
                        </div>
                        <p className="text-body text-text-secondary">Novo Projeto</p>
                    </CardContent>
                </Card>
            </div>

            {/* Kanban Board */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle>Quadro Kanban</CardTitle>
                        <Button>
                            <Plus size={16} className="mr-2" />
                            Nova Tarefa
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-md">
                        {colunas.map((coluna) => {
                            const tarefasColuna = tarefasPorStatus(coluna.id)
                            const Icone = coluna.icone

                            return (
                                <div key={coluna.id} className="flex flex-col">
                                    {/* Header da Coluna */}
                                    <div className="flex items-center gap-2 mb-md">
                                        <Icone className="text-text-secondary" size={18} />
                                        <h4 className="text-body font-semibold text-text-primary">
                                            {coluna.nome}
                                        </h4>
                                        <span className="ml-auto text-caption text-text-secondary bg-white/10 px-2 py-0.5 rounded-full">
                                            {tarefasColuna.length}
                                        </span>
                                    </div>

                                    {/* Tarefas da Coluna */}
                                    <div className="space-y-md flex-1">
                                        {tarefasColuna.map((tarefa) => (
                                            <div
                                                key={tarefa.id}
                                                className="glass-card p-md rounded-lg hover:scale-[1.02] transition-transform cursor-pointer"
                                            >
                                                <div className="flex items-start justify-between mb-2">
                                                    <h5 className="text-body font-medium text-text-primary flex-1">
                                                        {tarefa.titulo}
                                                    </h5>
                                                    <div
                                                        className={cn(
                                                            'w-2 h-2 rounded-full ml-2 mt-1',
                                                            tarefa.prioridade === 'urgente' && 'bg-accent-error',
                                                            tarefa.prioridade === 'alta' && 'bg-accent-warning',
                                                            tarefa.prioridade === 'normal' && 'bg-accent-info',
                                                            tarefa.prioridade === 'baixa' && 'bg-text-tertiary'
                                                        )}
                                                    />
                                                </div>

                                                {tarefa.descricao && (
                                                    <p className="text-caption text-text-secondary mb-2">
                                                        {tarefa.descricao}
                                                    </p>
                                                )}

                                                {tarefa.prazo && (
                                                    <div className="flex items-center gap-1 text-caption text-text-secondary mb-2">
                                                        <Clock size={12} />
                                                        {tarefa.prazo.toLocaleDateString('pt-BR', {
                                                            day: '2-digit',
                                                            month: 'short',
                                                        })}
                                                    </div>
                                                )}

                                                {tarefa.tags && tarefa.tags.length > 0 && (
                                                    <div className="flex flex-wrap gap-1">
                                                        {tarefa.tags.map((tag: string) => (
                                                            <span
                                                                key={tag}
                                                                className="text-caption px-2 py-0.5 rounded bg-white/10 text-text-secondary"
                                                            >
                                                                {tag}
                                                            </span>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        ))}

                                        {/* Adicionar Tarefa */}
                                        <button className="w-full p-md rounded-lg border-2 border-dashed border-white/10 hover:border-white/20 transition-colors text-text-secondary hover:text-text-primary text-caption">
                                            + Adicionar
                                        </button>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
