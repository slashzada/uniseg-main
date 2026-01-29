import express from 'express';
import { getConfiguracoes, updateConfiguracoes } from '../controllers/configuracoes.controller.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';
import { body } from 'express-validator';

const router = express.Router();

// Configuration routes are only accessible by Admin
router.use(authenticate);
router.use(requireAdmin);

router.get('/', getConfiguracoes);
router.put('/',
  [
    body('taxa_admin').isFloat({ min: 0 }).optional(),
    body('dias_carencia').isInt({ min: 0 }).optional(),
    body('multa_atraso').isFloat({ min: 0 }).optional(),
  ],
  updateConfiguracoes
);

export default router;