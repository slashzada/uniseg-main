import express from 'express';
import { 
  getVendedores, 
  createVendedor, 
  updateVendedor, 
  deleteVendedor 
} from '../controllers/vendedores.controller.js';
import { authenticate } from '../middleware/auth.js';
import { body } from 'express-validator';

const router = express.Router();

router.use(authenticate);

router.get('/', getVendedores);
router.post('/', 
  [
    body('nome').notEmpty().trim(),
    body('email').isEmail().optional(),
    body('comissao').isFloat({ min: 0, max: 100 }).optional()
  ],
  createVendedor
);
router.put('/:id', 
  [
    body('nome').optional().notEmpty().trim(),
    body('email').isEmail().optional(),
    body('comissao').isFloat({ min: 0, max: 100 }).optional(),
    body('status').isIn(['ativo', 'inativo']).optional()
  ],
  updateVendedor
);
router.delete('/:id', deleteVendedor);

export default router;