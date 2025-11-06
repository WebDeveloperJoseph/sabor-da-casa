-- CreateTable
CREATE TABLE "bordas_recheadas" (
    "id" SERIAL NOT NULL,
    "nome" VARCHAR(100) NOT NULL,
    "preco_adicional" DECIMAL(10,2) NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bordas_recheadas_pkey" PRIMARY KEY ("id")
);

-- AlterTable
ALTER TABLE "itens_pedido" ADD COLUMN "borda_id" INTEGER,
ADD COLUMN "nome_borda" VARCHAR(100),
ADD COLUMN "preco_borda" DECIMAL(10,2);

-- CreateIndex
CREATE UNIQUE INDEX "bordas_recheadas_nome_key" ON "bordas_recheadas"("nome");

-- AddForeignKey
ALTER TABLE "itens_pedido" ADD CONSTRAINT "itens_pedido_borda_id_fkey" FOREIGN KEY ("borda_id") REFERENCES "bordas_recheadas"("id") ON DELETE SET NULL ON UPDATE CASCADE;
