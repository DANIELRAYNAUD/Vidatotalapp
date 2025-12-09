import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Apple, Plus, TrendingUp, Flame, Droplet, Activity } from 'lucide-react'
import { alimentacaoAPI } from '@/lib/api'

interface Meal {
    id: string
    type: 'breakfast' | 'lunch' | 'dinner' | 'snack'
    name: string
    time: string
    calories: number
    protein: number
    carbs: number
    fats: number
}

interface MacroTarget {
    calories: number
    protein: number
    carbs: number
    fats: number
}

export function Alimentacao() {
    const [meals, setMeals] = useState<Meal[]>([])
    const [loading, setLoading] = useState(true)

    const macroTargets: MacroTarget = {
        calories: 2000,
        protein: 150,
        carbs: 250,
        fats: 70
    }

    const carregarRefeicoes = async () => {
        try {
            setLoading(true)
            const response = await alimentacaoAPI.listarRefeicoes()
            setMeals(response.data as any)
        } catch (error) {
            console.error('Erro ao carregar refeições:', error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        carregarRefeicoes()
    }, [])

    if (loading) {
        return <div className="p-8 text-center text-text-secondary">Carregando alimentação...</div>
    }

    const currentMacros = {
        calories: meals.reduce((sum, m) => sum + m.calories, 0),
        protein: meals.reduce((sum, m) => sum + m.protein, 0),
        carbs: meals.reduce((sum, m) => sum + m.carbs, 0),
        fats: meals.reduce((sum, m) => sum + m.fats, 0)
    }

    const getMealIcon = (type: string) => {
        const icons = {
            breakfast: '🌅',
            lunch: '🌮',
            dinner: '🍽️',
            snack: '🍎'
        }
        return icons[type as keyof typeof icons] || '🍴'
    }

    const getMealName = (type: string) => {
        const names = {
            breakfast: 'Café da Manhã',
            lunch: 'Almoço',
            dinner: 'Jantar',
            snack: 'Lanche'
        }
        return names[type as keyof typeof names] || 'Refeição'
    }

    return (
        <div className="space-y-xl">
            <div>
                <h1 className="text-h1 font-bold text-text-primary mb-sm">
                    🍽️ Alimentação
                </h1>
                <p className="text-body-lg text-text-secondary">
                    Diário de refeições e controle de macros
                </p>
            </div>

            {/* Resumo de Macros */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-md">
                <Card className="gradient-orange">
                    <CardContent className="p-lg">
                        <Flame className="text-white mb-2" size={32} />
                        <p className="text-h3 font-bold text-white mb-1">
                            {currentMacros.calories}/{macroTargets.calories}
                        </p>
                        <p className="text-body text-white/90 mb-2">Calorias</p>
                        <Progress
                            value={(currentMacros.calories / macroTargets.calories) * 100}
                            className="bg-white/20"
                        />
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-lg">
                        <Activity className="text-accent-error mb-2" size={32} />
                        <p className="text-h3 font-bold text-text-primary mb-1">
                            {currentMacros.protein}g/{macroTargets.protein}g
                        </p>
                        <p className="text-body text-text-secondary mb-2">Proteínas</p>
                        <Progress value={(currentMacros.protein / macroTargets.protein) * 100} />
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-lg">
                        <Apple className="text-primary-gold mb-2" size={32} />
                        <p className="text-h3 font-bold text-text-primary mb-1">
                            {currentMacros.carbs}g/{macroTargets.carbs}g
                        </p>
                        <p className="text-body text-text-secondary mb-2">Carboidratos</p>
                        <Progress value={(currentMacros.carbs / macroTargets.carbs) * 100} />
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-lg">
                        <Droplet className="text-accent-info mb-2" size={32} />
                        <p className="text-h3 font-bold text-text-primary mb-1">
                            {currentMacros.fats}g/{macroTargets.fats}g
                        </p>
                        <p className="text-body text-text-secondary mb-2">Gorduras</p>
                        <Progress value={(currentMacros.fats / macroTargets.fats) * 100} />
                    </CardContent>
                </Card>
            </div>

            {/* Refeições do Dia */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                            <Apple className="text-primary-green" size={24} />
                            Refeições de Hoje
                        </CardTitle>
                        <Button size="sm">
                            <Plus className="mr-2" size={16} />
                            Adicionar Refeição
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="space-y-md">
                        {meals.map((meal) => (
                            <Card key={meal.id} className="glass-hover cursor-pointer">
                                <CardContent className="p-lg">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-md flex-1">
                                            <div className="text-4xl">
                                                {getMealIcon(meal.type)}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h3 className="text-body-lg font-semibold text-text-primary">
                                                        {meal.name}
                                                    </h3>
                                                </div>
                                                <div className="flex items-center gap-md text-caption text-text-secondary">
                                                    <span>{getMealName(meal.type)}</span>
                                                    <span>•</span>
                                                    <span>{meal.time}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-4 gap-md text-center">
                                            <div>
                                                <p className="text-body font-bold text-primary-orange">
                                                    {meal.calories}
                                                </p>
                                                <p className="text-caption text-text-tertiary">cal</p>
                                            </div>
                                            <div>
                                                <p className="text-body font-bold text-accent-error">
                                                    {meal.protein}g
                                                </p>
                                                <p className="text-caption text-text-tertiary">prot</p>
                                            </div>
                                            <div>
                                                <p className="text-body font-bold text-primary-gold">
                                                    {meal.carbs}g
                                                </p>
                                                <p className="text-caption text-text-tertiary">carb</p>
                                            </div>
                                            <div>
                                                <p className="text-body font-bold text-accent-info">
                                                    {meal.fats}g
                                                </p>
                                                <p className="text-caption text-text-tertiary">gord</p>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Estatísticas Semanais */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="text-accent-success" size={24} />
                        Estatísticas da Semana
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-lg">
                        <div className="text-center">
                            <p className="text-h2 font-bold text-primary-green mb-1">95%</p>
                            <p className="text-body text-text-secondary">Meta de Calorias</p>
                        </div>
                        <div className="text-center">
                            <p className="text-h2 font-bold text-accent-info mb-1">2.1L</p>
                            <p className="text-body text-text-secondary">Média de Água/dia</p>
                        </div>
                        <div className="text-center">
                            <p className="text-h2 font-bold text-primary-gold mb-1">6/7</p>
                            <p className="text-body text-text-secondary">Dias Registrados</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Dica Nutricional */}
            <Card className="gradient-green-gold">
                <CardContent className="p-xl">
                    <div className="flex items-center gap-md">
                        <Apple className="text-white" size={48} />
                        <div>
                            <h3 className="text-h3 font-bold text-white mb-2">
                                💡 Dica Nutricional
                            </h3>
                            <p className="text-body text-white/90">
                                Distribua sua ingestão de proteínas ao longo do dia para melhor absorção e síntese muscular.
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
