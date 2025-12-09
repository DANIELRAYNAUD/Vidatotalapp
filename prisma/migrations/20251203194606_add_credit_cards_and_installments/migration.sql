-- CreateTable
CREATE TABLE "CartaoCredito" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "bandeira" TEXT NOT NULL,
    "limite" REAL NOT NULL,
    "diaFechamento" INTEGER NOT NULL,
    "diaVencimento" INTEGER NOT NULL,
    "cor" TEXT NOT NULL DEFAULT 'bg-blue-500',
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Transacao" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "contaId" TEXT,
    "cartaoId" TEXT,
    "tipo" TEXT NOT NULL,
    "valor" REAL NOT NULL,
    "categoria" TEXT NOT NULL,
    "descricao" TEXT,
    "data" DATETIME NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'efetivada',
    "isParcelada" BOOLEAN NOT NULL DEFAULT false,
    "numeroParcela" INTEGER,
    "totalParcelas" INTEGER,
    "grupoParcelasId" TEXT,
    "mesReferencia" TEXT,
    "tags" TEXT,
    "receiptUrl" TEXT,
    "recorrente" BOOLEAN NOT NULL DEFAULT false,
    "recorrencia" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Transacao_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Transacao_contaId_fkey" FOREIGN KEY ("contaId") REFERENCES "Conta" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Transacao_cartaoId_fkey" FOREIGN KEY ("cartaoId") REFERENCES "CartaoCredito" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Transacao" ("categoria", "contaId", "createdAt", "data", "descricao", "id", "receiptUrl", "recorrencia", "recorrente", "tags", "tipo", "updatedAt", "userId", "valor") SELECT "categoria", "contaId", "createdAt", "data", "descricao", "id", "receiptUrl", "recorrencia", "recorrente", "tags", "tipo", "updatedAt", "userId", "valor" FROM "Transacao";
DROP TABLE "Transacao";
ALTER TABLE "new_Transacao" RENAME TO "Transacao";
CREATE INDEX "Transacao_userId_data_idx" ON "Transacao"("userId", "data");
CREATE INDEX "Transacao_cartaoId_mesReferencia_idx" ON "Transacao"("cartaoId", "mesReferencia");
CREATE INDEX "Transacao_grupoParcelasId_idx" ON "Transacao"("grupoParcelasId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "CartaoCredito_userId_idx" ON "CartaoCredito"("userId");
