import express from 'express'
import { PrismaClient } from '@prisma/client'
import { authenticate } from '../middleware/auth.js'

const router = express.Router()
const prisma = new PrismaClient()

router.use(authenticate)

// ===== PROJETOS =====

router.get('/', async (req, res, next) => {
    try {
        const userId = req.userId
        const { status, categoria } = req.query

        const where = { userId }
        if (status) where.status = status
        if (categoria) where.categoria = categoria

        const projetos = await prisma.projeto.findMany({
            where,
            include: {
                tarefas: {
                    select: { id: true, status: true }
                }
            },
            orderBy: { updatedAt: 'desc' }
        })

        // Calcular progresso baseado nas tarefas se não for manual
        const projetosComProgresso = projetos.map(p => {
            if (p.tarefas.length > 0) {
                const completas = p.tarefas.filter(t => t.status === 'feito').length
                const progressoCalculado = Math.round((completas / p.tarefas.length) * 100)
                return { ...p, progresso: progressoCalculado }
            }
            return p
        })

        res.json(projetosComProgresso)
    } catch (error) {
        next(error)
    }
})

router.get('/:id', async (req, res, next) => {
    try {
        const { id } = req.params
        const userId = req.userId

        const projeto = await prisma.projeto.findFirst({
            where: { id, userId },
            include: {
                tarefas: {
                    orderBy: { createdAt: 'desc' }
                }
            }
        })

        if (!projeto) return res.status(404).json({ error: 'Projeto não encontrado' })
        res.json(projeto)
    } catch (error) {
        next(error)
    }
})

router.post('/', async (req, res, next) => {
    try {
        const userId = req.userId
        const { nome, descricao, categoria, cor, gradiente, status, dataInicio, prazo, orcamento } = req.body

        if (!nome || !categoria || !cor || !gradiente) {
            return res.status(400).json({ error: 'Campos obrigatórios: nome, categoria, cor, gradiente' })
        }

        const projeto = await prisma.projeto.create({
            data: {
                userId,
                nome,
                descricao,
                categoria,
                cor,
                gradiente: JSON.stringify(gradiente),
                status: status || 'ativo',
                dataInicio: dataInicio ? new Date(dataInicio) : null,
                prazo: prazo ? new Date(prazo) : null,
                orcamento: orcamento ? parseFloat(orcamento) : null
            }
        })

        // Cross-linking: Se projeto tem orçamento, criar despesa vinculada
        if (orcamento && parseFloat(orcamento) > 0) {
            try {
                await prisma.transacao.create({
                    data: {
                        userId,
                        tipo: 'despesa',
                        valor: parseFloat(orcamento),
                        categoria: 'projetos',
                        descricao: `Orçamento do projeto: ${nome}`,
                        data: prazo ? new Date(prazo) : new Date(),
                        status: 'pendente',
                        // Cross-linking fields
                        vinculoModulo: 'projeto',
                        vinculoId: projeto.id,
                        vinculoLabel: `Projeto: ${nome}`
                    }
                })
            } catch (err) {
                console.error('Erro ao criar transação vinculada ao projeto:', err)
            }
        }

        res.status(201).json(projeto)
    } catch (error) {
        next(error)
    }
})

router.put('/:id', async (req, res, next) => {
    try {
        const { id } = req.params
        const userId = req.userId
        const { nome, descricao, categoria, cor, gradiente, status, progresso, dataInicio, prazo, orcamento } = req.body

        const existing = await prisma.projeto.findFirst({ where: { id, userId } })
        if (!existing) return res.status(404).json({ error: 'Projeto não encontrado' })

        const projeto = await prisma.projeto.update({
            where: { id },
            data: {
                ...(nome && { nome }),
                ...(descricao !== undefined && { descricao }),
                ...(categoria && { categoria }),
                ...(cor && { cor }),
                ...(gradiente && { gradiente: JSON.stringify(gradiente) }),
                ...(status && { status }),
                ...(progresso !== undefined && { progresso }),
                ...(dataInicio !== undefined && { dataInicio: dataInicio ? new Date(dataInicio) : null }),
                ...(prazo !== undefined && { prazo: prazo ? new Date(prazo) : null }),
                ...(orcamento !== undefined && { orcamento: orcamento ? parseFloat(orcamento) : null })
            }
        })
        res.json(projeto)
    } catch (error) {
        next(error)
    }
})

router.delete('/:id', async (req, res, next) => {
    try {
        const { id } = req.params
        const userId = req.userId

        const existing = await prisma.projeto.findFirst({ where: { id, userId } })
        if (!existing) return res.status(404).json({ error: 'Projeto não encontrado' })

        await prisma.projeto.delete({ where: { id } })
        res.status(204).send()
    } catch (error) {
        next(error)
    }
})

// ===== TAREFAS =====

router.get('/:projetoId/tarefas', async (req, res, next) => {
    try {
        const { projetoId } = req.params
        const userId = req.userId

        // Verificar acesso ao projeto
        const projeto = await prisma.projeto.findFirst({ where: { id: projetoId, userId } })
        if (!projeto) return res.status(404).json({ error: 'Projeto não encontrado' })

        const tarefas = await prisma.tarefa.findMany({
            where: { projetoId },
            orderBy: { createdAt: 'desc' }
        })
        res.json(tarefas)
    } catch (error) {
        next(error)
    }
})

router.post('/tarefas', async (req, res, next) => {
    try {
        const userId = req.userId
        const { projetoId, titulo, descricao, status, prioridade, prazo, tags, tempoEstimado, tarefaPaiId } = req.body

        if (!titulo) return res.status(400).json({ error: 'Título é obrigatório' })

        if (projetoId) {
            const projeto = await prisma.projeto.findFirst({ where: { id: projetoId, userId } })
            if (!projeto) return res.status(404).json({ error: 'Projeto não encontrado' })
        }

        const tarefa = await prisma.tarefa.create({
            data: {
                userId,
                projetoId,
                titulo,
                descricao,
                status: status || 'fazer',
                prioridade: prioridade || 'normal',
                prazo: prazo ? new Date(prazo) : null,
                tags: tags ? JSON.stringify(tags) : null,
                tempoEstimado: tempoEstimado ? parseInt(tempoEstimado) : null,
                tarefaPaiId
            }
        })
        res.status(201).json(tarefa)
    } catch (error) {
        next(error)
    }
})

router.put('/tarefas/:id', async (req, res, next) => {
    try {
        const { id } = req.params
        const userId = req.userId
        const { titulo, descricao, status, prioridade, prazo, tags, tempoEstimado, tempoReal } = req.body

        const existing = await prisma.tarefa.findFirst({ where: { id, userId } })
        if (!existing) return res.status(404).json({ error: 'Tarefa não encontrada' })

        const tarefa = await prisma.tarefa.update({
            where: { id },
            data: {
                ...(titulo && { titulo }),
                ...(descricao !== undefined && { descricao }),
                ...(status && { status }),
                ...(prioridade && { prioridade }),
                ...(prazo !== undefined && { prazo: prazo ? new Date(prazo) : null }),
                ...(tags !== undefined && { tags: JSON.stringify(tags) }),
                ...(tempoEstimado !== undefined && { tempoEstimado: parseInt(tempoEstimado) }),
                ...(tempoReal !== undefined && { tempoReal: parseInt(tempoReal) }),
                ...(status === 'feito' && !existing.completadaEm ? { completadaEm: new Date() } : {})
            }
        })
        res.json(tarefa)
    } catch (error) {
        next(error)
    }
})

router.delete('/tarefas/:id', async (req, res, next) => {
    try {
        const { id } = req.params
        const userId = req.userId

        const existing = await prisma.tarefa.findFirst({ where: { id, userId } })
        if (!existing) return res.status(404).json({ error: 'Tarefa não encontrada' })

        await prisma.tarefa.delete({ where: { id } })
        res.status(204).send()
    } catch (error) {
        next(error)
    }
})

export default router
