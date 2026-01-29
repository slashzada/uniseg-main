import { supabase } from '../config/supabase.js';
import { validationResult } from 'express-validator';

export const getPlanos = async (req, res, next) => {
  try {
    const { tipo, operadora_id, busca } = req.query;

    let query = supabase
      .from('planos')
      .select('*')
      .order('nome', { ascending: true });

    if (tipo) {
      query = query.eq('tipo', tipo);
    }

    if (operadora_id) {
      query = query.eq('operadora_id', operadora_id);
    }

    if (busca) {
      // Simplified search without joining (since joins are broken)
      query = query.ilike('nome', `%${busca}%`);
    }

    const { data, error } = await query;

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    // Formatar resposta
    const planos = data.map(plano => ({
      ...plano,
      // Default to ID or placeholder since join is removed
      operadora: plano.operadora_id ? 'Ver Detalhes' : 'N/A',
      beneficiarios: 0
    }));

    res.json(planos);
  } catch (error) {
    next(error);
  }
};

export const getPlanoById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('planos')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      return res.status(404).json({ error: 'Plano not found' });
    }

    res.json({
      ...data,
      operadora: 'N/A', // Placeholder since join is removed
      beneficiarios: 0
    });
  } catch (error) {
    next(error);
  }
};

export const createPlano = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { nome, operadora_id, valor, tipo, popular, descricao } = req.body;

    const { data, error } = await supabase
      .from('planos')
      .insert({
        nome,
        operadora_id,
        valor,
        tipo,
        popular: popular || false,
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

export const updatePlano = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const updates = { ...req.body, updated_at: new Date().toISOString() };

    const { data, error } = await supabase
      .from('planos')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    if (!data) {
      return res.status(404).json({ error: 'Plano not found' });
    }

    res.json(data);
  } catch (error) {
    next(error);
  }
};

export const deletePlano = async (req, res, next) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('planos')
      .delete()
      .eq('id', id);

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({ message: 'Plano deleted successfully' });
  } catch (error) {
    next(error);
  }
};