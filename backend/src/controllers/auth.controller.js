import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Usuario } from '../models/Usuario.js';
import { validationResult } from 'express-validator';

export const login = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { email, senha } = req.body;

    const user = await Usuario.findOne({ email: email.toLowerCase() }).lean();
    if (!user) return res.status(401).json({ error: 'Invalid email or password' });

    const isValidPassword = await bcrypt.compare(senha, user.senha_hash);
    if (!isValidPassword) return res.status(401).json({ error: 'Invalid email or password' });

    user.id = user._id.toString();

    const token = jwt.sign(
      { id: user.id, email: user.email, nome: user.nome, papel: user.papel, vendedor_id: user.vendedor_id },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    const { senha_hash, _id, __v, ...userWithoutPassword } = user;

    res.json({ token, user: userWithoutPassword });
  } catch (error) { next(error); }
};

export const register = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { nome, email, senha, papel } = req.body;

    const existingUser = await Usuario.findOne({ email: email.toLowerCase() });
    if (existingUser) return res.status(400).json({ error: 'User already exists' });

    const senha_hash = await bcrypt.hash(senha, 10);

    let user = new Usuario({
      nome,
      email: email.toLowerCase(),
      senha_hash,
      papel: papel || 'Vendedor'
    });
    await user.save();
    user = user.toObject();
    user.id = user._id.toString();

    const token = jwt.sign(
      { id: user.id, email: user.email, nome: user.nome, papel: user.papel },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    const { senha_hash: _, _id, __v, ...userWithoutPassword } = user;

    res.status(201).json({ token, user: userWithoutPassword });
  } catch (error) { next(error); }
};

export const getCurrentUser = async (req, res, next) => {
  try {
    const user = await Usuario.findById(req.user.id).select('-senha_hash -__v').lean();
    if (!user) return res.status(404).json({ error: 'User not found' });
    user.id = user._id.toString();
    res.json(user);
  } catch (error) { next(error); }
};
