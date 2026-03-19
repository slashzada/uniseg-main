import { Financeiro } from '../models/Financeiro.js';
import { Beneficiario } from '../models/Beneficiario.js';
import { Vendedor } from '../models/Vendedor.js';
import { validationResult } from 'express-validator';
import multer from 'multer';
import path from 'path';

// Multer Storage Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});
export const uploadMiddleware = multer({ storage });

export const uploadBoleto = async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Nenhum arquivo enviado' });
    const url = `/uploads/${req.file.filename}`;
    res.json({ publicUrl: url });
  } catch (error) { next(error); }
};

export const getPagamentos = async (req, res, next) => {
  try {
    const { status, busca } = req.query;
    let filter = {};

    if (req.user && req.user.papel === 'Vendedor') {
      if (!req.user.vendedor_id) return res.json([]);
      const bens = await Beneficiario.find({ vendedor_id: req.user.vendedor_id }).select('_id');
      const ids = bens.map(b => b._id);
      if (ids.length === 0) return res.json([]);
      filter.beneficiario_id = { $in: ids };
    }

    if (status) filter.status = status;
    if (busca) filter.boleto_anexado = { $regex: busca, $options: 'i' };

    const data = await Financeiro.find(filter)
      .populate({ path: 'beneficiario_id', select: 'nome plano_id', populate: { path: 'plano_id', select: 'nome' } })
      .sort({ vencimento: 1 })
      .lean();

    const pagamentos = data.map(pag => ({
      ...pag, id: pag._id.toString(),
      beneficiario_id: pag.beneficiario_id?._id?.toString(),
      beneficiario: pag.beneficiario_id?.nome || 'N/A',
      plano: pag.beneficiario_id?.plano_id?.nome || 'N/A'
    }));

    res.json(pagamentos);
  } catch (error) { next(error); }
};

export const getPagamentoById = async (req, res, next) => {
  try {
    const pag = await Financeiro.findById(req.params.id).lean();
    if (!pag) return res.status(404).json({ error: 'Pagamento not found' });
    pag.id = pag._id.toString();
    res.json({ ...pag, beneficiario: 'N/A' });
  } catch (error) { next(error); }
};

export const createPagamento = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { beneficiario_id, valor, vencimento } = req.body;
    const vDate = new Date(vencimento);
    const hoje = new Date(); hoje.setHours(0, 0, 0, 0); vDate.setHours(0, 0, 0, 0);
    const status = vDate < hoje ? 'vencido' : 'pendente';

    const ben = await Beneficiario.findById(beneficiario_id).lean();

    let pag = new Financeiro({
      beneficiario_id,
      vendedor_id: ben?.vendedor_id || null, // Capture this immediately for reports
      valor, vencimento, status, parcela: 1
    });
    await pag.save();
    pag = pag.toObject(); pag.id = pag._id.toString();
    res.status(201).json(pag);
  } catch (error) { next(error); }
};

export const updatePagamento = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    let pag = await Financeiro.findByIdAndUpdate(req.params.id, req.body, { new: true }).lean();
    if (!pag) return res.status(404).json({ error: 'Pagamento not found' });
    pag.id = pag._id.toString();
    res.json(pag);
  } catch (error) { next(error); }
};

export const anexarBoleto = async (req, res, next) => {
  try {
    const { boleto_url, boleto_nome } = req.body;
    let pag = await Financeiro.findByIdAndUpdate(req.params.id, {
      status: 'comprovante_anexado', boleto_anexado: boleto_nome || 'boleto.pdf', boleto_url: boleto_url || null
    }, { new: true }).lean();
    if (!pag) return res.status(404).json({ error: 'Pagamento not found' });
    pag.id = pag._id.toString();
    res.json(pag);
  } catch (error) { next(error); }
};

export const confirmarPagamento = async (req, res, next) => {
  try {
    if (req.user.papel === 'Vendedor') return res.status(403).json({ error: 'Proibido' });

    const pagAtual = await Financeiro.findById(req.params.id).populate({ path: 'beneficiario_id', populate: { path: 'vendedor_id' } }).lean();
    if (!pagAtual) return res.status(404).json({ error: 'Pagamento not found' });

    const vend = pagAtual.beneficiario_id?.vendedor_id;
    const valorComissao = vend ? (pagAtual.valor * vend.comissao / 100) : null;

    let pag = await Financeiro.findByIdAndUpdate(req.params.id, {
      status: 'pago', confirmado_por: req.user.id, confirmado_em: new Date(), valor_comissao: valorComissao
    }, { new: true }).lean();

    pag.id = pag._id.toString();
    res.json(pag);
  } catch (error) { next(error); }
};

export const rejeitarPagamento = async (req, res, next) => {
  try {
    const pag = await Financeiro.findById(req.params.id).lean();
    if (!pag) return res.status(404).json({ error: 'Pagamento not found' });

    if (req.user.papel === 'Vendedor') {
      const ben = await Beneficiario.findById(pag.beneficiario_id).lean();
      if (!ben || String(ben.vendedor_id) !== String(req.user.vendedor_id)) {
        return res.status(403).json({ error: `Proibido: Boleto de outro vendedor. (Boleto: ${String(ben?.vendedor_id)}, User: ${String(req.user.vendedor_id)})` });
      }
    }
    if (!pag) return res.status(404).json({ error: 'Pagamento not found' });

    const vDate = new Date(pag.vencimento);
    const hoje = new Date(); hoje.setHours(0, 0, 0, 0); vDate.setHours(0, 0, 0, 0);
    const newStatus = vDate < hoje ? 'vencido' : 'pendente';

    let ret = await Financeiro.findByIdAndUpdate(req.params.id, {
      status: newStatus, boleto_anexado: null, boleto_url: null
    }, { new: true }).lean();
    ret.id = ret._id.toString();
    res.json(ret);
  } catch (error) { next(error); }
};

export const deletePagamento = async (req, res, next) => {
  try {
    const pag = await Financeiro.findByIdAndDelete(req.params.id);
    if (!pag) return res.status(404).json({ error: 'Pagamento not found' });
    res.json({ message: 'Pagamento deleted successfully' });
  } catch (error) { next(error); }
};
