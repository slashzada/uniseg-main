import { supabase } from '../config/supabase.js';
import { validationResult } from 'express-validator';

export const getBeneficiarios = async (req, res, next) => {
  try {
    const { status, vendedor_id, busca } = req.query;

    let query = supabase
      .from('beneficiarios')
      .select(`
        *,
        plano:planos(nome, valor, tipo, operadora:operadoras(nome)),
        vendedor:vendedores(nome, comissao)
      `)
      .order('created_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    if (vendedor_id) {
      query = query.eq('vendedor_id', vendedor_id);
    }

    if (busca) {
      query = query.or(`nome.ilike.%${busca}%,cpf.ilike.%${busca}%`);
    }

    const { data, error } = await query;

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    // Formatar resposta
    const beneficiarios = data.map(ben => ({
      ...ben,
      plano: ben.plano?.nome || 'N/A',
      operadora: ben.plano?.operadora?.nome || 'N/A',
      valorPlano: ben.plano?.valor || 0,
      vendedor: ben.vendedor?.nome || 'N/A',
      comissao: ben.vendedor?.comissao || 0
    }));

    res.json(beneficiarios);
  } catch (error) {
    next(error);
  }
};

export const getBeneficiarioById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('beneficiarios')
      .select(`
        *,
        plano:planos(*, operadora:operadoras(*)),
        vendedor:vendedores(*)
      `)
      .eq('id', id)
      .single();

    if (error) {
      return res.status(404).json({ error: 'Beneficiário not found' });
    }

    res.json(data);
  } catch (error) {
    next(error);
  }
};

export const createBeneficiario = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { nome, cpf, plano_id, vendedor_id } = req.body;

    // Verificar se CPF já existe
    const { data: existing } = await supabase
      .from('beneficiarios')
      .select('id')
      .eq('cpf', cpf)
      .single();

    if (existing) {
      return res.status(400).json({ error: 'CPF already registered' });
    }

    const { data, error } = await supabase
      .from('beneficiarios')
      .insert({
        nome,
        cpf,
        plano_id,
        vendedor_id: vendedor_id || null,
        status: 'ativo',
        desde: new Date().toISOString(),
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

export const updateBeneficiario = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const updates = { ...req.body, updated_at: new Date().toISOString() };

    const { data, error } = await supabase
      .from('beneficiarios')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    if (!data) {
      return res.status(404).json({ error: 'Beneficiário not found' });
    }

    res.json(data);
  } catch (error) {
    next(error);
  }
};

export const deleteBeneficiario = async (req, res, next) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('beneficiarios')
      .delete()
      .eq('id', id);

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({ message: 'Beneficiário deleted successfully' });
  } catch (error) {
    next(error);
  }
};
