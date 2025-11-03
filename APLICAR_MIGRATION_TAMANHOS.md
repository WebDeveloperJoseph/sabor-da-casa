# Aplicar Migration de Tamanhos de Pizza

## Contexto
Foi implementado o sistema de tamanhos (P, M, G) para pizzas/pratos com preços diferenciados por tamanho.

## Passos para aplicar a migration em produção

### Opção 1: Via Prisma CLI (Recomendado)

1. **Certifique-se de que o `DIRECT_URL` está configurado** no arquivo `.env` ou nas variáveis de ambiente do Render:
   ```
   DIRECT_URL="postgresql://postgres.xxx:5432/postgres?pgbouncer=false"
   ```

2. **Execute o comando de migration**:
   ```powershell
   npm run prisma:migrate:deploy
   ```
   
   Ou diretamente:
   ```powershell
   npx prisma migrate deploy
   ```

### Opção 2: Via SQL Editor do Supabase (Manual)

Se o comando acima falhar (problema de conectividade ou permissões), execute manualmente no SQL Editor do Supabase:

1. Acesse o painel do Supabase: https://supabase.com/dashboard
2. Selecione seu projeto
3. Vá em **SQL Editor**
4. Cole e execute este SQL:

```sql
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
ALTER TABLE "prato_tamanhos" ADD CONSTRAINT "prato_tamanhos_prato_id_fkey" 
FOREIGN KEY ("prato_id") REFERENCES "pratos"("id") 
ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateIndex
CREATE UNIQUE INDEX "prato_tamanhos_prato_id_tamanho_key" 
ON "prato_tamanhos"("prato_id", "tamanho");

-- AlterTable itens_pedido - adicionar coluna tamanho
ALTER TABLE "itens_pedido" ADD COLUMN "tamanho" VARCHAR(10);
```

5. Clique em **Run** para executar

## Verificação

Após aplicar a migration, verifique se as tabelas foram criadas:

```sql
SELECT tablename FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('prato_tamanhos');

-- Deve retornar 1 linha mostrando 'prato_tamanhos'
```

## Próximos Passos

Após a migration estar aplicada:

1. **Teste cadastrar um prato com tamanhos** no Admin:
   - Acesse `/admin/pratos/novo`
   - Marque "Usar tamanhos P/M/G"
   - Preencha os preços para P, M e G
   - Salve

2. **Verifique no cardápio público** se os botões de tamanho aparecem

3. **Teste um pedido completo**:
   - Selecione um tamanho
   - Adicione ao carrinho
   - Finalize o pedido
   - Verifique no admin se o tamanho foi salvo corretamente

## Em caso de erro

Se encontrar erro ao executar a migration:

1. Verifique se já não existe a tabela `prato_tamanhos`:
   ```sql
   SELECT * FROM prato_tamanhos LIMIT 1;
   ```

2. Se já existir, a migration já foi aplicada. Apenas verifique se a coluna `tamanho` existe em `itens_pedido`:
   ```sql
   SELECT column_name FROM information_schema.columns 
   WHERE table_name = 'itens_pedido' AND column_name = 'tamanho';
   ```

3. Se faltar apenas a coluna tamanho em itens_pedido, execute apenas:
   ```sql
   ALTER TABLE "itens_pedido" ADD COLUMN IF NOT EXISTS "tamanho" VARCHAR(10);
   ```
