-- CreateTable
CREATE TABLE "configuracoes" (
    "id" SERIAL NOT NULL,
    "nome_pizzaria" VARCHAR(200) NOT NULL,
    "telefone" VARCHAR(30),
    "endereco" TEXT,
    "cnpj" VARCHAR(20),
    "email" VARCHAR(200),
    "taxa_entrega" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "pedido_minimo" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "tempo_preparo_minutos" INTEGER NOT NULL DEFAULT 30,
    "raio_entrega_km" INTEGER NOT NULL DEFAULT 5,
    "aceitar_pedidos" BOOLEAN NOT NULL DEFAULT true,
    "mensagem_boas_vindas" VARCHAR(300),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "configuracoes_pkey" PRIMARY KEY ("id")
);
