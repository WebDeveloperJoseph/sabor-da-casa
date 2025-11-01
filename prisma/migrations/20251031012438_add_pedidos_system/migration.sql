-- CreateTable
CREATE TABLE "pedidos" (
    "id" SERIAL NOT NULL,
    "nome_cliente" VARCHAR(200) NOT NULL,
    "telefone" VARCHAR(20),
    "endereco" TEXT,
    "observacoes" TEXT,
    "status" VARCHAR(50) NOT NULL DEFAULT 'pendente',
    "valor_total" DECIMAL(10,2) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pedidos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "itens_pedido" (
    "id" SERIAL NOT NULL,
    "pedido_id" INTEGER NOT NULL,
    "prato_id" INTEGER NOT NULL,
    "nome_prato" VARCHAR(200) NOT NULL,
    "quantidade" INTEGER NOT NULL DEFAULT 1,
    "preco_unit" DECIMAL(10,2) NOT NULL,
    "subtotal" DECIMAL(10,2) NOT NULL,
    "observacoes" TEXT,

    CONSTRAINT "itens_pedido_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "itens_pedido" ADD CONSTRAINT "itens_pedido_pedido_id_fkey" FOREIGN KEY ("pedido_id") REFERENCES "pedidos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "itens_pedido" ADD CONSTRAINT "itens_pedido_prato_id_fkey" FOREIGN KEY ("prato_id") REFERENCES "pratos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
