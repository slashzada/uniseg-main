import { supabase } from '../config/supabase.js';
import { validationResult } from 'express-validator';

// Fetch the single global configuration row
export const getConfiguracoes = async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('configuracoes_globais')
      .select('*')
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 means no rows found
      return res.status(400).json({ error: error.message });
    }
    
    // If no row exists, return defaults (shouldn't happen if seed runs)
    if (!data) {
        return res.json({
            taxa_admin: 5.00,
            dias_carencia: 30,
            multa_atraso: 2.00,
        });
    }

    res.json(data);
  } catch (error) {
    next(error);
  }
};

// Update the global configuration row (requires Admin role via RLS)
export const updateConfiguracoes = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const updates = { ...req.body, updated_at: new Date().toISOString() };

    // We assume there is only one row (singleton pattern)
    const { data, error } = await supabase
      .from('configuracoes_globais')
      .update(updates)
      .limit(1)
      .select()
      .single();

    if (error) {
      // RLS will handle permission denial (403 Forbidden) if not Admin
      return res.status(400).json({ error: error.message });
    }

    res.json(data);
  } catch (error) {
    next(error);
  }
};