-- Check existing policies
SELECT schemaname, tablename, policyname, cmd, roles 
FROM pg_policies 
WHERE tablename IN ('profiles', 'products', 'stores')
ORDER BY tablename, policyname;
