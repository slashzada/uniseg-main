import express from 'express';
import {
  getPlanos,
  getPlanoById,
  createPlano,
  updatePlano,
  deletePlano
} from '../controllers/planos.controller.js';
import { authenticate } from '../middleware/auth.js';
import { body } from 'express-validator';

const router = express.Router();

router.use(authenticate);

router.get('/', getPlanos);
router.get('/:id', getPlanoById);
router.post('/',
  [
    body('nome').notEmpty().trim(),
    body('operadora_id').isUUID(),
    body('valor').isFloat({ min: 0 }),
    body('tipo').isIn(['Individual', 'Familiar', 'Empresarial'])
  ],
  createPlano
);
router.put('/:id',
  [
    body('nome').optional().notEmpty().trim(),
    body('valor').optional().isFloat({ min: 0 }),
    body('tipo').optional().isIn(['Individual', 'Familiar', 'Empresarial'])
  ],
  updatePlano
);
router.delete('/:id', deletePlano);

export default router;
