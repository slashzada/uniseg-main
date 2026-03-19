import { supabase } from './src/config/supabase.js';
import dotenv from 'dotenv';
dotenv.config();

async function checkValues() {
    console.log('Checking Users data...');
    const { data: users, error } = await supabase.from('usuarios').select('nome, email, vendedor_id');
    if (error) console.error('Error:', error);
    else {
        users.forEach(u => console.log(`- ${u.nome}: vendedor_id = ${u.vendedor_id}`));
    }
}

checkValues();
