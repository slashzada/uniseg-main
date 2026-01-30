import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

async function forceUpdate() {
    console.log('1. Fetching Vendedor Juliana...');
    const { data: vends } = await supabase.from('vendedores').select('id').eq('email', 'juliana@uniseguros.com').single();

    if (!vends) {
        console.error('Vendedor Juliana not found in vendedores table!');
        return;
    }

    const vendId = vends.id;
    console.log(`Vendedor ID found: ${vendId}`);

    console.log('2. Updating Usuario Juliana...');
    const { data, error, status, count } = await supabase
        .from('usuarios')
        .update({ vendedor_id: vendId })
        .eq('email', 'juliana@uniseguros.com')
        .select();

    if (error) {
        console.error('Error during update:', error);
    } else {
        console.log(`Update Result - Status: ${status}, Affected Rows: ${data?.length || 0}`);
        console.log('Updated Data:', data);
    }
}

forceUpdate();
