-- AlterTable
ALTER TABLE "itens_pedido" ADD COLUMN IF NOT EXISTS "borda_nome" VARCHAR(100);
ALTER TABLE "itens_pedido" ADD COLUMN IF NOT EXISTS "borda_preco" DECIMAL(10,2);
