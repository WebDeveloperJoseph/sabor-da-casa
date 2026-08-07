CREATE TABLE "lancamentos_financeiros" (
    "id" SERIAL NOT NULL,
    "tipo" VARCHAR(20) NOT NULL,
    "origem" VARCHAR(20) NOT NULL DEFAULT 'manual',
    "descricao" VARCHAR(200) NOT NULL,
    "categoria" VARCHAR(100) NOT NULL,
    "valor" DECIMAL(12,2) NOT NULL,
    "data_competencia" DATE NOT NULL,
    "observacoes" TEXT,
    "pedido_id" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "lancamentos_financeiros_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "lancamentos_financeiros_pedido_id_key"
ON "lancamentos_financeiros"("pedido_id");

CREATE INDEX "lancamentos_financeiros_data_competencia_idx"
ON "lancamentos_financeiros"("data_competencia");

CREATE INDEX "lancamentos_financeiros_tipo_data_competencia_idx"
ON "lancamentos_financeiros"("tipo", "data_competencia");

CREATE INDEX "lancamentos_financeiros_categoria_idx"
ON "lancamentos_financeiros"("categoria");

ALTER TABLE "lancamentos_financeiros"
ADD CONSTRAINT "lancamentos_financeiros_pedido_id_fkey"
FOREIGN KEY ("pedido_id") REFERENCES "pedidos"("id")
ON DELETE SET NULL ON UPDATE CASCADE;

-- Preserva no livro-caixa todos os pedidos que ja foram concluidos.
INSERT INTO "lancamentos_financeiros" (
    "tipo",
    "origem",
    "descricao",
    "categoria",
    "valor",
    "data_competencia",
    "pedido_id",
    "created_at",
    "updated_at"
)
SELECT
    'entrada',
    'pedido',
    'Pedido #' || "id",
    'Vendas',
    "valor_total",
    "created_at"::date,
    "id",
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM "pedidos"
WHERE "status" = 'entregue'
ON CONFLICT ("pedido_id") DO NOTHING;
