import { Beneficiario } from '../models/Beneficiario.js';
import { Financeiro } from '../models/Financeiro.js';
import { Vendedor } from '../models/Vendedor.js';

export const getStats = async (req, res, next) => {
  try {
    let filterIds = null;
    let minhaComissao = 0;

    if (req.user && req.user.papel === 'Vendedor' && req.user.vendedor_id) {
      const bens = await Beneficiario.find({ vendedor_id: req.user.vendedor_id }).select('_id');
      filterIds = bens.map(b => b._id);

      if (filterIds.length === 0) {
        return res.json({
          beneficiariosAtivos: 0, totalBeneficiarios: 0, receitaMensal: 0,
          taxaAdimplencia: 0, pagamentosVencidos: 0, totalVencido: 0, minhaComissao: 0,
          trends: { beneficiarios: { value: 0, isPositive: true }, receita: { value: 0, isPositive: true }, adimplencia: { value: 0, isPositive: true } }
        });
      }

      const vendedorData = await Vendedor.findById(req.user.vendedor_id);
      if (vendedorData) {
        const pgs = await Financeiro.find({
          status: 'pago', beneficiario_id: { $in: filterIds }, data_comissao_liquidada: { $exists: false }
        });
        minhaComissao = pgs.reduce((sum, p) => sum + (p.valor_comissao !== undefined ? p.valor_comissao : p.valor * vendedorData.comissao / 100), 0);
      }
    }

    const getTrend = (cur, prev) => {
      if (!prev || prev === 0) return { value: 0, isPositive: true };
      const diff = ((cur - prev) / prev) * 100;
      return { value: parseFloat(Math.abs(diff).toFixed(1)), isPositive: diff >= 0 };
    };

    const agora = new Date();
    const inicioMesAtual = new Date(agora.getFullYear(), agora.getMonth(), 1);
    const inicioMesAnterior = new Date(agora.getFullYear(), agora.getMonth() - 1, 1);
    const fimMesAnterior = new Date(agora.getFullYear(), agora.getMonth(), 0, 23, 59, 59, 999);

    const matchBase = filterIds ? { beneficiario_id: { $in: filterIds } } : {};
    const matchBenBase = filterIds ? { _id: { $in: filterIds } } : {};

    const countAtuais = await Beneficiario.countDocuments({ ...matchBenBase, status: 'Ativo' });
    const countAnterior = await Beneficiario.countDocuments({ ...matchBenBase, status: 'Ativo', created_at: { $lt: inicioMesAtual } });
    const countTotal = await Beneficiario.countDocuments(matchBenBase);
    const trendBeneficiarios = getTrend(countAtuais, countAnterior);

    const recAtualDocs = await Financeiro.find({ ...matchBase, status: 'pago', confirmado_em: { $gte: inicioMesAtual } });
    const recAnteriorDocs = await Financeiro.find({ ...matchBase, status: 'pago', confirmado_em: { $gte: inicioMesAnterior, $lte: fimMesAnterior } });
    const valorAtual = recAtualDocs.reduce((a, p) => a + p.valor, 0);
    const valorAnterior = recAnteriorDocs.reduce((a, p) => a + p.valor, 0);
    const trendReceita = getTrend(valorAtual, valorAnterior);

    const sumPagos = await Financeiro.countDocuments({ ...matchBase, status: 'pago' });
    const sumTodos = await Financeiro.countDocuments({ ...matchBase });
    const taxa = sumTodos > 0 ? (sumPagos / sumTodos) * 100 : 0;

    const carencia = new Date(); carencia.setDate(carencia.getDate() - 1);
    const limiteAtraso = carencia.toISOString().split('T')[0];
    
    const vencidosDocs = await Financeiro.find({ ...matchBase, status: { $ne: 'pago' }, vencimento: { $lt: new Date(limiteAtraso) } });
    const totalVencido = vencidosDocs.reduce((a, p) => a + p.valor, 0);

    res.json({
      beneficiariosAtivos: countAtuais,
      totalBeneficiarios: countTotal,
      receitaMensal: valorAtual,
      taxaAdimplencia: parseFloat(taxa.toFixed(1)),
      pagamentosVencidos: vencidosDocs.length,
      totalVencido: totalVencido,
      minhaComissao: parseFloat(minhaComissao.toFixed(2)),
      trends: { beneficiarios: trendBeneficiarios, receita: trendReceita, adimplencia: { value: 0, isPositive: true } }
    });
  } catch (error) { next(error); }
};

export const getRevenueChart = async (req, res, next) => {
  try {
    let filterIds = null;
    if (req.user && req.user.papel === 'Vendedor' && req.user.vendedor_id) {
      const bens = await Beneficiario.find({ vendedor_id: req.user.vendedor_id }).select('_id');
      filterIds = bens.map(b => b._id);
    }

    const matchBase = filterIds ? { beneficiario_id: { $in: filterIds } } : {};
    const meses = []; const receitas = []; const agora = new Date();

    for (let i = 5; i >= 0; i--) {
      const dataInicio = new Date(agora.getFullYear(), agora.getMonth() - i, 1);
      const dataFim = new Date(agora.getFullYear(), agora.getMonth() - i + 1, 1);
      const pgs = await Financeiro.find({ ...matchBase, status: 'pago', confirmado_em: { $gte: dataInicio, $lt: dataFim } });
      const receita = pgs.reduce((a, p) => a + p.valor, 0);
      meses.push(dataInicio.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' }));
      receitas.push(receita);
    }

    res.json({ meses, receitas });
  } catch (error) { next(error); }
};