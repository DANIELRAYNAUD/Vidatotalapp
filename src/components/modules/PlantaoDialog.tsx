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

const plantaoSchema = z.object({
    empresaId: z.string().min(1, 'Empresa é obrigatória'),
    data: z.string().min(1, 'Data é obrigatória'),
    blocoHorario: z.string().min(1, 'Horário é obrigatório'),
    tipoServico: z.string().min(1, 'Tipo é obrigatório'),
    valor: z.number().min(0, 'Valor deve ser positivo'),
    numAtendimentos: z.number().min(0).optional(),
    observacoes: z.string().optional(),
})

type PlantaoFormData = z.infer<typeof plantaoSchema>

interface PlantaoDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onSubmit: (data: PlantaoFormData) => void | Promise<void>
    empresas: any[]
    initialData?: Partial<PlantaoFormData>
}

const BLOCOS_HORARIO = [
    { value: '00-06', label: '00:00 - 06:00' },
    { value: '06-12', label: '06:00 - 12:00' },
    { value: '12-18', label: '12:00 - 18:00' },
    { value: '18-24', label: '18:00 - 00:00' },
]

const TIPOS_SERVICO = [
    { value: 'plantao', label: 'Plantão Hospitalar' },
    { value: 'ambulatorio', label: 'Ambulatório' },
    { value: 'consultorio', label: 'Consultório Particular' },
    { value: 'cirurgia', label: 'Cirurgia' },
    { value: 'interconsulta', label: 'Interconsulta' },
    { value: 'homecare', label: 'Home Care' },
]

export function PlantaoDialog({
    open,
    onOpenChange,
    onSubmit,
    empresas,
    initialData,
}: PlantaoDialogProps) {
    const {
        register,
        handleSubmit,
        watch,
        setValue,
        formState: { errors, isSubmitting },
        reset,
    } = useForm<PlantaoFormData>({
        resolver: zodResolver(plantaoSchema),
        defaultValues: {
            empresaId: initialData?.empresaId || '',
            data: initialData?.data || new Date().toISOString().split('T')[0],
            blocoHorario: initialData?.blocoHorario || '12-18',
            tipoServico: initialData?.tipoServico || 'plantao',
            valor: initialData?.valor || 0,
            numAtendimentos: initialData?.numAtendimentos,
            observacoes: initialData?.observacoes || '',
        },
    })

    const handleFormSubmit = async (data: PlantaoFormData) => {
        await onSubmit(data)
        reset()
        onOpenChange(false)
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>Novo Plantão</DialogTitle>
                    <DialogDescription>
                        Registre um novo plantão médico
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
                    {/* Empresa */}
                    <div className="space-y-2">
                        <Label htmlFor="empresaId">Empresa/Local *</Label>
                        <Select value={watch('empresaId')} onValueChange={(value) => setValue('empresaId', value)}>
                            <SelectTrigger>
                                <SelectValue placeholder="Selecione a empresa" />
                            </SelectTrigger>
                            <SelectContent>
                                {empresas.map((empresa) => (
                                    <SelectItem key={empresa.id} value={empresa.id}>
                                        {empresa.nome}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.empresaId && <p className="text-sm text-accent-error">{errors.empresaId.message}</p>}
                    </div>

                    {/* Data e Horário */}
                    <div className="grid grid-cols-2 gap-4">
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

                        <div className="space-y-2">
                            <Label htmlFor="blocoHorario">Horário *</Label>
                            <Select value={watch('blocoHorario')} onValueChange={(value) => setValue('blocoHorario', value)}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {BLOCOS_HORARIO.map((bloco) => (
                                        <SelectItem key={bloco.value} value={bloco.value}>
                                            {bloco.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Tipo e Valor */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="tipoServico">Tipo de Serviço *</Label>
                            <Select value={watch('tipoServico')} onValueChange={(value) => setValue('tipoServico', value)}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {TIPOS_SERVICO.map((tipo) => (
                                        <SelectItem key={tipo.value} value={tipo.value}>
                                            {tipo.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="valor">Valor (R$) *</Label>
                            <Input
                                id="valor"
                                type="number"
                                step="0.01"
                                {...register('valor', { valueAsNumber: true })}
                                className={errors.valor ? 'border-accent-error' : ''}
                            />
                        </div>
                    </div>

                    {/* Atendimentos */}
                    <div className="space-y-2">
                        <Label htmlFor="numAtendimentos">Nº de Atendimentos (opcional)</Label>
                        <Input
                            id="numAtendimentos"
                            type="number"
                            {...register('numAtendimentos', { valueAsNumber: true })}
                        />
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
                            {isSubmitting ? 'Salvando...' : 'Salvar Plantão'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
