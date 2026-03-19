import mongoose from 'mongoose';

const liqSchema = new mongoose.Schema({
  vendedor_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendedor', required: true },
  valor_liquidado: { type: Number, required: true },
  mes_referencia: { type: String, required: true }, // Format YYYY-MM
  liquidado_por_usuario_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario' },
  data_liquidacao: { type: Date, default: Date.now }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

// Ensure uniqueness per seller per month
liqSchema.index({ vendedor_id: 1, mes_referencia: 1 }, { unique: true });

export const ComissaoLiquidada = mongoose.model('ComissaoLiquidada', liqSchema);
