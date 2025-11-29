-- DropIndex
DROP INDEX "public"."pedidos_created_at_idx";

-- DropIndex
DROP INDEX "public"."pedidos_status_idx";

-- DropIndex
DROP INDEX "public"."pedidos_telefone_idx";

-- DropIndex
DROP INDEX "public"."pedidos_telefone_status_created_at_idx";

-- AlterTable
ALTER TABLE "itens_pedido" ADD COLUMN     "borda_id" INTEGER;

-- CreateTable
CREATE TABLE "Borda" (
    "id" SERIAL NOT NULL,
    "nome" VARCHAR(100) NOT NULL,
    "preco" DECIMAL(10,2) NOT NULL,
    "ativa" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Borda_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "itens_pedido" ADD CONSTRAINT "itens_pedido_borda_id_fkey" FOREIGN KEY ("borda_id") REFERENCES "Borda"("id") ON DELETE SET NULL ON UPDATE CASCADE;
