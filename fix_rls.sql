-- FIX RLS POLICIES
-- Run this script in the Supabase SQL Editor to allow the API to read data

-- 1. Enable RLS on the table (ensure it is secure by default, but we add policies)
ALTER TABLE operadoras ENABLE ROW LEVEL SECURITY;

-- 2. Create a policy that allows EVERYONE (Public/Anon) to READ (SELECT) data
-- This is necessary if your backend is not using the Service Role Key correctly
DROP POLICY IF EXISTS "Public Read Operadoras" ON operadoras;
CREATE POLICY "Public Read Operadoras" 
ON operadoras 
FOR SELECT 
USING (true);

-- 3. Also fix other tables just in case
DROP POLICY IF EXISTS "Public Read Planos" ON planos;
CREATE POLICY "Public Read Planos" 
ON planos 
FOR SELECT 
USING (true);

DROP POLICY IF EXISTS "Public Read Beneficiarios" ON beneficiarios;
CREATE POLICY "Public Read Beneficiarios" 
ON beneficiarios 
FOR SELECT 
USING (true);
