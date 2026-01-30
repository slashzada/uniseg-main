import { supabase } from '../config/supabase.js';
import { validationResult } from 'express-validator';

export const getVendedores = async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('vendedores')
      .select(`
        *,
        beneficiarios (
          count
        )
      `)
      .order('nome', { ascending: true });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    const dataWithCounts = data.map(v => ({
      ...v,
      vendasMes: v.beneficiarios?.[0]?.count || 0,
      status: v.status || 'ativo'
    }));

    res.json(dataWithCounts);
  } catch (error) {
    next(error);
  }
};

export const createVendedor = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { nome, email, comissao, status } = req.body;

    const { data, error } = await supabase
      .from('vendedores')
      .insert({
        nome,
        email,
        comissao: comissao || 0,
        status: status || 'ativo',
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.status(201).json(data);
  } catch (error) {
    next(error);
  }
};

export const updateVendedor = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const updates = { ...req.body, updated_at: new Date().toISOString() };

    const { data, error } = await supabase
      .from('vendedores')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    if (!data) {
      return res.status(404).json({ error: 'Vendedor not found' });
    }

    res.json(data);
  } catch (error) {
    next(error);
  }
};

export const deleteVendedor = async (req, res, next) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('vendedores')
      .delete()
      .eq('id', id);

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({ message: 'Vendedor deleted successfully' });
  } catch (error) {
    next(error);
  }
};