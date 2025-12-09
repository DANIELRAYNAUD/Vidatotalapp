/**
 * FinanceAnalytics - Dashboard com gráficos de fluxo de caixa e análise por categoria
 * Utiliza Recharts para visualizações interativas
 */

import { useMemo } from 'react'
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    BarChart,
    Bar,
    Legend
} from 'recharts'
import { cn, formatarMoeda } from '@/lib/utils'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, subMonths } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { TrendingUp, TrendingDown, PiggyBank, Wallet } from 'lucide-react'

// ===== TIPOS =====
interface Transacao {
    id: string
    tipo: 'receita' | 'despesa'
    valor: number
    categoria: string
    data: Date
}

interface FinanceAnalyticsProps {
    transacoes: Transacao[]
    mesAtual?: Date
}

// ===== CORES PARA GRÁFICOS =====
const CORES_CATEGORIAS = [
    '#10B981', // green
    '#3B82F6', // blue
    '#F59E0B', // amber
    '#EF4444', // red
    '#8B5CF6', // violet
    '#EC4899', // pink
    '#06B6D4', // cyan
    '#84CC16', // lime
    '#F97316', // orange
    '#6366F1', // indigo
]

// ===== COMPONENTE PRINCIPAL =====
export function FinanceAnalytics({ transacoes, mesAtual = new Date() }: FinanceAnalyticsProps) {

    // Dados para fluxo de caixa mensal
    const dadosFluxoCaixa = useMemo(() => {
        const inicio = startOfMonth(mesAtual)
        const fim = endOfMonth(mesAtual)
        const dias = eachDayOfInterval({ start: inicio, end: fim })

        return dias.map(dia => {
            const transacoesDia = transacoes.filter(t =>
                format(t.data, 'yyyy-MM-dd') === format(dia, 'yyyy-MM-dd')
            )

            const receitas = transacoesDia
                .filter(t => t.tipo === 'receita')
                .reduce((acc, t) => acc + t.valor, 0)

            const despesas = transacoesDia
                .filter(t => t.tipo === 'despesa')
                .reduce((acc, t) => acc + t.valor, 0)

            return {
                data: format(dia, 'dd'),
                receitas,
                despesas,
                saldo: receitas - despesas
            }
        })
    }, [transacoes, mesAtual])

    // Dados para despesas por categoria
    const despesasPorCategoria = useMemo(() => {
        const categorias: Record<string, number> = {}

        transacoes
            .filter(t => t.tipo === 'despesa')
            .forEach(t => {
                categorias[t.categoria] = (categorias[t.categoria] || 0) + t.valor
            })

        return Object.entries(categorias)
            .map(([categoria, valor]) => ({ categoria, valor }))
            .sort((a, b) => b.valor - a.valor)
    }, [transacoes])

    // Dados comparativos últimos 6 meses
    const dadosComparativos = useMemo(() => {
        const meses = []
        for (let i = 5; i >= 0; i--) {
            const mes = subMonths(mesAtual, i)
            const inicio = startOfMonth(mes)
            const fim = endOfMonth(mes)

            const transacoesMes = transacoes.filter(t =>
                t.data >= inicio && t.data <= fim
            )

            const receitas = transacoesMes
                .filter(t => t.tipo === 'receita')
                .reduce((acc, t) => acc + t.valor, 0)

            const despesas = transacoesMes
                .filter(t => t.tipo === 'despesa')
                .reduce((acc, t) => acc + t.valor, 0)

            meses.push({
                mes: format(mes, 'MMM', { locale: ptBR }),
                receitas,
                despesas,
                saldo: receitas - despesas
            })
        }
        return meses
    }, [transacoes, mesAtual])

    // Totais do mês
    const totaisMes = useMemo(() => {
        const inicio = startOfMonth(mesAtual)
        const fim = endOfMonth(mesAtual)

        const transacoesMes = transacoes.filter(t =>
            t.data >= inicio && t.data <= fim
        )

        return {
            receitas: transacoesMes.filter(t => t.tipo === 'receita').reduce((acc, t) => acc + t.valor, 0),
            despesas: transacoesMes.filter(t => t.tipo === 'despesa').reduce((acc, t) => acc + t.valor, 0),
            transacoes: transacoesMes.length
        }
    }, [transacoes, mesAtual])

    const saldoMes = totaisMes.receitas - totaisMes.despesas
    const taxaEconomia = totaisMes.receitas > 0
        ? ((totaisMes.receitas - totaisMes.despesas) / totaisMes.receitas * 100).toFixed(1)
        : '0'

    return (
        <div className="space-y-6">
            {/* Cards de KPIs */}
            <div className="grid grid-cols-4 gap-4">
                <KPICard
                    titulo="Receitas"
                    valor={formatarMoeda(totaisMes.receitas)}
                    icon={<TrendingUp className="text-green-400" size={20} />}
                    cor="green"
                />
                <KPICard
                    titulo="Despesas"
                    valor={formatarMoeda(totaisMes.despesas)}
                    icon={<TrendingDown className="text-red-400" size={20} />}
                    cor="red"
                />
                <KPICard
                    titulo="Saldo"
                    valor={formatarMoeda(saldoMes)}
                    icon={<Wallet className={saldoMes >= 0 ? 'text-green-400' : 'text-red-400'} size={20} />}
                    cor={saldoMes >= 0 ? 'green' : 'red'}
                />
                <KPICard
                    titulo="Taxa de Economia"
                    valor={`${taxaEconomia}%`}
                    icon={<PiggyBank className="text-blue-400" size={20} />}
                    cor="blue"
                />
            </div>

            {/* Gráfico de Fluxo de Caixa */}
            <div className={cn(
                'p-6 rounded-xl border',
                'bg-white/5 backdrop-blur-xl border-white/20'
            )}>
                <h3 className="text-sm font-medium text-text-primary mb-4">
                    📈 Fluxo de Caixa - {format(mesAtual, 'MMMM yyyy', { locale: ptBR })}
                </h3>
                <div className="h-[250px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={dadosFluxoCaixa}>
                            <defs>
                                <linearGradient id="colorReceitas" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="colorDespesas" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#EF4444" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                            <XAxis
                                dataKey="data"
                                stroke="rgba(255,255,255,0.5)"
                                fontSize={10}
                            />
                            <YAxis
                                stroke="rgba(255,255,255,0.5)"
                                fontSize={10}
                                tickFormatter={(v) => `R$${v / 1000}k`}
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: 'rgba(0,0,0,0.8)',
                                    border: '1px solid rgba(255,255,255,0.2)',
                                    borderRadius: '8px'
                                }}
                                formatter={(value: number) => formatarMoeda(value)}
                            />
                            <Area
                                type="monotone"
                                dataKey="receitas"
                                stroke="#10B981"
                                fillOpacity={1}
                                fill="url(#colorReceitas)"
                            />
                            <Area
                                type="monotone"
                                dataKey="despesas"
                                stroke="#EF4444"
                                fillOpacity={1}
                                fill="url(#colorDespesas)"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
                {/* Gráfico de Pizza - Despesas por Categoria */}
                <div className={cn(
                    'p-6 rounded-xl border',
                    'bg-white/5 backdrop-blur-xl border-white/20'
                )}>
                    <h3 className="text-sm font-medium text-text-primary mb-4">
                        🥧 Despesas por Categoria
                    </h3>
                    <div className="h-[200px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={despesasPorCategoria}
                                    dataKey="valor"
                                    nameKey="categoria"
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={80}
                                    label={({ categoria, percent }) =>
                                        `${categoria} (${(percent * 100).toFixed(0)}%)`
                                    }
                                    labelLine={false}
                                >
                                    {despesasPorCategoria.map((_, index) => (
                                        <Cell
                                            key={`cell-${index}`}
                                            fill={CORES_CATEGORIAS[index % CORES_CATEGORIAS.length]}
                                        />
                                    ))}
                                </Pie>
                                <Tooltip
                                    formatter={(value: number) => formatarMoeda(value)}
                                    contentStyle={{
                                        backgroundColor: 'rgba(0,0,0,0.8)',
                                        border: '1px solid rgba(255,255,255,0.2)',
                                        borderRadius: '8px'
                                    }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Comparativo Mensal */}
                <div className={cn(
                    'p-6 rounded-xl border',
                    'bg-white/5 backdrop-blur-xl border-white/20'
                )}>
                    <h3 className="text-sm font-medium text-text-primary mb-4">
                        📊 Comparativo Últimos 6 Meses
                    </h3>
                    <div className="h-[200px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={dadosComparativos}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                                <XAxis
                                    dataKey="mes"
                                    stroke="rgba(255,255,255,0.5)"
                                    fontSize={10}
                                />
                                <YAxis
                                    stroke="rgba(255,255,255,0.5)"
                                    fontSize={10}
                                    tickFormatter={(v) => `R$${v / 1000}k`}
                                />
                                <Tooltip
                                    formatter={(value: number) => formatarMoeda(value)}
                                    contentStyle={{
                                        backgroundColor: 'rgba(0,0,0,0.8)',
                                        border: '1px solid rgba(255,255,255,0.2)',
                                        borderRadius: '8px'
                                    }}
                                />
                                <Legend />
                                <Bar dataKey="receitas" fill="#10B981" name="Receitas" />
                                <Bar dataKey="despesas" fill="#EF4444" name="Despesas" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    )
}

// ===== COMPONENTE KPI CARD =====
interface KPICardProps {
    titulo: string
    valor: string
    icon: React.ReactNode
    cor: 'green' | 'red' | 'blue' | 'yellow'
}

function KPICard({ titulo, valor, icon, cor }: KPICardProps) {
    const corClasses = {
        green: 'bg-green-500/10 border-green-500/30',
        red: 'bg-red-500/10 border-red-500/30',
        blue: 'bg-blue-500/10 border-blue-500/30',
        yellow: 'bg-yellow-500/10 border-yellow-500/30',
    }

    return (
        <div className={cn(
            'p-4 rounded-xl border',
            'backdrop-blur-xl',
            corClasses[cor]
        )}>
            <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-text-tertiary">{titulo}</span>
                {icon}
            </div>
            <p className="text-xl font-bold text-text-primary">{valor}</p>
        </div>
    )
}

export default FinanceAnalytics
