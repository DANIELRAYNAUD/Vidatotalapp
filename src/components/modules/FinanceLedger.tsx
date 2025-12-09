/**
 * FinanceLedger - Componente estilo planilha para entrada de transações
 * Suporta Entradas, Saídas e Investimentos com categorização rigorosa
 */

import { useState, useMemo, useCallback } from 'react'
import { Plus, Trash2, Tag, ArrowUpCircle, ArrowDownCircle, TrendingUp, Filter } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { cn, formatarMoeda } from '@/lib/utils'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

// ===== TIPOS =====
export type TipoTransacao = 'receita' | 'despesa' | 'investimento'

export interface LedgerEntry {
    id: string
    tipo: TipoTransacao
    valor: number
    categoria: string
    descricao: string
    data: Date
    tags: string[]
    vinculoModulo?: {
        tipo: 'servico_medico' | 'casamento' | 'projeto'
        id: string
        label: string
    }
}

interface FinanceLedgerProps {
    entries: LedgerEntry[]
    onAddEntry: (entry: Omit<LedgerEntry, 'id'>) => void
    onRemoveEntry: (id: string) => void
    onUpdateEntry: (id: string, entry: Partial<LedgerEntry>) => void
}

// ===== CATEGORIAS PRÉ-DEFINIDAS =====
const CATEGORIAS = {
    receita: [
        { value: 'salario', label: 'Salário', icon: '💼' },
        { value: 'plantao', label: 'Plantão Médico', icon: '🏥' },
        { value: 'freelance', label: 'Freelance', icon: '💻' },
        { value: 'investimentos', label: 'Rendimentos', icon: '📈' },
        { value: 'outros', label: 'Outros', icon: '📋' },
    ],
    despesa: [
        { value: 'moradia', label: 'Moradia', icon: '🏠' },
        { value: 'alimentacao', label: 'Alimentação', icon: '🍽️' },
        { value: 'transporte', label: 'Transporte', icon: '🚗' },
        { value: 'saude', label: 'Saúde', icon: '💊' },
        { value: 'educacao', label: 'Educação', icon: '📚' },
        { value: 'lazer', label: 'Lazer', icon: '🎮' },
        { value: 'vestuario', label: 'Vestuário', icon: '👔' },
        { value: 'casamento', label: 'Casamento', icon: '💒' },
        { value: 'filhos', label: 'Filhos', icon: '👶' },
        { value: 'impostos', label: 'Impostos', icon: '📄' },
        { value: 'outros', label: 'Outros', icon: '📋' },
    ],
    investimento: [
        { value: 'renda_fixa', label: 'Renda Fixa', icon: '🏦' },
        { value: 'acoes', label: 'Ações', icon: '📊' },
        { value: 'fundos', label: 'Fundos', icon: '💹' },
        { value: 'cripto', label: 'Criptomoedas', icon: '₿' },
        { value: 'imoveis', label: 'Imóveis', icon: '🏢' },
        { value: 'outros', label: 'Outros', icon: '📋' },
    ]
}

// ===== CORES POR TIPO =====
const CORES_TIPO = {
    receita: { bg: 'bg-green-500/10', border: 'border-green-500/30', text: 'text-green-400', icon: ArrowUpCircle },
    despesa: { bg: 'bg-red-500/10', border: 'border-red-500/30', text: 'text-red-400', icon: ArrowDownCircle },
    investimento: { bg: 'bg-blue-500/10', border: 'border-blue-500/30', text: 'text-blue-400', icon: TrendingUp },
}

// ===== COMPONENTE PRINCIPAL =====
export function FinanceLedger({ entries, onAddEntry, onRemoveEntry, onUpdateEntry: _onUpdateEntry }: FinanceLedgerProps) {
    const [filtroTipo, setFiltroTipo] = useState<TipoTransacao | 'todos'>('todos')
    const [novaEntrada, setNovaEntrada] = useState<Partial<LedgerEntry>>({
        tipo: 'despesa',
        valor: 0,
        categoria: '',
        descricao: '',
        data: new Date(),
        tags: []
    })
    const [novaTag, setNovaTag] = useState('')

    // Filtrar entradas
    const entriesFiltradas = useMemo(() => {
        if (filtroTipo === 'todos') return entries
        return entries.filter(e => e.tipo === filtroTipo)
    }, [entries, filtroTipo])

    // Totais
    const totais = useMemo(() => {
        return entries.reduce((acc, e) => {
            if (e.tipo === 'receita') acc.receitas += e.valor
            else if (e.tipo === 'despesa') acc.despesas += e.valor
            else if (e.tipo === 'investimento') acc.investimentos += e.valor
            return acc
        }, { receitas: 0, despesas: 0, investimentos: 0 })
    }, [entries])

    const saldo = totais.receitas - totais.despesas - totais.investimentos

    // Adicionar nova entrada
    const handleAddEntry = useCallback(() => {
        if (!novaEntrada.valor || !novaEntrada.categoria || !novaEntrada.descricao) return

        onAddEntry({
            tipo: novaEntrada.tipo as TipoTransacao,
            valor: novaEntrada.valor,
            categoria: novaEntrada.categoria,
            descricao: novaEntrada.descricao,
            data: novaEntrada.data || new Date(),
            tags: novaEntrada.tags || []
        })

        // Reset form
        setNovaEntrada({
            tipo: 'despesa',
            valor: 0,
            categoria: '',
            descricao: '',
            data: new Date(),
            tags: []
        })
    }, [novaEntrada, onAddEntry])

    // Adicionar tag
    const handleAddTag = useCallback(() => {
        if (!novaTag.trim()) return
        setNovaEntrada(prev => ({
            ...prev,
            tags: [...(prev.tags || []), novaTag.trim()]
        }))
        setNovaTag('')
    }, [novaTag])

    const getCategorias = () => CATEGORIAS[novaEntrada.tipo as TipoTransacao] || []

    return (
        <div className="space-y-6">
            {/* Header com totais */}
            <div className="grid grid-cols-4 gap-4">
                <div className={cn(
                    'p-4 rounded-xl border',
                    'bg-white/5 backdrop-blur-sm border-white/10'
                )}>
                    <p className="text-xs text-text-tertiary mb-1">Receitas</p>
                    <p className="text-lg font-bold text-green-400">{formatarMoeda(totais.receitas)}</p>
                </div>
                <div className={cn(
                    'p-4 rounded-xl border',
                    'bg-white/5 backdrop-blur-sm border-white/10'
                )}>
                    <p className="text-xs text-text-tertiary mb-1">Despesas</p>
                    <p className="text-lg font-bold text-red-400">{formatarMoeda(totais.despesas)}</p>
                </div>
                <div className={cn(
                    'p-4 rounded-xl border',
                    'bg-white/5 backdrop-blur-sm border-white/10'
                )}>
                    <p className="text-xs text-text-tertiary mb-1">Investimentos</p>
                    <p className="text-lg font-bold text-blue-400">{formatarMoeda(totais.investimentos)}</p>
                </div>
                <div className={cn(
                    'p-4 rounded-xl border',
                    saldo >= 0 ? 'bg-green-500/10 border-green-500/30' : 'bg-red-500/10 border-red-500/30'
                )}>
                    <p className="text-xs text-text-tertiary mb-1">Saldo</p>
                    <p className={cn('text-lg font-bold', saldo >= 0 ? 'text-green-400' : 'text-red-400')}>
                        {formatarMoeda(saldo)}
                    </p>
                </div>
            </div>

            {/* Formulário de nova entrada (estilo planilha) */}
            <div className={cn(
                'p-4 rounded-xl border',
                'bg-white/5 backdrop-blur-xl border-white/20'
            )}>
                <h3 className="text-sm font-medium text-text-primary mb-4 flex items-center gap-2">
                    <Plus size={16} />
                    Nova Entrada
                </h3>

                <div className="grid grid-cols-5 gap-3 items-end">
                    {/* Tipo */}
                    <div>
                        <label className="text-xs text-text-tertiary mb-1 block">Tipo</label>
                        <Select
                            value={novaEntrada.tipo}
                            onValueChange={(v) => setNovaEntrada(prev => ({ ...prev, tipo: v as TipoTransacao, categoria: '' }))}
                        >
                            <SelectTrigger className="h-9">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="receita">
                                    <span className="flex items-center gap-2">
                                        <ArrowUpCircle size={14} className="text-green-400" />
                                        Receita
                                    </span>
                                </SelectItem>
                                <SelectItem value="despesa">
                                    <span className="flex items-center gap-2">
                                        <ArrowDownCircle size={14} className="text-red-400" />
                                        Despesa
                                    </span>
                                </SelectItem>
                                <SelectItem value="investimento">
                                    <span className="flex items-center gap-2">
                                        <TrendingUp size={14} className="text-blue-400" />
                                        Investimento
                                    </span>
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Categoria */}
                    <div>
                        <label className="text-xs text-text-tertiary mb-1 block">Categoria</label>
                        <Select
                            value={novaEntrada.categoria}
                            onValueChange={(v) => setNovaEntrada(prev => ({ ...prev, categoria: v }))}
                        >
                            <SelectTrigger className="h-9">
                                <SelectValue placeholder="Selecione..." />
                            </SelectTrigger>
                            <SelectContent>
                                {getCategorias().map(cat => (
                                    <SelectItem key={cat.value} value={cat.value}>
                                        <span className="flex items-center gap-2">
                                            <span>{cat.icon}</span>
                                            {cat.label}
                                        </span>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Descrição */}
                    <div>
                        <label className="text-xs text-text-tertiary mb-1 block">Descrição</label>
                        <Input
                            value={novaEntrada.descricao}
                            onChange={(e) => setNovaEntrada(prev => ({ ...prev, descricao: e.target.value }))}
                            placeholder="Ex: Salário mensal"
                            className="h-9"
                        />
                    </div>

                    {/* Valor */}
                    <div>
                        <label className="text-xs text-text-tertiary mb-1 block">Valor (R$)</label>
                        <Input
                            type="number"
                            step="0.01"
                            value={novaEntrada.valor || ''}
                            onChange={(e) => setNovaEntrada(prev => ({ ...prev, valor: parseFloat(e.target.value) || 0 }))}
                            placeholder="0,00"
                            className="h-9"
                        />
                    </div>

                    {/* Botão adicionar */}
                    <Button onClick={handleAddEntry} className="h-9">
                        <Plus size={16} className="mr-1" />
                        Adicionar
                    </Button>
                </div>

                {/* Tags */}
                <div className="mt-3 flex items-center gap-2">
                    <Tag size={14} className="text-text-tertiary" />
                    <Input
                        value={novaTag}
                        onChange={(e) => setNovaTag(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAddTag()}
                        placeholder="Adicionar tag..."
                        className="h-7 text-xs w-32"
                    />
                    {novaEntrada.tags?.map((tag, idx) => (
                        <Badge
                            key={idx}
                            variant="secondary"
                            className="text-xs cursor-pointer hover:bg-red-500/20"
                            onClick={() => setNovaEntrada(prev => ({
                                ...prev,
                                tags: prev.tags?.filter((_, i) => i !== idx)
                            }))}
                        >
                            {tag} ×
                        </Badge>
                    ))}
                </div>
            </div>

            {/* Filtros */}
            <div className="flex items-center gap-2">
                <Filter size={14} className="text-text-tertiary" />
                <div className="inline-flex rounded-lg bg-white/10 p-1">
                    {(['todos', 'receita', 'despesa', 'investimento'] as const).map(tipo => (
                        <button
                            key={tipo}
                            onClick={() => setFiltroTipo(tipo)}
                            className={cn(
                                'px-3 py-1 text-xs font-medium rounded-md transition-all',
                                filtroTipo === tipo
                                    ? 'bg-primary-green text-white'
                                    : 'text-text-secondary hover:text-text-primary'
                            )}
                        >
                            {tipo === 'todos' ? 'Todos' : tipo.charAt(0).toUpperCase() + tipo.slice(1)}
                        </button>
                    ))}
                </div>
                <span className="text-xs text-text-tertiary ml-auto">
                    {entriesFiltradas.length} registro(s)
                </span>
            </div>

            {/* Tabela de entradas (estilo planilha) */}
            <div className="rounded-xl border border-white/20 overflow-hidden">
                {/* Header da tabela */}
                <div className="grid grid-cols-[1fr_1fr_2fr_1fr_1fr_auto] gap-2 p-3 bg-white/10 text-xs font-medium text-text-secondary border-b border-white/10">
                    <span>Data</span>
                    <span>Tipo</span>
                    <span>Descrição</span>
                    <span>Categoria</span>
                    <span className="text-right">Valor</span>
                    <span className="w-8"></span>
                </div>

                {/* Corpo da tabela */}
                <div className="divide-y divide-white/5">
                    {entriesFiltradas.length === 0 ? (
                        <div className="p-8 text-center text-text-tertiary text-sm">
                            Nenhuma entrada encontrada
                        </div>
                    ) : (
                        entriesFiltradas.map(entry => {
                            const cores = CORES_TIPO[entry.tipo]
                            const IconeTipo = cores.icon
                            const categoria = CATEGORIAS[entry.tipo]?.find(c => c.value === entry.categoria)

                            return (
                                <div
                                    key={entry.id}
                                    className={cn(
                                        'grid grid-cols-[1fr_1fr_2fr_1fr_1fr_auto] gap-2 p-3 items-center',
                                        'hover:bg-white/5 transition-colors',
                                        cores.bg
                                    )}
                                >
                                    <span className="text-sm text-text-secondary">
                                        {format(entry.data, 'dd/MM/yy', { locale: ptBR })}
                                    </span>
                                    <span className={cn('flex items-center gap-1 text-sm', cores.text)}>
                                        <IconeTipo size={14} />
                                        {entry.tipo}
                                    </span>
                                    <div>
                                        <span className="text-sm text-text-primary">{entry.descricao}</span>
                                        {entry.tags.length > 0 && (
                                            <div className="flex gap-1 mt-0.5">
                                                {entry.tags.map((tag, idx) => (
                                                    <Badge key={idx} variant="outline" className="text-[10px] px-1 py-0">
                                                        {tag}
                                                    </Badge>
                                                ))}
                                            </div>
                                        )}
                                        {entry.vinculoModulo && (
                                            <span className="text-[10px] text-primary-blue">
                                                🔗 {entry.vinculoModulo.label}
                                            </span>
                                        )}
                                    </div>
                                    <span className="text-sm text-text-secondary">
                                        {categoria?.icon} {categoria?.label}
                                    </span>
                                    <span className={cn('text-sm font-medium text-right', cores.text)}>
                                        {formatarMoeda(entry.valor)}
                                    </span>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-7 w-7 text-text-tertiary hover:text-red-400"
                                        onClick={() => onRemoveEntry(entry.id)}
                                    >
                                        <Trash2 size={14} />
                                    </Button>
                                </div>
                            )
                        })
                    )}
                </div>
            </div>
        </div>
    )
}

export default FinanceLedger
