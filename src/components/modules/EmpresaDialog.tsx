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

const empresaSchema = z.object({
    nome: z.string().min(1, 'Nome é obrigatório'),
    tipo: z.string().min(1, 'Tipo é obrigatório'),
    cnpj: z.string().optional(),
    endereco: z.string().optional(),
    telefone: z.string().optional(),
    email: z.string().email('Email inválido').optional().or(z.literal('')),
    diaPagamento: z.number().min(1).max(31),
    emiteNota: z.boolean(),
    valorPadrao: z.number().min(0).optional(),
    observacoes: z.string().optional(),
})

type EmpresaFormData = z.infer<typeof empresaSchema>

interface EmpresaDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onSubmit: (data: EmpresaFormData) => void | Promise<void>
    initialData?: Partial<EmpresaFormData>
}

const TIPOS_EMPRESA = [
    { value: 'hospital', label: 'Hospital' },
    { value: 'clinica', label: 'Clínica' },
    { value: 'consultorio', label: 'Consultório' },
    { value: 'ambulatorio', label: 'Ambulatório' },
]

export function EmpresaDialog({
    open,
    onOpenChange,
    onSubmit,
    initialData,
}: EmpresaDialogProps) {
    const {
        register,
        handleSubmit,
        watch,
        setValue,
        formState: { errors, isSubmitting },
        reset,
    } = useForm<EmpresaFormData>({
        resolver: zodResolver(empresaSchema),
        defaultValues: {
            nome: initialData?.nome || '',
            tipo: initialData?.tipo || 'hospital',
            cnpj: initialData?.cnpj || '',
            endereco: initialData?.endereco || '',
            telefone: initialData?.telefone || '',
            email: initialData?.email || '',
            diaPagamento: initialData?.diaPagamento || 5,
            emiteNota: initialData?.emiteNota || false,
            valorPadrao: initialData?.valorPadrao,
            observacoes: initialData?.observacoes || '',
        },
    })

    const handleFormSubmit = async (data: EmpresaFormData) => {
        await onSubmit(data)
        reset()
        onOpenChange(false)
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Nova Empresa</DialogTitle>
                    <DialogDescription>
                        Cadastre uma empresa ou local de trabalho
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
                    {/* Nome */}
                    <div className="space-y-2">
                        <Label htmlFor="nome">Nome *</Label>
                        <Input
                            id="nome"
                            {...register('nome')}
                            className={errors.nome ? 'border-accent-error' : ''}
                            placeholder="Ex: Hospital São Lucas"
                        />
                        {errors.nome && <p className="text-sm text-accent-error">{errors.nome.message}</p>}
                    </div>

                    {/* Tipo */}
                    <div className="space-y-2">
                        <Label htmlFor="tipo">Tipo *</Label>
                        <Select value={watch('tipo')} onValueChange={(value) => setValue('tipo', value)}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {TIPOS_EMPRESA.map((tipo) => (
                                    <SelectItem key={tipo.value} value={tipo.value}>
                                        {tipo.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* CNPJ e Telefone */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="cnpj">CNPJ</Label>
                            <Input id="cnpj" {...register('cnpj')} placeholder="00.000.000/0000-00" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="telefone">Telefone</Label>
                            <Input id="telefone" {...register('telefone')} placeholder="(00) 0000-0000" />
                        </div>
                    </div>

                    {/* Email */}
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" type="email" {...register('email')} placeholder="contato@empresa.com" />
                        {errors.email && <p className="text-sm text-accent-error">{errors.email.message}</p>}
                    </div>

                    {/* Endereço */}
                    <div className="space-y-2">
                        <Label htmlFor="endereco">Endereço</Label>
                        <Input id="endereco" {...register('endereco')} placeholder="Rua, número, bairro" />
                    </div>

                    {/* Dia Pagamento e Valor Padrão */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="diaPagamento">Dia de Pagamento *</Label>
                            <Input
                                id="diaPagamento"
                                type="number"
                                min="1"
                                max="31"
                                {...register('diaPagamento', { valueAsNumber: true })}
                                className={errors.diaPagamento ? 'border-accent-error' : ''}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="valorPadrao">Valor Padrão (R$)</Label>
                            <Input
                                id="valorPadrao"
                                type="number"
                                step="0.01"
                                {...register('valorPadrao', { valueAsNumber: true })}
                            />
                        </div>
                    </div>

                    {/* Emite Nota */}
                    <div className="flex items-center space-x-2">
                        <input
                            type="checkbox"
                            id="emiteNota"
                            {...register('emiteNota')}
                            className="w-4 h-4 rounded border-gray-300"
                        />
                        <Label htmlFor="emiteNota" className="cursor-pointer">
                            Emito nota fiscal para esta empresa
                        </Label>
                    </div>

                    {/* Observações */}
                    <div className="space-y-2">
                        <Label htmlFor="observacoes">Observações</Label>
                        <textarea
                            id="observacoes"
                            {...register('observacoes')}
                            className="w-full min-h-[80px] px-3 py-2 rounded-md border border-input bg-background text-sm"
                            placeholder="Observações adicionais..."
                        />
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? 'Salvando...' : 'Salvar Empresa'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
