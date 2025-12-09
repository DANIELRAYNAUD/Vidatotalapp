import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/components/ui/use-toast'
import {
    CreditCard,
    Wallet,
    Plus,
    TrendingUp,
    TrendingDown,
    Edit3,
    Trash2,
    BarChart3,
    Link2,
    RefreshCw,
} from 'lucide-react'
import { formatarMoeda } from '@/lib/utils'
import { cn } from '@/lib/utils'
import { financasAPI } from '@/lib/api'
import { CartaoDialog } from '@/components/modules/CartaoDialog'
import { TransactionForm } from '@/components/modules/TransactionForm'
import { FinanceSummary } from '@/components/modules/FinanceSummary'
import { LinkedTransactions } from '@/components/modules/LinkedTransactions'
import { FinanceAnalytics } from '@/components/modules/FinanceAnalytics'
import type { CartaoCredito, Transacao, Conta } from '@/types/financas'

// Tipos para o resumo
interface ResumoFinanceiro {
    patrimonioTotal: number
    receitasMes: number
    despesasMes: number
    saldoMes: number
    contasPagar: {
        total: number
        quantidade: number
        items: any[]
    }
    contasReceber: {
        total: number
        quantidade: number
        items: any[]
    }
    faturas: {
        total: number
        items: any[]
    }
    orcamentos: any[]
    mesReferencia: string
}

interface TransacoesVinculadas {
    total: number
    porModulo: any[]
}

export function Financas() {
    const [transacoes, setTransacoes] = useState<Transacao[]>([])
    const [cartoes, setCartoes] = useState<CartaoCredito[]>([])
    const [contas, setContas] = useState<Conta[]>([])
    const [resumo, setResumo] = useState<ResumoFinanceiro | null>(null)
    const [vinculadas, setVinculadas] = useState<TransacoesVinculadas | null>(null)
    const [loading, setLoading] = useState(true)
    const [refreshing, setRefreshing] = useState(false)

    // Dialogs
    const [cartaoDialogOpen, setCartaoDialogOpen] = useState(false)
    const [transactionDialogOpen, setTransactionDialogOpen] = useState(false)
    const [editingCartao, setEditingCartao] = useState<CartaoCredito | undefined>()

    // Tab ativa
    const [activeTab, setActiveTab] = useState('dashboard')

    const { toast } = useToast()

    useEffect(() => {
        carregarDados()
    }, [])

    const carregarDados = async () => {
        try {
            setLoading(true)
            const [transacoesRes, cartoesRes, contasRes, resumoRes, vinculadasRes] = await Promise.all([
                financasAPI.listarTransacoes(),
                financasAPI.listarCartoes(),
                financasAPI.listarContas(),
                financasAPI.resumo(),
                financasAPI.transacoesVinculadas()
            ])

            const transacoesFormatadas = (transacoesRes.data as any[]).map((t: any) => ({
                ...t,
                data: new Date(t.data),
                tags: t.tags ? JSON.parse(t.tags) : []
            }))

            setTransacoes(transacoesFormatadas)
            setCartoes(cartoesRes.data as CartaoCredito[])
            setContas(contasRes.data as Conta[])
            setResumo(resumoRes.data as ResumoFinanceiro)
            setVinculadas(vinculadasRes.data as TransacoesVinculadas)
        } catch (error) {
            console.error('Erro ao carregar finanças:', error)
            toast({
                title: 'Erro',
                description: 'Não foi possível carregar os dados financeiros',
                variant: 'error'
            })
        } finally {
            setLoading(false)
        }
    }

    const handleRefresh = async () => {
        setRefreshing(true)
        await carregarDados()
        setRefreshing(false)
        toast({ title: 'Dados atualizados!' })
    }

    const handleSaveCartao = async (data: any) => {
        try {
            if (editingCartao) {
                await financasAPI.atualizarCartao(editingCartao.id, data)
                toast({ title: 'Cartão atualizado com sucesso!' })
            } else {
                await financasAPI.criarCartao(data)
                toast({ title: 'Cartão criado com sucesso!' })
            }
            await carregarDados()
            setEditingCartao(undefined)
        } catch (error) {
            toast({
                title: 'Erro ao salvar cartão',
                description: 'Tente novamente',
                variant: 'error'
            })
            throw error
        }
    }

    const handleDeleteCartao = async (id: string) => {
        if (!confirm('Deseja realmente excluir este cartão?')) return

        try {
            await financasAPI.deletarCartao(id)
            toast({ title: 'Cartão excluído com sucesso!' })
            await carregarDados()
        } catch (error) {
            toast({
                title: 'Erro ao excluir cartão',
                variant: 'error'
            })
        }
    }

    const handleSaveTransaction = async (data: any, isParcelado: boolean) => {
        try {
            if (isParcelado) {
                await financasAPI.criarParcelamento({
                    cartaoId: data.cartaoId,
                    valor: parseFloat(data.valor),
                    numParcelas: parseInt(data.numParcelas),
                    categoria: data.categoria,
                    descricao: data.descricao,
                    dataCompra: data.data
                })
                toast({ title: `Compra parcelada em ${data.numParcelas}x com sucesso!` })
            } else {
                await financasAPI.criarTransacao({
                    ...data,
                    valor: parseFloat(data.valor),
                    data: new Date(data.data).toISOString()
                })
                toast({ title: 'Transação criada com sucesso!' })
            }
            await carregarDados()
        } catch (error) {
            toast({
                title: 'Erro ao criar transação',
                variant: 'error'
            })
            throw error
        }
    }

    if (loading) {
        return <div className="p-8 text-center text-text-secondary">Carregando finanças...</div>
    }

    return (
        <div className="space-y-xl">
            {/* Header */}
            <div className="flex items-start justify-between">
                <div>
                    <h1 className="text-h1 font-bold text-text-primary mb-sm">
                        💰 Finanças
                    </h1>
                    <p className="text-body-lg text-text-secondary">
                        Gestão financeira completa para sua família
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleRefresh}
                        disabled={refreshing}
                    >
                        <RefreshCw size={16} className={cn('mr-2', refreshing && 'animate-spin')} />
                        Atualizar
                    </Button>
                    <Button
                        size="sm"
                        onClick={() => setTransactionDialogOpen(true)}
                    >
                        <Plus size={16} className="mr-2" />
                        Nova Transação
                    </Button>
                </div>
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid grid-cols-4 w-full max-w-lg">
                    <TabsTrigger value="dashboard" className="flex items-center gap-2">
                        <BarChart3 size={16} />
                        Dashboard
                    </TabsTrigger>
                    <TabsTrigger value="transacoes" className="flex items-center gap-2">
                        <Wallet size={16} />
                        Transações
                    </TabsTrigger>
                    <TabsTrigger value="cartoes" className="flex items-center gap-2">
                        <CreditCard size={16} />
                        Cartões
                    </TabsTrigger>
                    <TabsTrigger value="vinculadas" className="flex items-center gap-2">
                        <Link2 size={16} />
                        Vinculadas
                    </TabsTrigger>
                </TabsList>

                {/* Tab Dashboard */}
                <TabsContent value="dashboard" className="space-y-xl mt-lg">
                    {resumo && (
                        <FinanceSummary
                            patrimonioTotal={resumo.patrimonioTotal}
                            receitasMes={resumo.receitasMes}
                            despesasMes={resumo.despesasMes}
                            saldoMes={resumo.saldoMes}
                            contasPagar={resumo.contasPagar}
                            contasReceber={resumo.contasReceber}
                            faturas={resumo.faturas}
                            orcamentos={resumo.orcamentos}
                            mesReferencia={resumo.mesReferencia}
                        />
                    )}

                    {/* Gráficos */}
                    {transacoes.length > 0 && (
                        <FinanceAnalytics transacoes={transacoes} />
                    )}
                </TabsContent>

                {/* Tab Transações */}
                <TabsContent value="transacoes" className="mt-lg">
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle className="flex items-center gap-2">
                                    <Wallet className="text-primary-gold" size={24} />
                                    Todas as Transações
                                </CardTitle>
                                <Button
                                    size="sm"
                                    onClick={() => setTransactionDialogOpen(true)}
                                >
                                    <Plus size={16} className="mr-2" />
                                    Nova
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-md">
                                {transacoes.length === 0 ? (
                                    <p className="text-caption text-text-secondary text-center py-8">
                                        Nenhuma transação registrada
                                    </p>
                                ) : (
                                    transacoes.map((transacao) => (
                                        <div
                                            key={transacao.id}
                                            className="flex items-center justify-between p-md rounded-lg hover:bg-white/5 transition-colors border border-white/10"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div
                                                    className={cn(
                                                        'w-10 h-10 rounded-full flex items-center justify-center',
                                                        transacao.tipo === 'receita'
                                                            ? 'bg-accent-success/20'
                                                            : 'bg-accent-error/20'
                                                    )}
                                                >
                                                    {transacao.tipo === 'receita' ? (
                                                        <TrendingUp className="text-accent-success" size={20} />
                                                    ) : (
                                                        <TrendingDown className="text-accent-error" size={20} />
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="text-body font-medium text-text-primary">
                                                        {transacao.descricao || transacao.categoria}
                                                    </p>
                                                    <p className="text-caption text-text-secondary">
                                                        {transacao.categoria}
                                                        {transacao.isParcelada && ` • ${transacao.numeroParcela}/${transacao.totalParcelas}`}
                                                        {transacao.vinculoLabel && (
                                                            <span className="text-primary-gold"> • {transacao.vinculoLabel}</span>
                                                        )}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="text-right">
                                                <p
                                                    className={cn(
                                                        'text-body-lg font-bold',
                                                        transacao.tipo === 'receita'
                                                            ? 'text-accent-success'
                                                            : 'text-accent-error'
                                                    )}
                                                >
                                                    {transacao.tipo === 'receita' ? '+' : '-'}
                                                    {formatarMoeda(transacao.valor)}
                                                </p>
                                                <p className="text-caption text-text-secondary">
                                                    {transacao.data.toLocaleDateString('pt-BR', {
                                                        day: '2-digit',
                                                        month: 'short',
                                                    })}
                                                    {transacao.status === 'pendente' && (
                                                        <span className="ml-2 text-yellow-400">• Pendente</span>
                                                    )}
                                                </p>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Tab Cartões */}
                <TabsContent value="cartoes" className="mt-lg">
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle className="flex items-center gap-2">
                                    <CreditCard className="text-primary-blue" size={24} />
                                    Cartões de Crédito
                                </CardTitle>
                                <Button
                                    size="sm"
                                    onClick={() => {
                                        setEditingCartao(undefined)
                                        setCartaoDialogOpen(true)
                                    }}
                                >
                                    <Plus size={16} className="mr-2" />
                                    Novo Cartão
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
                                {cartoes.length === 0 ? (
                                    <p className="text-caption text-text-secondary text-center py-8 col-span-2">
                                        Nenhum cartão cadastrado. Crie seu primeiro cartão!
                                    </p>
                                ) : (
                                    cartoes.map((cartao) => (
                                        <div
                                            key={cartao.id}
                                            className={cn(
                                                'p-6 rounded-xl border border-white/10',
                                                'bg-gradient-to-br from-white/10 to-white/5'
                                            )}
                                        >
                                            <div className="flex items-start justify-between mb-4">
                                                <div className="flex items-center gap-3">
                                                    <div className={cn('w-12 h-12 rounded-full flex items-center justify-center', cartao.cor)}>
                                                        <CreditCard size={24} className="text-white" />
                                                    </div>
                                                    <div>
                                                        <p className="text-body-lg font-semibold text-text-primary">
                                                            {cartao.nome}
                                                        </p>
                                                        <p className="text-caption text-text-secondary">
                                                            {cartao.bandeira.toUpperCase()}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex gap-1">
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={() => {
                                                            setEditingCartao(cartao)
                                                            setCartaoDialogOpen(true)
                                                        }}
                                                    >
                                                        <Edit3 size={14} />
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={() => handleDeleteCartao(cartao.id)}
                                                    >
                                                        <Trash2 size={14} className="text-accent-error" />
                                                    </Button>
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <div className="flex justify-between text-caption">
                                                    <span className="text-text-secondary">Limite</span>
                                                    <span className="text-text-primary font-medium">
                                                        {formatarMoeda(cartao.limite)}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between text-caption">
                                                    <span className="text-text-secondary">Fechamento</span>
                                                    <span className="text-text-primary">Dia {cartao.diaFechamento}</span>
                                                </div>
                                                <div className="flex justify-between text-caption">
                                                    <span className="text-text-secondary">Vencimento</span>
                                                    <span className="text-text-primary">Dia {cartao.diaVencimento}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Tab Vinculadas */}
                <TabsContent value="vinculadas" className="mt-lg">
                    {vinculadas && (
                        <LinkedTransactions
                            porModulo={vinculadas.porModulo}
                            total={vinculadas.total}
                        />
                    )}
                </TabsContent>
            </Tabs>

            {/* Dialogs */}
            <CartaoDialog
                open={cartaoDialogOpen}
                onOpenChange={setCartaoDialogOpen}
                onSubmit={handleSaveCartao}
                initialData={editingCartao}
                isEditing={!!editingCartao}
            />

            <TransactionForm
                open={transactionDialogOpen}
                onOpenChange={setTransactionDialogOpen}
                onSubmit={handleSaveTransaction}
                cartoes={cartoes}
                contas={contas}
            />
        </div>
    )
}
