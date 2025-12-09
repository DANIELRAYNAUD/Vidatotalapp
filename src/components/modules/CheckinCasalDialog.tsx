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

const checkinSchema = z.object({
    data: z.string().min(1, 'Data é obrigatória'),
    qualidade: z.number().min(1).max(10),
    tempoJuntos: z.number().min(0).optional(),
    atividadeFeita: z.string().optional(),
    conversaMeaningful: z.boolean(),
    reflexao: z.string().optional(),
    gratidao: z.string().optional(),
})

type CheckinFormData = z.infer<typeof checkinSchema>

interface CheckinDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onSubmit: (data: CheckinFormData) => void | Promise<void>
}

export function CheckinCasalDialog({ open, onOpenChange, onSubmit }: CheckinDialogProps) {
    const {
        register,
        handleSubmit,
        watch,
        formState: { isSubmitting },
        reset,
    } = useForm<CheckinFormData>({
        resolver: zodResolver(checkinSchema),
        defaultValues: {
            data: new Date().toISOString().split('T')[0],
            qualidade: 7,
            tempoJuntos: 0,
            conversaMeaningful: false,
        },
    })

    const handleFormSubmit = async (data: CheckinFormData) => {
        await onSubmit(data)
        reset()
        onOpenChange(false)
    }

    const qualidadeAtual = watch('qualidade')

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Check-in do Relacionamento</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="data">Data</Label>
                        <Input id="data" type="date" {...register('data')} />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="qualidade">
                            Como está a qualidade do relacionamento? ({qualidadeAtual}/10)
                        </Label>
                        <input
                            id="qualidade"
                            type="range"
                            min="1"
                            max="10"
                            {...register('qualidade', { valueAsNumber: true })}
                            className="w-full"
                        />
                        <div className="flex justify-between text-xs text-text-secondary">
                            <span>Precisa atenção</span>
                            <span>Excelente</span>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="tempoJuntos">Tempo juntos hoje (minutos)</Label>
                        <Input
                            id="tempoJuntos"
                            type="number"
                            {...register('tempoJuntos', { valueAsNumber: true })}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="atividadeFeita">O que fizeram juntos?</Label>
                        <Input
                            id="atividadeFeita"
                            {...register('atividadeFeita')}
                            placeholder="Ex: Jantar, conversa, filme..."
                        />
                    </div>

                    <div className="flex items-center space-x-2">
                        <input
                            type="checkbox"
                            id="conversaMeaningful"
                            {...register('conversaMeaningful')}
                            className="w-4 h-4 rounded"
                        />
                        <Label htmlFor="conversaMeaningful" className="cursor-pointer">
                            Tivemos uma conversa significativa
                        </Label>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="gratidao">Pelo que sou grato(a) hoje?</Label>
                        <textarea
                            id="gratidao"
                            {...register('gratidao')}
                            className="w-full min-h-[60px] px-3 py-2 rounded-md border border-input bg-background text-sm"
                            placeholder="Escreva algo que você agradece..."
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="reflexao">Reflexão pessoal</Label>
                        <textarea
                            id="reflexao"
                            {...register('reflexao')}
                            className="w-full min-h-[60px] px-3 py-2 rounded-md border border-input bg-background text-sm"
                        />
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            Salvar Check-in
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
