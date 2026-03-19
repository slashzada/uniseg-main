import mongoose from 'mongoose';

const operadoraSchema = new mongoose.Schema({
  nome: { type: String, required: true },
  logo: { type: String },
  status: { type: String, enum: ['ativa', 'inativa'], default: 'ativa' }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

export const Operadora = mongoose.model('Operadora', operadoraSchema);
