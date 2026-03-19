import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
dotenv.config();

const userSchema = new mongoose.Schema({
  nome: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  senha: { type: String, required: true },
  papel: { type: String, enum: ['Admin', 'Financeiro', 'Vendedor'], default: 'Vendedor' }
});

// Avoid OverwriteModelError
const User = mongoose.models.User || mongoose.model('User', userSchema);

async function run() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Conectado ao MongoDB');
    
    const email = 'passos@uniseguros.com';
    const plainPassword = 'dudu2506';
    const hashedPassword = await bcrypt.hash(plainPassword, 10);
    
    let user = await User.findOne({ email });
    if (user) {
      user.senha = hashedPassword;
      user.papel = 'Admin';
      await user.save();
      console.log('Senha e permissões atualizadas para o Admin Passos!');
    } else {
      user = new User({
        nome: 'Eduardo Passos',
        email,
        senha: hashedPassword,
        papel: 'Admin'
      });
      await user.save();
      console.log('Conta de Admin criada com sucesso para passos@uniseguros.com!');
    }
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

run();
