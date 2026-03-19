import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

async function checkSchema() {
    console.log('--- Checking Beneficiarios Schema ---');

    const { data, error } = await supabase
        .from('beneficiarios')
        .select('*')
        .limit(1);

    if (error) {
        console.error('Error:', error);
        return;
    }

    if (data && data.length > 0) {
        console.log('Sample Record:', JSON.stringify(data[0], null, 2));
        console.log('Columns:', Object.keys(data[0]));
    } else {
        console.log('No data found in beneficiarios.');
    }
}

checkSchema();
