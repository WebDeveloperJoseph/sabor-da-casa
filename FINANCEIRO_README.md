# 💰 Área Financeira - Instruções

## Acesso Protegido

A aba **Financeiro** no painel administrativo está protegida por senha para garantir segurança dos dados financeiros.

### Senha Padrão
```
financeiro2024
```

### Como Alterar a Senha

1. **Desenvolvimento Local:**
   - Edite o arquivo `.env.local`
   - Altere a variável: `NEXT_PUBLIC_ADMIN_FINANCIAL_PASSWORD="sua_nova_senha"`
   - Reinicie o servidor de desenvolvimento

2. **Produção (Vercel):**
   - Acesse o dashboard do Vercel
   - Vá em **Settings** > **Environment Variables**
   - Adicione/edite a variável: `NEXT_PUBLIC_ADMIN_FINANCIAL_PASSWORD`
   - Valor: sua senha desejada
   - Faça um novo deploy para aplicar

### Funcionalidades da Área Financeira

- ✅ Total de vendas do mês atual
- ✅ Total de vendas geral (todos os tempos)
- ✅ Ticket médio mensal
- ✅ Ticket médio geral
- ✅ Número de pedidos concluídos
- ✅ Sessão temporária (não precisa digitar senha a cada refresh)

### Segurança

- A senha é armazenada em variável de ambiente
- A autenticação é mantida apenas na sessão do navegador
- Ao fechar o navegador, será necessário autenticar novamente
- Apenas pedidos com status "entregue" são contabilizados

### Observações

- Para maior segurança em produção, considere implementar autenticação JWT ou OAuth
- A senha atual é básica e adequada para uso interno
- Os valores exibidos excluem pedidos cancelados automaticamente
