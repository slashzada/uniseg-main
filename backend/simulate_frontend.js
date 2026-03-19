const API_URL = 'http://localhost:3000/api';

async function simulateFrontend() {
    try {
        console.log('1. Logging in...');
        const loginRes = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'juliana@uniseguros.com', senha: 'admin123' })
        });
        const loginData = await loginRes.json();
        const token = loginData.token;
        console.log('Login OK. User Papel:', loginData.user.papel, 'VendedorID:', loginData.user.vendedor_id);

        console.log('2. Fetching Beneficiarios...');
        const benRes = await fetch(`${API_URL}/beneficiarios`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!benRes.ok) {
            console.error('Ben API Error:', benRes.status, await benRes.text());
            return;
        }
        const beneficiarios = await benRes.json();
        console.log(`Found ${beneficiarios.length} beneficiarios.`);

        console.log('3. Fetching Pending Payments...');
        const pagRes = await fetch(`${API_URL}/financeiro?status=pendente`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!pagRes.ok) {
            console.error('Pag API Error:', pagRes.status, await pagRes.text());
            return;
        }
        const pendingPayments = await pagRes.json();
        console.log('Pending Payments Response Type:', typeof pendingPayments, Array.isArray(pendingPayments) ? 'Array' : 'NOT Array');
        console.log('Pending Payments Data:', JSON.stringify(pendingPayments, null, 2));

    } catch (error) {
        console.error('Error:', error.message);
    }
}

simulateFrontend();
