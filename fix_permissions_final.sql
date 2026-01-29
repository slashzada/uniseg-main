-- FIX ALL PERMISSIONS (NUCLEAR OPTION)
-- Run this in Supabase SQL Editor to guarantee all tables are readable by the system

-- 1. Enable RLS on all tables (Safety first, then we open access)
ALTER TABLE operadoras ENABLE ROW LEVEL SECURITY;
ALTER TABLE planos ENABLE ROW LEVEL SECURITY;
ALTER TABLE beneficiarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendedores ENABLE ROW LEVEL SECURITY;
ALTER TABLE pagamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;

-- 2. Drop existing policies to prevent conflicts/duplicates
DROP POLICY IF EXISTS "Public Read Operadoras" ON operadoras;
DROP POLICY IF EXISTS "Public Read Planos" ON planos;
DROP POLICY IF EXISTS "Public Read Beneficiarios" ON beneficiarios;
DROP POLICY IF EXISTS "Public Read Vendedores" ON vendedores;
DROP POLICY IF EXISTS "Public Read Pagamentos" ON pagamentos;
DROP POLICY IF EXISTS "Public Read Usuarios" ON usuarios;

-- 3. Create "Public Read" policies (Allows Anon/Public Key to SELECT)
CREATE POLICY "Public Read Operadoras" ON operadoras FOR SELECT USING (true);
CREATE POLICY "Public Read Planos" ON planos FOR SELECT USING (true);
CREATE POLICY "Public Read Beneficiarios" ON beneficiarios FOR SELECT USING (true);
CREATE POLICY "Public Read Vendedores" ON vendedores FOR SELECT USING (true);
CREATE POLICY "Public Read Pagamentos" ON pagamentos FOR SELECT USING (true);
CREATE POLICY "Public Read Usuarios" ON usuarios FOR SELECT USING (true);

-- 4. Create "Authenticated Insert/Update/Delete" policies (Optional, but good for safety)
-- Adjust 'authenticated' to 'true' if you want PUBLIC write access (Caution!)
CREATE POLICY "Auth Write Operadoras" ON operadoras FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Auth Write Planos" ON planos FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Auth Write Beneficiarios" ON beneficiarios FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Auth Write Vendedores" ON vendedores FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Auth Write Pagamentos" ON pagamentos FOR ALL USING (auth.role() = 'authenticated');
