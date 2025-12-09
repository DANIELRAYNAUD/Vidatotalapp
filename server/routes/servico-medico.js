import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// ===== EMPRESAS =====

// Listar empresas
router.get('/empresas', async (req, res) => {
    try {
        const userId = req.userId;
        const empresas = await prisma.empresaMedica.findMany({
            where: { userId },
            include: { plantoes: true },
            orderBy: { nome: 'asc' },
        });
        res.json(empresas);
    } catch (error) {
        console.error('Erro ao listar empresas:', error);
        res.status(500).json({ error: 'Erro ao listar empresas' });
    }
});

// Criar empresa
router.post('/empresas', async (req, res) => {
    try {
        const userId = req.userId;
        const empresa = await prisma.empresaMedica.create({
            data: { userId, ...req.body },
        });
        res.status(201).json(empresa);
    } catch (error) {
        console.error('Erro ao criar empresa:', error);
        res.status(500).json({ error: 'Erro ao criar empresa' });
    }
});

// Atualizar empresa
router.put('/empresas/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.userId;

        const existe = await prisma.empresaMedica.findFirst({ where: { id, userId } });
        if (!existe) return res.status(404).json({ error: 'Empresa não encontrada' });

        const empresa = await prisma.empresaMedica.update({
            where: { id },
            data: req.body,
        });
        res.json(empresa);
    } catch (error) {
        console.error('Erro ao atualizar empresa:', error);
        res.status(500).json({ error: 'Erro ao atualizar empresa' });
    }
});

// Deletar empresa
router.delete('/empresas/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.userId;

        const existe = await prisma.empresaMedica.findFirst({ where: { id, userId } });
        if (!existe) return res.status(404).json({ error: 'Empresa não encontrada' });

        await prisma.empresaMedica.delete({ where: { id } });
        res.json({ message: 'Empresa deletada com sucesso' });
    } catch (error) {
        console.error('Erro ao deletar empresa:', error);
        res.status(500).json({ error: 'Erro ao deletar empresa' });
    }
});

// ===== PLANTÕES =====

// Listar plantões
router.get('/plantoes', async (req, res) => {
    try {
        const userId = req.userId;
        const { inicio, fim, empresaId, status } = req.query;

        const where = { userId };
        if (inicio || fim) {
            where.data = {};
            if (inicio) where.data.gte = new Date(inicio);
            if (fim) where.data.lte = new Date(fim);
        }
        if (empresaId) where.empresaId = empresaId;
        if (status) where.status = status;

        const plantoes = await prisma.plantaoMedico.findMany({
            where,
            include: { empresa: true },
            orderBy: { data: 'desc' },
        });
        res.json(plantoes);
    } catch (error) {
        console.error('Erro ao listar plantões:', error);
        res.status(500).json({ error: 'Erro ao listar plantões' });
    }
});

// Criar plantão
router.post('/plantoes', async (req, res) => {
    try {
        const userId = req.userId;
        const plantao = await prisma.plantaoMedico.create({
            data: { userId, ...req.body },
            include: { empresa: true },
        });
        res.status(201).json(plantao);
    } catch (error) {
        console.error('Erro ao criar plantão:', error);
        res.status(500).json({ error: 'Erro ao criar plantão' });
    }
});

// Atualizar plantão
router.put('/plantoes/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.userId;

        const existe = await prisma.plantaoMedico.findFirst({ where: { id, userId } });
        if (!existe) return res.status(404).json({ error: 'Plantão não encontrado' });

        const plantao = await prisma.plantaoMedico.update({
            where: { id },
            data: req.body,
            include: { empresa: true },
        });

        // Automação Financeira: Se mudou para "concluido", criar conta a receber
        if (req.body.status === 'concluido' && existe.status !== 'concluido' && !plantao.transacaoId) {
            try {
                const empresa = await prisma.empresaMedica.findUnique({ where: { id: plantao.empresaId } });
                // Criar conta a receber (pendente) com data de vencimento baseada no dia de pagamento da empresa
                const dataVencimento = new Date(plantao.data);
                dataVencimento.setDate(empresa.diaPagamento || 5); // Dia do pagamento da empresa
                if (dataVencimento < plantao.data) {
                    // Se o dia já passou neste mês, vai para o próximo
                    dataVencimento.setMonth(dataVencimento.getMonth() + 1);
                }

                const dataFormatada = new Date(plantao.data).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
                const labelVinculo = `Plantão ${empresa?.nome} - ${dataFormatada}`;

                const transacao = await prisma.transacao.create({
                    data: {
                        userId,
                        contaId: null, // Sem conta = pendente
                        tipo: 'receita',
                        valor: plantao.valor,
                        categoria: 'plantao',
                        descricao: `Plantão ${empresa?.nome} - ${plantao.tipoServico} (${plantao.blocoHorario})`,
                        data: dataVencimento,
                        status: 'pendente',
                        // Cross-linking fields
                        vinculoModulo: 'servico_medico',
                        vinculoId: plantao.id,
                        vinculoLabel: labelVinculo
                    },
                });

                await prisma.plantaoMedico.update({
                    where: { id },
                    data: { transacaoId: transacao.id },
                });
            } catch (error) {
                console.error('Erro ao criar conta a receber automática:', error);
            }
        }

        res.json(plantao);
    } catch (error) {
        console.error('Erro ao atualizar plantão:', error);
        res.status(500).json({ error: 'Erro ao atualizar plantão' });
    }
});

// Deletar plantão
router.delete('/plantoes/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.userId;

        const existe = await prisma.plantaoMedico.findFirst({ where: { id, userId } });
        if (!existe) return res.status(404).json({ error: 'Plantão não encontrado' });

        await prisma.plantaoMedico.delete({ where: { id } });
        res.json({ message: 'Plantão deletado com sucesso' });
    } catch (error) {
        console.error('Erro ao deletar plantão:', error);
        res.status(500).json({ error: 'Erro ao deletar plantão' });
    }
});

// Estatísticas
router.get('/estatisticas', async (req, res) => {
    try {
        const userId = req.userId;

        const plantoes = await prisma.plantaoMedico.findMany({
            where: { userId },
            include: { empresa: true },
        });

        const totalPlantoes = plantoes.length;
        const plantoesConcluidos = plantoes.filter(p => p.status === 'concluido').length;
        const plantoesPagos = plantoes.filter(p => p.status === 'pago').length;
        const valorReceber = plantoes
            .filter(p => p.status === 'concluido')
            .reduce((sum, p) => sum + p.valor, 0);
        const valorTotal = plantoes.reduce((sum, p) => sum + p.valor, 0);

        res.json({
            totalPlantoes,
            plantoesConcluidos,
            plantoesPagos,
            valorReceber,
            valorTotal,
        });
    } catch (error) {
        console.error('Erro ao buscar estatísticas:', error);
        res.status(500).json({ error: 'Erro ao buscar estatísticas' });
    }
});

export default router;
