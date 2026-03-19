import { Vendedor } from '../models/Vendedor.js';
import { Beneficiario } from '../models/Beneficiario.js';
import { Financeiro } from '../models/Financeiro.js';
import { ComissaoLiquidada } from '../models/ComissaoLiquidada.js';

export const getResumo = async (req, res, next) => {
  try {
    let { timeframe, startDate, endDate } = req.query;
    const today = new Date();
    
    if (timeframe === 'weekly') { startDate = new Date(today); startDate.setDate(today.getDate() - 7); endDate = new Date(today); endDate.setHours(23, 59, 59, 999); }
    else if (timeframe === 'monthly') { startDate = new Date(today.getFullYear(), today.getMonth(), 1); endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59, 999); }
    else if (timeframe === 'quarterly') { startDate = new Date(today); startDate.setMonth(today.getMonth() - 3); endDate = new Date(today); endDate.setHours(23, 59, 59, 999); }
    else if (timeframe === 'semiannual') { startDate = new Date(today); startDate.setMonth(today.getMonth() - 6); endDate = new Date(today); endDate.setHours(23, 59, 59, 999); }
    else if (timeframe === 'annual') { startDate = new Date(today.getFullYear(), 0, 1); endDate = new Date(today.getFullYear(), 11, 31, 23, 59, 59, 999); }
    else if (timeframe === 'custom') { startDate = new Date(startDate); endDate = new Date(endDate); }

    const vendedores = await Vendedor.find({ status: 'ativo' }).lean();

    const resumo = await Promise.all(vendedores.map(async (vendedor) => {
      const total_vendas = await Beneficiario.countDocuments({ vendedor_id: vendedor._id, status: 'Ativo' });
      const bens = await Beneficiario.find({ vendedor_id: vendedor._id }).select('_id');
      const ids = bens.map(b => b._id);

      let comissao_a_receber = 0, comissao_prevista = 0;

      if (ids.length > 0) {
        const queryPago = { beneficiario_id: { $in: ids }, status: 'pago', data_comissao_liquidada: { $exists: false } };
        if (startDate) { queryPago.confirmado_em = { $gte: startDate }; }
        if (endDate) { queryPago.confirmado_em = { ...queryPago.confirmado_em, $lte: endDate }; }
        
        const paid = await Financeiro.find(queryPago).lean();
        comissao_a_receber = paid.reduce((s, p) => s + (p.valor_comissao ?? p.valor * vendedor.comissao / 100), 0);

        const queryPend = { beneficiario_id: { $in: ids }, status: 'pendente' };
        if (startDate) { queryPend.vencimento = { $gte: startDate }; }
        if (endDate) { queryPend.vencimento = { ...queryPend.vencimento, $lte: endDate }; }
        
        const pend = await Financeiro.find(queryPend).lean();
        comissao_prevista = pend.reduce((s, p) => s + (p.valor * vendedor.comissao / 100), 0);
      }

      const mes_referencia = new Date().toISOString().slice(0, 7);
      const liq = await ComissaoLiquidada.findOne({ vendedor_id: vendedor._id, mes_referencia });

      return {
        id: vendedor._id.toString(), nome: vendedor.nome, comissao_percentual: vendedor.comissao,
        total_vendas, comissao_a_receber, comissao_prevista, liquidado_mes_atual: !!liq
      };
    }));
    res.json(resumo);
  } catch (error) { next(error); }
};

export const liquidarComissoes = async (req, res, next) => {
  try {
    const { vendedorId } = req.params;
    const vendedor = await Vendedor.findById(vendedorId).lean();
    if (!vendedor) return res.status(404).json({ error: 'Vendedor not found' });

    const bens = await Beneficiario.find({ vendedor_id: vendedorId }).select('_id');
    const ids = bens.map(b => b._id);
    if (ids.length === 0) return res.status(400).json({ error: 'No sales found' });

    const payToLiq = await Financeiro.find({ beneficiario_id: { $in: ids }, status: 'pago', data_comissao_liquidada: { $exists: false } }).lean();
    if (!payToLiq.length) return res.status(400).json({ error: 'No commissions' });

    const totalLiquidado = payToLiq.reduce((s, p) => s + (p.valor_comissao ?? p.valor * vendedor.comissao / 100), 0);
    if (totalLiquidado <= 0) return res.status(400).json({ error: 'Zero or negative commissions' });

    const mes_referencia = new Date().toISOString().slice(0, 7);
    const existing = await ComissaoLiquidada.findOne({ vendedor_id: vendedorId, mes_referencia });
    if (existing) return res.status(400).json({ error: 'Comissões já liquidadas para este vendedor neste mês.' });

    const liqRecord = await new ComissaoLiquidada({
      vendedor_id: vendedorId, valor_liquidado: totalLiquidado, mes_referencia,
      liquidado_por_usuario_id: req.user.id
    }).save();

    await Financeiro.updateMany(
      { _id: { $in: payToLiq.map(p => p._id) } },
      { $set: { data_comissao_liquidada: new Date() } }
    );

    res.json({ success: true, valor_total: totalLiquidado, record: liqRecord });
  } catch (error) { next(error); }
};

export const generateReport = async (req, res, next) => {
  try {
    let { timeframe, vendedorId } = req.query;
    let startDate, endDate;
    const today = new Date();
    
    if (timeframe === 'weekly') { startDate = new Date(today); startDate.setDate(today.getDate() - 7); endDate = new Date(today); endDate.setHours(23, 59, 59, 999); }
    else if (timeframe === 'monthly') { startDate = new Date(today.getFullYear(), today.getMonth(), 1); endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59, 999); }
    else if (timeframe === 'quarterly') { startDate = new Date(today); startDate.setMonth(today.getMonth() - 3); endDate = new Date(today); endDate.setHours(23, 59, 59, 999); }
    else if (timeframe === 'semiannual') { startDate = new Date(today); startDate.setMonth(today.getMonth() - 6); endDate = new Date(today); endDate.setHours(23, 59, 59, 999); }
    else if (timeframe === 'annual') { startDate = new Date(today.getFullYear(), 0, 1); endDate = new Date(today.getFullYear(), 11, 31, 23, 59, 59, 999); }

    const query = { status: 'pago' };
    if (startDate) query.confirmado_em = { $gte: startDate };
    if (endDate) query.confirmado_em = { ...query.confirmado_em, $lte: endDate };

    let benFilter = {};
    if (vendedorId && vendedorId !== 'all') { benFilter = { vendedor_id: vendedorId }; }
    const validBens = await Beneficiario.find(benFilter).select('_id');
    query.beneficiario_id = { $in: validBens.map(b => b._id) };

    const payments = await Financeiro.find(query).populate({
      path: 'beneficiario_id',
      select: 'nome plano_id vendedor_id vigencia',
      populate: [ 
        { 
          path: 'plano_id', 
          select: 'nome operadora_id',
          populate: { path: 'operadora_id', select: 'nome' }
        }, 
        { path: 'vendedor_id', select: 'nome comissao' } 
      ]
    }).lean();

    const rows = payments.map(p => {
      const vend = p.beneficiario_id?.vendedor_id;
      const comissaoVal = p.valor_comissao ?? (p.valor * (vend?.comissao || 0) / 100);
      const liquidado = p.data_comissao_liquidada ? 'Liquidado' : 'A Receber';
      const vigenciaDate = p.beneficiario_id?.vigencia ? new Date(p.beneficiario_id.vigencia).toISOString().substring(0, 10).split('-').reverse().join('/') : 'N/D';
      
      return [
        vigenciaDate,
        vend?.nome || 'N/A', p.beneficiario_id?.nome || 'N/A',
        p.beneficiario_id?.plano_id?.operadora_id?.nome || 'N/A',
        p.beneficiario_id?.plano_id?.nome || 'N/A',
        p.valor.toFixed(2), `${vend?.comissao || 0}%`, comissaoVal.toFixed(2), liquidado
      ].join(',');
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=relatorio_comissoes.csv');
    res.send(['Vigencia,Vendedor,Beneficiario,Operadora,Plano,Valor Venda,Comissao (%),Valor Comissao,Status Liquidacao', ...rows].join('\n'));
  } catch (error) { next(error); }
};
