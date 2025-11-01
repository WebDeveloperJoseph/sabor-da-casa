# 🚀 INSTRUÇÕES PARA APLICAR MIGRATION

## Passo 1: Aplicar Migration no Banco

Abra o terminal PowerShell e execute:

```powershell
npx prisma migrate dev --name add_clientes
```

Este comando irá:
- Criar a tabela `clientes` no banco
- Adicionar a coluna `cliente_id` na tabela `pedidos`
- Criar os índices necessários
- Regenerar o Prisma Client automaticamente

## Passo 2: Verificar se funcionou

Se você vir mensagens verdes no terminal dizendo "Migration applied", está tudo certo!

## Passo 3: Testar no Admin

Após a migration, as APIs de clientes estarão funcionando. Os erros de TypeScript vão sumir automaticamente porque o Prisma Client foi regenerado.

---

## ⚠️ Se der erro "Applied migration"

Se você já tinha aplicado uma migration anterior e ela está pendente, rode:

```powershell
npx prisma migrate resolve --applied <nome_da_migration>
npx prisma migrate dev --name add_clientes
```

---

## 🔍 Verificar banco manualmente (opcional)

```powershell
npx prisma studio
```

Isso abre uma interface visual onde você pode ver a tabela `clientes` criada!

---

## ✅ Após aplicar a migration

ME AVISE que aplicou e eu continuo com:
1. Telas admin de clientes
2. Dashboard de aniversariantes  
3. Modernização do site público
4. Nova página de login

---

**RODE AGORA:** `npx prisma migrate dev --name add_clientes`
