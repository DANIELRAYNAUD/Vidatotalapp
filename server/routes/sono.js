import express from 'express'
import { PrismaClient } from '@prisma/client'
import { authenticate } from '../middleware/auth.js'

const router = express.Router()
const prisma = new PrismaClient()

router.use(authenticate)

// Listar registros de sono
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

        const registros = await prisma.registroSono.findMany({
            where,
            orderBy: { data: 'desc' }
        })
        res.json(registros)
    } catch (error) {
        next(error)
    }
})

// Criar registro de sono
router.post('/', async (req, res, next) => {
    try {
        const userId = req.userId
        const { data, horaDormir, horaAcordar, duracao, qualidade, fases, interrupcoes, fatores, notas } = req.body

        if (!data || !horaDormir || !horaAcordar) {
            return res.status(400).json({ error: 'Campos obrigatórios: data, horaDormir, horaAcordar' })
        }

        const registro = await prisma.registroSono.create({
            data: {
                userId,
                data: new Date(data),
                horaDormir: new Date(horaDormir),
                horaAcordar: new Date(horaAcordar),
                duracao: parseInt(duracao) || 0,
                qualidade: parseInt(qualidade) || 3,
                fases: fases ? JSON.stringify(fases) : null,
                interrupcoes: parseInt(interrupcoes) || 0,
                fatores: fatores ? JSON.stringify(fatores) : null,
                notas
            }
        })
        res.status(201).json(registro)
    } catch (error) {
        next(error)
    }
})

// Atualizar registro de sono
router.put('/:id', async (req, res, next) => {
    try {
        const { id } = req.params
        const userId = req.userId
        const { data, horaDormir, horaAcordar, duracao, qualidade, fases, interrupcoes, fatores, notas } = req.body

        const existing = await prisma.registroSono.findFirst({ where: { id, userId } })
        if (!existing) return res.status(404).json({ error: 'Registro não encontrado' })

        const registro = await prisma.registroSono.update({
            where: { id },
            data: {
                ...(data && { data: new Date(data) }),
                ...(horaDormir && { horaDormir: new Date(horaDormir) }),
                ...(horaAcordar && { horaAcordar: new Date(horaAcordar) }),
                ...(duracao !== undefined && { duracao: parseInt(duracao) }),
                ...(qualidade !== undefined && { qualidade: parseInt(qualidade) }),
                ...(fases && { fases: JSON.stringify(fases) }),
                ...(interrupcoes !== undefined && { interrupcoes: parseInt(interrupcoes) }),
                ...(fatores && { fatores: JSON.stringify(fatores) }),
                ...(notas !== undefined && { notas })
            }
        })
        res.json(registro)
    } catch (error) {
        next(error)
    }
})

// Deletar registro de sono
router.delete('/:id', async (req, res, next) => {
    try {
        const { id } = req.params
        const userId = req.userId

        const existing = await prisma.registroSono.findFirst({ where: { id, userId } })
        if (!existing) return res.status(404).json({ error: 'Registro não encontrado' })

        await prisma.registroSono.delete({ where: { id } })
        res.status(204).send()
    } catch (error) {
        next(error)
    }
})

export default router
