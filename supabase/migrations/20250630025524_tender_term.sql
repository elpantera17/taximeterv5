-- Fix authentication permissions for Supabase

-- Ensure auth schema is accessible
GRANT USAGE ON SCHEMA auth TO anon, authenticated;

-- Ensure auth.users can be accessed by the service role
GRANT SELECT ON auth.users TO service_role;

-- Ensure public schema is accessible
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;

-- Ensure all public tables can be read by authenticated users
GRANT SELECT ON ALL TABLES IN SCHEMA public TO authenticated;

-- Ensure specific tables can be read by anonymous users for login/registration
GRANT SELECT ON public.users TO anon;
GRANT SELECT ON public.system_settings TO anon;

-- Ensure anonymous users can execute auth-related functions
GRANT EXECUTE ON FUNCTION public.check_phone_exists(text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.register_user(text, text, text, text, text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.create_test_user() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_public_system_settings() TO anon, authenticated;

-- Fix auth.users permissions for the auth process
ALTER TABLE IF EXISTS auth.users ENABLE ROW LEVEL SECURITY;

-- Allow the auth process to update users
DROP POLICY IF EXISTS "Allow service role full access" ON auth.users;
CREATE POLICY "Allow service role full access" 
  ON auth.users 
  FOR ALL 
  TO service_role 
  USING (true) 
  WITH CHECK (true);

-- Ensure the handle_new_user function has proper permissions
ALTER FUNCTION public.handle_new_user() SECURITY DEFINER;

-- Ensure the sync_user_data_to_auth function has proper permissions
ALTER FUNCTION public.sync_user_data_to_auth() SECURITY DEFINER;

-- Fix RLS policies for users table
DROP POLICY IF EXISTS "Users can read own data" ON users;
CREATE POLICY "Users can read own data"
  ON users FOR SELECT
  TO authenticated
  USING (id = auth.uid()::text OR role = 'admin');

DROP POLICY IF EXISTS "Users can update own data" ON users;
CREATE POLICY "Users can update own data"
  ON users FOR UPDATE
  TO authenticated
  USING (id = auth.uid()::text)
  WITH CHECK (id = auth.uid()::text);

DROP POLICY IF EXISTS "Admins can manage all users" ON users;
CREATE POLICY "Admins can manage all users"
  ON users FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()::text AND users.role = 'admin'
    )
  );

-- Ensure test user creation works
DROP POLICY IF EXISTS "Allow test user creation" ON users;
CREATE POLICY "Allow test user creation"
  ON users FOR INSERT
  TO anon
  WITH CHECK (email = 'test@pantera.local');

-- Fix auth.users trigger to ensure it works properly
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Ensure the auth.users table has the correct RLS policies
DROP POLICY IF EXISTS "Enable read access for all users" ON auth.users;
CREATE POLICY "Enable read access for all users" 
  ON auth.users 
  FOR SELECT 
  TO authenticated 
  USING (true);