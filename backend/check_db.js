import { supabase } from './src/config/supabase.js';
import dotenv from 'dotenv';
dotenv.config();

async function checkData() {
    console.log('Checking Beneficiarios...');
    const { data: ben, error: errorBen } = await supabase.from('beneficiarios').select('*');
    if (errorBen) console.error('Error fetching beneficiarios:', errorBen);
    else console.log(`Found ${ben.length} beneficiarios.`);

    console.log('Checking Pagamentos...');
    const { data: pag, error: errorPag } = await supabase.from('pagamentos').select('*');
    if (errorPag) console.error('Error fetching pagamentos:', errorPag);
    else {
        console.log(`Found ${pag.length} pagamentos.`);
        pag.forEach(p => {
            console.log(`ID: ${p.id}, BenID: ${p.beneficiario_id}, Status: ${p.status}, Vencimento: ${p.vencimento}`);
        });
    }
}

checkData();
