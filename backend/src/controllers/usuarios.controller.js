import { supabase } from '../config/supabase.js';
import { validationResult } from 'express-validator';
import bcrypt from 'bcryptjs';

export const getUsuarios = async (req, res, next) => {
  try {
    // Only fetch non-sensitive data
    const { data, error } = await supabase
      .from('usuarios')
      .select('id, nome, email, papel, vendedor_id, created_at')
      .order('nome', { ascending: true });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json(data);
  } catch (error) {
    next(error);
  }
};

export const createUsuario = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { nome, email, senha, papel, vendedor_id } = req.body;

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('usuarios')
      .select('id')
      .eq('email', email.toLowerCase())
      .single();

    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const senha_hash = await bcrypt.hash(senha, 10);

    // Create user
    const { data, error } = await supabase
      .from('usuarios')
      .insert({
        nome,
        email: email.toLowerCase(),
        senha_hash,
        papel: papel || 'Vendedor',
        vendedor_id: vendedor_id || null,
        created_at: new Date().toISOString()
      })
      .select('id, nome, email, papel, vendedor_id, created_at')
      .single();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.status(201).json(data);
  } catch (error) {
    next(error);
  }
};

export const updateUsuario = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { senha, ...updates } = req.body;

    if (senha) {
      updates.senha_hash = await bcrypt.hash(senha, 10);
    }

    updates.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('usuarios')
      .update(updates)
      .eq('id', id)
      .select('id, nome, email, papel, vendedor_id, created_at')
      .single();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    if (!data) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(data);
  } catch (error) {
    next(error);
  }
};

export const deleteUsuario = async (req, res, next) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('usuarios')
      .delete()
      .eq('id', id);

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    next(error);
  }
};