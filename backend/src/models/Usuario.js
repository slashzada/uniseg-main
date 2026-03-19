import mongoose from 'mongoose';

const usuarioSchema = new mongoose.Schema({
  nome: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  senha_hash: { type: String, required: true },
  papel: { type: String, enum: ['Admin', 'Financeiro', 'Vendedor', 'Corretor'], default: 'Vendedor' },
  vendedor_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendedor', default: null }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

export const Usuario = mongoose.model('Usuario', usuarioSchema);
