# 🚀 Quick Start - Uniseguros Control Center

Guia rápido para começar a usar o sistema.

## ⚡ Setup Rápido (5 minutos)

### 1. Supabase (2 min)

1. Crie conta em [supabase.com](https://supabase.com)
2. Crie um novo projeto
3. Vá em **SQL Editor** → **New Query**
4. Cole o conteúdo de `backend/database/schema.sql`
5. Execute (Ctrl+Enter)
6. Anote as credenciais em **Settings** → **API**

### 2. Backend Local (1 min)

```bash
cd backend
npm install
cp .env.example .env
```

Edite `.env`:
```env
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_KEY=sua_anon_key
SUPABASE_SERVICE_KEY=sua_service_key
JWT_SECRET=qualquer_string_secreta_aqui
```

```bash
npm run dev
```

### 3. Frontend Local (1 min)

```bash
# Na raiz do projeto
npm install
cp .env.example .env
```

Edite `.env`:
```env
VITE_API_URL=http://localhost:3000/api
```

```bash
npm run dev
```

### 4. Login (1 min)

Acesse `http://localhost:5173` e faça login:
- Email: `admin@uniseguros.com`
- Senha: `admin123`

## 📝 Gerar Hashes de Senha

Se precisar gerar novos hashes:

```bash
cd backend
npm install
node database/generate-hash.js
```

Use os hashes gerados no arquivo `seed.sql`.

## 🚢 Deploy

Consulte [DEPLOY.md](./DEPLOY.md) para instruções completas.

## ❓ Problemas Comuns

### Backend não conecta ao Supabase
- Verifique se `SUPABASE_URL` e `SUPABASE_KEY` estão corretos
- Confirme que o projeto Supabase está ativo

### Frontend não conecta ao backend
- Verifique se `VITE_API_URL` está correto
- Confirme que o backend está rodando na porta 3000
- Verifique o console do navegador (F12)

### Erro 401 (Unauthorized)
- Faça logout e login novamente
- Verifique se o token está sendo salvo no localStorage
