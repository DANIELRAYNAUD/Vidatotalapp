import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Settings, User, Bell, Palette, Globe, Shield, Database, LogOut, Check, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuthStore, User as AuthUser } from '@/lib/authStore'
import { authAPI } from '@/lib/api'
import { useToast } from '@/components/ui/use-toast'

export function Configuracoes() {
    const navigate = useNavigate()
    const { toast } = useToast()
    const { user, logout, isAdmin } = useAuthStore()

    const [notifications, setNotifications] = useState(true)
    const [darkMode, setDarkMode] = useState(true)
    const [usersList, setUsersList] = useState<AuthUser[]>([])
    const [loadingUsers, setLoadingUsers] = useState(false)

    useEffect(() => {
        if (isAdmin) {
            loadUsers()
        }
    }, [isAdmin])

    const loadUsers = async () => {
        try {
            setLoadingUsers(true)
            const response = await authAPI.getUsers()
            setUsersList(response.data as AuthUser[])
        } catch (error) {
            console.error('Erro ao carregar usuários:', error)
        } finally {
            setLoadingUsers(false)
        }
    }

    const handleApproveUser = async (userId: string, aprovado: boolean) => {
        try {
            await authAPI.approveUser(userId, aprovado)
            toast({
                title: aprovado ? "Usuário aprovado" : "Aprovação removida",
                description: "As permissões foram atualizadas com sucesso.",
            })
            loadUsers()
        } catch (error) {
            toast({
                title: "Erro",
                description: "Não foi possível atualizar o usuário.",
                variant: "error"
            })
        }
    }

    const handleLogout = () => {
        logout()
        navigate('/login')
    }

    const settingsSections = [
        {
            title: 'Perfil',
            icon: User,
            color: 'text-accent-info',
            items: [
                { label: 'Nome', value: user?.nome || 'Usuário' },
                { label: 'Email', value: user?.email || 'email@exemplo.com' },
                { label: 'Tipo de Conta', value: isAdmin ? 'Administrador' : 'Usuário Padrão' }
            ]
        },
        {
            title: 'Notificações',
            icon: Bell,
            color: 'text-primary-orange',
            items: [
                { label: 'Hábitos Diários', value: 'Ativado' },
                { label: 'Medicamentos', value: 'Ativado' },
                { label: 'Consultas Médicas', value: 'Ativado' },
                { label: 'Metas e Marcos', value: 'Desativado' }
            ]
        },
        {
            title: 'Aparência',
            icon: Palette,
            color: 'text-purple-500',
            items: [
                { label: 'Tema', value: 'Escuro' },
                { label: 'Cor Primária', value: 'Verde' },
                { label: 'Fonte', value: 'Inter' }
            ]
        },
        {
            title: 'Dados e Privacidade',
            icon: Shield,
            color: 'text-accent-success',
            items: [
                { label: 'Backup Automático', value: 'Ativado' },
                { label: 'Sincronização', value: 'WiFi apenas' },
                { label: 'Análise de Dados', value: 'Ativado' }
            ]
        }
    ]

    return (
        <div className="space-y-xl pb-20">
            <div>
                <h1 className="text-h1 font-bold text-text-primary mb-sm">
                    ⚙️ Configurações
                </h1>
                <p className="text-body-lg text-text-secondary">
                    Personalize sua experiência no Vida Total
                </p>
            </div>

            {/* Perfil do Usuário */}
            <Card className="gradient-green-gold">
                <CardContent className="p-xl">
                    <div className="flex items-center gap-lg">
                        <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center">
                            <User className="text-white" size={40} />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-h3 font-bold text-white mb-1">
                                {user?.nome}
                            </h3>
                            <p className="text-body text-white/90 mb-2">
                                {user?.email}
                            </p>
                            <p className="text-caption text-white/80">
                                Membro desde {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : '-'}
                            </p>
                        </div>
                        <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
                            Editar Perfil
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Painel de Admin */}
            {isAdmin && (
                <Card className="border-emerald-500/30 bg-emerald-500/5">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-emerald-400">
                            <Shield size={24} />
                            Painel de Administração
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <h3 className="text-lg font-medium text-white">Gerenciamento de Usuários</h3>

                            {loadingUsers ? (
                                <p className="text-zinc-400">Carregando usuários...</p>
                            ) : (
                                <div className="space-y-2">
                                    {usersList.map((u) => (
                                        <div key={u.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-zinc-700 flex items-center justify-center">
                                                    <span className="text-xs font-bold text-white">
                                                        {u.nome.substring(0, 2).toUpperCase()}
                                                    </span>
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-white">
                                                        {u.nome} {u.id === user?.id && '(Você)'}
                                                    </p>
                                                    <p className="text-xs text-zinc-400">{u.email}</p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <span className={cn(
                                                    "text-xs px-2 py-1 rounded-full",
                                                    u.role === 'admin' ? "bg-purple-500/20 text-purple-400" : "bg-blue-500/20 text-blue-400"
                                                )}>
                                                    {u.role}
                                                </span>

                                                {u.id !== user?.id && (
                                                    u.aprovado ? (
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                                                            onClick={() => handleApproveUser(u.id, false)}
                                                        >
                                                            <X size={16} className="mr-1" />
                                                            Revogar
                                                        </Button>
                                                    ) : (
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            className="text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10"
                                                            onClick={() => handleApproveUser(u.id, true)}
                                                        >
                                                            <Check size={16} className="mr-1" />
                                                            Aprovar
                                                        </Button>
                                                    )
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Seções de Configurações */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-lg">
                {settingsSections.map((section) => {
                    const IconComponent = section.icon
                    return (
                        <Card key={section.title}>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <IconComponent className={section.color} size={24} />
                                    {section.title}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-md">
                                    {section.items.map((item, index) => (
                                        <div
                                            key={index}
                                            className="flex items-center justify-between p-md rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
                                        >
                                            <span className="text-body text-text-secondary">
                                                {item.label}
                                            </span>
                                            <div className="flex items-center gap-2">
                                                <span className="text-body font-medium text-text-primary">
                                                    {item.value}
                                                </span>
                                                <Settings className="text-text-tertiary" size={16} />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )
                })}
            </div>

            {/* Preferências Rápidas */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Settings className="text-primary-green" size={24} />
                        Preferências Rápidas
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-md">
                        <div className="p-lg rounded-lg bg-white/5 hover:bg-white/10 transition-colors cursor-pointer">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Bell className="text-primary-orange" size={20} />
                                    <span className="text-body text-text-primary">Notificações</span>
                                </div>
                                <button
                                    onClick={() => setNotifications(!notifications)}
                                    className={cn(
                                        "w-12 h-6 rounded-full transition-colors relative",
                                        notifications ? "bg-accent-success" : "bg-white/20"
                                    )}
                                >
                                    <div className={cn(
                                        "w-5 h-5 rounded-full bg-white absolute top-0.5 transition-transform",
                                        notifications ? "translate-x-6" : "translate-x-1"
                                    )} />
                                </button>
                            </div>
                        </div>

                        <div className="p-lg rounded-lg bg-white/5 hover:bg-white/10 transition-colors cursor-pointer">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Palette className="text-purple-500" size={20} />
                                    <span className="text-body text-text-primary">Tema Escuro</span>
                                </div>
                                <button
                                    onClick={() => setDarkMode(!darkMode)}
                                    className={cn(
                                        "w-12 h-6 rounded-full transition-colors relative",
                                        darkMode ? "bg-accent-success" : "bg-white/20"
                                    )}
                                >
                                    <div className={cn(
                                        "w-5 h-5 rounded-full bg-white absolute top-0.5 transition-transform",
                                        darkMode ? "translate-x-6" : "translate-x-1"
                                    )} />
                                </button>
                            </div>
                        </div>

                        <div className="p-lg rounded-lg bg-white/5 hover:bg-white/10 transition-colors cursor-pointer">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Globe className="text-accent-info" size={20} />
                                    <span className="text-body text-text-primary">Idioma</span>
                                </div>
                                <span className="text-body font-medium text-text-primary">
                                    PT-BR
                                </span>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Dados e Armazenamento */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Database className="text-primary-gold" size={24} />
                        Dados e Armazenamento
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-lg">
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-body text-text-secondary">Espaço Utilizado</span>
                                <span className="text-body font-bold text-text-primary">120 MB / 500 MB</span>
                            </div>
                            <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                                <div className="h-full bg-primary-gold" style={{ width: '24%' }} />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
                            <Button variant="outline" className="w-full">
                                <Database className="mr-2" size={16} />
                                Exportar Dados
                            </Button>
                            <Button variant="outline" className="w-full">
                                <Database className="mr-2" size={16} />
                                Importar Backup
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Sobre */}
            <Card>
                <CardHeader>
                    <CardTitle>Sobre o Vida Total</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-md">
                        <div className="flex items-center justify-between p-md rounded-lg hover:bg-white/5 transition-colors">
                            <span className="text-body text-text-secondary">Versão</span>
                            <span className="text-body font-medium text-text-primary">1.0.0</span>
                        </div>
                        <div className="flex items-center justify-between p-md rounded-lg hover:bg-white/5 transition-colors">
                            <span className="text-body text-text-secondary">Última Atualização</span>
                            <span className="text-body font-medium text-text-primary">29 Nov 2024</span>
                        </div>
                        <div className="flex items-center justify-between p-md rounded-lg hover:bg-white/5 transition-colors cursor-pointer">
                            <span className="text-body text-text-secondary">Termos de Uso</span>
                            <Settings className="text-text-tertiary" size={16} />
                        </div>
                        <div className="flex items-center justify-between p-md rounded-lg hover:bg-white/5 transition-colors cursor-pointer">
                            <span className="text-body text-text-secondary">Política de Privacidade</span>
                            <Settings className="text-text-tertiary" size={16} />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Sair */}
            <Button
                variant="outline"
                size="lg"
                className="w-full border-accent-error text-accent-error hover:bg-accent-error/10"
                onClick={handleLogout}
            >
                <LogOut className="mr-2" size={20} />
                Sair da Conta
            </Button>
        </div>
    )
}
