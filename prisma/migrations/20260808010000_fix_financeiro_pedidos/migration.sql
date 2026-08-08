-- Remove receitas automáticas cujo pedido original já foi excluído.
DELETE FROM "lancamentos_financeiros"
WHERE "origem" = 'pedido'
  AND "pedido_id" IS NULL;

-- Corrige a competência usando o dia local da pizzaria, não o dia UTC.
UPDATE "lancamentos_financeiros" AS lancamento
SET
    "data_competencia" = (
        pedido."created_at" AT TIME ZONE 'UTC' AT TIME ZONE 'America/Sao_Paulo'
    )::date,
    "updated_at" = CURRENT_TIMESTAMP
FROM "pedidos" AS pedido
WHERE lancamento."pedido_id" = pedido."id"
  AND lancamento."origem" = 'pedido';

-- Ao excluir um pedido, sua receita automática também deve ser removida.
ALTER TABLE "lancamentos_financeiros"
DROP CONSTRAINT "lancamentos_financeiros_pedido_id_fkey";

ALTER TABLE "lancamentos_financeiros"
ADD CONSTRAINT "lancamentos_financeiros_pedido_id_fkey"
FOREIGN KEY ("pedido_id") REFERENCES "pedidos"("id")
ON DELETE CASCADE ON UPDATE CASCADE;
