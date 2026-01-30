import { supabase } from './src/config/supabase.js';
import dotenv from 'dotenv';
dotenv.config();

async function checkConstraints() {
    console.log('Checking pagamentos table details...');

    // Try to find status column definition or constraints
    const { data, error } = await supabase.rpc('get_table_info', { table_name: 'pagamentos' });

    if (error) {
        console.log('RPC failed, trying sample query...');
        const { data: sample, error: err2 } = await supabase.from('pagamentos').select('status').limit(1);
        if (err2) console.error('Error fetching sample:', err2);
        else console.log('Current status sample:', sample);
    } else {
        console.log('Table Info:', data);
    }

    // Check current distinct statuses
    console.log('Fetching distinct statuses...');
    const { data: statuses, error: statusErr } = await supabase
        .from('pagamentos')
        .select('status');

    if (statusErr) console.error('Error fetching statuses:', statusErr);
    else {
        const uniqueStatuses = [...new Set(statuses.map(s => s.status))];
        console.log('Unique statuses in DB:', uniqueStatuses);
    }
}

checkConstraints();
