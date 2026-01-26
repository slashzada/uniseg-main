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

router.use(authenticate);

router.get('/', getBeneficiarios);
router.get('/:id', getBeneficiarioById);
router.post('/',
  [
    body('nome').notEmpty().trim(),
    body('cpf').matches(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/).withMessage('Invalid CPF format'),
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
