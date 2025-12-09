import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { authenticate, requireAdmin } from '../middleware/auth.js';

const router = express.Router();
const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key';

/**
 * POST /api/auth/register
 * Registra um novo usuário
 * Primeiro usuário registrado vira admin automaticamente
 */
router.post('/register', async (req, res) => {
    try {
        const { email, nome, senha } = req.body;

        // Validação básica
        if (!email || !nome || !senha) {
            return res.status(400).json({ error: 'Email, nome e senha são obrigatórios' });
        }

        if (senha.length < 6) {
            return res.status(400).json({ error: 'Senha deve ter no mínimo 6 caracteres' });
        }

        // Verificar se email já existe
        const existingUser = await prisma.user.findUnique({
            where: { email }
        });

        if (existingUser) {
            return res.status(400).json({ error: 'Email já cadastrado' });
        }

        // Verificar se é o primeiro usuário (vira admin)
        const userCount = await prisma.user.count();
        const isFirstUser = userCount === 0;

        // Hash da senha
        const hashedPassword = await bcrypt.hash(senha, 10);

        // Criar usuário
        const user = await prisma.user.create({
            data: {
                email,
                nome,
                senha: hashedPassword,
                role: isFirstUser ? 'admin' : 'user',
                aprovado: isFirstUser // Primeiro usuário já aprovado
            },
            select: {
                id: true,
                email: true,
                nome: true,
                role: true,
                aprovado: true,
                createdAt: true
            }
        });

        res.status(201).json({
            message: isFirstUser
                ? 'Conta admin criada com sucesso!'
                : 'Conta criada! Aguarde aprovação do administrador.',
            user
        });
    } catch (error) {
        console.error('Erro ao registrar usuário:', error);
        res.status(500).json({ error: 'Erro ao criar conta' });
    }
});

/**
 * POST /api/auth/login
 * Autentica usuário e retorna JWT token
 */
router.post('/login', async (req, res) => {
    try {
        const { email, senha } = req.body;

        if (!email || !senha) {
            return res.status(400).json({ error: 'Email e senha são obrigatórios' });
        }

        // Buscar usuário
        const user = await prisma.user.findUnique({
            where: { email },
            select: {
                id: true,
                email: true,
                nome: true,
                senha: true,
                role: true,
                aprovado: true,
                avatarUrl: true
            }
        });

        if (!user) {
            return res.status(401).json({ error: 'Credenciais inválidas' });
        }

        // Verificar senha
        const validPassword = await bcrypt.compare(senha, user.senha);
        if (!validPassword) {
            return res.status(401).json({ error: 'Credenciais inválidas' });
        }

        // Verificar se está aprovado
        if (!user.aprovado) {
            return res.status(403).json({
                error: 'Conta pendente de aprovação pelo administrador'
            });
        }

        // Gerar JWT token
        const token = jwt.sign(
            { userId: user.id, role: user.role },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        // Remover senha do objeto de resposta
        const { senha: _, ...userWithoutPassword } = user;

        res.json({
            token,
            user: userWithoutPassword
        });
    } catch (error) {
        console.error('Erro ao fazer login:', error);
        res.status(500).json({ error: 'Erro ao fazer login' });
    }
});

/**
 * GET /api/auth/me
 * Retorna dados do usuário autenticado
 */
router.get('/me', authenticate, async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.userId },
            select: {
                id: true,
                email: true,
                nome: true,
                role: true,
                aprovado: true,
                avatarUrl: true,
                createdAt: true
            }
        });

        if (!user) {
            return res.status(404).json({ error: 'Usuário não encontrado' });
        }

        res.json(user);
    } catch (error) {
        console.error('Erro ao buscar usuário:', error);
        res.status(500).json({ error: 'Erro ao buscar dados do usuário' });
    }
});

/**
 * GET /api/auth/users
 * Lista todos os usuários (ADMIN only)
 */
router.get('/users', authenticate, requireAdmin, async (req, res) => {
    try {
        const users = await prisma.user.findMany({
            select: {
                id: true,
                email: true,
                nome: true,
                role: true,
                aprovado: true,
                avatarUrl: true,
                createdAt: true
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        res.json(users);
    } catch (error) {
        console.error('Erro ao listar usuários:', error);
        res.status(500).json({ error: 'Erro ao listar usuários' });
    }
});

/**
 * PATCH /api/auth/users/:id/approve
 * Aprova um usuário (ADMIN only)
 */
router.patch('/users/:id/approve', authenticate, requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { aprovado } = req.body;

        const user = await prisma.user.update({
            where: { id },
            data: { aprovado },
            select: {
                id: true,
                email: true,
                nome: true,
                role: true,
                aprovado: true
            }
        });

        res.json({
            message: aprovado ? 'Usuário aprovado' : 'Aprovação removida',
            user
        });
    } catch (error) {
        console.error('Erro ao aprovar usuário:', error);
        res.status(500).json({ error: 'Erro ao atualizar usuário' });
    }
});

export default router;
