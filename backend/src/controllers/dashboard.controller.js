import { supabase } from '../config/supabase.js';

export const getStats = async (req, res, next) => {
  try {
    // Beneficiários ativos
    const { count: beneficiariosAtivos } = await supabase
      .from('beneficiarios')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'ativo');

    // Total de beneficiários
    const { count: totalBeneficiarios } = await supabase
      .from('beneficiarios')
      .select('*', { count: 'exact', head: true });

    // Receita mensal (soma dos pagamentos pagos do mês atual)
    const inicioMes = new Date();
    inicioMes.setDate(1);
    inicioMes.setHours(0, 0, 0, 0);

    const { data: pagamentosMes } = await supabase
      .from('pagamentos')
      .select('valor')
      .eq('status', 'pago')
      .gte('created_at', inicioMes.toISOString());

    const receitaMensal = pagamentosMes?.reduce((acc, p) => acc + (p.valor || 0), 0) || 0;

    // Taxa de adimplência
    const { data: todosPagamentos } = await supabase
      .from('pagamentos')
      .select('status');

    const totalPagamentos = todosPagamentos?.length || 0;
    const pagos = todosPagamentos?.filter(p => p.status === 'pago').length || 0;
    const taxaAdimplencia = totalPagamentos > 0 ? (pagos / totalPagamentos) * 100 : 0;

    // Pagamentos vencidos
    const { data: pagamentosVencidos } = await supabase
      .from('pagamentos')
      .select('valor')
      .eq('status', 'vencido');

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
    // Últimos 6 meses
    const meses = [];
    const receitas = [];

    for (let i = 5; i >= 0; i--) {
      const data = new Date();
      data.setMonth(data.getMonth() - i);
      data.setDate(1);
      data.setHours(0, 0, 0, 0);

      const proximoMes = new Date(data);
      proximoMes.setMonth(proximoMes.getMonth() + 1);

      const { data: pagamentos } = await supabase
        .from('pagamentos')
        .select('valor')
        .eq('status', 'pago')
        .gte('created_at', data.toISOString())
        .lt('created_at', proximoMes.toISOString());

      const receita = pagamentos?.reduce((acc, p) => acc + (p.valor || 0), 0) || 0;

      meses.push(data.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' }));
      receitas.push(receita);
    }

    res.json({ meses, receitas });
  } catch (error) {
    next(error);
  }
};
