-- CreateTable
CREATE TABLE "EmpresaMedica" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "cnpj" TEXT,
    "endereco" TEXT,
    "contato" TEXT,
    "telefone" TEXT,
    "email" TEXT,
    "responsavel" TEXT,
    "diaPagamento" INTEGER NOT NULL,
    "emiteNota" BOOLEAN NOT NULL DEFAULT false,
    "valorPadrao" REAL,
    "observacoes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "PlantaoMedico" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "empresaId" TEXT NOT NULL,
    "data" DATETIME NOT NULL,
    "blocoHorario" TEXT NOT NULL,
    "tipoServico" TEXT NOT NULL,
    "valor" REAL NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'agendado',
    "numAtendimentos" INTEGER,
    "observacoes" TEXT,
    "transacaoId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "PlantaoMedico_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "EmpresaMedica" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MembroFamilia" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "relacao" TEXT NOT NULL,
    "dataNascimento" DATETIME NOT NULL,
    "fotoUrl" TEXT,
    "personalidade" TEXT,
    "interesses" TEXT,
    "escolaId" TEXT,
    "serie" TEXT,
    "professor" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "MembroFamilia_escolaId_fkey" FOREIGN KEY ("escolaId") REFERENCES "Escola" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Escola" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "endereco" TEXT,
    "telefone" TEXT,
    "email" TEXT,
    "site" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "BoletimEscolar" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "membroFamiliaId" TEXT NOT NULL,
    "periodo" TEXT NOT NULL,
    "numero" INTEGER NOT NULL,
    "ano" INTEGER NOT NULL,
    "arquivoUrl" TEXT,
    "notas" TEXT NOT NULL,
    "comentarios" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "BoletimEscolar_membroFamiliaId_fkey" FOREIGN KEY ("membroFamiliaId") REFERENCES "MembroFamilia" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ConsultaMedicaFamilia" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "membroFamiliaId" TEXT NOT NULL,
    "dataHora" DATETIME NOT NULL,
    "especialidade" TEXT NOT NULL,
    "medico" TEXT,
    "local" TEXT,
    "telefone" TEXT,
    "motivo" TEXT,
    "observacoes" TEXT,
    "retorno" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ConsultaMedicaFamilia_membroFamiliaId_fkey" FOREIGN KEY ("membroFamiliaId") REFERENCES "MembroFamilia" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ExameFamilia" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "membroFamiliaId" TEXT NOT NULL,
    "data" DATETIME NOT NULL,
    "tipoExame" TEXT NOT NULL,
    "resultado" TEXT,
    "arquivoUrl" TEXT,
    "observacoes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ExameFamilia_membroFamiliaId_fkey" FOREIGN KEY ("membroFamiliaId") REFERENCES "MembroFamilia" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TerapiaFamilia" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "membroFamiliaId" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "profissional" TEXT NOT NULL,
    "local" TEXT,
    "telefone" TEXT,
    "diaHorario" TEXT NOT NULL,
    "dataInicio" DATETIME NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "progresso" TEXT,
    "observacoes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "TerapiaFamilia_membroFamiliaId_fkey" FOREIGN KEY ("membroFamiliaId") REFERENCES "MembroFamilia" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Funcionario" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "cpf" TEXT,
    "contato" TEXT,
    "endereco" TEXT,
    "diasTrabalho" TEXT NOT NULL,
    "horario" TEXT NOT NULL,
    "salario" REAL NOT NULL,
    "dataAdmissao" DATETIME NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "observacoes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Pet" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "especie" TEXT NOT NULL,
    "raca" TEXT,
    "dataNascimento" DATETIME,
    "fotoUrl" TEXT,
    "sexo" TEXT,
    "cor" TEXT,
    "peso" REAL,
    "veterinario" TEXT,
    "telefoneVet" TEXT,
    "observacoes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "CuidadoPet" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "petId" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "data" DATETIME NOT NULL,
    "descricao" TEXT NOT NULL,
    "veterinario" TEXT,
    "proximaData" DATETIME,
    "valor" REAL,
    "observacoes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "CuidadoPet_petId_fkey" FOREIGN KEY ("petId") REFERENCES "Pet" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "RelacionamentoCasal" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "data" DATETIME NOT NULL,
    "qualidade" INTEGER NOT NULL,
    "tempoJuntos" INTEGER,
    "atividadeFeita" TEXT,
    "conversaMeaningful" BOOLEAN NOT NULL DEFAULT false,
    "reflexao" TEXT,
    "gratidao" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "MetaCasal" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "descricao" TEXT,
    "categoria" TEXT NOT NULL,
    "prazo" DATETIME,
    "status" TEXT NOT NULL DEFAULT 'ativa',
    "progresso" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "NotaApreciacao" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "data" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "tipo" TEXT NOT NULL,
    "conteudo" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "EventoCasal" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "data" DATETIME NOT NULL,
    "tipo" TEXT NOT NULL,
    "local" TEXT,
    "descricao" TEXT,
    "fotoUrl" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE INDEX "EmpresaMedica_userId_idx" ON "EmpresaMedica"("userId");

-- CreateIndex
CREATE INDEX "PlantaoMedico_userId_data_idx" ON "PlantaoMedico"("userId", "data");

-- CreateIndex
CREATE INDEX "MembroFamilia_userId_idx" ON "MembroFamilia"("userId");

-- CreateIndex
CREATE INDEX "Escola_userId_idx" ON "Escola"("userId");

-- CreateIndex
CREATE INDEX "BoletimEscolar_membroFamiliaId_idx" ON "BoletimEscolar"("membroFamiliaId");

-- CreateIndex
CREATE INDEX "ConsultaMedicaFamilia_membroFamiliaId_idx" ON "ConsultaMedicaFamilia"("membroFamiliaId");

-- CreateIndex
CREATE INDEX "ExameFamilia_membroFamiliaId_idx" ON "ExameFamilia"("membroFamiliaId");

-- CreateIndex
CREATE INDEX "TerapiaFamilia_membroFamiliaId_idx" ON "TerapiaFamilia"("membroFamiliaId");

-- CreateIndex
CREATE INDEX "Funcionario_userId_idx" ON "Funcionario"("userId");

-- CreateIndex
CREATE INDEX "Pet_userId_idx" ON "Pet"("userId");

-- CreateIndex
CREATE INDEX "CuidadoPet_petId_idx" ON "CuidadoPet"("petId");

-- CreateIndex
CREATE INDEX "RelacionamentoCasal_userId_data_idx" ON "RelacionamentoCasal"("userId", "data");

-- CreateIndex
CREATE INDEX "MetaCasal_userId_idx" ON "MetaCasal"("userId");

-- CreateIndex
CREATE INDEX "NotaApreciacao_userId_idx" ON "NotaApreciacao"("userId");

-- CreateIndex
CREATE INDEX "EventoCasal_userId_data_idx" ON "EventoCasal"("userId", "data");
