import { Plano } from '../models/Plano.js';
import { Operadora } from '../models/Operadora.js';
import { Beneficiario } from '../models/Beneficiario.js';
import { validationResult } from 'express-validator';

export const getPlanos = async (req, res, next) => {
  try {
    const { tipo, operadora_id, busca } = req.query;
    const filter = {};
    if (tipo) filter.tipo = tipo;
    if (operadora_id) filter.operadora_id = operadora_id;
    if (busca) filter.nome = { $regex: busca, $options: 'i' };

    const planos = await Plano.find(filter).populate('operadora_id', 'nome').sort({ nome: 1 }).lean();

    for (let plano of planos) {
      plano.operadora = plano.operadora_id?.nome || 'N/A';
      plano.operadora_id = plano.operadora_id?._id?.toString() || plano.operadora_id;
      plano.id = plano._id.toString();
      const benCount = await Beneficiario.countDocuments({ plano_id: plano._id });
      plano.beneficiarios = benCount;
    }

    res.json(planos);
  } catch (error) { next(error); }
};

export const getPlanoById = async (req, res, next) => {
  try {
    const plano = await Plano.findById(req.params.id).lean();
    if (!plano) return res.status(404).json({ error: 'Plano not found' });
    plano.id = plano._id.toString();
    res.json({ ...plano, operadora: 'N/A', beneficiarios: 0 });
  } catch (error) { next(error); }
};

export const createPlano = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    let plano = new Plano({ ...req.body });
    await plano.save();
    plano = plano.toObject();
    plano.id = plano._id.toString();
    res.status(201).json(plano);
  } catch (error) { next(error); }
};

export const updatePlano = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    let plano = await Plano.findByIdAndUpdate(req.params.id, req.body, { new: true }).lean();
    if (!plano) return res.status(404).json({ error: 'Plano not found' });
    plano.id = plano._id.toString();
    res.json(plano);
  } catch (error) { next(error); }
};

export const deletePlano = async (req, res, next) => {
  try {
    const plano = await Plano.findByIdAndDelete(req.params.id);
    if (!plano) return res.status(404).json({ error: 'Plano not found' });
    res.json({ message: 'Plano deleted successfully' });
  } catch (error) { next(error); }
};