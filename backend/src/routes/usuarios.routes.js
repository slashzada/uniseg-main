import express from 'express';
import { 
  getUsuarios, 
  createUsuario, 
  updateUsuario, 
  deleteUsuario 
} from '../controllers/usuarios.controller.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { body } from 'express-validator';

const router = express.Router();

// All user management routes require Admin role
router.use(authenticate, authorize('Admin'));

router.get('/', getUsuarios);
router.post('/', 
  [
    body('nome').notEmpty().trim(),
    body('email').isEmail().normalizeEmail(),
    body('senha').isLength({ min: 6 }),
    body('papel').isIn(['Admin', 'Financeiro', 'Vendedor'])
  ],
  createUsuario
);
router.put('/:id', 
  [
    body('nome').optional().notEmpty().trim(),
    body('email').optional().isEmail().normalizeEmail(),
    body('senha').optional().isLength({ min: 6 }),
    body('papel').optional().isIn(['Admin', 'Financeiro', 'Vendedor'])
  ],
  updateUsuario
);
router.delete('/:id', deleteUsuario);

export default router;