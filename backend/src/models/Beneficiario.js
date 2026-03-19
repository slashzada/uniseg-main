import mongoose from 'mongoose';

const beneficiarioSchema = new mongoose.Schema({
  nome: { type: String, required: true },
  cpf: { type: String, required: true },
  data_nascimento: { type: Date },
  telefone: { type: String },
  email: { type: String },
  plano_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Plano', required: true },
  vendedor_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendedor', required: true },
  status: { type: String, enum: ['Ativo', 'Inativo', 'Pendente'], default: 'Ativo' },
  valor: { type: Number, required: true },
  vigencia: { type: Date }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

export const Beneficiario = mongoose.model('Beneficiario', beneficiarioSchema);
