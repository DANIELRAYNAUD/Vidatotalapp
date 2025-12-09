import { useCallback } from 'react'
import { addMonths, format } from 'date-fns'

export interface ParcelaCalculada {
    numeroParcela: number
    valor: number
    dataCompra: Date
    mesReferencia: string  // "2025-12"
    dataVencimento: Date
}

export function useCreditCardLogic() {

    const calcularMesReferenciaPrimeiraParcela = useCallback((
        dataCompra: Date,
        diaFechamento: number
    ): Date => {
        const diaCompra = dataCompra.getDate()

        // Se comprou DEPOIS do fechamento, vai para fatura do mês seguinte ao próximo
        if (diaCompra > diaFechamento) {
            return addMonths(dataCompra, 2)
        }

        // Se comprou ANTES/NO fechamento, vai para fatura do próximo mês
        return addMonths(dataCompra, 1)
    }, [])

    const calcularValorParcelas = useCallback((
        valorTotal: number,
        numParcelas: number
    ): number[] => {
        // Arredondar para baixo com 2 casas decimais
        const valorParcela = Math.floor((valorTotal / numParcelas) * 100) / 100
        const parcelas = Array(numParcelas).fill(valorParcela)

        // Calcular diferença e adicionar na última parcela
        const somaAtual = valorParcela * numParcelas
        const diferenca = Math.round((valorTotal - somaAtual) * 100) / 100
        parcelas[parcelas.length - 1] += diferenca

        return parcelas
    }, [])

    const gerarParcelamento = useCallback((
        valorTotal: number,
        numParcelas: number,
        dataCompra: Date,
        diaFechamento: number,
        diaVencimento: number
    ): ParcelaCalculada[] => {
        const valorParcela = Math.floor((valorTotal / numParcelas) * 100) / 100
        const parcelas = Array(numParcelas).fill(valorParcela)
        const somaAtual = valorParcela * numParcelas
        const diferenca = Math.round((valorTotal - somaAtual) * 100) / 100
        parcelas[parcelas.length - 1] += diferenca

        const diaCompra = dataCompra.getDate()
        let primeiroMes = new Date(dataCompra)
        if (diaCompra > diaFechamento) {
            primeiroMes = addMonths(dataCompra, 2)
        } else {
            primeiroMes = addMonths(dataCompra, 1)
        }

        return parcelas.map((valor, index) => {
            const mesRef = addMonths(primeiroMes, index)
            const dataVenc = new Date(mesRef.getFullYear(), mesRef.getMonth(), diaVencimento)

            return {
                numeroParcela: index + 1,
                valor,
                dataCompra,
                mesReferencia: format(mesRef, 'yyyy-MM'),
                dataVencimento: dataVenc
            }
        })
    }, [])

    const calcularTotalFatura = useCallback((
        transacoes: any[],
        mesReferencia: string
    ): number => {
        return transacoes
            .filter(t => t.mesReferencia === mesReferencia && t.cartaoId)
            .reduce((total, t) => total + t.valor, 0)
    }, [])

    const getCorPorStatus = useCallback((
        status: 'pendente' | 'pago' | 'vencido' | 'cancelada',
        dataVencimento?: Date
    ): string => {
        if (status === 'pago') return 'bg-green-500'
        if (status === 'vencido' || status === 'cancelada') return 'bg-red-500'

        // Se pendente, verificar se está próximo do vencimento
        if (dataVencimento) {
            const hoje = new Date()
            const diasRestantes = Math.ceil((dataVencimento.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24))

            if (diasRestantes <= 5) return 'bg-yellow-500'
        }

        return 'bg-blue-500'
    }, [])

    return {
        calcularMesReferenciaPrimeiraParcela,
        calcularValorParcelas,
        gerarParcelamento,
        calcularTotalFatura,
        getCorPorStatus
    }
}
