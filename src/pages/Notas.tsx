import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, FolderOpen, Tag, Search, Edit3, Trash2, Pin } from 'lucide-react'
import { cn } from '@/lib/utils'
import { notasAPI } from '@/lib/api'

interface Note {
    id: string
    title: string
    content: string
    folder: string
    tags: string[]
    pinned: boolean
    createdAt: string
    updatedAt: string
}

interface Folder {
    id: string
    name: string
    icon: string
    count: number
    color: string
}

export function Notas() {
    const [notes, setNotes] = useState<Note[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedFolder, setSelectedFolder] = useState<string>('all')

    const carregarDados = async () => {
        try {
            setLoading(true)
            const notasRes = await notasAPI.listar()
            setNotes(notasRes.data as any)
        } catch (error) {
            console.error('Erro ao carregar notas:', error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        carregarDados()
    }, [])

    const filteredNotes = selectedFolder === 'all'
        ? notes
        : notes.filter(n => n.folder === selectedFolder)

    const pinnedNotes = filteredNotes.filter(n => n.pinned)
    const regularNotes = filteredNotes.filter(n => !n.pinned)

    // Mock folders based on notes for now since API doesn't return them
    const folders: Folder[] = [
        { id: '1', name: 'Trabalho', icon: '💼', count: notes.filter(n => n.folder === 'Trabalho').length, color: 'blue' },
        { id: '2', name: 'Pessoal', icon: '👤', count: notes.filter(n => n.folder === 'Pessoal').length, color: 'green' },
        { id: '3', name: 'Ideias', icon: '💡', count: notes.filter(n => n.folder === 'Ideias').length, color: 'yellow' },
    ]

    if (loading) {
        return <div className="p-8 text-center text-text-secondary">Carregando notas...</div>
    }

    return (
        <div className="space-y-xl">
            <div>
                <h1 className="text-h1 font-bold text-text-primary mb-sm">
                    📝 Notas
                </h1>
                <p className="text-body-lg text-text-secondary">
                    Organize suas ideias e conhecimento
                </p>
            </div>

            {/* Barra de Ação */}
            <div className="flex flex-col md:flex-row gap-md items-start md:items-center justify-between">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" size={20} />
                    <input
                        type="text"
                        placeholder="Buscar notas..."
                        className="w-full glass-card rounded-lg pl-10 pr-4 py-3 text-body text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary-green"
                    />
                </div>
                <Button size="lg">
                    <Plus className="mr-2" size={20} />
                    Nova Nota
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-lg">
                {/* Sidebar - Pastas */}
                <div className="lg:col-span-1">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-body-lg">
                                <FolderOpen className="text-primary-gold" size={20} />
                                Pastas
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <button
                                onClick={() => setSelectedFolder('all')}
                                className={cn(
                                    "w-full flex items-center justify-between p-md rounded-lg transition-colors",
                                    selectedFolder === 'all'
                                        ? "bg-primary-green/20 text-primary-green"
                                        : "hover:bg-white/5 text-text-secondary"
                                )}
                            >
                                <span className="flex items-center gap-2">
                                    📁 Todas
                                </span>
                                <span className="text-caption">{notes.length}</span>
                            </button>
                            {folders.map((folder) => (
                                <button
                                    key={folder.id}
                                    onClick={() => setSelectedFolder(folder.name)}
                                    className={cn(
                                        "w-full flex items-center justify-between p-md rounded-lg transition-colors",
                                        selectedFolder === folder.name
                                            ? "bg-primary-green/20 text-primary-green"
                                            : "hover:bg-white/5 text-text-secondary"
                                    )}
                                >
                                    <span className="flex items-center gap-2">
                                        <span>{folder.icon}</span>
                                        <span>{folder.name}</span>
                                    </span>
                                    <span className="text-caption">{folder.count}</span>
                                </button>
                            ))}
                        </CardContent>
                    </Card>

                    {/* Tags Populares */}
                    <Card className="mt-md">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-body-lg">
                                <Tag className="text-accent-info" size={20} />
                                Tags
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-wrap gap-2">
                                {['marketing', 'desenvolvimento', 'design', 'app', 'estratégia', 'ui/ux'].map((tag) => (
                                    <span
                                        key={tag}
                                        className="px-3 py-1 text-caption rounded-full bg-white/10 hover:bg-white/20 text-text-secondary cursor-pointer transition-colors"
                                    >
                                        #{tag}
                                    </span>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Lista de Notas */}
                <div className="lg:col-span-3 space-y-lg">
                    {/* Notas Fixadas */}
                    {pinnedNotes.length > 0 && (
                        <div>
                            <h2 className="text-body-lg font-semibold text-text-primary mb-md flex items-center gap-2">
                                <Pin className="text-primary-gold" size={20} />
                                Fixadas
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
                                {pinnedNotes.map((note) => (
                                    <Card key={note.id} className="glass-hover cursor-pointer group">
                                        <CardContent className="p-lg">
                                            <div className="flex items-start justify-between mb-md">
                                                <h3 className="text-body-lg font-semibold text-text-primary flex-1">
                                                    {note.title}
                                                </h3>
                                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button className="p-1 hover:bg-white/10 rounded">
                                                        <Edit3 size={16} className="text-text-tertiary" />
                                                    </button>
                                                    <button className="p-1 hover:bg-white/10 rounded">
                                                        <Trash2 size={16} className="text-accent-error" />
                                                    </button>
                                                </div>
                                            </div>
                                            <p className="text-body text-text-secondary mb-md line-clamp-2">
                                                {note.content}
                                            </p>
                                            <div className="flex flex-wrap gap-1 mb-md">
                                                {note.tags.map((tag) => (
                                                    <span
                                                        key={tag}
                                                        className="px-2 py-0.5 text-caption rounded-full bg-white/10 text-text-tertiary"
                                                    >
                                                        #{tag}
                                                    </span>
                                                ))}
                                            </div>
                                            <div className="flex items-center justify-between text-caption text-text-tertiary">
                                                <span>{note.folder}</span>
                                                <span>{note.updatedAt}</span>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Todas as Notas */}
                    <div>
                        <h2 className="text-body-lg font-semibold text-text-primary mb-md">
                            Todas as Notas
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
                            {regularNotes.map((note) => (
                                <Card key={note.id} className="glass-hover cursor-pointer group">
                                    <CardContent className="p-lg">
                                        <div className="flex items-start justify-between mb-md">
                                            <h3 className="text-body-lg font-semibold text-text-primary flex-1">
                                                {note.title}
                                            </h3>
                                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button className="p-1 hover:bg-white/10 rounded">
                                                    <Edit3 size={16} className="text-text-tertiary" />
                                                </button>
                                                <button className="p-1 hover:bg-white/10 rounded">
                                                    <Trash2 size={16} className="text-accent-error" />
                                                </button>
                                            </div>
                                        </div>
                                        <p className="text-body text-text-secondary mb-md line-clamp-2">
                                            {note.content}
                                        </p>
                                        <div className="flex flex-wrap gap-1 mb-md">
                                            {note.tags.map((tag) => (
                                                <span
                                                    key={tag}
                                                    className="px-2 py-0.5 text-caption rounded-full bg-white/10 text-text-tertiary"
                                                >
                                                    #{tag}
                                                </span>
                                            ))}
                                        </div>
                                        <div className="flex items-center justify-between text-caption text-text-tertiary">
                                            <span>{note.folder}</span>
                                            <span>{note.updatedAt}</span>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
