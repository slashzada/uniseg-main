import { supabase } from '../config/supabase.js';
import { validationResult } from 'express-validator';

export const getPagamentos = async (req, res, next) => {
  try {
    const { status, busca } = req.query;

    let query = supabase
      .from('pagamentos')
      .select(`
        *,
        beneficiarios (
          nome,
          planos (
            nome
          )
        )
      `)
      .order('vencimento', { ascending: true });

    // RBAC: Filter by vendedor if user is Vendedor
    if (req.user && req.user.papel === 'Vendedor') {
      if (!req.user.vendedor_id) {
        return res.json([]);
      }

      // Get beneficiarios for this vendedor first
      const { data: beneficiarios } = await supabase
        .from('beneficiarios')
        .select('id')
        .eq('vendedor_id', req.user.vendedor_id);

      const beneficiarioIds = beneficiarios?.map(b => b.id) || [];
      if (beneficiarioIds.length > 0) {
        query = query.in('beneficiario_id', beneficiarioIds);
      } else {
        return res.json([]);
      }
    }

    if (status) {
      query = query.eq('status', status);
    }

    if (busca) {
      // With joins, we might need a more complex search if we want to search by beneficiary name
      // For now, keeping it simple as per original logic or slightly improved
      query = query.ilike('boleto_anexado', `%${busca}%`);
    }

    const { data, error } = await query;

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    // Formatar resposta consolidada
    const pagamentos = (data || []).map(pag => ({
      ...pag,
      beneficiario: pag.beneficiarios?.nome || 'N/A',
      plano: pag.beneficiarios?.planos?.nome || 'N/A'
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
        confirmado_por: req.user.id, // Track who confirmed
        confirmado_em: new Date().toISOString(), // Track when confirmed
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

export const rejeitarPagamento = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Optional: Check permissions
    if (req.user.papel === 'Vendedor') {
      return res.status(403).json({ error: 'Apenas Financeiro/Admin pode rejeitar comprovantes.' });
    }

    // Get current payment to check expiration date
    const { data: pag, error: getError } = await supabase
      .from('pagamentos')
      .select('vencimento')
      .eq('id', id)
      .single();

    if (getError || !pag) {
      return res.status(404).json({ error: 'Pagamento not found' });
    }

    // Determine new status based on due date
    const vencimentoDate = new Date(pag.vencimento);
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    vencimentoDate.setHours(0, 0, 0, 0);

    const newStatus = vencimentoDate < hoje ? 'vencido' : 'pendente';

    const { data, error } = await supabase
      .from('pagamentos')
      .update({
        status: newStatus,
        boleto_anexado: null,
        boleto_url: null,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return res.status(400).json({ error: error.message });
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
