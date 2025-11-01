-- AlterTable
ALTER TABLE "pedidos" ADD COLUMN     "cliente_id" INTEGER,
ADD COLUMN     "dailyNumber" INTEGER;

-- CreateTable
CREATE TABLE "clientes" (
    "id" SERIAL NOT NULL,
    "nome" VARCHAR(200) NOT NULL,
    "telefone" VARCHAR(20) NOT NULL,
    "email" VARCHAR(200),
    "data_nascimento" DATE,
    "cpf" VARCHAR(100),
    "endereco" TEXT,
    "complemento" VARCHAR(200),
    "bairro" VARCHAR(100),
    "cidade" VARCHAR(100),
    "uf" VARCHAR(2),
    "cep" VARCHAR(10),
    "aceita_whatsapp" BOOLEAN NOT NULL DEFAULT true,
    "aceita_email" BOOLEAN NOT NULL DEFAULT false,
    "aceita_promocoes" BOOLEAN NOT NULL DEFAULT true,
    "consentimento_data" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "clientes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "daily_order_counters" (
    "date" TEXT NOT NULL,
    "last" INTEGER NOT NULL,

    CONSTRAINT "daily_order_counters_pkey" PRIMARY KEY ("date")
);

-- CreateIndex
CREATE UNIQUE INDEX "clientes_telefone_key" ON "clientes"("telefone");

-- CreateIndex
CREATE INDEX "clientes_telefone_idx" ON "clientes"("telefone");

-- CreateIndex
CREATE INDEX "clientes_data_nascimento_idx" ON "clientes"("data_nascimento");

-- CreateIndex
CREATE INDEX "clientes_email_idx" ON "clientes"("email");

-- CreateIndex
CREATE INDEX "pedidos_cliente_id_idx" ON "pedidos"("cliente_id");

-- AddForeignKey
ALTER TABLE "pedidos" ADD CONSTRAINT "pedidos_cliente_id_fkey" FOREIGN KEY ("cliente_id") REFERENCES "clientes"("id") ON DELETE SET NULL ON UPDATE CASCADE;
