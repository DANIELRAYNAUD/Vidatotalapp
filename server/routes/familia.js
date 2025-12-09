import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// ===== MEMBROS DA FAMÍLIA =====

router.get('/membros', async (req, res) => {
    try {
        const userId = req.userId;
        const membros = await prisma.membroFamilia.findMany({
            where: { userId },
            include: {
                escola: true,
                consultasMedicas: { orderBy: { dataHora: 'desc' }, take: 5 },
                terapias: { where: { ativo: true } },
                boletins: { orderBy: { ano: 'desc' }, take: 2 },
            },
            orderBy: { relacao: 'asc' },
        });
        res.json(membros);
    } catch (error) {
        console.error('Erro ao listar membros:', error);
        res.status(500).json({ error: 'Erro ao listar membros' });
    }
});

router.post('/membros', async (req, res) => {
    try {
        const userId = req.userId;
        const membro = await prisma.membroFamilia.create({
            data: { userId, ...req.body },
            include: { escola: true },
        });
        res.status(201).json(membro);
    } catch (error) {
        console.error('Erro ao criar membro:', error);
        res.status(500).json({ error: 'Erro ao criar membro' });
    }
});

router.put('/membros/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const membro = await prisma.membroFamilia.update({
            where: { id },
            data: req.body,
            include: { escola: true },
        });
        res.json(membro);
    } catch (error) {
        console.error('Erro ao atualizar membro:', error);
        res.status(500).json({ error: 'Erro ao atualizar membro' });
    }
});

// ===== ESCOLAS =====

router.get('/escolas', async (req, res) => {
    try {
        const userId = req.userId;
        const escolas = await prisma.escola.findMany({
            where: { userId },
            include: { membros: true },
        });
        res.json(escolas);
    } catch (error) {
        console.error('Erro ao listar escolas:', error);
        res.status(500).json({ error: 'Erro ao listar escolas' });
    }
});

router.post('/escolas', async (req, res) => {
    try {
        const userId = req.userId;
        const escola = await prisma.escola.create({
            data: { userId, ...req.body },
        });
        res.status(201).json(escola);
    } catch (error) {
        console.error('Erro ao criar escola:', error);
        res.status(500).json({ error: 'Erro ao criar escola' });
    }
});

// ===== BOLETINS =====

router.get('/boletins/:membroId', async (req, res) => {
    try {
        const { membroId } = req.params;
        const boletins = await prisma.boletimEscolar.findMany({
            where: { membroFamiliaId: membroId },
            orderBy: [{ ano: 'desc' }, { numero: 'desc' }],
        });
        res.json(boletins);
    } catch (error) {
        console.error('Erro ao listar boletins:', error);
        res.status(500).json({ error: 'Erro ao listar boletins' });
    }
});

router.post('/boletins', async (req, res) => {
    try {
        const boletim = await prisma.boletimEscolar.create({
            data: req.body,
        });
        res.status(201).json(boletim);
    } catch (error) {
        console.error('Erro ao criar boletim:', error);
        res.status(500).json({ error: 'Erro ao criar boletim' });
    }
});

// ===== CONSULTAS MÉDICAS =====

router.get('/consultas/:membroId', async (req, res) => {
    try {
        const { membroId } = req.params;
        const consultas = await prisma.consultaMedicaFamilia.findMany({
            where: { membroFamiliaId: membroId },
            orderBy: { dataHora: 'desc' },
        });
        res.json(consultas);
    } catch (error) {
        console.error('Erro ao listar consultas:', error);
        res.status(500).json({ error: 'Erro ao listar consultas' });
    }
});

router.post('/consultas', async (req, res) => {
    try {
        const consulta = await prisma.consultaMedicaFamilia.create({
            data: req.body,
        });
        res.status(201).json(consulta);
    } catch (error) {
        console.error('Erro ao criar consulta:', error);
        res.status(500).json({ error: 'Erro ao criar consulta' });
    }
});

// ===== TERAPIAS =====

router.get('/terapias/:membroId', async (req, res) => {
    try {
        const { membroId } = req.params;
        const terapias = await prisma.terapiaFamilia.findMany({
            where: { membroFamiliaId: membroId },
            orderBy: { dataInicio: 'desc' },
        });
        res.json(terapias);
    } catch (error) {
        console.error('Erro ao listar terapias:', error);
        res.status(500).json({ error: 'Erro ao listar terapias' });
    }
});

router.post('/terapias', async (req, res) => {
    try {
        const terapia = await prisma.terapiaFamilia.create({
            data: req.body,
        });
        res.status(201).json(terapia);
    } catch (error) {
        console.error('Erro ao criar terapia:', error);
        res.status(500).json({ error: 'Erro ao criar terapia' });
    }
});

// ===== FUNCIONÁRIOS =====

router.get('/funcionarios', async (req, res) => {
    try {
        const userId = req.userId;
        const funcionarios = await prisma.funcionario.findMany({
            where: { userId },
            orderBy: { nome: 'asc' },
        });
        res.json(funcionarios);
    } catch (error) {
        console.error('Erro ao listar funcionários:', error);
        res.status(500).json({ error: 'Erro ao listar funcionários' });
    }
});

router.post('/funcionarios', async (req, res) => {
    try {
        const userId = req.userId;
        const funcionario = await prisma.funcionario.create({
            data: { userId, ...req.body },
        });
        res.status(201).json(funcionario);
    } catch (error) {
        console.error('Erro ao criar funcionário:', error);
        res.status(500).json({ error: 'Erro ao criar funcionário' });
    }
});

// ===== PETS =====

router.get('/pets', async (req, res) => {
    try {
        const userId = req.userId;
        const pets = await prisma.pet.findMany({
            where: { userId },
            include: { cuidados: { orderBy: { data: 'desc' }, take: 10 } },
            orderBy: { nome: 'asc' },
        });
        res.json(pets);
    } catch (error) {
        console.error('Erro ao listar pets:', error);
        res.status(500).json({ error: 'Erro ao listar pets' });
    }
});

router.post('/pets', async (req, res) => {
    try {
        const userId = req.userId;
        const pet = await prisma.pet.create({
            data: { userId, ...req.body },
        });
        res.status(201).json(pet);
    } catch (error) {
        console.error('Erro ao criar pet:', error);
        res.status(500).json({ error: 'Erro ao criar pet' });
    }
});

router.post('/pets/:petId/cuidados', async (req, res) => {
    try {
        const { petId } = req.params;
        const cuidado = await prisma.cuidadoPet.create({
            data: { petId, ...req.body },
        });
        res.status(201).json(cuidado);
    } catch (error) {
        console.error('Erro ao registrar cuidado:', error);
        res.status(500).json({ error: 'Erro ao registrar cuidado' });
    }
});

export default router;
