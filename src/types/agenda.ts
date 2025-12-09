// Tipos para eventos e integrações com a Agenda
export interface EventoFinanceiro {
    id: string
    titulo: string
    valor: number
    tipo: 'conta_pagar' | 'conta_receber' | 'fatura_cartao'
    status: 'pendente' | 'pago' | 'vencido'
    dataVencimento: Date
    origem: 'transacao' | 'cartao' | 'plantao' | 'projeto'
    descricao?: string
    categoria?: string
}

export interface EventoCalendario {
    id: string
    titulo: string
    dataHoraInicio: Date
    dataHoraFim: Date
    categoria: string
    cor: string
    tipo?: string  // manual, plantao, tarefa, consulta, financeiro
    editavel?: boolean
    diaInteiro?: boolean
    local?: string
    linkReuniao?: string
    descricao?: string

    // Para eventos financeiros
    valorFinanceiro?: number
    statusFinanceiro?: 'pendente' | 'pago' | 'vencido'
}
