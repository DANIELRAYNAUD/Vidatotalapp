import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { BookOpen, Clock, Target, Plus, TrendingUp, Star, Calendar } from 'lucide-react'


interface Book {
    id: string
    title: string
    author: string
    cover: string
    pages: number
    currentPage: number
    status: 'reading' | 'completed' | 'want_to_read'
    rating?: number
    startedAt?: string
    completedAt?: string
}

interface ReadingSession {
    id: string
    bookTitle: string
    duration: number
    pages: number
    date: string
}

export function Leitura() {
    const [books] = useState<Book[]>([
        {
            id: '1',
            title: 'Atomic Habits',
            author: 'James Clear',
            cover: '📘',
            pages: 320,
            currentPage: 210,
            status: 'reading',
            rating: 5,
            startedAt: '15 Nov'
        },
        {
            id: '2',
            title: 'Deep Work',
            author: 'Cal Newport',
            cover: '📗',
            pages: 296,
            currentPage: 89,
            status: 'reading',
            startedAt: '20 Nov'
        },
        {
            id: '3',
            title: 'The Lean Startup',
            author: 'Eric Ries',
            cover: '📙',
            pages: 336,
            currentPage: 0,
            status: 'want_to_read'
        },
        {
            id: '4',
            title: 'Sapiens',
            author: 'Yuval Noah Harari',
            cover: '📕',
            pages: 464,
            currentPage: 464,
            status: 'completed',
            rating: 5,
            startedAt: '01 Out',
            completedAt: '10 Nov'
        }
    ])

    const [sessions] = useState<ReadingSession[]>([
        { id: '1', bookTitle: 'Atomic Habits', duration: 45, pages: 28, date: 'Hoje' },
        { id: '2', bookTitle: 'Deep Work', duration: 30, pages: 15, date: 'Ontem' },
        { id: '3', bookTitle: 'Atomic Habits', duration: 60, pages: 35, date: '2 dias atrás' }
    ])

    const booksReading = books.filter(b => b.status === 'reading')
    const booksCompleted = books.filter(b => b.status === 'completed')
    const totalPagesRead = sessions.reduce((sum, s) => sum + s.pages, 0)
    const totalMinutes = sessions.reduce((sum, s) => sum + s.duration, 0)

    const yearlyGoal = 24
    const booksCompletedThisYear = 15
    const goalProgress = (booksCompletedThisYear / yearlyGoal) * 100

    return (
        <div className="space-y-xl">
            <div>
                <h1 className="text-h1 font-bold text-text-primary mb-sm">
                    📚 Leitura
                </h1>
                <p className="text-body-lg text-text-secondary">
                    Gerencie sua biblioteca e sessões de leitura
                </p>
            </div>

            {/* Meta Anual */}
            <Card className="gradient-green-gold">
                <CardContent className="p-xl">
                    <div className="flex items-center justify-between mb-md">
                        <div>
                            <h3 className="text-h3 font-bold text-white mb-2">
                                Meta de Leitura 2024
                            </h3>
                            <p className="text-body text-white/90">
                                {booksCompletedThisYear} de {yearlyGoal} livros completados
                            </p>
                        </div>
                        <div className="text-right">
                            <p className="text-display font-bold text-white">
                                {Math.round(goalProgress)}%
                            </p>
                        </div>
                    </div>
                    <Progress value={goalProgress} className="bg-white/20" />
                </CardContent>
            </Card>

            {/* Estatísticas */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-md">
                <Card>
                    <CardContent className="p-lg text-center">
                        <BookOpen className="text-accent-info mx-auto mb-2" size={32} />
                        <p className="text-h2 font-bold text-text-primary mb-1">{booksReading.length}</p>
                        <p className="text-body text-text-secondary">Lendo Agora</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-lg text-center">
                        <Star className="text-primary-gold mx-auto mb-2" size={32} />
                        <p className="text-h2 font-bold text-text-primary mb-1">{booksCompletedThisYear}</p>
                        <p className="text-body text-text-secondary">Completados</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-lg text-center">
                        <Target className="text-primary-orange mx-auto mb-2" size={32} />
                        <p className="text-h2 font-bold text-text-primary mb-1">{totalPagesRead}</p>
                        <p className="text-body text-text-secondary">Páginas (7d)</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-lg text-center">
                        <Clock className="text-primary-green mx-auto mb-2" size={32} />
                        <p className="text-h2 font-bold text-text-primary mb-1">{Math.floor(totalMinutes / 60)}h {totalMinutes % 60}m</p>
                        <p className="text-body text-text-secondary">Tempo (7d)</p>
                    </CardContent>
                </Card>
            </div>

            {/* Livros em Leitura */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                            <BookOpen className="text-accent-info" size={24} />
                            Lendo Agora
                        </CardTitle>
                        <Button size="sm">
                            <Plus className="mr-2" size={16} />
                            Adicionar Livro
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
                        {booksReading.map((book) => {
                            const progress = (book.currentPage / book.pages) * 100
                            return (
                                <Card key={book.id} className="glass-hover cursor-pointer">
                                    <CardContent className="p-lg">
                                        <div className="flex gap-md mb-md">
                                            <div className="text-6xl">{book.cover}</div>
                                            <div className="flex-1">
                                                <h3 className="text-body-lg font-semibold text-text-primary mb-1">
                                                    {book.title}
                                                </h3>
                                                <p className="text-body text-text-secondary mb-2">
                                                    {book.author}
                                                </p>
                                                <div className="flex items-center gap-2 text-caption text-text-tertiary">
                                                    <Calendar size={12} />
                                                    <span>Iniciado em {book.startedAt}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Progress value={progress} />
                                            <div className="flex items-center justify-between text-caption text-text-secondary">
                                                <span>Página {book.currentPage} de {book.pages}</span>
                                                <span>{Math.round(progress)}%</span>
                                            </div>
                                        </div>
                                        <Button className="w-full mt-md" variant="outline">
                                            Continuar Lendo
                                        </Button>
                                    </CardContent>
                                </Card>
                            )
                        })}
                    </div>
                </CardContent>
            </Card>

            {/* Sessões Recentes */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-lg">
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <TrendingUp className="text-accent-success" size={24} />
                            Sessões Recentes
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-md">
                            {sessions.map((session) => (
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
                                                {session.bookTitle}
                                            </p>
                                            <p className="text-caption text-text-secondary">
                                                {session.date}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-body font-semibold text-text-primary">
                                            {session.pages} páginas
                                        </p>
                                        <p className="text-caption text-text-secondary">
                                            {session.duration} min
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Completados Recentes */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-body-lg">
                            <Star className="text-primary-gold" size={20} />
                            Completados Recentemente
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-md">
                            {booksCompleted.map((book) => (
                                <div key={book.id} className="p-md rounded-lg hover:bg-white/5 transition-colors cursor-pointer">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="text-2xl">{book.cover}</span>
                                        <div className="flex-1">
                                            <p className="text-body font-medium text-text-primary">
                                                {book.title}
                                            </p>
                                            <p className="text-caption text-text-secondary">
                                                {book.author}
                                            </p>
                                        </div>
                                    </div>
                                    {book.rating && (
                                        <div className="flex items-center gap-1">
                                            {[...Array(book.rating)].map((_, i) => (
                                                <Star key={i} className="text-primary-gold fill-primary-gold" size={14} />
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
