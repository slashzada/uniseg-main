import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes.js';
import operadorasRoutes from './routes/operadoras.routes.js';
import planosRoutes from './routes/planos.routes.js';
import beneficiariosRoutes from './routes/beneficiarios.routes.js';
import financeiroRoutes from './routes/financeiro.routes.js';
import dashboardRoutes from './routes/dashboard.routes.js';
import vendedoresRoutes from './routes/vendedores.routes.js';
import usuariosRoutes from './routes/usuarios.routes.js';
import configuracoesRoutes from './routes/configuracoes.routes.js';
import comissoesRoutes from './routes/comissoes.routes.js';
import { errorHandler } from './middleware/errorHandler.js';
import connectDB from './config/db.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

// Conectar ao MongoDB
connectDB();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: '*', // Allow ALL origins for debugging
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir arquivos de boletos publicamente
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/operadoras', operadorasRoutes);
app.use('/api/planos', planosRoutes);
app.use('/api/beneficiarios', beneficiariosRoutes);
app.use('/api/financeiro', financeiroRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/vendedores', vendedoresRoutes);
app.use('/api/usuarios', usuariosRoutes);
app.use('/api/configuracoes', configuracoesRoutes);
app.use('/api/comissoes', comissoesRoutes);

// Error handler
app.use(errorHandler);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Force Render Deploy
