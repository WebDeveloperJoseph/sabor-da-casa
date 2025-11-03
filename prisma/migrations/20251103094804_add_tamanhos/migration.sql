-- CreateTable
CREATE TABLE "prato_tamanhos" (
    "id" SERIAL NOT NULL,
    "prato_id" INTEGER NOT NULL,
    "tamanho" VARCHAR(10) NOT NULL,
    "preco" DECIMAL(10,2) NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "prato_tamanhos_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "prato_tamanhos" ADD CONSTRAINT "prato_tamanhos_prato_id_fkey" FOREIGN KEY ("prato_id") REFERENCES "pratos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateIndex
CREATE UNIQUE INDEX "prato_tamanhos_prato_id_tamanho_key" ON "prato_tamanhos"("prato_id", "tamanho");

-- AlterTable itens_pedido - adicionar coluna tamanho
ALTER TABLE "itens_pedido" ADD COLUMN "tamanho" VARCHAR(10);
