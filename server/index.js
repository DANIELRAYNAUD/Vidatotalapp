import express from 'express'
import cors from 'cors'
import { PrismaClient } from '@prisma/client'
import authRouter from './routes/auth.js'
import habitosRouter from './routes/habitos.js'
import saudeRouter from './routes/saude.js'
import leituraRouter from './routes/leitura.js'
import agendaRouter from './routes/agenda.js'
import financasRouter from './routes/financas.js'
import projetosRouter from './routes/projetos.js'
import alimentacaoRouter from './routes/alimentacao.js'
import treinosRouter from './routes/treinos.js'
import sonoRouter from './routes/sono.js'
import estudosRouter from './routes/estudos.js'
import notasRouter from './routes/notas.js'
import focoRouter from './routes/foco.js'
import metasRouter from './routes/metas.js'
import servicoRouter from './routes/servico.js'
import servicoMedicoRouter from './routes/servico-medico.js'
import familiaRouter from './routes/familia.js'
import casamentoRouter from './routes/casamento.js'

const app = express()
const prisma = new PrismaClient()
const PORT = process.env.PORT || 3001

// Middleware
app.use(cors({
    origin: 'http://localhost:5173', // Vite dev server
    credentials: true
}))
app.use(express.json())

// Logging middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`)
    next()
})

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Routes
app.use('/api/auth', authRouter)
app.use('/api/habitos', habitosRouter)
app.use('/api/saude', saudeRouter)
app.use('/api/leitura', leituraRouter)
app.use('/api/agenda', agendaRouter)
app.use('/api/financas', financasRouter)
app.use('/api/projetos', projetosRouter)
app.use('/api/alimentacao', alimentacaoRouter)
app.use('/api/treinos', treinosRouter)
app.use('/api/sono', sonoRouter)
app.use('/api/estudos', estudosRouter)
app.use('/api/notas', notasRouter)
app.use('/api/foco', focoRouter)
app.use('/api/metas', metasRouter)
app.use('/api/servico', servicoRouter)
app.use('/api/servico-medico', servicoMedicoRouter)
app.use('/api/familia', familiaRouter)
app.use('/api/casamento', casamentoRouter)

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Endpoint não encontrado' })
})

// Error handler
app.use((err, req, res, next) => {
    console.error('Error:', err)
    res.status(err.status || 500).json({
        error: err.message || 'Erro interno do servidor',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    })
})

// Graceful shutdown
process.on('SIGINT', async () => {
    console.log('\nDesligando servidor...')
    await prisma.$disconnect()
    process.exit(0)
})

app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando em http://localhost:${PORT}`)
    console.log(`📊 Prisma conectado ao banco de dados`)
})

export { prisma }
