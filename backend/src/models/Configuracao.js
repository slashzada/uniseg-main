import mongoose from 'mongoose';

const configuracaoSchema = new mongoose.Schema({
  taxa_admin: { type: Number, default: 0 },
  dias_carencia: { type: Number, default: 0 },
  multa_atraso: { type: Number, default: 0 }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

export const Configuracao = mongoose.model('Configuracao', configuracaoSchema);
