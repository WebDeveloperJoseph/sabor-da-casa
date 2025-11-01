# 🧪 Checklist de Testes - Sabor da Casa

Execute esses testes para garantir que tudo funciona antes de adicionar novas features.

---

## ✅ **1. Site Público (Cliente)**

### Teste 1.1: Visualizar Cardápio
- [ ] Abrir: `http://localhost:3000`
- [ ] Ver HeroSection com animação da equipe deslizando
- [ ] Ver categorias de pratos (Pizzas, Bebidas, etc)
- [ ] Ver imagens e preços dos pratos
- [ ] Clicar em "Ver Cardápio" - deve rolar até os pratos

**✓ Esperado**: Cardápio carrega com imagens, preços e animações suaves

---

### Teste 1.2: Adicionar ao Carrinho
- [ ] Clicar no botão "Adicionar" em um prato
- [ ] Ver contador do carrinho aumentar (ícone no canto)
- [ ] Adicionar mais de 1 item
- [ ] Adicionar diferentes pratos

**✓ Esperado**: Itens somam no carrinho sem erros

---

### Teste 1.3: Finalizar Pedido (SEM cadastro)
- [ ] Abrir carrinho (ícone flutuante)
- [ ] Preencher: Nome, Telefone, Endereço
- [ ] **NÃO** marcar "Salvar meus dados"
- [ ] Clicar "Enviar Pedido"
- [ ] Ver mensagem de sucesso
- [ ] Clicar no link do WhatsApp gerado

**✓ Esperado**: 
- Pedido criado com sucesso
- WhatsApp abre com mensagem pré-preenchida
- Cliente NÃO foi salvo no banco

---

### Teste 1.4: Finalizar Pedido (COM cadastro)
- [ ] Abrir carrinho novamente (adicionar itens)
- [ ] Preencher: Nome, **Telefone NOVO**, Endereço
- [ ] **MARCAR** "Salvar meus dados"
- [ ] Preencher Email e Data de Nascimento
- [ ] Enviar pedido
- [ ] Ver sucesso

**✓ Esperado**: Cliente salvo no banco (verificar no admin)

---

### Teste 1.5: Prefill de Cliente (retornar)
- [ ] Limpar carrinho, adicionar itens novamente
- [ ] Digitar o **mesmo telefone** do teste 1.4
- [ ] Sair do campo telefone (onBlur)

**✓ Esperado**: Nome, email, nascimento preenchem automaticamente

---

## 🔐 **2. Admin Panel**

### Teste 2.1: Login
- [ ] Abrir: `http://localhost:3000/login`
- [ ] Ver design moderno com glassmorphism
- [ ] Tentar login incorreto → ver erro
- [ ] Fazer login correto (email/senha configurados no Supabase)

**✓ Esperado**: Redirect para `/admin` após login

---

### Teste 2.2: Dashboard
- [ ] Ver cards: Total Pedidos, Pendentes, Hoje, Faturamento
- [ ] Ver card "Aniversariantes (mês)" com número
- [ ] Clicar no card de aniversariantes → ir para /admin/clientes

**✓ Esperado**: Dashboard carrega sem erros, números corretos

---

### Teste 2.3: Pedidos - Listar
- [ ] Menu lateral → Pedidos
- [ ] Ver lista de pedidos com status
- [ ] Ver badge "hoje: #X" nos pedidos de hoje
- [ ] Clicar "Ver / Imprimir"

**✓ Esperado**: 
- Todos os pedidos aparecem
- Badge do dia correto
- Botão imprimir funciona

---

### Teste 2.4: Pedidos - Imprimir
- [ ] Na tela de impressão, verificar:
  - [ ] Dados do pedido corretos
  - [ ] **NÃO aparece** "Pedido #20" (ID do banco)
  - [ ] Aparece apenas "Hoje: #X"
  - [ ] Itens e total corretos
- [ ] Testar Ctrl+P (preview de impressão)

**✓ Esperado**: 
- Comprovante formatado para térmica 55mm
- Sem ID de teste (#20), só número do dia

---

### Teste 2.5: Pedidos - Mudar Status
- [ ] Na lista, clicar no dropdown de status
- [ ] Mudar: Pendente → Em Preparo
- [ ] Verificar se muda visualmente
- [ ] Testar outros status

**✓ Esperado**: Status atualiza sem reload

---

### Teste 2.6: Clientes - Listar
- [ ] Menu → Clientes
- [ ] Ver cliente cadastrado no teste 1.4
- [ ] Buscar por nome/telefone
- [ ] Marcar "Aniversariantes do mês"

**✓ Esperado**: 
- Cliente aparece
- Busca funciona
- Filtro aniversariantes mostra quem faz aniversário no mês

---

### Teste 2.7: Clientes - Perfil
- [ ] Clicar em "Ver detalhes" de um cliente
- [ ] Ver cards: Pedidos, Total Gasto, Ticket Médio
- [ ] Ver tabela de pedidos do cliente

**✓ Esperado**: 
- Estatísticas corretas
- Histórico de pedidos completo

---

### Teste 2.8: Aniversariantes - Automação
- [ ] Menu → Clientes → "🎂 Aniversariantes Hoje"
- [ ] Ver stats (total, aceitam promoções)
- [ ] Configurar mensagem (usar {nome} e {cupom})
- [ ] Digitar cupom: `ANIVERSARIO10`
- [ ] Clicar "Gerar Mensagens"
- [ ] Testar link do WhatsApp

**✓ Esperado**: 
- Mensagens geradas com nome e cupom substituídos
- WhatsApp abre com mensagem correta

---

### Teste 2.9: Pratos - Criar/Editar
- [ ] Menu → Pratos → "Adicionar Prato"
- [ ] Preencher dados (nome, preço, categoria, imagem)
- [ ] Salvar
- [ ] Editar prato existente
- [ ] Desativar prato

**✓ Esperado**: 
- Prato criado/editado
- Prato desativado não aparece no site público

---

### Teste 2.10: Configurações
- [ ] Menu → Configurações
- [ ] Alterar "Nome da Pizzaria"
- [ ] Alterar "Pedido Mínimo"
- [ ] Salvar
- [ ] Recarregar página

**✓ Esperado**: 
- Dados salvam
- Mudanças refletem no site público

---

## 🔔 **3. Notificações Realtime**

### Teste 3.1: Notificação de Pedido
- [ ] Abrir admin em uma aba
- [ ] Abrir site público em outra aba
- [ ] Fazer pedido no site público
- [ ] Verificar se admin mostra toast "Novo pedido #X"
- [ ] Verificar notificação do navegador (permitir se pedir)

**✓ Esperado**: 
- Toast aparece automaticamente
- Notificação do sistema aparece

---

## 🎨 **4. UX/Design**

### Teste 4.1: Footer
- [ ] Scroll até o footer no site público
- [ ] Verificar WhatsApp: `5583996444542`
- [ ] Verificar Instagram: `pizzaria.sabordacasa_`
- [ ] Verificar créditos dev: `@estu.diozz`
- [ ] Clicar nos links

**✓ Esperado**: 
- Links corretos
- Abrem em nova aba

---

### Teste 4.2: Responsividade
- [ ] Abrir DevTools (F12)
- [ ] Testar Mobile (375px)
- [ ] Testar Tablet (768px)
- [ ] Testar Desktop (1920px)

**✓ Esperado**: Layout adapta sem quebrar

---

## 🐛 **5. Erros Conhecidos (verificar se corrigidos)**

### Teste 5.1: Prisma Client
- [ ] Admin → Clientes
- [ ] Verificar se **NÃO** aparece erro "Cannot read properties of undefined (reading 'findMany')"

**✓ Esperado**: Página carrega normal

---

### Teste 5.2: Login - styled-jsx
- [ ] Abrir `/login`
- [ ] Verificar animação dos blobs funcionando

**✓ Esperado**: Sem erro "client-only cannot be imported"

---

## 📊 **Resultado Final**

**Testes Passados**: ___/45  
**Testes Falhados**: ___

---

## 🚨 **Se encontrar erros:**

1. **Anote exatamente**:
   - Qual teste falhou
   - Mensagem de erro (se houver)
   - Screenshot (se possível)

2. **Me envie** para corrigir antes de implementar novas features!

---

Pronto para começar? Execute os testes na ordem e vá marcando com `[x]` conforme passa! ✅
