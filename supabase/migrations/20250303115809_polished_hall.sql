/*
  # Fix infinite recursion in profiles policies

  1. Changes
    - Drop all problematic policies that cause infinite recursion
    - Create new policies with direct checks that avoid recursion
    - Use user metadata for admin checks instead of self-referencing the profiles table
  
  2. Security
    - Maintain RLS protection
    - Fix infinite recursion in policies
    - Ensure proper access control
*/

-- Drop all potentially problematic policies
DROP POLICY IF EXISTS "Admins can read all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can read all profiles fixed" ON profiles;
DROP POLICY IF EXISTS "Admins can update any profile" ON profiles;

-- Create a completely new approach that doesn't cause recursion
-- This uses auth.uid() directly and checks user metadata instead of profiles table

-- Create a function to check admin status using user metadata
CREATE OR REPLACE FUNCTION is_admin_from_metadata()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM auth.users
    WHERE id = auth.uid() AND (
      raw_user_meta_data->>'role' = 'admin' OR
      raw_user_meta_data->>'is_admin' = 'true'
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Admins can read all profiles
CREATE POLICY "Admins can read all profiles metadata"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (
    is_admin_from_metadata() OR auth.uid() = id
  );

-- Admins can update any profile
CREATE POLICY "Admins can update any profile metadata"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (
    is_admin_from_metadata() OR auth.uid() = id
  );

-- Update the handle_new_user function to properly set admin role from metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NULL,
    COALESCE(NEW.raw_user_meta_data->>'role', 'user')
  )
  ON CONFLICT (id) DO UPDATE
  SET 
    full_name = EXCLUDED.full_name,
    role = COALESCE(NEW.raw_user_meta_data->>'role', 'user');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;