# 🚀 Guia de Deploy - Uniseguros Control Center

Este guia explica como fazer o deploy completo do projeto usando **Netlify** (frontend), **Render** (backend) e **Supabase** (banco de dados).

## 📋 Pré-requisitos

- Conta no [Supabase](https://supabase.com)
- Conta no [Render](https://render.com)
- Conta no [Netlify](https://netlify.com)
- Git instalado
- Node.js 18+ instalado (para desenvolvimento local)

## 🗄️ Passo 1: Configurar Supabase

### 1.1 Criar projeto no Supabase

1. Acesse [Supabase Dashboard](https://app.supabase.com)
2. Clique em **New Project**
3. Preencha:
   - **Name**: `uniseguros` (ou o nome que preferir)
   - **Database Password**: Escolha uma senha forte
   - **Region**: Escolha a região mais próxima
4. Aguarde a criação do projeto (pode levar alguns minutos)

### 1.2 Criar as tabelas

1. No Supabase Dashboard, vá em **SQL Editor**
2. Clique em **New Query**
3. Copie e cole o conteúdo do arquivo `backend/database/schema.sql`
4. Clique em **Run** (ou pressione `Ctrl+Enter`)
5. Aguarde a confirmação de sucesso

### 1.3 Inserir dados iniciais (opcional)

1. No **SQL Editor**, crie uma nova query
2. Copie e cole o conteúdo do arquivo `backend/database/seed.sql`
3. **IMPORTANTE**: Antes de executar, você precisa gerar os hashes das senhas:
   ```bash
   cd backend
   npm install
   node database/generate-hash.js
   ```
4. Substitua os hashes no `seed.sql` com os valores gerados
5. Execute a query

### 1.4 Obter credenciais

1. No Supabase Dashboard, vá em **Settings** → **API**
2. Anote:
   - **Project URL** (será usado como `SUPABASE_URL`)
   - **anon public** key (será usado como `SUPABASE_KEY`)
   - **service_role** key (será usado como `SUPABASE_SERVICE_KEY`)

## 🔧 Passo 2: Deploy do Backend no Render

### 2.1 Preparar o repositório

Certifique-se de que seu código está em um repositório Git (GitHub, GitLab ou Bitbucket).

### 2.2 Criar Web Service no Render

1. Acesse [Render Dashboard](https://dashboard.render.com)
2. Clique em **New +** → **Web Service**
3. Conecte seu repositório
4. Configure o serviço:
   - **Name**: `uniseguros-backend`
   - **Environment**: `Node`
   - **Region**: Escolha a região mais próxima
   - **Branch**: `main` (ou sua branch principal)
   - **Root Directory**: Deixe em branco
   - **Build Command**: `cd backend && npm install`
   - **Start Command**: `cd backend && npm start`

### 2.3 Configurar variáveis de ambiente

No painel do serviço, vá em **Environment** e adicione:

```
NODE_ENV=production
PORT=10000
SUPABASE_URL=https://seu-projeto-id.supabase.co
SUPABASE_KEY=sua_anon_key_aqui
SUPABASE_SERVICE_KEY=sua_service_key_aqui
JWT_SECRET=seu_jwt_secret_forte_e_aleatorio_aqui
JWT_EXPIRES_IN=7d
FRONTEND_URL=https://seu-app.netlify.app
```

**⚠️ IMPORTANTE**:
- Substitua `seu-projeto-id`, `sua_anon_key_aqui` e `sua_service_key_aqui` pelas credenciais do Supabase
- Gere um `JWT_SECRET` forte (pode usar: `openssl rand -base64 32`)
- O `FRONTEND_URL` será configurado depois, quando o frontend estiver no Netlify

### 2.4 Deploy

1. Clique em **Create Web Service**
2. Aguarde o deploy (pode levar alguns minutos)
3. Anote a URL do serviço (ex: `https://uniseguros-backend.onrender.com`)

### 2.5 Testar o backend

Acesse `https://seu-backend.onrender.com/health` no navegador. Deve retornar:
```json
{"status":"ok","timestamp":"..."}
```

## 🌐 Passo 3: Deploy do Frontend no Netlify

### 3.1 Preparar variáveis de ambiente

Crie um arquivo `.env.production` na raiz do projeto:

```env
VITE_API_URL=https://seu-backend.onrender.com/api
```

Substitua `seu-backend.onrender.com` pela URL do seu backend no Render.

### 3.2 Criar site no Netlify

1. Acesse [Netlify Dashboard](https://app.netlify.com)
2. Clique em **Add new site** → **Import an existing project**
3. Conecte seu repositório
4. Configure o build:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
   - **Base directory**: Deixe em branco

### 3.3 Configurar variáveis de ambiente

1. No painel do site, vá em **Site settings** → **Environment variables**
2. Adicione:
   ```
   VITE_API_URL=https://seu-backend.onrender.com/api
   ```
   (Substitua pela URL do seu backend)

### 3.4 Atualizar CORS no backend

Volte ao Render e atualize a variável `FRONTEND_URL` com a URL do Netlify:
```
FRONTEND_URL=https://seu-app.netlify.app
```

O Render fará um redeploy automaticamente.

### 3.5 Deploy

1. No Netlify, clique em **Deploy site**
2. Aguarde o build e deploy
3. Anote a URL do site (ex: `https://uniseguros-control-center.netlify.app`)

## ✅ Passo 4: Verificação Final

### 4.1 Testar o frontend

1. Acesse a URL do Netlify
2. Tente fazer login com:
   - Email: `admin@uniseguros.com`
   - Senha: `admin123` (ou a senha que você configurou)

### 4.2 Verificar integração

- Teste criar uma operadora
- Teste criar um plano
- Teste criar um beneficiário
- Verifique o dashboard

## 🔒 Segurança em Produção

### Checklist de segurança:

- [ ] `JWT_SECRET` é forte e único
- [ ] `SUPABASE_SERVICE_KEY` está configurada (não a anon key)
- [ ] CORS está configurado corretamente
- [ ] Variáveis de ambiente não estão commitadas no Git
- [ ] HTTPS está habilitado (Netlify e Render fazem isso automaticamente)

## 🐛 Troubleshooting

### Backend não inicia no Render

- Verifique os logs no Render Dashboard
- Confirme que todas as variáveis de ambiente estão configuradas
- Verifique se o `PORT` está correto (Render usa 10000 por padrão)

### Erro de CORS

- Verifique se `FRONTEND_URL` no Render está correto
- Verifique se a URL do frontend no Netlify está correta
- Confirme que o CORS está configurado no `server.js`

### Erro 401 (Unauthorized)

- Verifique se o token está sendo salvo no localStorage
- Confirme que o `JWT_SECRET` está correto
- Verifique se o header `Authorization: Bearer <token>` está sendo enviado

### Frontend não conecta ao backend

- Verifique se `VITE_API_URL` está configurado corretamente
- Confirme que a URL do backend está acessível
- Verifique os logs do console do navegador (F12)

## 📝 Notas Adicionais

- O Render pode colocar serviços gratuitos em "sleep" após inatividade. Para evitar isso, considere o plano pago ou use um serviço de "ping" para manter o serviço ativo
- O Supabase tem limites no plano gratuito. Monitore o uso no dashboard
- Faça backup regular do banco de dados no Supabase

## 🆘 Suporte

Se encontrar problemas:
1. Verifique os logs no Render e Netlify
2. Verifique o console do navegador (F12)
3. Confirme que todas as variáveis de ambiente estão corretas
4. Verifique a documentação do [Render](https://render.com/docs), [Netlify](https://docs.netlify.com) e [Supabase](https://supabase.com/docs)
