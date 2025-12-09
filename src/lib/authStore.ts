import { create } from 'zustand';
import { authAPI } from './api';

export interface User {
    id: string;
    email: string;
    nome: string;
    role: string;
    aprovado: boolean;
    avatarUrl?: string;
    createdAt: string;
}

interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    isAdmin: boolean;

    // Actions
    login: (email: string, senha: string) => Promise<void>;
    register: (data: { email: string; nome: string; senha: string }) => Promise<void>;
    logout: () => void;
    checkAuth: () => Promise<void>;
    setUser: (user: User | null) => void;
    setToken: (token: string | null) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
    user: null,
    token: localStorage.getItem('auth_token'),
    isAuthenticated: false,
    isAdmin: false,

    login: async (email: string, senha: string) => {
        try {
            const response = await authAPI.login({ email, senha });
            const { token, user } = response.data as any;

            // Salvar no localStorage
            localStorage.setItem('auth_token', token);
            localStorage.setItem('auth_user', JSON.stringify(user));

            // Atualizar estado
            set({
                token,
                user,
                isAuthenticated: true,
                isAdmin: user.role === 'admin',
            });
        } catch (error: any) {
            // Limpar estado em caso de erro
            localStorage.removeItem('auth_token');
            localStorage.removeItem('auth_user');
            set({
                token: null,
                user: null,
                isAuthenticated: false,
                isAdmin: false,
            });

            // Propagar erro para o componente mostrar mensagem
            throw error;
        }
    },

    register: async (data: { email: string; nome: string; senha: string }) => {
        try {
            await authAPI.register(data);
            // Não fazer login automaticamente - usuário precisa de aprovação
        } catch (error) {
            throw error;
        }
    },

    logout: () => {
        // Limpar localStorage
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');

        // Limpar estado
        set({
            token: null,
            user: null,
            isAuthenticated: false,
            isAdmin: false,
        });
    },

    checkAuth: async () => {
        const token = localStorage.getItem('auth_token');

        if (!token) {
            get().logout();
            return;
        }

        try {
            const response = await authAPI.me();
            const user = response.data as User;

            set({
                user,
                token,
                isAuthenticated: true,
                isAdmin: user.role === 'admin',
            });
        } catch (error) {
            // Token inválido
            get().logout();
        }
    },

    setUser: (user: User | null) => {
        set({
            user,
            isAuthenticated: !!user,
            isAdmin: user?.role === 'admin',
        });
    },

    setToken: (token: string | null) => {
        if (token) {
            localStorage.setItem('auth_token', token);
        } else {
            localStorage.removeItem('auth_token');
        }
        set({ token });
    },
}));
