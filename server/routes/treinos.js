import express from 'express'
import { PrismaClient } from '@prisma/client'
import { authenticate } from '../middleware/auth.js'

const router = express.Router()
const prisma = new PrismaClient()

router.use(authenticate)

// ===== TREINOS =====

router.get('/', async (req, res, next) => {
    try {
        const userId = req.userId
        const { inicio, fim } = req.query

        const where = { userId }
        if (inicio || fim) {
            where.data = {}
            if (inicio) where.data.gte = new Date(inicio)
            if (fim) where.data.lte = new Date(fim)
        }

        const treinos = await prisma.treino.findMany({
            where,
            orderBy: { data: 'desc' }
        })
        res.json(treinos)
    } catch (error) {
        next(error)
    }
})

router.post('/', async (req, res, next) => {
    try {
        const userId = req.userId
        const { planoId, nome, data, duracao, exercicios, volumeTotal, notas, completo } = req.body

        if (!nome || !data) {
            return res.status(400).json({ error: 'Campos obrigatórios: nome, data' })
        }

        const treino = await prisma.treino.create({
            data: {
                userId,
                planoId,
                nome,
                data: new Date(data),
                duracao: parseInt(duracao) || 0,
                exercicios: JSON.stringify(exercicios || []),
                volumeTotal: parseFloat(volumeTotal) || 0,
                notas,
                completo: completo || false
            }
        })
        res.status(201).json(treino)
    } catch (error) {
        next(error)
    }
})

router.delete('/:id', async (req, res, next) => {
    try {
        const { id } = req.params
        const userId = req.userId

        const existing = await prisma.treino.findFirst({ where: { id, userId } })
        if (!existing) return res.status(404).json({ error: 'Treino não encontrado' })

        await prisma.treino.delete({ where: { id } })
        res.status(204).send()
    } catch (error) {
        next(error)
    }
})

// ===== PLANOS DE TREINO =====

router.get('/planos', async (req, res, next) => {
    try {
        const userId = req.userId
        const planos = await prisma.planoTreino.findMany({
            where: { userId },
            orderBy: { nome: 'asc' }
        })
        res.json(planos)
    } catch (error) {
        next(error)
    }
})

router.post('/planos', async (req, res, next) => {
    try {
        const userId = req.userId
        const { nome, descricao, tipo, diasPorSemana } = req.body

        if (!nome || !tipo) {
            return res.status(400).json({ error: 'Campos obrigatórios: nome, tipo' })
        }

        const plano = await prisma.planoTreino.create({
            data: {
                userId,
                nome,
                descricao,
                tipo,
                diasPorSemana: parseInt(diasPorSemana) || 3
            }
        })
        res.status(201).json(plano)
    } catch (error) {
        next(error)
    }
})

router.delete('/planos/:id', async (req, res, next) => {
    try {
        const { id } = req.params
        const userId = req.userId

        const existing = await prisma.planoTreino.findFirst({ where: { id, userId } })
        if (!existing) return res.status(404).json({ error: 'Plano não encontrado' })

        await prisma.planoTreino.delete({ where: { id } })
        res.status(204).send()
    } catch (error) {
        next(error)
    }
})

// ===== EXERCÍCIOS =====

// Exercícios são globais (sem userId), mas podem ser criados por admins ou usuários se desejado.
// Por enquanto, vamos permitir leitura para todos e criação apenas se necessário.
// Como não tem userId no schema, assumimos que é um catálogo global.

router.get('/exercicios', async (req, res, next) => {
    try {
        const { grupoMuscular } = req.query
        const where = {}
        if (grupoMuscular) where.grupoMuscular = grupoMuscular

        const exercicios = await prisma.exercicio.findMany({
            where,
            orderBy: { nome: 'asc' }
        })
        res.json(exercicios)
    } catch (error) {
        next(error)
    }
})

export default router
