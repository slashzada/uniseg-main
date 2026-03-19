import mongoose from 'mongoose';

const planoSchema = new mongoose.Schema({
  nome: { type: String, required: true },
  operadora_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Operadora', required: true },
  tipo: { type: String, required: true },
  vidas_min: { type: Number, default: 0 },
  vidas_max: { type: Number, default: 9999 }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

export const Plano = mongoose.model('Plano', planoSchema);
