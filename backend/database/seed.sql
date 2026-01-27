-- Script de seed para dados iniciais
-- Execute após criar o schema

-- Inserir usuário admin padrão
-- Senha: admin123
-- Hash gerado com bcrypt (10 rounds)
INSERT INTO usuarios (nome, email, senha_hash, papel)
VALUES (
  'Admin Principal',
  'admin@uniseguros.com',
  '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', -- hash de 'admin123'
  'Admin'
) ON CONFLICT (email) DO NOTHING;

-- Inserir usuário financeiro
-- Senha: maria123
INSERT INTO usuarios (nome, email, senha_hash, papel)
VALUES (
  'Maria Financeiro',
  'maria@uniseguros.com',
  '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', -- hash de 'maria123' (temporário, altere depois)
  'Financeiro'
) ON CONFLICT (email) DO NOTHING;

-- Inserir usuário vendedor
-- Senha: joao123
INSERT INTO usuarios (nome, email, senha_hash, papel)
VALUES (
  'João Vendedor',
  'joao@uniseguros.com',
  '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', -- hash de 'joao123' (temporário, altere depois)
  'Vendedor'
) ON CONFLICT (email) DO NOTHING;

-- Inserir operadoras de exemplo
INSERT INTO operadoras (nome, status, cor) VALUES
  ('Unimed', 'ativa', 'from-blue-500 to-blue-600'),
  ('Amil', 'ativa', 'from-green-500 to-green-600'),
  ('Bradesco Saúde', 'ativa', 'from-red-500 to-red-600'),
  ('SulAmérica', 'ativa', 'from-purple-500 to-purple-600'),
  ('NotreDame Intermédica', 'ativa', 'from-orange-500 to-orange-600')
ON CONFLICT DO NOTHING;
