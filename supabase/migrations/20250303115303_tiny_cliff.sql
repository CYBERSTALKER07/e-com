/*
  # Update orders table and policies

  1. Changes
    - Check if constraint exists before adding it
    - Add policies for users and admins
    - Create admin check function
  
  2. Security
    - Ensure RLS is enabled
    - Add policies for users to read/insert their own orders
    - Add policies for admins to read/update all orders
*/

-- Check if orders table exists, if not create it
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'orders') THEN
    CREATE TABLE orders (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      created_at TIMESTAMPTZ DEFAULT now(),
      customer_id UUID NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      total NUMERIC NOT NULL,
      shipping_address JSONB NOT NULL,
      billing_address JSONB NOT NULL,
      payment_method TEXT NOT NULL,
      items JSONB NOT NULL,
      estimated_delivery DATE DEFAULT (CURRENT_DATE + INTERVAL '5 days')
    );
  END IF;
END
$$;

-- Check if foreign key constraint exists before adding it
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'orders_customer_id_fkey'
  ) THEN
    ALTER TABLE orders 
      ADD CONSTRAINT orders_customer_id_fkey 
      FOREIGN KEY (customer_id) REFERENCES auth.users(id);
  END IF;
END
$$;

-- Enable Row Level Security
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can read own orders" ON orders;
DROP POLICY IF EXISTS "Users can insert own orders" ON orders;
DROP POLICY IF EXISTS "Admins can read all orders" ON orders;
DROP POLICY IF EXISTS "Admins can update all orders" ON orders;

-- Create policies
-- Users can read their own orders
CREATE POLICY "Users can read own orders"
  ON orders
  FOR SELECT
  TO authenticated
  USING (auth.uid() = customer_id);

-- Users can insert their own orders
CREATE POLICY "Users can insert own orders"
  ON orders
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = customer_id);

-- Create or replace admin check function if it doesn't exist
CREATE OR REPLACE FUNCTION is_admin_by_id(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM auth.users
    WHERE id = user_id AND raw_user_meta_data->>'role' = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Admins can read all orders
CREATE POLICY "Admins can read all orders"
  ON orders
  FOR SELECT
  TO authenticated
  USING (is_admin_by_id(auth.uid()) OR auth.uid() = customer_id);

-- Admins can update all orders
CREATE POLICY "Admins can update all orders"
  ON orders
  FOR UPDATE
  TO authenticated
  USING (is_admin_by_id(auth.uid()));