import { supabase } from '../config/supabase.js';
import { validationResult } from 'express-validator';

export const getOperadoras = async (req, res, next) => {
  try {
    const { status } = req.query;
    console.log(`[getOperadoras] Fetching operators. Status filter: ${status || 'all'}`);

    // console.log(`[getOperadoras] Fetching operators. Status filter: ${status || 'all'}`);

    let query = supabase
      .from('operadoras')
      .select(`
        *,
        planos:planos(count),
        beneficiarios:beneficiarios(count)
      `)
      .order('nome', { ascending: true });

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;

    if (error) {
      console.error('[getOperadoras] Supabase error:', error);
      return res.status(400).json({ error: error.message });
    }

    // DEBUG: If empty, try a simple query to check if it's a join issue or RLS
    if (!data || data.length === 0) {
      console.log('[getOperadoras] Main query returned 0 rows. Testing simple SELECT *...');
      const { count } = await supabase.from('operadoras').select('*', { count: 'exact', head: true });
      console.log(`[getOperadoras] Simple SELECT count: ${count}`);

      // INJECT DEBUG INFO INTO RESPONSE IF EMPTY
      // This allows the user to see server-state in the frontend list
      const hasServiceKey = !!process.env.SUPABASE_SERVICE_KEY;
      const hasAnonKey = !!process.env.SUPABASE_KEY;

      data.push({
        id: 'debug-info',
        nome: `DEBUG: ServiceKey=${hasServiceKey} | Rows=${count}`,
        status: 'ativa',
        cor: 'from-destructive to-destructive/80',
        planos: 0,
        beneficiarios: 0
      });
    } else {
      console.log(`[getOperadoras] Successfully fetched ${data.length} operators`);
    }

    // Formatar resposta
    const operadoras = data.map(op => ({
      ...op,
      planos: op.planos?.[0]?.count || 0,
      beneficiarios: op.beneficiarios?.[0]?.count || 0
    }));

    res.json(operadoras);
  } catch (error) {
    console.error('[getOperadoras] Unexpected error:', error);
    next(error);
  }
};

export const getOperadoraById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('operadoras')
      .select(`
        *,
        planos:planos(count),
        beneficiarios:beneficiarios(count)
      `)
      .eq('id', id)
      .single();

    if (error) {
      return res.status(404).json({ error: 'Operadora not found' });
    }

    res.json({
      ...data,
      planos: data.planos?.[0]?.count || 0,
      beneficiarios: data.beneficiarios?.[0]?.count || 0
    });
  } catch (error) {
    next(error);
  }
};

export const createOperadora = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { nome, status, cor, cnpj, telefone, email, endereco } = req.body;

    const { data, error } = await supabase
      .from('operadoras')
      .insert({
        nome,
        status: status || 'ativa',
        cor: cor || 'from-primary to-primary/80',
        cnpj: cnpj || null,
        telefone: telefone || null,
        email: email || null,
        endereco: endereco || null,
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

export const updateOperadora = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const updates = { ...req.body, updated_at: new Date().toISOString() };

    const { data, error } = await supabase
      .from('operadoras')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    if (!data) {
      return res.status(404).json({ error: 'Operadora not found' });
    }

    res.json(data);
  } catch (error) {
    next(error);
  }
};

export const deleteOperadora = async (req, res, next) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('operadoras')
      .delete()
      .eq('id', id);

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({ message: 'Operadora deleted successfully' });
  } catch (error) {
    next(error);
  }
};