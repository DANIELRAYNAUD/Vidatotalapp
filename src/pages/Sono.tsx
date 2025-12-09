import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Moon, Sun, TrendingUp, Clock, Calendar, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { sonoAPI } from '@/lib/api'

interface SleepRecord {
    id: string
    date: string
    bedTime: string
    wakeTime: string
    duration: number
    quality: 'excellent' | 'good' | 'fair' | 'poor'
    deepSleep: number
    remSleep: number
    lightSleep: number
}

export function Sono() {
    const [sleepRecords, setSleepRecords] = useState<SleepRecord[]>([])
    const [loading, setLoading] = useState(true)

    const carregarRegistros = async () => {
        try {
            setLoading(true)
            const response = await sonoAPI.listar()
            setSleepRecords(response.data as any)
        } catch (error) {
            console.error('Erro ao carregar registros de sono:', error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        carregarRegistros()
    }, [])

    const getQualityLabel = (quality: string) => {
        const labels = {
            excellent: 'Excelente',
            good: 'Bom',
            fair: 'Regular',
            poor: 'Ruim'
        }
        return labels[quality as keyof typeof labels] || quality
    }

    const getQualityBg = (quality: string) => {
        const bgs = {
            excellent: 'bg-accent-success/20',
            good: 'bg-primary-green/20',
            fair: 'bg-accent-warning/20',
            poor: 'bg-accent-error/20'
        }
        return bgs[quality as keyof typeof bgs] || 'bg-gray-500/20'
    }

    const getQualityColor = (quality: string) => {
        const colors = {
            excellent: 'text-accent-success',
            good: 'text-primary-green',
            fair: 'text-accent-warning',
            poor: 'text-accent-error'
        }
        return colors[quality as keyof typeof colors] || 'text-gray-500'
    }

    const averageSleep = sleepRecords.length > 0
        ? sleepRecords.reduce((sum, r) => sum + r.duration, 0) / sleepRecords.length
        : 0

    const averageDeepSleep = sleepRecords.length > 0
        ? sleepRecords.reduce((sum, r) => sum + r.deepSleep, 0) / sleepRecords.length
        : 0

    const sleepGoal = 8
    const sleepGoalProgress = (averageSleep / sleepGoal) * 100

    const latestRecord = sleepRecords.length > 0 ? sleepRecords[0] : null

    if (loading) {
        return <div className="p-8 text-center text-text-secondary">Carregando dados do sono...</div>
    }

    return (
        <div className="space-y-xl">
            <div>
                <h1 className="text-h1 font-bold text-text-primary mb-sm">
                    🌙 Sono
                </h1>
                <p className="text-body-lg text-text-secondary">
                    Registre e analise a qualidade do seu sono
                </p>
            </div>

            {/* Resumo Noite Passada */}
            {latestRecord && (
                <Card className="gradient-blue">
                    <CardContent className="p-xl">
                        <div className="flex items-center justify-between mb-lg">
                            <div>
                                <h3 className="text-h3 font-bold text-white mb-2">
                                    Última Noite de Sono
                                </h3>
                                <p className="text-body text-white/90">{latestRecord.date}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-display font-bold text-white">
                                    {latestRecord.duration}h
                                </p>
                                <span className={cn(
                                    "text-caption px-3 py-1 rounded-full bg-white/20 text-white"
                                )}>
                                    {getQualityLabel(latestRecord.quality)}
                                </span>
                            </div>
                        </div>
                        <div className="grid grid-cols-3 gap-md">
                            <div>
                                <p className="text-body text-white/80 mb-1">Sono Profundo</p>
                                <p className="text-h3 font-bold text-white">{latestRecord.deepSleep}h</p>
                            </div>
                            <div>
                                <p className="text-body text-white/80 mb-1">Sono REM</p>
                                <p className="text-h3 font-bold text-white">{latestRecord.remSleep}h</p>
                            </div>
                            <div>
                                <p className="text-body text-white/80 mb-1">Sono Leve</p>
                                <p className="text-h3 font-bold text-white">{latestRecord.lightSleep}h</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Estatísticas */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-md">
                <Card>
                    <CardContent className="p-lg text-center">
                        <Moon className="text-purple-500 mx-auto mb-2" size={32} />
                        <p className="text-h2 font-bold text-text-primary mb-1">
                            {averageSleep.toFixed(1)}h
                        </p>
                        <p className="text-body text-text-secondary">Média (7d)</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-lg text-center">
                        <Clock className="text-accent-info mx-auto mb-2" size={32} />
                        <p className="text-h2 font-bold text-text-primary mb-1">
                            {averageDeepSleep.toFixed(1)}h
                        </p>
                        <p className="text-body text-text-secondary">Sono Profundo</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-lg text-center">
                        <Sun className="text-primary-gold mx-auto mb-2" size={32} />
                        <p className="text-h2 font-bold text-text-primary mb-1">07:00</p>
                        <p className="text-body text-text-secondary">Hora de Acordar</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-lg text-center">
                        <TrendingUp className="text-accent-success mx-auto mb-2" size={32} />
                        <p className="text-h2 font-bold text-text-primary mb-1">85%</p>
                        <p className="text-body text-text-secondary">Consistência</p>
                    </CardContent>
                </Card>
            </div>

            {/* Meta de Sono */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Moon className="text-purple-500" size={24} />
                        Meta de Sono
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-between mb-md">
                        <span className="text-body text-text-secondary">
                            Média semanal: {averageSleep.toFixed(1)}h / Meta: {sleepGoal}h
                        </span>
                        <span className="text-body font-bold text-text-primary">
                            {Math.round(sleepGoalProgress)}%
                        </span>
                    </div>
                    <Progress value={sleepGoalProgress} />
                </CardContent>
            </Card>

            {/* Histórico de Sono */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                            <Calendar className="text-primary-green" size={24} />
                            Histórico de Sono
                        </CardTitle>
                        <Button size="sm">
                            <Plus className="mr-2" size={16} />
                            Registrar Sono
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="space-y-md">
                        {sleepRecords.map((record) => (
                            <Card key={record.id} className="glass-hover cursor-pointer">
                                <CardContent className="p-lg">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-md flex-1">
                                            <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center">
                                                <Moon className="text-purple-500" size={24} />
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h3 className="text-body-lg font-semibold text-text-primary">
                                                        {record.duration}h de sono
                                                    </h3>
                                                    <span className={cn(
                                                        "text-caption px-3 py-1 rounded-full",
                                                        getQualityBg(record.quality),
                                                        getQualityColor(record.quality)
                                                    )}>
                                                        {getQualityLabel(record.quality)}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-md text-caption text-text-secondary">
                                                    <span>{record.date}</span>
                                                    <span>•</span>
                                                    <span>{record.bedTime} - {record.wakeTime}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex gap-md text-center">
                                            <div>
                                                <p className="text-body font-bold text-accent-info">
                                                    {record.deepSleep}h
                                                </p>
                                                <p className="text-caption text-text-tertiary">Profundo</p>
                                            </div>
                                            <div>
                                                <p className="text-body font-bold text-purple-500">
                                                    {record.remSleep}h
                                                </p>
                                                <p className="text-caption text-text-tertiary">REM</p>
                                            </div>
                                            <div>
                                                <p className="text-body font-bold text-text-secondary">
                                                    {record.lightSleep}h
                                                </p>
                                                <p className="text-caption text-text-tertiary">Leve</p>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Dica para Melhor Sono */}
            <Card className="gradient-purple">
                <CardContent className="p-xl">
                    <div className="flex items-center gap-md">
                        <Moon className="text-white" size={48} />
                        <div>
                            <h3 className="text-h3 font-bold text-white mb-2">
                                💡 Dica para Melhor Sono
                            </h3>
                            <p className="text-body text-white/90">
                                Mantenha um horário consistente para dormir e acordar, mesmo nos fins de semana. Evite telas 1 hora antes de dormir para melhorar a qualidade do sono.
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
