import { useState, useMemo } from 'react'
import { format, addHours, startOfDay, isSameDay, isAfter, isBefore } from 'date-fns'
import { cn } from '@/lib/utils'
import { type Feriado, CORES_FERIADO } from '@/lib/holidays'

// ===== TIPOS =====
export type TimeSlotGranularity = '6h' | '1h'

export interface TimeSlot {
    id: string
    inicio: Date
    fim: Date
    label: string
    isPassado: boolean
    isFuturo: boolean
    isAtual: boolean
}

export interface EventoSlot {
    id: string
    titulo: string
    descricao?: string
    cor: string
    tipo?: string
    valorFinanceiro?: number
}

interface TimeSlotGridProps {
    data: Date
    granularidade: TimeSlotGranularity
    eventos: EventoSlot[]
    onSlotClick?: (slot: TimeSlot) => void
    feriado?: Feriado | null
}

// ===== LABELS PARA BLOCOS DE 6H =====
const LABELS_6H = ['Madrugada', 'Manhã', 'Tarde', 'Noite']

// ===== GERAR SLOTS =====
function gerarTimeSlots(data: Date, granularidade: TimeSlotGranularity): TimeSlot[] {
    const slots: TimeSlot[] = []
    const agora = new Date()
    const inicioDia = startOfDay(data)

    const numSlots = granularidade === '6h' ? 4 : 24
    const horasPorSlot = granularidade === '6h' ? 6 : 1

    for (let i = 0; i < numSlots; i++) {
        const inicio = addHours(inicioDia, i * horasPorSlot)
        const fim = addHours(inicio, horasPorSlot)

        const isAtual = isAfter(agora, inicio) && isBefore(agora, fim) && isSameDay(agora, data)
        const isPassado = isBefore(fim, agora)
        const isFuturo = isAfter(inicio, agora)

        let label: string
        if (granularidade === '6h') {
            label = LABELS_6H[i]
        } else {
            label = format(inicio, 'HH:mm')
        }

        slots.push({
            id: `slot-${i}`,
            inicio,
            fim,
            label,
            isPassado,
            isFuturo,
            isAtual
        })
    }

    return slots
}

// ===== COMPONENTE PRINCIPAL =====
export function TimeSlotGrid({ data, granularidade, eventos, onSlotClick, feriado }: TimeSlotGridProps) {
    const [hoveredSlot, setHoveredSlot] = useState<TimeSlot | null>(null)

    const slots = useMemo(() => gerarTimeSlots(data, granularidade), [data, granularidade])

    // Encontrar eventos para cada slot
    const getEventosDoSlot = (_slot: TimeSlot): EventoSlot[] => {
        return eventos.filter(_e => {
            // Lógica simplificada - eventos mostrados no slot se correspondem ao período
            return true // Será refinada quando integrarmos com a API
        })
    }

    return (
        <div className="space-y-2">
            {/* Header com feriado se aplicável */}
            {feriado && (
                <div className={cn(
                    'px-3 py-2 rounded-lg text-sm font-medium text-white',
                    CORES_FERIADO[feriado.tipo]
                )}>
                    🎉 {feriado.nome}
                </div>
            )}

            {/* Grid de Slots */}
            <div className={cn(
                'grid gap-1',
                granularidade === '6h' ? 'grid-cols-4' : 'grid-cols-6 lg:grid-cols-8'
            )}>
                {slots.map((slot) => {
                    const eventosSlot = getEventosDoSlot(slot)
                    const hasEventos = eventosSlot.length > 0

                    return (
                        <div
                            key={slot.id}
                            className="relative group"
                            onMouseEnter={() => setHoveredSlot(slot)}
                            onMouseLeave={() => setHoveredSlot(null)}
                            onClick={() => onSlotClick?.(slot)}
                        >
                            <div
                                className={cn(
                                    'p-2 rounded-lg border text-center cursor-pointer transition-all duration-200',
                                    'hover:scale-105 hover:shadow-lg',
                                    // Estados
                                    slot.isAtual && 'ring-2 ring-primary-green border-primary-green',
                                    slot.isPassado && 'opacity-60 bg-white/5',
                                    slot.isFuturo && 'bg-white/10 border-white/20',
                                    hasEventos && 'border-primary-blue bg-primary-blue/10',
                                    // Feriado
                                    feriado && 'bg-red-500/10 border-red-500/30'
                                )}
                            >
                                <span className={cn(
                                    'text-xs font-medium',
                                    slot.isAtual ? 'text-primary-green' : 'text-text-secondary',
                                    granularidade === '6h' && 'text-sm'
                                )}>
                                    {slot.label}
                                </span>

                                {/* Indicador de eventos */}
                                {hasEventos && (
                                    <div className="mt-1 flex justify-center gap-0.5">
                                        {eventosSlot.slice(0, 3).map((e, idx) => (
                                            <div
                                                key={idx}
                                                className={cn('w-1.5 h-1.5 rounded-full', e.cor || 'bg-primary-blue')}
                                            />
                                        ))}
                                        {eventosSlot.length > 3 && (
                                            <span className="text-[10px] text-text-tertiary">+{eventosSlot.length - 3}</span>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Glassmorphism Popover */}
                            {hoveredSlot?.id === slot.id && (
                                <GlassmorphismPopover
                                    slot={slot}
                                    eventos={eventosSlot}
                                    feriado={feriado}
                                />
                            )}
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

// ===== POPOVER COM GLASSMORPHISM =====
interface GlassmorphismPopoverProps {
    slot: TimeSlot
    eventos: EventoSlot[]
    feriado?: Feriado | null
}

function GlassmorphismPopover({ slot, eventos, feriado }: GlassmorphismPopoverProps) {
    return (
        <div
            className={cn(
                'absolute z-50 top-full left-1/2 -translate-x-1/2 mt-2',
                'min-w-[200px] max-w-[300px] p-4 rounded-xl',
                // Glassmorphism Effect
                'bg-white/10 backdrop-blur-xl',
                'border border-white/20',
                'shadow-2xl shadow-black/20',
                // Animation
                'animate-in fade-in-0 zoom-in-95 duration-200'
            )}
        >
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-semibold text-text-primary">
                    {slot.label}
                </span>
                <span className={cn(
                    'text-xs px-2 py-0.5 rounded-full',
                    slot.isPassado && 'bg-gray-500/20 text-gray-400',
                    slot.isAtual && 'bg-primary-green/20 text-primary-green',
                    slot.isFuturo && 'bg-primary-blue/20 text-primary-blue'
                )}>
                    {slot.isPassado ? 'Passado' : slot.isAtual ? 'Agora' : 'Futuro'}
                </span>
            </div>

            {/* Horário */}
            <div className="text-xs text-text-tertiary mb-3">
                {format(slot.inicio, 'HH:mm')} - {format(slot.fim, 'HH:mm')}
            </div>

            {/* Feriado */}
            {feriado && (
                <div className="mb-3 p-2 rounded-lg bg-red-500/20 border border-red-500/30">
                    <span className="text-xs text-red-400">🎉 {feriado.nome}</span>
                </div>
            )}

            {/* Eventos */}
            {eventos.length > 0 ? (
                <div className="space-y-2">
                    <span className="text-xs font-medium text-text-secondary">
                        {slot.isPassado ? 'O que aconteceu:' : 'O que vai acontecer:'}
                    </span>
                    {eventos.map((evento, idx) => (
                        <div
                            key={idx}
                            className="flex items-start gap-2 p-2 rounded-lg bg-white/5"
                        >
                            <div className={cn('w-2 h-2 rounded-full mt-1', evento.cor || 'bg-primary-blue')} />
                            <div className="flex-1 min-w-0">
                                <p className="text-sm text-text-primary truncate">{evento.titulo}</p>
                                {evento.descricao && (
                                    <p className="text-xs text-text-tertiary truncate">{evento.descricao}</p>
                                )}
                                {evento.valorFinanceiro !== undefined && (
                                    <p className="text-xs font-medium text-primary-green">
                                        R$ {evento.valorFinanceiro.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                    </p>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-3">
                    <span className="text-xs text-text-tertiary">
                        {slot.isPassado ? 'Nada registrado' : 'Nada agendado'}
                    </span>
                </div>
            )}
        </div>
    )
}

// ===== SELETOR DE GRANULARIDADE =====
interface GranularitySelectorProps {
    value: TimeSlotGranularity
    onChange: (value: TimeSlotGranularity) => void
}

export function GranularitySelector({ value, onChange }: GranularitySelectorProps) {
    return (
        <div className="inline-flex rounded-lg bg-white/10 p-1">
            <button
                onClick={() => onChange('6h')}
                className={cn(
                    'px-3 py-1.5 text-sm font-medium rounded-md transition-all',
                    value === '6h'
                        ? 'bg-primary-green text-white shadow-md'
                        : 'text-text-secondary hover:text-text-primary'
                )}
            >
                6 em 6h
            </button>
            <button
                onClick={() => onChange('1h')}
                className={cn(
                    'px-3 py-1.5 text-sm font-medium rounded-md transition-all',
                    value === '1h'
                        ? 'bg-primary-green text-white shadow-md'
                        : 'text-text-secondary hover:text-text-primary'
                )}
            >
                Hora a hora
            </button>
        </div>
    )
}
