const API_URL = 'http://localhost:3000/api';

async function testWorkflow() {
    try {
        console.log('1. Logging in as Juliana (Vendedor)...');
        const loginRes = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'juliana@uniseguros.com', senha: 'admin123' })
        });

        const loginData = await loginRes.json();
        console.log('Login Response:', JSON.stringify(loginData, null, 2));

        if (!loginRes.ok) throw new Error(`Login failed: ${loginData.error || loginRes.statusText}`);

        // Adjust based on the actual response structure
        const token = loginData.token;
        const user = loginData.usuario || loginData.user || loginData;
        const vendedor_id = user.vendedor_id;

        console.log('Login successful. Token:', token ? token.substring(0, 10) + '...' : 'NONE');
        console.log('Vendedor ID:', vendedor_id);

        if (!vendedor_id) console.warn('WARNING: Vendedor ID is still null/undefined in response');

        console.log('2. Creating a new beneficiary for Juliana...');
        const benRes = await fetch(`${API_URL}/beneficiarios`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                nome: 'Teste Automatico 3',
                cpf: '88877766644',
                plano_id: null,
                vendedor_id: vendedor_id,
                valor: '450.00',
                vigencia: '2026-03-01'
            })
        });

        const benData = await benRes.json();
        if (!benRes.ok) throw new Error(`Create ben failed: ${JSON.stringify(benData)}`);
        console.log('Beneficiary created:', benData.id);

        console.log('3. Checking if payment was created automatically...');
        const pagRes = await fetch(`${API_URL}/financeiro`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const pagamentos = await pagRes.json();
        const matchingPayment = pagamentos.find(p => p.beneficiario_id === benData.id);

        if (matchingPayment) {
            console.log('SUCCESS: Payment found!', matchingPayment);
        } else {
            console.log('FAILURE: No payment found for new beneficiary.');
        }

    } catch (error) {
        console.error('Error during test:', error.message);
    }
}

testWorkflow();
