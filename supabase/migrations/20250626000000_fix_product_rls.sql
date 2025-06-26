/*
  # Fix products table RLS policies
  
  This migration addresses the "new row violates row-level security policy for table \"products\"" error
  by enhancing the RLS policies for the products table.
  
  1. Improvements
    - Drop and recreate product RLS policies with better checks
    - Add explicit insert policy for store owners
    - Add admin override policies
    - Fix policy conditions to properly handle null values
*/

-- Drop existing product policies to avoid conflicts
DROP POLICY IF EXISTS "Everyone can view visible products" ON products;
DROP POLICY IF EXISTS "Store owners can manage their products" ON products;

-- Create enhanced policies

-- Policy for public viewing of products
CREATE POLICY "Everyone can view visible products"
    ON products
    FOR SELECT
    USING (is_visible = true);

-- Explicit policy for store owners to insert products
CREATE POLICY "Store owners can insert products"
    ON products
    FOR INSERT 
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM stores 
            WHERE stores.id = products.store_id 
            AND stores.owner_id = auth.uid()
        )
    );

-- Policy for store owners to update their products
CREATE POLICY "Store owners can update their products"
    ON products
    FOR UPDATE
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

-- Policy for store owners to delete their products
CREATE POLICY "Store owners can delete their products"
    ON products
    FOR DELETE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM stores 
            WHERE stores.id = products.store_id 
            AND stores.owner_id = auth.uid()
        )
    );

-- Admin policies for products
CREATE POLICY "Admins can view all products"
    ON products
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
        )
    );

CREATE POLICY "Admins can insert products"
    ON products
    FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
        )
    );

CREATE POLICY "Admins can update products"
    ON products
    FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
        )
    );

CREATE POLICY "Admins can delete products"
    ON products
    FOR DELETE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
        )
    );