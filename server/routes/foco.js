import express from 'express'
import { PrismaClient } from '@prisma/client'
import { authenticate } from '../middleware/auth.js'

const router = express.Router()
const prisma = new PrismaClient()

router.use(authenticate)

// ===== SESSÕES DE FOCO =====

router.get('/sessoes', async (req, res, next) => {
    try {
        const userId = req.userId
        const sessoes = await prisma.sessaoFoco.findMany({
            where: { userId },
            orderBy: { inicio: 'desc' },
            take: 50
        })
        res.json(sessoes)
    } catch (error) {
        next(error)
    }
})

router.post('/sessoes', async (req, res, next) => {
    try {
        const userId = req.userId
        const { tipo, inicio, fim, duracao, tipoMusica, tarefaId, projetoId, completo, notas } = req.body

        if (!tipo || !inicio) {
            return res.status(400).json({ error: 'Campos obrigatórios: tipo, inicio' })
        }

        const sessao = await prisma.sessaoFoco.create({
            data: {
                userId,
                tipo,
                inicio: new Date(inicio),
                fim: fim ? new Date(fim) : null,
                duracao: duracao ? parseInt(duracao) : null,
                tipoMusica,
                tarefaId,
                projetoId,
                completo: completo || false,
                notas
            }
        })
        res.status(201).json(sessao)
    } catch (error) {
        next(error)
    }
})

// ===== MÚSICAS DE FOCO =====

// Músicas são globais, mas podem ser filtradas por tags
router.get('/musicas', async (req, res, next) => {
    try {
        const { tipo } = req.query
        const where = {}
        if (tipo) where.tipo = tipo

        const musicas = await prisma.musicaFoco.findMany({
            where,
            orderBy: { nome: 'asc' }
        })
        res.json(musicas)
    } catch (error) {
        next(error)
    }
})

export default router
