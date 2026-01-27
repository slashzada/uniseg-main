import express from 'express';
import {
  getOperadoras,
  getOperadoraById,
  createOperadora,
  updateOperadora,
  deleteOperadora
} from '../controllers/operadoras.controller.js';
import { authenticate } from '../middleware/auth.js';
import { body } from 'express-validator';

const router = express.Router();

router.use(authenticate);

router.get('/', getOperadoras);
router.get('/:id', getOperadoraById);
router.post('/',
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
  [
    body('nome').optional().notEmpty().trim(),
    body('status').optional().isIn(['ativa', 'inativa'])
  ],
  updateOperadora
);
router.delete('/:id', deleteOperadora);

export default router;