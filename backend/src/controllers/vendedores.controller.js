import { Vendedor } from '../models/Vendedor.js';
import { validationResult } from 'express-validator';

export const getVendedores = async (req, res, next) => {
  try {
    const data = await Vendedor.find().sort({ nome: 1 }).lean();
    const vendedores = data.map(v => ({ ...v, id: v._id.toString() }));
    res.json(vendedores);
  } catch (error) { next(error); }
};

export const createVendedor = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    let vendedor = new Vendedor({ ...req.body });
    await vendedor.save();
    vendedor = vendedor.toObject();
    vendedor.id = vendedor._id.toString();
    res.status(201).json(vendedor);
  } catch (error) { next(error); }
};

export const updateVendedor = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    let vendedor = await Vendedor.findByIdAndUpdate(req.params.id, req.body, { new: true }).lean();
    if (!vendedor) return res.status(404).json({ error: 'Vendedor not found' });
    vendedor.id = vendedor._id.toString();
    res.json(vendedor);
  } catch (error) { next(error); }
};

export const deleteVendedor = async (req, res, next) => {
  try {
    const vendedor = await Vendedor.findByIdAndDelete(req.params.id);
    if (!vendedor) return res.status(404).json({ error: 'Vendedor not found' });
    res.json({ message: 'Vendedor deleted successfully' });
  } catch (error) { next(error); }
};