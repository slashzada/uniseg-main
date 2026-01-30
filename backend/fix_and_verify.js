import { supabase } from './src/config/supabase.js';
import dotenv from 'dotenv';
dotenv.config();

async function fixAndVerify() {
    console.log('1. Fetching first vendor...');
    const { data: vends } = await supabase.from('vendedores').select('id, nome').limit(1);
    const vend = vends[0];

    if (!vend) {
        console.log('No vendors found!');
        return;
    }

    console.log(`2. Linking ALL Vendedor users to vendor: ${vend.nome} (${vend.id})...`);
    const { error: updateErr } = await supabase
        .from('usuarios')
        .update({ vendedor_id: vend.id })
        .eq('papel', 'Vendedor');

    if (updateErr) {
        console.error('Update failed:', updateErr);
        return;
    }

    console.log('3. Verifying update...');
    const { data: users, error: selectErr } = await supabase
        .from('usuarios')
        .select('nome, email, papel, vendedor_id')
        .eq('papel', 'Vendedor');

    if (selectErr) {
        console.error('Select failed:', selectErr);
        return;
    }

    users.forEach(u => {
        console.log(`User: ${u.nome} | Email: ${u.email} | VendedorID: ${u.vendedor_id}`);
    });

    console.log('\n4. Checking if there are payments for these beneficiarios...');
    const { data: beneficiarios } = await supabase
        .from('beneficiarios')
        .select('id, nome, vendedor_id');

    for (const b of beneficiarios) {
        const { data: payments } = await supabase
            .from('pagamentos')
            .select('id, status')
            .eq('beneficiario_id', b.id);

        console.log(`Beneficiario: ${b.nome} (VendedorID: ${b.vendedor_id}) | Payments count: ${payments?.length || 0}`);
    }
}

fixAndVerify();
