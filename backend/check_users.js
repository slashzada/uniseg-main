import { supabase } from './src/config/supabase.js';
import dotenv from 'dotenv';
dotenv.config();

async function checkUsers() {
    console.log('Checking Users...');
    const { data: users, error } = await supabase.from('usuarios').select('id, nome, email, papel');
    if (error) console.error('Error fetching users:', error);
    else {
        console.log(`Found ${users.length} users.`);
        users.forEach(u => console.log(`- ${u.nome} (${u.email}) [${u.papel}]`));
    }
}

checkUsers();
