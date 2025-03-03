/*
  # Create orders table and security policies

  1. New Tables
    - `orders` - Stores customer order information
      - `id` (uuid, primary key)
      - `created_at` (timestamptz)
      - `customer_id` (uuid, references auth.users)
      - `status` (text, default 'pending')
      - `total` (numeric)
      - `shipping_address` (jsonb)
      - `billing_address` (jsonb)
      - `payment_method` (text)
      - `items` (jsonb)
      - `estimated_delivery` (date)
  
  2. Security
    - Enable RLS on `orders` table
    - Add policies for users to read/insert their own orders
    - Add policies for admins to read/update all orders
*/

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
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

-- Add foreign key constraint separately
ALTER TABLE orders 
  ADD CONSTRAINT orders_customer_id_fkey 
  FOREIGN KEY (customer_id) REFERENCES auth.users(id);

-- Enable Row Level Security
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

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

-- Create admin policies that don't depend on the profiles table
-- This uses a function to check admin status instead
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
DECLARE
  is_admin BOOLEAN;
BEGIN
  -- Check if profiles table exists
  IF EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'profiles'
  ) THEN
    -- If profiles exists, check if user is admin
    SELECT EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    ) INTO is_admin;
  ELSE
    -- Default to false if profiles table doesn't exist yet
    is_admin := FALSE;
  END IF;
  
  RETURN is_admin;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Admins can read all orders
CREATE POLICY "Admins can read all orders"
  ON orders
  FOR SELECT
  TO authenticated
  USING (is_admin() OR auth.uid() = customer_id);

-- Admins can update all orders
CREATE POLICY "Admins can update all orders"
  ON orders
  FOR UPDATE
  TO authenticated
  USING (is_admin());