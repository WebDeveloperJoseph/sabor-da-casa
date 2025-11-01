# 📋 Proposta: Sistema de Cadastro de Clientes

## ✅ **VIABILIDADE TÉCNICA — SIM, SEU SISTEMA SUPORTA!**

### 🔐 **Análise de Segurança**

**Seu sistema atual:**
- ✅ PostgreSQL (banco robusto, usado por grandes empresas)
- ✅ Prisma ORM (proteção automática contra SQL Injection)
- ✅ Next.js com validação Zod (validação de entrada)
- ✅ Supabase (autenticação e segurança enterprise-grade)

**Para cadastro de clientes você precisa:**
- ✅ Criptografia de dados sensíveis (CPF, se coletar)
- ✅ Conformidade LGPD (Lei Geral de Proteção de Dados)
- ✅ Consentimento explícito do cliente
- ✅ Política de privacidade clara

**Recomendação:** ✅ **VIÁVEL e SEGURO** com as implementações abaixo.

---

## 📊 **Modelo de Dados Proposto**

### **Novo modelo: Cliente**

```prisma
model Cliente {
  id                Int       @id @default(autoincrement())
  nome              String    @db.VarChar(200)
  telefone          String    @unique @db.VarChar(20)
  email             String?   @db.VarChar(200)
  dataNascimento    DateTime? @map("data_nascimento") @db.Date
  cpf               String?   @db.VarChar(100) // Armazenado CRIPTOGRAFADO
  endereco          String?   @db.Text
  complemento       String?   @db.VarChar(200)
  bairro            String?   @db.VarChar(100)
  cidade            String?   @db.VarChar(100)
  uf                String?   @db.VarChar(2)
  cep               String?   @db.VarChar(10)
  
  // Preferências e marketing
  aceitaWhatsApp    Boolean   @default(true) @map("aceita_whatsapp")
  aceitaEmail       Boolean   @default(false) @map("aceita_email")
  aceitaPromo       Boolean   @default(true) @map("aceita_promo") // Aceita receber promoções
  
  // Controle LGPD
  consentimentoData DateTime  @default(now()) @map("consentimento_data")
  ativo             Boolean   @default(true)
  
  // Timestamps
  createdAt         DateTime  @default(now()) @map("created_at")
  updatedAt         DateTime  @updatedAt @map("updated_at")
  
  // Relacionamentos
  pedidos           Pedido[]
  
  @@map("clientes")
  @@index([telefone])
  @@index([dataNascimento])
}
```

### **Atualização modelo Pedido**

```prisma
model Pedido {
  id            Int       @id @default(autoincrement())
  clienteId     Int?      @map("cliente_id") // Opcional: pedido pode ser sem cadastro
  nomeCliente   String    @map("nome_cliente") @db.VarChar(200) // Snapshot
  telefone      String?   @db.VarChar(20) // Snapshot
  endereco      String?   @db.Text // Snapshot
  observacoes   String?   @db.Text
  dailyNumber   Int?
  status        String    @default("pendente") @db.VarChar(50)
  valorTotal    Decimal   @map("valor_total") @db.Decimal(10, 2)
  createdAt     DateTime  @default(now()) @map("created_at")
  updatedAt     DateTime  @updatedAt @map("updated_at")
  
  // Relacionamentos
  cliente       Cliente?  @relation(fields: [clienteId], references: [id], onDelete: SetNull)
  itens         ItemPedido[]
  
  @@map("pedidos")
}
```

---

## 🎯 **Funcionalidades — O que você ganha**

### **1. Aniversariantes do Mês** 🎂
- Dashboard admin mostra lista de aniversariantes
- Envio automático de mensagem WhatsApp com cupom
- Relatório mensal de aniversariantes

### **2. Histórico de Pedidos** 📦
- Cliente vê seus pedidos anteriores
- Admin vê perfil completo do cliente (total gasto, último pedido, frequência)
- Identificação de clientes VIP (mais de X pedidos)

### **3. Cadastro Rápido no Checkout** ⚡
- Formulário opcional: "Cadastre-se e ganhe 10% no próximo pedido"
- Campos: nome, telefone, data nascimento, aceito promoções
- Salvamento automático após primeiro pedido

### **4. Marketing Inteligente** 📲
- Mensagens personalizadas por WhatsApp
- Cupons de desconto automáticos em aniversários
- Promoções segmentadas (clientes que não pedem há X dias)

### **5. Conformidade LGPD** ⚖️
- Termo de consentimento claro
- Cliente pode solicitar exclusão de dados
- Logs de acesso aos dados sensíveis

---

## 🔒 **Segurança — Como proteger os dados**

### **Criptografia de CPF (se coletar)**

Instalar biblioteca:
```bash
npm install crypto-js
```

Helper de criptografia (`src/lib/crypto.ts`):
```typescript
import CryptoJS from 'crypto-js'

const SECRET_KEY = process.env.CRYPTO_SECRET_KEY! // Variável de ambiente

export function encrypt(text: string): string {
  return CryptoJS.AES.encrypt(text, SECRET_KEY).toString()
}

export function decrypt(ciphertext: string): string {
  const bytes = CryptoJS.AES.decrypt(ciphertext, SECRET_KEY)
  return bytes.toString(CryptoJS.enc.Utf8)
}
```

### **Validação de CPF**
```typescript
function validarCPF(cpf: string): boolean {
  cpf = cpf.replace(/[^\d]/g, '')
  if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) return false
  
  // Algoritmo validação CPF (simplificado)
  let soma = 0
  for (let i = 0; i < 9; i++) soma += parseInt(cpf.charAt(i)) * (10 - i)
  let resto = (soma * 10) % 11
  if (resto === 10 || resto === 11) resto = 0
  if (resto !== parseInt(cpf.charAt(9))) return false
  
  soma = 0
  for (let i = 0; i < 10; i++) soma += parseInt(cpf.charAt(i)) * (11 - i)
  resto = (soma * 10) % 11
  if (resto === 10 || resto === 11) resto = 0
  return resto === parseInt(cpf.charAt(10))
}
```

### **Termo de Consentimento LGPD (exemplo)**

```
Ao cadastrar-me, autorizo a [Nome Pizzaria] a armazenar meus dados pessoais
(nome, telefone, endereço, data de nascimento) para:
☑ Facilitar futuros pedidos
☑ Enviar ofertas e promoções personalizadas (opcional)
☑ Parabenizar-me no meu aniversário com desconto especial

Posso solicitar a exclusão dos meus dados a qualquer momento pelo WhatsApp.
Política de Privacidade: [link]
```

---

## 🎨 **Interface Admin — Tela de Clientes**

### **Lista de Clientes**
- Tabela com: nome, telefone, último pedido, total gasto, ações
- Filtros: aniversariantes do mês, clientes inativos (não pedem há X dias)
- Busca por nome/telefone
- Exportar para Excel/CSV

### **Perfil do Cliente**
- Dados cadastrais
- Histórico de pedidos (lista + gráfico)
- Estatísticas: total gasto, ticket médio, frequência
- Botões: Editar, Enviar WhatsApp, Excluir dados (LGPD)

### **Dashboard Aniversariantes**
- Card destacado: "5 aniversariantes esta semana"
- Botão: "Enviar mensagens automáticas"
- Template de mensagem configurável

---

## 🚀 **Implementação — Passo a Passo**

### **Fase 1: Schema e Migração** (1-2h)
1. Adicionar modelo `Cliente` ao `schema.prisma`
2. Adicionar `clienteId` opcional em `Pedido`
3. Rodar migration: `npx prisma migrate dev --name add_clientes`
4. Instalar crypto-js: `npm install crypto-js @types/crypto-js`

### **Fase 2: APIs Backend** (2-3h)
1. `POST /api/clientes` — Criar cliente
2. `GET /api/clientes` — Listar clientes (admin)
3. `GET /api/clientes/[id]` — Detalhes cliente
4. `PUT /api/clientes/[id]` — Atualizar cliente
5. `DELETE /api/clientes/[id]` — Excluir (LGPD)
6. `GET /api/clientes/aniversariantes` — Lista aniversariantes do mês

### **Fase 3: UI Admin** (3-4h)
1. Página `/admin/clientes` — Lista + filtros
2. Página `/admin/clientes/[id]` — Perfil detalhado
3. Card "Aniversariantes" no dashboard
4. Modal de cadastro rápido

### **Fase 4: Integração com Pedidos** (1-2h)
1. Checkbox no checkout: "Salvar meus dados para próximos pedidos"
2. Formulário de cadastro inline (se marcar checkbox)
3. Ao criar pedido: verificar se telefone já existe → associar cliente
4. Preencher automaticamente endereço se cliente já cadastrado

### **Fase 5: Automações Aniversário** (2h)
1. Cronjob diário (Vercel Cron ou node-cron)
2. Busca aniversariantes do dia
3. Envia WhatsApp com mensagem + cupom
4. Registra envio em log

---

## 💰 **Benefícios para o Negócio**

✅ **Fidelização:** Cliente cadastrado volta mais (dados salvos = checkout rápido)  
✅ **Marketing:** Promoções personalizadas aumentam vendas  
✅ **Aniversários:** Taxa de conversão de 30-40% em cupons de aniversário  
✅ **Inteligência:** Identificar clientes VIP e inativos  
✅ **Profissionalismo:** Sistema moderno e em conformidade com LGPD  

---

## ⚠️ **Cuidados e Recomendações**

### **Obrigatório antes de ir ao ar:**
1. ✅ Adicionar variável `CRYPTO_SECRET_KEY` no `.env` (senha forte, 32+ caracteres)
2. ✅ Criar página `/politica-privacidade` explicando uso de dados
3. ✅ Testar criptografia/descriptografia de CPF localmente
4. ✅ Configurar backup automático do banco (Supabase já tem, mas confirmar)
5. ✅ Limitar acesso às rotas `/api/clientes/*` apenas para admin autenticado

### **Opcional mas recomendado:**
- Implementar rate limiting (evitar spam de cadastros)
- Captcha no formulário de cadastro público
- Validação de telefone via SMS (Twilio, AWS SNS)
- Logs de auditoria (quem acessou dados de qual cliente e quando)

---

## 📝 **Próximos Passos**

**Posso implementar agora:**
1. ✅ Adicionar modelo Cliente ao schema
2. ✅ Criar migration
3. ✅ Criar APIs básicas (CRUD clientes)
4. ✅ Criar tela admin de clientes
5. ✅ Integrar com checkout (opcional ao cadastrar)
6. ✅ Dashboard aniversariantes

**Você autoriza implementar?** 
- Se SIM: começarei pelo schema + migration + APIs backend.
- Se DEPOIS: deixo pronto como referência e você decide quando ativar.

---

## 🎯 **Resumo Executivo**

| Pergunta | Resposta |
|----------|----------|
| **Banco suporta?** | ✅ Sim, PostgreSQL é robusto |
| **Sistema é seguro?** | ✅ Sim, com criptografia + LGPD |
| **Vale a pena?** | ✅ Sim, aumenta fidelização e vendas |
| **Quanto tempo?** | ⏱️ 8-12h total (posso fazer gradualmente) |
| **Riscos?** | ⚠️ Baixo, se seguir boas práticas LGPD |
| **Benefício principal?** | 🎂 Cupons de aniversário = 30-40% conversão |

---

**Pronto para começar?** 🚀
