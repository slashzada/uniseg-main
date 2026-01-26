import express from 'express';
import { login, register, getCurrentUser } from '../controllers/auth.controller.js';
import { authenticate } from '../middleware/auth.js';
import { body } from 'express-validator';

const router = express.Router();

router.post('/login',
  [
    body('email').isEmail().normalizeEmail(),
    body('senha').notEmpty().withMessage('Password is required')
  ],
  login
);

router.post('/register',
  [
    body('nome').notEmpty().trim(),
    body('email').isEmail().normalizeEmail(),
    body('senha').isLength({ min: 6 }),
    body('papel').isIn(['Admin', 'Financeiro', 'Vendedor'])
  ],
  register
);

router.get('/me', authenticate, getCurrentUser);

export default router;
