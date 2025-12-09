import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Heart, Activity, Scale, Pill, Calendar, Plus, TrendingUp } from 'lucide-react'
import { Progress } from '@/components/ui/progress'

interface HealthMetric {
    id: string
    name: string
    value: number
    unit: string
    icon: any
    status: 'good' | 'warning' | 'alert'
    lastUpdated: string
}

interface Medication {
    id: string
    name: string
    dosage: string
    frequency: string
    timeOfDay: string[]
    taken: boolean
}

interface Appointment {
    id: string
    type: string
    doctor: string
    date: string
    time: string
}

export function Saude() {
    const [metrics] = useState<HealthMetric[]>([
        {
            id: '1',
            name: 'Frequência Cardíaca',
            value: 68,
            unit: 'bpm',
            icon: Heart,
            status: 'good',
            lastUpdated: 'Hoje, 08:30'
        },
        {
            id: '2',
            name: 'Pressão Arterial',
            value: 120,
            unit: '/80 mmHg',
            icon: Activity,
            status: 'good',
            lastUpdated: 'Ontem'
        },
        {
            id: '3',
            name: 'Peso',
            value: 78.5,
            unit: 'kg',
            icon: Scale,
            status: 'good',
            lastUpdated: 'Hoje, 07:00'
        }
    ])

    const [medications] = useState<Medication[]>([
        {
            id: '1',
            name: 'Vitamina D',
            dosage: '2000 UI',
            frequency: 'Diário',
            timeOfDay: ['08:00'],
            taken: true
        },
        {
            id: '2',
            name: 'Ômega 3',
            dosage: '1000mg',
            frequency: 'Diário',
            timeOfDay: ['08:00', '20:00'],
            taken: false
        },
        {
            id: '3',
            name: 'Multivitamínico',
            dosage: '1 cápsula',
            frequency: 'Diário',
            timeOfDay: ['08:00'],
            taken: true
        }
    ])

    const [appointments] = useState<Appointment[]>([
        {
            id: '1',
            type: 'Consulta Geral',
            doctor: 'Dr. Silva',
            date: '2024-12-05',
            time: '14:30'
        },
        {
            id: '2',
            type: 'Dentista',
            doctor: 'Dra. Santos',
            date: '2024-12-10',
            time: '10:00'
        }
    ])

    const getStatusColor = (status: string) => {
        const colors = {
            good: 'text-accent-success',
            warning: 'text-accent-warning',
            alert: 'text-accent-error'
        }
        return colors[status as keyof typeof colors]
    }

    const medicationProgress = (medications.filter(m => m.taken).length / medications.length) * 100

    return (
        <div className="space-y-xl">
            <div>
                <h1 className="text-h1 font-bold text-text-primary mb-sm">
                    ❤️ Saúde
                </h1>
                <p className="text-body-lg text-text-secondary">
                    Acompanhe suas métricas de saúde e medicamentos
                </p>
            </div>

            {/* Métricas de Saúde */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-md">
                {metrics.map((metric) => {
                    const IconComponent = metric.icon
                    return (
                        <Card key={metric.id} className="glass-hover cursor-pointer">
                            <CardContent className="p-lg">
                                <div className="flex items-start justify-between mb-md">
                                    <IconComponent
                                        className={getStatusColor(metric.status)}
                                        size={32}
                                    />
                                    <span className={`text-caption px-3 py-1 rounded-full ${metric.status === 'good' ? 'bg-accent-success/20 text-accent-success' :
                                            metric.status === 'warning' ? 'bg-accent-warning/20 text-accent-warning' :
                                                'bg-accent-error/20 text-accent-error'
                                        }`}>
                                        {metric.status === 'good' ? 'Normal' : metric.status === 'warning' ? 'Atenção' : 'Alerta'}
                                    </span>
                                </div>
                                <h3 className="text-h2 font-bold text-text-primary mb-1">
                                    {metric.value}{metric.unit}
                                </h3>
                                <p className="text-body text-text-secondary mb-1">
                                    {metric.name}
                                </p>
                                <p className="text-caption text-text-tertiary">
                                    {metric.lastUpdated}
                                </p>
                            </CardContent>
                        </Card>
                    )
                })}
            </div>

            {/* Medicamentos */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                            <Pill className="text-accent-info" size={24} />
                            Medicamentos de Hoje
                        </CardTitle>
                        <Button size="sm">
                            <Plus className="mr-2" size={16} />
                            Adicionar Medicamento
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="mb-lg">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-body text-text-secondary">Progresso Diário</span>
                            <span className="text-body font-bold text-text-primary">
                                {medications.filter(m => m.taken).length}/{medications.length}
                            </span>
                        </div>
                        <Progress value={medicationProgress} />
                    </div>

                    <div className="space-y-md">
                        {medications.map((med) => (
                            <Card key={med.id} className="glass-hover cursor-pointer">
                                <CardContent className="p-lg">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-md flex-1">
                                            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${med.taken ? 'bg-accent-success/20' : 'bg-white/10'
                                                }`}>
                                                <Pill className={med.taken ? 'text-accent-success' : 'text-text-tertiary'} size={24} />
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="text-body-lg font-semibold text-text-primary mb-1">
                                                    {med.name}
                                                </h3>
                                                <div className="flex items-center gap-md text-caption text-text-secondary">
                                                    <span>{med.dosage}</span>
                                                    <span>•</span>
                                                    <span>{med.frequency}</span>
                                                    <span>•</span>
                                                    <span>{med.timeOfDay.join(', ')}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <Button
                                            variant={med.taken ? "outline" : "default"}
                                            size="sm"
                                        >
                                            {med.taken ? 'Tomado ✓' : 'Marcar'}
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Próximas Consultas */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-lg">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Calendar className="text-primary-blue" size={24} />
                            Próximas Consultas
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-md">
                            {appointments.map((apt) => (
                                <div
                                    key={apt.id}
                                    className="flex items-center gap-md p-md rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
                                >
                                    <div className="w-12 h-12 rounded-full bg-primary-blue/20 flex items-center justify-center">
                                        <Calendar className="text-primary-blue" size={24} />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-body font-semibold text-text-primary mb-1">
                                            {apt.type}
                                        </h3>
                                        <p className="text-caption text-text-secondary">
                                            {apt.doctor} • {apt.date} às {apt.time}
                                        </p>
                                    </div>
                                    <Button variant="outline" size="sm">
                                        Detalhes
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Estatísticas */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <TrendingUp className="text-accent-success" size={24} />
                            Estatísticas do Mês
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-lg">
                            <div className="text-center">
                                <p className="text-h2 font-bold text-primary-green mb-1">96%</p>
                                <p className="text-body text-text-secondary">Adesão a Medicamentos</p>
                            </div>
                            <div className="text-center">
                                <p className="text-h2 font-bold text-accent-info mb-1">3</p>
                                <p className="text-body text-text-secondary">Consultas Realizadas</p>
                            </div>
                            <div className="text-center">
                                <p className="text-h2 font-bold text-primary-orange mb-1">28</p>
                                <p className="text-body text-text-secondary">Dias de Registro</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Dica de Saúde */}
            <Card className="gradient-purple">
                <CardContent className="p-xl">
                    <div className="flex items-center gap-md">
                        <Heart className="text-white" size={48} />
                        <div>
                            <h3 className="text-h3 font-bold text-white mb-2">
                                💡 Dica de Saúde
                            </h3>
                            <p className="text-body text-white/90">
                                Mantenha-se hidratado! Beba pelo menos 2 litros de água por dia para manter seu corpo funcionando perfeitamente.
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
