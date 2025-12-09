import { useState, useMemo } from 'react'
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
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { useCreditCardLogic } from '@/hooks/useCreditCardLogic'
import { formatarMoeda } from '@/lib/utils'
import type { CartaoCredito, Conta } from '@/types/financas'

interface TransactionFormProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onSubmit: (data: any, isParcelado: boolean) => Promise<void>
    cartoes: CartaoCredito[]
    contas: Conta[]
}

const CATEGORIAS = [
    'Alimentação',
    'Transporte',
    'Moradia',
    'Saúde',
    'Educação',
    'Lazer',
    'Vestuário',
    'Serviço Médico',
    'Outros'
]

export function TransactionForm({ open, onOpenChange, onSubmit, cartoes, contas }: TransactionFormProps) {
    const [loading, setLoading] = useState(false)
    const [tipoPagamento, setTipoPagamento] = useState<'vista' | 'parcelado'>('vista')
    const { gerarParcelamento } = useCreditCardLogic()

    const [formData, setFormData] = useState({
        tipo: 'despesa' as 'receita' | 'despesa',
        valor: '',
        categoria: 'Outros',
        descricao: '',
        data: new Date().toISOString().split('T')[0],
        contaId: '',
        cartaoId: '',
        numParcelas: '1'
    })

    // Usar useMemo para calcular preview sem causar loop
    const preview = useMemo(() => {
        if (tipoPagamento === 'parcelado' && formData.cartaoId && formData.valor && formData.numParcelas) {
            const cartao = cartoes.find(c => c.id === formData.cartaoId)
            if (cartao && !isNaN(parseFloat(formData.valor))) {
                try {
                    return gerarParcelamento(
                        parseFloat(formData.valor),
                        parseInt(formData.numParcelas),
                        new Date(formData.data),
                        cartao.diaFechamento,
                        cartao.diaVencimento
                    )
                } catch (error) {
                    console.error('Erro ao gerar preview:', error)
                    return []
                }
            }
        }
        return []
    }, [tipoPagamento, formData.cartaoId, formData.valor, formData.numParcelas, formData.data, cartoes, gerarParcelamento])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!formData.valor || !formData.categoria) return

        if (tipoPagamento === 'vista' && !formData.contaId) {
            alert('Selecione uma conta para pagamento à vista')
            return
        }

        if (tipoPagamento === 'parcelado' && !formData.cartaoId) {
            alert('Selecione um cartão para parcelamento')
            return
        }

        setLoading(true)
        try {
            await onSubmit(formData, tipoPagamento === 'parcelado')
            onOpenChange(false)
            // Reset form
            setFormData({
                tipo: 'despesa',
                valor: '',
                categoria: 'Outros',
                descricao: '',
                data: new Date().toISOString().split('T')[0],
                contaId: '',
                cartaoId: '',
                numParcelas: '1'
            })
            setTipoPagamento('vista')
        } catch (error) {
            console.error('Erro ao salvar transação:', error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Nova Transação</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-md">
                    {/* Tipo */}
                    <div className="grid grid-cols-2 gap-md">
                        <Button
                            type="button"
                            variant={formData.tipo === 'receita' ? 'default' : 'outline'}
                            onClick={() => setFormData({ ...formData, tipo: 'receita' })}
                        >
                            💰 Receita
                        </Button>
                        <Button
                            type="button"
                            variant={formData.tipo === 'despesa' ? 'default' : 'outline'}
                            onClick={() => setFormData({ ...formData, tipo: 'despesa' })}
                        >
                            💸 Despesa
                        </Button>
                    </div>

                    {/* Valor e Data */}
                    <div className="grid grid-cols-2 gap-md">
                        <div className="space-y-2">
                            <Label htmlFor="valor">Valor *</Label>
                            <Input
                                id="valor"
                                type="number"
                                step="0.01"
                                value={formData.valor}
                                onChange={(e) => setFormData({ ...formData, valor: e.target.value })}
                                placeholder="100.00"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="data">Data *</Label>
                            <Input
                                id="data"
                                type="date"
                                value={formData.data}
                                onChange={(e) => setFormData({ ...formData, data: e.target.value })}
                                required
                            />
                        </div>
                    </div>

                    {/* Categoria */}
                    <div className="space-y-2">
                        <Label htmlFor="categoria">Categoria *</Label>
                        <Select
                            value={formData.categoria}
                            onValueChange={(value) => setFormData({ ...formData, categoria: value })}
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {CATEGORIAS.map((cat) => (
                                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Descrição */}
                    <div className="space-y-2">
                        <Label htmlFor="descricao">Descrição</Label>
                        <Textarea
                            id="descricao"
                            value={formData.descricao}
                            onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                            placeholder="Detalhes da transação..."
                            rows={2}
                        />
                    </div>

                    {/* Forma de Pagamento  */}
                    {formData.tipo === 'despesa' && (
                        <>
                            <div className="flex items-center justify-between p-md bg-white/5 rounded-lg">
                                <Label htmlFor="parcelado">Parcelar no cartão?</Label>
                                <Switch
                                    id="parcelado"
                                    checked={tipoPagamento === 'parcelado'}
                                    onCheckedChange={(checked) => setTipoPagamento(checked ? 'parcelado' : 'vista')}
                                />
                            </div>

                            {tipoPagamento === 'vista' ? (
                                <div className="space-y-2">
                                    <Label htmlFor="conta">Conta *</Label>
                                    <Select
                                        value={formData.contaId}
                                        onValueChange={(value) => setFormData({ ...formData, contaId: value })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Selecione uma conta" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {contas.map((conta) => (
                                                <SelectItem key={conta.id} value={conta.id}>
                                                    {conta.nome} - {formatarMoeda(conta.saldo)}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            ) : (
                                <>
                                    <div className="space-y-2">
                                        <Label htmlFor="cartao">Cartão de Crédito *</Label>
                                        <Select
                                            value={formData.cartaoId}
                                            onValueChange={(value) => setFormData({ ...formData, cartaoId: value })}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Selecione um cartão" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {cartoes.map((cartao) => (
                                                    <SelectItem key={cartao.id} value={cartao.id}>
                                                        {cartao.nome} ({cartao.bandeira})
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="parcelas">Número de parcelas *</Label>
                                        <Select
                                            value={formData.numParcelas}
                                            onValueChange={(value) => setFormData({ ...formData, numParcelas: value })}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {Array.from({ length: 12 }, (_, i) => i + 1).map((num) => (
                                                    <SelectItem key={num} value={num.toString()}>
                                                        {num}x
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {/* Preview das Parcelas */}
                                    {preview.length > 0 && (
                                        <div className="p-md bg-accent-info/10 rounded-lg border border-accent-info/20 space-y-2">
                                            <h4 className="text-body font-semibold text-text-primary">
                                                📊 Preview das Parcelas
                                            </h4>
                                            <div className="max-h-40 overflow-y-auto space-y-1">
                                                {preview.map((parcela, idx) => (
                                                    <div key={idx} className="flex justify-between text-caption text-text-secondary">
                                                        <span>{parcela.numeroParcela}/{preview.length}</span>
                                                        <span>{formatarMoeda(parcela.valor)}</span>
                                                        <span>{parcela.mesReferencia}</span>
                                                        <span>{parcela.dataVencimento.toLocaleDateString('pt-BR')}</span>
                                                    </div>
                                                ))}
                                            </div>
                                            <p className="text-caption text-accent-success font-semibold">
                                                Total: {formatarMoeda(preview.reduce((sum, p) => sum + p.valor, 0))}
                                            </p>
                                        </div>
                                    )}
                                </>
                            )}
                        </>
                    )}

                    {formData.tipo === 'receita' && (
                        <div className="space-y-2">
                            <Label htmlFor="conta">Conta *</Label>
                            <Select
                                value={formData.contaId}
                                onValueChange={(value) => setFormData({ ...formData, contaId: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecione uma conta" />
                                </SelectTrigger>
                                <SelectContent>
                                    {contas.map((conta) => (
                                        <SelectItem key={conta.id} value={conta.id}>
                                            {conta.nome} - {formatarMoeda(conta.saldo)}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}

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
                            {loading ? 'Salvando...' : 'Salvar'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
