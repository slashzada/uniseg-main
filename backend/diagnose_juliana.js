import * as pkg from '@supabase/supabase-js';
const createClient = pkg.default ? pkg.default.createClient : pkg.createClient;
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

async function diagnoseJuliana() {
    console.log('--- Diagnóstico da Vendedora Juliana ---');

    // 1. Buscar dados da vendedora
    const { data: vendedor, error: vError } = await supabase
        .from('vendedores')
        .select('*')
        .ilike('nome', '%Juliana%')
        .single();

    if (vError) {
        console.error('Erro ao buscar vendedora:', vError.message);
        return;
    }

    console.log('Dados do Vendedor:', JSON.stringify(vendedor, null, 2));

    // 2. Contar beneficiários vinculados
    const { count, error: bError } = await supabase
        .from('beneficiarios')
        .select('*', { count: 'exact', head: true })
        .eq('vendedor_id', vendedor.id);

    if (bError) {
        console.error('Erro ao contar beneficiários:', bError.message);
    } else {
        console.log(`Beneficiários vinculados: ${count}`);
    }
}

diagnoseJuliana();
