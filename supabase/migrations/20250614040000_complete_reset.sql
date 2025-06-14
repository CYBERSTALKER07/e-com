-- Drop all existing tables and start fresh
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS stores CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- Create profiles table
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

-- Create stores table
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

-- Create products table
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

-- Create orders table
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT now(),
    customer_id UUID NOT NULL REFERENCES auth.users(id),
    status TEXT NOT NULL DEFAULT 'pending',
    total NUMERIC NOT NULL,
    shipping_address JSONB NOT NULL,
    billing_address JSONB NOT NULL,
    payment_method TEXT NOT NULL,
    items JSONB NOT NULL,
    estimated_delivery DATE DEFAULT (CURRENT_DATE + INTERVAL '5 days')
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

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

CREATE POLICY "Users can read own orders"
    ON orders
    FOR SELECT
    TO authenticated
    USING (auth.uid() = customer_id);

CREATE POLICY "Users can insert own orders"
    ON orders
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = customer_id);

-- Create function to handle new user registration
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

-- Create trigger for new user registration
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();
