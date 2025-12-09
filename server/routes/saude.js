import express from 'express'
import { PrismaClient } from '@prisma/client'
import { authenticate } from '../middleware/auth.js'

const router = express.Router()
const prisma = new PrismaClient()

// Proteger todas as rotas
router.use(authenticate)

// ===== MÉTRICAS DE SAÚDE =====

// Listar métricas de saúde
router.get('/metricas', async (req, res, next) => {
    try {
        const userId = req.userId
        const { tipo, dataInicio, dataFim } = req.query

        const where = { userId }

        if (tipo) where.tipo = tipo
        if (dataInicio || dataFim) {
            where.data = {}
            if (dataInicio) where.data.gte = new Date(dataInicio)
            if (dataFim) where.data.lte = new Date(dataFim)
        }

        const metricas = await prisma.metricaSaude.findMany({
            where,
            orderBy: { data: 'desc' }
        })

        res.json(metricas)
    } catch (error) {
        next(error)
    }
})

// Criar métrica de saúde
router.post('/metricas', async (req, res, next) => {
    try {
        const userId = req.userId
        const { tipo, valor, unidade, data, contexto, notas } = req.body

        if (!tipo || valor === undefined || !unidade) {
            return res.status(400).json({ error: 'Campos obrigatórios: tipo, valor, unidade' })
        }

        const metrica = await prisma.metricaSaude.create({
            data: {
                userId,
                tipo,
                valor: parseFloat(valor),
                unidade,
                data: data ? new Date(data) : new Date(),
                contexto,
                notas
            }
        })

        res.status(201).json(metrica)
    } catch (error) {
        next(error)
    }
})

// Deletar métrica
router.delete('/metricas/:id', async (req, res, next) => {
    try {
        await prisma.metricaSaude.delete({
            where: { id: req.params.id }
        })
        res.status(204).send()
    } catch (error) {
        if (error.code === 'P2025') {
            return res.status(404).json({ error: 'Métrica não encontrada' })
        }
        next(error)
    }
})

// ===== MEDICAMENTOS =====

// Listar medicamentos
router.get('/medicamentos', async (req, res, next) => {
    try {
        const userId = req.userId

        const medicamentos = await prisma.medicamento.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' }
        })

        res.json(medicamentos)
    } catch (error) {
        next(error)
    }
})

// Criar medicamento
router.post('/medicamentos', async (req, res, next) => {
    try {
        const userId = req.userId
        const { nome, dosagem, frequencia, dataInicio, dataFim, estoque } = req.body

        if (!nome || !dosagem || !frequencia || !dataInicio) {
            return res.status(400).json({ error: 'Campos obrigatórios: nome, dosagem, frequencia, dataInicio' })
        }

        const medicamento = await prisma.medicamento.create({
            data: {
                userId,
                nome,
                dosagem,
                frequencia: JSON.stringify(frequencia),
                dataInicio: new Date(dataInicio),
                dataFim: dataFim ? new Date(dataFim) : null,
                estoque: estoque || null
            }
        })

        res.status(201).json(medicamento)
    } catch (error) {
        next(error)
    }
})

// Atualizar medicamento
router.put('/medicamentos/:id', async (req, res, next) => {
    try {
        const { id } = req.params
        const userId = req.userId
        const { nome, dosagem, frequencia, dataInicio, dataFim, estoque } = req.body

        // Verificar se pertence ao usuário
        const existing = await prisma.medicamento.findFirst({ where: { id, userId } })
        if (!existing) return res.status(404).json({ error: 'Medicamento não encontrado' })

        const medicamento = await prisma.medicamento.update({
            where: { id },
            data: {
                ...(nome && { nome }),
                ...(dosagem && { dosagem }),
                ...(frequencia && { frequencia: JSON.stringify(frequencia) }),
                ...(dataInicio && { dataInicio: new Date(dataInicio) }),
                ...(dataFim !== undefined && { dataFim: dataFim ? new Date(dataFim) : null }),
                ...(estoque !== undefined && { estoque })
            }
        })

        res.json(medicamento)
    } catch (error) {
        next(error)
    }
})

// Deletar medicamento
router.delete('/medicamentos/:id', async (req, res, next) => {
    try {
        const { id } = req.params
        const userId = req.userId

        // Verificar se pertence ao usuário
        const existing = await prisma.medicamento.findFirst({ where: { id, userId } })
        if (!existing) return res.status(404).json({ error: 'Medicamento não encontrado' })

        await prisma.medicamento.delete({
            where: { id }
        })
        res.status(204).send()
    } catch (error) {
        next(error)
    }
})

// ===== CONSULTAS MÉDICAS =====

// Listar consultas
router.get('/consultas', async (req, res, next) => {
    try {
        const userId = req.userId

        const consultas = await prisma.consultaMedica.findMany({
            where: { userId },
            orderBy: { dataHora: 'asc' }
        })

        res.json(consultas)
    } catch (error) {
        next(error)
    }
})

// Criar consulta
router.post('/consultas', async (req, res, next) => {
    try {
        const userId = req.userId
        const { especialidade, medico, local, dataHora, notas, anexos } = req.body

        if (!especialidade || !dataHora) {
            return res.status(400).json({ error: 'Campos obrigatórios: especialidade, dataHora' })
        }

        const consulta = await prisma.consultaMedica.create({
            data: {
                userId,
                especialidade,
                medico,
                local,
                dataHora: new Date(dataHora),
                notas,
                anexos: anexos ? JSON.stringify(anexos) : null
            }
        })

        res.status(201).json(consulta)
    } catch (error) {
        next(error)
    }
})

export default router
