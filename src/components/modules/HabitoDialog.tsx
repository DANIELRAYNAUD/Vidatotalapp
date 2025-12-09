import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Plus, X, Clock } from 'lucide-react'

const habitoSchema = z.object({
    nome: z.string().min(1, 'Nome é obrigatório').max(100, 'Nome muito longo'),
    descricao: z.string().optional(),
    icone: z.string().min(1, 'Ícone é obrigatório'),
    cor: z.string().min(1, 'Cor é obrigatória'),
    categoria: z.string().min(1, 'Categoria é obrigatória'),
    frequencia: z.enum(['diaria', 'semanal', 'personalizada']),
    diasSemana: z.array(z.number()).optional(),
    valorMeta: z.number().min(1).default(1),
    lembrete: z.boolean().default(false),
    horarioLembrete: z.string().optional(),
})

type HabitoFormData = z.infer<typeof habitoSchema>

interface HabitoDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onSubmit: (data: HabitoFormData) => void | Promise<void>
    initialData?: Partial<HabitoFormData>
    isEditing?: boolean
}

const icones = ['💪', '🏃', '📚', '💧', '🍎', '🧘', '🎯', '✍️', '🛌', '🎨', '🎵', '🏋️']
const cores = [
    { nome: 'Verde', valor: '#2d7a5f' },
    { nome: 'Azul', valor: '#2e5c8a' },
    { nome: 'Roxo', valor: '#6b46c1' },
    { nome: 'Laranja', valor: '#d97706' },
    { nome: 'Rosa', valor: '#db2777' },
    { nome: 'Dourado', valor: '#8b7355' },
]
const categorias = ['Saúde', 'Fitness', 'Produtividade', 'Aprendizado', 'Bem-estar', 'Social']

export function HabitoDialog({
    open,
    onOpenChange,
    onSubmit,
    initialData,
    isEditing = false
}: HabitoDialogProps) {
    const [horarios, setHorarios] = useState<string[]>([])
    const [novoHorario, setNovoHorario] = useState('')

    const {
        register,
        handleSubmit,
        watch,
        setValue,
        formState: { errors, isSubmitting },
        reset,
    } = useForm<HabitoFormData>({
        resolver: zodResolver(habitoSchema),
        defaultValues: {
            nome: initialData?.nome || '',
            descricao: initialData?.descricao || '',
            icone: initialData?.icone || '💪',
            cor: initialData?.cor || '#2d7a5f',
            categoria: initialData?.categoria || 'Saúde',
            frequencia: initialData?.frequencia || 'diaria',
            valorMeta: initialData?.valorMeta || 1,
            lembrete: initialData?.lembrete || false,
            horarioLembrete: initialData?.horarioLembrete || '',
        },
    })

    const lembreteAtivo = watch('lembrete')
    const iconeAtual = watch('icone')
    const corAtual = watch('cor')

    useEffect(() => {
        if (open) {
            if (initialData?.horarioLembrete) {
                try {
                    if (initialData.horarioLembrete.startsWith('[')) {
                        setHorarios(JSON.parse(initialData.horarioLembrete))
                    } else {
                        setHorarios([initialData.horarioLembrete])
                    }
                } catch (e) {
                    setHorarios([initialData.horarioLembrete])
                }
            } else {
                setHorarios([])
            }
        }
    }, [open, initialData])

    const adicionarHorario = () => {
        if (novoHorario && !horarios.includes(novoHorario)) {
            const novosHorarios = [...horarios, novoHorario].sort()
            setHorarios(novosHorarios)
            setValue('horarioLembrete', JSON.stringify(novosHorarios))
            setNovoHorario('')
        }
    }

    const removerHorario = (horario: string) => {
        const novosHorarios = horarios.filter(h => h !== horario)
        setHorarios(novosHorarios)
        setValue('horarioLembrete', JSON.stringify(novosHorarios))
    }

    const handleFormSubmit = async (data: HabitoFormData) => {
        // Garantir que os horários estão sincronizados
        if (data.lembrete) {
            data.horarioLembrete = JSON.stringify(horarios)
        }
        await onSubmit(data)
        reset()
        onOpenChange(false)
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>
                        {isEditing ? 'Editar Hábito' : 'Novo Hábito'}
                    </DialogTitle>
                    <DialogDescription>
                        {isEditing
                            ? 'Atualize as informações do seu hábito'
                            : 'Adicione um novo hábito para acompanhar'}
                    </DialogDescription>
                </DialogHeader>

                {/* Templates Section */}
                {!isEditing && (
                    <div className="mb-6">
                        <Label className="text-xs text-text-tertiary uppercase tracking-wider mb-3 block">
                            Modelos Rápidos
                        </Label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                            {[
                                { nome: 'Beber Água', icone: '💧', cor: '#2e5c8a', cat: 'Saúde' },
                                { nome: 'Ler Livro', icone: '📚', cor: '#6b46c1', cat: 'Aprendizado' },
                                { nome: 'Exercício', icone: '🏃', cor: '#d97706', cat: 'Fitness' },
                                { nome: 'Meditar', icone: '🧘', cor: '#2d7a5f', cat: 'Bem-estar' },
                                { nome: 'Estudar', icone: '✍️', cor: '#8b7355', cat: 'Aprendizado' },
                                { nome: 'Dormir Cedo', icone: '🛌', cor: '#2e5c8a', cat: 'Saúde' },
                            ].map((modelo) => (
                                <button
                                    key={modelo.nome}
                                    type="button"
                                    onClick={() => {
                                        setValue('nome', modelo.nome)
                                        setValue('icone', modelo.icone)
                                        setValue('cor', modelo.cor)
                                        setValue('categoria', modelo.cat)
                                    }}
                                    className="flex items-center gap-2 p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 hover:border-primary-gold/30 transition-all text-left group"
                                >
                                    <span className="text-xl group-hover:scale-110 transition-transform">{modelo.icone}</span>
                                    <span className="text-sm text-text-secondary group-hover:text-text-primary truncate">{modelo.nome}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
                    {/* Nome */}
                    <div className="space-y-2">
                        <Label htmlFor="nome">Nome do Hábito *</Label>
                        <Input
                            id="nome"
                            placeholder="Ex: Beber água"
                            {...register('nome')}
                            className={errors.nome ? 'border-accent-error' : ''}
                        />
                        {errors.nome && (
                            <p className="text-sm text-accent-error">{errors.nome.message}</p>
                        )}
                    </div>

                    {/* Descrição */}
                    <div className="space-y-2">
                        <Label htmlFor="descricao">Descrição (opcional)</Label>
                        <Input
                            id="descricao"
                            placeholder="Mais detalhes sobre o hábito"
                            {...register('descricao')}
                        />
                    </div>

                    {/* Ícone */}
                    <div className="space-y-2">
                        <Label>Ícone *</Label>
                        <div className="grid grid-cols-6 gap-2">
                            {icones.map((icone) => (
                                <button
                                    key={icone}
                                    type="button"
                                    onClick={() => setValue('icone', icone)}
                                    className={`text-2xl p-3 rounded-lg transition-all hover:scale-110 ${iconeAtual === icone
                                        ? 'bg-primary-green/20 ring-2 ring-primary-green'
                                        : 'bg-white/5 hover:bg-white/10'
                                        }`}
                                >
                                    {icone}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Cor e Categoria */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Cor *</Label>
                            <div className="grid grid-cols-3 gap-2">
                                {cores.map((cor) => (
                                    <button
                                        key={cor.valor}
                                        type="button"
                                        onClick={() => setValue('cor', cor.valor)}
                                        className={`h-10 rounded-lg transition-all hover:scale-105 ${corAtual === cor.valor ? 'ring-2 ring-white' : ''
                                            }`}
                                        style={{ backgroundColor: cor.valor }}
                                        title={cor.nome}
                                    />
                                ))}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="categoria">Categoria *</Label>
                            <Select
                                value={watch('categoria')}
                                onValueChange={(value: string) => setValue('categoria', value)}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {categorias.map((cat) => (
                                        <SelectItem key={cat} value={cat}>
                                            {cat}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Frequência */}
                    <div className="space-y-2">
                        <Label htmlFor="frequencia">Frequência *</Label>
                        <Select
                            value={watch('frequencia')}
                            onValueChange={(value: string) => setValue('frequencia', value as any)}
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="diaria">Diária</SelectItem>
                                <SelectItem value="semanal">Semanal</SelectItem>
                                <SelectItem value="personalizada">Personalizada</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Lembretes */}
                    <div className="space-y-4 border-t border-white/10 pt-4">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="lembrete" className="flex items-center gap-2 cursor-pointer">
                                <Clock size={16} />
                                Ativar Lembretes
                            </Label>
                            <Switch
                                id="lembrete"
                                checked={lembreteAtivo}
                                onCheckedChange={(checked) => setValue('lembrete', checked)}
                            />
                        </div>

                        {lembreteAtivo && (
                            <div className="space-y-3 bg-white/5 p-3 rounded-lg">
                                <div className="flex gap-2">
                                    <Input
                                        type="time"
                                        value={novoHorario}
                                        onChange={(e) => setNovoHorario(e.target.value)}
                                        className="flex-1"
                                    />
                                    <Button type="button" onClick={adicionarHorario} size="icon">
                                        <Plus size={18} />
                                    </Button>
                                </div>

                                <div className="space-y-2">
                                    {horarios.length === 0 && (
                                        <p className="text-caption text-text-tertiary text-center py-2">
                                            Nenhum horário adicionado
                                        </p>
                                    )}
                                    {horarios.map((horario, index) => (
                                        <div key={index} className="flex items-center justify-between bg-background/50 p-2 rounded border border-white/10">
                                            <span className="flex items-center gap-2 text-sm">
                                                <Clock size={14} className="text-primary-gold" />
                                                {horario}
                                            </span>
                                            <button
                                                type="button"
                                                onClick={() => removerHorario(horario)}
                                                className="text-text-tertiary hover:text-accent-error transition-colors"
                                            >
                                                <X size={16} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={isSubmitting}
                        >
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? 'Salvando...' : isEditing ? 'Salvar' : 'Criar Hábito'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
