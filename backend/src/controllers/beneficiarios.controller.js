import { Beneficiario } from '../models/Beneficiario.js';
import { Financeiro } from '../models/Financeiro.js';
import { validationResult } from 'express-validator';

const cleanDocument = (doc) => doc ? doc.replace(/[^\d]/g, '') : doc;

export const getBeneficiarios = async (req, res, next) => {
  try {
    const { status, vendedor_id, busca } = req.query;
    const filter = {};
    if (status) filter.status = status;

    if (req.user && req.user.papel === 'Vendedor') {
      if (!req.user.vendedor_id) return res.json([]);
      filter.vendedor_id = req.user.vendedor_id;
    } else if (vendedor_id) {
      filter.vendedor_id = vendedor_id;
    }

    if (busca) {
      filter.$or = [
        { nome: { $regex: busca, $options: 'i' } },
        { cpf: { $regex: cleanDocument(busca), $options: 'i' } }
      ];
    }

    const data = await Beneficiario.find(filter)
      .populate({ path: 'plano_id', populate: { path: 'operadora_id', select: 'nome' } })
      .populate('vendedor_id', 'nome comissao')
      .sort({ created_at: -1 })
      .lean();

    const beneficiarios = data.map(ben => ({
      ...ben,
      id: ben._id.toString(),
      plano: ben.plano_id?.nome || 'N/A',
      valorPlano: ben.valor || 0,
      operadora: ben.plano_id?.operadora_id?.nome || 'N/A',
      operadora_id: ben.plano_id?.operadora_id?._id?.toString() || '',
      vendedor: ben.vendedor_id?.nome || 'N/A',
      comissao: ben.vendedor_id?.comissao || 0
    }));

    res.json(beneficiarios);
  } catch (error) { next(error); }
};

export const getBeneficiarioById = async (req, res, next) => {
  try {
    const ben = await Beneficiario.findById(req.params.id).lean();
    if (!ben) return res.status(404).json({ error: 'Beneficiário not found' });
    ben.id = ben._id.toString();
    res.json(ben);
  } catch (error) { next(error); }
};

export const createBeneficiario = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { nome, cpf: rawCpf, plano_id, vendedor_id, valor, vigencia, telefone } = req.body;
    const cpf = cleanDocument(rawCpf);

    const existing = await Beneficiario.findOne({ cpf });
    if (existing) return res.status(400).json({ error: 'CPF already registered' });

    let ben = new Beneficiario({
      nome, cpf, plano_id, vendedor_id: vendedor_id || null, 
      status: 'Ativo', vigencia: vigencia || null, telefone: telefone || null, valor
    });
    await ben.save();
    ben = ben.toObject();
    ben.id = ben._id.toString();

    if (valor) {
      const baseDate = vigencia ? new Date(vigencia) : new Date();
      const dueDate = new Date(baseDate);
      dueDate.setMonth(dueDate.getMonth() + 1);

      await new Financeiro({
        beneficiario_id: ben._id,
        vendedor_id: ben.vendedor_id,
        valor: parseFloat(valor),
        vencimento: dueDate,
        status: 'pendente',
        parcela: 1
      }).save();
    }

    res.status(201).json(ben);
  } catch (error) { next(error); }
};

export const updateBeneficiario = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { cpf: rawCpf, vigencia, ...rest } = req.body;
    const updates = { ...rest };
    if (vigencia) updates.vigencia = vigencia;
    if (rawCpf) updates.cpf = cleanDocument(rawCpf);

    let ben = await Beneficiario.findByIdAndUpdate(req.params.id, updates, { new: true }).lean();
    if (!ben) return res.status(404).json({ error: 'Beneficiário not found' });
    ben.id = ben._id.toString();
    res.json(ben);
  } catch (error) { next(error); }
};

export const deleteBeneficiario = async (req, res, next) => {
  try {
    await Financeiro.deleteMany({ beneficiario_id: req.params.id });
    const ben = await Beneficiario.findByIdAndDelete(req.params.id);
    if (!ben) return res.status(404).json({ error: 'Beneficiário not found' });
    res.json({ message: 'Beneficiário deleted successfully' });
  } catch (error) { next(error); }
};