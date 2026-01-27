import express from 'express';
import { getVendedores } from '../controllers/vendedores.controller.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);

router.get('/', getVendedores);

export default router;