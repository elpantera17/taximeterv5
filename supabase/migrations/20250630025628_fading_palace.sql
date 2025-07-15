-- Corregir permisos de autenticación en Supabase

-- Asegurar que el esquema auth sea accesible
GRANT USAGE ON SCHEMA auth TO anon, authenticated;

-- Permitir que los usuarios anónimos accedan a las funciones de autenticación
GRANT EXECUTE ON FUNCTION auth.email() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION auth.uid() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION auth.role() TO anon, authenticated;

-- Asegurar que las tablas de autenticación sean accesibles
GRANT SELECT ON auth.users TO service_role;

-- Corregir permisos para la tabla users
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Permitir que usuarios anónimos puedan registrarse
DROP POLICY IF EXISTS "Allow registration for anonymous users" ON users;
CREATE POLICY "Allow registration for anonymous users"
  ON users FOR INSERT
  TO anon
  WITH CHECK (true);

-- Permitir que usuarios anónimos puedan verificar si existe un teléfono
DROP POLICY IF EXISTS "Allow phone check for anonymous users" ON users;
CREATE POLICY "Allow phone check for anonymous users"
  ON users FOR SELECT
  TO anon
  USING (true);

-- Asegurar que los usuarios autenticados puedan leer sus propios datos
DROP POLICY IF EXISTS "Users can read own data" ON users;
CREATE POLICY "Users can read own data"
  ON users FOR SELECT
  TO authenticated
  USING (id = auth.uid()::text OR role = 'admin');

-- Asegurar que los usuarios autenticados puedan actualizar sus propios datos
DROP POLICY IF EXISTS "Users can update own data" ON users;
CREATE POLICY "Users can update own data"
  ON users FOR UPDATE
  TO authenticated
  USING (id = auth.uid()::text)
  WITH CHECK (id = auth.uid()::text);

-- Asegurar que los administradores puedan gestionar todos los usuarios
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

-- Permitir la creación de usuarios de prueba
DROP POLICY IF EXISTS "Allow test user creation" ON users;
CREATE POLICY "Allow test user creation"
  ON users FOR INSERT
  TO anon
  WITH CHECK (email = 'test@pantera.local' OR email LIKE '%@pantera.auto.generated');

-- Asegurar que las funciones de autenticación sean accesibles para usuarios anónimos
GRANT EXECUTE ON FUNCTION public.check_phone_exists(text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.register_user(text, text, text, text, text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.create_test_user() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.can_register_user(text, text) TO anon, authenticated;

-- Asegurar que las funciones de sincronización de usuarios tengan los permisos adecuados
ALTER FUNCTION public.handle_new_user() SECURITY DEFINER;
ALTER FUNCTION public.sync_user_data_to_auth() SECURITY DEFINER;

-- Corregir el trigger para la creación de usuarios
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Asegurar que la tabla auth.users tenga las políticas correctas de RLS
ALTER TABLE IF EXISTS auth.users ENABLE ROW LEVEL SECURITY;

-- Permitir que el rol de servicio tenga acceso completo a auth.users
DROP POLICY IF EXISTS "Allow service role full access" ON auth.users;
CREATE POLICY "Allow service role full access" 
  ON auth.users 
  FOR ALL 
  TO service_role 
  USING (true) 
  WITH CHECK (true);

-- Permitir que los usuarios autenticados puedan leer auth.users
DROP POLICY IF EXISTS "Enable read access for all users" ON auth.users;
CREATE POLICY "Enable read access for all users" 
  ON auth.users 
  FOR SELECT 
  TO authenticated 
  USING (true);

-- Función para crear un usuario de prueba (mejorada)
CREATE OR REPLACE FUNCTION public.create_test_user()
RETURNS json AS $$
DECLARE
  test_user_id uuid;
  test_user_exists boolean;
  result json;
BEGIN
  -- Verificar si el usuario de prueba ya existe
  SELECT EXISTS (
    SELECT 1 FROM users WHERE email = 'test@pantera.local'
  ) INTO test_user_exists;
  
  IF test_user_exists THEN
    -- Si ya existe, intentar obtener sus credenciales
    RETURN json_build_object(
      'success', false,
      'error', json_build_object(
        'message', 'User already registered',
        'code', 'user_already_exists'
      )
    );
  END IF;
  
  -- Crear usuario en auth.users
  INSERT INTO auth.users (
    email,
    raw_user_meta_data,
    created_at,
    encrypted_password
  ) VALUES (
    'test@pantera.local',
    jsonb_build_object(
      'first_name', 'Usuario',
      'last_name', 'Prueba',
      'phone', '+1-809-555-0001'
    ),
    now(),
    crypt('test123456', gen_salt('bf'))
  )
  RETURNING id INTO test_user_id;
  
  -- El trigger on_auth_user_created se encargará de crear el usuario en public.users
  
  -- Actualizar el rol a 'admin' para tener acceso completo
  UPDATE users
  SET role = 'admin'
  WHERE email = 'test@pantera.local';
  
  RETURN json_build_object('success', true, 'user_id', test_user_id);
EXCEPTION
  WHEN others THEN
    RETURN json_build_object(
      'success', false,
      'error', json_build_object(
        'message', SQLERRM,
        'code', SQLSTATE
      )
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Asegurar que la función create_test_user sea accesible para anónimos
GRANT EXECUTE ON FUNCTION public.create_test_user() TO anon, authenticated;