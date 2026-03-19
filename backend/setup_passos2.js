import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
dotenv.config();

const usuarioSchema = new mongoose.Schema({
  nome: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  senha_hash: { type: String, required: true },
  papel: { type: String, enum: ['Admin', 'Financeiro', 'Vendedor', 'Corretor'], default: 'Vendedor' }
}, { collection: 'usuarios' });

const Usuario = mongoose.models.Usuario || mongoose.model('Usuario', usuarioSchema);

async function run() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Conectado ao MongoDB Atlas');
    
    const email = 'passos@uniseguros.com';
    const plainPassword = 'dudu2506';
    const hashedPassword = await bcrypt.hash(plainPassword, 10);
    
    let user = await Usuario.findOne({ email });
    if (user) {
      user.senha_hash = hashedPassword;
      user.papel = 'Admin';
      await user.save();
      console.log('A conta (Collection Usuarios) foi ATUALIZADA com sucesso para passos@uniseguros.com!');
    } else {
      user = new Usuario({
        nome: 'Eduardo Passos',
        email,
        senha_hash: hashedPassword,
        papel: 'Admin'
      });
      await user.save();
      console.log('A conta (Collection Usuarios) foi CRIADA com sucesso para passos@uniseguros.com!');
    }
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

run();
