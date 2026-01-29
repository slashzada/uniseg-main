-- Update Schema for New Features
-- Run this in Supabase SQL Editor

-- 1. Add 'vendedor_id' to users to link them to specific profiles
ALTER TABLE usuarios 
ADD COLUMN IF NOT EXISTS vendedor_id UUID REFERENCES vendedores(id) ON DELETE SET NULL;

-- 2. Add 'vigencia' date to beneficiarios
ALTER TABLE beneficiarios 
ADD COLUMN IF NOT EXISTS vigencia DATE;

-- 3. Add fields for payment confirmation workflow
ALTER TABLE pagamentos 
ADD COLUMN IF NOT EXISTS confirmado_por UUID REFERENCES usuarios(id) ON DELETE SET NULL;

ALTER TABLE pagamentos 
ADD COLUMN IF NOT EXISTS confirmado_em TIMESTAMP;

-- 4. Update status check constraint to include new status
-- Note: This assumes the status column uses a check constraint
-- If using enum type, you may need to alter the type instead
-- ALTER TYPE status_pagamento ADD VALUE IF NOT EXISTS 'comprovante_anexado';

-- 5. Update RLS Policies to be safer (Optional but recommended)
-- For now, relying on Controller logic as requested.
