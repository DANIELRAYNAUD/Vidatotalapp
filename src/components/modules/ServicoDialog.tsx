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

const TIPOS_SERVICO = [
    { value: 'reunioes', label: 'Reuniões', icone: '⛪' },
    { value: 'alimento_diario', label: 'Alimento Diário', icone: '📖' },
    { value: 'grito_guerra', label: 'Grito de Guerra', icone: '📣' },
    { value: 'conferencias', label: 'Conferências', icone: '🎤' },
    { value: 'ofertas', label: 'Ofertas', icone: '💝' },
    { value: 'oracoes_diarias', label: 'Orações Diárias', icone: '🙏' },
    { value: 'jejum', label: 'Jejum', icone: '🌙' },
    { value: 'imersao_palavra', label: 'Imersão na Palavra', icone: '📜' },
    { value: 'comunhao_irmaos', label: 'Comunhão com Irmãos', icone: '🤝' },
    { value: 'servir_igreja', label: 'Servir na Igreja', icone: '❤️' },
]

const servicoSchema = z.object({
    tipo: z.string().min(1, 'Tipo é obrigatório'),
    titulo: z.string().min(1, 'Título é obrigatório').max(200, 'Título muito longo'),
    data: z.string().min(1, 'Data é obrigatória'),
    descricao: z.string().optional(),
    duracao: z.number().min(0).optional(),
    valor: z.number().min(0).optional(),
    reflexao: z.string().optional(),
    versiculo: z.string().optional(),
})

type ServicoFormData = z.infer<typeof servicoSchema>

interface ServicoDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onSubmit: (data: ServicoFormData) => void | Promise<void>
    initialData?: Partial<ServicoFormData>
    isEditing?: boolean
}

export function ServicoDialog({
    open,
    onOpenChange,
    onSubmit,
    initialData,
    isEditing = false,
}: ServicoDialogProps) {
    const {
        register,
        handleSubmit,
        watch,
        setValue,
        formState: { errors, isSubmitting },
        reset,
    } = useForm<ServicoFormData>({
        resolver: zodResolver(servicoSchema),
        defaultValues: {
            tipo: initialData?.tipo || 'reunioes',
            titulo: initialData?.titulo || '',
            data: initialData?.data || new Date().toISOString().split('T')[0],
            descricao: initialData?.descricao || '',
            duracao: initialData?.duracao || undefined,
            valor: initialData?.valor || undefined,
            reflexao: initialData?.reflexao || '',
            versiculo: initialData?.versiculo || '',
        },
    })

    const tipoAtual = watch('tipo')
    const mostrarCampoValor = tipoAtual === 'ofertas'

    const handleFormSubmit = async (data: ServicoFormData) => {
        await onSubmit(data)
        reset()
        onOpenChange(false)
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{isEditing ? 'Editar Registro' : 'Novo Registro de Serviço'}</DialogTitle>
                    <DialogDescription>
                        {isEditing
                            ? 'Atualize as informações do registro'
                            : 'Adicione um novo registro de serviço ao Senhor'}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
                    {/* Tipo */}
                    <div className="space-y-2">
                        <Label htmlFor="tipo">Tipo de Atividade *</Label>
                        <Select value={watch('tipo')} onValueChange={(value: string) => setValue('tipo', value)}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {TIPOS_SERVICO.map((tipo) => (
                                    <SelectItem key={tipo.value} value={tipo.value}>
                                        <span className="flex items-center gap-2">
                                            <span>{tipo.icone}</span>
                                            {tipo.label}
                                        </span>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.tipo && <p className="text-sm text-accent-error">{errors.tipo.message}</p>}
                    </div>

                    {/* Título */}
                    <div className="space-y-2">
                        <Label htmlFor="titulo">Título *</Label>
                        <Input
                            id="titulo"
                            placeholder="Ex: Culto de Domingo"
                            {...register('titulo')}
                            className={errors.titulo ? 'border-accent-error' : ''}
                        />
                        {errors.titulo && <p className="text-sm text-accent-error">{errors.titulo.message}</p>}
                    </div>

                    {/* Data */}
                    <div className="space-y-2">
                        <Label htmlFor="data">Data *</Label>
                        <Input
                            id="data"
                            type="date"
                            {...register('data')}
                            className={errors.data ? 'border-accent-error' : ''}
                        />
                        {errors.data && <p className="text-sm text-accent-error">{errors.data.message}</p>}
                    </div>

                    {/* Descrição */}
                    <div className="space-y-2">
                        <Label htmlFor="descricao">Descrição (opcional)</Label>
                        <Input
                            id="descricao"
                            placeholder="Breve descrição da atividade"
                            {...register('descricao')}
                        />
                    </div>

                    {/* Duração e Valor */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="duracao">Duração (minutos)</Label>
                            <Input
                                id="duracao"
                                type="number"
                                placeholder="60"
                                {...register('duracao', { valueAsNumber: true })}
                            />
                        </div>

                        {mostrarCampoValor && (
                            <div className="space-y-2">
                                <Label htmlFor="valor">Valor (R$)</Label>
                                <Input
                                    id="valor"
                                    type="number"
                                    step="0.01"
                                    placeholder="100.00"
                                    {...register('valor', { valueAsNumber: true })}
                                />
                            </div>
                        )}
                    </div>

                    {/* Versículo */}
                    <div className="space-y-2">
                        <Label htmlFor="versiculo">Versículo do Dia (opcional)</Label>
                        <Input
                            id="versiculo"
                            placeholder="Ex: João 3:16"
                            {...register('versiculo')}
                        />
                    </div>

                    {/* Reflexão */}
                    <div className="space-y-2">
                        <Label htmlFor="reflexao">Reflexão Pessoal (opcional)</Label>
                        <textarea
                            id="reflexao"
                            placeholder="Escreva sua reflexão sobre esta atividade..."
                            {...register('reflexao')}
                            className="w-full min-h-[100px] px-3 py-2 rounded-md border border-input bg-background text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        />
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? 'Salvando...' : isEditing ? 'Salvar' : 'Criar Registro'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
