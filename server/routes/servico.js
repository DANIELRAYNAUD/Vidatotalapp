import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// Listar registros de serviço
router.get('/servico', async (req, res) => {
    try {
        const { inicio, fim, tipo } = req.query;
        const userId = req.userId;

        const where = { userId };

        // Filtrar por data
        if (inicio || fim) {
            where.data = {};
            if (inicio) where.data.gte = new Date(inicio);
            if (fim) where.data.lte = new Date(fim);
        }

        // Filtrar por tipo    if (tipo) where.tipo = tipo;

        const registros = await prisma.servicoSenhor.findMany({
            where,
            orderBy: { data: 'desc' },
        });

        res.json(registros);
    } catch (error) {
        console.error('Erro ao listar serviços:', error);
        res.status(500).json({ error: 'Erro ao listar serviços' });
    }
});

// Criar novo registro
router.post('/servico', async (req, res) => {
    try {
        const userId = req.userId;
        const { data, tipo, titulo, descricao, duracao, valor, reflexao, versiculo } = req.body;

        const registro = await prisma.servicoSenhor.create({
            data: {
                userId,
                data: new Date(data),
                tipo,
                titulo,
                descricao,
                duracao,
                valor,
                reflexao,
                versiculo,
            },
        });

        res.status(201).json(registro);
    } catch (error) {
        console.error('Erro ao criar serviço:', error);
        res.status(500).json({ error: 'Erro ao criar serviço' });
    }
});

// Atualizar registro
router.put('/servico/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.userId;
        const { data, tipo, titulo, descricao, duracao, valor, reflexao, versiculo } = req.body;

        // Verificar se o registro pertence ao usuário
        const registroExistente = await prisma.servicoSenhor.findFirst({
            where: { id, userId },
        });

        if (!registroExistente) {
            return res.status(404).json({ error: 'Registro não encontrado' });
        }

        const registro = await prisma.servicoSenhor.update({
            where: { id },
            data: {
                data: data ? new Date(data) : undefined,
                tipo: tipo || undefined,
                titulo: titulo || undefined,
                descricao,
                duracao,
                valor,
                reflexao,
                versiculo,
            },
        });

        res.json(registro);
    } catch (error) {
        console.error('Erro ao atualizar serviço:', error);
        res.status(500).json({ error: 'Erro ao atualizar serviço' });
    }
});

// Deletar registro
router.delete('/servico/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.userId;

        // Verificar se o registro pertence ao usuário
        const registroExistente = await prisma.servicoSenhor.findFirst({
            where: { id, userId },
        });

        if (!registroExistente) {
            return res.status(404).json({ error: 'Registro não encontrado' });
        }

        await prisma.servicoSenhor.delete({
            where: { id },
        });

        res.json({ message: 'Registro deletado com sucesso' });
    } catch (error) {
        console.error('Erro ao deletar serviço:', error);
        res.status(500).json({ error: 'Erro ao deletar serviço' });
    }
});

// Obter estatísticas
router.get('/servico/estatisticas', async (req, res) => {
    try {
        const userId = req.userId;

        // Buscar todos os registros do usuário
        const registros = await prisma.servicoSenhor.findMany({
            where: { userId },
            orderBy: { data: 'desc' },
        });

        // Calcular total de horas por tipo
        const horasPorTipo = registros.reduce((acc, registro) => {
            if (registro.duracao) {
                if (!acc[registro.tipo]) acc[registro.tipo] = 0;
                acc[registro.tipo] += registro.duracao;
            }
            return acc;
        }, {});

        // Calcular total de ofertas
        const totalOfertas = registros
            .filter(r => r.tipo === 'ofertas' && r.valor)
            .reduce((sum, r) => sum + (r.valor || 0), 0);

        // Calcular sequência de dias consecutivos
        let sequencia = 0;
        if (registros.length > 0) {
            const hoje = new Date();
            hoje.setHours(0, 0, 0, 0);

            const datasUnicas = [...new Set(
                registros.map(r => {
                    const d = new Date(r.data);
                    d.setHours(0, 0, 0, 0);
                    return d.getTime();
                })
            )].sort((a, b) => b - a);

            for (let i = 0; i < datasUnicas.length; i++) {
                const dataEsperada = new Date(hoje);
                dataEsperada.setDate(dataEsperada.getDate() - sequencia);
                dataEsperada.setHours(0, 0, 0, 0);

                if (datasUnicas[i] === dataEsperada.getTime()) {
                    sequencia++;
                } else {
                    break;
                }
            }
        }

        // Calcular atividade mais frequente
        const contagemPorTipo = registros.reduce((acc, registro) => {
            acc[registro.tipo] = (acc[registro.tipo] || 0) + 1;
            return acc;
        }, {});

        const atividadeMaisFrequente = Object.entries(contagemPorTipo)
            .sort((a, b) => b[1] - a[1])[0];

        res.json({
            totalRegistros: registros.length,
            horasPorTipo,
            totalOfertas,
            sequencia,
            atividadeMaisFrequente: atividadeMaisFrequente
                ? { tipo: atividadeMaisFrequente[0], quantidade: atividadeMaisFrequente[1] }
                : null,
        });
    } catch (error) {
        console.error('Erro ao buscar estatísticas:', error);
        res.status(500).json({ error: 'Erro ao buscar estatísticas' });
    }
});

export default router;
