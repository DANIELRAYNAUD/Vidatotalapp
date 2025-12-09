import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, Loader2, Building2, Calendar, DollarSign } from 'lucide-react'
import { servicoMedicoAPI } from '@/lib/api'
import { useToast } from '@/components/ui/use-toast'

export function ServicoMedico() {
    const [loading, setLoading] = useState(true)
    const [empresas, setEmpresas] = useState<any[]>([])
    const [plantoes, setPlantoes] = useState<any[]>([])
    const [stats, setStats] = useState<any>(null)
    const { toast } = useToast()

    const carregarDados = async () => {
        try {
            setLoading(true)
            const [empresasRes, plantoesRes, statsRes] = await Promise.all([
                servicoMedicoAPI.listarEmpresas(),
                servicoMedicoAPI.listarPlantoes(),
                servicoMedicoAPI.estatisticas(),
            ])
            setEmpresas((empresasRes.data as any) || [])
            setPlantoes((plantoesRes.data as any) || [])
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
                    🏥 Serviço Médico
                </h1>
                <p className="text-body-lg text-text-secondary">
                    Gestão de plantões, empresas e faturamento médico
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-md">
                <Card className="gradient-blue">
                    <CardContent className="p-lg">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-caption text-white/80 mb-1">Total Plantões</p>
                                <p className="text-display font-bold text-white">
                                    {stats?.totalPlantoes || 0}
                                </p>
                            </div>
                            <Calendar className="text-white" size={32} />
                        </div>
                    </CardContent>
                </Card>

                <Card className="gradient-green-gold">
                    <CardContent className="p-lg">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-caption text-white/80 mb-1">Concluídos</p>
                                <p className="text-display font-bold text-white">
                                    {stats?.plantoesConcluidos || 0}
                                </p>
                            </div>
                            <div className="text-4xl">✅</div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="gradient-orange">
                    <CardContent className="p-lg">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-caption text-white/80 mb-1">A Receber</p>
                                <p className="text-h3 font-bold text-white">
                                    R$ {stats?.valorReceber?.toFixed(2) || '0.00'}
                                </p>
                            </div>
                            <DollarSign className="text-white" size={32} />
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-surface-card backdrop-blur-card">
                    <CardContent className="p-lg">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-caption text-text-secondary mb-1">Empresas</p>
                                <p className="text-display font-bold text-text-primary">
                                    {empresas.length}
                                </p>
                            </div>
                            <Building2 className="text-primary-blue" size={32} />
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Empresas / Locais de Trabalho</CardTitle>
                    <Button size="sm">
                        <Plus className="mr-2" size={16} />
                        Nova Empresa
                    </Button>
                </CardHeader>
                <CardContent>
                    {empresas.length === 0 ? (
                        <p className="text-center text-text-secondary py-8">
                            Nenhuma empresa cadastrada
                        </p>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
                            {empresas.map((empresa) => (
                                <Card key={empresa.id} className="hover:border-primary-blue transition-all">
                                    <CardContent className="p-md">
                                        <div className="flex items-start justify-between mb-2">
                                            <div>
                                                <h3 className="text-body-lg font-semibold text-text-primary">
                                                    {empresa.nome}
                                                </h3>
                                                <p className="text-caption text-text-secondary">
                                                    {empresa.tipo} • Pag dia {empresa.diaPagamento}
                                                </p>
                                            </div>
                                            {empresa.emiteNota && <span className="text-xs bg-accent-success/20 text-accent-success px-2 py-1 rounded">NF</span>}
                                        </div>
                                        {empresa.valorPadrao && (
                                            <p className="text-body text-primary-gold">
                                                R$ {empresa.valorPadrao.toFixed(2)} / plantão
                                            </p>
                                        )}
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Próximos Plantões</CardTitle>
                    <Button size="sm">
                        <Plus className="mr-2" size={16} />
                        Novo Plantão
                    </Button>
                </CardHeader>
                <CardContent>
                    {plantoes.length === 0 ? (
                        <p className="text-center text-text-secondary py-8">
                            Nenhum plantão agendado
                        </p>
                    ) : (
                        <div className="space-y-md">
                            {plantoes.slice(0, 10).map((plantao: any) => (
                                <div
                                    key={plantao.id}
                                    className="flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-all"
                                >
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-1">
                                            <span className="text-body-lg font-semibold text-text-primary">
                                                {plantao.empresa?.nome || 'Empresa'}
                                            </span>
                                            <span className={`text-xs px-2 py-1 rounded ${plantao.status === 'concluido' ? 'bg-accent-success/20 text-accent-success' :
                                                    plantao.status === 'pago' ? 'bg-primary-gold/20 text-primary-gold' :
                                                        'bg-accent-info/20 text-accent-info'
                                                }`}>
                                                {plantao.status}
                                            </span>
                                        </div>
                                        <p className="text-caption text-text-secondary">
                                            {new Date(plantao.data).toLocaleDateString('pt-BR')} • {plantao.blocoHorario} • {plantao.tipoServico}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-body-lg font-bold text-primary-gold">
                                            R$ {plantao.valor.toFixed(2)}
                                        </p>
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
