import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

const membroSchema = z.object({
    nome: z.string().min(1, 'Nome é obrigatório'),
    relacao: z.string().min(1, 'Relação é obrigatória'),
    dataNascimento: z.string().min(1, 'Data de nascimento é obrigatória'),
    escolaId: z.string().optional(),
    serie: z.string().optional(),
    professor: z.string().optional(),
})

type MembroFormData = z.infer<typeof membroSchema>

interface MembroDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onSubmit: (data: MembroFormData) => void | Promise<void>
    escolas: any[]
}

const RELACOES = [
    { value: 'esposa', label: 'Esposa' },
    { value: 'filho1', label: 'Filho 1' },
    { value: 'filho2', label: 'Filho 2' },
    { value: 'filho3', label: 'Filho 3' },
]

export function MembroFamiliaDialog({ open, onOpenChange, onSubmit, escolas }: MembroDialogProps) {
    const {
        register,
        handleSubmit,
        watch,
        setValue,
        formState: { errors, isSubmitting },
        reset,
    } = useForm<MembroFormData>({
        resolver: zodResolver(membroSchema),
        defaultValues: {
            relacao: 'filho1',
        },
    })

    const handleFormSubmit = async (data: MembroFormData) => {
        await onSubmit(data)
        reset()
        onOpenChange(false)
    }

    const relacaoSelecionada = watch('relacao')
    const isFilho = relacaoSelecionada && relacaoSelecionada.includes('filho')

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Adicionar Membro da Família</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="nome">Nome *</Label>
                        <Input
                            id="nome"
                            {...register('nome')}
                            className={errors.nome ? 'border-accent-error' : ''}
                        />
                        {errors.nome && <p className="text-sm text-accent-error">{errors.nome.message}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="relacao">Relação *</Label>
                        <Select value={watch('relacao')} onValueChange={(value) => setValue('relacao', value)}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {RELACOES.map((rel) => (
                                    <SelectItem key={rel.value} value={rel.value}>
                                        {rel.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="dataNascimento">Data de Nascimento *</Label>
                        <Input
                            id="dataNascimento"
                            type="date"
                            {...register('dataNascimento')}
                            className={errors.dataNascimento ? 'border-accent-error' : ''}
                        />
                    </div>

                    {isFilho && (
                        <>
                            <div className="space-y-2">
                                <Label htmlFor="escolaId">Escola</Label>
                                <Select value={watch('escolaId') || ''} onValueChange={(value) => setValue('escolaId', value)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecione a escola" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {escolas.map((escola) => (
                                            <SelectItem key={escola.id} value={escola.id}>
                                                {escola.nome}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="serie">Série/Ano</Label>
                                    <Input id="serie" {...register('serie')} placeholder="Ex: 3º ano" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="professor">Professor(a)</Label>
                                    <Input id="professor" {...register('professor')} />
                                </div>
                            </div>
                        </>
                    )}

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            Salvar Membro
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
