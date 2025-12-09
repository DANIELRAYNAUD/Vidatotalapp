import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, Loader2, Flame, TrendingUp } from 'lucide-react'
import { servicoAPI } from '@/lib/api'
import { useToast } from '@/components/ui/use-toast'
import { ServicoDialog } from '@/components/modules/ServicoDialog'

// Mapa de ícones e cores por tipo
const TIPOS_SERVICO = {
    reunioes: { icone: '⛪', cor: '#8b7355', label: 'Reuniões' },
    alimento_diario: { icone: '📖', cor: '#2d7a5f', label: 'Alimento Diário' },
    grito_guerra: { icone: '📣', cor: '#d97706', label: 'Grito de Guerra' },
    conferencias: { icone: '🎤', cor: '#2e5c8a', label: 'Conferências' },
    ofertas: { icone: '💝', cor: '#db2777', label: 'Ofertas' },
    oracoes_diarias: { icone: '🙏', cor: '#6b46c1', label: 'Orações Diárias' },
    jejum: { icone: '🌙', cor: '#374151', label: 'Jejum' },
    imersao_palavra: { icone: '📜', cor: '#059669', label: 'Imersão na Palavra' },
    comunhao_irmaos: { icone: '🤝', cor: '#0ea5e9', label: 'Comunhão com Irmãos' },
    servir_igreja: { icone: '❤️', cor: '#dc2626', label: 'Servir na Igreja' },
}

interface Servico {
    id: string
    data: string
    tipo: string
    titulo: string
    descricao?: string
    duracao?: number
    valor?: number
    reflexao?: string
    versiculo?: string
}

interface Estatisticas {
    totalRegistros: number
    horasPorTipo: Record<string, number>
    totalOfertas: number
    sequencia: number
    atividadeMaisFrequente: { tipo: string; quantidade: number } | null
}

export function ServicoSenhor() {
    const [servicos, setServicos] = useState<Servico[]>([])
    const [estatisticas, setEstatisticas] = useState<Estatisticas | null>(null)
    const [loading, setLoading] = useState(true)
    const [dialogOpen, setDialogOpen] = useState(false)
    const [filtroTipo, setFiltroTipo] = useState<string | null>(null)
    const { toast } = useToast()

    const carregarDados = async () => {
        try {
            setLoading(true)
            const [servicosRes, estatisticasRes] = await Promise.all([
                servicoAPI.listar(),
                servicoAPI.estatisticas(),
            ])

            setServicos((servicosRes.data as any) || [])
            setEstatisticas((estatisticasRes.data as any) || null)
        } catch (error) {
            console.error('Erro ao carregar serviços:', error)
            toast({
                title: 'Erro',
                description: 'Não foi possível carregar os dados',
                variant: 'error',
            })
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        carregarDados()
    }, [filtroTipo])

    const criarServico = async (data: any) => {
        try {
            await servicoAPI.criar(data)
            toast({
                title: 'Sucesso',
                description: 'Registro criado com sucesso!',
                variant: 'success',
            })
            carregarDados()
        } catch (error) {
            console.error('Erro ao criar serviço:', error)
            toast({
                title: 'Erro',
                description: 'Não foi possível criar o registro',
                variant: 'error',
            })
        }
    }

    const deletarServico = async (id: string) => {
        try {
            await servicoAPI.deletar(id)
            toast({
                title: 'Sucesso',
                description: 'Registro deletado com sucesso!',
                variant: 'success',
            })
            carregarDados()
        } catch (error) {
            console.error('Erro ao deletar serviço:', error)
            toast({
                title: 'Erro',
                description: 'Não foi possível deletar o registro',
                variant: 'error',
            })
        }
    }

    const formatarData = (dataStr: string) => {
        const data = new Date(dataStr)
        return data.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })
    }

    const formatarDuracao = (minutos: number) => {
        const horas = Math.floor(minutos / 60)
        const mins = minutos % 60
        if (horas > 0) return `${horas}h ${mins}min`
        return `${mins}min`
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
                    🙏 Serviço ao Senhor
                </h1>
                <p className="text-body-lg text-text-secondary">
                    Acompanhe sua jornada espiritual e serviço ao Reino
                </p>
            </div>

            {/* Cards de Estatísticas */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-md">
                <Card className="gradient-green-gold">
                    <CardContent className=" p-lg">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-caption text-white/80 mb-1">Total de Registros</p>
                                <p className="text-display font-bold text-white">
                                    {estatisticas?.totalRegistros || 0}
                                </p>
                            </div>
                            <div className="text-4xl">📊</div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="gradient-blue">
                    <CardContent className="p-lg">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-caption text-white/80 mb-1">Sequência</p>
                                <p className="text-display font-bold text-white flex items-center gap-2">
                                    <Flame className="text-accent-orange" size={28} />
                                    {estatisticas?.sequencia || 0} dias
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="gradient-orange">
                    <CardContent className="p-lg">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-caption text-white/80 mb-1">Total de Ofertas</p>
                                <p className="text-display font-bold text-white">
                                    R$ {estatisticas?.totalOfertas?.toFixed(2) || '0.00'}
                                </p>
                            </div>
                            <div className="text-4xl">💝</div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-surface-card backdrop-blur-card border-surface-border">
                    <CardContent className="p-lg">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-caption text-text-secondary mb-1">Atividade Frequente</p>
                                <p className="text-body font-semibold text-text-primary">
                                    {estatisticas?.atividadeMaisFrequente
                                        ? TIPOS_SERVICO[estatisticas.atividadeMaisFrequente.tipo as keyof typeof TIPOS_SERVICO]?.label
                                        : '-'}
                                </p>
                            </div>
                            <TrendingUp className="text-accent-success" size={32} />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Filtros por Tipo */}
            <Card>
                <CardHeader>
                    <CardTitle>Filtrar por Tipo</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-wrap gap-2">
                        <Button
                            variant={filtroTipo === null ? 'default' : 'outline'}
                            onClick={() => setFiltroTipo(null)}
                            size="sm"
                        >
                            Todos
                        </Button>
                        {Object.entries(TIPOS_SERVICO).map(([tipo, config]) => (
                            <Button
                                key={tipo}
                                variant={filtroTipo === tipo ? 'default' : 'outline'}
                                onClick={() => setFiltroTipo(tipo)}
                                size="sm"
                                className="gap-2"
                            >
                                <span>{config.icone}</span>
                                {config.label}
                            </Button>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Lista de Serviços */}
            {servicos.length === 0 ? (
                <Card>
                    <CardContent className="p-xl text-center">
                        <p className="text-body-lg text-text-secondary mb-md">
                            Nenhum registro encontrado
                        </p>
                        <Button onClick={() => setDialogOpen(true)}>
                            <Plus className="mr-2" size={20} />
                            Criar Primeiro Registro
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-md">
                    {servicos.map((servico) => {
                        const config = TIPOS_SERVICO[servico.tipo as keyof typeof TIPOS_SERVICO]
                        return (
                            <Card key={servico.id} className="hover:border-primary-green transition-all">
                                <CardContent className="p-lg">
                                    <div className="flex items-start gap-md">
                                        <div
                                            className="w-12 h-12 rounded-full flex items-center justify-center text-2xl flex-shrink-0"
                                            style={{ backgroundColor: config.cor + '20' }}
                                        >
                                            {config.icone}
                                        </div>

                                        <div className="flex-1">
                                            <div className="flex items-start justify-between mb-2">
                                                <div>
                                                    <h3 className="text-body-lg font-semibold text-text-primary">
                                                        {servico.titulo}
                                                    </h3>
                                                    <p className="text-caption text-text-secondary">
                                                        {config.label} • {formatarData(servico.data)}
                                                    </p>
                                                </div>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => deletarServico(servico.id)}
                                                >
                                                    🗑️
                                                </Button>
                                            </div>

                                            {servico.descricao && (
                                                <p className="text-body text-text-secondary mb-2">
                                                    {servico.descricao}
                                                </p>
                                            )}

                                            <div className="flex flex-wrap gap-4 text-caption text-text-secondary">
                                                {servico.duracao && (
                                                    <span>⏱️ {formatarDuracao(servico.duracao)}</span>
                                                )}
                                                {servico.valor && (
                                                    <span>💰 R$ {servico.valor.toFixed(2)}</span>
                                                )}
                                                {servico.versiculo && (
                                                    <span className="text-primary-green">📖 {servico.versiculo}</span>
                                                )}
                                            </div>

                                            {servico.reflexao && (
                                                <div className="mt-3 p-3 bg-white/5 rounded-lg border border-white/10">
                                                    <p className="text-caption text-text-secondary italic">
                                                        "{servico.reflexao}"
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )
                    })}
                </div>
            )}

            {/* Botão Adicionar */}
            {servicos.length > 0 && (
                <Button size="lg" className="w-full md:w-auto" onClick={() => setDialogOpen(true)}>
                    <Plus className="mr-2" size={20} />
                    Adicionar Novo Registro
                </Button>
            )}

            {/* Dialog de Criação */}
            <ServicoDialog open={dialogOpen} onOpenChange={setDialogOpen} onSubmit={criarServico} />
        </div>
    )
}
