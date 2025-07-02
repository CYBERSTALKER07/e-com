-- Check existing policies and add only the missing ones for products table

-- Enable RLS on products table (will be ignored if already enabled)
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Check if policies exist and create only if they don't exist
DO $$
BEGIN
    -- Allow users to select all products
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'products' 
        AND policyname = 'Allow users to select all products'
    ) THEN
        CREATE POLICY "Allow users to select all products"
          ON products
          FOR SELECT
          TO authenticated
          USING (true);
    END IF;

    -- Allow store owners to insert products
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'products' 
        AND policyname = 'Allow store owners to insert products'
    ) THEN
        CREATE POLICY "Allow store owners to insert products"
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
    END IF;

    -- Allow store owners to update products
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'products' 
        AND policyname = 'Allow store owners to update products'
    ) THEN
        CREATE POLICY "Allow store owners to update products"
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
    END IF;

    -- Allow store owners to delete products
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'products' 
        AND policyname = 'Allow store owners to delete products'
    ) THEN
        CREATE POLICY "Allow store owners to delete products"
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
    END IF;
END $$;