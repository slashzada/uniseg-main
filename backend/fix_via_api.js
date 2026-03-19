// Usando fetch nativo do Node 18+

const API_URL = 'http://127.0.0.1:3000/api';

async function fixJulianaViaAPI() {
    console.log('--- Corrigindo Juliana via API ---');

    try {
        // 1. Login como Admin
        console.log('Realizando login...');
        const loginRes = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'admin@uniseguros.com', senha: 'admin123' })
        });

        const loginData = await loginRes.json();
        if (!loginRes.ok) {
            throw new Error(`Login falhou: ${loginData.error}`);
        }

        const token = loginData.token;
        console.log('Login realizado com sucesso.');

        // 2. Buscar vendedora Juliana para pegar o ID
        console.log('Buscando vendedora Juliana...');
        const vRes = await fetch(`${API_URL}/vendedores`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const vendedores = await vRes.json();
        const juliana = vendedores.find(v => v.nome.includes('Juliana'));

        if (!juliana) {
            console.log('Vendedora Juliana não encontrada.');
            return;
        }

        console.log(`Juliana encontrada. ID: ${juliana.id}. Comissão atual: ${juliana.comissao}%`);

        // 3. Atualizar comissão
        console.log('Atualizando comissão para 10%...');
        const updateRes = await fetch(`${API_URL}/vendedores/${juliana.id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ comissao: 10 })
        });

        if (updateRes.ok) {
            console.log('✅ Comissão atualizada com sucesso!');
        } else {
            const errorData = await updateRes.json();
            console.error('❌ Erro ao atualizar:', errorData.error);
        }

    } catch (error) {
        console.error('Erro:', error.message);
    }
}

fixJulianaViaAPI();
