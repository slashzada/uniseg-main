import { Configuracao } from '../models/Configuracao.js';
import { validationResult } from 'express-validator';

export const getConfiguracoes = async (req, res, next) => {
  try {
    let conf = await Configuracao.findOne().lean();
    if (!conf) {
      conf = await new Configuracao({ taxa_admin: 5.00, dias_carencia: 30, multa_atraso: 2.00 }).save();
      conf = conf.toObject();
    }
    conf.id = conf._id.toString();
    res.json(conf);
  } catch (error) { next(error); }
};

export const updateConfiguracoes = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    let conf = await Configuracao.findOne();
    if (!conf) {
      conf = new Configuracao({ ...req.body });
      await conf.save();
    } else {
      conf = await Configuracao.findByIdAndUpdate(conf._id, req.body, { new: true });
    }
    
    conf = conf.toObject();
    conf.id = conf._id.toString();
    res.json(conf);
  } catch (error) { next(error); }
};