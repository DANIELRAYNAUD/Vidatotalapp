import express from 'express'
import { PrismaClient } from '@prisma/client'
import { authenticate } from '../middleware/auth.js'

const router = express.Router()
const prisma = new PrismaClient()

router.use(authenticate)

// ===== PASTAS =====

router.get('/pastas', async (req, res, next) => {
    try {
        const userId = req.userId
        const pastas = await prisma.pasta.findMany({
            where: { userId },
            orderBy: { nome: 'asc' }
        })
        res.json(pastas)
    } catch (error) {
        next(error)
    }
})

router.post('/pastas', async (req, res, next) => {
    try {
        const userId = req.userId
        const { nome, cor, icone, pastaPaiId } = req.body

        if (!nome) {
            return res.status(400).json({ error: 'Nome é obrigatório' })
        }

        const pasta = await prisma.pasta.create({
            data: {
                userId,
                nome,
                cor,
                icone,
                pastaPaiId
            }
        })
        res.status(201).json(pasta)
    } catch (error) {
        next(error)
    }
})

router.delete('/pastas/:id', async (req, res, next) => {
    try {
        const { id } = req.params
        const userId = req.userId

        const existing = await prisma.pasta.findFirst({ where: { id, userId } })
        if (!existing) return res.status(404).json({ error: 'Pasta não encontrada' })

        await prisma.pasta.delete({ where: { id } })
        res.status(204).send()
    } catch (error) {
        next(error)
    }
})

// ===== NOTAS =====

router.get('/', async (req, res, next) => {
    try {
        const userId = req.userId
        const { pastaId, favorito, busca } = req.query

        const where = { userId }
        if (pastaId) where.pastaId = pastaId
        if (favorito === 'true') where.favorito = true
        if (busca) {
            where.OR = [
                { titulo: { contains: busca } },
                { conteudo: { contains: busca } }
            ]
        }

        const notas = await prisma.nota.findMany({
            where,
            orderBy: { updatedAt: 'desc' }
        })
        res.json(notas)
    } catch (error) {
        next(error)
    }
})

router.get('/:id', async (req, res, next) => {
    try {
        const { id } = req.params
        const userId = req.userId

        const nota = await prisma.nota.findFirst({
            where: { id, userId }
        })

        if (!nota) return res.status(404).json({ error: 'Nota não encontrada' })
        res.json(nota)
    } catch (error) {
        next(error)
    }
})

router.post('/', async (req, res, next) => {
    try {
        const userId = req.userId
        const { titulo, conteudo, pastaId, tags, favorito } = req.body

        if (!titulo) {
            return res.status(400).json({ error: 'Título é obrigatório' })
        }

        const nota = await prisma.nota.create({
            data: {
                userId,
                titulo,
                conteudo: conteudo || '',
                pastaId,
                tags: tags ? JSON.stringify(tags) : null,
                favorito: favorito || false
            }
        })
        res.status(201).json(nota)
    } catch (error) {
        next(error)
    }
})

router.put('/:id', async (req, res, next) => {
    try {
        const { id } = req.params
        const userId = req.userId
        const { titulo, conteudo, pastaId, tags, favorito } = req.body

        const existing = await prisma.nota.findFirst({ where: { id, userId } })
        if (!existing) return res.status(404).json({ error: 'Nota não encontrada' })

        const nota = await prisma.nota.update({
            where: { id },
            data: {
                ...(titulo && { titulo }),
                ...(conteudo !== undefined && { conteudo }),
                ...(pastaId !== undefined && { pastaId }),
                ...(tags !== undefined && { tags: JSON.stringify(tags) }),
                ...(favorito !== undefined && { favorito })
            }
        })
        res.json(nota)
    } catch (error) {
        next(error)
    }
})

router.delete('/:id', async (req, res, next) => {
    try {
        const { id } = req.params
        const userId = req.userId

        const existing = await prisma.nota.findFirst({ where: { id, userId } })
        if (!existing) return res.status(404).json({ error: 'Nota não encontrada' })

        await prisma.nota.delete({ where: { id } })
        res.status(204).send()
    } catch (error) {
        next(error)
    }
})

export default router
