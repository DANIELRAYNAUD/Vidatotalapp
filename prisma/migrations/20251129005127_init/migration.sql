-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "avatarUrl" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Settings" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "tema" TEXT NOT NULL DEFAULT 'dark',
    "idioma" TEXT NOT NULL DEFAULT 'pt-BR',
    "fuso" TEXT NOT NULL DEFAULT 'America/Sao_Paulo',
    "moeda" TEXT NOT NULL DEFAULT 'BRL',
    "notificacoesAtivas" BOOLEAN NOT NULL DEFAULT true,
    "somAtivo" BOOLEAN NOT NULL DEFAULT true,
    "tipoMusicaFoco" TEXT NOT NULL DEFAULT 'classica',
    "pomodoroTrabalho" INTEGER NOT NULL DEFAULT 25,
    "pomodoroPausaCurta" INTEGER NOT NULL DEFAULT 5,
    "pomodoroPausaLonga" INTEGER NOT NULL DEFAULT 15,
    CONSTRAINT "Settings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Habito" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "descricao" TEXT,
    "icone" TEXT NOT NULL,
    "cor" TEXT NOT NULL,
    "categoria" TEXT NOT NULL,
    "frequencia" TEXT NOT NULL,
    "diasSemana" TEXT,
    "valorMeta" INTEGER NOT NULL DEFAULT 1,
    "lembrete" BOOLEAN NOT NULL DEFAULT false,
    "horarioLembrete" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Habito_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "RegistroHabito" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "habitoId" TEXT NOT NULL,
    "data" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completo" BOOLEAN NOT NULL DEFAULT false,
    "valor" INTEGER NOT NULL DEFAULT 1,
    "notas" TEXT,
    CONSTRAINT "RegistroHabito_habitoId_fkey" FOREIGN KEY ("habitoId") REFERENCES "Habito" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Evento" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "descricao" TEXT,
    "local" TEXT,
    "inicio" DATETIME NOT NULL,
    "fim" DATETIME NOT NULL,
    "diaInteiro" BOOLEAN NOT NULL DEFAULT false,
    "categoria" TEXT NOT NULL,
    "cor" TEXT NOT NULL,
    "recorrencia" TEXT,
    "lembretes" TEXT,
    "linkReuniao" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Evento_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Projeto" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "descricao" TEXT,
    "categoria" TEXT NOT NULL,
    "cor" TEXT NOT NULL,
    "gradiente" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ativo',
    "progresso" INTEGER NOT NULL DEFAULT 0,
    "dataInicio" DATETIME,
    "prazo" DATETIME,
    "orcamento" REAL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Projeto_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Tarefa" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "projetoId" TEXT,
    "titulo" TEXT NOT NULL,
    "descricao" TEXT,
    "status" TEXT NOT NULL DEFAULT 'fazer',
    "prioridade" TEXT NOT NULL DEFAULT 'normal',
    "prazo" DATETIME,
    "tags" TEXT,
    "tempoEstimado" INTEGER,
    "tempoReal" INTEGER,
    "tarefaPaiId" TEXT,
    "subtarefas" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "completadaEm" DATETIME,
    CONSTRAINT "Tarefa_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Tarefa_projetoId_fkey" FOREIGN KEY ("projetoId") REFERENCES "Projeto" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Conta" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "saldo" REAL NOT NULL,
    "moeda" TEXT NOT NULL DEFAULT 'BRL',
    "instituicao" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Transacao" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "contaId" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "valor" REAL NOT NULL,
    "categoria" TEXT NOT NULL,
    "descricao" TEXT,
    "data" DATETIME NOT NULL,
    "tags" TEXT,
    "receiptUrl" TEXT,
    "recorrente" BOOLEAN NOT NULL DEFAULT false,
    "recorrencia" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Transacao_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Orcamento" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "categoria" TEXT NOT NULL,
    "limite" REAL NOT NULL,
    "periodo" TEXT NOT NULL DEFAULT 'mensal',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Refeicao" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "data" DATETIME NOT NULL,
    "tipoRefeicao" TEXT NOT NULL,
    "alimentos" TEXT NOT NULL,
    "totalCalorias" REAL NOT NULL,
    "totalProteina" REAL NOT NULL,
    "totalCarbo" REAL NOT NULL,
    "totalGordura" REAL NOT NULL,
    "fotoUrl" TEXT,
    "notas" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Refeicao_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Receita" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "descricao" TEXT,
    "fotoUrl" TEXT,
    "tempoPreparo" INTEGER NOT NULL,
    "dificuldade" TEXT NOT NULL,
    "ingredientes" TEXT NOT NULL,
    "instrucoes" TEXT NOT NULL,
    "porcoes" INTEGER NOT NULL,
    "caloriasPorPorcao" REAL NOT NULL,
    "macrosPorPorcao" TEXT NOT NULL,
    "tags" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "PlanoTreino" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "descricao" TEXT,
    "tipo" TEXT NOT NULL,
    "diasPorSemana" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Treino" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "planoId" TEXT,
    "nome" TEXT NOT NULL,
    "data" DATETIME NOT NULL,
    "duracao" INTEGER NOT NULL,
    "exercicios" TEXT NOT NULL,
    "volumeTotal" REAL NOT NULL,
    "notas" TEXT,
    "completo" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Treino_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Exercicio" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nome" TEXT NOT NULL,
    "descricao" TEXT,
    "grupoMuscular" TEXT NOT NULL,
    "equipamento" TEXT NOT NULL,
    "dificuldade" TEXT NOT NULL,
    "videoUrl" TEXT,
    "instrucoes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "MetricaSaude" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "data" DATETIME NOT NULL,
    "tipo" TEXT NOT NULL,
    "valor" REAL NOT NULL,
    "unidade" TEXT NOT NULL,
    "contexto" TEXT,
    "notas" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "MetricaSaude_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Medicamento" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "dosagem" TEXT NOT NULL,
    "frequencia" TEXT NOT NULL,
    "dataInicio" DATETIME NOT NULL,
    "dataFim" DATETIME,
    "estoque" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "ConsultaMedica" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "especialidade" TEXT NOT NULL,
    "medico" TEXT,
    "local" TEXT,
    "dataHora" DATETIME NOT NULL,
    "notas" TEXT,
    "anexos" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "RegistroSono" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "data" DATETIME NOT NULL,
    "horaDormir" DATETIME NOT NULL,
    "horaAcordar" DATETIME NOT NULL,
    "duracao" INTEGER NOT NULL,
    "qualidade" INTEGER NOT NULL,
    "fases" TEXT,
    "interrupcoes" INTEGER NOT NULL DEFAULT 0,
    "fatores" TEXT,
    "notas" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "RegistroSono_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Livro" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "autor" TEXT NOT NULL,
    "isbn" TEXT,
    "capaUrl" TEXT,
    "categoria" TEXT NOT NULL,
    "tags" TEXT,
    "totalPaginas" INTEGER NOT NULL,
    "paginaAtual" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'ler',
    "avaliacao" INTEGER,
    "dataInicio" DATETIME,
    "dataFim" DATETIME,
    "notas" TEXT,
    "destaques" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Livro_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SessaoLeitura" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "livroId" TEXT NOT NULL,
    "data" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "duracao" INTEGER NOT NULL,
    "paginasLidas" INTEGER NOT NULL,
    "paginaInicio" INTEGER NOT NULL,
    "paginaFim" INTEGER NOT NULL,
    "notas" TEXT,
    CONSTRAINT "SessaoLeitura_livroId_fkey" FOREIGN KEY ("livroId") REFERENCES "Livro" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TrilhaAprendizado" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "assunto" TEXT NOT NULL,
    "nivel" TEXT NOT NULL,
    "progresso" INTEGER NOT NULL DEFAULT 0,
    "moduloAtual" TEXT,
    "sequencia" INTEGER NOT NULL DEFAULT 0,
    "metaDiaria" INTEGER NOT NULL DEFAULT 30,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "TrilhaAprendizado_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SessaoEstudo" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "trilhaId" TEXT NOT NULL,
    "data" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "duracao" INTEGER NOT NULL,
    "modulo" TEXT NOT NULL,
    "licao" TEXT NOT NULL,
    "pontuacao" INTEGER,
    "xpGanho" INTEGER NOT NULL DEFAULT 0,
    "notas" TEXT,
    CONSTRAINT "SessaoEstudo_trilhaId_fkey" FOREIGN KEY ("trilhaId") REFERENCES "TrilhaAprendizado" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Flashcard" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "assunto" TEXT NOT NULL,
    "baralho" TEXT NOT NULL,
    "frente" TEXT NOT NULL,
    "verso" TEXT NOT NULL,
    "dificuldade" INTEGER NOT NULL DEFAULT 0,
    "proximaRevisao" DATETIME NOT NULL,
    "vezesRevisado" INTEGER NOT NULL DEFAULT 0,
    "acertos" INTEGER NOT NULL DEFAULT 0,
    "tags" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Nota" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "conteudo" TEXT NOT NULL,
    "pastaId" TEXT,
    "tags" TEXT,
    "favorito" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Nota_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Nota_pastaId_fkey" FOREIGN KEY ("pastaId") REFERENCES "Pasta" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Pasta" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "cor" TEXT,
    "icone" TEXT,
    "pastaPaiId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "SessaoFoco" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "tipo" TEXT NOT NULL DEFAULT 'pomodoro',
    "inicio" DATETIME NOT NULL,
    "fim" DATETIME,
    "duracao" INTEGER,
    "tipoMusica" TEXT,
    "tarefaId" TEXT,
    "projetoId" TEXT,
    "completo" BOOLEAN NOT NULL DEFAULT false,
    "notas" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SessaoFoco_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MusicaFoco" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nome" TEXT NOT NULL,
    "artista" TEXT,
    "tipo" TEXT NOT NULL,
    "frequencia" TEXT,
    "duracao" INTEGER NOT NULL,
    "caminhoArquivo" TEXT NOT NULL,
    "tags" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Meta" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "categoria" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "descricao" TEXT,
    "valorMeta" REAL,
    "valorAtual" REAL,
    "unidade" TEXT,
    "prazo" DATETIME,
    "status" TEXT NOT NULL DEFAULT 'ativa',
    "marcos" TEXT,
    "tarefasVinculadas" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Settings_userId_key" ON "Settings"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "RegistroHabito_habitoId_data_key" ON "RegistroHabito"("habitoId", "data");
