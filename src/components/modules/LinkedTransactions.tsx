/**
 * LinkedTransactions - Exibe transações geradas automaticamente por outros módulos
 * Agrupa por módulo e permite navegação rápida
 */

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { cn, formatarMoeda } from '@/lib/utils'
import {
    Link2,
    Stethoscope,
    Heart,
    FolderKanban,
    Users,
    ChevronDown,
    ChevronUp,
    ExternalLink
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'

// ===== TIPOS =====
interface Transacao {
    id: string
    tipo: 'receita' | 'despesa'
    valor: number
    categoria: string
    descricao?: string
    data: string
    vinculoModulo: string
    vinculoId?: string
    vinculoLabel?: string
}

interface ModuloAgrupado {
    modulo: string
    label: string
    transacoes: Transacao[]
    totalReceitas: number
    totalDespesas: number
}

interface LinkedTransactionsProps {
    porModulo: ModuloAgrupado[]
    total: number
}

// ===== HELPERS =====
function getModuloIcon(modulo: string) {
    switch (modulo) {
        case 'servico_medico':
            return <Stethoscope className="text-blue-400" size={18} />
        case 'casamento':
            return <Heart className="text-pink-400" size={18} />
        case 'projeto':
            return <FolderKanban className="text-purple-400" size={18} />
        case 'familia':
            return <Users className="text-amber-400" size={18} />
        default:
            return <Link2 className="text-gray-400" size={18} />
    }
}

function getModuloRota(modulo: string) {
    switch (modulo) {
        case 'servico_medico':
            return '/servico-medico'
        case 'casamento':
            return '/casamento'
        case 'projeto':
            return '/projetos'
        case 'familia':
            return '/familia'
        default:
            return '/'
    }
}

function getModuloCor(modulo: string) {
    switch (modulo) {
        case 'servico_medico':
            return 'border-blue-500/30 bg-blue-500/5'
        case 'casamento':
            return 'border-pink-500/30 bg-pink-500/5'
        case 'projeto':
            return 'border-purple-500/30 bg-purple-500/5'
        case 'familia':
            return 'border-amber-500/30 bg-amber-500/5'
        default:
            return 'border-gray-500/30 bg-gray-500/5'
    }
}

// ===== COMPONENTE DE MÓDULO =====
function ModuloCard({ dados }: { dados: ModuloAgrupado }) {
    const [expandido, setExpandido] = useState(false)
    const navigate = useNavigate()

    const saldo = dados.totalReceitas - dados.totalDespesas

    return (
        <div className={cn(
            'rounded-xl border p-4',
            getModuloCor(dados.modulo)
        )}>
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    {getModuloIcon(dados.modulo)}
                    <span className="text-body font-medium text-text-primary">
                        {dados.label}
                    </span>
                    <span className="text-caption text-text-tertiary">
                        ({dados.transacoes.length})
                    </span>
                </div>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate(getModuloRota(dados.modulo))}
                >
                    <ExternalLink size={14} className="mr-1" />
                    Ver
                </Button>
            </div>

            {/* Resumo */}
            <div className="grid grid-cols-3 gap-2 mb-3">
                {dados.totalReceitas > 0 && (
                    <div className="text-center p-2 rounded-lg bg-emerald-500/10">
                        <p className="text-caption text-text-tertiary">Receitas</p>
                        <p className="text-caption font-bold text-emerald-400">
                            {formatarMoeda(dados.totalReceitas)}
                        </p>
                    </div>
                )}
                {dados.totalDespesas > 0 && (
                    <div className="text-center p-2 rounded-lg bg-orange-500/10">
                        <p className="text-caption text-text-tertiary">Despesas</p>
                        <p className="text-caption font-bold text-orange-400">
                            {formatarMoeda(dados.totalDespesas)}
                        </p>
                    </div>
                )}
                <div className={cn(
                    'text-center p-2 rounded-lg',
                    saldo >= 0 ? 'bg-emerald-500/10' : 'bg-red-500/10'
                )}>
                    <p className="text-caption text-text-tertiary">Saldo</p>
                    <p className={cn(
                        'text-caption font-bold',
                        saldo >= 0 ? 'text-emerald-400' : 'text-red-400'
                    )}>
                        {formatarMoeda(saldo)}
                    </p>
                </div>
            </div>

            {/* Expandir/Recolher */}
            <Button
                variant="ghost"
                size="sm"
                className="w-full"
                onClick={() => setExpandido(!expandido)}
            >
                {expandido ? (
                    <>
                        <ChevronUp size={14} className="mr-1" />
                        Recolher
                    </>
                ) : (
                    <>
                        <ChevronDown size={14} className="mr-1" />
                        Ver transações
                    </>
                )}
            </Button>

            {/* Lista de Transações */}
            {expandido && (
                <div className="mt-3 space-y-2 pt-3 border-t border-white/10">
                    {dados.transacoes.slice(0, 10).map((t) => (
                        <div
                            key={t.id}
                            className="flex items-center justify-between text-caption"
                        >
                            <div className="flex-1 min-w-0">
                                <p className="text-text-primary truncate">
                                    {t.vinculoLabel || t.descricao || t.categoria}
                                </p>
                                <p className="text-text-tertiary">
                                    {new Date(t.data).toLocaleDateString('pt-BR', {
                                        day: '2-digit',
                                        month: 'short'
                                    })}
                                </p>
                            </div>
                            <span className={cn(
                                'font-medium',
                                t.tipo === 'receita' ? 'text-emerald-400' : 'text-orange-400'
                            )}>
                                {t.tipo === 'receita' ? '+' : '-'}
                                {formatarMoeda(t.valor)}
                            </span>
                        </div>
                    ))}
                    {dados.transacoes.length > 10 && (
                        <p className="text-caption text-text-tertiary text-center pt-2">
                            + {dados.transacoes.length - 10} transações
                        </p>
                    )}
                </div>
            )}
        </div>
    )
}

// ===== COMPONENTE PRINCIPAL =====
export function LinkedTransactions({ porModulo, total }: LinkedTransactionsProps) {
    if (total === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Link2 className="text-primary-gold" size={20} />
                        Transações Vinculadas
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-caption text-text-secondary text-center py-4">
                        Nenhuma transação vinculada a outros módulos
                    </p>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Link2 className="text-primary-gold" size={20} />
                    Transações Vinculadas
                    <span className="text-caption text-text-tertiary font-normal">
                        ({total} total)
                    </span>
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
                    {porModulo.map((mod) => (
                        <ModuloCard key={mod.modulo} dados={mod} />
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}
