-- Schema do banco de dados para Uniseguros Control Center
-- Execute este script no SQL Editor do Supabase

-- Habilitar extensão UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabela de Usuários
CREATE TABLE IF NOT EXISTS usuarios (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  senha_hash VARCHAR(255) NOT NULL,
  papel VARCHAR(50) NOT NULL CHECK (papel IN ('Admin', 'Financeiro', 'Vendedor')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Operadoras
CREATE TABLE IF NOT EXISTS operadoras (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome VARCHAR(255) NOT NULL,
  status VARCHAR(50) DEFAULT 'ativa' CHECK (status IN ('ativa', 'inativa')),
  cor VARCHAR(100) DEFAULT 'from-primary to-primary/80',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Planos
CREATE TABLE IF NOT EXISTS planos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome VARCHAR(255) NOT NULL,
  operadora_id UUID NOT NULL REFERENCES operadoras(id) ON DELETE CASCADE,
  valor DECIMAL(10, 2) NOT NULL CHECK (valor >= 0),
  tipo VARCHAR(50) NOT NULL CHECK (tipo IN ('Individual', 'Familiar', 'Empresarial')),
  popular BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Vendedores (opcional, pode ser expandida)
CREATE TABLE IF NOT EXISTS vendedores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE,
  comissao DECIMAL(5, 2) DEFAULT 0.00 CHECK (comissao >= 0 AND comissao <= 100),
  usuario_id UUID REFERENCES usuarios(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Beneficiários
CREATE TABLE IF NOT EXISTS beneficiarios (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome VARCHAR(255) NOT NULL,
  cpf VARCHAR(14) UNIQUE NOT NULL,
  plano_id UUID NOT NULL REFERENCES planos(id) ON DELETE RESTRICT,
  vendedor_id UUID REFERENCES vendedores(id) ON DELETE SET NULL,
  status VARCHAR(50) DEFAULT 'ativo' CHECK (status IN ('ativo', 'inadimplente', 'inativo')),
  desde TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Pagamentos
CREATE TABLE IF NOT EXISTS pagamentos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  beneficiario_id UUID NOT NULL REFERENCES beneficiarios(id) ON DELETE CASCADE,
  valor DECIMAL(10, 2) NOT NULL CHECK (valor >= 0),
  vencimento DATE NOT NULL,
  status VARCHAR(50) DEFAULT 'pendente' CHECK (status IN ('pago', 'pendente', 'vencido')),
  boleto_anexado VARCHAR(255),
  boleto_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_usuarios_email ON usuarios(email);
CREATE INDEX IF NOT EXISTS idx_beneficiarios_cpf ON beneficiarios(cpf);
CREATE INDEX IF NOT EXISTS idx_beneficiarios_plano_id ON beneficiarios(plano_id);
CREATE INDEX IF NOT EXISTS idx_beneficiarios_status ON beneficiarios(status);
CREATE INDEX IF NOT EXISTS idx_pagamentos_beneficiario_id ON pagamentos(beneficiario_id);
CREATE INDEX IF NOT EXISTS idx_pagamentos_status ON pagamentos(status);
CREATE INDEX IF NOT EXISTS idx_pagamentos_vencimento ON pagamentos(vencimento);
CREATE INDEX IF NOT EXISTS idx_planos_operadora_id ON planos(operadora_id);

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para atualizar updated_at
CREATE TRIGGER update_usuarios_updated_at BEFORE UPDATE ON usuarios
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_operadoras_updated_at BEFORE UPDATE ON operadoras
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_planos_updated_at BEFORE UPDATE ON planos
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vendedores_updated_at BEFORE UPDATE ON vendedores
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_beneficiarios_updated_at BEFORE UPDATE ON beneficiarios
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pagamentos_updated_at BEFORE UPDATE ON pagamentos
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Usuários iniciais devem ser inseridos via seed.sql
-- Execute o script database/seed.sql após criar o schema

-- Comentários para documentação
COMMENT ON TABLE usuarios IS 'Usuários do sistema com diferentes papéis (Admin, Financeiro, Vendedor)';
COMMENT ON TABLE operadoras IS 'Operadoras de planos de saúde';
COMMENT ON TABLE planos IS 'Planos de saúde oferecidos pelas operadoras';
COMMENT ON TABLE vendedores IS 'Vendedores que podem estar vinculados a usuários';
COMMENT ON TABLE beneficiarios IS 'Beneficiários dos planos de saúde';
COMMENT ON TABLE pagamentos IS 'Pagamentos e boletos dos beneficiários';
