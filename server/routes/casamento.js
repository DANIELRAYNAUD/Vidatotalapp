import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// ===== CHECK-INS DO RELACIONAMENTO =====

router.get('/checkins', async (req, res) => {
    try {
        const userId = req.userId;
        const { inicio, fim } = req.query;

        const where = { userId };
        if (inicio || fim) {
            where.data = {};
            if (inicio) where.data.gte = new Date(inicio);
            if (fim) where.data.lte = new Date(fim);
        }

        const checkins = await prisma.relacionamentoCasal.findMany({
            where,
            orderBy: { data: 'desc' },
        });
        res.json(checkins);
    } catch (error) {
        console.error('Erro ao listar check-ins:', error);
        res.status(500).json({ error: 'Erro ao listar check-ins' });
    }
});

router.post('/checkins', async (req, res) => {
    try {
        const userId = req.userId;
        const checkin = await prisma.relacionamentoCasal.create({
            data: { userId, ...req.body },
        });
        res.status(201).json(checkin);
    } catch (error) {
        console.error('Erro ao criar check-in:', error);
        res.status(500).json({ error: 'Erro ao criar check-in' });
    }
});

// ===== METAS DO CASAL =====

router.get('/metas', async (req, res) => {
    try {
        const userId = req.userId;
        const { status } = req.query;

        const where = { userId };
        if (status) where.status = status;

        const metas = await prisma.metaCasal.findMany({
            where,
            orderBy: [{ status: 'asc' }, { updatedAt: 'desc' }],
        });
        res.json(metas);
    } catch (error) {
        console.error('Erro ao listar metas:', error);
        res.status(500).json({ error: 'Erro ao listar metas' });
    }
});

router.post('/metas', async (req, res) => {
    try {
        const userId = req.userId;
        const meta = await prisma.metaCasal.create({
            data: { userId, ...req.body },
        });
        res.status(201).json(meta);
    } catch (error) {
        console.error('Erro ao criar meta:', error);
        res.status(500).json({ error: 'Erro ao criar meta' });
    }
});

router.put('/metas/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const meta = await prisma.metaCasal.update({
            where: { id },
            data: req.body,
        });
        res.json(meta);
    } catch (error) {
        console.error('Erro ao atualizar meta:', error);
        res.status(500).json({ error: 'Erro ao atualizar meta' });
    }
});

// ===== NOTAS DE APRECIAÇÃO =====

router.get('/notas', async (req, res) => {
    try {
        const userId = req.userId;
        const notas = await prisma.notaApreciacao.findMany({
            where: { userId },
            orderBy: { data: 'desc' },
            take: 50,
        });
        res.json(notas);
    } catch (error) {
        console.error('Erro ao listar notas:', error);
        res.status(500).json({ error: 'Erro ao listar notas' });
    }
});

router.post('/notas', async (req, res) => {
    try {
        const userId = req.userId;
        const nota = await prisma.notaApreciacao.create({
            data: { userId, ...req.body },
        });
        res.status(201).json(nota);
    } catch (error) {
        console.error('Erro ao criar nota:', error);
        res.status(500).json({ error: 'Erro ao criar nota' });
    }
});

// ===== EVENTOS DO CASAL =====

router.get('/eventos', async (req, res) => {
    try {
        const userId = req.userId;
        const eventos = await prisma.eventoCasal.findMany({
            where: { userId },
            orderBy: { data: 'desc' },
        });
        res.json(eventos);
    } catch (error) {
        console.error('Erro ao listar eventos:', error);
        res.status(500).json({ error: 'Erro ao listar eventos' });
    }
});

router.post('/eventos', async (req, res) => {
    try {
        const userId = req.userId;
        const { titulo, data, tipo, local, descricao, fotoUrl, valor } = req.body;

        const evento = await prisma.eventoCasal.create({
            data: {
                userId,
                titulo,
                data: new Date(data),
                tipo,
                local,
                descricao,
                fotoUrl,
                valor: valor ? parseFloat(valor) : null
            },
        });

        // Cross-linking: Se evento tem custo, criar despesa vinculada
        if (valor && parseFloat(valor) > 0) {
            try {
                const tipoLabel = tipo === 'datenight' ? 'Date Night' :
                    tipo === 'aniversario' ? 'Aniversário' :
                        tipo === 'viagem' ? 'Viagem' : 'Evento Especial';

                await prisma.transacao.create({
                    data: {
                        userId,
                        tipo: 'despesa',
                        valor: parseFloat(valor),
                        categoria: 'casamento',
                        descricao: `${tipoLabel}: ${titulo}`,
                        data: new Date(data),
                        status: 'efetivada',
                        // Cross-linking fields
                        vinculoModulo: 'casamento',
                        vinculoId: evento.id,
                        vinculoLabel: `${tipoLabel}: ${titulo}`
                    }
                });
            } catch (err) {
                console.error('Erro ao criar transação vinculada ao evento casal:', err);
            }
        }

        res.status(201).json(evento);
    } catch (error) {
        console.error('Erro ao criar evento:', error);
        res.status(500).json({ error: 'Erro ao criar evento' });
    }
});

// ===== ESTATÍSTICAS =====

router.get('/estatisticas', async (req, res) => {
    try {
        const userId = req.userId;

        const checkins = await prisma.relacionamentoCasal.findMany({ where: { userId } });
        const qualidadeMedia = checkins.length > 0
            ? checkins.reduce((sum, c) => sum + c.qualidade, 0) / checkins.length
            : 0;

        const metasAtivas = await prisma.metaCasal.count({
            where: { userId, status: 'ativa' },
        });

        const metasConcluidas = await prisma.metaCasal.count({
            where: { userId, status: 'concluida' },
        });

        res.json({
            totalCheckins: checkins.length,
            qualidadeMedia: Math.round(qualidadeMedia * 10) / 10,
            metasAtivas,
            metasConcluidas,
        });
    } catch (error) {
        console.error('Erro ao buscar estatísticas:', error);
        res.status(500).json({ error: 'Erro ao buscar estatísticas' });
    }
});

export default router;
