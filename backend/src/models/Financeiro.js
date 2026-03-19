import mongoose from 'mongoose';

const pagamentoSchema = new mongoose.Schema({
  beneficiario_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Beneficiario', required: true },
  vendedor_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendedor', required: true },
  parcela: { type: Number, required: true },
  valor: { type: Number, required: true },
  vencimento: { type: Date, required: true },
  status: { type: String, enum: ['pendente', 'vencido', 'comprovante_anexado', 'pago'], default: 'pendente' },
  boleto_nome: { type: String },
  boleto_url: { type: String },
  confirmado_por: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario' },
  confirmado_em: { type: Date },
  data_pagamento: { type: Date }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

export const Financeiro = mongoose.model('Financeiro', pagamentoSchema);
