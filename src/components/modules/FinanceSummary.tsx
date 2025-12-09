/**
 * FinanceSummary - Exibe resumo financeiro consolidado no dashboard
 * Mostra métricas principais, contas pendentes e alertas
 */

import { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn, formatarMoeda } from '@/lib/utils'
import {
    Wallet,
    TrendingUp,
    TrendingDown,
    AlertTriangle,
    Clock,
    CreditCard,
    PiggyBank,
    ArrowUpCircle,
    ArrowDownCircle
} from 'lucide-react'

// ===== TIPOS =====
interface ContaPendente {
    id: string
    descricao?: string
    categoria: string
    valor: number
    data: string
    vinculoLabel?: string
}

interface Fatura {
    cartao: {
        id: string
        nome: string
        cor: string
    }
    total: number
    vencimento: number
}

interface Orcamento {
    id: string
    categoria: string
    limite: number
    gasto: number
    percentual: number
    excedido: boolean
}

interface FinanceSummaryProps {
    patrimonioTotal: number
    receitasMes: number
    despesasMes: number
    saldoMes: number
    contasPagar: {
        total: number
        quantidade: number
        items: ContaPendente[]
    }
    contasReceber: {
        total: number
        quantidade: number
        items: ContaPendente[]
    }
    faturas: {
        total: number
        items: Fatura[]
    }
    orcamentos: Orcamento[]
    mesReferencia: string
}

// ===== COMPONENTES AUXILIARES =====
function MetricaCard({
    titulo,
    valor,
    icon,
    cor,
    subtitulo
}: {
    titulo: string
    valor: string
    icon: React.ReactNode
    cor: 'green' | 'blue' | 'orange' | 'red' | 'purple'
    subtitulo?: string
}) {
    const cores = {
        green: 'from-emerald-500/20 to-emerald-600/10 border-emerald-500/30',
        blue: 'from-blue-500/20 to-blue-600/10 border-blue-500/30',
        orange: 'from-orange-500/20 to-orange-600/10 border-orange-500/30',
        red: 'from-red-500/20 to-red-600/10 border-red-500/30',
        purple: 'from-purple-500/20 to-purple-600/10 border-purple-500/30'
    }

    return (
        <div className={cn(
            'p-4 rounded-xl border bg-gradient-to-br backdrop-blur-xl',
            cores[cor]
        )}>
            <div className="flex items-center justify-between mb-2">
                <span className="text-caption text-text-secondary">{titulo}</span>
                {icon}
            </div>
            <p className="text-h3 font-bold text-text-primary">{valor}</p>
            {subtitulo && (
                <p className="text-caption text-text-tertiary mt-1">{subtitulo}</p>
            )}
        </div>
    )
}

function AlertaOrcamento({ orcamento }: { orcamento: Orcamento }) {
    return (
        <div className="flex items-center justify-between p-3 rounded-lg bg-red-500/10 border border-red-500/30">
            <div className="flex items-center gap-2">
                <AlertTriangle className="text-red-400" size={16} />
                <span className="text-caption text-text-primary">
                    {orcamento.categoria}
                </span>
            </div>
            <span className="text-caption text-red-400 font-medium">
                {orcamento.percentual}% do limite
            </span>
        </div>
    )
}

// ===== COMPONENTE PRINCIPAL =====
export function FinanceSummary({
    patrimonioTotal,
    receitasMes,
    despesasMes,
    saldoMes,
    contasPagar,
    contasReceber,
    faturas,
    orcamentos,
    mesReferencia: _mesReferencia
}: FinanceSummaryProps) {

    const orcamentosExcedidos = useMemo(() =>
        orcamentos.filter(o => o.excedido || o.percentual >= 80),
        [orcamentos]
    )

    const taxaEconomia = useMemo(() => {
        if (receitasMes === 0) return 0
        return Math.round((saldoMes / receitasMes) * 100)
    }, [receitasMes, saldoMes])

    return (
        <div className="space-y-lg">
            {/* Métricas Principais */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-md">
                <MetricaCard
                    titulo="Patrimônio Total"
                    valor={formatarMoeda(patrimonioTotal)}
                    icon={<PiggyBank className="text-purple-400" size={20} />}
                    cor="purple"
                    subtitulo="Soma de todas as contas"
                />
                <MetricaCard
                    titulo="Receitas do Mês"
                    valor={formatarMoeda(receitasMes)}
                    icon={<ArrowUpCircle className="text-emerald-400" size={20} />}
                    cor="green"
                />
                <MetricaCard
                    titulo="Despesas do Mês"
                    valor={formatarMoeda(despesasMes)}
                    icon={<ArrowDownCircle className="text-orange-400" size={20} />}
                    cor="orange"
                />
                <MetricaCard
                    titulo="Saldo do Mês"
                    valor={formatarMoeda(saldoMes)}
                    icon={saldoMes >= 0 ?
                        <TrendingUp className="text-emerald-400" size={20} /> :
                        <TrendingDown className="text-red-400" size={20} />
                    }
                    cor={saldoMes >= 0 ? 'green' : 'red'}
                    subtitulo={`Taxa de economia: ${taxaEconomia}%`}
                />
            </div>

            {/* Contas Pendentes e Faturas */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-lg">
                {/* Contas a Pagar */}
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="flex items-center gap-2 text-body-lg">
                            <Clock className="text-orange-400" size={18} />
                            Contas a Pagar
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-sm">
                            <div className="flex items-center justify-between">
                                <span className="text-h4 font-bold text-orange-400">
                                    {formatarMoeda(contasPagar.total)}
                                </span>
                                <span className="text-caption text-text-tertiary">
                                    {contasPagar.quantidade} pendente{contasPagar.quantidade !== 1 ? 's' : ''}
                                </span>
                            </div>
                            {contasPagar.items.length > 0 && (
                                <div className="space-y-2 pt-2 border-t border-white/10">
                                    {contasPagar.items.slice(0, 3).map((item) => (
                                        <div key={item.id} className="flex justify-between text-caption">
                                            <span className="text-text-secondary truncate max-w-[150px]">
                                                {item.vinculoLabel || item.descricao || item.categoria}
                                            </span>
                                            <span className="text-text-primary font-medium">
                                                {formatarMoeda(item.valor)}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Contas a Receber */}
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="flex items-center gap-2 text-body-lg">
                            <Wallet className="text-emerald-400" size={18} />
                            Contas a Receber
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-sm">
                            <div className="flex items-center justify-between">
                                <span className="text-h4 font-bold text-emerald-400">
                                    {formatarMoeda(contasReceber.total)}
                                </span>
                                <span className="text-caption text-text-tertiary">
                                    {contasReceber.quantidade} pendente{contasReceber.quantidade !== 1 ? 's' : ''}
                                </span>
                            </div>
                            {contasReceber.items.length > 0 && (
                                <div className="space-y-2 pt-2 border-t border-white/10">
                                    {contasReceber.items.slice(0, 3).map((item) => (
                                        <div key={item.id} className="flex justify-between text-caption">
                                            <span className="text-text-secondary truncate max-w-[150px]">
                                                {item.vinculoLabel || item.descricao || item.categoria}
                                            </span>
                                            <span className="text-text-primary font-medium">
                                                {formatarMoeda(item.valor)}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Faturas de Cartão */}
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="flex items-center gap-2 text-body-lg">
                            <CreditCard className="text-blue-400" size={18} />
                            Faturas do Mês
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-sm">
                            <div className="flex items-center justify-between">
                                <span className="text-h4 font-bold text-blue-400">
                                    {formatarMoeda(faturas.total)}
                                </span>
                                <span className="text-caption text-text-tertiary">
                                    {faturas.items.length} cartão{faturas.items.length !== 1 ? 'ões' : ''}
                                </span>
                            </div>
                            {faturas.items.length > 0 && (
                                <div className="space-y-2 pt-2 border-t border-white/10">
                                    {faturas.items.map((fatura) => (
                                        <div key={fatura.cartao.id} className="flex justify-between text-caption">
                                            <div className="flex items-center gap-2">
                                                <div className={cn('w-2 h-2 rounded-full', fatura.cartao.cor)} />
                                                <span className="text-text-secondary">
                                                    {fatura.cartao.nome}
                                                </span>
                                            </div>
                                            <span className="text-text-primary font-medium">
                                                {formatarMoeda(fatura.total)}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Alertas de Orçamento */}
            {orcamentosExcedidos.length > 0 && (
                <Card className="border-red-500/30 bg-red-500/5">
                    <CardHeader className="pb-2">
                        <CardTitle className="flex items-center gap-2 text-body-lg text-red-400">
                            <AlertTriangle size={18} />
                            Alertas de Orçamento
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            {orcamentosExcedidos.map((orc) => (
                                <AlertaOrcamento key={orc.id} orcamento={orc} />
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
