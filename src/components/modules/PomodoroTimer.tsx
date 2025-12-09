import { useState, useEffect, useRef } from 'react'
import { Play, Pause, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { motion } from 'framer-motion'

import { focoAPI } from '@/lib/api'

type ModoTimer = 'trabalho' | 'pausa_curta' | 'pausa_longa'

interface ConfiguracoesPomodoro {
    duracaoTrabalho: number // minutos
    duracaoPausaCurta: number
    duracaoPausaLonga: number
    intervaloLongo: number // após N pomodoros
}

export function PomodoroTimer() {
    const [configuracoes] = useState<ConfiguracoesPomodoro>({
        duracaoTrabalho: 25,
        duracaoPausaCurta: 5,
        duracaoPausaLonga: 15,
        intervaloLongo: 4,
    })

    const [modo, setModo] = useState<ModoTimer>('trabalho')
    const [tempoRestante, setTempoRestante] = useState(configuracoes.duracaoTrabalho * 60)
    const [rodando, setRodando] = useState(false)
    const [pomodorosCompletos, setPomodorosCompletos] = useState(0)

    const intervaloRef = useRef<NodeJS.Timeout>()

    useEffect(() => {
        if (rodando && tempoRestante > 0) {
            intervaloRef.current = setInterval(() => {
                setTempoRestante((prev) => prev - 1)
            }, 1000)
        } else if (tempoRestante === 0) {
            handleTimerCompleto()
        }

        return () => clearInterval(intervaloRef.current)
    }, [rodando, tempoRestante])

    const handleTimerCompleto = async () => {
        setRodando(false)

        // Tocar som de conclusão (opcional)
        // new Audio('/audio/notification-bell.mp3').play()

        if (modo === 'trabalho') {
            const novaContagem = pomodorosCompletos + 1
            setPomodorosCompletos(novaContagem)

            // Salvar sessão na API
            try {
                await focoAPI.criarSessao({
                    duracao: configuracoes.duracaoTrabalho,
                    tipo: 'foco'
                })
            } catch (error) {
                console.error('Erro ao salvar sessão de foco:', error)
            }

            // Decidir próximo modo
            if (novaContagem % configuracoes.intervaloLongo === 0) {
                setModo('pausa_longa')
                setTempoRestante(configuracoes.duracaoPausaLonga * 60)
            } else {
                setModo('pausa_curta')
                setTempoRestante(configuracoes.duracaoPausaCurta * 60)
            }
        } else {
            setModo('trabalho')
            setTempoRestante(configuracoes.duracaoTrabalho * 60)
        }

        // Mostrar notificação
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('Pomodoro Timer', {
                body:
                    modo === 'trabalho'
                        ? 'Pausa! Hora de descansar 😊'
                        : 'Pausa finalizada! Hora de focar 🧠',
                icon: '/vite.svg',
            })
        }
    }

    const alternarTimer = () => {
        setRodando(!rodando)
    }

    const resetarTimer = () => {
        setRodando(false)
        setModo('trabalho')
        setTempoRestante(configuracoes.duracaoTrabalho * 60)
    }

    const formatarTempo = (segundos: number) => {
        const mins = Math.floor(segundos / 60)
        const segs = segundos % 60
        return `${mins.toString().padStart(2, '0')}:${segs.toString().padStart(2, '0')}`
    }

    const progresso =
        modo === 'trabalho'
            ? ((configuracoes.duracaoTrabalho * 60 - tempoRestante) /
                (configuracoes.duracaoTrabalho * 60)) *
            100
            : modo === 'pausa_curta'
                ? ((configuracoes.duracaoPausaCurta * 60 - tempoRestante) /
                    (configuracoes.duracaoPausaCurta * 60)) *
                100
                : ((configuracoes.duracaoPausaLonga * 60 - tempoRestante) /
                    (configuracoes.duracaoPausaLonga * 60)) *
                100

    const getGradiente = () => {
        if (modo === 'trabalho') return 'gradient-green-gold'
        if (modo === 'pausa_curta') return 'gradient-blue'
        return 'gradient-orange'
    }

    const getModoTexto = () => {
        if (modo === 'trabalho') return '🧠 Foco Profundo'
        if (modo === 'pausa_curta') return '☕ Pausa Curta'
        return '🌟 Pausa Longa'
    }

    return (
        <Card
            className={`p-xl ${getGradiente()} backdrop-blur-card border-0 relative overflow-hidden max-w-md mx-auto`}
        >
            {/* Anel de Progresso SVG */}
            <div className="relative w-64 h-64 mx-auto mb-lg">
                <svg className="w-full h-full transform -rotate-90">
                    <circle
                        cx="128"
                        cy="128"
                        r="120"
                        stroke="rgba(255,255,255,0.1)"
                        strokeWidth="8"
                        fill="none"
                    />
                    <motion.circle
                        cx="128"
                        cy="128"
                        r="120"
                        stroke="rgba(255,255,255,0.9)"
                        strokeWidth="8"
                        fill="none"
                        strokeLinecap="round"
                        initial={{ strokeDashoffset: 754 }}
                        animate={{ strokeDashoffset: 754 - (754 * progresso) / 100 }}
                        style={{ strokeDasharray: 754 }}
                        transition={{ duration: 0.5 }}
                    />
                </svg>

                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <div className="text-display text-white font-bold mb-2">
                        {formatarTempo(tempoRestante)}
                    </div>
                    <div className="text-body text-white/80 uppercase tracking-wider">
                        {getModoTexto()}
                    </div>
                </div>
            </div>

            <div className="flex items-center justify-center gap-4 mb-lg">
                <Button
                    onClick={alternarTimer}
                    size="lg"
                    className="rounded-full w-16 h-16 bg-white/20 hover:bg-white/30 backdrop-blur-sm"
                >
                    {rodando ? (
                        <Pause className="text-white" size={24} />
                    ) : (
                        <Play className="text-white" size={24} />
                    )}
                </Button>

                <Button
                    onClick={resetarTimer}
                    size="lg"
                    variant="ghost"
                    className="rounded-full w-16 h-16 bg-white/10 hover:bg-white/20"
                >
                    <RotateCcw className="text-white" size={20} />
                </Button>
            </div>

            <div className="flex items-center justify-center gap-2">
                {Array.from({ length: configuracoes.intervaloLongo }).map((_, i) => (
                    <div
                        key={i}
                        className={`w-3 h-3 rounded-full transition-all ${i < pomodorosCompletos % configuracoes.intervaloLongo
                            ? 'bg-white'
                            : 'bg-white/20'
                            }`}
                    />
                ))}
            </div>

            <div className="mt-4 text-center text-caption text-white/70">
                Pomodoros completados hoje: {pomodorosCompletos}
            </div>
        </Card>
    )
}
