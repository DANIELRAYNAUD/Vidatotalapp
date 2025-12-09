import { useEffect } from 'react'
import { habitosAPI } from '@/lib/api'
import { useToast } from '@/components/ui/use-toast'
import { ToastAction } from '@/components/ui/toast'
import { CheckCircle2 } from 'lucide-react'
import { useAuthStore } from '@/lib/authStore'

export function AlarmManager() {
    const { toast } = useToast()
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated)

    useEffect(() => {
        // Não executar se não estiver autenticado
        if (!isAuthenticated) return

        const checkAlarms = async () => {
            try {
                // Carregar hábitos apenas para verificar alarmes
                // Idealmente, isso seria otimizado no backend ou cache, mas para MVP está ok
                const res = await habitosAPI.listar()
                const habitos = res.data as any[]

                const now = new Date()
                const currentTime = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })

                habitos.forEach(habito => {
                    // Só dispara se tiver lembrete, horário e NÃO estiver completo hoje
                    if (habito.lembrete && habito.horarioLembrete) {
                        // Verificar se já completou hoje
                        const hoje = new Date()
                        hoje.setHours(0, 0, 0, 0)
                        const completoHoje = habito.registros?.some((r: any) => {
                            const dataReg = new Date(r.data)
                            dataReg.setHours(0, 0, 0, 0)
                            return dataReg.getTime() === hoje.getTime() && r.completo
                        })

                        if (completoHoje) return

                        let horarios: string[] = []
                        try {
                            if (habito.horarioLembrete.startsWith('[')) {
                                horarios = JSON.parse(habito.horarioLembrete)
                            } else {
                                horarios = [habito.horarioLembrete]
                            }
                        } catch (e) {
                            horarios = [habito.horarioLembrete]
                        }

                        if (horarios.includes(currentTime)) {
                            const lastTriggered = localStorage.getItem(`alarm_${habito.id}_${currentTime}`)

                            if (!lastTriggered) {
                                // Disparar alarme com ação de concluir
                                toast({
                                    title: `⏰ Hora do Hábito: ${habito.nome}`,
                                    description: `Está na hora de: ${habito.nome}!`,
                                    duration: Infinity, // Fica na tela até interagir
                                    className: "bg-primary-gold text-white border-none",
                                    action: (
                                        <ToastAction
                                            altText="Concluir"
                                            className="bg-white text-primary-gold hover:bg-white/90 border-none font-bold"
                                            onClick={async () => {
                                                try {
                                                    await habitosAPI.toggle(habito.id)

                                                    // Disparar evento global de atualização
                                                    window.dispatchEvent(new Event('habit-updated'))

                                                    toast({
                                                        title: "Hábito Concluído! 🎉",
                                                        description: `${habito.nome} marcado como feito.`,
                                                        variant: "success",
                                                        duration: 3000,
                                                    })
                                                } catch (error) {
                                                    console.error('Erro ao concluir hábito:', error)
                                                }
                                            }}
                                        >
                                            <CheckCircle2 className="mr-2 h-4 w-4" />
                                            Concluir
                                        </ToastAction>
                                    ),
                                })

                                localStorage.setItem(`alarm_${habito.id}_${currentTime}`, 'true')

                                setTimeout(() => {
                                    localStorage.removeItem(`alarm_${habito.id}_${currentTime}`)
                                }, 60000)
                            }
                        }
                    }
                })
            } catch (error) {
                console.error('Erro ao verificar alarmes:', error)
            }
        }

        // Verificar a cada 30 segundos para garantir que não perca o minuto, 
        // mas evitando chamadas excessivas. O localStorage previne duplicatas no mesmo minuto.
        const interval = setInterval(checkAlarms, 30000)

        // Primeira verificação imediata
        checkAlarms()

        return () => clearInterval(interval)
    }, [toast, isAuthenticated])

    return null // Componente sem renderização visual direta (apenas lógica e toasts)
}
