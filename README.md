# Uniseguros Control Center

Sistema de controle e gestão de planos de saúde desenvolvido com React, Node.js e Supabase.

## 🚀 Tecnologias

### Frontend
- **React** + **TypeScript**
- **Vite** - Build tool
- **shadcn-ui** - Componentes UI
- **Tailwind CSS** - Estilização
- **React Router** - Roteamento
- **React Query** - Gerenciamento de estado servidor

### Backend
- **Node.js** + **Express**
- **Supabase** (PostgreSQL)
- **JWT** - Autenticação
- **bcryptjs** - Hash de senhas

## 📦 Estrutura do Projeto

```
.
├── backend/              # API Backend
│   ├── src/
│   │   ├── config/      # Configurações (Supabase)
│   │   ├── controllers/ # Controllers da API
│   │   ├── middleware/  # Middlewares (auth, error)
│   │   ├── routes/      # Rotas da API
│   │   └── server.js    # Servidor Express
│   ├── database/        # Scripts SQL
│   └── package.json
├── src/                 # Frontend React
│   ├── components/      # Componentes React
│   ├── contexts/        # Contextos (Auth)
│   ├── lib/             # Utilitários e API
│   ├── pages/           # Páginas da aplicação
│   └── main.tsx
└── package.json
```

## 🛠️ Desenvolvimento Local

### Pré-requisitos

- Node.js 18+
- Conta no Supabase (para banco de dados)

### 1. Clonar o repositório

```bash
git clone <seu-repositorio>
cd uniseguros-control-center-main
```

### 2. Configurar Backend

```bash
cd backend
npm install
cp .env.example .env
```

Edite o `.env` com suas credenciais do Supabase.

### 3. Configurar Banco de Dados

1. Acesse o [Supabase Dashboard](https://app.supabase.com)
2. Crie um novo projeto
3. No SQL Editor, execute o script `backend/database/schema.sql`
4. (Opcional) Execute `backend/database/seed.sql` para dados iniciais

### 4. Iniciar Backend

```bash
cd backend
npm run dev
```

O backend estará em `http://localhost:3000`

### 5. Configurar Frontend

```bash
# Na raiz do projeto
npm install
cp .env.example .env
```

Edite o `.env`:
```env
VITE_API_URL=http://localhost:3000/api
```

### 6. Iniciar Frontend

```bash
npm run dev
```

O frontend estará em `http://localhost:5173`

## 🚢 Deploy

Para instruções completas de deploy no **Netlify** (frontend), **Render** (backend) e **Supabase** (banco de dados), consulte o arquivo [DEPLOY.md](./DEPLOY.md).

## 📚 Documentação

- [Backend README](./backend/README.md) - Documentação da API
- [Guia de Deploy](./DEPLOY.md) - Instruções detalhadas de deploy

## 🔐 Credenciais Padrão

Após executar o seed, você pode usar:

- **Admin**: `admin@uniseguros.com` / `admin123`
- **Financeiro**: `maria@uniseguros.com` / `maria123`
- **Vendedor**: `joao@uniseguros.com` / `joao123`

**⚠️ IMPORTANTE**: Altere essas senhas em produção!

## 📝 Licença

Este projeto é privado e proprietário.
