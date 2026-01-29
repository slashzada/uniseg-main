import { supabase } from '../config/supabase.js';
import { validationResult } from 'express-validator';

export const getPagamentos = async (req, res, next) => {
  try {
    const { status, busca } = req.query;

    let query = supabase
      .from('pagamentos')
      .select('*')
      .order('vencimento', { ascending: true });

    if (status) {
      query = query.eq('status', status);
    }

    if (busca) {
      // Search logic simplified
      query = query.ilike('boleto_anexado', `%${busca}%`); // No name column in pagamentos
    }

    const { data, error } = await query;

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    // Formatar resposta
    const pagamentos = data.map(pag => ({
      ...pag,
      beneficiario: pag.beneficiario_id ? 'Ver Detalhes' : 'N/A',
      plano: 'N/A'
    }));

    res.json(pagamentos);
  } catch (error) {
    next(error);
  }
};

export const getPagamentoById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('pagamentos')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      return res.status(404).json({ error: 'Pagamento not found' });
    }

    res.json({
      ...data,
      beneficiario: 'N/A' // Placeholder
    });
  } catch (error) {
    next(error);
  }
};

export const createPagamento = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { beneficiario_id, valor, vencimento } = req.body;

    // Determinar status baseado na data de vencimento
    const vencimentoDate = new Date(vencimento);
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    vencimentoDate.setHours(0, 0, 0, 0);

    let status = 'pendente';
    if (vencimentoDate < hoje) {
      status = 'vencido';
    }

    const { data, error } = await supabase
      .from('pagamentos')
      .insert({
        beneficiario_id,
        valor,
        vencimento,
        status,
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

export const updatePagamento = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const updates = { ...req.body, updated_at: new Date().toISOString() };

    const { data, error } = await supabase
      .from('pagamentos')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    if (!data) {
      return res.status(404).json({ error: 'Pagamento not found' });
    }

    res.json(data);
  } catch (error) {
    next(error);
  }
};

export const anexarBoleto = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { boleto_url, boleto_nome } = req.body;

    const { data, error } = await supabase
      .from('pagamentos')
      .update({
        status: 'comprovante_anexado', // Workflow step 1
        boleto_anexado: boleto_nome || 'boleto.pdf',
        boleto_url: boleto_url || null,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    if (!data) {
      return res.status(404).json({ error: 'Pagamento not found' });
    }

    res.json(data);
  } catch (error) {
    next(error);
  }
};

export const confirmarPagamento = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Optional: Check permissions here (already done in route usually, but safety check)
    if (req.user.papel === 'Vendedor') {
      return res.status(403).json({ error: 'Apenas Financeiro/Admin pode confirmar pagamentos.' });
    }

    const { data, error } = await supabase
      .from('pagamentos')
      .update({
        status: 'pago', // Final step
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    if (!data) {
      return res.status(404).json({ error: 'Pagamento not found' });
    }

    res.json(data);
  } catch (error) {
    next(error);
  }
};

export const deletePagamento = async (req, res, next) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('pagamentos')
      .delete()
      .eq('id', id);

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({ message: 'Pagamento deleted successfully' });
  } catch (error) {
    next(error);
  }
};
