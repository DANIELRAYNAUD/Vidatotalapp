import { useState, useEffect } from 'react'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { CreditCard } from 'lucide-react'
import type { CartaoCredito } from '@/types/financas'

interface CartaoDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onSubmit: (data: any) => Promise<void>
    initialData?: CartaoCredito
    isEditing?: boolean
}

const BANDEIRAS = [
    { value: 'visa', label: 'Visa', cor: 'bg-blue-600' },
    { value: 'mastercard', label: 'Mastercard', cor: 'bg-orange-600' },
    { value: 'elo', label: 'Elo', cor: 'bg-yellow-600' },
    { value: 'amex', label: 'American Express', cor: 'bg-blue-500' },
]

export function CartaoDialog({ open, onOpenChange, onSubmit, initialData, isEditing }: CartaoDialogProps) {
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        nome: '',
        bandeira: 'visa',
        limite: '',
        diaFechamento: '',
        diaVencimento: '',
        cor: 'bg-blue-600'
    })

    useEffect(() => {
        if (initialData) {
            setFormData({
                nome: initialData.nome || '',
                bandeira: initialData.bandeira || 'visa',
                limite: initialData.limite?.toString() || '',
                diaFechamento: initialData.diaFechamento?.toString() || '',
                diaVencimento: initialData.diaVencimento?.toString() || '',
                cor: initialData.cor || 'bg-blue-600'
            })
        } else {
            setFormData({
                nome: '',
                bandeira: 'visa',
                limite: '',
                diaFechamento: '',
                diaVencimento: '',
                cor: 'bg-blue-600'
            })
        }
    }, [initialData, open])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!formData.nome || !formData.limite || !formData.diaFechamento || !formData.diaVencimento) {
            return
        }

        setLoading(true)
        try {
            await onSubmit(formData)
            onOpenChange(false)
        } catch (error) {
            console.error('Erro ao salvar cartão:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleBandeiraChange = (bandeira: string) => {
        const bandeiraObj = BANDEIRAS.find(b => b.value === bandeira)
        setFormData({
            ...formData,
            bandeira,
            cor: bandeiraObj?.cor || 'bg-blue-600'
        })
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <CreditCard size={20} />
                        {isEditing ? 'Editar Cartão' : 'Novo Cartão de Crédito'}
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-md">
                    <div className="space-y-2">
                        <Label htmlFor="nome">Nome do Cartão *</Label>
                        <Input
                            id="nome"
                            value={formData.nome}
                            onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                            placeholder="Ex: Nubank, Itaú Platinum"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="bandeira">Bandeira *</Label>
                        <Select
                            value={formData.bandeira}
                            onValueChange={handleBandeiraChange}
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {BANDEIRAS.map((band) => (
                                    <SelectItem key={band.value} value={band.value}>
                                        <div className="flex items-center gap-2">
                                            <div className={`w-3 h-3 rounded-full ${band.cor}`} />
                                            {band.label}
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="limite">Limite *</Label>
                        <Input
                            id="limite"
                            type="number"
                            step="0.01"
                            value={formData.limite}
                            onChange={(e) => setFormData({ ...formData, limite: e.target.value })}
                            placeholder="5000.00"
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-md">
                        <div className="space-y-2">
                            <Label htmlFor="fechamento">Dia de Fechamento *</Label>
                            <Input
                                id="fechamento"
                                type="number"
                                min="1"
                                max="31"
                                value={formData.diaFechamento}
                                onChange={(e) => setFormData({ ...formData, diaFechamento: e.target.value })}
                                placeholder="15"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="vencimento">Dia de Vencimento *</Label>
                            <Input
                                id="vencimento"
                                type="number"
                                min="1"
                                max="31"
                                value={formData.diaVencimento}
                                onChange={(e) => setFormData({ ...formData, diaVencimento: e.target.value })}
                                placeholder="22"
                                required
                            />
                        </div>
                    </div>

                    <div className="p-md bg-accent-info/10 rounded-lg border border-accent-info/20 text-caption text-text-secondary">
                        💡 <strong>Dica:</strong> O dia de fechamento determina quando suas compras param de ser contabilizadas na fatura atual. O dia de vencimento é quando você precisa pagar a fatura.
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
                            {loading ? 'Salvando...' : isEditing ? 'Salvar' : 'Criar Cartão'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
