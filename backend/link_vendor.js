import { supabase } from './src/config/supabase.js';
import dotenv from 'dotenv';
dotenv.config();

async function linkVendor() {
    console.log('Checking Vendedores...');
    const { data: vends, error: errV } = await supabase.from('vendedores').select('id, nome');
    if (errV) console.error('Error:', errV);
    else {
        const vend = vends[0];
        if (vend) {
            console.log(`Linking Juliana to vendor: ${vend.nome} (${vend.id})`);
            const { error: errU } = await supabase
                .from('usuarios')
                .update({ vendedor_id: vend.id })
                .eq('email', 'juliana@uniseguros.com');

            if (errU) console.error('Error updating user:', errU);
            else console.log('Juliana linked successfully!');
        } else {
            console.log('No vendors found. Creating one...');
            const { data: newVend, error: errNV } = await supabase
                .from('vendedores')
                .insert({ nome: 'Juliana Vendor', email: 'juliana@uniseguros.com' })
                .select()
                .single();

            if (errNV) console.error('Error creating vendor:', errNV);
            else {
                await supabase.from('usuarios').update({ vendedor_id: newVend.id }).eq('email', 'juliana@uniseguros.com');
                console.log('New vendor created and Juliana linked!');
            }
        }
    }
}

linkVendor();
