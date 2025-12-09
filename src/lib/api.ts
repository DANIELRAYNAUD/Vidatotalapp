import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
})

// Interceptor de request - adiciona token automaticamente
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('auth_token')
        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`
        }
        return config
    },
    (error) => {
        return Promise.reject(error)
    }
)

// Interceptor de response - trata erros 401 (logout automático)
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('auth_token')
            localStorage.removeItem('auth_user')
            window.location.href = '/login'
        }
        return Promise.reject(error)
    }
)

// ===== AUTH =====
export const authAPI = {
    register: (data: { email: string; nome: string; senha: string }) =>
        api.post('/auth/register', data),
    login: (data: { email: string; senha: string }) =>
        api.post('/auth/login', data),
    me: () =>
        api.get('/auth/me'),
    getUsers: () =>
        api.get('/auth/users'),
    approveUser: (userId: string, aprovado: boolean) =>
        api.patch(`/auth/users/${userId}/approve`, { aprovado }),
}

// ===== HÁBITOS =====
export const habitosAPI = {
    listar: () => api.get('/habitos'),
    criar: (data: any) => api.post('/habitos', data),
    atualizar: (id: string, data: any) => api.put(`/habitos/${id}`, data),
    deletar: (id: string) => api.delete(`/habitos/${id}`),
    toggle: (id: string, data?: any) => api.post(`/habitos/${id}/toggle`, data || {}),
    estatisticas: () => api.get('/habitos/stats/overview'),
    listarRegistros: (id: string, dataInicio?: string, dataFim?: string) => {
        const params = new URLSearchParams()
        if (dataInicio) params.append('dataInicio', dataInicio)
        if (dataFim) params.append('dataFim', dataFim)
        return api.get(`/habitos/${id}/registros?${params}`)
    },
}

// ===== SAÚDE =====
export const saudeAPI = {
    listarMetricas: (filtros?: { tipo?: string; dataInicio?: string; dataFim?: string }) => {
        const params = new URLSearchParams()
        if (filtros?.tipo) params.append('tipo', filtros.tipo)
        if (filtros?.dataInicio) params.append('dataInicio', filtros.dataInicio)
        if (filtros?.dataFim) params.append('dataFim', filtros.dataFim)
        return api.get(`/saude/metricas?${params}`)
    },
    criarMetrica: (data: any) => api.post('/saude/metricas', data),
    deletarMetrica: (id: string) => api.delete(`/saude/metricas/${id}`),
    listarMedicamentos: () => api.get('/saude/medicamentos'),
    criarMedicamento: (data: any) => api.post('/saude/medicamentos', data),
    atualizarMedicamento: (id: string, data: any) => api.put(`/saude/medicamentos/${id}`, data),
    deletarMedicamento: (id: string) => api.delete(`/saude/medicamentos/${id}`),
    listarConsultas: () => api.get('/saude/consultas'),
    criarConsulta: (data: any) => api.post('/saude/consultas', data),
}

// ===== LEITURA =====
export const leituraAPI = {
    listarLivros: (status?: string) => {
        const params = new URLSearchParams()
        if (status) params.append('status', status)
        return api.get(`/leitura?${params}`)
    },
    obterLivro: (id: string) => api.get(`/leitura/${id}`),
    criarLivro: (data: any) => api.post('/leitura', data),
    atualizarLivro: (id: string, data: any) => api.put(`/leitura/${id}`, data),
    deletarLivro: (id: string) => api.delete(`/leitura/${id}`),
    atualizarProgresso: (id: string, paginaAtual: number) =>
        api.patch(`/leitura/${id}/progresso`, { paginaAtual }),
    listarSessoes: (livroId: string) => api.get(`/leitura/${livroId}/sessoes`),
    criarSessao: (livroId: string, data: any) => api.post(`/leitura/${livroId}/sessoes`, data),
}

// ===== AGENDA =====
export const agendaAPI = {
    listar: (filtros?: { inicio?: string; fim?: string; categoria?: string }) => {
        const params = new URLSearchParams()
        if (filtros?.inicio) params.append('inicio', filtros.inicio)
        if (filtros?.fim) params.append('fim', filtros.fim)
        if (filtros?.categoria) params.append('categoria', filtros.categoria)
        return api.get(`/agenda?${params}`)
    },
    // Busca eventos agregados de todos os módulos (plantões, tarefas, consultas, finanças)
    listarTodos: (filtros?: { inicio?: string; fim?: string }) => {
        const params = new URLSearchParams()
        if (filtros?.inicio) params.append('inicio', filtros.inicio)
        if (filtros?.fim) params.append('fim', filtros.fim)
        return api.get(`/agenda/todos?${params}`)
    },
    criar: (data: any) => api.post('/agenda', data),
    atualizar: (id: string, data: any) => api.put(`/agenda/${id}`, data),
    deletar: (id: string) => api.delete(`/agenda/${id}`),
}

// ===== FINANÇAS =====
export const financasAPI = {
    listarContas: () => api.get('/financas/contas'),
    criarConta: (data: any) => api.post('/financas/contas', data),
    atualizarConta: (id: string, data: any) => api.put(`/financas/contas/${id}`, data),
    deletarConta: (id: string) => api.delete(`/financas/contas/${id}`),
    listarTransacoes: (filtros?: {
        contaId?: string
        inicio?: string
        fim?: string
        tipo?: string
        categoria?: string
    }) => {
        const params = new URLSearchParams()
        if (filtros?.contaId) params.append('contaId', filtros.contaId)
        if (filtros?.inicio) params.append('inicio', filtros.inicio)
        if (filtros?.fim) params.append('fim', filtros.fim)
        if (filtros?.tipo) params.append('tipo', filtros.tipo)
        if (filtros?.categoria) params.append('categoria', filtros.categoria)
        return api.get(`/financas/transacoes?${params}`)
    },
    criarTransacao: (data: any) => api.post('/financas/transacoes', data),
    deletarTransacao: (id: string) => api.delete(`/financas/transacoes/${id}`),
    listarOrcamentos: () => api.get('/financas/orcamentos'),
    criarOrcamento: (data: any) => api.post('/financas/orcamentos', data),
    deletarOrcamento: (id: string) => api.delete(`/financas/orcamentos/${id}`),

    // Cartões de Crédito
    listarCartoes: () => api.get('/financas/cartoes'),
    criarCartao: (data: any) => api.post('/financas/cartoes', data),
    atualizarCartao: (id: string, data: any) => api.put(`/financas/cartoes/${id}`, data),
    deletarCartao: (id: string) => api.delete(`/financas/cartoes/${id}`),

    // Parcelamento
    criarParcelamento: (data: any) => api.post('/financas/parcelar', data),
    buscarFatura: (mesReferencia: string) => api.get(`/financas/faturas/${mesReferencia}`),

    // Dashboard consolidado
    resumo: () => api.get('/financas/resumo'),
    transacoesVinculadas: (modulo?: string) => {
        const params = new URLSearchParams()
        if (modulo) params.append('modulo', modulo)
        return api.get(`/financas/transacoes-vinculadas?${params}`)
    },
    resumoCategorias: (mes?: string) => {
        const params = new URLSearchParams()
        if (mes) params.append('mes', mes)
        return api.get(`/financas/categorias?${params}`)
    },
}


// ===== PROJETOS =====
export const projetosAPI = {
    listar: (filtros?: { status?: string; categoria?: string }) => {
        const params = new URLSearchParams()
        if (filtros?.status) params.append('status', filtros.status)
        if (filtros?.categoria) params.append('categoria', filtros.categoria)
        return api.get(`/projetos?${params}`)
    },
    obter: (id: string) => api.get(`/projetos/${id}`),
    criar: (data: any) => api.post('/projetos', data),
    atualizar: (id: string, data: any) => api.put(`/projetos/${id}`, data),
    deletar: (id: string) => api.delete(`/projetos/${id}`),
    listarTarefas: (projetoId: string) => api.get(`/projetos/${projetoId}/tarefas`),
    criarTarefa: (data: any) => api.post('/projetos/tarefas', data),
    atualizarTarefa: (id: string, data: any) => api.put(`/projetos/tarefas/${id}`, data),
    deletarTarefa: (id: string) => api.delete(`/projetos/tarefas/${id}`),
}

// ===== ALIMENTAÇÃO =====
export const alimentacaoAPI = {
    listarRefeicoes: (data?: string) => {
        const params = new URLSearchParams()
        if (data) params.append('data', data)
        return api.get(`/alimentacao/refeicoes?${params}`)
    },
    criarRefeicao: (data: any) => api.post('/alimentacao/refeicoes', data),
    deletarRefeicao: (id: string) => api.delete(`/alimentacao/refeicoes/${id}`),
}

// ===== TREINOS =====
export const treinosAPI = {
    listar: (filtros?: { dataInicio?: string; dataFim?: string }) => {
        const params = new URLSearchParams()
        if (filtros?.dataInicio) params.append('dataInicio', filtros.dataInicio)
        if (filtros?.dataFim) params.append('dataFim', filtros.dataFim)
        return api.get(`/treinos?${params}`)
    },
    criar: (data: any) => api.post('/treinos', data),
    deletar: (id: string) => api.delete(`/treinos/${id}`),
}

// ===== SONO =====
export const sonoAPI = {
    listar: (filtros?: { dataInicio?: string; dataFim?: string }) => {
        const params = new URLSearchParams()
        if (filtros?.dataInicio) params.append('dataInicio', filtros.dataInicio)
        if (filtros?.dataFim) params.append('dataFim', filtros.dataFim)
        return api.get(`/sono?${params}`)
    },
    criar: (data: any) => api.post('/sono', data),
    deletar: (id: string) => api.delete(`/sono/${id}`),
}

// ===== ESTUDOS =====
export const estudosAPI = {
    listar: () => api.get('/estudos'),
    criar: (data: any) => api.post('/estudos', data),
    atualizar: (id: string, data: any) => api.put(`/estudos/${id}`, data),
    deletar: (id: string) => api.delete(`/estudos/${id}`),
    listarSessoes: (cursoId: string) => api.get(`/estudos/${cursoId}/sessoes`),
    criarSessao: (cursoId: string, data: any) => api.post(`/estudos/${cursoId}/sessoes`, data),
}

// ===== NOTAS =====
export const notasAPI = {
    listar: (filtros?: { categoria?: string; tags?: string[] }) => {
        const params = new URLSearchParams()
        if (filtros?.categoria) params.append('categoria', filtros.categoria)
        if (filtros?.tags) filtros.tags.forEach(tag => params.append('tags', tag))
        return api.get(`/notas?${params}`)
    },
    criar: (data: any) => api.post('/notas', data),
    atualizar: (id: string, data: any) => api.put(`/notas/${id}`, data),
    deletar: (id: string) => api.delete(`/notas/${id}`),
}

// ===== FOCO =====
export const focoAPI = {
    listarSessoes: (filtros?: { dataInicio?: string; dataFim?: string }) => {
        const params = new URLSearchParams()
        if (filtros?.dataInicio) params.append('dataInicio', filtros.dataInicio)
        if (filtros?.dataFim) params.append('dataFim', filtros.dataFim)
        return api.get(`/foco/sessoes?${params}`)
    },
    criarSessao: (data: any) => api.post('/foco/sessoes', data),
    atualizarSessao: (id: string, data: any) => api.put(`/foco/sessoes/${id}`, data),
}

// ===== METAS =====
export const metasAPI = {
    listar: (filtros?: { status?: string; categoria?: string }) => {
        const params = new URLSearchParams()
        if (filtros?.status) params.append('status', filtros.status)
        if (filtros?.categoria) params.append('categoria', filtros.categoria)
        return api.get(`/metas?${params}`)
    },
    criar: (data: any) => api.post('/metas', data),
    atualizar: (id: string, data: any) => api.put(`/metas/${id}`, data),
    deletar: (id: string) => api.delete(`/metas/${id}`),
    atualizarProgresso: (id: string, progresso: number) =>
        api.patch(`/metas/${id}/progresso`, { progresso }),
}

// ===== SERVIÇO AO SENHOR =====
export const servicoAPI = {
    listar: () => api.get('/servico'),
    criar: (data: any) => api.post('/servico', data),
    atualizar: (id: string, data: any) => api.put(`/servico/${id}`, data),
    deletar: (id: string) => api.delete(`/servico/${id}`),
    estatisticas: () => api.get('/servico/stats'),
}

// ===== SERVIÇO MÉDICO =====
export const servicoMedicoAPI = {
    listarEmpresas: () => api.get('/servico-medico/empresas'),
    criarEmpresa: (data: any) => api.post('/servico-medico/empresas', data),
    atualizarEmpresa: (id: string, data: any) => api.put(`/servico-medico/empresas/${id}`, data),
    deletarEmpresa: (id: string) => api.delete(`/servico-medico/empresas/${id}`),
    listarPlantoes: () => api.get('/servico-medico/plantoes'),
    criarPlantao: (data: any) => api.post('/servico-medico/plantoes', data),
    atualizarPlantao: (id: string, data: any) => api.put(`/servico-medico/plantoes/${id}`, data),
    deletarPlantao: (id: string) => api.delete(`/servico-medico/plantoes/${id}`),
    estatisticas: () => api.get('/servico-medico/stats'),
}

// ===== FAMÍLIA =====
export const familiaAPI = {
    listarMembros: () => api.get('/familia/membros'),
    criarMembro: (data: any) => api.post('/familia/membros', data),
    atualizarMembro: (id: string, data: any) => api.put(`/familia/membros/${id}`, data),
    listarEscolas: () => api.get('/familia/escolas'),
    criarEscola: (data: any) => api.post('/familia/escolas', data),
    listarBoletins: (membroId: string) => api.get(`/familia/boletins?membroId=${membroId}`),
    criarBoletim: (data: any) => api.post('/familia/boletins', data),
    listarConsultas: () => api.get('/familia/consultas'),
    criarConsulta: (data: any) => api.post('/familia/consultas', data),
    listarTerapias: () => api.get('/familia/terapias'),
    criarTerapia: (data: any) => api.post('/familia/terapias', data),
    listarFuncionarios: () => api.get('/familia/funcionarios'),
    criarFuncionario: (data: any) => api.post('/familia/funcionarios', data),
    listarPets: () => api.get('/familia/pets'),
    criarPet: (data: any) => api.post('/familia/pets', data),
    criarCuidadoPet: (data: any) => api.post('/familia/cuidados-pet', data),
}

// ===== CASAMENTO =====
export const casamentoAPI = {
    listarCheckins: () => api.get('/casamento/checkins'),
    criarCheckin: (data: any) => api.post('/casamento/checkins', data),
    listarMetas: () => api.get('/casamento/metas'),
    criarMeta: (data: any) => api.post('/casamento/metas', data),
    atualizarMeta: (id: string, data: any) => api.put(`/casamento/metas/${id}`, data),
    listarNotas: () => api.get('/casamento/notas'),
    criarNota: (data: any) => api.post('/casamento/notas', data),
    listarEventos: () => api.get('/casamento/eventos'),
    criarEvento: (data: any) => api.post('/casamento/eventos', data),
    estatisticas: () => api.get('/casamento/stats'),
}

export default api
