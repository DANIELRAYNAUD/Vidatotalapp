import { useState, useEffect, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
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
import { Calendar, Plus, Clock, MapPin, Video, Loader2, ChevronLeft, ChevronRight, Edit3, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatarHora, formatarMoeda } from '@/lib/utils'
import { agendaAPI } from '@/lib/api'
import { EventoDialog } from '@/components/modules/EventoDialog'
import { useToast } from '@/components/ui/use-toast'
import { TimeSlotGrid, GranularitySelector, type TimeSlotGranularity } from '@/components/modules/TimeSlotGrid'
import { ehFeriado, getFeriadosMes } from '@/lib/holidays'

interface Evento {
    id: string
    titulo: string
    descricao?: string
    dataHoraInicio: Date
    dataHoraFim: Date
    categoria: 'trabalho' | 'pessoal' | 'saude' | 'estudo' | 'social' | 'financeiro'
    cor: string
    local?: string
    linkReuniao?: string
    tipo?: string
    editavel?: boolean
    diaInteiro?: boolean
    // Campos financeiros
    valorFinanceiro?: number
    statusFinanceiro?: 'pendente' | 'pago' | 'vencido'
}

const BADGE_TIPO = {
    'manual': { label: 'Evento', cor: 'bg-gray-600' },
    'plantao': { label: 'Plantão', cor: 'bg-red-600' },
    'tarefa': { label: 'Tarefa', cor: 'bg-blue-600' },
    'consulta': { label: 'Consulta', cor: 'bg-pink-600' },
    'fatura_cartao': { label: '💳 Fatura', cor: 'bg-purple-600' },
    'conta_pagar': { label: '💸 A Pagar', cor: 'bg-orange-600' },
    'conta_receber': { label: '💰 A Receber', cor: 'bg-green-600' },
}

export function Agenda() {
    const [diaAtual, setDiaAtual] = useState(new Date())
    const [diaSelecionado, setDiaSelecionado] = useState<Date | null>(null)
    const [eventos, setEventos] = useState<Evento[]>([])
    const [loading, setLoading] = useState(true)
    const [dialogOpen, setDialogOpen] = useState(false)
    const [editingEvent, setEditingEvent] = useState<Evento | null>(null)
    const [deleteId, setDeleteId] = useState<string | null>(null)
    const [granularidade, setGranularidade] = useState<TimeSlotGranularity>('6h')
    const { toast } = useToast()

    // Feriados do mês
    const feriadosMes = useMemo(() => {
        return getFeriadosMes(diaAtual.getFullYear(), diaAtual.getMonth())
    }, [diaAtual])

    // Feriado do dia selecionado
    const feriadoDia = useMemo(() => {
        const data = diaSelecionado || new Date()
        return ehFeriado(data)
    }, [diaSelecionado])

    useEffect(() => {
        carregarEventos()
    }, [diaAtual])

    const carregarEventos = async () => {
        try {
            setLoading(true)

            // Buscar eventos do mês inteiro
            const primeiroDia = new Date(diaAtual.getFullYear(), diaAtual.getMonth(), 1)
            const ultimoDia = new Date(diaAtual.getFullYear(), diaAtual.getMonth() + 1, 0)

            const response = await agendaAPI.listar({
                inicio: primeiroDia.toISOString(),
                fim: ultimoDia.toISOString()
            })

            // Usar endpoint de agregação para pegar todos os eventos
            const responseTodos = await fetch(`/api/agenda/todos?inicio=${primeiroDia.toISOString()}&fim=${ultimoDia.toISOString()}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            })

            if (responseTodos.ok) {
                const todosEventos = await responseTodos.json()
                const eventosFormatados = todosEventos.map((e: any) => ({
                    ...e,
                    dataHoraInicio: new Date(e.dataHoraInicio),
                    dataHoraFim: new Date(e.dataHoraFim)
                }))
                setEventos(eventosFormatados)
            } else {
                // Fallback para eventos normais
                const eventosFormatados = (response.data as any).map((e: any) => ({
                    ...e,
                    dataHoraInicio: new Date(e.inicio),
                    dataHoraFim: new Date(e.fim),
                    tipo: 'manual',
                    editavel: true
                }))
                setEventos(eventosFormatados)
            }
        } catch (error) {
            console.error('Erro ao carregar eventos:', error)
            toast({
                title: 'Erro',
                description: 'Não foi possível carregar os eventos',
                variant: 'error',
            })
        } finally {
            setLoading(false)
        }
    }

    const mesAnterior = () => {
        const novaData = new Date(diaAtual)
        novaData.setMonth(novaData.getMonth() - 1)
        setDiaAtual(novaData)
        setDiaSelecionado(null)
    }

    const mesSeguinte = () => {
        const novaData = new Date(diaAtual)
        novaData.setMonth(novaData.getMonth() + 1)
        setDiaAtual(novaData)
        setDiaSelecionado(null)
    }

    const getDiasDoMes = () => {
        const ano = diaAtual.getFullYear()
        const mes = diaAtual.getMonth()
        const primeiroDia = new Date(ano, mes, 1)
        const ultimoDia = new Date(ano, mes + 1, 0)

        const dias = []
        const diaDaSemanaInicio = primeiroDia.getDay()

        // Dias do mês anterior
        for (let i = diaDaSemanaInicio; i > 0; i--) {
            const dia = new Date(ano, mes, -i + 1)
            dias.push({ data: dia, mesAtual: false })
        }

        // Dias do mês atual
        for (let i = 1; i <= ultimoDia.getDate(); i++) {
            dias.push({ data: new Date(ano, mes, i), mesAtual: true })
        }

        // Completar com dias do próximo mês
        const diasRestantes = 42 - dias.length
        for (let i = 1; i <= diasRestantes; i++) {
            dias.push({ data: new Date(ano, mes + 1, i), mesAtual: false })
        }

        return dias
    }

    const diasDoMes = getDiasDoMes()
    const diasSemana = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

    const ehHoje = (data: Date) => {
        const h = new Date()
        return (
            data.getDate() === h.getDate() &&
            data.getMonth() === h.getMonth() &&
            data.getFullYear() === h.getFullYear()
        )
    }

    const ehDiaSelecionado = (data: Date) => {
        if (!diaSelecionado) return false
        return (
            data.getDate() === diaSelecionado.getDate() &&
            data.getMonth() === diaSelecionado.getMonth() &&
            data.getFullYear() === diaSelecionado.getFullYear()
        )
    }

    const temEventosNoDia = (data: Date) => {
        return eventos.some(e => {
            const dataEvento = new Date(e.dataHoraInicio)
            return (
                dataEvento.getDate() === data.getDate() &&
                dataEvento.getMonth() === data.getMonth() &&
                dataEvento.getFullYear() === data.getFullYear()
            )
        })
    }

    const eventosDoDia = diaSelecionado
        ? eventos.filter(e => {
            const dataEvento = new Date(e.dataHoraInicio)
            return (
                dataEvento.getDate() === diaSelecionado.getDate() &&
                dataEvento.getMonth() === diaSelecionado.getMonth() &&
                dataEvento.getFullYear() === diaSelecionado.getFullYear()
            )
        })
        : eventos.filter(e => ehHoje(new Date(e.dataHoraInicio)))

    const handleSave = async (data: any) => {
        try {
            if (editingEvent && editingEvent.id.startsWith('manual-')) {
                const realId = editingEvent.id.replace('manual-', '')
                await agendaAPI.atualizar(realId, data)
                toast({ title: 'Sucesso', description: 'Evento atualizado!', variant: 'success' })
            } else if (editingEvent) {
                await agendaAPI.atualizar(editingEvent.id, data)
                toast({ title: 'Sucesso', description: 'Evento atualizado!', variant: 'success' })
            } else {
                await agendaAPI.criar(data)
                toast({ title: 'Sucesso', description: 'Evento criado!', variant: 'success' })
            }
            carregarEventos()
            setDialogOpen(false)
            setEditingEvent(null)
        } catch (error) {
            console.error('Erro ao salvar evento:', error)
            toast({
                title: 'Erro',
                description: 'Não foi possível salvar o evento',
                variant: 'error',
            })
        }
    }

    const handleDelete = async () => {
        if (!deleteId) return
        try {
            const realId = deleteId.startsWith('manual-') ? deleteId.replace('manual-', '') : deleteId
            await agendaAPI.deletar(realId)
            toast({ title: 'Sucesso', description: 'Evento excluído!', variant: 'success' })
            carregarEventos()
        } catch (error) {
            console.error('Erro ao deletar evento:', error)
            toast({ title: 'Erro', description: 'Erro ao excluir evento', variant: 'error' })
        } finally {
            setDeleteId(null)
        }
    }

    const handleEditEvento = (evento: Evento) => {
        if (!evento.editavel) {
            toast({
                title: 'Ação não permitida',
                description: 'Este evento não pode ser editado pois vem de outro módulo',
                variant: 'error',
            })
            return
        }
        setEditingEvent(evento)
        setDialogOpen(true)
    }

    const handleDeleteEvento = (id: string, editavel?: boolean) => {
        if (!editavel) {
            toast({
                title: 'Ação não permitida',
                description: 'Este evento não pode ser excluído pois vem de outro módulo',
                variant: 'error',
            })
            return
        }
        setDeleteId(id)
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
                    📅 Agenda
                </h1>
                <p className="text-body-lg text-text-secondary">
                    Organize seus compromissos e visualize eventos de todos os módulos
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-xl">
                {/* Calendário Mensal */}
                <div className="lg:col-span-2">
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle className="flex items-center gap-2">
                                    <Calendar className="text-primary-blue" size={24} />
                                    {diaAtual.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
                                </CardTitle>
                                <div className="flex gap-2">
                                    <Button size="sm" variant="outline" onClick={mesAnterior}>
                                        <ChevronLeft size={16} />
                                    </Button>
                                    <Button size="sm" variant="outline" onClick={mesSeguinte}>
                                        <ChevronRight size={16} />
                                    </Button>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {/* Dias da semana */}
                            <div className="grid grid-cols-7 gap-2 mb-2">
                                {diasSemana.map((dia) => (
                                    <div
                                        key={dia}
                                        className="text-center text-caption font-semibold text-text-secondary py-2"
                                    >
                                        {dia}
                                    </div>
                                ))}
                            </div>

                            {/* Dias do mês */}
                            <div className="grid grid-cols-7 gap-2">
                                {diasDoMes.map((dia, index) => {
                                    const feriadoDoDia = ehFeriado(dia.data)
                                    return (
                                        <button
                                            key={index}
                                            onClick={() => setDiaSelecionado(dia.data)}
                                            title={feriadoDoDia?.nome}
                                            className={cn(
                                                'aspect-square rounded-lg p-2 text-center transition-all hover:bg-white/10 relative',
                                                !dia.mesAtual && 'text-text-tertiary opacity-50',
                                                dia.mesAtual && 'text-text-primary',
                                                ehHoje(dia.data) && 'bg-primary-green text-white font-bold',
                                                ehDiaSelecionado(dia.data) && !ehHoje(dia.data) && 'bg-white/20 ring-2 ring-primary-blue',
                                                // Feriado styling
                                                feriadoDoDia && dia.mesAtual && 'bg-red-500/20 border border-red-500/30'
                                            )}
                                        >
                                            {dia.data.getDate()}
                                            {/* Indicador de feriado */}
                                            {feriadoDoDia && dia.mesAtual && (
                                                <div className="absolute top-0.5 right-0.5">
                                                    <span className="text-[8px]">🎉</span>
                                                </div>
                                            )}
                                            {/* Indicador de eventos */}
                                            {temEventosNoDia(dia.data) && (
                                                <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-0.5">
                                                    <div className="w-1 h-1 rounded-full bg-primary-gold" />
                                                </div>
                                            )}
                                        </button>
                                    )
                                })}
                            </div>

                            {/* Lista de feriados do mês */}
                            {feriadosMes.length > 0 && (
                                <div className="mt-4 pt-4 border-t border-white/10">
                                    <h4 className="text-xs font-medium text-text-secondary mb-2">🎉 Feriados do mês</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {feriadosMes.map((f, idx) => (
                                            <Badge
                                                key={idx}
                                                variant="outline"
                                                className={cn(
                                                    'text-xs',
                                                    f.tipo === 'nacional' ? 'border-red-500/50 text-red-400' : 'border-purple-500/50 text-purple-400'
                                                )}
                                            >
                                                {f.data.getDate()}/{f.data.getMonth() + 1} - {f.nome}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* TimeSlot Grid - Visualização por horários */}
                    <Card className="mt-4">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle className="flex items-center gap-2 text-base">
                                    <Clock className="text-primary-blue" size={18} />
                                    Horários do Dia
                                </CardTitle>
                                <GranularitySelector
                                    value={granularidade}
                                    onChange={setGranularidade}
                                />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <TimeSlotGrid
                                data={diaSelecionado || new Date()}
                                granularidade={granularidade}
                                eventos={eventosDoDia.map(e => ({
                                    id: e.id,
                                    titulo: e.titulo,
                                    descricao: e.descricao,
                                    cor: e.cor,
                                    tipo: e.tipo,
                                    valorFinanceiro: e.valorFinanceiro
                                }))}
                                feriado={feriadoDia}
                                onSlotClick={(slot) => {
                                    console.log('Slot clicado:', slot)
                                }}
                            />
                        </CardContent>
                    </Card>
                </div>

                {/* Eventos do Dia */}
                <div>
                    <Card>
                        <CardHeader>
                            <CardTitle>
                                {diaSelecionado
                                    ? `Eventos - ${diaSelecionado.toLocaleDateString('pt-BR')}`
                                    : 'Eventos de Hoje'}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-md">
                                {eventosDoDia.length === 0 ? (
                                    <div className="text-center py-8 text-text-secondary">
                                        Nenhum evento neste dia
                                    </div>
                                ) : (
                                    eventosDoDia.map((evento) => (
                                        <div
                                            key={evento.id}
                                            className="p-md rounded-lg bg-background/50 hover:bg-white/5 transition-colors group"
                                        >
                                            <div className="flex gap-3">
                                                <div className={cn('w-1 rounded-full', evento.cor)} />
                                                <div className="flex-1">
                                                    <div className="flex items-start justify-between gap-2 mb-2">
                                                        <h4 className="text-body font-semibold text-text-primary">
                                                            {evento.titulo}
                                                        </h4>
                                                        {evento.editavel && (
                                                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    className="h-6 w-6 p-0"
                                                                    onClick={() => handleEditEvento(evento)}
                                                                >
                                                                    <Edit3 size={14} />
                                                                </Button>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    className="h-6 w-6 p-0 hover:text-accent-error"
                                                                    onClick={() => handleDeleteEvento(evento.id, evento.editavel)}
                                                                >
                                                                    <Trash2 size={14} />
                                                                </Button>
                                                            </div>
                                                        )}
                                                    </div>

                                                    {evento.tipo && BADGE_TIPO[evento.tipo as keyof typeof BADGE_TIPO] && (
                                                        <Badge className={`mb-2 ${BADGE_TIPO[evento.tipo as keyof typeof BADGE_TIPO].cor}`}>
                                                            {BADGE_TIPO[evento.tipo as keyof typeof BADGE_TIPO].label}
                                                        </Badge>
                                                    )}

                                                    {evento.descricao && (
                                                        <p className="text-caption text-text-secondary mb-2">
                                                            {evento.descricao}
                                                        </p>
                                                    )}

                                                    <div className="space-y-1">
                                                        <div className="flex items-center gap-2 text-caption text-text-secondary">
                                                            <Clock size={14} />
                                                            {formatarHora(evento.dataHoraInicio)} - {formatarHora(evento.dataHoraFim)}
                                                        </div>

                                                        {evento.valorFinanceiro !== undefined && (
                                                            <div className="flex items-center gap-2 text-caption font-bold text-text-primary">
                                                                💰 {formatarMoeda(evento.valorFinanceiro)}
                                                            </div>
                                                        )}

                                                        {evento.local && (
                                                            <div className="flex items-center gap-2 text-caption text-text-secondary">
                                                                <MapPin size={14} />
                                                                {evento.local}
                                                            </div>
                                                        )}
                                                        {evento.linkReuniao && (
                                                            <div className="flex items-center gap-2 text-caption text-accent-info">
                                                                <Video size={14} />
                                                                <a href={evento.linkReuniao} target="_blank" rel="noopener noreferrer" className="hover:underline">
                                                                    Link da reunião
                                                                </a>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>

                            <Button
                                className="w-full mt-md"
                                variant="outline"
                                onClick={() => {
                                    setEditingEvent(null)
                                    setDialogOpen(true)
                                }}
                            >
                                <Plus size={16} className="mr-2" />
                                Adicionar Evento
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Dialog de Criação/Edição */}
            <EventoDialog
                open={dialogOpen}
                onOpenChange={(open) => {
                    setDialogOpen(open)
                    if (!open) setEditingEvent(null)
                }}
                onSubmit={handleSave}
                initialData={editingEvent || undefined}
                isEditing={!!editingEvent}
            />

            {/* Dialog de Confirmação de Exclusão */}
            <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Esta ação não pode ser desfeita. Isso excluirá permanentemente o evento.
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
