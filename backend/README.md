# Uniseguros Control Center - Backend API

Backend API para o sistema de controle de planos de saúde Uniseguros.

## 🚀 Tecnologias

- **Node.js** com **Express**
- **Supabase** (PostgreSQL)
- **JWT** para autenticação
- **bcryptjs** para hash de senhas

## 📋 Pré-requisitos

- Node.js 18+ instalado
- Conta no Supabase
- Conta no Render (para deploy)

## 🔧 Configuração Local

### 1. Instalar dependências

```bash
cd backend
npm install
```

### 2. Configurar variáveis de ambiente

Copie o arquivo `.env.example` para `.env`:

```bash
cp .env.example .env
```

Edite o arquivo `.env` com suas credenciais do Supabase:

```env
PORT=3000
NODE_ENV=development

# Supabase
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_KEY=sua_anon_key
SUPABASE_SERVICE_KEY=sua_service_key

# JWT
JWT_SECRET=seu_jwt_secret_aqui_mude_em_producao
JWT_EXPIRES_IN=7d

# CORS
FRONTEND_URL=http://localhost:5173
```

### 3. Configurar banco de dados no Supabase

1. Acesse o [Supabase Dashboard](https://app.supabase.com)
2. Crie um novo projeto ou use um existente
3. Vá em **SQL Editor**
4. Execute o script `database/schema.sql` para criar as tabelas
5. (Opcional) Execute o script `database/seed.sql` para dados iniciais

### 4. Executar o servidor

```bash
npm run dev
```

O servidor estará rodando em `http://localhost:3000`

## 📡 Endpoints da API

### Autenticação
- `POST /api/auth/login` - Login
- `POST /api/auth/register` - Registro (apenas Admin)
- `GET /api/auth/me` - Obter usuário atual

### Operadoras
- `GET /api/operadoras` - Listar operadoras
- `GET /api/operadoras/:id` - Obter operadora
- `POST /api/operadoras` - Criar operadora
- `PUT /api/operadoras/:id` - Atualizar operadora
- `DELETE /api/operadoras/:id` - Deletar operadora

### Planos
- `GET /api/planos` - Listar planos
- `GET /api/planos/:id` - Obter plano
- `POST /api/planos` - Criar plano
- `PUT /api/planos/:id` - Atualizar plano
- `DELETE /api/planos/:id` - Deletar plano

### Beneficiários
- `GET /api/beneficiarios` - Listar beneficiários
- `GET /api/beneficiarios/:id` - Obter beneficiário
- `POST /api/beneficiarios` - Criar beneficiário
- `PUT /api/beneficiarios/:id` - Atualizar beneficiário
- `DELETE /api/beneficiarios/:id` - Deletar beneficiário

### Financeiro
- `GET /api/financeiro` - Listar pagamentos
- `GET /api/financeiro/:id` - Obter pagamento
- `POST /api/financeiro` - Criar pagamento
- `PUT /api/financeiro/:id` - Atualizar pagamento
- `POST /api/financeiro/:id/boleto` - Anexar boleto
- `DELETE /api/financeiro/:id` - Deletar pagamento

### Dashboard
- `GET /api/dashboard/stats` - Estatísticas gerais
- `GET /api/dashboard/revenue` - Gráfico de receita

## 🚢 Deploy no Render

### 1. Preparar o repositório

Certifique-se de que o backend está em uma pasta separada ou na raiz do projeto.

### 2. Criar serviço no Render

1. Acesse [Render Dashboard](https://dashboard.render.com)
2. Clique em **New +** → **Web Service**
3. Conecte seu repositório GitHub/GitLab
4. Configure o serviço:
   - **Name**: `uniseguros-backend` (ou o nome que preferir)
   - **Environment**: `Node`
   - **Build Command**: `cd backend && npm install`
   - **Start Command**: `cd backend && npm start`
   - **Root Directory**: Deixe em branco ou especifique se necessário

### 3. Configurar variáveis de ambiente no Render

No painel do serviço, vá em **Environment** e adicione:

```
NODE_ENV=production
PORT=10000
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_KEY=sua_anon_key
SUPABASE_SERVICE_KEY=sua_service_key
JWT_SECRET=seu_jwt_secret_forte_aqui
JWT_EXPIRES_IN=7d
FRONTEND_URL=https://seu-app.netlify.app
```

**⚠️ IMPORTANTE**: 
- Use um `JWT_SECRET` forte e único em produção
- Use a `SUPABASE_SERVICE_KEY` (não a anon key) para operações administrativas
- Configure o `FRONTEND_URL` com a URL do seu frontend no Netlify

### 4. Deploy

O Render fará o deploy automaticamente. Após concluir, você terá uma URL como:
`https://uniseguros-backend.onrender.com`

### 5. Configurar CORS no Supabase (se necessário)

No Supabase Dashboard, vá em **Settings** → **API** e adicione a URL do Render nas configurações de CORS se necessário.

## 🔒 Segurança

- Todas as rotas (exceto `/api/auth/login` e `/api/auth/register`) requerem autenticação via JWT
- Senhas são hasheadas com bcrypt (10 rounds)
- Use HTTPS em produção
- Configure CORS adequadamente
- Use variáveis de ambiente para secrets

## 📝 Notas

- O servidor usa a porta definida em `PORT` ou 3000 por padrão
- O Render usa a porta 10000 por padrão, mas você pode usar qualquer porta
- Certifique-se de que o Supabase está configurado com as políticas RLS adequadas se necessário

## 🐛 Troubleshooting

### Erro de conexão com Supabase
- Verifique se as variáveis `SUPABASE_URL` e `SUPABASE_KEY` estão corretas
- Verifique se o projeto Supabase está ativo

### Erro de CORS
- Verifique se `FRONTEND_URL` está configurado corretamente
- Verifique as configurações de CORS no Supabase

### Erro 401 (Unauthorized)
- Verifique se o token JWT está sendo enviado no header `Authorization: Bearer <token>`
- Verifique se o `JWT_SECRET` está configurado corretamente
