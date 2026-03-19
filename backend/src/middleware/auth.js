import jwt from 'jsonwebtoken';
import { Usuario } from '../models/Usuario.js';

export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Fetch latest user data from DB to ensure vendedor_id is up to date
    const user = await Usuario.findById(decoded.id).select('email nome papel vendedor_id').lean();

    if (!user) {
      return res.status(401).json({ error: 'User not found or database sync error' });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!roles.includes(req.user.papel)) {
      return res.status(403).json({ error: 'Forbidden: Insufficient permissions' });
    }

    next();
  };
};

// Helper middleware for common permission checks
export const requireAdmin = authorize('Admin');
export const requireFinanceiroOrAdmin = authorize('Admin', 'Financeiro');
export const requireNotVendedor = authorize('Admin', 'Financeiro');

