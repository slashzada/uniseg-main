import { supabase } from '../config/supabase.js';

export const getStats = async (req, res, next) => {
  try {
    // Get beneficiario IDs for this vendedor if applicable
    let beneficiarioIds = null;
    if (req.user && req.user.papel === 'Vendedor' && req.user.vendedor_id) {
      const { data: beneficiarios } = await supabase
        .from('beneficiarios')
        .select('id')
        .eq('vendedor_id', req.user.vendedor_id);

      beneficiarioIds = beneficiarios?.map(b => b.id) || [];

      // If vendedor has no beneficiarios, return zeros
      if (beneficiarioIds.length === 0) {
        return res.json({
          beneficiariosAtivos: 0,
          totalBeneficiarios: 0,
          receitaMensal: 0,
          taxaAdimplencia: 0,
          pagamentosVencidos: 0,
          totalVencido: 0
        });
      }
    }

    // Beneficiários ativos
    let queryBenAtivos = supabase
      .from('beneficiarios')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'ativo');

    if (beneficiarioIds) {
      queryBenAtivos = queryBenAtivos.in('id', beneficiarioIds);
    }

    const { count: beneficiariosAtivos } = await queryBenAtivos;

    // Total de beneficiários
    let queryBenTotal = supabase
      .from('beneficiarios')
      .select('*', { count: 'exact', head: true });

    if (beneficiarioIds) {
      queryBenTotal = queryBenTotal.in('id', beneficiarioIds);
    }

    const { count: totalBeneficiarios } = await queryBenTotal;

    // Receita mensal (soma dos pagamentos confirmados no mês atual)
    const agora = new Date();
    const inicioMes = new Date(agora.getFullYear(), agora.getMonth(), 1);
    inicioMes.setHours(0, 0, 0, 0);

    let queryPagMes = supabase
      .from('pagamentos')
      .select('valor')
      .eq('status', 'pago')
      .gte('confirmado_em', inicioMes.toISOString());

    if (beneficiarioIds) {
      queryPagMes = queryPagMes.in('beneficiario_id', beneficiarioIds);
    }

    const { data: pagamentosMes } = await queryPagMes;
    const receitaMensal = pagamentosMes?.reduce((acc, p) => acc + (p.valor || 0), 0) || 0;

    // Taxa de adimplência (Pagos vs Total de Pagamentos GERADOS até agora)
    let queryTodosPag = supabase
      .from('pagamentos')
      .select('status');

    if (beneficiarioIds) {
      queryTodosPag = queryTodosPag.in('beneficiario_id', beneficiarioIds);
    }

    const { data: todosPagamentos } = await queryTodosPag;

    const totalPagamentos = todosPagamentos?.length || 0;
    const pagos = todosPagamentos?.filter(p => p.status === 'pago').length || 0;
    const taxaAdimplencia = totalPagamentos > 0 ? (pagos / totalPagamentos) * 100 : 0;

    // Pagamentos vencidos (Apenas status 'vencido')
    let queryPagVenc = supabase
      .from('pagamentos')
      .select('valor')
      .eq('status', 'vencido');

    if (beneficiarioIds) {
      queryPagVenc = queryPagVenc.in('beneficiario_id', beneficiarioIds);
    }

    const { data: pagamentosVencidos } = await queryPagVenc;

    const totalVencido = pagamentosVencidos?.reduce((acc, p) => acc + (p.valor || 0), 0) || 0;
    const qtdVencidos = pagamentosVencidos?.length || 0;

    res.json({
      beneficiariosAtivos: beneficiariosAtivos || 0,
      totalBeneficiarios: totalBeneficiarios || 0,
      receitaMensal: receitaMensal,
      taxaAdimplencia: parseFloat(taxaAdimplencia.toFixed(1)),
      pagamentosVencidos: qtdVencidos,
      totalVencido: totalVencido
    });
  } catch (error) {
    next(error);
  }
};

export const getRevenueChart = async (req, res, next) => {
  try {
    // Get beneficiario IDs for this vendedor if applicable
    let beneficiarioIds = null;
    if (req.user && req.user.papel === 'Vendedor' && req.user.vendedor_id) {
      const { data: beneficiarios } = await supabase
        .from('beneficiarios')
        .select('id')
        .eq('vendedor_id', req.user.vendedor_id);

      beneficiarioIds = beneficiarios?.map(b => b.id) || [];
    }

    // Últimos 6 meses
    const meses = [];
    const receitas = [];
    const agora = new Date();

    for (let i = 5; i >= 0; i--) {
      const dataInicio = new Date(agora.getFullYear(), agora.getMonth() - i, 1);
      dataInicio.setHours(0, 0, 0, 0);

      const dataFim = new Date(agora.getFullYear(), agora.getMonth() - i + 1, 1);
      dataFim.setHours(0, 0, 0, 0);

      let queryPag = supabase
        .from('pagamentos')
        .select('valor')
        .eq('status', 'pago')
        .gte('confirmado_em', dataInicio.toISOString())
        .lt('confirmado_em', dataFim.toISOString());

      if (beneficiarioIds) {
        queryPag = queryPag.in('beneficiario_id', beneficiarioIds);
      }

      const { data: pagamentos } = await queryPag;

      const receita = pagamentos?.reduce((acc, p) => acc + (p.valor || 0), 0) || 0;

      meses.push(dataInicio.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' }));
      receitas.push(receita);
    }

    res.json({ meses, receitas });
  } catch (error) {
    next(error);
  }
};

