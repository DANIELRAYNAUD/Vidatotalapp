import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuthStore } from '@/lib/authStore';
import { Sparkle, Lock, Mail } from 'lucide-react';

const loginSchema = z.object({
    email: z.string().email('Email inválido'),
    senha: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
});

type LoginForm = z.infer<typeof loginSchema>;

export function Login() {
    const navigate = useNavigate();
    const login = useAuthStore((state) => state.login);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginForm>({
        resolver: zodResolver(loginSchema),
    });

    const onSubmit = async (data: LoginForm) => {
        setLoading(true);
        setError('');

        try {
            await login(data.email, data.senha);
            navigate('/');
        } catch (err: any) {
            const message = err.response?.data?.error || 'Erro ao fazer login';
            setError(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0d0d0d] flex items-center justify-center p-4">
            {/* Background decorativo */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-20 left-20 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
                <div className="absolute bottom-20 right-20 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl" />
            </div>

            {/* Card de Login */}
            <div className="relative w-full max-w-md">
                {/* Logo/Título */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center gap-3 mb-4">
                        <Sparkle className="w-10 h-10 text-emerald-400" />
                        <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-400 to-amber-400 bg-clip-text text-transparent">
                            Vida Total
                        </h1>
                    </div>
                    <p className="text-zinc-400 text-sm">
                        Gerencie todos os aspectos da sua vida
                    </p>
                </div>

                {/* Card Glassmorphism */}
                <div className="glass p-8 rounded-2xl border border-white/10">
                    <h2 className="text-2xl font-bold text-white mb-6">
                        Login
                    </h2>

                    {error && (
                        <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        {/* Email */}
                        <div>
                            <label className="block text-sm font-medium text-zinc-300 mb-2">
                                Email
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
                                <input
                                    {...register('email')}
                                    type="email"
                                    placeholder="seu@email.com"
                                    className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
                                />
                            </div>
                            {errors.email && (
                                <p className="mt-1 text-sm text-red-400">{errors.email.message}</p>
                            )}
                        </div>

                        {/* Senha */}
                        <div>
                            <label className="block text-sm font-medium text-zinc-300 mb-2">
                                Senha
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
                                <input
                                    {...register('senha')}
                                    type="password"
                                    placeholder="••••••••"
                                    className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
                                />
                            </div>
                            {errors.senha && (
                                <p className="mt-1 text-sm text-red-400">{errors.senha.message}</p>
                            )}
                        </div>

                        {/* Botão Submit */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 px-4 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-medium rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed mt-6"
                        >
                            {loading ? 'Entrando...' : 'Entrar'}
                        </button>
                    </form>

                    {/* Link para Registro */}
                    <div className="mt-6 pt-6 border-t border-white/10 text-center">
                        <p className="text-sm text-zinc-400">
                            Não tem uma conta?{' '}
                            <Link
                                to="/register"
                                className="text-emerald-400 hover:text-emerald-300 font-medium transition-colors"
                            >
                                Criar conta
                            </Link>
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <p className="text-center text-xs text-zinc-500 mt-6">
                    Desenvolvido com ❤️ para uma vida mais organizada
                </p>
            </div>
        </div>
    );
}
