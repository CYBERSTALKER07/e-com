-- Safe schema updates
DO $$ 
BEGIN
    -- Create profiles table if it doesn't exist
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'profiles') THEN
        CREATE TABLE profiles (
            id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
            created_at TIMESTAMPTZ DEFAULT now(),
            updated_at TIMESTAMPTZ DEFAULT now(),
            full_name TEXT,
            email TEXT UNIQUE NOT NULL,
            role TEXT DEFAULT 'user',
            avatar_url TEXT,
            phone TEXT,
            CONSTRAINT valid_role CHECK (role IN ('user', 'admin'))
        );
    END IF;

    -- Create stores table if it doesn't exist
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'stores') THEN
        CREATE TABLE stores (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            created_at TIMESTAMPTZ DEFAULT now(),
            updated_at TIMESTAMPTZ DEFAULT now(),
            owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
            name TEXT NOT NULL,
            description TEXT,
            is_active BOOLEAN DEFAULT true,
            CONSTRAINT stores_name_owner_key UNIQUE (name, owner_id)
        );
    END IF;

    -- Create products table if it doesn't exist
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'products') THEN
        CREATE TABLE products (
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
            store_id UUID REFERENCES stores(id) ON DELETE CASCADE
        );
    END IF;

    -- Enable RLS on all tables
    ALTER TABLE IF EXISTS profiles ENABLE ROW LEVEL SECURITY;
    ALTER TABLE IF EXISTS stores ENABLE ROW LEVEL SECURITY;
    ALTER TABLE IF EXISTS products ENABLE ROW LEVEL SECURITY;

    -- Drop existing policies to recreate them
    DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
    DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
    DROP POLICY IF EXISTS "Everyone can view active stores" ON stores;
    DROP POLICY IF EXISTS "Users can manage their own stores" ON stores;
    DROP POLICY IF EXISTS "Everyone can view visible products" ON products;
    DROP POLICY IF EXISTS "Store owners can manage their products" ON products;

    -- Create policies
    CREATE POLICY "Public profiles are viewable by everyone"
        ON profiles FOR SELECT
        USING (true);

    CREATE POLICY "Users can update their own profile"
        ON profiles FOR UPDATE
        USING (auth.uid() = id)
        WITH CHECK (auth.uid() = id);

    CREATE POLICY "Everyone can view active stores"
        ON stores
        FOR SELECT
        USING (is_active = true);

    CREATE POLICY "Users can manage their own stores"
        ON stores
        FOR ALL
        USING (auth.uid() = owner_id)
        WITH CHECK (auth.uid() = owner_id);

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

    -- Create or replace the function to handle new user registration
    CREATE OR REPLACE FUNCTION public.handle_new_user()
    RETURNS trigger AS $$
    BEGIN
        INSERT INTO public.profiles (id, full_name, email, role)
        VALUES (
            new.id,
            new.raw_user_meta_data->'full_name',
            new.email,
            COALESCE(new.raw_user_meta_data->'role', 'user')
        );
        RETURN new;
    END;
    $$ LANGUAGE plpgsql SECURITY DEFINER;

    -- Create trigger for new user registration if it doesn't exist
    DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
    CREATE TRIGGER on_auth_user_created
        AFTER INSERT ON auth.users
        FOR EACH ROW EXECUTE FUNCTION handle_new_user();

END $$;
