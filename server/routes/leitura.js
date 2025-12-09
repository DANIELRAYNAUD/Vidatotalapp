import express from 'express'
import { PrismaClient } from '@prisma/client'
import { authenticate } from '../middleware/auth.js'

const router = express.Router()
const prisma = new PrismaClient()

// Proteger todas as rotas
router.use(authenticate)

// ===== LIVROS =====

// Listar livros
router.get('/', async (req, res, next) => {
    try {
        const userId = req.userId
        const { status } = req.query

        const where = { userId }
        if (status) where.status = status

        const livros = await prisma.livro.findMany({
            where,
            include: {
                sessoes: {
                    orderBy: { data: 'desc' },
                    take: 5
                }
            },
            orderBy: { updatedAt: 'desc' }
        })

        res.json(livros)
    } catch (error) {
        next(error)
    }
})

// Obter livro específico
router.get('/:id', async (req, res, next) => {
    try {
        const { id } = req.params
        const userId = req.userId

        const livro = await prisma.livro.findFirst({
            where: {
                id,
                userId
            },
            include: {
                sessoes: {
                    orderBy: { data: 'desc' }
                }
            }
        })

        if (!livro) {
            return res.status(404).json({ error: 'Livro não encontrado' })
        }

        res.json(livro)
    } catch (error) {
        next(error)
    }
})

// Criar livro
router.post('/', async (req, res, next) => {
    try {
        const userId = req.userId
        const {
            titulo,
            autor,
            isbn,
            capaUrl,
            categoria,
            tags,
            totalPaginas,
            paginaAtual,
            status,
            avaliacao,
            dataInicio,
            notas
        } = req.body

        if (!titulo || !autor || !totalPaginas) {
            return res.status(400).json({ error: 'Campos obrigatórios: titulo, autor, totalPaginas' })
        }

        const livro = await prisma.livro.create({
            data: {
                userId,
                titulo,
                autor,
                isbn,
                capaUrl,
                categoria: categoria || 'Geral',
                tags: tags ? JSON.stringify(tags) : null,
                totalPaginas: parseInt(totalPaginas),
                paginaAtual: paginaAtual ? parseInt(paginaAtual) : 0,
                status: status || 'ler',
                avaliacao,
                dataInicio: dataInicio ? new Date(dataInicio) : null,
                notas
            }
        })

        res.status(201).json(livro)
    } catch (error) {
        next(error)
    }
})

// Atualizar livro
router.put('/:id', async (req, res, next) => {
    try {
        const { id } = req.params
        const {
            titulo,
            autor,
            isbn,
            capaUrl,
            categoria,
            tags,
            totalPaginas,
            paginaAtual,
            status,
            avaliacao,
            dataInicio,
            dataFim,
            notas,
            destaques
        } = req.body

        const livro = await prisma.livro.update({
            where: { id },
            data: {
                ...(titulo && { titulo }),
                ...(autor && { autor }),
                ...(isbn !== undefined && { isbn }),
                ...(capaUrl !== undefined && { capaUrl }),
                ...(categoria && { categoria }),
                ...(tags !== undefined && { tags: JSON.stringify(tags) }),
                ...(totalPaginas !== undefined && { totalPaginas: parseInt(totalPaginas) }),
                ...(paginaAtual !== undefined && { paginaAtual: parseInt(paginaAtual) }),
                ...(status && { status }),
                ...(avaliacao !== undefined && { avaliacao }),
                ...(dataInicio !== undefined && { dataInicio: dataInicio ? new Date(dataInicio) : null }),
                ...(dataFim !== undefined && { dataFim: dataFim ? new Date(dataFim) : null }),
                ...(notas !== undefined && { notas }),
                ...(destaques !== undefined && { destaques: JSON.stringify(destaques) })
            }
        })

        res.json(livro)
    } catch (error) {
        if (error.code === 'P2025') {
            return res.status(404).json({ error: 'Livro não encontrado' })
        }
        next(error)
    }
})

// Deletar livro
router.delete('/:id', async (req, res, next) => {
    try {
        await prisma.livro.delete({
            where: { id: req.params.id }
        })
        res.status(204).send()
    } catch (error) {
        if (error.code === 'P2025') {
            return res.status(404).json({ error: 'Livro não encontrado' })
        }
        next(error)
    }
})

// ===== SESSÕES DE LEITURA =====

// Listar sessões de leitura
router.get('/:livroId/sessoes', async (req, res, next) => {
    try {
        const { livroId } = req.params

        const sessoes = await prisma.sessaoLeitura.findMany({
            where: { livroId },
            orderBy: { data: 'desc' }
        })

        res.json(sessoes)
    } catch (error) {
        next(error)
    }
})

// Criar sessão de leitura
router.post('/:livroId/sessoes', async (req, res, next) => {
    try {
        const { livroId } = req.params
        const { duracao, paginasLidas, paginaInicio, paginaFim, notas } = req.body

        if (!duracao || !paginasLidas || paginaInicio === undefined || paginaFim === undefined) {
            return res.status(400).json({
                error: 'Campos obrigatórios: duracao, paginasLidas, paginaInicio, paginaFim'
            })
        }

        // Criar sessão
        const sessao = await prisma.sessaoLeitura.create({
            data: {
                livroId,
                duracao: parseInt(duracao),
                paginasLidas: parseInt(paginasLidas),
                paginaInicio: parseInt(paginaInicio),
                paginaFim: parseInt(paginaFim),
                notas
            }
        })

        // Atualizar página atual do livro
        await prisma.livro.update({
            where: { id: livroId },
            data: {
                paginaAtual: parseInt(paginaFim)
            }
        })

        res.status(201).json(sessao)
    } catch (error) {
        next(error)
    }
})

// Atualizar progresso do livro (atalho)
router.patch('/:id/progresso', async (req, res, next) => {
    try {
        const { id } = req.params
        const { paginaAtual } = req.body

        if (paginaAtual === undefined) {
            return res.status(400).json({ error: 'Campo obrigatório: paginaAtual' })
        }

        const livro = await prisma.livro.update({
            where: { id },
            data: {
                paginaAtual: parseInt(paginaAtual),
                ...(parseInt(paginaAtual) >= livro.totalPaginas && {
                    status: 'completo',
                    dataFim: new Date()
                })
            }
        })

        res.json(livro)
    } catch (error) {
        if (error.code === 'P2025') {
            return res.status(404).json({ error: 'Livro não encontrado' })
        }
        next(error)
    }
})

export default router
