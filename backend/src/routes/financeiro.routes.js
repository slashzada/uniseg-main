import express from 'express';
import {
  getPagamentos,
  getPagamentoById,
  createPagamento,
  updatePagamento,
  deletePagamento,
  anexarBoleto,
  confirmarPagamento,
  rejeitarPagamento
} from '../controllers/financeiro.controller.js';
import { authenticate, requireNotVendedor } from '../middleware/auth.js';
import { body } from 'express-validator';

const router = express.Router();

// Financeiro routes
router.use(authenticate);

// Publicly readable/uploadable for authenticated users (Controller handles vendor filtering)
router.get('/', getPagamentos);
router.post('/:id/boleto', anexarBoleto);

// Admin/Financeiro only routes
router.use(requireNotVendedor);

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
router.post('/:id/confirmar', confirmarPagamento);
router.post('/:id/rejeitar', rejeitarPagamento);
router.delete('/:id', deletePagamento);

export default router;

