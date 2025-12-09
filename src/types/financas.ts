// Tipos para o sistema financeiro avançado
export interface CartaoCredito {
    id: string
    userId: string
    nome: string
    bandeira: 'visa' | 'mastercard' | 'elo' | 'amex'
    limite: number
    diaFechamento: number  // 1-31
    diaVencimento: number  // 1-31
    cor: string
    ativo: boolean
    createdAt?: Date
    updatedAt?: Date
}

export interface Transacao {
    id: string
    userId: string
    contaId?: string
    cartaoId?: string
    tipo: 'receita' | 'despesa'
    valor: number
    categoria: string
    descricao?: string
    data: Date
    status: 'efetivada' | 'pendente' | 'cancelada'

    // Parcelamento
    isParcelada: boolean
    numeroParcela?: number
    totalParcelas?: number
    grupoParcelasId?: string

    // Fatura
    mesReferencia?: string  // "2025-12"

    // Cross-linking com outros módulos
    vinculoModulo?: string  // servico_medico, casamento, projeto, familia
    vinculoId?: string
    vinculoLabel?: string

    tags?: string[]
    receiptUrl?: string
    recorrente: boolean
    recorrencia?: RecorrenciaConfig

    // Relations (opcional, vindo do backend)
    conta?: { nome: string; tipo: string }
    cartao?: CartaoCredito

    createdAt?: Date
    updatedAt?: Date
}

export interface RecorrenciaConfig {
    frequencia: 'mensal' | 'semanal' | 'anual'
    intervalo: number
    dataFim?: Date
}

export interface ParcelamentoPreview {
    parcela: number
    valor: number
    dataVencimento: Date
    mesReferencia: string
}

export interface Conta {
    id: string
    userId: string
    nome: string
    tipo: 'corrente' | 'poupanca' | 'investimento'
    saldo: number
    moeda: string
    instituicao?: string
    createdAt?: Date
    updatedAt?: Date
}

export interface Orcamento {
    id: string
    userId: string
    categoria: string
    limite: number
    periodo: 'semanal' | 'mensal' | 'anual'
    gasto?: number  // Calculado no frontend
    cor?: string
    createdAt?: Date
    updatedAt?: Date
}
