import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { CheckCircle2, Plus, Flame, Loader2, Edit3, Trash2, Calendar, Trophy } from 'lucide-react'
import { cn } from '@/lib/utils'
import { HabitoDialog } from '@/components/modules/HabitoDialog'
import { habitosAPI } from '@/lib/api'
import { useToast } from '@/components/ui/use-toast'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface Habito {
    id: string
    nome: string
    descricao?: string
    icone: string
    cor: string
    categoria: string
    frequencia: 'diaria' | 'semanal' | 'personalizada'
    diasSemana?: number[]
    valorMeta?: number
    lembrete?: boolean
    horarioLembrete?: string
    completoHoje: boolean
    sequencia: number
    registros?: any[]
}

interface Stats {
    totalHabitos: number
    completosHoje: number
    porcentagemHoje: number
    melhorSequencia: number
    habitoMelhorSequencia: string | null
    diasAtivos: number
    meta7Dias: boolean
}

export function Habitos() {
    const [habitos, setHabitos] = useState<Habito[]>([])
    const [stats, setStats] = useState<Stats | null>(null)
    const [loading, setLoading] = useState(true)
    const [dialogOpen, setDialogOpen] = useState(false)
    const [editingHabit, setEditingHabit] = useState<Habito | null>(null)
    const [deleteId, setDeleteId] = useState<string | null>(null)
    const { toast } = useToast()

    const carregarDados = async () => {
        try {
            setLoading(true)

            // Carregar dados independentemente para evitar falha total
            const habitosPromise = habitosAPI.listar().catch(err => {
                console.error('Erro ao listar hábitos:', err)
                return { data: [] }
            })

            const statsPromise = habitosAPI.estatisticas().catch(err => {
                console.error('Erro ao carregar estatísticas:', err)
                return { data: null }
            })

            const [habitosRes, statsRes] = await Promise.all([habitosPromise, statsPromise])

            // Processar dados para incluir status de hoje
            const habitosProcessados = (habitosRes.data as any[]).map((habito: any) => {
                // Verificar se foi completado hoje
                const hoje = new Date()
                hoje.setHours(0, 0, 0, 0)

                const completoHoje = habito.registros?.some((registro: any) => {
                    const dataRegistro = new Date(registro.data)
                    dataRegistro.setHours(0, 0, 0, 0)
                    return dataRegistro.getTime() === hoje.getTime() && registro.completo
                }) || false

                // Calcular sequência (streak)
                const sequencia = calcularSequencia(habito.registros || [])

                return {
                    ...habito,
                    completoHoje,
                    sequencia,
                }
            })

            setHabitos(habitosProcessados)
            if (statsRes.data) {
                setStats(statsRes.data as any)
            }
        } catch (error) {
            console.error('Erro geral ao carregar dados:', error)
            toast({
                title: 'Erro',
                description: 'Não foi possível carregar os dados',
                variant: 'error',
            })
        } finally {
            setLoading(false)
        }
    }

    // Escutar eventos globais de atualização
    useEffect(() => {
        const handleUpdate = () => {
            carregarDados()
        }

        window.addEventListener('habit-updated', handleUpdate)
        return () => window.removeEventListener('habit-updated', handleUpdate)
    }, [])

    const calcularSequencia = (registros: any[]) => {
        if (!registros || registros.length === 0) return 0

        const registrosCompletos = registros
            .filter((r: any) => r.completo)
            .map((r: any) => new Date(r.data))
            .sort((a: any, b: any) => b.getTime() - a.getTime())

        if (registrosCompletos.length === 0) return 0

        let sequencia = 0
        const hoje = new Date()
        hoje.setHours(0, 0, 0, 0)

        for (let i = 0; i < registrosCompletos.length; i++) {
            const dataEsperada = new Date(hoje)
            dataEsperada.setDate(dataEsperada.getDate() - sequencia)
            dataEsperada.setHours(0, 0, 0, 0)

            const dataRegistro = new Date(registrosCompletos[i])
            dataRegistro.setHours(0, 0, 0, 0)

            if (dataRegistro.getTime() === dataEsperada.getTime()) {
                sequencia++
            } else {
                // Se não completou hoje, verifica se completou ontem para manter a sequência
                if (sequencia === 0) {
                    const ontem = new Date(hoje)
                    ontem.setDate(ontem.getDate() - 1)
                    if (dataRegistro.getTime() === ontem.getTime()) {
                        sequencia = 1
                        continue
                    }
                }
                break
            }
        }

        return sequencia
    }

    useEffect(() => {
        carregarDados()
    }, [])

    const alternarHabito = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation()
        try {
            await habitosAPI.toggle(id)

            setHabitos(habitos.map((h) => {
                if (h.id === id) {
                    const novoCompleto = !h.completoHoje
                    return {
                        ...h,
                        completoHoje: novoCompleto,
                        sequencia: novoCompleto ? h.sequencia + 1 : Math.max(0, h.sequencia - 1)
                    }
                }
                return h
            }))

            // Atualizar estatísticas localmente ou recarregar
            carregarDados()

            toast({
                title: 'Sucesso',
                description: habitos.find((h) => h.id === id)?.completoHoje
                    ? 'Hábito desmarcado'
                    : 'Hábito completado! 🎉',
                variant: 'success',
            })
        } catch (error) {
            console.error('Erro ao alternar hábito:', error)
            toast({
                title: 'Erro',
                description: 'Não foi possível atualizar o hábito',
                variant: 'error',
            })
        }
    }

    const handleSave = async (data: any) => {
        try {
            if (editingHabit) {
                await habitosAPI.atualizar(editingHabit.id, data)
                toast({ title: 'Sucesso', description: 'Hábito atualizado!', variant: 'success' })
            } else {
                await habitosAPI.criar(data)
                toast({ title: 'Sucesso', description: 'Hábito criado!', variant: 'success' })
            }
            carregarDados()
            setDialogOpen(false)
            setEditingHabit(null)
        } catch (error) {
            console.error('Erro ao salvar hábito:', error)
            toast({
                title: 'Erro',
                description: 'Não foi possível salvar o hábito',
                variant: 'error',
            })
        }
    }

    const handleEdit = (habito: Habito, e: React.MouseEvent) => {
        e.stopPropagation()
        setEditingHabit(habito)
        setDialogOpen(true)
    }

    const confirmDelete = (id: string, e: React.MouseEvent) => {
        e.stopPropagation()
        setDeleteId(id)
    }

    const handleDelete = async () => {
        if (!deleteId) return
        try {
            await habitosAPI.deletar(deleteId)
            toast({ title: 'Sucesso', description: 'Hábito excluído!', variant: 'success' })
            carregarDados()
        } catch (error) {
            console.error('Erro ao deletar hábito:', error)
            toast({ title: 'Erro', description: 'Erro ao excluir hábito', variant: 'error' })
        } finally {
            setDeleteId(null)
        }
    }

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
                    ✅ Hábitos Diários
                </h1>
                <p className="text-body-lg text-text-secondary">
                    Construa uma vida melhor, um hábito por vez
                </p>
            </div>

            {/* Estatísticas */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-md">
                <Card className="gradient-green-gold">
                    <CardContent className="p-lg">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-caption text-white/80 mb-1">Hoje</p>
                                <p className="text-display font-bold text-white">
                                    {stats?.porcentagemHoje || 0}%
                                </p>
                            </div>
                            <CheckCircle2 className="text-white" size={32} />
                        </div>
                        <Progress value={stats?.porcentagemHoje || 0} className="mt-4 bg-white/20" />
                    </CardContent>
                </Card>

                <Card className="gradient-blue">
                    <CardContent className="p-lg">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-caption text-white/80 mb-1">Melhor Sequência</p>
                                <p className="text-display font-bold text-white flex items-center gap-2">
                                    <Flame className="text-accent-orange" size={28} />
                                    {stats?.melhorSequencia || 0} dias
                                </p>
                            </div>
                        </div>
                        <p className="text-caption text-white/80 mt-2">
                            {stats?.habitoMelhorSequencia || 'Nenhum hábito'}
                        </p>
                    </CardContent>
                </Card>

                <Card className="gradient-purple">
                    <CardContent className="p-lg">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-caption text-white/80 mb-1">Dias Ativos</p>
                                <p className="text-display font-bold text-white">
                                    {stats?.diasAtivos || 0}
                                </p>
                            </div>
                            <Calendar className="text-white" size={32} />
                        </div>
                        <p className="text-caption text-white/80 mt-2">
                            Nos últimos 30 dias
                        </p>
                    </CardContent>
                </Card>

                <Card className="gradient-orange">
                    <CardContent className="p-lg">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-caption text-white/80 mb-1">Total de Hábitos</p>
                                <p className="text-display font-bold text-white">
                                    {stats?.totalHabitos || 0}
                                </p>
                            </div>
                            <Trophy className="text-white" size={32} />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Lista de Hábitos */}
            {habitos.length === 0 ? (
                <Card>
                    <CardContent className="p-xl text-center">
                        <p className="text-body-lg text-text-secondary mb-md">
                            Você ainda não tem hábitos cadastrados
                        </p>
                        <Button onClick={() => { setEditingHabit(null); setDialogOpen(true); }}>
                            <Plus className="mr-2" size={20} />
                            Criar Primeiro Hábito
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
                    {habitos.map((habito) => (
                        <Card
                            key={habito.id}
                            className={cn(
                                'cursor-pointer transition-all hover:scale-[1.02] group relative',
                                habito.completoHoje && 'border-accent-success border-2'
                            )}
                            onClick={(e) => alternarHabito(habito.id, e)}
                        >
                            <CardContent className="p-md">
                                <div className="flex items-center gap-md">
                                    <div
                                        className={cn(
                                            'w-12 h-12 rounded-full flex items-center justify-center text-2xl transition-all',
                                            habito.completoHoje ? 'bg-accent-success scale-110' : 'bg-white/10'
                                        )}
                                        style={{
                                            backgroundColor: !habito.completoHoje ? habito.cor + '20' : undefined,
                                        }}
                                    >
                                        {habito.completoHoje ? (
                                            <CheckCircle2 className="text-background" size={24} />
                                        ) : (
                                            <span>{habito.icone}</span>
                                        )}
                                    </div>

                                    <div className="flex-1">
                                        <h3
                                            className={cn(
                                                'text-body-lg font-semibold',
                                                habito.completoHoje
                                                    ? 'text-text-secondary line-through'
                                                    : 'text-text-primary'
                                            )}
                                        >
                                            {habito.nome}
                                        </h3>
                                        <div className="flex items-center gap-2 mt-1">
                                            <Flame className="text-primary-orange" size={16} />
                                            <span className="text-caption text-text-secondary">
                                                {habito.sequencia} dias de sequência
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-8 w-8 p-0"
                                            onClick={(e) => handleEdit(habito, e)}
                                        >
                                            <Edit3 size={16} className="text-text-tertiary" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-8 w-8 p-0 hover:text-accent-error"
                                            onClick={(e) => confirmDelete(habito.id, e)}
                                        >
                                            <Trash2 size={16} />
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Botão Adicionar */}
            {habitos.length > 0 && (
                <Button
                    size="lg"
                    className="w-full md:w-auto"
                    onClick={() => { setEditingHabit(null); setDialogOpen(true); }}
                >
                    <Plus className="mr-2" size={20} />
                    Adicionar Novo Hábito
                </Button>
            )}

            {/* Dialog de Criação/Edição */}
            <HabitoDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                onSubmit={handleSave}
                initialData={editingHabit || undefined}
                isEditing={!!editingHabit}
            />

            {/* Dialog de Confirmação de Exclusão */}
            <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Esta ação não pode ser desfeita. Isso excluirá permanentemente o hábito e todo o seu histórico.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-accent-error text-white hover:bg-accent-error/90">
                            Excluir
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
