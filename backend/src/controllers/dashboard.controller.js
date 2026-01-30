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

      if (beneficiarioIds.length === 0) {
        return res.json({
          beneficiariosAtivos: 0,
          totalBeneficiarios: 0,
          receitaMensal: 0,
          taxaAdimplencia: 0,
          pagamentosVencidos: 0,
          totalVencido: 0,
          trends: {
            beneficiarios: { value: 0, isPositive: true },
            receita: { value: 0, isPositive: true },
            adimplencia: { value: 0, isPositive: true }
          }
        });
      }
    }

    // --- Helper to calculate Trends ---
    const getTrend = (current, previous) => {
      if (!previous || previous === 0) return { value: 0, isPositive: true };
      const diff = ((current - previous) / previous) * 100;
      return { value: parseFloat(Math.abs(diff).toFixed(1)), isPositive: diff >= 0 };
    };

    const agora = new Date();
    const inicioMesAtual = new Date(agora.getFullYear(), agora.getMonth(), 1);
    const inicioMesAnterior = new Date(agora.getFullYear(), agora.getMonth() - 1, 1);
    const fimMesAnterior = new Date(agora.getFullYear(), agora.getMonth(), 0);
    fimMesAnterior.setHours(23, 59, 59, 999);

    // 1. Beneficiários (Atuais vs Mês Anterior)
    let queryAtuais = supabase.from('beneficiarios').select('id', { count: 'exact', head: true }).eq('status', 'ativo');
    let queryAnterior = supabase.from('beneficiarios').select('id', { count: 'exact', head: true }).eq('status', 'ativo').lt('created_at', inicioMesAtual.toISOString());
    let queryTotal = supabase.from('beneficiarios').select('id', { count: 'exact', head: true });

    if (beneficiarioIds) {
      queryAtuais = queryAtuais.in('id', beneficiarioIds);
      queryAnterior = queryAnterior.in('id', beneficiarioIds);
      queryTotal = queryTotal.in('id', beneficiarioIds);
    }

    const { count: countAtuais } = await queryAtuais;
    const { count: countAnterior } = await queryAnterior;
    const { count: countTotal } = await queryTotal;
    const trendBeneficiarios = getTrend(countAtuais, countAnterior);

    // 2. Receita (Mes Atual vs Mes Anterior)
    let queryRecAtual = supabase.from('pagamentos').select('valor').eq('status', 'pago').gte('confirmado_em', inicioMesAtual.toISOString());
    let queryRecAnterior = supabase.from('pagamentos').select('valor').eq('status', 'pago').gte('confirmado_em', inicioMesAnterior.toISOString()).lte('confirmado_em', fimMesAnterior.toISOString());

    if (beneficiarioIds) {
      queryRecAtual = queryRecAtual.in('beneficiario_id', beneficiarioIds);
      queryRecAnterior = queryRecAnterior.in('beneficiario_id', beneficiarioIds);
    }

    const { data: recAtual } = await queryRecAtual;
    const { data: recAnterior } = await queryRecAnterior;
    const valorAtual = recAtual?.reduce((acc, p) => acc + (p.valor || 0), 0) || 0;
    const valorAnterior = recAnterior?.reduce((acc, p) => acc + (p.valor || 0), 0) || 0;
    const trendReceita = getTrend(valorAtual, valorAnterior);

    // 3. Taxa de Adimplência
    let queryPagos = supabase.from('pagamentos').select('id', { count: 'exact', head: true }).eq('status', 'pago');
    let queryTodos = supabase.from('pagamentos').select('id', { count: 'exact', head: true });

    if (beneficiarioIds) {
      queryPagos = queryPagos.in('beneficiario_id', beneficiarioIds);
      queryTodos = queryTodos.in('beneficiario_id', beneficiarioIds);
    }

    const { count: sumPagos } = await queryPagos;
    const { count: sumTodos } = await queryTodos;
    const taxa = sumTodos > 0 ? (sumPagos / sumTodos) * 100 : 0;
    // For trend adimplencia, we would need to calculate it for the previous month too, which is complex. 
    // Simplified: variation in % of pagos/total current vs previous
    const trendAdimplencia = { value: 0, isPositive: true }; // Placeholder or implemented if requested

    // 4. Pagamentos Vencidos (Lógica: Não Pago E Vencimento < Agora - 1 dia)
    // Se hoje é 30/01 e venceu 27/01: 27/01 < 29/01 (Verdadeiro -> Atrasado)
    // Se hoje é 28/01 e venceu 27/01: 27/01 < 27/01 (Falso -> Não Atrasado)
    const carencia = new Date();
    carencia.setDate(carencia.getDate() - 1);
    const limiteAtraso = carencia.toISOString().split('T')[0];

    let queryVencidos = supabase
      .from('pagamentos')
      .select('valor')
      .neq('status', 'pago')
      .lt('vencimento', limiteAtraso);

    if (beneficiarioIds) {
      queryVencidos = queryVencidos.in('beneficiario_id', beneficiarioIds);
    }

    const { data: listVencidos } = await queryVencidos;
    const totalVencido = listVencidos?.reduce((acc, p) => acc + (p.valor || 0), 0) || 0;
    const qtdVencidos = listVencidos?.length || 0;

    res.json({
      beneficiariosAtivos: countAtuais || 0,
      totalBeneficiarios: countTotal || 0,
      receitaMensal: valorAtual,
      taxaAdimplencia: parseFloat(taxa.toFixed(1)),
      pagamentosVencidos: qtdVencidos,
      totalVencido: totalVencido,
      trends: {
        beneficiarios: trendBeneficiarios,
        receita: trendReceita,
        adimplencia: trendAdimplencia
      }
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

