/**
 * Sistema de Feriados Brasileiros - Nacional + Espírito Santo (ES)
 * Implementação otimizada para consulta rápida
 */

import { addDays, getYear, getDay } from 'date-fns'

// ===== TIPAGEM =====
export interface Feriado {
    data: Date
    nome: string
    tipo: 'nacional' | 'estadual' | 'municipal'
    fixo: boolean
}

// ===== FERIADOS FIXOS (Nacionais) =====
// Formato: [mês (0-indexado), dia]
const FERIADOS_NACIONAIS_FIXOS: [number, number, string][] = [
    [0, 1, 'Confraternização Universal'],       // 1 de Janeiro
    [3, 21, 'Tiradentes'],                       // 21 de Abril
    [4, 1, 'Dia do Trabalhador'],                // 1 de Maio
    [8, 7, 'Independência do Brasil'],           // 7 de Setembro
    [9, 12, 'Nossa Senhora Aparecida'],          // 12 de Outubro
    [10, 2, 'Finados'],                          // 2 de Novembro
    [10, 15, 'Proclamação da República'],        // 15 de Novembro
    [11, 25, 'Natal'],                           // 25 de Dezembro
]

// ===== FERIADOS FIXOS (Espírito Santo) =====
const FERIADOS_ES_FIXOS: [number, number, string][] = [
    [3, 23, 'Dia de São Jorge (ES)'],            // 23 de Abril (Padroeiro do ES)
    // Vitória (Capital)
    [8, 8, 'Aniversário de Vitória (Capital)'],  // 8 de Setembro
]

// ===== CÁLCULO DE PÁSCOA (Algoritmo de Gauss/Butcher) =====
function calcularPascoa(ano: number): Date {
    const a = ano % 19
    const b = Math.floor(ano / 100)
    const c = ano % 100
    const d = Math.floor(b / 4)
    const e = b % 4
    const f = Math.floor((b + 8) / 25)
    const g = Math.floor((b - f + 1) / 3)
    const h = (19 * a + b - d - g + 15) % 30
    const i = Math.floor(c / 4)
    const k = c % 4
    const l = (32 + 2 * e + 2 * i - h - k) % 7
    const m = Math.floor((a + 11 * h + 22 * l) / 451)
    const mes = Math.floor((h + l - 7 * m + 114) / 31) - 1  // Mês (0-indexado)
    const dia = ((h + l - 7 * m + 114) % 31) + 1

    return new Date(ano, mes, dia)
}

// ===== GERAR FERIADOS MÓVEIS =====
function gerarFeriadosMoveis(ano: number): Feriado[] {
    const pascoa = calcularPascoa(ano)

    return [
        {
            data: addDays(pascoa, -48),  // Carnaval (segunda-feira)
            nome: 'Carnaval',
            tipo: 'nacional',
            fixo: false
        },
        {
            data: addDays(pascoa, -47),  // Carnaval (terça-feira)
            nome: 'Carnaval',
            tipo: 'nacional',
            fixo: false
        },
        {
            data: addDays(pascoa, -46),  // Quarta-feira de Cinzas
            nome: 'Quarta-feira de Cinzas',
            tipo: 'nacional',
            fixo: false
        },
        {
            data: addDays(pascoa, -2),   // Sexta-feira Santa
            nome: 'Sexta-feira Santa',
            tipo: 'nacional',
            fixo: false
        },
        {
            data: pascoa,
            nome: 'Páscoa',
            tipo: 'nacional',
            fixo: false
        },
        {
            data: addDays(pascoa, 60),   // Corpus Christi
            nome: 'Corpus Christi',
            tipo: 'nacional',
            fixo: false
        },
    ]
}

// ===== GERAR TODOS OS FERIADOS DO ANO =====
export function gerarFeriadosAno(ano: number, incluirEstadual = true): Feriado[] {
    const feriados: Feriado[] = []

    // Feriados Nacionais Fixos
    for (const [mes, dia, nome] of FERIADOS_NACIONAIS_FIXOS) {
        feriados.push({
            data: new Date(ano, mes, dia),
            nome,
            tipo: 'nacional',
            fixo: true
        })
    }

    // Feriados Estaduais (ES) Fixos
    if (incluirEstadual) {
        for (const [mes, dia, nome] of FERIADOS_ES_FIXOS) {
            feriados.push({
                data: new Date(ano, mes, dia),
                nome,
                tipo: 'estadual',
                fixo: true
            })
        }
    }

    // Feriados Móveis
    feriados.push(...gerarFeriadosMoveis(ano))

    // Ordenar por data
    return feriados.sort((a, b) => a.data.getTime() - b.data.getTime())
}

// ===== VERIFICAR SE UMA DATA É FERIADO =====
export function ehFeriado(data: Date, feriados?: Feriado[]): Feriado | null {
    const ano = getYear(data)
    const lista = feriados || gerarFeriadosAno(ano)

    return lista.find(f =>
        f.data.getDate() === data.getDate() &&
        f.data.getMonth() === data.getMonth() &&
        f.data.getFullYear() === data.getFullYear()
    ) || null
}

// ===== OBTER FERIADOS DE UM MÊS =====
export function getFeriadosMes(ano: number, mes: number): Feriado[] {
    const feriados = gerarFeriadosAno(ano)
    return feriados.filter(f => f.data.getMonth() === mes)
}

// ===== PRÓXIMO DIA ÚTIL (Exclui feriados e fins de semana) =====
export function proximoDiaUtil(data: Date, feriadosAno?: Feriado[]): Date {
    const feriados = feriadosAno || gerarFeriadosAno(getYear(data))
    let resultado = new Date(data)

    while (true) {
        const diaSemana = getDay(resultado)
        const isFimDeSemana = diaSemana === 0 || diaSemana === 6
        const isFeriado = ehFeriado(resultado, feriados)

        if (!isFimDeSemana && !isFeriado) {
            return resultado
        }

        resultado = addDays(resultado, 1)
    }
}

// ===== CONTAR DIAS ÚTEIS ENTRE DUAS DATAS =====
export function contarDiasUteis(inicio: Date, fim: Date): number {
    const feriadosAno = gerarFeriadosAno(getYear(inicio))
    let count = 0
    let current = new Date(inicio)

    while (current <= fim) {
        const diaSemana = getDay(current)
        const isFimDeSemana = diaSemana === 0 || diaSemana === 6
        const isFeriado = ehFeriado(current, feriadosAno)

        if (!isFimDeSemana && !isFeriado) {
            count++
        }

        current = addDays(current, 1)
    }

    return count
}

// ===== MAPA DE CORES POR TIPO DE FERIADO =====
export const CORES_FERIADO = {
    nacional: 'bg-red-500',
    estadual: 'bg-purple-500',
    municipal: 'bg-blue-500'
}

// ===== EXPORTAR PRÉ-CALCULADOS (2024-2030) =====
export const FERIADOS_PRECALCULADOS: Record<number, Feriado[]> = {}
for (let ano = 2024; ano <= 2030; ano++) {
    FERIADOS_PRECALCULADOS[ano] = gerarFeriadosAno(ano)
}
