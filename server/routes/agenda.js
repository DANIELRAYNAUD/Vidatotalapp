import express from 'express'
import { PrismaClient } from '@prisma/client'
import { authenticate } from '../middleware/auth.js'

const router = express.Router()
const prisma = new PrismaClient()

router.use(authenticate)

// Listar eventos
router.get('/', async (req, res, next) => {
    try {
        const userId = req.userId
        const { inicio, fim, categoria } = req.query

        const where = { userId }

        if (inicio || fim) {
            where.inicio = {}
            if (inicio) where.inicio.gte = new Date(inicio)
            if (fim) where.inicio.lte = new Date(fim)
        }

        if (categoria) where.categoria = categoria

        const eventos = await prisma.evento.findMany({
            where,
            orderBy: { inicio: 'asc' }
        })

        res.json(eventos)
    } catch (error) {
        next(error)
    }
})

// Criar evento
router.post('/', async (req, res, next) => {
    try {
        const userId = req.userId
        const { titulo, descricao, local, inicio, fim, diaInteiro, categoria, cor, recorrencia, lembretes, linkReuniao } = req.body

        if (!titulo || !inicio || !fim || !categoria || !cor) {
            return res.status(400).json({ error: 'Campos obrigatórios: titulo, inicio, fim, categoria, cor' })
        }

        const evento = await prisma.evento.create({
            data: {
                userId,
                titulo,
                descricao,
                local,
                inicio: new Date(inicio),
                fim: new Date(fim),
                diaInteiro: diaInteiro || false,
                categoria,
                cor,
                recorrencia: recorrencia ? JSON.stringify(recorrencia) : null,
                lembretes: lembretes ? JSON.stringify(lembretes) : null,
                linkReuniao
            }
        })

        res.status(201).json(evento)
    } catch (error) {
        next(error)
    }
})

// Atualizar evento
router.put('/:id', async (req, res, next) => {
    try {
        const { id } = req.params
        const userId = req.userId
        const { titulo, descricao, local, inicio, fim, diaInteiro, categoria, cor, recorrencia, lembretes, linkReuniao } = req.body

        const existing = await prisma.evento.findFirst({ where: { id, userId } })
        if (!existing) return res.status(404).json({ error: 'Evento não encontrado' })

        const evento = await prisma.evento.update({
            where: { id },
            data: {
                ...(titulo && { titulo }),
                ...(descricao !== undefined && { descricao }),
                ...(local !== undefined && { local }),
                ...(inicio && { inicio: new Date(inicio) }),
                ...(fim && { fim: new Date(fim) }),
                ...(diaInteiro !== undefined && { diaInteiro }),
                ...(categoria && { categoria }),
                ...(cor && { cor }),
                ...(recorrencia !== undefined && { recorrencia: recorrencia ? JSON.stringify(recorrencia) : null }),
                ...(lembretes !== undefined && { lembretes: lembretes ? JSON.stringify(lembretes) : null }),
                ...(linkReuniao !== undefined && { linkReuniao })
            }
        })

        res.json(evento)
    } catch (error) {
        next(error)
    }
})

// Deletar evento
router.delete('/:id', async (req, res, next) => {
    try {
        const { id } = req.params
        const userId = req.userId

        const existing = await prisma.evento.findFirst({ where: { id, userId } })
        if (!existing) return res.status(404).json({ error: 'Evento não encontrado' })

        await prisma.evento.delete({ where: { id } })
        res.status(204).send()
    } catch (error) {
        next(error)
    }
})

// Endpoint de agregação - Busca eventos de todos os módulos
router.get('/todos', async (req, res, next) => {
    try {
        const userId = req.userId
        const { inicio, fim } = req.query

        let dataInicio, dataFim
        if (inicio) dataInicio = new Date(inicio)
        if (fim) dataFim = new Date(fim)

        // 1. Eventos manuais da agenda
        const whereEventos = { userId }
        if (dataInicio || dataFim) {
            whereEventos.inicio = {}
            if (dataInicio) whereEventos.inicio.gte = dataInicio
            if (dataFim) whereEventos.inicio.lte = dataFim
        }

        const eventosManuais = await prisma.evento.findMany({
            where: whereEventos,
            orderBy: { inicio: 'asc' }
        })

        const eventosFormatados = eventosManuais.map(e => ({
            ...e,
            tipo: 'manual',
            editavel: true,
            dataHoraInicio: e.inicio,
            dataHoraFim: e.fim
        }))

        // 2. Plantões médicos
        const wherePlantoes = { userId }
        if (dataInicio || dataFim) {
            wherePlantoes.data = {}
            if (dataInicio) wherePlantoes.data.gte = dataInicio
            if (dataFim) wherePlantoes.data.lte = dataFim
        }

        const plantoes = await prisma.plantaoMedico.findMany({
            where: wherePlantoes,
            include: { empresa: true }
        }).catch(() => [])

        const eventosPlantoes = plantoes.map(p => {
            const dataFim = new Date(p.data)
            dataFim.setHours(dataFim.getHours() + 12) // Assume 12h de duração

            return {
                id: `plantao-${p.id}`,
                titulo: `🏥 Plantão - ${p.tipoServico}`,
                descricao: `${p.empresa?.nome || ''} - ${p.blocoHorario}`,
                dataHoraInicio: p.data,
                dataHoraFim: dataFim,
                categoria: 'trabalho',
                cor: 'bg-red-500',
                tipo: 'plantao',
                editavel: false,
                local: p.empresa?.nome
            }
        })

        // 3. Tarefas de projetos com deadline
        const whereTarefas = { userId }
        if (dataInicio || dataFim) {
            whereTarefas.dataLimite = { not: null }
            if (dataInicio || dataFim) {
                whereTarefas.dataLimite = {}
                if (dataInicio) whereTarefas.dataLimite.gte = dataInicio
                if (dataFim) whereTarefas.dataLimite.lte = dataFim
            }
        }

        const tarefas = await prisma.tarefa.findMany({
            where: whereTarefas,
            include: { projeto: true }
        }).catch(() => [])

        const eventosTarefas = tarefas.map(t => ({
            id: `tarefa-${t.id}`,
            titulo: `📋 ${t.titulo}`,
            descricao: `Projeto: ${t.projeto?.nome || 'Sem projeto'}`,
            dataHoraInicio: t.dataLimite,
            dataHoraFim: t.dataLimite,
            categoria: 'trabalho',
            cor: 'bg-blue-500',
            tipo: 'tarefa',
            editavel: false,
            diaInteiro: true
        }))

        // 4. Consultas médicas da família
        const whereConsultas = { userId }
        if (dataInicio || dataFim) {
            whereConsultas.dataHora = {}
            if (dataInicio) whereConsultas.dataHora.gte = dataInicio
            if (dataFim) whereConsultas.dataHora.lte = dataFim
        }

        const consultas = await prisma.consultaMedicaFamilia.findMany({
            where: whereConsultas,
            include: { membroFamilia: true }
        }).catch(() => [])

        const eventosConsultas = consultas.map(c => {
            const dataFim = new Date(c.dataHora)
            dataFim.setHours(dataFim.getHours() + 1) // Assume 1h de duração

            return {
                id: `consulta-${c.id}`,
                titulo: `🩺 ${c.tipo}`,
                descricao: `${c.membroFamilia?.nome || 'Familiar'} - ${c.profissional || ''}`,
                dataHoraInicio: c.dataHora,
                dataHoraFim: dataFim,
                categoria: 'saude',
                cor: 'bg-pink-500',
                tipo: 'consulta',
                editavel: false,
                local: c.local
            }
        })

        // 5. Eventos Financeiros - Faturas de Cartão
        const eventosFinanceiros = []

        // Buscar cartões do usuário
        const cartoes = await prisma.cartaoCredito.findMany({
            where: { userId, ativo: true }
        }).catch(() => [])

        // Para cada mês no período, calcular total da fatura
        if (cartoes.length > 0 && dataInicio && dataFim) {
            const mesesNoPeriodo = []
            let mesAtual = new Date(dataInicio)
            while (mesAtual <= dataFim) {
                mesesNoPeriodo.push(`${mesAtual.getFullYear()}-${String(mesAtual.getMonth() + 1).padStart(2, '0')}`)
                mesAtual.setMonth(mesAtual.getMonth() + 1)
            }

            for (const cartao of cartoes) {
                for (const mesRef of mesesNoPeriodo) {
                    // Buscar transações do cartão neste mês
                    const transacoesCartao = await prisma.transacao.findMany({
                        where: {
                            userId,
                            cartaoId: cartao.id,
                            mesReferencia: mesRef
                        }
                    }).catch(() => [])

                    if (transacoesCartao.length > 0) {
                        const totalFatura = transacoesCartao.reduce((sum, t) => sum + t.valor, 0)

                        // Data de vencimento da fatura
                        const [ano, mes] = mesRef.split('-')
                        const dataVencimento = new Date(parseInt(ano), parseInt(mes) - 1, cartao.diaVencimento)

                        // Determinar cor por status
                        const hoje = new Date()
                        let cor = 'bg-blue-500' // Pendente
                        if (dataVencimento < hoje) {
                            cor = 'bg-red-500' // Vencida
                        } else {
                            const diasRestantes = Math.ceil((dataVencimento.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24))
                            if (diasRestantes <= 5) {
                                cor = 'bg-yellow-500' // A vencer
                            }
                        }

                        eventosFinanceiros.push({
                            id: `fatura-${cartao.id}-${mesRef}`,
                            titulo: `💳 Fatura ${cartao.nome}`,
                            descricao: `Total: R$ ${totalFatura.toFixed(2)} (${transacoesCartao.length} transações)`,
                            dataHoraInicio: dataVencimento,
                            dataHoraFim: dataVencimento,
                            categoria: 'financeiro',
                            cor,
                            tipo: 'fatura_cartao',
                            editavel: false,
                            diaInteiro: true,
                            valorFinanceiro: totalFatura,
                            statusFinanceiro: dataVencimento < hoje ? 'vencido' : 'pendente'
                        })
                    }
                }
            }
        }

        // 6. Transações Pendentes (Contas a Pagar/Receber)
        const transacoesPendentes = await prisma.transacao.findMany({
            where: {
                userId,
                status: 'pendente',
                cartaoId: null, // Só transações diretas, não parcelas de cartão
                ...(dataInicio || dataFim ? {
                    data: {
                        ...(dataInicio && { gte: dataInicio }),
                        ...(dataFim && { lte: dataFim })
                    }
                } : {})
            }
        }).catch(() => [])

        const eventosTransacoes = transacoesPendentes.map(t => {
            const hoje = new Date()
            let cor = 'bg-blue-500'
            if (t.data < hoje) {
                cor = 'bg-red-500' // Vencida
            } else {
                const diasRestantes = Math.ceil((t.data.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24))
                if (diasRestantes <= 5) {
                    cor = 'bg-yellow-500' // A vencer
                }
            }

            return {
                id: `transacao-${t.id}`,
                titulo: t.tipo === 'receita' ? `💰 ${t.descricao || 'Receita'}` : `💸 ${t.descricao || 'Despesa'}`,
                descricao: `${t.categoria} - R$ ${t.valor.toFixed(2)}`,
                dataHoraInicio: t.data,
                dataHoraFim: t.data,
                categoria: 'financeiro',
                cor,
                tipo: t.tipo === 'receita' ? 'conta_receber' : 'conta_pagar',
                editavel: false,
                diaInteiro: true,
                valorFinanceiro: t.valor,
                statusFinanceiro: t.data < hoje ? 'vencido' : 'pendente'
            }
        })

        // Combinar e ordenar todos os eventos
        const todosEventos = [
            ...eventosFormatados,
            ...eventosPlantoes,
            ...eventosTarefas,
            ...eventosConsultas,
            ...eventosFinanceiros,
            ...eventosTransacoes
        ].sort((a, b) => new Date(a.dataHoraInicio).getTime() - new Date(b.dataHoraInicio).getTime())

        res.json(todosEventos)
    } catch (error) {
        console.error('Erro ao buscar eventos agregados:', error)
        next(error)
    }
})

export default router

