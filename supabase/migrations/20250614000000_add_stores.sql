/*
  # Create stores table and security policies

  1. New Tables
    - `stores` - Stores user's product listings
      - `id` (uuid, primary key)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
      - `owner_id` (uuid, references auth.users)
      - `name` (text)
      - `description` (text)
      - `is_active` (boolean)
*/

-- Create stores table
CREATE TABLE IF NOT EXISTS stores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  CONSTRAINT stores_name_key UNIQUE (name)
);

-- Enable RLS
ALTER TABLE stores ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Everyone can view active stores" ON stores;
DROP POLICY IF EXISTS "Users can manage their own stores" ON stores;

-- Create policies
CREATE POLICY "Everyone can view active stores"
  ON stores
  FOR SELECT
  USING (is_active = true);

CREATE POLICY "Users can manage their own stores"
  ON stores
  FOR ALL
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

-- Create a trigger to update updated_at
CREATE OR REPLACE FUNCTION update_store_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_store_updated_at
    BEFORE UPDATE ON stores
    FOR EACH ROW
    EXECUTE FUNCTION update_store_updated_at_column();

-- Add store_id to products table
ALTER TABLE IF EXISTS products 
  ADD COLUMN store_id UUID REFERENCES stores(id) ON DELETE CASCADE;

-- Update products policies
DROP POLICY IF EXISTS "Everyone can view products" ON products;
CREATE POLICY "Everyone can view products from active stores"
  ON products
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM stores 
      WHERE stores.id = products.store_id 
      AND stores.is_active = true
    )
  );

DROP POLICY IF EXISTS "Users can manage their own products" ON products;
CREATE POLICY "Users can manage their own products"
  ON products
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM stores 
      WHERE stores.id = products.store_id 
      AND stores.owner_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM stores 
      WHERE stores.id = products.store_id 
      AND stores.owner_id = auth.uid()
    )
  );