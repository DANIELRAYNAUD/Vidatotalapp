import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export function formatarData(data: Date | string): string {
    const d = typeof data === 'string' ? new Date(data) : data
    return new Intl.DateTimeFormat('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    }).format(d)
}

export function formatarHora(data: Date | string): string {
    const d = typeof data === 'string' ? new Date(data) : data
    return new Intl.DateTimeFormat('pt-BR', {
        hour: '2-digit',
        minute: '2-digit',
    }).format(d)
}

export function formatarMoeda(valor: number, moeda: string = 'BRL'): string {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: moeda,
    }).format(valor)
}

export function formatarDuracao(segundos: number): string {
    const horas = Math.floor(segundos / 3600)
    const minutos = Math.floor((segundos % 3600) / 60)
    const segs = segundos % 60

    if (horas > 0) {
        return `${horas}h ${minutos}m`
    }
    if (minutos > 0) {
        return `${minutos}m ${segs}s`
    }
    return `${segs}s`
}
