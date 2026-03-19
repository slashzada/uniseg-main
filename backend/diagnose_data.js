import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

async function diagnose() {
    console.log('--- DIAGNOSIS START ---');

    // 1. Check Usuarios
    const { data: users, error: userError } = await supabase
        .from('usuarios')
        .select('id, email, nome, papel, vendedor_id');

    if (userError) console.error('Error fetching users:', userError);
    else console.log('Users:', JSON.stringify(users, null, 2));

    // 2. Check Vendedores
    const { data: vendedores } = await supabase.from('vendedores').select('id, nome');
    console.log('Vendedores:', JSON.stringify(vendedores, null, 2));

    // 3. Check Beneficiarios
    const { data: beneficiarios } = await supabase.from('beneficiarios').select('id, nome, vendedor_id');
    console.log('Beneficiarios:', JSON.stringify(beneficiarios, null, 2));

    // 4. Check Pagamentos
    const { data: pagamentos } = await supabase.from('pagamentos').select('id, beneficiario_id, status');
    console.log('Pagamentos:', JSON.stringify(pagamentos, null, 2));

    console.log('--- DIAGNOSIS END ---');
}

diagnose();
