import { supabase } from './src/config/supabase.js';
import dotenv from 'dotenv';
dotenv.config();

async function checkSchema() {
    console.log('Checking Usuarios table columns...');
    const { data, error } = await supabase.rpc('get_table_info', { table_name: 'usuarios' });
    // If rpc doesn't exist, try a simple select with everything
    const { data: cols, error: err2 } = await supabase.from('usuarios').select('*').limit(1);
    if (err2) console.error('Error:', err2);
    else console.log('Columns found:', Object.keys(cols[0] || {}));
}

checkSchema();
