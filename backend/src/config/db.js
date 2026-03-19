import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/uniseguros';
    console.log('🔗 Tentando conectar ao MongoDB...');
    
    const conn = await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 15000, // 15 seconds for first connection
      socketTimeoutMS: 45000,
    });
    
    console.log(`📦 MongoDB Conectado: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ Erro fatal ao conectar ao MongoDB: ${error.message}`);
    console.error('DICA: Verifique se o IP do Render está liberado no MongoDB Atlas (Network Access > 0.0.0.0/0).');
    // Não encerra o processo imediatamente em desenvolvimento, mas em produção sim
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
  }
};

export default connectDB;
