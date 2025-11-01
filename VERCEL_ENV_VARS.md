# Variáveis de Ambiente para Vercel

## ⚠️ COPIE E COLE EXATAMENTE COMO ESTÁ

Vá em: **Vercel → Project Settings → Environment Variables**

---

### DATABASE_URL
```
postgresql://postgres.tuzgyvduqottmttlfjhf:@102090josedev@db.tuzgyvduqottmttlfjhf.supabase.co:6543/postgres?pgbouncer=true&connection_limit=1
```

### DIRECT_URL
```
postgresql://postgres.tuzgyvduqottmttlfjhf:@102090josedev@db.tuzgyvduqottmttlfjhf.supabase.co:5432/postgres
```

### NEXT_PUBLIC_SUPABASE_URL
```
https://tuzgyvduqottmttlfjhf.supabase.co
```

### NEXT_PUBLIC_SUPABASE_ANON_KEY
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR1emd5dmR1cW90dG10dGxmamhmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE4MzUxODgsImV4cCI6MjA3NzQxMTE4OH0.jdxmrTghgxX9uCKkRSUol5NpLHBup1hW6fWASDBWbDk
```

### NEXT_PUBLIC_ADMIN_PASSWORD
```
@Mary1234#
```

---

## ✅ Checklist de Configuração

- [ ] Todas as 5 variáveis foram adicionadas
- [ ] DATABASE_URL usa porta **6543** (pgBouncer)
- [ ] DIRECT_URL usa porta **5432** (conexão direta)
- [ ] As variáveis foram salvas para **Production, Preview e Development**
- [ ] Fazer Redeploy após adicionar variáveis

---

## 🔧 Troubleshooting

**Erro: "prepared statement does not exist"**
- Certifique-se de usar porta 6543 no DATABASE_URL
- Adicione `?pgbouncer=true&connection_limit=1` no final da URL

**Erro: "SASL authentication failed"**
- Verifique se a senha está correta (sem espaços extras)
- Formato: `postgres.PROJECT_REF:SENHA@db.PROJECT_REF.supabase.co`

**Erro: "Prisma Client not found"**
- O script `postinstall` deve resolver isso automaticamente
- Se persistir, verifique se está na última versão do código

---

## 🚀 Após Configurar

1. Clique em **Redeploy** na Vercel
2. Aguarde o build completar
3. Teste o site em produção
4. Configure as URLs permitidas no Supabase:
   - Vá em: **Supabase → Authentication → URL Configuration**
   - Adicione: `https://seu-projeto.vercel.app`
   - Adicione: `https://seu-projeto.vercel.app/admin`
