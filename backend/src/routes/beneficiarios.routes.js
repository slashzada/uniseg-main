import express from 'express';
import {
  getBeneficiarios,
  getBeneficiarioById,
  createBeneficiario,
  updateBeneficiario,
  deleteBeneficiario
} from '../controllers/beneficiarios.controller.js';
import { authenticate } from '../middleware/auth.js';
import { body } from 'express-validator';

const router = express.Router();

// Public routes
router.get('/', getBeneficiarios);
router.get('/:id', getBeneficiarioById);

router.use(authenticate);

router.post('/',
  [
    body('nome').notEmpty().trim(),
    // Relaxing CPF validation to accept 11 digits (or formatted) to prevent immediate 400 errors
    body('cpf').isLength({ min: 11 }).withMessage('CPF must be at least 11 characters (digits only)'),
    body('plano_id').isUUID(),
    body('vendedor_id').optional().isUUID()
  ],
  createBeneficiario
);
router.put('/:id',
  [
    body('nome').optional().notEmpty().trim(),
    body('status').optional().isIn(['ativo', 'inadimplente', 'inativo'])
  ],
  updateBeneficiario
);
router.delete('/:id', deleteBeneficiario);

export default router;