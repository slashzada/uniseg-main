-- Habilita a extensão uuid-ossp para gerar UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabela de Usuários
CREATE TABLE IF NOT EXISTS usuarios (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    senha_hash TEXT NOT NULL,
    papel VARCHAR(50) NOT NULL CHECK (papel IN ('Admin', 'Financeiro', 'Vendedor')),
    vendedor_id UUID REFERENCES vendedores(id) ON DELETE SET NULL, -- Link to vendedores table
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS para usuarios
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
-- Admins podem ver e gerenciar todos os usuários
CREATE POLICY "Admin can manage all users" ON usuarios
    FOR ALL USING (auth.role() = 'Admin') WITH CHECK (auth.role() = 'Admin');
-- Financeiro pode ver todos os usuários (mas não editar/deletar)
CREATE POLICY "Financeiro can view all users" ON usuarios
    FOR SELECT USING (auth.role() = 'Financeiro');
-- Vendedores podem ver apenas a si mesmos
CREATE POLICY "Vendedor can view own user" ON usuarios
    FOR SELECT USING (id = auth.uid());


-- Tabela de Operadoras
CREATE TABLE IF NOT EXISTS operadoras (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nome VARCHAR(255) NOT NULL,
    cnpj VARCHAR(18) UNIQUE,
    telefone VARCHAR(20),
    email VARCHAR(255),
    endereco TEXT,
    status VARCHAR(50) DEFAULT 'ativa' CHECK (status IN ('ativa', 'inativa')),
    cor VARCHAR(50) DEFAULT 'from-primary to-primary/80', -- Tailwind gradient class
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS para operadoras
ALTER TABLE operadoras ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all authenticated users to view operadoras" ON operadoras
    FOR SELECT USING (auth.role() IS NOT NULL);
CREATE POLICY "Allow Admin/Financeiro to manage operadoras" ON operadoras
    FOR ALL USING (auth.role() IN ('Admin', 'Financeiro')) WITH CHECK (auth.role() IN ('Admin', 'Financeiro'));


-- Tabela de Planos
CREATE TABLE IF NOT EXISTS planos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nome VARCHAR(255) NOT NULL,
    operadora_id UUID REFERENCES operadoras(id) ON DELETE CASCADE,
    valor NUMERIC(10, 2) NOT NULL,
    tipo VARCHAR(50) NOT NULL CHECK (tipo IN ('Individual', 'Familiar', 'Empresarial')),
    popular BOOLEAN DEFAULT FALSE,
    descricao TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS para planos
ALTER TABLE planos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all authenticated users to view planos" ON planos
    FOR SELECT USING (auth.role() IS NOT NULL);
CREATE POLICY "Allow Admin/Financeiro to manage planos" ON planos
    FOR ALL USING (auth.role() IN ('Admin', 'Financeiro')) WITH CHECK (auth.role() IN ('Admin', 'Financeiro'));


-- Tabela de Vendedores
CREATE TABLE IF NOT EXISTS vendedores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE,
    comissao NUMERIC(5, 2) DEFAULT 0 CHECK (comissao >= 0 AND comissao <= 100), -- Porcentagem
    status VARCHAR(50) DEFAULT 'ativo' CHECK (status IN ('ativo', 'inativo')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS para vendedores
ALTER TABLE vendedores ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all authenticated users to view vendedores" ON vendedores
    FOR SELECT USING (auth.role() IS NOT NULL);
CREATE POLICY "Allow Admin/Financeiro to manage vendedores" ON vendedores
    FOR ALL USING (auth.role() IN ('Admin', 'Financeiro')) WITH CHECK (auth.role() IN ('Admin', 'Financeiro'));


-- Tabela de Beneficiários
CREATE TABLE IF NOT EXISTS beneficiarios (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nome VARCHAR(255) NOT NULL,
    cpf VARCHAR(14) UNIQUE NOT NULL,
    plano_id UUID REFERENCES planos(id) ON DELETE RESTRICT,
    vendedor_id UUID REFERENCES vendedores(id) ON DELETE RESTRICT,
    status VARCHAR(50) DEFAULT 'ativo' CHECK (status IN ('ativo', 'inadimplente', 'inativo')),
    desde DATE DEFAULT NOW(),
    vigencia DATE,
    telefone VARCHAR(20),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS para beneficiarios
ALTER TABLE beneficiarios ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all authenticated users to view beneficiarios" ON beneficiarios
    FOR SELECT USING (auth.role() IS NOT NULL);
CREATE POLICY "Allow Admin/Financeiro to manage beneficiarios" ON beneficiarios
    FOR ALL USING (auth.role() IN ('Admin', 'Financeiro')) WITH CHECK (auth.role() IN ('Admin', 'Financeiro'));
CREATE POLICY "Allow Vendedor to manage own beneficiarios" ON beneficiarios
    FOR ALL USING (auth.role() = 'Vendedor' AND vendedor_id = (SELECT vendedor_id FROM usuarios WHERE id = auth.uid()))
    WITH CHECK (auth.role() = 'Vendedor' AND vendedor_id = (SELECT vendedor_id FROM usuarios WHERE id = auth.uid()));


-- Tabela de Pagamentos
CREATE TABLE IF NOT EXISTS pagamentos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    beneficiario_id UUID REFERENCES beneficiarios(id) ON DELETE CASCADE,
    valor NUMERIC(10, 2) NOT NULL,
    vencimento DATE NOT NULL,
    status VARCHAR(50) DEFAULT 'pendente' CHECK (status IN ('pago', 'pendente', 'vencido', 'comprovante_anexado')),
    boleto_anexado TEXT, -- Nome do arquivo ou referência
    boleto_url TEXT,    -- URL pública do boleto/comprovante
    confirmado_por UUID REFERENCES usuarios(id) ON DELETE SET NULL,
    confirmado_em TIMESTAMP WITH TIME ZONE,
    data_comissao_liquidada TIMESTAMP WITH TIME ZONE, -- NEW FIELD: When commission for this payment was paid to seller
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS para pagamentos
ALTER TABLE pagamentos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all authenticated users to view pagamentos" ON pagamentos
    FOR SELECT USING (auth.role() IS NOT NULL);
CREATE POLICY "Allow Admin/Financeiro to manage pagamentos" ON pagamentos
    FOR ALL USING (auth.role() IN ('Admin', 'Financeiro')) WITH CHECK (auth.role() IN ('Admin', 'Financeiro'));
CREATE POLICY "Allow Vendedor to view own beneficiarios payments" ON pagamentos
    FOR SELECT USING (beneficiario_id IN (SELECT id FROM beneficiarios WHERE vendedor_id = (SELECT vendedor_id FROM usuarios WHERE id = auth.uid())));
CREATE POLICY "Allow Vendedor to update own beneficiarios payments (anexar boleto)" ON pagamentos
    FOR UPDATE USING (auth.role() = 'Vendedor' AND beneficiario_id IN (SELECT id FROM beneficiarios WHERE vendedor_id = (SELECT vendedor_id FROM usuarios WHERE id = auth.uid())))
    WITH CHECK (auth.role() = 'Vendedor' AND beneficiario_id IN (SELECT id FROM beneficiarios WHERE vendedor_id = (SELECT vendedor_id FROM usuarios WHERE id = auth.uid())));


-- Tabela de Configurações Globais (Singleton)
CREATE TABLE IF NOT EXISTS configuracoes_globais (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    taxa_admin NUMERIC(5, 2) DEFAULT 5.00, -- Ex: 5.00%
    dias_carencia INTEGER DEFAULT 30,      -- Ex: 30 dias
    multa_atraso NUMERIC(5, 2) DEFAULT 2.00, -- Ex: 2.00%
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS para configuracoes_globais
ALTER TABLE configuracoes_globais ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow Admin to manage configuracoes_globais" ON configuracoes_globais
    FOR ALL USING (auth.role() = 'Admin') WITH CHECK (auth.role() = 'Admin');
CREATE POLICY "Allow all authenticated users to view configuracoes_globais" ON configuracoes_globais
    FOR SELECT USING (auth.role() IS NOT NULL);


-- Tabela de Comissões Liquidadas (NEW TABLE)
CREATE TABLE IF NOT EXISTS comissoes_liquidadas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vendedor_id UUID REFERENCES vendedores(id) ON DELETE RESTRICT,
    valor_liquidado NUMERIC(10, 2) NOT NULL,
    mes_referencia TEXT NOT NULL, -- Formato YYYY-MM
    data_liquidacao TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    liquidado_por_usuario_id UUID REFERENCES usuarios(id) ON DELETE RESTRICT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE (vendedor_id, mes_referencia) -- Garante que só há uma liquidação por vendedor por mês
);

-- RLS para comissoes_liquidadas
ALTER TABLE comissoes_liquidadas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow Admin/Financeiro to view comissoes_liquidadas" ON comissoes_liquidadas
    FOR SELECT USING (auth.role() IN ('Admin', 'Financeiro'));
CREATE POLICY "Allow Admin/Financeiro to insert comissoes_liquidadas" ON comissoes_liquidadas
    FOR INSERT WITH CHECK (auth.role() IN ('Admin', 'Financeiro'));
-- Vendedores podem ver suas próprias comissões liquidadas
CREATE POLICY "Allow Vendedor to view own comissoes_liquidadas" ON comissoes_liquidadas
    FOR SELECT USING (vendedor_id = (SELECT vendedor_id FROM usuarios WHERE id = auth.uid()));


-- Funções para atualizar 'updated_at' automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para 'updated_at'
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_public_usuarios_updated_at') THEN
        CREATE TRIGGER set_public_usuarios_updated_at
        BEFORE UPDATE ON usuarios
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_public_operadoras_updated_at') THEN
        CREATE TRIGGER set_public_operadoras_updated_at
        BEFORE UPDATE ON operadoras
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_public_planos_updated_at') THEN
        CREATE TRIGGER set_public_planos_updated_at
        BEFORE UPDATE ON planos
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_public_vendedores_updated_at') THEN
        CREATE TRIGGER set_public_vendedores_updated_at
        BEFORE UPDATE ON vendedores
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_public_beneficiarios_updated_at') THEN
        CREATE TRIGGER set_public_beneficiarios_updated_at
        BEFORE UPDATE ON beneficiarios
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_public_pagamentos_updated_at') THEN
        CREATE TRIGGER set_public_pagamentos_updated_at
        BEFORE UPDATE ON pagamentos
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_public_configuracoes_globais_updated_at') THEN
        CREATE TRIGGER set_public_configuracoes_globais_updated_at
        BEFORE UPDATE ON configuracoes_globais
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_public_comissoes_liquidadas_updated_at') THEN
        CREATE TRIGGER set_public_comissoes_liquidadas_updated_at
        BEFORE UPDATE ON comissoes_liquidadas
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;