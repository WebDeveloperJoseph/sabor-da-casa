# Checklist de Deploy - Sabor da Casa 🍕

## ✅ Preparação para Deploy

### 1. Verificações Finais
- [x] Banco de dados limpo (pedidos de teste deletados)
- [x] Sistema de avaliações implementado
- [x] Responsividade mobile corrigida
- [x] Ícones de redes sociais no footer
- [x] Carousel mobile funcionando
- [x] CRUD de clientes completo
- [x] Language correto (pt-BR)

### 2. Variáveis de Ambiente (.env)
Configure localmente (/.env.local) e na plataforma de deploy (Vercel → Project Settings → Environment Variables):
```env
# Banco de dados (Supabase Postgres)
DATABASE_URL="postgresql://postgres.tuzgyvduqottmttlfjhf:[PASSWORD]@db.tuzgyvduqottmttlfjhf.supabase.co:5432/postgres"

# Supabase (Auth/Storage) – chaves públicas
NEXT_PUBLIC_SUPABASE_URL="https://tuzgyvduqottmttlfjhf.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="[SUA_ANON_PUBLIC_KEY]"

# Admin (se aplicável)
NEXT_PUBLIC_ADMIN_PASSWORD="[SUA_SENHA_ADMIN]"
```

Observações:
- As chaves públicas do Supabase podem ser expostas no front.
- Se usar recursos server-only (webhooks etc.), utilize chaves de service role apenas no servidor, nunca no front.

### 3. Arquivos Sensíveis
- [ ] `.env` está no `.gitignore` ✅ (não commitar)
- [ ] Verificar se não há senhas hardcoded no código
- [ ] Verificar se não há logs de debug desnecessários

### 4. Build Local (Teste antes de subir)
```bash
npm run build
```
- [ ] Build completa sem erros
- [ ] Testar em modo produção: `npm start`

Se aparecer erro de Prisma Client, gere o client:
```bash
npm run prisma:generate
```

---

## 🚀 Deploy no GitHub

### 5. Preparar Repositório
```bash
# Inicializar git (se ainda não foi)
git init

# Adicionar remote (substitua SEU_USUARIO pelo seu usuário do GitHub)
git remote add origin https://github.com/SEU_USUARIO/sabor-casa.git

# Verificar status
git status

# Adicionar todos os arquivos
git add .

# Commit inicial
git commit -m "Initial commit: Sistema completo Sabor da Casa"

# Push para GitHub
git push -u origin main
```

### 6. Criar Repositório no GitHub
1. Acesse https://github.com/new
2. Nome do repositório: `sabor-casa` (ou outro nome)
3. Deixe como **público** ou **privado** (sua escolha)
4. **NÃO** marque "Initialize with README" (já temos localmente)
5. Criar repositório
6. Copiar a URL e usar no comando `git remote add origin`

---

## 🌐 Deploy na Vercel

### 7. Deploy Automático via GitHub
1. Acesse https://vercel.com
2. Faça login com sua conta GitHub
3. Clique em **"Add New Project"**
4. Selecione o repositório `sabor-casa`
5. Configure as variáveis de ambiente:
  - `DATABASE_URL` → cole a connection string do Supabase
  - `NEXT_PUBLIC_SUPABASE_URL` → URL do seu projeto no Supabase
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY` → chave pública (anon) do Supabase
  - `NEXT_PUBLIC_ADMIN_PASSWORD` → sua senha de admin
6. Clique em **"Deploy"**

### 8. Aguardar Deploy
- [ ] Build concluído com sucesso
- [ ] Site acessível via URL da Vercel (ex: `sabor-casa.vercel.app`)

### 9. Testar em Produção
- [ ] Página inicial carrega
- [ ] Admin panel acessível (/login)
- [ ] Pedidos funcionam
- [ ] Notificações em tempo real funcionam
- [ ] Sistema de avaliações funciona
- [ ] Responsividade mobile OK
- [ ] Ícones de redes sociais aparecem

Se o banco estiver recém-criado, execute as migrações em produção (uma única vez):
```powershell
# Opção A: Localmente (usando sua máquina com DATABASE_URL apontando para produção)
$env:DATABASE_URL="<sua_url_de_producao>"; npm run prisma:migrate:deploy

# Opção B: Pela Vercel (via Job manual ou Deployment Hook)
# Configure um Job para rodar `npm run prisma:migrate:deploy` com DATABASE_URL configurado.
```

---

## 📱 Configuração Pós-Deploy

### 10. Adicionar Conteúdo
- [ ] Adicionar fotos reais das pizzas em `/public/img/pratos/`
- [ ] Cadastrar todas as pizzas do cardápio
- [ ] Cadastrar bebidas
- [ ] Cadastrar categorias adicionais
- [ ] Configurar horários de funcionamento

### 11. SEO e Domínio Personalizado (Opcional)
- [ ] Configurar domínio próprio na Vercel (ex: sabordacasa.com.br)
- [ ] Adicionar Google Analytics
- [ ] Configurar meta tags (já configuradas em layout.tsx)

### 12. Marketing
- [ ] Compartilhar link do site no WhatsApp Business
- [ ] Divulgar no Instagram (@saboresdacasa_)
- [ ] Criar QR Code do site para panfletos/cardápio físico

---

## 🔧 Comandos Úteis

### Atualizar código após mudanças
```bash
git add .
git commit -m "Descrição da mudança"
git push
```
*A Vercel vai fazer deploy automático após cada push!*

### Rodar migrações do Prisma (se adicionar novos models)
```bash
npx prisma migrate dev --name nome_da_migration
git add .
git commit -m "feat: nova migration do banco"
git push
```

### Ver logs de erros na Vercel
1. Acesse o dashboard da Vercel
2. Clique no projeto
3. Aba "Functions" → Ver logs em tempo real

---

## 📊 Dados Iniciais Recomendados

### Configurações (/admin → Configurações)
- ✅ Nome: Sabor da Casa
- ✅ Telefone: (83) 99644-4542
- ✅ Endereço: Seu endereço completo
- ✅ Taxa de entrega: R$ 5,00 (ajustar conforme necessário)
- ✅ Pedido mínimo: R$ 20,00 (ajustar conforme necessário)
- ✅ Tempo de preparo: 30-45 minutos
- ✅ Raio de entrega: 5 km

### Pratos Essenciais para Começar
Já cadastrado:
- [x] 4 pizzas de exemplo

Para adicionar depois do deploy:
- [ ] Mais sabores de pizza (Margherita, Calabresa, etc)
- [ ] Bebidas (Refrigerantes, sucos, cervejas)
- [ ] Sobremesas
- [ ] Combos/Promoções

---

## ✨ Funcionalidades Implementadas

### Cliente (Site Público)
- ✅ Visualizar cardápio
- ✅ Adicionar itens ao carrinho
- ✅ Finalizar pedido
- ✅ Auto-preenchimento de dados por telefone
- ✅ Notificações em tempo real (Sonner)
- ✅ Link direto para WhatsApp após pedido
- ✅ Sistema de avaliação de pedidos entregues
- ✅ Responsivo (mobile/tablet/desktop)

### Admin
- ✅ Dashboard com estatísticas
- ✅ Gestão de pedidos (status, impressão)
- ✅ Gestão de pizzas/pratos
- ✅ Gestão de categorias
- ✅ Gestão de ingredientes
- ✅ Gestão de clientes (CRUD completo)
- ✅ Configurações gerais
- ✅ Visualização de avaliações
- ✅ Média de avaliações no dashboard
- ✅ Aniversariantes do mês
- ✅ Notificações sonoras de novos pedidos

---

## 🎯 Próximos Passos (Futuro)

### Melhorias Sugeridas
- [ ] Sistema de cupons de desconto
- [ ] Programa de fidelidade
- [ ] Histórico de pedidos para clientes (login)
- [ ] Relatórios em PDF
- [ ] Integração com pagamento online (Mercado Pago/PagSeguro)
- [ ] Sistema de delivery próprio (rastreamento)
- [ ] App mobile (React Native)

---

## 🆘 Suporte

### Problemas Comuns

**Erro de conexão com banco:**
- Verificar se DATABASE_URL está correta nas variáveis de ambiente da Vercel
- Verificar se o IP da Vercel está liberado no Supabase (geralmente já está)
 - Em ambientes serverless (Vercel), prefira a Connection String de Connection Pooling (pgBouncer) do Supabase para `DATABASE_URL` (Dashboard Supabase → Database → Connection Pooling → string de conexão). Isso reduz erros de “too many connections”.

**Página em branco:**
- Ver logs na Vercel
- Verificar se todas as variáveis de ambiente foram configuradas

**Prisma Client não encontrado:**
- A Vercel gera automaticamente durante o build
- Se der erro, adicionar script de postinstall no package.json:
  ```json
  "postinstall": "prisma generate"
  ```
 - Ou rode manualmente: `npm run prisma:generate`

**Autenticação Supabase não funciona (login/redirect):**
- Confira se as URLs do seu domínio estão autorizadas no Supabase → Authentication → URL Configuration (Auth Redirect URLs, Site URL).
- Garanta que `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY` estão corretas na Vercel.

**Notificações não funcionam:**
- Verificar se a URL da aplicação está correta
- Pode levar alguns segundos até a primeira conexão

---

## 📞 Contatos

- **WhatsApp Sabor da Casa:** (83) 99644-4542
- **Instagram:** @saboresdacasa_

---

**Status do Projeto:** ✅ Pronto para Deploy

**Data:** 01/11/2025

**Desenvolvido com:** Next.js 16, React 19, TypeScript, Prisma, PostgreSQL (Supabase), Tailwind CSS

---

Boa sorte com o lançamento! 🚀🍕
