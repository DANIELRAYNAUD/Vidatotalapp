import express from 'express'
import { PrismaClient } from '@prisma/client'
import { authenticate } from '../middleware/auth.js'

const router = express.Router()
const prisma = new PrismaClient()

router.use(authenticate)

// ===== CONTAS =====

router.get('/contas', async (req, res, next) => {
    try {
        const userId = req.userId
        const contas = await prisma.conta.findMany({
            where: { userId },
            orderBy: { nome: 'asc' }
        })
        res.json(contas)
    } catch (error) {
        next(error)
    }
})

router.post('/contas', async (req, res, next) => {
    try {
        const userId = req.userId
        const { nome, tipo, saldo, moeda, instituicao } = req.body

        if (!nome || !tipo || saldo === undefined) {
            return res.status(400).json({ error: 'Campos obrigatórios: nome, tipo, saldo' })
        }

        const conta = await prisma.conta.create({
            data: {
                userId,
                nome,
                tipo,
                saldo: parseFloat(saldo),
                moeda: moeda || 'BRL',
                instituicao
            }
        })
        res.status(201).json(conta)
    } catch (error) {
        next(error)
    }
})

router.put('/contas/:id', async (req, res, next) => {
    try {
        const { id } = req.params
        const userId = req.userId
        const { nome, tipo, saldo, moeda, instituicao } = req.body

        const existing = await prisma.conta.findFirst({ where: { id, userId } })
        if (!existing) return res.status(404).json({ error: 'Conta não encontrada' })

        const conta = await prisma.conta.update({
            where: { id },
            data: {
                ...(nome && { nome }),
                ...(tipo && { tipo }),
                ...(saldo !== undefined && { saldo: parseFloat(saldo) }),
                ...(moeda && { moeda }),
                ...(instituicao !== undefined && { instituicao })
            }
        })
        res.json(conta)
    } catch (error) {
        next(error)
    }
})

router.delete('/contas/:id', async (req, res, next) => {
    try {
        const { id } = req.params
        const userId = req.userId

        const existing = await prisma.conta.findFirst({ where: { id, userId } })
        if (!existing) return res.status(404).json({ error: 'Conta não encontrada' })

        await prisma.conta.delete({ where: { id } })
        res.status(204).send()
    } catch (error) {
        next(error)
    }
})

// ===== TRANSAÇÕES =====

router.get('/transacoes', async (req, res, next) => {
    try {
        const userId = req.userId
        const { contaId, inicio, fim, tipo, categoria } = req.query

        const where = { userId }
        if (contaId) where.contaId = contaId
        if (tipo) where.tipo = tipo
        if (categoria) where.categoria = categoria
        if (inicio || fim) {
            where.data = {}
            if (inicio) where.data.gte = new Date(inicio)
            if (fim) where.data.lte = new Date(fim)
        }

        const transacoes = await prisma.transacao.findMany({
            where,
            orderBy: { data: 'desc' }
        })
        res.json(transacoes)
    } catch (error) {
        next(error)
    }
})

router.post('/transacoes', async (req, res, next) => {
    try {
        const userId = req.userId
        const { contaId, tipo, valor, categoria, descricao, data, tags, receiptUrl, recorrente, recorrencia } = req.body

        if (!contaId || !tipo || !valor || !categoria || !data) {
            return res.status(400).json({ error: 'Campos obrigatórios: contaId, tipo, valor, categoria, data' })
        }

        // Verificar se conta pertence ao usuário
        const conta = await prisma.conta.findFirst({ where: { id: contaId, userId } })
        if (!conta) return res.status(404).json({ error: 'Conta não encontrada' })

        const transacao = await prisma.transacao.create({
            data: {
                userId,
                contaId,
                tipo,
                valor: parseFloat(valor),
                categoria,
                descricao,
                data: new Date(data),
                tags: tags ? JSON.stringify(tags) : null,
                receiptUrl,
                recorrente: recorrente || false,
                recorrencia: recorrencia ? JSON.stringify(recorrencia) : null
            }
        })

        // Atualizar saldo da conta
        const novoSaldo = tipo === 'receita'
            ? conta.saldo + parseFloat(valor)
            : conta.saldo - parseFloat(valor)

        await prisma.conta.update({
            where: { id: contaId },
            data: { saldo: novoSaldo }
        })

        res.status(201).json(transacao)
    } catch (error) {
        next(error)
    }
})

router.delete('/transacoes/:id', async (req, res, next) => {
    try {
        const { id } = req.params
        const userId = req.userId

        const transacao = await prisma.transacao.findFirst({ where: { id, userId } })
        if (!transacao) return res.status(404).json({ error: 'Transação não encontrada' })

        // Reverter saldo da conta
        const conta = await prisma.conta.findUnique({ where: { id: transacao.contaId } })
        if (conta) {
            const novoSaldo = transacao.tipo === 'receita'
                ? conta.saldo - transacao.valor
                : conta.saldo + transacao.valor

            await prisma.conta.update({
                where: { id: conta.id },
                data: { saldo: novoSaldo }
            })
        }

        await prisma.transacao.delete({ where: { id } })
        res.status(204).send()
    } catch (error) {
        next(error)
    }
})

// ===== ORÇAMENTOS =====

router.get('/orcamentos', async (req, res, next) => {
    try {
        const userId = req.userId
        const orcamentos = await prisma.orcamento.findMany({
            where: { userId },
            orderBy: { categoria: 'asc' }
        })
        res.json(orcamentos)
    } catch (error) {
        next(error)
    }
})

router.post('/orcamentos', async (req, res, next) => {
    try {
        const userId = req.userId
        const { categoria, limite, periodo } = req.body

        if (!categoria || !limite) {
            return res.status(400).json({ error: 'Campos obrigatórios: categoria, limite' })
        }

        const orcamento = await prisma.orcamento.create({
            data: {
                userId,
                categoria,
                limite: parseFloat(limite),
                periodo: periodo || 'mensal'
            }
        })
        res.status(201).json(orcamento)
    } catch (error) {
        next(error)
    }
})

router.delete('/orcamentos/:id', async (req, res, next) => {
    try {
        const { id } = req.params
        const userId = req.userId

        const existing = await prisma.orcamento.findFirst({ where: { id, userId } })
        if (!existing) return res.status(404).json({ error: 'Orçamento não encontrado' })

        await prisma.orcamento.delete({ where: { id } })
        res.status(204).send()
    } catch (error) {
        next(error)
    }
})

// ===== CARTÕES DE CRÉDITO =====

router.get('/cartoes', async (req, res, next) => {
    try {
        const userId = req.userId
        const cartoes = await prisma.cartaoCredito.findMany({
            where: { userId },
            orderBy: { nome: 'asc' }
        })
        res.json(cartoes)
    } catch (error) {
        next(error)
    }
})

router.post('/cartoes', async (req, res, next) => {
    try {
        const userId = req.userId
        const { nome, bandeira, limite, diaFechamento, diaVencimento, cor } = req.body

        if (!nome || !bandeira || !limite || !diaFechamento || !diaVencimento) {
            return res.status(400).json({
                error: 'Campos obrigatórios: nome, bandeira, limite, diaFechamento, diaVencimento'
            })
        }

        const cartao = await prisma.cartaoCredito.create({
            data: {
                userId,
                nome,
                bandeira,
                limite: parseFloat(limite),
                diaFechamento: parseInt(diaFechamento),
                diaVencimento: parseInt(diaVencimento),
                cor: cor || 'bg-blue-500'
            }
        })
        res.status(201).json(cartao)
    } catch (error) {
        next(error)
    }
})

router.put('/cartoes/:id', async (req, res, next) => {
    try {
        const { id } = req.params
        const userId = req.userId
        const { nome, bandeira, limite, diaFechamento, diaVencimento, cor, ativo } = req.body

        const existing = await prisma.cartaoCredito.findFirst({ where: { id, userId } })
        if (!existing) return res.status(404).json({ error: 'Cartão não encontrado' })

        const cartao = await prisma.cartaoCredito.update({
            where: { id },
            data: {
                ...(nome && { nome }),
                ...(bandeira && { bandeira }),
                ...(limite !== undefined && { limite: parseFloat(limite) }),
                ...(diaFechamento !== undefined && { diaFechamento: parseInt(diaFechamento) }),
                ...(diaVencimento !== undefined && { diaVencimento: parseInt(diaVencimento) }),
                ...(cor && { cor }),
                ...(ativo !== undefined && { ativo })
            }
        })
        res.json(cartao)
    } catch (error) {
        next(error)
    }
})

router.delete('/cartoes/:id', async (req, res, next) => {
    try {
        const { id } = req.params
        const userId = req.userId

        const existing = await prisma.cartaoCredito.findFirst({ where: { id, userId } })
        if (!existing) return res.status(404).json({ error: 'Cartão não encontrado' })

        await prisma.cartaoCredito.delete({ where: { id } })
        res.status(204).send()
    } catch (error) {
        next(error)
    }
})

// ===== PARCELAMENTO INTELIGENTE =====

/**
 * POST /api/financas/parcelar
 * Cria uma compra parcelada no cartão de crédito
 * Body: { cartaoId, valor, numParcelas, categoria, descricao, dataCompra }
 */
router.post('/parcelar', async (req, res, next) => {
    try {
        const userId = req.userId
        const { cartaoId, valor, numParcelas, categoria, descricao, dataCompra } = req.body

        if (!cartaoId || !valor || !numParcelas || !categoria) {
            return res.status(400).json({
                error: 'Campos obrigatórios: cartaoId, valor, numParcelas, categoria'
            })
        }

        // Buscar cartão
        const cartao = await prisma.cartaoCredito.findFirst({ where: { id: cartaoId, userId } })
        if (!cartao) return res.status(404).json({ error: 'Cartão não encontrado' })

        const data = dataCompra ? new Date(dataCompra) : new Date()
        const valorTotal = parseFloat(valor)
        const parcelas = parseInt(numParcelas)

        // Calcular valores das parcelas (problema dos centavos)
        const valorParcela = Math.floor((valorTotal / parcelas) * 100) / 100
        const valores = Array(parcelas).fill(valorParcela)
        const somaAtual = valorParcela * parcelas
        const diferenca = Math.round((valorTotal - somaAtual) * 100) / 100
        valores[valores.length - 1] += diferenca

        // Calcular mês de referência da primeira parcela (regra do fechamento)
        const diaCompra = data.getDate()
        let primeiroMes = new Date(data)
        if (diaCompra > cartao.diaFechamento) {
            // Passou do fechamento, vai para fatura do mês seguinte ao próximo
            primeiroMes.setMonth(primeiroMes.getMonth() + 2)
        } else {
            // Antes do fechamento, vai para fatura do próximo mês
            primeiroMes.setMonth(primeiroMes.getMonth() + 1)
        }

        // Gerar ID único para o grupo de parcelas
        const grupoParcelasId = `grupo-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

        // Criar todas as transações (parcelas)
        const transacoesCriadas = []
        for (let i = 0; i < valores.length; i++) {
            const mesRef = new Date(primeiroMes)
            mesRef.setMonth(mesRef.getMonth() + i)
            const mesReferencia = `${mesRef.getFullYear()}-${String(mesRef.getMonth() + 1).padStart(2, '0')}`

            const transacao = await prisma.transacao.create({
                data: {
                    userId,
                    cartaoId,
                    tipo: 'despesa',
                    valor: valores[i],
                    categoria,
                    descricao: `${descricao || 'Compra parcelada'} (${i + 1}/${parcelas})`,
                    data: data,
                    status: 'pendente',
                    isParcelada: true,
                    numeroParcela: i + 1,
                    totalParcelas: parcelas,
                    grupoParcelasId,
                    mesReferencia
                }
            })
            transacoesCriadas.push(transacao)
        }

        res.status(201).json({
            message: `${parcelas} parcelas criadas com sucesso`,
            grupoParcelasId,
            parcelas: transacoesCriadas
        })
    } catch (error) {
        next(error)
    }
})

/**
 * GET /api/financas/faturas/:mesReferencia
 * Busca todas as transações de cartão de um mês específico
 */
router.get('/faturas/:mesReferencia', async (req, res, next) => {
    try {
        const userId = req.userId
        const { mesReferencia } = req.params  // "2025-12"

        const transacoes = await prisma.transacao.findMany({
            where: {
                userId,
                cartaoId: { not: null },
                mesReferencia
            },
            include: {
                cartao: true
            },
            orderBy: { data: 'desc' }
        })

        // Agrupar por cartão
        const faturasPorCartao = {}
        transacoes.forEach(t => {
            if (!faturasPorCartao[t.cartaoId]) {
                faturasPorCartao[t.cartaoId] = {
                    cartao: t.cartao,
                    transacoes: [],
                    total: 0
                }
            }
            faturasPorCartao[t.cartaoId].transacoes.push(t)
            faturasPorCartao[t.cartaoId].total += t.valor
        })

        res.json(faturasPorCartao)
    } catch (error) {
        next(error)
    }
})

// ===== DASHBOARD CONSOLIDADO =====

/**
 * GET /api/financas/resumo
 * Retorna resumo financeiro consolidado para o dashboard
 */
router.get('/resumo', async (req, res, next) => {
    try {
        const userId = req.userId
        const agora = new Date()
        const inicioMes = new Date(agora.getFullYear(), agora.getMonth(), 1)
        const fimMes = new Date(agora.getFullYear(), agora.getMonth() + 1, 0, 23, 59, 59)

        // Buscar todas as contas para patrimônio total
        const contas = await prisma.conta.findMany({ where: { userId } })
        const patrimonioTotal = contas.reduce((sum, c) => sum + c.saldo, 0)

        // Buscar transações do mês atual
        const transacoesMes = await prisma.transacao.findMany({
            where: {
                userId,
                data: { gte: inicioMes, lte: fimMes }
            }
        })

        const receitasMes = transacoesMes
            .filter(t => t.tipo === 'receita' && t.status === 'efetivada')
            .reduce((sum, t) => sum + t.valor, 0)

        const despesasMes = transacoesMes
            .filter(t => t.tipo === 'despesa' && t.status === 'efetivada')
            .reduce((sum, t) => sum + t.valor, 0)

        const saldoMes = receitasMes - despesasMes

        // Contas pendentes
        const contasPagar = await prisma.transacao.findMany({
            where: {
                userId,
                tipo: 'despesa',
                status: 'pendente'
            },
            orderBy: { data: 'asc' }
        })

        const contasReceber = await prisma.transacao.findMany({
            where: {
                userId,
                tipo: 'receita',
                status: 'pendente'
            },
            orderBy: { data: 'asc' }
        })

        const totalPagar = contasPagar.reduce((sum, t) => sum + t.valor, 0)
        const totalReceber = contasReceber.reduce((sum, t) => sum + t.valor, 0)

        // Buscar cartões e calcular faturas
        const cartoes = await prisma.cartaoCredito.findMany({ where: { userId, ativo: true } })
        const mesAtual = `${agora.getFullYear()}-${String(agora.getMonth() + 1).padStart(2, '0')}`

        const faturas = await Promise.all(cartoes.map(async (cartao) => {
            const transacoesCartao = await prisma.transacao.findMany({
                where: { userId, cartaoId: cartao.id, mesReferencia: mesAtual }
            })
            const total = transacoesCartao.reduce((sum, t) => sum + t.valor, 0)
            return { cartao, total, vencimento: cartao.diaVencimento }
        }))

        const totalFaturas = faturas.reduce((sum, f) => sum + f.total, 0)

        // Orçamentos vs gastos
        const orcamentos = await prisma.orcamento.findMany({ where: { userId } })
        const orcamentosComGastos = orcamentos.map(orc => {
            const gastos = transacoesMes
                .filter(t => t.tipo === 'despesa' && t.categoria === orc.categoria && t.status === 'efetivada')
                .reduce((sum, t) => sum + t.valor, 0)
            return {
                ...orc,
                gasto: gastos,
                percentual: orc.limite > 0 ? Math.round((gastos / orc.limite) * 100) : 0,
                excedido: gastos > orc.limite
            }
        })

        res.json({
            patrimonioTotal,
            receitasMes,
            despesasMes,
            saldoMes,
            contasPagar: { total: totalPagar, quantidade: contasPagar.length, items: contasPagar.slice(0, 5) },
            contasReceber: { total: totalReceber, quantidade: contasReceber.length, items: contasReceber.slice(0, 5) },
            faturas: { total: totalFaturas, items: faturas },
            orcamentos: orcamentosComGastos,
            mesReferencia: mesAtual
        })
    } catch (error) {
        next(error)
    }
})

/**
 * GET /api/financas/transacoes-vinculadas
 * Retorna transações geradas automaticamente por outros módulos
 */
router.get('/transacoes-vinculadas', async (req, res, next) => {
    try {
        const userId = req.userId
        const { modulo, inicio, fim } = req.query

        const where = {
            userId,
            vinculoModulo: { not: null }
        }

        if (modulo) where.vinculoModulo = modulo
        if (inicio || fim) {
            where.data = {}
            if (inicio) where.data.gte = new Date(inicio)
            if (fim) where.data.lte = new Date(fim)
        }

        const transacoes = await prisma.transacao.findMany({
            where,
            orderBy: { data: 'desc' }
        })

        // Agrupar por módulo
        const porModulo = {}
        transacoes.forEach(t => {
            const mod = t.vinculoModulo
            if (!porModulo[mod]) {
                porModulo[mod] = {
                    modulo: mod,
                    label: mod === 'servico_medico' ? 'Serviço Médico' :
                        mod === 'casamento' ? 'Casamento' :
                            mod === 'projeto' ? 'Projetos' :
                                mod === 'familia' ? 'Família' : mod,
                    transacoes: [],
                    totalReceitas: 0,
                    totalDespesas: 0
                }
            }
            porModulo[mod].transacoes.push(t)
            if (t.tipo === 'receita') {
                porModulo[mod].totalReceitas += t.valor
            } else {
                porModulo[mod].totalDespesas += t.valor
            }
        })

        res.json({
            total: transacoes.length,
            porModulo: Object.values(porModulo)
        })
    } catch (error) {
        next(error)
    }
})

/**
 * GET /api/financas/categorias
 * Retorna resumo de gastos por categoria
 */
router.get('/categorias', async (req, res, next) => {
    try {
        const userId = req.userId
        const { mes } = req.query

        let inicioMes, fimMes
        if (mes) {
            const [ano, mesNum] = mes.split('-').map(Number)
            inicioMes = new Date(ano, mesNum - 1, 1)
            fimMes = new Date(ano, mesNum, 0, 23, 59, 59)
        } else {
            const agora = new Date()
            inicioMes = new Date(agora.getFullYear(), agora.getMonth(), 1)
            fimMes = new Date(agora.getFullYear(), agora.getMonth() + 1, 0, 23, 59, 59)
        }

        const transacoes = await prisma.transacao.findMany({
            where: {
                userId,
                data: { gte: inicioMes, lte: fimMes },
                status: 'efetivada'
            }
        })

        // Agrupar por categoria
        const porCategoria = {}
        transacoes.forEach(t => {
            const cat = t.categoria
            if (!porCategoria[cat]) {
                porCategoria[cat] = {
                    categoria: cat,
                    receitas: 0,
                    despesas: 0,
                    transacoes: 0
                }
            }
            porCategoria[cat].transacoes++
            if (t.tipo === 'receita') {
                porCategoria[cat].receitas += t.valor
            } else {
                porCategoria[cat].despesas += t.valor
            }
        })

        // Ordenar por despesa (maior primeiro)
        const categorias = Object.values(porCategoria)
            .sort((a, b) => b.despesas - a.despesas)

        const totalReceitas = categorias.reduce((sum, c) => sum + c.receitas, 0)
        const totalDespesas = categorias.reduce((sum, c) => sum + c.despesas, 0)

        res.json({
            mesReferencia: mes || `${inicioMes.getFullYear()}-${String(inicioMes.getMonth() + 1).padStart(2, '0')}`,
            totalReceitas,
            totalDespesas,
            saldo: totalReceitas - totalDespesas,
            categorias
        })
    } catch (error) {
        next(error)
    }
})

export default router

