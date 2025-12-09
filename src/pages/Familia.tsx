import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, Loader2, Users, GraduationCap, PawPrint } from 'lucide-react'
import { familiaAPI } from '@/lib/api'
import { useToast } from '@/components/ui/use-toast'

export function Familia() {
    const [loading, setLoading] = useState(true)
    const [membros, setMembros] = useState<any[]>([])
    const [pets, setPets] = useState<any[]>([])
    const [funcionarios, setFuncionarios] = useState<any[]>([])
    const { toast } = useToast()

    const carregarDados = async () => {
        try {
            setLoading(true)
            const [membrosRes, petsRes, funcionariosRes] = await Promise.all([
                familiaAPI.listarMembros(),
                familiaAPI.listarPets(),
                familiaAPI.listarFuncionarios(),
            ])
            setMembros((membrosRes.data as any) || [])
            setPets((petsRes.data as any) || [])
            setFuncionarios((funcionariosRes.data as any) || [])
        } catch (error) {
            console.error('Erro ao carregar dados:', error)
            toast({
                title: 'Erro',
                description: 'Não foi possível carregar os dados',
                variant: 'error',
            })
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        carregarDados()
    }, [])

    const calcularIdade = (dataNascimento: string) => {
        const hoje = new Date()
        const nasc = new Date(dataNascimento)
        let idade = hoje.getFullYear() - nasc.getFullYear()
        const mes = hoje.getMonth() - nasc.getMonth()
        if (mes < 0 || (mes === 0 && hoje.getDate() < nasc.getDate())) {
            idade--
        }
        return idade
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader2 className="h-8 w-8 animate-spin text-primary-green" />
            </div>
        )
    }

    return (
        <div className="space-y-xl">
            <div>
                <h1 className="text-h1 font-bold text-text-primary mb-sm">
                    👨‍👩‍👧‍👦 Família
                </h1>
                <p className="text-body-lg text-text-secondary">
                    Gestão completa da família: membros, escola, saúde, pets e casa
                </p>
            </div>

            {/* Cards de Resumo */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-md">
                <Card className="gradient-green-gold">
                    <CardContent className="p-lg">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-caption text-white/80 mb-1">Membros</p>
                                <p className="text-display font-bold text-white">{membros.length}</p>
                            </div>
                            <Users className="text-white" size={32} />
                        </div>
                    </CardContent>
                </Card>

                <Card className="gradient-blue">
                    <CardContent className="p-lg">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-caption text-white/80 mb-1">Filhos</p>
                                <p className="text-display font-bold text-white">
                                    {membros.filter(m => m.relacao.includes('filho')).length}
                                </p>
                            </div>
                            <GraduationCap className="text-white" size={32} />
                        </div>
                    </CardContent>
                </Card>

                <Card className="gradient-orange">
                    <CardContent className="p-lg">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-caption text-white/80 mb-1">Pets</p>
                                <p className="text-display font-bold text-white">{pets.length}</p>
                            </div>
                            <PawPrint className="text-white" size={32} />
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-surface-card backdrop-blur-card">
                    <CardContent className="p-lg">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-caption text-text-secondary mb-1">Funcionários</p>
                                <p className="text-display font-bold text-text-primary">{funcionarios.length}</p>
                            </div>
                            <div className="text-4xl">👥</div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Membros da Família */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Membros da Família</CardTitle>
                    <Button size="sm">
                        <Plus className="mr-2" size={16} />
                        Adicionar Membro
                    </Button>
                </CardHeader>
                <CardContent>
                    {membros.length === 0 ? (
                        <p className="text-center text-text-secondary py-8">
                            Nenhum membro cadastrado
                        </p>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-md">
                            {membros.map((membro) => (
                                <Card key={membro.id} className="hover:border-primary-green transition-all">
                                    <CardContent className="p-md">
                                        <div className="flex items-start gap-3 mb-3">
                                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-green to-primary-teal flex items-center justify-center text-2xl">
                                                {membro.relacao === 'esposa' ? '👩' : '👦'}
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="text-body-lg font-semibold text-text-primary">
                                                    {membro.nome}
                                                </h3>
                                                <p className="text-caption text-text-secondary">
                                                    {membro.relacao} • {calcularIdade(membro.dataNascimento)} anos
                                                </p>
                                            </div>
                                        </div>

                                        {membro.escola && (
                                            <div className="mt-2 p-2 bg-white/5 rounded">
                                                <p className="text-caption text-text-secondary">
                                                    🏫 {membro.escola.nome}
                                                </p>
                                                {membro.serie && (
                                                    <p className="text-caption text-text-secondary">
                                                        {membro.serie}
                                                    </p>
                                                )}
                                            </div>
                                        )}

                                        {membro.terapias && membro.terapias.length > 0 && (
                                            <div className="mt-2">
                                                <p className="text-caption text-primary-blue">
                                                    {membro.terapias.length} terapia(s) ativa(s)
                                                </p>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Pets */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Pets da Família</CardTitle>
                    <Button size="sm" variant="secondary">
                        <Plus className="mr-2" size={16} />
                        Adicionar Pet
                    </Button>
                </CardHeader>
                <CardContent>
                    {pets.length === 0 ? (
                        <p className="text-center text-text-secondary py-8">
                            Nenhum pet cadastrado
                        </p>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-md">
                            {pets.map((pet) => (
                                <Card key={pet.id} className="hover:border-primary-orange transition-all">
                                    <CardContent className="p-md">
                                        <div className="flex items-start gap-3">
                                            <div className="w-12 h-12 rounded-full bg-primary-orange/20 flex items-center justify-center text-2xl">
                                                {pet.especie === 'cachorro' ? '🐕' : pet.especie === 'gato' ? '🐈' : '🐾'}
                                            </div>
                                            <div>
                                                <h3 className="text-body-lg font-semibold text-text-primary">
                                                    {pet.nome}
                                                </h3>
                                                <p className="text-caption text-text-secondary">
                                                    {pet.especie} {pet.raca ? `• ${pet.raca}` : ''}
                                                </p>
                                                {pet.cuidados && pet.cuidados.length > 0 && (
                                                    <p className="text-caption text-primary-green mt-1">
                                                        {pet.cuidados.length} cuidado(s) registrado(s)
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Funcionários */}
            {funcionarios.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Funcionários</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-md">
                            {funcionarios.map((func) => (
                                <div
                                    key={func.id}
                                    className="flex items-center justify-between p-3 rounded-lg bg-white/5"
                                >
                                    <div>
                                        <p className="text-body font-semibold text-text-primary">
                                            {func.nome}
                                        </p>
                                        <p className="text-caption text-text-secondary">
                                            {func.tipo} • R$ {func.salario.toFixed(2)}
                                        </p>
                                    </div>
                                    <span className={`px-2 py-1 rounded text-xs ${func.ativo ? 'bg-accent-success/20 text-accent-success' : 'bg-gray-500/20 text-gray-400'
                                        }`}>
                                        {func.ativo ? 'Ativo' : 'Inativo'}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
