import express from 'express';
import { getResumo, liquidarComissoes, generateReport } from '../controllers/comissoes.controller.js';
import { authenticate, requireNotVendedor } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);

// Vendedores can see their own report potentially, but for now restricting to Admin/Financeiro
// or we can allow Vendedor to see only their own data in getResumo (needs adjustment in controller)
// The controller currently returns ALL sellers.
// For now, require Not Vendedor for the main list.
router.use(requireNotVendedor);

router.get('/resumo', getResumo);
router.post('/liquidar/:vendedorId', liquidarComissoes);
router.get('/relatorio', generateReport);

export default router;
