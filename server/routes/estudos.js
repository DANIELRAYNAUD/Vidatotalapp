import express from 'express'
import { PrismaClient } from '@prisma/client'
import { authenticate } from '../middleware/auth.js'

const router = express.Router()
const prisma = new PrismaClient()

router.use(authenticate)

// ===== TRILHAS DE APRENDIZADO =====

router.get('/trilhas', async (req, res, next) => {
    try {
        const userId = req.userId
        const trilhas = await prisma.trilhaAprendizado.findMany({
            where: { userId },
            orderBy: { updatedAt: 'desc' }
        })
        res.json(trilhas)
    } catch (error) {
        next(error)
    }
})

router.post('/trilhas', async (req, res, next) => {
    try {
        const userId = req.userId
        const { assunto, nivel, progresso, moduloAtual, sequencia, metaDiaria } = req.body

        if (!assunto || !nivel) {
            return res.status(400).json({ error: 'Campos obrigatórios: assunto, nivel' })
        }

        const trilha = await prisma.trilhaAprendizado.create({
            data: {
                userId,
                assunto,
                nivel,
                progresso: parseInt(progresso) || 0,
                moduloAtual,
                sequencia: parseInt(sequencia) || 0,
                metaDiaria: parseInt(metaDiaria) || 30
            }
        })
        res.status(201).json(trilha)
    } catch (error) {
        next(error)
    }
})

router.put('/trilhas/:id', async (req, res, next) => {
    try {
        const { id } = req.params
        const userId = req.userId
        const { assunto, nivel, progresso, moduloAtual, sequencia, metaDiaria } = req.body

        const existing = await prisma.trilhaAprendizado.findFirst({ where: { id, userId } })
        if (!existing) return res.status(404).json({ error: 'Trilha não encontrada' })

        const trilha = await prisma.trilhaAprendizado.update({
            where: { id },
            data: {
                ...(assunto && { assunto }),
                ...(nivel && { nivel }),
                ...(progresso !== undefined && { progresso: parseInt(progresso) }),
                ...(moduloAtual && { moduloAtual }),
                ...(sequencia !== undefined && { sequencia: parseInt(sequencia) }),
                ...(metaDiaria !== undefined && { metaDiaria: parseInt(metaDiaria) })
            }
        })
        res.json(trilha)
    } catch (error) {
        next(error)
    }
})

router.delete('/trilhas/:id', async (req, res, next) => {
    try {
        const { id } = req.params
        const userId = req.userId

        const existing = await prisma.trilhaAprendizado.findFirst({ where: { id, userId } })
        if (!existing) return res.status(404).json({ error: 'Trilha não encontrada' })

        await prisma.trilhaAprendizado.delete({ where: { id } })
        res.status(204).send()
    } catch (error) {
        next(error)
    }
})

// ===== SESSÕES DE ESTUDO =====

router.get('/sessoes', async (req, res, next) => {
    try {
        const userId = req.userId
        const { trilhaId } = req.query

        // Verificar se trilha pertence ao usuário se fornecida
        if (trilhaId) {
            const trilha = await prisma.trilhaAprendizado.findFirst({ where: { id: trilhaId, userId } })
            if (!trilha) return res.status(404).json({ error: 'Trilha não encontrada' })
        }

        // Se não filtrar por trilha, buscar todas as trilhas do usuário e depois as sessões
        // Ou fazer join. Como Prisma não tem join direto em findMany sem relation filter complexo,
        // vamos simplificar: se tem trilhaId, busca direto. Se não, busca todas as trilhas do user e suas sessões.

        let where = {}
        if (trilhaId) {
            where = { trilhaId }
        } else {
            const trilhas = await prisma.trilhaAprendizado.findMany({ where: { userId }, select: { id: true } })
            const trilhaIds = trilhas.map(t => t.id)
            where = { trilhaId: { in: trilhaIds } }
        }

        const sessoes = await prisma.sessaoEstudo.findMany({
            where,
            orderBy: { data: 'desc' },
            include: { trilha: { select: { assunto: true } } }
        })
        res.json(sessoes)
    } catch (error) {
        next(error)
    }
})

router.post('/sessoes', async (req, res, next) => {
    try {
        const userId = req.userId
        const { trilhaId, duracao, modulo, licao, pontuacao, xpGanho, notas } = req.body

        if (!trilhaId || !duracao || !modulo || !licao) {
            return res.status(400).json({ error: 'Campos obrigatórios: trilhaId, duracao, modulo, licao' })
        }

        const trilha = await prisma.trilhaAprendizado.findFirst({ where: { id: trilhaId, userId } })
        if (!trilha) return res.status(404).json({ error: 'Trilha não encontrada' })

        const sessao = await prisma.sessaoEstudo.create({
            data: {
                trilhaId,
                duracao: parseInt(duracao),
                modulo,
                licao,
                pontuacao: pontuacao ? parseInt(pontuacao) : null,
                xpGanho: parseInt(xpGanho) || 0,
                notas
            }
        })
        res.status(201).json(sessao)
    } catch (error) {
        next(error)
    }
})

// ===== FLASHCARDS =====

router.get('/flashcards', async (req, res, next) => {
    try {
        const userId = req.userId
        const { baralho } = req.query

        const where = { userId }
        if (baralho) where.baralho = baralho

        const flashcards = await prisma.flashcard.findMany({
            where,
            orderBy: { proximaRevisao: 'asc' }
        })
        res.json(flashcards)
    } catch (error) {
        next(error)
    }
})

router.post('/flashcards', async (req, res, next) => {
    try {
        const userId = req.userId
        const { assunto, baralho, frente, verso, tags } = req.body

        if (!assunto || !baralho || !frente || !verso) {
            return res.status(400).json({ error: 'Campos obrigatórios: assunto, baralho, frente, verso' })
        }

        const flashcard = await prisma.flashcard.create({
            data: {
                userId,
                assunto,
                baralho,
                frente,
                verso,
                proximaRevisao: new Date(),
                tags: tags ? JSON.stringify(tags) : null
            }
        })
        res.status(201).json(flashcard)
    } catch (error) {
        next(error)
    }
})

router.patch('/flashcards/:id/revisar', async (req, res, next) => {
    try {
        const { id } = req.params
        const userId = req.userId
        const { acertou } = req.body

        const card = await prisma.flashcard.findFirst({ where: { id, userId } })
        if (!card) return res.status(404).json({ error: 'Flashcard não encontrado' })

        // Lógica simples de repetição espaçada (Leitner system simplificado)
        let novaDificuldade = card.dificuldade
        let diasParaProximaRevisao = 1

        if (acertou) {
            novaDificuldade = Math.min(5, card.dificuldade + 1)
            diasParaProximaRevisao = Math.pow(2, novaDificuldade) // 1, 2, 4, 8, 16, 32 dias
        } else {
            novaDificuldade = Math.max(0, card.dificuldade - 1)
            diasParaProximaRevisao = 1
        }

        const proximaRevisao = new Date()
        proximaRevisao.setDate(proximaRevisao.getDate() + diasParaProximaRevisao)

        const updatedCard = await prisma.flashcard.update({
            where: { id },
            data: {
                dificuldade: novaDificuldade,
                proximaRevisao,
                vezesRevisado: { increment: 1 },
                acertos: acertou ? { increment: 1 } : { increment: 0 }
            }
        })

        res.json(updatedCard)
    } catch (error) {
        next(error)
    }
})

router.delete('/flashcards/:id', async (req, res, next) => {
    try {
        const { id } = req.params
        const userId = req.userId

        const existing = await prisma.flashcard.findFirst({ where: { id, userId } })
        if (!existing) return res.status(404).json({ error: 'Flashcard não encontrado' })

        await prisma.flashcard.delete({ where: { id } })
        res.status(204).send()
    } catch (error) {
        next(error)
    }
})

export default router
