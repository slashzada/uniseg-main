import { Usuario } from '../models/Usuario.js';
import { validationResult } from 'express-validator';
import bcrypt from 'bcryptjs';

export const getUsuarios = async (req, res, next) => {
  try {
    const data = await Usuario.find().select('-senha_hash -__v').sort({ nome: 1 }).lean();
    const usuarios = data.map(u => ({ ...u, id: u._id.toString() }));
    res.json(usuarios);
  } catch (error) { next(error); }
};

export const createUsuario = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { nome, email, senha, papel, vendedor_id } = req.body;

    const existingUser = await Usuario.findOne({ email: email.toLowerCase() });
    if (existingUser) return res.status(400).json({ error: 'User already exists' });

    const senha_hash = await bcrypt.hash(senha, 10);

    let usuario = new Usuario({
      nome, email: email.toLowerCase(), senha_hash, papel: papel || 'Vendedor', vendedor_id: vendedor_id || null
    });
    await usuario.save();

    usuario = usuario.toObject();
    usuario.id = usuario._id.toString();
    const { senha_hash: _, __v, _id, ...safeUser } = usuario;

    res.status(201).json(safeUser);
  } catch (error) { next(error); }
};

export const updateUsuario = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { senha, ...updates } = req.body;
    if (senha) updates.senha_hash = await bcrypt.hash(senha, 10);

    let usuario = await Usuario.findByIdAndUpdate(req.params.id, updates, { new: true }).select('-senha_hash -__v').lean();
    if (!usuario) return res.status(404).json({ error: 'User not found' });
    
    usuario.id = usuario._id.toString();
    res.json(usuario);
  } catch (error) { next(error); }
};

export const deleteUsuario = async (req, res, next) => {
  try {
    const usuario = await Usuario.findByIdAndDelete(req.params.id);
    if (!usuario) return res.status(404).json({ error: 'User not found' });
    res.json({ message: 'User deleted successfully' });
  } catch (error) { next(error); }
};