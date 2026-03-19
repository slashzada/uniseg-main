import { Operadora } from '../models/Operadora.js';
import { Plano } from '../models/Plano.js';
import { Beneficiario } from '../models/Beneficiario.js';
import { validationResult } from 'express-validator';

export const getOperadoras = async (req, res, next) => {
  try {
    const { status } = req.query;
    const filter = status ? { status } : {};

    const operadoras = await Operadora.find(filter).sort({ nome: 1 }).lean();

    for (let op of operadoras) {
      const planos = await Plano.find({ operadora_id: op._id }).lean();
      op.planos = planos.length;
      const planosIds = planos.map(p => p._id);
      const benCount = await Beneficiario.countDocuments({ plano_id: { $in: planosIds } });
      op.beneficiarios = benCount;
      op.id = op._id.toString();
    }

    res.json(operadoras);
  } catch (error) { next(error); }
};

export const getOperadoraById = async (req, res, next) => {
  try {
    const op = await Operadora.findById(req.params.id).lean();
    if (!op) return res.status(404).json({ error: 'Operadora not found' });
    op.id = op._id.toString();
    op.planos = 0;
    op.beneficiarios = 0;
    res.json(op);
  } catch (error) { next(error); }
};

export const createOperadora = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    let op = new Operadora({ ...req.body });
    await op.save();
    op = op.toObject();
    op.id = op._id.toString();
    res.status(201).json(op);
  } catch (error) { next(error); }
};

export const updateOperadora = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    let op = await Operadora.findByIdAndUpdate(req.params.id, req.body, { new: true }).lean();
    if (!op) return res.status(404).json({ error: 'Operadora not found' });
    op.id = op._id.toString();
    res.json(op);
  } catch (error) { next(error); }
};

export const deleteOperadora = async (req, res, next) => {
  try {
    const op = await Operadora.findByIdAndDelete(req.params.id);
    if (!op) return res.status(404).json({ error: 'Operadora not found' });
    res.json({ message: 'Operadora deleted successfully' });
  } catch (error) { next(error); }
};