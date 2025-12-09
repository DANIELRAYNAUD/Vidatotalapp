import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, Loader2, Heart, Target, MessageCircle } from 'lucide-react'
import { casamentoAPI } from '@/lib/api'
import { useToast } from '@/components/ui/use-toast'

export function Casamento() {
    const [loading, setLoading] = useState(true)
    const [metas, setMetas] = useState<any[]>([])
    const [notas, setNotas] = useState<any[]>([])
    const [stats, setStats] = useState<any>(null)
    const { toast } = useToast()

    const carregarDados = async () => {
        try {
            setLoading(true)
            const [metasRes, notasRes, statsRes] = await Promise.all([
                casamentoAPI.listarMetas(),
                casamentoAPI.listarNotas(),
                casamentoAPI.estatisticas(),
            ])
            setMetas((metasRes.data as any) || [])
            setNotas((notasRes.data as any) || [])
            setStats((statsRes.data as any) || null)
        } catch (error) {
            console.error('Erro ao carregar dados:', error)
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
    }, [])

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
                    💑 Casamento
                </h1>
                <p className="text-body-lg text-text-secondary">
                    Cultive e fortaleça seu relacionamento conjugal
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-md">
                <Card className="gradient-green-gold">
                    <CardContent className="p-lg">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-caption text-white/80 mb-1">Qualidade Média</p>
                                <p className="text-display font-bold text-white">
                                    {stats?.qualidadeMedia?.toFixed(1) || '0.0'}/10
                                </p>
                            </div>
                            <Heart className="text-white" size={32} />
                        </div>
                    </CardContent>
                </Card>

                <Card className="gradient-blue">
                    <CardContent className="p-lg">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-caption text-white/80 mb-1">Check-ins</p>
                                <p className="text-display font-bold text-white">
                                    {stats?.totalCheckins || 0}
                                </p>
                            </div>
                            <MessageCircle className="text-white" size={32} />
                        </div>
                    </CardContent>
                </Card>

                <Card className="gradient-orange">
                    <CardContent className="p-lg">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-caption text-white/80 mb-1">Metas Ativas</p>
                                <p className="text-display font-bold text-white">
                                    {stats?.metasAtivas || 0}
                                </p>
                            </div>
                            <Target className="text-white" size={32} />
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card className="bg-gradient-to-br from-pink-500/10 to-purple-500/10 border-pink-500/20">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Heart className="text-pink-500" size={24} />
                        Check-in do Relacionamento
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-body text-text-secondary mb-md">
                        Como está a qualidade do relacionamento hoje?
                    </p>
                    <Button className="w-full md:w-auto">
                        <Plus className="mr-2" size={16} />
                        Fazer Check-in Hoje
                    </Button>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Metas do Casal</CardTitle>
                    <Button size="sm">
                        <Plus className="mr-2" size={16} />
                        Nova Meta
                    </Button>
                </CardHeader>
                <CardContent>
                    {metas.length === 0 ? (
                        <p className="text-center text-text-secondary py-8">
                            Nenhuma meta ativa
                        </p>
                    ) : (
                        <div className="space-y-md">
                            {metas.map((meta) => (
                                <Card key={meta.id} className="hover:border-primary-green transition-all">
                                    <CardContent className="p-md">
                                        <div className="flex items-start justify-between mb-2">
                                            <div className="flex-1">
                                                <h3 className="text-body-lg font-semibold text-text-primary">
                                                    {meta.titulo}
                                                </h3>
                                                <p className="text-caption text-text-secondary">
                                                    {meta.categoria}
                                                    {meta.prazo && ` • Prazo: ${new Date(meta.prazo).toLocaleDateString('pt-BR')}`}
                                                </p>
                                            </div>
                                            <span className="text-body font-bold text-primary-gold">
                                                {meta.progresso}%
                                            </span>
                                        </div>
                                        {meta.descricao && (
                                            <p className="text-body text-text-secondary mb-2">
                                                {meta.descricao}
                                            </p>
                                        )}
                                        <div className="w-full bg-white/10 rounded-full h-2">
                                            <div
                                                className="bg-gradient-to-r from-primary-green to-primary-teal h-2 rounded-full transition-all"
                                                style={{ width: `${meta.progresso}%` }}
                                            />
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Notas de Apreciação</CardTitle>
                    <Button size="sm" variant="secondary">
                        <Plus className="mr-2" size={16} />
                        Nova Nota
                    </Button>
                </CardHeader>
                <CardContent>
                    {notas.length === 0 ? (
                        <div className="text-center py-8">
                            <p className="text-body-lg text-text-secondary mb-md">
                                Nenhuma nota de apreciação ainda
                            </p>
                            <p className="text-caption text-text-tertiary">
                                Comece a registrar momentos de gratidão, amor e memórias especiais
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-md">
                            {notas.slice(0, 10).map((nota) => (
                                <div
                                    key={nota.id}
                                    className="p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-all"
                                >
                                    <div className="flex items-start gap-3">
                                        <div className="text-2xl">
                                            {nota.tipo === 'gratidao' ? '🙏' :
                                                nota.tipo === 'amor' ? '❤️' :
                                                    nota.tipo === 'memoria' ? '📸' : '💭'}
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-body text-text-primary mb-1">
                                                {nota.conteudo}
                                            </p>
                                            <p className="text-caption text-text-secondary">
                                                {new Date(nota.data).toLocaleDateString('pt-BR', {
                                                    day: '2-digit',
                                                    month: 'long',
                                                    year: 'numeric'
                                                })}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
