-- CreateTable
CREATE TABLE "ServicoSenhor" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "data" DATETIME NOT NULL,
    "tipo" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "descricao" TEXT,
    "duracao" INTEGER,
    "valor" REAL,
    "reflexao" TEXT,
    "versiculo" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ServicoSenhor_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Meta" (
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
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Meta_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Meta" ("categoria", "createdAt", "descricao", "id", "marcos", "prazo", "status", "tarefasVinculadas", "titulo", "unidade", "updatedAt", "userId", "valorAtual", "valorMeta") SELECT "categoria", "createdAt", "descricao", "id", "marcos", "prazo", "status", "tarefasVinculadas", "titulo", "unidade", "updatedAt", "userId", "valorAtual", "valorMeta" FROM "Meta";
DROP TABLE "Meta";
ALTER TABLE "new_Meta" RENAME TO "Meta";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "ServicoSenhor_userId_idx" ON "ServicoSenhor"("userId");

-- CreateIndex
CREATE INDEX "ServicoSenhor_data_idx" ON "ServicoSenhor"("data");
