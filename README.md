# 🚀 Vida Total - Aplicativo de Gestão de Vida Completa

Um aplicativo moderno e completo para gerenciar todos os aspectos da sua vida: hábitos, saúde, finanças, projetos, aprendizado e muito mais!

## ✨ Funcionalidades

### 📊 Dashboard
- Pontuação geral de vida
- Progresso em todas as áreas
- Ações rápidas

### ✅ Hábitos
- Rastreamento diário
- Sequências (streaks)
- Lembretes personalizados

### 📅 Agenda
- Calendário de eventos
- Integração com Google Calendar
- Lembretes

### 💰 Finanças
- Controle de receitas e despesas
- Orçamentos por categoria
- Relatórios financeiros

### 📁 Projetos & Tarefas
- Gestão de projetos
- Kanban boards
- Rastreamento de tempo

### 🍽️ Alimentação
- Diário de refeições
- Contagem de macros
- Receitas favoritas

### 💪 Treinos
- Planos de treino
- Registro de exercícios
- Progresso ao longo do tempo

### ❤️ Saúde
- Métricas de saúde
- Medicamentos
- Consultas médicas

### 🌙 Sono
- Registro de sono
- Análise de qualidade
- Padrões de sono

### 📚 Leitura
- Biblioteca pessoal
- Sessões de leitura
- Metas anuais

### 🗣️ Idiomas
- Flashcards
- Exercícios
- Progresso por nível

### 🎓 Estudos
- Trilhas de aprendizado
- Sessões de estudo
- Sistema de XP

### 📝 Notas
- Editor rich text
- Organização em pastas
- Tags e busca

### 🧠 Foco & Flow State
- **Pomodoro Timer** com animação circular
- **Audio Mixer** com múltiplas camadas:
  - Música clássica 432Hz
  - Lo-fi hip hop
  - Binaural beats (foco, relaxamento)
  - Sons da natureza
  - Ruído branco/rosa/marrom
- Registro de sessões de foco

### 🎯 Metas
- Metas de longo prazo
- Marcos e progresso
- Vinculação com tarefas

## 🛠️ Tecnologias

- **Frontend**: React 18 + TypeScript
- **Build**: Vite 5+
- **Styling**: Tailwind CSS 3.4+ (dark mode nativo)
- **UI Components**: Radix UI
- **Icons**: Lucide React + Phosphor Icons
- **Animations**: Framer Motion
- **Charts**: Recharts
- **State**: Zustand
- **Forms**: React Hook Form + Zod
- **Database**: SQLite + Prisma ORM
- **Audio**: Howler.js

## 🚀 Começando

### Pré-requisitos

- Node.js 18+ 
- npm ou yarn

### Instalação

```bash
# Instalar dependências
npm install

# Inicializar banco de dados
npx prisma migrate dev

# Gerar Prisma Client
npx prisma generate

# Iniciar servidor de desenvolvimento
npm run dev
```

O aplicativo estará disponível em `http://localhost:5173`

### Build para Produção

```bash
npm run build
npm run preview
```

## 🎨 Design System

### Cores

- **Background**: `#0d0d0d` (dark)
- **Cards**: `rgba(26, 26, 26, 0.7)` com glassmorphism
- **Primary Colors**: Verde, Dourado, Teal, Laranja, Azul
- **Accent**: Success, Warning, Error, Info

### Tipografia

- **Display**: 64px (bold)
- **H1**: 48px
- **H2**: 32px
- **H3**: 24px
- **Body**: 14-16px
- **Caption**: 12px

### Efeitos

- **Glassmorphism**: `backdrop-blur(20px)`
- **Shadows**: Sombras suaves para profundidade
- **Gradients**: Gradientes personalizados por módulo

## 📦 Estrutura do Projeto

```
vida-total/
├── prisma/
│   └── schema.prisma          # Schema do banco de dados
├── src/
│   ├── components/
│   │   ├── ui/                # Componentes UI base
│   │   ├── layout/            # Layout (Sidebar, Header)
│   │   └── modules/           # Componentes de módulos
│   ├── lib/
│   │   ├── db/                # Prisma client
│   │   └── utils.ts           # Utilitários
│   ├── pages/                 # Páginas das rotas
│   ├── App.tsx                # App principal
│   ├── main.tsx               # Entry point
│   └── index.css              # Estilos globais
├── package.json
├── tailwind.config.js
├── vite.config.ts
└── README.md
```

## 🔮 Roadmap

- [ ] ✅ **Fase 1**: Fundação e design system (COMPLETO)
- [ ] 📱 **Fase 2**: Módulos principais (Dashboard, Hábitos, Foco)
- [ ] 💾 **Fase 3**: Integração completa com banco de dados
- [ ] 🤖 **Fase 4**: IA com Ollama/Gemini Nano
- [ ] ☁️ **Fase 5**: Sync na nuvem com Supabase
- [ ] 📊 **Fase 6**: Analytics avançado
- [ ] 🎮 **Fase 7**: Gamificação (XP, níveis, badges)
- [ ] 🔌 **Fase 8**: Integrações externas (Google Calendar, Spotify, etc)

## 📄 Licença

MIT

## 👤 Autor

Daniel Raynaud

---

**Feito com ❤️ e muito ☕**
