import express from 'express'
import { PrismaClient } from '@prisma/client'
import { authenticate } from '../middleware/auth.js'

const router = express.Router()
const prisma = new PrismaClient()

// Proteger todas as rotas
router.use(authenticate)

// Listar todos os hábitos do usuário
router.get('/', async (req, res, next) => {
    try {
        const userId = req.userId

        const habitos = await prisma.habito.findMany({
            where: { userId },
            include: {
                registros: {
                    orderBy: { data: 'desc' },
                    take: 30 // últimos 30 dias
                }
            },
            orderBy: { createdAt: 'desc' }
        })

        res.json(habitos)
    } catch (error) {
        next(error)
    }
})

// Obter um hábito específico
router.get('/:id', async (req, res, next) => {
    try {
        const { id } = req.params
        const userId = req.userId

        const habito = await prisma.habito.findFirst({
            where: {
                id,
                userId
            },
            include: {
                registros: {
                    orderBy: { data: 'desc' }
                }
            }
        })

        if (!habito) {
            return res.status(404).json({ error: 'Hábito não encontrado' })
        }

        res.json(habito)
    } catch (error) {
        next(error)
    }
})

// Criar novo hábito
router.post('/', async (req, res, next) => {
    try {
        const userId = req.userId
        const { nome, descricao, icone, cor, categoria, frequencia, diasSemana, valorMeta, lembrete, horarioLembrete } = req.body

        // Validação básica
        if (!nome || !icone || !cor || !categoria || !frequencia) {
            return res.status(400).json({ error: 'Campos obrigatórios: nome, icone, cor, categoria, frequencia' })
        }

        const habito = await prisma.habito.create({
            data: {
                userId,
                nome,
                descricao,
                icone,
                cor,
                categoria,
                frequencia,
                diasSemana: diasSemana ? JSON.stringify(diasSemana) : null,
                valorMeta: valorMeta || 1,
                lembrete: lembrete || false,
                horarioLembrete: horarioLembrete || null
            }
        })

        res.status(201).json(habito)
    } catch (error) {
        next(error)
    }
})

// Atualizar hábito
router.put('/:id', async (req, res, next) => {
    try {
        const { id } = req.params
        const { nome, descricao, icone, cor, categoria, frequencia, diasSemana, valorMeta, lembrete, horarioLembrete } = req.body

        const habito = await prisma.habito.update({
            where: { id },
            data: {
                ...(nome && { nome }),
                ...(descricao !== undefined && { descricao }),
                ...(icone && { icone }),
                ...(cor && { cor }),
                ...(categoria && { categoria }),
                ...(frequencia && { frequencia }),
                ...(diasSemana !== undefined && { diasSemana: JSON.stringify(diasSemana) }),
                ...(valorMeta !== undefined && { valorMeta }),
                ...(lembrete !== undefined && { lembrete }),
                ...(horarioLembrete !== undefined && { horarioLembrete })
            }
        })

        res.json(habito)
    } catch (error) {
        if (error.code === 'P2025') {
            return res.status(404).json({ error: 'Hábito não encontrado' })
        }
        next(error)
    }
})

// Deletar hábito
router.delete('/:id', async (req, res, next) => {
    try {
        const { id } = req.params

        await prisma.habito.delete({
            where: { id }
        })

        res.status(204).send()
    } catch (error) {
        if (error.code === 'P2025') {
            return res.status(404).json({ error: 'Hábito não encontrado' })
        }
        next(error)
    }
})

// Marcar hábito como completo/incompleto em uma data
router.post('/:id/toggle', async (req, res, next) => {
    try {
        const { id } = req.params
        const { data, valor } = req.body

        const dataRegistro = data ? new Date(data) : new Date()
        dataRegistro.setHours(0, 0, 0, 0)

        // Verificar se já existe registro para essa data
        const registroExistente = await prisma.registroHabito.findFirst({
            where: {
                habitoId: id,
                data: dataRegistro
            }
        })

        let registro

        if (registroExistente) {
            // Alternar estado de completo
            registro = await prisma.registroHabito.update({
                where: { id: registroExistente.id },
                data: {
                    completo: !registroExistente.completo,
                    ...(valor !== undefined && { valor })
                }
            })
        } else {
            // Criar novo registro
            registro = await prisma.registroHabito.create({
                data: {
                    habitoId: id,
                    data: dataRegistro,
                    completo: true,
                    valor: valor || 1
                }
            })
        }

        res.json(registro)
    } catch (error) {
        next(error)
    }
})

// Obter registros de um hábito em um intervalo de datas
router.get('/:id/registros', async (req, res, next) => {
    try {
        const { id } = req.params
        const { dataInicio, dataFim } = req.query

        const where = { habitoId: id }

        if (dataInicio || dataFim) {
            where.data = {}
            if (dataInicio) where.data.gte = new Date(dataInicio)
            if (dataFim) where.data.lte = new Date(dataFim)
        }

        const registros = await prisma.registroHabito.findMany({
            where,
            orderBy: { data: 'desc' }
        })

        res.json(registros)
    } catch (error) {
        next(error)
    }
})

// Estatísticas gerais dos hábitos
router.get('/stats/overview', async (req, res, next) => {
    try {
        const userId = req.userId

        // Buscar todos os hábitos do usuário
        const habitos = await prisma.habito.findMany({
            where: { userId },
            include: {
                registros: {
                    orderBy: { data: 'desc' }
                }
            }
        })

        const hoje = new Date()
        hoje.setHours(0, 0, 0, 0)

        // Calcular estatísticas
        const totalHabitos = habitos.length
        let completosHoje = 0
        let melhorSequencia = 0
        let habitoMelhorSequencia = ''
        const dias30Atras = new Date(hoje)
        dias30Atras.setDate(dias30Atras.getDate() - 30)

        let diasAtivos = new Set()

        habitos.forEach(habito => {
            // Verificar se completou hoje
            const completouHoje = habito.registros.some(r => {
                const dataReg = new Date(r.data)
                return dataReg.toDateString() === hoje.toDateString() && r.completo
            })
            if (completouHoje) completosHoje++

            // Calcular sequência
            const registrosCompletos = habito.registros
                .filter(r => r.completo)
                .map(r => new Date(r.data))
                .sort((a, b) => b.getTime() - a.getTime())

            let sequencia = 0
            for (let i = 0; i < registrosCompletos.length; i++) {
                const dataEsperada = new Date(hoje)
                dataEsperada.setDate(dataEsperada.getDate() - sequencia)
                dataEsperada.setHours(0, 0, 0, 0)

                const dataRegistro = new Date(registrosCompletos[i])
                dataRegistro.setHours(0, 0, 0, 0)

                if (dataRegistro.getTime() === dataEsperada.getTime()) {
                    sequencia++
                } else {
                    break
                }
            }

            if (sequencia > melhorSequencia) {
                melhorSequencia = sequencia
                habitoMelhorSequencia = habito.nome
            }

            // Contar dias ativos (últimos 30 dias)
            habito.registros.forEach(r => {
                if (r.completo && new Date(r.data) >= dias30Atras) {
                    const dia = new Date(r.data).toISOString().split('T')[0]
                    diasAtivos.add(dia)
                }
            })
        })

        const porcentagemHoje = totalHabitos > 0
            ? Math.round((completosHoje / totalHabitos) * 100)
            : 0

        // Verificar meta de 7 dias consecutivos
        const meta7Dias = melhorSequencia >= 7

        res.json({
            totalHabitos,
            completosHoje,
            porcentagemHoje,
            melhorSequencia,
            habitoMelhorSequencia,
            diasAtivos: diasAtivos.size,
            meta7Dias
        })
    } catch (error) {
        next(error)
    }
})

export default router
