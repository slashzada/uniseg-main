import express from 'express';
import {
  getPagamentos,
  getPagamentoById,
  createPagamento,
  updatePagamento,
  deletePagamento,
  anexarBoleto,
  confirmarPagamento
} from '../controllers/financeiro.controller.js';
import { authenticate, requireNotVendedor } from '../middleware/auth.js';
import { body } from 'express-validator';

const router = express.Router();

// All financial routes require authentication and Admin/Financeiro role
router.use(authenticate);
router.use(requireNotVendedor);

router.get('/', getPagamentos);
router.get('/:id', getPagamentoById);
router.post('/',
  [
    body('beneficiario_id').isUUID(),
    body('valor').isFloat({ min: 0 }),
    body('vencimento').isISO8601()
  ],
  createPagamento
);
router.put('/:id',
  [
    body('status').optional().isIn(['pago', 'pendente', 'vencido', 'comprovante_anexado']),
    body('valor').optional().isFloat({ min: 0 })
  ],
  updatePagamento
);
router.post('/:id/boleto', anexarBoleto);
router.post('/:id/confirmar', confirmarPagamento); // Only Admin/Financeiro can confirm
router.delete('/:id', deletePagamento);

export default router;

