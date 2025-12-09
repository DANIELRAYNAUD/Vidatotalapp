import { Link, useLocation } from 'react-router-dom'
import {
    LayoutDashboard,
    CheckCircle,
    Calendar,
    Wallet,
    FolderKanban,
    Utensils,
    Dumbbell,
    Heart,
    Moon,
    BookOpen,
    Languages,
    GraduationCap,
    StickyNote,
    Brain,
    Target,
    Settings,
    Church,
    Stethoscope,
    Users,
    HeartHandshake,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface NavItem {
    nome: string
    icone: React.ElementType
    href: string
    cor: string
}

const navItems: NavItem[] = [
    { nome: 'Dashboard', icone: LayoutDashboard, href: '/', cor: 'text-accent-info' },
    { nome: 'Hábitos', icone: CheckCircle, href: '/habitos', cor: 'text-primary-green' },
    { nome: 'Agenda', icone: Calendar, href: '/agenda', cor: 'text-primary-blue' },
    { nome: 'Finanças', icone: Wallet, href: '/financas', cor: 'text-primary-gold' },
    { nome: 'Projetos', icone: FolderKanban, href: '/projetos', cor: 'text-primary-teal' },
    { nome: 'Alimentação', icone: Utensils, href: '/alimentacao', cor: 'text-accent-success' },
    { nome: 'Treinos', icone: Dumbbell, href: '/treinos', cor: 'text-primary-orange' },
    { nome: 'Saúde', icone: Heart, href: '/saude', cor: 'text-accent-error' },
    { nome: 'Sono', icone: Moon, href: '/sono', cor: 'text-purple-400' },
    { nome: 'Leitura', icone: BookOpen, href: '/leitura', cor: 'text-yellow-400' },
    { nome: 'Idiomas', icone: Languages, href: '/idiomas', cor: 'text-blue-400' },
    { nome: 'Estudos', icone: GraduationCap, href: '/estudos', cor: 'text-indigo-400' },
    { nome: 'Notas', icone: StickyNote, href: '/notas', cor: 'text-amber-400' },
    { nome: 'Foco', icone: Brain, href: '/foco', cor: 'text-pink-400' },
    { nome: 'Metas', icone: Target, href: '/metas', cor: 'text-violet-400' },
    { nome: 'Serviço ao Senhor', icone: Church, href: '/servico-senhor', cor: 'text-primary-green' },
    { nome: 'Serviço Médico', icone: Stethoscope, href: '/servico-medico', cor: 'text-accent-error' },
    { nome: 'Família', icone: Users, href: '/familia', cor: 'text-primary-teal' },
    { nome: 'Casamento', icone: HeartHandshake, href: '/casamento', cor: 'text-pink-400' },
]

export function Sidebar() {
    const location = useLocation()

    return (
        <aside className="w-64 h-screen glass-card border-r border-white/10 flex flex-col p-lg fixed left-0 top-0 z-50">
            {/* Logo e Título */}
            <div className="mb-2xl">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl gradient-green-gold flex items-center justify-center">
                        <Brain className="text-white" size={24} />
                    </div>
                    <div>
                        <h1 className="text-h3 font-bold text-text-primary">Vida Total</h1>
                        <p className="text-caption text-text-secondary">Gestão Completa</p>
                    </div>
                </div>
            </div>

            {/* Navegação */}
            <nav className="flex-1 overflow-y-auto">
                <ul className="space-y-xs">
                    {navItems.map((item) => {
                        const Icon = item.icone
                        const ativo = location.pathname === item.href

                        return (
                            <li key={item.href}>
                                <Link
                                    to={item.href}
                                    className={cn(
                                        'flex items-center gap-3 px-3 py-2 rounded-lg transition-all',
                                        ativo
                                            ? 'bg-white/10 text-text-primary shadow-md'
                                            : 'text-text-secondary hover:bg-white/5 hover:text-text-primary'
                                    )}
                                >
                                    <Icon className={cn('w-5 h-5', ativo && item.cor)} />
                                    <span className="text-body font-medium">{item.nome}</span>
                                </Link>
                            </li>
                        )
                    })}
                </ul>
            </nav>

            {/* Configurações */}
            <div className="mt-auto pt-lg border-t border-white/10">
                <Link
                    to="/configuracoes"
                    className="flex items-center gap-3 px-3 py-2 rounded-lg text-text-secondary hover:bg-white/5 hover:text-text-primary transition-all"
                >
                    <Settings className="w-5 h-5" />
                    <span className="text-body font-medium">Configurações</span>
                </Link>
            </div>
        </aside>
    )
}
