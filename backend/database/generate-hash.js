// Script para gerar hash de senhas
// Execute: node database/generate-hash.js

import bcrypt from 'bcryptjs';

const senhas = [
  { texto: 'admin123', descricao: 'Admin Principal' },
  { texto: 'maria123', descricao: 'Maria Financeiro' },
  { texto: 'joao123', descricao: 'João Vendedor' }
];

async function generateHashes() {
  console.log('Gerando hashes de senhas...\n');

  for (const { texto, descricao } of senhas) {
    const hash = await bcrypt.hash(texto, 10);
    console.log(`${descricao} (${texto}):`);
    console.log(hash);
    console.log('');
  }
}

generateHashes().catch(console.error);
