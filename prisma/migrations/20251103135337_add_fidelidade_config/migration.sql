-- AlterTable
ALTER TABLE "configuracoes" ADD COLUMN     "fidelidade_ativo" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "fidelidade_categoria_nome" VARCHAR(100),
ADD COLUMN     "fidelidade_descricao" VARCHAR(300),
ADD COLUMN     "fidelidade_expira_dias" INTEGER,
ADD COLUMN     "fidelidade_meta" INTEGER NOT NULL DEFAULT 10,
ADD COLUMN     "fidelidade_por_pedido" BOOLEAN NOT NULL DEFAULT true;
