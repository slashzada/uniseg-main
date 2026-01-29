import express from 'express';
import {
  getOperadoras,
  getOperadoraById,
  createOperadora,
  updateOperadora,
  deleteOperadora
} from '../controllers/operadoras.controller.js';
import { authenticate, requireNotVendedor } from '../middleware/auth.js';
import { body } from 'express-validator';

const router = express.Router();

// Public routes (for debugging/listing)
router.get('/', getOperadoras);
router.get('/:id', getOperadoraById);

// Protected routes - Only Admin and Financeiro can create/update/delete operadoras
router.use(authenticate);

router.post('/',
  requireNotVendedor,
  [
    body('nome').notEmpty().trim(),
    body('cnpj').notEmpty().withMessage('CNPJ is required'),
    body('telefone').optional().trim(),
    body('email').optional().isEmail().normalizeEmail(),
    body('endereco').optional().trim(),
    body('status').isIn(['ativa', 'inativa']).optional()
  ],
  createOperadora
);
router.put('/:id',
  requireNotVendedor,
  [
    body('nome').optional().notEmpty().trim(),
    body('status').optional().isIn(['ativa', 'inativa'])
  ],
  updateOperadora
);
router.delete('/:id', requireNotVendedor, deleteOperadora);

export default router;