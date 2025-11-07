-- Rollback: Remover bordas recheadas
-- Reverter migration 20251106000000_add_bordas_recheadas

-- 1. Remover colunas de bordas da tabela itens_pedido
ALTER TABLE "public"."itens_pedido" DROP COLUMN IF EXISTS "borda_id";
ALTER TABLE "public"."itens_pedido" DROP COLUMN IF EXISTS "nome_borda";
ALTER TABLE "public"."itens_pedido" DROP COLUMN IF EXISTS "preco_borda";

-- 2. Remover tabela de bordas recheadas
DROP TABLE IF EXISTS "public"."bordas_recheadas";
