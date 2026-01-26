import express from 'express';
import {
  getPagamentos,
  getPagamentoById,
  createPagamento,
  updatePagamento,
  deletePagamento,
  anexarBoleto
} from '../controllers/financeiro.controller.js';
import { authenticate } from '../middleware/auth.js';
import { body } from 'express-validator';

const router = express.Router();

router.use(authenticate);

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
    body('status').optional().isIn(['pago', 'pendente', 'vencido']),
    body('valor').optional().isFloat({ min: 0 })
  ],
  updatePagamento
);
router.post('/:id/boleto', anexarBoleto);
router.delete('/:id', deletePagamento);

export default router;
