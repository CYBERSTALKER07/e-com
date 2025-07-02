-- Comprehensive RLS policy setup for all tables
-- Run this in your Supabase SQL Editor

-- 1. Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- 2. Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Allow users to select their own profile" ON profiles;
DROP POLICY IF EXISTS "Allow users to insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Allow users to update their own profile" ON profiles;
DROP POLICY IF EXISTS "Allow users to select all products" ON products;
DROP POLICY IF EXISTS "Allow store owners to insert products" ON products;
DROP POLICY IF EXISTS "Allow store owners to update products" ON products;
DROP POLICY IF EXISTS "Allow store owners to delete products" ON products;
DROP POLICY IF EXISTS "Allow users to select all stores" ON stores;
DROP POLICY IF EXISTS "Allow store owners to manage their stores" ON stores;
DROP POLICY IF EXISTS "Allow users to view orders" ON orders;
DROP POLICY IF EXISTS "Allow users to create orders" ON orders;
DROP POLICY IF EXISTS "Allow admins and store owners to update orders" ON orders;

-- 3. Profiles table policies
CREATE POLICY "Allow users to select their own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Allow users to insert their own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Allow users to update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- 4. Stores table policies
CREATE POLICY "Allow authenticated users to select all active stores"
  ON stores FOR SELECT
  TO authenticated
  USING (is_active = true OR owner_id = auth.uid());

CREATE POLICY "Allow users to insert their own stores"
  ON stores FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Allow store owners to update their stores"
  ON stores FOR UPDATE
  TO authenticated
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Allow store owners to delete their stores"
  ON stores FOR DELETE
  TO authenticated
  USING (auth.uid() = owner_id);

-- 5. Products table policies
CREATE POLICY "Allow users to select all visible products"
  ON products FOR SELECT
  TO authenticated
  USING (is_visible = true);

CREATE POLICY "Allow store owners to insert products"
  ON products FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM stores 
      WHERE stores.id = products.store_id 
      AND stores.owner_id = auth.uid()
    )
  );

CREATE POLICY "Allow store owners to update products"
  ON products FOR UPDATE
  TO authenticated
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

CREATE POLICY "Allow store owners to delete products"
  ON products FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM stores 
      WHERE stores.id = products.store_id 
      AND stores.owner_id = auth.uid()
    )
  );

-- 6. Orders table policies
CREATE POLICY "Allow users to view their own orders"
  ON orders FOR SELECT
  TO authenticated
  USING (customer_id = auth.uid());

CREATE POLICY "Allow admins to view all orders"
  ON orders FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Allow users to create orders"
  ON orders FOR INSERT
  TO authenticated
  WITH CHECK (customer_id = auth.uid());

CREATE POLICY "Allow admins to update orders"
  ON orders FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Allow store owners to update orders for their products"
  ON orders FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM stores 
      JOIN products ON products.store_id = stores.id
      WHERE stores.owner_id = auth.uid()
      AND orders.items::jsonb @> jsonb_build_array(jsonb_build_object('product', jsonb_build_object('store_id', stores.id)))
    )
  );

-- 7. Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON profiles TO authenticated;
GRANT ALL ON stores TO authenticated;
GRANT ALL ON products TO authenticated;
GRANT ALL ON orders TO authenticated;