import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

async function applyMigration() {
    console.log('--- Aplicando Migrações de Colunas Faltantes ---');

    // Como não podemos rodar SQL direto sem o RPC exec_sql, vamos avisar o usuário
    // ou tentar usar o RPC se ele existir.

    const sql = `
        ALTER TABLE vendedores ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'ativo' CHECK (status IN ('ativo', 'inativo'));
        ALTER TABLE beneficiarios ADD COLUMN IF NOT EXISTS telefone VARCHAR(20);
    `;

    console.log('Tentando executar SQL via RPC...');
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });

    if (error) {
        console.error('Erro ao executar RPC:', error.message);
        console.log('\n⚠️ RECURSO RPC exec_sql não disponível.');
        console.log('Por favor, execute o seguinte SQL no SQL Editor do seu Supabase:');
        console.log('------------------------------------------------------------');
        console.log(sql);
        console.log('------------------------------------------------------------');
    } else {
        console.log('✅ Migração aplicada com sucesso!');
    }
}

applyMigration();
