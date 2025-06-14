-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC NOT NULL,
  image TEXT,
  stock_quantity INTEGER DEFAULT 0,
  is_visible BOOLEAN DEFAULT true,
  sku TEXT,
  store_id UUID
);

-- Enable RLS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Everyone can view visible products"
  ON products
  FOR SELECT
  USING (is_visible = true);

CREATE POLICY "Store owners can manage their products"
  ON products
  FOR ALL
  USING (EXISTS (
    SELECT 1 FROM stores 
    WHERE stores.id = products.store_id 
    AND stores.owner_id = auth.uid()
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM stores 
    WHERE stores.id = products.store_id 
    AND stores.owner_id = auth.uid()
  ));
