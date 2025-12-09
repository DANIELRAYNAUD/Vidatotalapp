import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { BookOpen, Trophy, Star, TrendingUp, Plus, CheckCircle2 } from 'lucide-react'
import { estudosAPI } from '@/lib/api'

interface LearningPath {
    id: string
    title: string
    description: string
    icon: string
    progress: number
    totalLessons: number
    completedLessons: number
    xp: number
    level: number
    color: string
}

interface StudySession {
    id: string
    subject: string
    duration: number
    xpEarned: number
    date: string
}

export function Estudos() {
    const [learningPaths, setLearningPaths] = useState<LearningPath[]>([])
    const [studySessions, setStudySessions] = useState<StudySession[]>([])
    const [loading, setLoading] = useState(true)

    const carregarDados = async () => {
        try {
            setLoading(true)
            const [cursosRes, sessoesRes] = await Promise.all([
                estudosAPI.listar(),
                estudosAPI.listarSessoes(''),
            ])
            setLearningPaths((cursosRes.data as any) || [])
            setStudySessions((sessoesRes.data as any) || [])
        } catch (error) {
            console.error('Erro ao carregar estudos:', error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        carregarDados()
    }, [])

    const totalXP = studySessions.reduce((acc, session) => acc + session.xpEarned, 0) +
        learningPaths.reduce((acc, path) => acc + path.xp, 0)
    const overallLevel = Math.floor(totalXP / 1000) + 1
    const xpToNextLevel = 1000 - (totalXP % 1000)

    if (loading) {
        return <div className="p-8 text-center text-text-secondary">Carregando estudos...</div>
    }

    return (
        <div className="space-y-xl">
            <div>
                <h1 className="text-h1 font-bold text-text-primary mb-sm">
                    🎓 Estudos
                </h1>
                <p className="text-body-lg text-text-secondary">
                    Trilhas de aprendizado e progresso de estudos
                </p>
            </div>

            {/* Perfil de Estudante */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-lg">
                <Card className="lg:col-span-1 gradient-purple">
                    <CardContent className="p-xl">
                        <div className="flex items-center gap-md mb-lg">
                            <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
                                <Trophy className="text-white" size={32} />
                            </div>
                            <div>
                                <h3 className="text-h3 font-bold text-white mb-1">Nível {overallLevel}</h3>
                                <p className="text-body text-white/80">Estudante Dedicado</p>
                            </div>
                        </div>
                        <div className="space-y-md">
                            <div className="flex items-center justify-between text-white">
                                <span className="text-body">XP Total</span>
                                <span className="text-h3 font-bold">{totalXP.toLocaleString()}</span>
                            </div>
                            <Progress value={(totalXP % 1000) / 10} className="bg-white/20" />
                            <p className="text-caption text-white/80">
                                {xpToNextLevel} XP para nível {overallLevel + 1}
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* Estatísticas */}
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <TrendingUp className="text-accent-success" size={24} />
                            Estatísticas desta Semana
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-3 gap-lg">
                            <div className="text-center">
                                <p className="text-h2 font-bold text-primary-green mb-1">8.5h</p>
                                <p className="text-body text-text-secondary">Tempo de Estudo</p>
                            </div>
                            <div className="text-center">
                                <p className="text-h2 font-bold text-accent-info mb-1">15</p>
                                <p className="text-body text-text-secondary">Lições Completadas</p>
                            </div>
                            <div className="text-center">
                                <p className="text-h2 font-bold text-primary-gold mb-1">675 XP</p>
                                <p className="text-body text-text-secondary">XP Ganho</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Trilhas de Aprendizado */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                            <BookOpen className="text-accent-info" size={24} />
                            Trilhas de Aprendizado
                        </CardTitle>
                        <Button size="sm">
                            <Plus className="mr-2" size={16} />
                            Nova Trilha
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-md">
                        {learningPaths.map((path) => (
                            <Card key={path.id} className="glass-hover cursor-pointer border-white/10">
                                <CardContent className="p-lg">
                                    <div className="flex items-start justify-between mb-md">
                                        <div className="flex items-center gap-3">
                                            <span className="text-4xl">{path.icon}</span>
                                            <div>
                                                <h3 className="text-body-lg font-semibold text-text-primary mb-1">
                                                    {path.title}
                                                </h3>
                                                <div className="flex items-center gap-2">
                                                    <Star className="text-primary-gold" size={14} />
                                                    <span className="text-caption text-text-secondary">
                                                        Nível {path.level}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <p className="text-body text-text-secondary mb-lg">
                                        {path.description}
                                    </p>
                                    <div className="space-y-2">
                                        <Progress value={path.progress} />
                                        <div className="flex items-center justify-between text-caption text-text-secondary">
                                            <span>{path.completedLessons}/{path.totalLessons} lições</span>
                                            <span>{path.xp} XP</span>
                                        </div>
                                    </div>
                                    <Button className="w-full mt-md" variant="outline">
                                        Continuar Estudando
                                    </Button>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Sessões Recentes */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <CheckCircle2 className="text-accent-success" size={24} />
                        Sessões Recentes
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-md">
                        {studySessions.map((session) => (
                            <div
                                key={session.id}
                                className="flex items-center justify-between p-md rounded-lg hover:bg-white/5 transition-colors"
                            >
                                <div className="flex items-center gap-md">
                                    <div className="w-10 h-10 rounded-full bg-accent-info/20 flex items-center justify-center">
                                        <BookOpen className="text-accent-info" size={20} />
                                    </div>
                                    <div>
                                        <p className="text-body font-medium text-text-primary">
                                            {session.subject}
                                        </p>
                                        <p className="text-caption text-text-secondary">
                                            {session.date}
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-body font-semibold text-text-primary">
                                        {session.duration} min
                                    </p>
                                    <p className="text-caption text-primary-gold">
                                        +{session.xpEarned} XP
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Conquistas */}
            <Card className="gradient-green-gold">
                <CardContent className="p-xl">
                    <div className="flex items-center gap-md">
                        <Trophy className="text-white" size={48} />
                        <div>
                            <h3 className="text-h3 font-bold text-white mb-2">
                                🏆 Continue Assim!
                            </h3>
                            <p className="text-body text-white/90">
                                Você está mantendo uma sequência de 12 dias! Estude hoje para não perder.
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
