import express from 'express';
import { getStats, getRevenueChart } from '../controllers/dashboard.controller.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);

router.get('/stats', getStats);
router.get('/revenue', getRevenueChart);

export default router;
