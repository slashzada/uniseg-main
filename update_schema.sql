-- Update Schema for New Features
-- Run this in Supabase SQL Editor

-- 1. Add 'vendedor_id' to users to link them to specific profiles
ALTER TABLE usuarios 
ADD COLUMN IF NOT EXISTS vendedor_id UUID REFERENCES vendedores(id) ON DELETE SET NULL;

-- 2. Add 'vigencia' date to beneficiarios
ALTER TABLE beneficiarios 
ADD COLUMN IF NOT EXISTS vigencia DATE;

-- 3. Update RLS Policies to be safer (Optional but recommended)
-- For now, relying on Controller logic as requested.
