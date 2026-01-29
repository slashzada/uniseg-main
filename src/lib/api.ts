// Configuração da API
// Hardcoded for debugging to ensure connection
const API_BASE_URL = 'https://uniseg-main.onrender.com/api';
// console.log('[API] Using Base URL:', API_BASE_URL);

// Helper to clean undefined/null params
const cleanParams = (params: any) => {
  const newParams: any = {};
  Object.keys(params || {}).forEach(key => {
    if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
      newParams[key] = params[key];
    }
  });
  return newParams;
};

// Função auxiliar para fazer requisições
async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = localStorage.getItem('uniseguros_token');

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(error.error || `HTTP error! status: ${response.status}`);
  }

  return response.json();
}

// API de Autenticação
export const authAPI = {
  login: async (email: string, senha: string) => {
    const data = await request<{ token: string; user: any }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, senha }),
    });

    // Salvar token
    localStorage.setItem('uniseguros_token', data.token);
    localStorage.setItem('uniseguros_user', JSON.stringify(data.user));

    return data;
  },

  register: async (nome: string, email: string, senha: string, papel: string) => {
    const data = await request<{ token: string; user: any }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ nome, email, senha, papel }),
    });

    localStorage.setItem('uniseguros_token', data.token);
    localStorage.setItem('uniseguros_user', JSON.stringify(data.user));

    return data;
  },

  getCurrentUser: async () => {
    return request<any>('/auth/me');
  },

  logout: () => {
    localStorage.removeItem('uniseguros_token');
    localStorage.removeItem('uniseguros_user');
  },
};

// API de Usuários (Admin Management)
export const usuariosAPI = {
  getAll: () => request<any[]>('/usuarios'),
  create: (data: any) => request<any>('/usuarios', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: any) => request<any>(`/usuarios/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) => request<{ message: string }>(`/usuarios/${id}`, { method: 'DELETE' }),
};

// API de Operadoras
export const operadorasAPI = {
  getAll: (status?: string) => request<any[]>(`/operadoras${status ? `?status=${status}` : ''}`),
  getById: (id: string) => request<any>(`/operadoras/${id}`),
  create: (data: any) => request<any>('/operadoras', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: any) => request<any>(`/operadoras/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) => request<{ message: string }>(`/operadoras/${id}`, { method: 'DELETE' }),
};

// API de Planos
export const planosAPI = {
  getAll: (params?: { tipo?: string; operadora_id?: string; busca?: string }) => {
    const query = new URLSearchParams(cleanParams(params)).toString();
    return request<any[]>(`/planos${query ? `?${query}` : ''}`);
  },
  getById: (id: string) => request<any>(`/planos/${id}`),
  create: (data: any) => request<any>('/planos', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: any) => request<any>(`/planos/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) => request<{ message: string }>(`/planos/${id}`, { method: 'DELETE' }),
};

// API de Beneficiários
export const beneficiariosAPI = {
  getAll: (params?: { status?: string; vendedor_id?: string; busca?: string }) => {
    const query = new URLSearchParams(cleanParams(params)).toString();
    return request<any[]>(`/beneficiarios${query ? `?${query}` : ''}`);
  },
  getById: (id: string) => request<any>(`/beneficiarios/${id}`),
  create: (data: any) => request<any>('/beneficiarios', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: any) => request<any>(`/beneficiarios/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) => request<{ message: string }>(`/beneficiarios/${id}`, { method: 'DELETE' }),
};

// API de Vendedores (New)
export const vendedoresAPI = {
  getAll: () => request<any[]>('/vendedores'),
  create: (data: any) => request<any>('/vendedores', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: any) => request<any>(`/vendedores/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) => request<{ message: string }>(`/vendedores/${id}`, { method: 'DELETE' }),
};

// API de Financeiro
export const financeiroAPI = {
  getAll: (params?: { status?: string; busca?: string }) => {
    const query = new URLSearchParams(cleanParams(params)).toString();
    return request<any[]>(`/financeiro${query ? `?${query}` : ''}`);
  },
  getById: (id: string) => request<any>(`/financeiro/${id}`),
  create: (data: any) => request<any>('/financeiro', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: any) => request<any>(`/financeiro/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  anexarBoleto: (id: string, boleto_nome: string, boleto_url?: string) =>
    request<any>(`/financeiro/${id}/boleto`, {
      method: 'POST',
      body: JSON.stringify({ boleto_nome, boleto_url })
    }),
  delete: (id: string) => request<{ message: string }>(`/financeiro/${id}`, { method: 'DELETE' }),
};

// API de Dashboard
export const dashboardAPI = {
  getStats: () => request<any>('/dashboard/stats'),
  getRevenue: () => request<{ meses: string[]; receitas: number[] }>('/dashboard/revenue'),
};

// API de Configurações Globais (New)
export const configuracoesAPI = {
  get: () => request<any>('/configuracoes'),
  update: (data: { taxa_admin?: number; dias_carencia?: number; multa_atraso?: number }) =>
    request<any>('/configuracoes', { method: 'PUT', body: JSON.stringify(data) }),
};