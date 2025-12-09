import express from 'express'
import { PrismaClient } from '@prisma/client'
import { authenticate } from '../middleware/auth.js'

const router = express.Router()
const prisma = new PrismaClient()

router.use(authenticate)

router.get('/', async (req, res, next) => {
    try {
        const userId = req.userId
        const { status, categoria } = req.query

        const where = { userId }
        if (status) where.status = status
        if (categoria) where.categoria = categoria

        const metas = await prisma.meta.findMany({
            where,
            orderBy: { prazo: 'asc' }
        })
        res.json(metas)
    } catch (error) {
        next(error)
    }
})

router.post('/', async (req, res, next) => {
    try {
        const userId = req.userId
        const { categoria, titulo, descricao, valorMeta, valorAtual, unidade, prazo, status, marcos, tarefasVinculadas } = req.body

        if (!categoria || !titulo) {
            return res.status(400).json({ error: 'Campos obrigatórios: categoria, titulo' })
        }

        const meta = await prisma.meta.create({
            data: {
                userId,
                categoria,
                titulo,
                descricao,
                valorMeta: valorMeta ? parseFloat(valorMeta) : null,
                valorAtual: valorAtual ? parseFloat(valorAtual) : null,
                unidade,
                prazo: prazo ? new Date(prazo) : null,
                status: status || 'ativa',
                marcos: marcos ? JSON.stringify(marcos) : null,
                tarefasVinculadas: tarefasVinculadas ? JSON.stringify(tarefasVinculadas) : null
            }
        })
        res.status(201).json(meta)
    } catch (error) {
        next(error)
    }
})

router.put('/:id', async (req, res, next) => {
    try {
        const { id } = req.params
        const userId = req.userId
        const { categoria, titulo, descricao, valorMeta, valorAtual, unidade, prazo, status, marcos, tarefasVinculadas } = req.body

        const existing = await prisma.meta.findFirst({ where: { id, userId } })
        if (!existing) return res.status(404).json({ error: 'Meta não encontrada' })

        const meta = await prisma.meta.update({
            where: { id },
            data: {
                ...(categoria && { categoria }),
                ...(titulo && { titulo }),
                ...(descricao !== undefined && { descricao }),
                ...(valorMeta !== undefined && { valorMeta: parseFloat(valorMeta) }),
                ...(valorAtual !== undefined && { valorAtual: parseFloat(valorAtual) }),
                ...(unidade !== undefined && { unidade }),
                ...(prazo !== undefined && { prazo: prazo ? new Date(prazo) : null }),
                ...(status && { status }),
                ...(marcos !== undefined && { marcos: JSON.stringify(marcos) }),
                ...(tarefasVinculadas !== undefined && { tarefasVinculadas: JSON.stringify(tarefasVinculadas) })
            }
        })
        res.json(meta)
    } catch (error) {
        next(error)
    }
})

router.delete('/:id', async (req, res, next) => {
    try {
        const { id } = req.params
        const userId = req.userId

        const existing = await prisma.meta.findFirst({ where: { id, userId } })
        if (!existing) return res.status(404).json({ error: 'Meta não encontrada' })

        await prisma.meta.delete({ where: { id } })
        res.status(204).send()
    } catch (error) {
        next(error)
    }
})

export default router
