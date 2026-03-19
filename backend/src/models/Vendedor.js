import mongoose from 'mongoose';

const vendedorSchema = new mongoose.Schema({
  nome: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  telefone: { type: String },
  status: { type: String, enum: ['ativo', 'inativo'], default: 'ativo' },
  comissao: { type: Number, default: 0 }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

export const Vendedor = mongoose.model('Vendedor', vendedorSchema);
