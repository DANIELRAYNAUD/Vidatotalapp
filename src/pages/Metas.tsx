import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Target, TrendingUp, Calendar, Plus, CheckCircle2, Flag } from 'lucide-react'
import { cn } from '@/lib/utils'
import { metasAPI } from '@/lib/api'

interface Milestone {
    id: string
    title: string
    completed: boolean
    date: string
}

interface Goal {
    id: string
    title: string
    category: 'career' | 'health' | 'finance' | 'personal' | 'learning'
    description: string
    progress: number
    deadline: string
    milestones: Milestone[]
    priority: 'high' | 'medium' | 'low'
}

export function Metas() {
    const [goals, setGoals] = useState<Goal[]>([])
    const [loading, setLoading] = useState(true)

    const carregarMetas = async () => {
        try {
            setLoading(true)
            const response = await metasAPI.listar()
            const metasFormatadas = (response.data as any).map((m: any) => ({
                ...m,
                milestones: typeof m.milestones === 'string' ? JSON.parse(m.milestones) : m.milestones || []
            }))
            setGoals(metasFormatadas)
        } catch (error) {
            console.error('Erro ao carregar metas:', error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        carregarMetas()
    }, [])

    const getCategoryIcon = (category: string) => {
        const icons = {
            career: '💼',
            health: '💪',
            finance: '💰',
            personal: '🎯',
            learning: '📚'
        }
        return icons[category as keyof typeof icons] || '🎯'
    }

    const getPriorityColor = (priority: string) => {
        const colors = {
            high: 'bg-accent-error/20 text-accent-error',
            medium: 'bg-accent-warning/20 text-accent-warning',
            low: 'bg-accent-success/20 text-accent-success'
        }
        return colors[priority as keyof typeof colors]
    }

    const totalGoals = goals.length
    const completedMilestones = goals.reduce((sum: number, goal: Goal) =>
        sum + goal.milestones.filter(m => m.completed).length, 0
    )
    const totalMilestones = goals.reduce((sum: number, goal: Goal) => sum + goal.milestones.length, 0)
    const overallProgress = totalMilestones > 0 ? Math.round((completedMilestones / totalMilestones) * 100) : 0

    if (loading) {
        return <div className="p-8 text-center text-text-secondary">Carregando metas...</div>
    }

    return (
        <div className="space-y-xl">
            <div>
                <h1 className="text-h1 font-bold text-text-primary mb-sm">
                    🎯 Metas
                </h1>
                <p className="text-body-lg text-text-secondary">
                    Defina e acompanhe suas metas de longo prazo
                </p>
            </div>

            {/* Visão Geral */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-lg">
                <Card className="gradient-green-gold">
                    <CardContent className="p-xl">
                        <Target className="text-white mb-md" size={40} />
                        <h3 className="text-h2 font-bold text-white mb-2">
                            {totalGoals}
                        </h3>
                        <p className="text-body text-white/90">
                            Metas Ativas
                        </p>
                    </CardContent>
                </Card>

                <Card className="gradient-teal">
                    <CardContent className="p-xl">
                        <CheckCircle2 className="text-white mb-md" size={40} />
                        <h3 className="text-h2 font-bold text-white mb-2">
                            {completedMilestones}/{totalMilestones}
                        </h3>
                        <p className="text-body text-white/90">
                            Marcos Completados
                        </p>
                    </CardContent>
                </Card>

                <Card className="gradient-purple">
                    <CardContent className="p-xl">
                        <TrendingUp className="text-white mb-md" size={40} />
                        <h3 className="text-h2 font-bold text-white mb-2">
                            {overallProgress}%
                        </h3>
                        <p className="text-body text-white/90">
                            Progresso Geral
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Botão Adicionar Meta */}
            <div className="flex justify-end">
                <Button size="lg">
                    <Plus className="mr-2" size={20} />
                    Nova Meta
                </Button>
            </div>

            {/* Lista de Metas */}
            <div className="space-y-lg">
                {goals.map((goal) => {
                    const completedMilestones = goal.milestones.filter(m => m.completed).length
                    const daysUntilDeadline = Math.ceil(
                        (new Date(goal.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
                    )

                    return (
                        <Card key={goal.id} className="glass-hover">
                            <CardHeader>
                                <div className="flex items-start justify-between">
                                    <div className="flex items-start gap-md flex-1">
                                        <span className="text-4xl">
                                            {getCategoryIcon(goal.category)}
                                        </span>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-2">
                                                <CardTitle className="text-h3">
                                                    {goal.title}
                                                </CardTitle>
                                                <span className={cn(
                                                    "text-caption px-3 py-1 rounded-full",
                                                    getPriorityColor(goal.priority)
                                                )}>
                                                    {goal.priority === 'high' ? 'Alta' : goal.priority === 'medium' ? 'Média' : 'Baixa'}
                                                </span>
                                            </div>
                                            <p className="text-body text-text-secondary mb-md">
                                                {goal.description}
                                            </p>
                                            <div className="flex items-center gap-md text-caption text-text-tertiary">
                                                <div className="flex items-center gap-1">
                                                    <Calendar size={14} />
                                                    <span>
                                                        {daysUntilDeadline > 0
                                                            ? `${daysUntilDeadline} dias restantes`
                                                            : 'Prazo expirado'}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Flag size={14} />
                                                    <span>{goal.deadline}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-h2 font-bold text-primary-green">
                                            {goal.progress}%
                                        </p>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <Progress value={goal.progress} className="mb-lg" />

                                {/* Milestones */}
                                <div className="space-y-md">
                                    <h4 className="text-body-lg font-semibold text-text-primary flex items-center gap-2">
                                        <CheckCircle2 size={18} className="text-accent-success" />
                                        Marcos ({completedMilestones}/{goal.milestones.length})
                                    </h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
                                        {goal.milestones.map((milestone) => (
                                            <div
                                                key={milestone.id}
                                                className={cn(
                                                    "flex items-center gap-3 p-md rounded-lg transition-colors",
                                                    milestone.completed
                                                        ? "bg-accent-success/10"
                                                        : "bg-white/5"
                                                )}
                                            >
                                                <div className={cn(
                                                    "w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0",
                                                    milestone.completed
                                                        ? "bg-accent-success"
                                                        : "bg-white/10"
                                                )}>
                                                    {milestone.completed && (
                                                        <CheckCircle2 className="text-background" size={16} />
                                                    )}
                                                </div>
                                                <div className="flex-1">
                                                    <p className={cn(
                                                        "text-body font-medium",
                                                        milestone.completed
                                                            ? "text-text-primary line-through"
                                                            : "text-text-primary"
                                                    )}>
                                                        {milestone.title}
                                                    </p>
                                                    <p className="text-caption text-text-tertiary">
                                                        {milestone.date}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )
                })}
            </div>
        </div>
    )
}
