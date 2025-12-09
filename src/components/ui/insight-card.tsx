import { TrendingUp, TrendingDown } from 'lucide-react'
import { cn } from '@/lib/utils'

type GradientType = 'green-gold' | 'teal' | 'orange' | 'blue' | 'purple'

interface InsightCardProps {
    valor: string | number
    unidade?: string
    titulo: string
    descricao: string
    tendencia?: {
        direcao: 'cima' | 'baixo'
        valor: number
    }
    gradiente: GradientType
    className?: string
}

const gradientes: Record<GradientType, string> = {
    'green-gold': 'gradient-green-gold',
    'teal': 'gradient-teal',
    'orange': 'gradient-orange',
    'blue': 'gradient-blue',
    'purple': 'gradient-purple',
}

export function InsightCard({
    valor,
    unidade,
    titulo,
    descricao,
    tendencia,
    gradiente,
    className,
}: InsightCardProps) {
    return (
        <div
            className={cn(
                'relative overflow-hidden rounded-card-lg p-xl shadow-card hover:shadow-card-hover transition-all duration-300 glass-card',
                gradientes[gradiente],
                className
            )}
        >
            <div className="relative z-10">
                {/* Valor Principal */}
                <div className="flex items-baseline gap-2 mb-lg">
                    <span className="text-display text-text-primary font-bold">
                        {valor}
                    </span>
                    {unidade && (
                        <span className="text-h2 text-text-primary/90">
                            {unidade}
                        </span>
                    )}
                    {tendencia && (
                        <div
                            className={cn(
                                'flex items-center gap-1 px-2 py-1 rounded-full ml-2',
                                tendencia.direcao === 'cima' ? 'bg-accent-success/20' : 'bg-accent-error/20'
                            )}
                        >
                            {tendencia.direcao === 'cima' ? (
                                <TrendingUp className="text-accent-success" size={16} />
                            ) : (
                                <TrendingDown className="text-accent-error" size={16} />
                            )}
                            <span
                                className={cn(
                                    'text-caption font-medium',
                                    tendencia.direcao === 'cima' ? 'text-accent-success' : 'text-accent-error'
                                )}
                            >
                                {tendencia.valor}%
                            </span>
                        </div>
                    )}
                </div>

                {/* Título */}
                <p className="text-body-lg text-text-primary mb-sm font-medium">
                    {titulo}
                </p>

                {/* Descrição */}
                <p className="text-body text-text-secondary">
                    {descricao}
                </p>
            </div>

            {/* Overlay decorativo gradiente */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent pointer-events-none" />
        </div>
    )
}
