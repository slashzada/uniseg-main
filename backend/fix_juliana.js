import * as pkg from '@supabase/supabase-js';
const createClient = pkg.default ? pkg.default.createClient : pkg.createClient;
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

async function fixJuliana() {
    console.log('--- Ajustando Dados da Juliana ---');

    const { data, error } = await supabase
        .from('vendedores')
        .update({ comissao: 10 }) // Ajustando para 10% (valor padrão razoável)
        .eq('id', '2a871699-6b81-404f-9024-4972b0f3e809')
        .select();

    if (error) {
        console.error('Erro ao atualizar Juliana:', error.message);
    } else {
        console.log('Juliana atualizada com sucesso:', JSON.stringify(data, null, 2));
    }
}

fixJuliana();
