import express from 'express'
import { PrismaClient } from '@prisma/client'
import { authenticate } from '../middleware/auth.js'

const router = express.Router()
const prisma = new PrismaClient()

router.use(authenticate)

// ===== REFEIÇÕES =====

router.get('/refeicoes', async (req, res, next) => {
    try {
        const userId = req.userId
        const { data } = req.query

        const where = { userId }
        if (data) {
            const dataInicio = new Date(data)
            dataInicio.setHours(0, 0, 0, 0)
            const dataFim = new Date(data)
            dataFim.setHours(23, 59, 59, 999)

            where.data = {
                gte: dataInicio,
                lte: dataFim
            }
        }

        const refeicoes = await prisma.refeicao.findMany({
            where,
            orderBy: { data: 'asc' }
        })
        res.json(refeicoes)
    } catch (error) {
        next(error)
    }
})

router.post('/refeicoes', async (req, res, next) => {
    try {
        const userId = req.userId
        const { data, tipoRefeicao, alimentos, totalCalorias, totalProteina, totalCarbo, totalGordura, fotoUrl, notas } = req.body

        if (!data || !tipoRefeicao || !alimentos) {
            return res.status(400).json({ error: 'Campos obrigatórios: data, tipoRefeicao, alimentos' })
        }

        const refeicao = await prisma.refeicao.create({
            data: {
                userId,
                data: new Date(data),
                tipoRefeicao,
                alimentos: JSON.stringify(alimentos),
                totalCalorias: parseFloat(totalCalorias) || 0,
                totalProteina: parseFloat(totalProteina) || 0,
                totalCarbo: parseFloat(totalCarbo) || 0,
                totalGordura: parseFloat(totalGordura) || 0,
                fotoUrl,
                notas
            }
        })
        res.status(201).json(refeicao)
    } catch (error) {
        next(error)
    }
})

router.delete('/refeicoes/:id', async (req, res, next) => {
    try {
        const { id } = req.params
        const userId = req.userId

        const existing = await prisma.refeicao.findFirst({ where: { id, userId } })
        if (!existing) return res.status(404).json({ error: 'Refeição não encontrada' })

        await prisma.refeicao.delete({ where: { id } })
        res.status(204).send()
    } catch (error) {
        next(error)
    }
})

// ===== RECEITAS =====

router.get('/receitas', async (req, res, next) => {
    try {
        const userId = req.userId
        const receitas = await prisma.receita.findMany({
            where: { userId },
            orderBy: { nome: 'asc' }
        })
        res.json(receitas)
    } catch (error) {
        next(error)
    }
})

router.post('/receitas', async (req, res, next) => {
    try {
        const userId = req.userId
        const { nome, descricao, fotoUrl, tempoPreparo, dificuldade, ingredientes, instrucoes, porcoes, caloriasPorPorcao, macrosPorPorcao, tags } = req.body

        if (!nome || !ingredientes || !instrucoes) {
            return res.status(400).json({ error: 'Campos obrigatórios: nome, ingredientes, instrucoes' })
        }

        const receita = await prisma.receita.create({
            data: {
                userId,
                nome,
                descricao,
                fotoUrl,
                tempoPreparo: parseInt(tempoPreparo) || 0,
                dificuldade: dificuldade || 'media',
                ingredientes: JSON.stringify(ingredientes),
                instrucoes: JSON.stringify(instrucoes),
                porcoes: parseInt(porcoes) || 1,
                caloriasPorPorcao: parseFloat(caloriasPorPorcao) || 0,
                macrosPorPorcao: JSON.stringify(macrosPorPorcao || {}),
                tags: tags ? JSON.stringify(tags) : null
            }
        })
        res.status(201).json(receita)
    } catch (error) {
        next(error)
    }
})

router.delete('/receitas/:id', async (req, res, next) => {
    try {
        const { id } = req.params
        const userId = req.userId

        const existing = await prisma.receita.findFirst({ where: { id, userId } })
        if (!existing) return res.status(404).json({ error: 'Receita não encontrada' })

        await prisma.receita.delete({ where: { id } })
        res.status(204).send()
    } catch (error) {
        next(error)
    }
})

export default router
