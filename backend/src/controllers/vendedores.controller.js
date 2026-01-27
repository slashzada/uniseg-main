import { supabase } from '../config/supabase.js';

export const getVendedores = async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('vendedores')
      .select('id, nome, comissao')
      .order('nome', { ascending: true });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json(data);
  } catch (error) {
    next(error);
  }
};