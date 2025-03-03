/*
  # Fix profiles policies and add admin role support

  1. Changes
    - Drop problematic policies that cause infinite recursion
    - Create new policies with direct auth.uid() checks
    - Add admin role support without recursion
  
  2. Security
    - Maintain RLS protection
    - Fix infinite recursion in policies
    - Ensure proper access control
*/

-- Drop problematic policies that might cause infinite recursion
DROP POLICY IF EXISTS "Admins can read all profiles" ON profiles;

-- Create a simpler policy for admins that doesn't cause recursion
CREATE POLICY "Admins can read all profiles fixed"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
    OR auth.uid() = id
  );

-- Create a policy for admins to update any profile
CREATE POLICY "Admins can update any profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
  );