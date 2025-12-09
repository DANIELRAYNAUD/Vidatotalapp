import { useState, useEffect } from 'react'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Calendar, Clock, MapPin, Video } from 'lucide-react'

interface EventoDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onSubmit: (data: any) => Promise<void>
    initialData?: any
    isEditing?: boolean
}

const CATEGORIAS = [
    { value: 'trabalho', label: 'Trabalho', cor: 'bg-blue-500' },
    { value: 'pessoal', label: 'Pessoal', cor: 'bg-purple-500' },
    { value: 'saude', label: 'Saúde', cor: 'bg-pink-500' },
    { value: 'estudo', label: 'Estudo', cor: 'bg-green-500' },
    { value: 'social', label: 'Social', cor: 'bg-orange-500' },
]

export function EventoDialog({ open, onOpenChange, onSubmit, initialData, isEditing }: EventoDialogProps) {
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        titulo: '',
        descricao: '',
        local: '',
        inicio: '',
        fim: '',
        diaInteiro: false,
        categoria: 'pessoal',
        cor: 'bg-purple-500',
        linkReuniao: ''
    })

    useEffect(() => {
        if (initialData) {
            const inicio = initialData.dataHoraInicio ? new Date(initialData.dataHoraInicio) : new Date()
            const fim = initialData.dataHoraFim ? new Date(initialData.dataHoraFim) : new Date()

            setFormData({
                titulo: initialData.titulo || '',
                descricao: initialData.descricao || '',
                local: initialData.local || '',
                inicio: formatarDataTimeLocal(inicio),
                fim: formatarDataTimeLocal(fim),
                diaInteiro: initialData.diaInteiro || false,
                categoria: initialData.categoria || 'pessoal',
                cor: initialData.cor || 'bg-purple-500',
                linkReuniao: initialData.linkReuniao || ''
            })
        } else {
            // Valores padrão para novo evento
            const agora = new Date()
            const daquiUmaHora = new Date(agora.getTime() + 60 * 60 * 1000)

            setFormData({
                titulo: '',
                descricao: '',
                local: '',
                inicio: formatarDataTimeLocal(agora),
                fim: formatarDataTimeLocal(daquiUmaHora),
                diaInteiro: false,
                categoria: 'pessoal',
                cor: 'bg-purple-500',
                linkReuniao: ''
            })
        }
    }, [initialData, open])

    const formatarDataTimeLocal = (date: Date) => {
        const ano = date.getFullYear()
        const mes = String(date.getMonth() + 1).padStart(2, '0')
        const dia = String(date.getDate()).padStart(2, '0')
        const hora = String(date.getHours()).padStart(2, '0')
        const minuto = String(date.getMinutes()).padStart(2, '0')
        return `${ano}-${mes}-${dia}T${hora}:${minuto}`
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!formData.titulo || !formData.inicio || !formData.fim) {
            return
        }

        setLoading(true)
        try {
            await onSubmit(formData)
            onOpenChange(false)
        } catch (error) {
            console.error('Erro ao salvar evento:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleCategoriaChange = (categoria: string) => {
        const categoriaObj = CATEGORIAS.find(c => c.value === categoria)
        setFormData({
            ...formData,
            categoria,
            cor: categoriaObj?.cor || 'bg-purple-500'
        })
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>
                        {isEditing ? 'Editar Evento' : 'Novo Evento'}
                    </DialogTitle>
                    <DialogDescription>
                        Preencha os detalhes do evento abaixo. Clique em salvar quando terminar.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-md">
                    {/* Título */}
                    <div className="space-y-2">
                        <Label htmlFor="titulo">Título *</Label>
                        <Input
                            id="titulo"
                            value={formData.titulo}
                            onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                            placeholder="Ex: Reunião com cliente"
                            required
                        />
                    </div>

                    {/* Categoria */}
                    <div className="space-y-2">
                        <Label htmlFor="categoria">Categoria *</Label>
                        <Select
                            value={formData.categoria}
                            onValueChange={handleCategoriaChange}
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {CATEGORIAS.map((cat) => (
                                    <SelectItem key={cat.value} value={cat.value}>
                                        <div className="flex items-center gap-2">
                                            <div className={`w-3 h-3 rounded-full ${cat.cor}`} />
                                            {cat.label}
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Datas */}
                    <div className="grid grid-cols-2 gap-md">
                        <div className="space-y-2">
                            <Label htmlFor="inicio">Início *</Label>
                            <div className="relative">
                                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" size={16} />
                                <Input
                                    id="inicio"
                                    type="datetime-local"
                                    value={formData.inicio}
                                    onChange={(e) => setFormData({ ...formData, inicio: e.target.value })}
                                    className="pl-10"
                                    required
                                    disabled={formData.diaInteiro}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="fim">Fim *</Label>
                            <div className="relative">
                                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" size={16} />
                                <Input
                                    id="fim"
                                    type="datetime-local"
                                    value={formData.fim}
                                    onChange={(e) => setFormData({ ...formData, fim: e.target.value })}
                                    className="pl-10"
                                    required
                                    disabled={formData.diaInteiro}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Dia inteiro */}
                    <div className="flex items-center justify-between">
                        <Label htmlFor="dia-inteiro">Evento de dia inteiro</Label>
                        <Switch
                            id="dia-inteiro"
                            checked={formData.diaInteiro}
                            onCheckedChange={(checked) => setFormData({ ...formData, diaInteiro: checked })}
                        />
                    </div>

                    {/* Descrição */}
                    <div className="space-y-2">
                        <Label htmlFor="descricao">Descrição</Label>
                        <Textarea
                            id="descricao"
                            value={formData.descricao}
                            onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                            placeholder="Detalhes do evento..."
                            rows={3}
                        />
                    </div>

                    {/* Local */}
                    <div className="space-y-2">
                        <Label htmlFor="local">Local</Label>
                        <div className="relative">
                            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" size={16} />
                            <Input
                                id="local"
                                value={formData.local}
                                onChange={(e) => setFormData({ ...formData, local: e.target.value })}
                                placeholder="Ex: Sala de reuniões"
                                className="pl-10"
                            />
                        </div>
                    </div>

                    {/* Link da reunião */}
                    <div className="space-y-2">
                        <Label htmlFor="link">Link da Reunião</Label>
                        <div className="relative">
                            <Video className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" size={16} />
                            <Input
                                id="link"
                                type="url"
                                value={formData.linkReuniao}
                                onChange={(e) => setFormData({ ...formData, linkReuniao: e.target.value })}
                                placeholder="https://meet.google.com/..."
                                className="pl-10"
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={loading}
                        >
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? 'Salvando...' : isEditing ? 'Salvar Alterações' : 'Criar Evento'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
