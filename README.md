# 🍽️ Sabor Casa - Sistema de Cardápio Digital

> **Tutorial Prático**: Este projeto serve como um guia de aprendizado para desenvolvimento web moderno, combinando as melhores práticas da indústria em um projeto real.

## 📚 **Por que este projeto é perfeito para estudar?**

Este sistema de cardápio digital foi pensado para ensinar conceitos fundamentais do desenvolvimento web moderno:
- **Frontend moderno** com React e Next.js
- **Design System** com componentes reutilizáveis
- **Banco de dados** relacional com Prisma
- **TypeScript** para type safety
- **UI/UX** profissional com Tailwind CSS

---

## 🎯 **Objetivos de Aprendizado**

Ao final deste projeto, você terá aprendido:

### **Frontend**
- ✅ React Server Components e Client Components
- ✅ Sistema de roteamento do Next.js 14+
- ✅ Gerenciamento de estado
- ✅ Formulários e validação
- ✅ Componentização avançada

### **Backend**
- ✅ API Routes do Next.js
- ✅ Prisma ORM para banco de dados
- ✅ Validação de dados
- ✅ Tratamento de erros

### **UI/UX**
- ✅ Design System com Radix UI
- ✅ Responsividade com Tailwind CSS
- ✅ Acessibilidade (a11y)
- ✅ Temas claro/escuro

---

## 🛠️ **Stack Tecnológica e Justificativas**

### **🚀 Next.js 16** 
**Por que escolhemos:**
- **Full-stack framework**: Backend e frontend em um só lugar
- **Server Components**: Renderização no servidor para melhor performance
- **File-based routing**: Roteamento intuitivo baseado em arquivos
- **Built-in optimizations**: Otimizações automáticas de imagem, fonts, etc.

### **⚡ React 19**
**Por que escolhemos:**
- **Component-based**: Arquitetura modular e reutilizável
- **Virtual DOM**: Performance otimizada
- **Hooks**: Lógica reutilizável entre componentes
- **Ecosystem**: Maior ecossistema de bibliotecas

### **📝 TypeScript**
**Por que escolhemos:**
- **Type Safety**: Previne erros em tempo de desenvolvimento
- **IntelliSense**: Melhor experiência de desenvolvimento
- **Refactoring**: Refatorações mais seguras
- **Documentation**: Código auto-documentado

### **🗄️ Prisma + PostgreSQL**
**Por que escolhemos:**
- **Type-safe ORM**: Queries type-safe com TypeScript
- **Migrations**: Controle de versão do banco de dados
- **Studio**: Interface visual para o banco
- **PostgreSQL**: Banco robusto e confiável

### **🎨 Tailwind CSS + Radix UI**
**Por que escolhemos:**
- **Utility-first**: CSS utilitário para desenvolvimento rápido
- **Responsivo**: Mobile-first design
- **Radix UI**: Componentes acessíveis e sem estilo
- **Design System**: Consistência visual

### **🔧 Ferramentas de Desenvolvimento**
- **ESLint**: Qualidade e padrões de código
- **Prettier**: Formatação consistente
- **Git**: Controle de versão
- **VS Code**: Editor otimizado para desenvolvimento

---

## 🏗️ **Arquitetura do Projeto**

```
sabor-casa/
├── src/
│   ├── app/                    # App Router (Next.js 14+)
│   │   ├── api/               # API Routes
│   │   ├── globals.css        # Estilos globais
│   │   ├── layout.tsx         # Layout principal
│   │   └── page.tsx           # Página inicial
│   ├── components/            # Componentes React
│   │   └── ui/               # Design System
│   ├── lib/                  # Utilitários e configurações
│   └── generated/            # Código gerado pelo Prisma
├── prisma/
│   └── schema.prisma         # Schema do banco de dados
├── public/                   # Arquivos estáticos
└── docs/                    # Documentação do projeto
```

---

## 🚦 **Como Iniciar o Projeto**

### **Pré-requisitos**
- Node.js 18+ 
- PostgreSQL (local ou cloud)
- Git

### **Passo a Passo**

1. **Clone e instale dependências**
```bash
git clone <repo-url>
cd sabor-casa
npm install
```

2. **Configure o banco de dados**
```bash
# Copie o arquivo de exemplo
cp .env.example .env.local

# Configure sua DATABASE_URL no .env.local
# Exemplo: postgresql://usuario:senha@localhost:5432/sabor_casa
```

3. **Execute as migrations**
```bash
npx prisma migrate dev
npx prisma generate
```

4. **Inicie o servidor de desenvolvimento**
```bash
npm run dev
```

5. **Acesse o projeto**
- Frontend: [http://localhost:3000](http://localhost:3000)
- Prisma Studio: `npx prisma studio`

---

## 📋 **Funcionalidades Planejadas**

### **Fase 1: Fundação** ✅
- [x] Setup do projeto
- [x] Configuração do banco de dados
- [x] Design System básico

### **Fase 2: CRUD de Pratos** 🚧
- [ ] Modelo de dados (Categoria, Prato, Ingrediente)
- [ ] Interface de listagem
- [ ] Formulário de criação/edição
- [ ] Upload de imagens

### **Fase 3: Cardápio Público** 📋
- [ ] Página pública do cardápio
- [ ] Filtros por categoria
- [ ] Busca de pratos
- [ ] Responsividade mobile

### **Fase 4: Melhorias** 🎯
- [ ] Temas claro/escuro
- [ ] Internacionalização (i18n)
- [ ] Performance optimizations
- [ ] Testes unitários

---

## 🎓 **Metodologia de Ensino**

### **Abordagem Step-by-Step**
1. **Explicação conceitual**: Por que fazemos assim?
2. **Implementação guiada**: Codificando juntos
3. **Desafios práticos**: Exercícios para fixar
4. **Code Review**: Revisando e melhorando

### **Princípios que seguiremos**
- 🧠 **Entender antes de implementar**
- 🔧 **Prática deliberada**
- 📚 **Documentação como aprendizado**
- 🎯 **Projeto real, problemas reais**

---

## 📖 **Recursos para Estudar**

### **Documentações Oficiais**
- [Next.js Docs](https://nextjs.org/docs)
- [React Docs](https://react.dev)
- [Prisma Docs](https://www.prisma.io/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)

### **Conceitos Importantes**
- Server vs Client Components
- Database modeling
- API design
- Component composition
- State management

---

*Este projeto é uma jornada de aprendizado. Cada commit, cada linha de código é uma oportunidade de crescer como desenvolvedor!* 🚀
