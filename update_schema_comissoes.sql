-- Update Schema for Comissoes Logic
-- Run this in Supabase SQL Editor

-- 1. Add 'valor_comissao' to pagamentos to snapshot the commission value at payment time
ALTER TABLE pagamentos 
ADD COLUMN IF NOT EXISTS valor_comissao NUMERIC(10, 2);

-- 2. Update existing paid payments to have a commission value (Backfill)
-- This assumes current commission rate for past payments if not present.
-- It's an approximation for existing data.
UPDATE pagamentos p
SET valor_comissao = (p.valor * v.comissao / 100)
FROM beneficiarios b
JOIN vendedores v ON b.vendedor_id = v.id
WHERE p.beneficiario_id = b.id
  AND p.status = 'pago'
  AND p.valor_comissao IS NULL;
