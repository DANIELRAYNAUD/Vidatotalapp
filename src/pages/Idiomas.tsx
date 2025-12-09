import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { RotateCw, BookOpen, Brain, TrendingUp, ChevronRight, Volume2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Flashcard {
    id: string
    front: string
    back: string
    language: string
    level: 'beginner' | 'intermediate' | 'advanced'
    learned: boolean
}

interface Language {
    id: string
    name: string
    flag: string
    level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2'
    progress: number
    totalCards: number
    learnedCards: number
}

export function Idiomas() {
    const [languages] = useState<Language[]>([
        { id: '1', name: 'Inglês', flag: '🇺🇸', level: 'B2', progress: 78, totalCards: 450, learnedCards: 351 },
        { id: '2', name: 'Espanhol', flag: '🇪🇸', level: 'A2', progress: 45, totalCards: 300, learnedCards: 135 },
        { id: '3', name: 'Francês', flag: '🇫🇷', level: 'A1', progress: 23, totalCards: 200, learnedCards: 46 },
    ])

    const [flashcards] = useState<Flashcard[]>([
        { id: '1', front: 'Good morning', back: 'Bom dia', language: 'Inglês', level: 'beginner', learned: false },
        { id: '2', front: 'Thank you', back: 'Obrigado', language: 'Inglês', level: 'beginner', learned: false },
        { id: '3', front: 'How are you?', back: 'Como você está?', language: 'Inglês', level: 'beginner', learned: false },
        { id: '4', front: 'See you later', back: 'Até logo', language: 'Inglês', level: 'beginner', learned: false },
        { id: '5', front: 'I understand', back: 'Eu entendo', language: 'Inglês', level: 'intermediate', learned: false },
    ])

    const [currentCardIndex, setCurrentCardIndex] = useState(0)
    const [isFlipped, setIsFlipped] = useState(false)

    const handleFlip = () => setIsFlipped(!isFlipped)

    const handleNext = () => {
        setCurrentCardIndex((prev) => (prev + 1) % flashcards.length)
        setIsFlipped(false)
    }

    const handleKnow = () => {
        // Here you would update the card as known
        handleNext()
    }

    const handleDontKnow = () => {
        // Here you would add this card to review pile
        handleNext()
    }

    const currentCard = flashcards[currentCardIndex]

    return (
        <div className="space-y-xl">
            <div>
                <h1 className="text-h1 font-bold text-text-primary mb-sm">
                    🗣️ Idiomas
                </h1>
                <p className="text-body-lg text-text-secondary">
                    Aprenda novos idiomas com flashcards e exercícios
                </p>
            </div>

            {/* Progresso por Idioma */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-md">
                {languages.map((lang) => (
                    <Card key={lang.id} className="glass-hover cursor-pointer">
                        <CardContent className="p-lg">
                            <div className="flex items-center justify-between mb-md">
                                <div className="flex items-center gap-2">
                                    <span className="text-4xl">{lang.flag}</span>
                                    <div>
                                        <h3 className="text-body-lg font-semibold text-text-primary">
                                            {lang.name}
                                        </h3>
                                        <span className="text-caption text-text-secondary">
                                            Nível {lang.level}
                                        </span>
                                    </div>
                                </div>
                                <ChevronRight className="text-text-tertiary" size={20} />
                            </div>
                            <Progress value={lang.progress} className="mb-2" />
                            <div className="flex items-center justify-between text-caption text-text-secondary">
                                <span>{lang.learnedCards}/{lang.totalCards} cards</span>
                                <span>{lang.progress}%</span>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Flashcard Interativo */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-lg">
                <div className="lg:col-span-2">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <BookOpen className="text-accent-info" size={24} />
                                    Flashcards - {currentCard?.language}
                                </div>
                                <div className="flex items-center gap-2 text-body text-text-secondary">
                                    <span>{currentCardIndex + 1}/{flashcards.length}</span>
                                </div>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {/* Flashcard */}
                            <div
                                className="relative h-80 mb-lg cursor-pointer group"
                                onClick={handleFlip}
                                style={{ perspective: '1000px' }}
                            >
                                <div
                                    className={cn(
                                        "absolute inset-0 transition-transform duration-500 transform-style-3d",
                                        isFlipped && "rotate-y-180"
                                    )}
                                    style={{ transformStyle: 'preserve-3d' }}
                                >
                                    {/* Frente do Card */}
                                    <div
                                        className="absolute inset-0 glass-card rounded-card p-2xl flex flex-col items-center justify-center backface-hidden"
                                        style={{ backfaceVisibility: 'hidden' }}
                                    >
                                        <Volume2 className="text-accent-info mb-lg" size={40} />
                                        <p className="text-h1 font-bold text-text-primary text-center mb-md">
                                            {currentCard?.front}
                                        </p>
                                        <p className="text-body text-text-secondary">
                                            Clique para revelar
                                        </p>
                                        <div className="absolute bottom-8 left-8">
                                            <span className={cn(
                                                "text-caption px-3 py-1 rounded-full",
                                                currentCard?.level === 'beginner' && "bg-accent-success/20 text-accent-success",
                                                currentCard?.level === 'intermediate' && "bg-accent-warning/20 text-accent-warning",
                                                currentCard?.level === 'advanced' && "bg-accent-error/20 text-accent-error"
                                            )}>
                                                {currentCard?.level}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Verso do Card */}
                                    <div
                                        className="absolute inset-0 glass-card rounded-card p-2xl flex flex-col items-center justify-center backface-hidden rotate-y-180"
                                        style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                                    >
                                        <Brain className="text-primary-green mb-lg" size={40} />
                                        <p className="text-h1 font-bold text-text-primary text-center">
                                            {currentCard?.back}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Botões de Ação */}
                            <div className="grid grid-cols-3 gap-md">
                                <Button
                                    variant="outline"
                                    size="lg"
                                    onClick={handleDontKnow}
                                    className="w-full"
                                >
                                    ❌ Não Sei
                                </Button>
                                <Button
                                    variant="secondary"
                                    size="lg"
                                    onClick={handleFlip}
                                    className="w-full flex items-center justify-center gap-2"
                                >
                                    <RotateCw size={20} />
                                    Virar
                                </Button>
                                <Button
                                    size="lg"
                                    onClick={handleKnow}
                                    className="w-full bg-accent-success hover:bg-accent-success/90"
                                >
                                    ✅ Sei
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Estatísticas */}
                <div className="space-y-md">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-body-lg">
                                <TrendingUp className="text-accent-success" size={20} />
                                Estatísticas de Hoje
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-md">
                            <div className="flex items-center justify-between">
                                <span className="text-body text-text-secondary">Cards Estudados</span>
                                <span className="text-h3 font-bold text-text-primary">24</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-body text-text-secondary">Aprendidos</span>
                                <span className="text-h3 font-bold text-accent-success">18</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-body text-text-secondary">Taxa de Acerto</span>
                                <span className="text-h3 font-bold text-accent-info">75%</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-body text-text-secondary">Sequência</span>
                                <span className="text-h3 font-bold text-primary-orange">🔥 12 dias</span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="gradient-blue">
                        <CardContent className="p-lg">
                            <h3 className="text-body-lg font-semibold text-white mb-2">
                                💡 Dica do Dia
                            </h3>
                            <p className="text-body text-white/80">
                                Pratique pelo menos 20 minutos por dia para manter a consistência e melhorar sua retenção!
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
