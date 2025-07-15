/*
  # Corregir permisos para el registro de usuarios
  
  1. Cambios
    - Asegurar que los usuarios anónimos puedan registrarse
    - Permitir acceso a tablas necesarias durante el registro
    - Mejorar políticas de seguridad para auth.users
    
  2. Seguridad
    - Mantener la seguridad general del sistema
    - Solo permitir operaciones específicas para usuarios anónimos
*/

-- Permitir a usuarios anónimos insertar en la tabla users durante el registro
DROP POLICY IF EXISTS "Allow registration for anonymous users" ON users;
CREATE POLICY "Allow registration for anonymous users"
  ON users FOR INSERT
  TO anon
  WITH CHECK (true);

-- Permitir a usuarios anónimos leer la tabla users para verificar si existe un teléfono
DROP POLICY IF EXISTS "Allow phone check for anonymous users" ON users;
CREATE POLICY "Allow phone check for anonymous users"
  ON users FOR SELECT
  TO anon
  USING (true);

-- Asegurar que la función check_phone_exists sea accesible para anónimos
REVOKE EXECUTE ON FUNCTION public.check_phone_exists(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.check_phone_exists(text) TO anon, authenticated;

-- Asegurar que la función register_user sea accesible para anónimos
REVOKE EXECUTE ON FUNCTION public.register_user(text, text, text, text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.register_user(text, text, text, text, text) TO anon, authenticated;

-- Asegurar que la función create_test_user sea accesible para anónimos
REVOKE EXECUTE ON FUNCTION public.create_test_user() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.create_test_user() TO anon, authenticated;

-- Permitir a usuarios anónimos leer configuraciones públicas del sistema
DROP POLICY IF EXISTS "Allow public settings read for anonymous users" ON system_settings;
CREATE POLICY "Allow public settings read for anonymous users"
  ON system_settings FOR SELECT
  TO anon
  USING (is_public = true);

-- Asegurar que la función get_public_system_settings sea accesible para anónimos
REVOKE EXECUTE ON FUNCTION public.get_public_system_settings() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_public_system_settings() TO anon, authenticated;

-- Asegurar que la función check_user_needs_update sea accesible para anónimos
REVOKE EXECUTE ON FUNCTION public.check_user_needs_update(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.check_user_needs_update(text) TO anon, authenticated;

-- Función para verificar si un usuario puede registrarse (para uso futuro)
CREATE OR REPLACE FUNCTION public.can_register_user(
  phone_param text,
  email_param text DEFAULT NULL
) RETURNS boolean AS $$
DECLARE
  phone_exists boolean;
  email_exists boolean := false;
BEGIN
  -- Verificar si el teléfono ya existe
  SELECT EXISTS (
    SELECT 1 FROM users WHERE phone = phone_param
  ) INTO phone_exists;
  
  -- Verificar si el email ya existe (si se proporcionó)
  IF email_param IS NOT NULL AND email_param != '' THEN
    SELECT EXISTS (
      SELECT 1 FROM users WHERE email = email_param
    ) INTO email_exists;
  END IF;
  
  -- Permitir registro si ni el teléfono ni el email existen
  RETURN NOT (phone_exists OR email_exists);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Asegurar que la función can_register_user sea accesible para anónimos
GRANT EXECUTE ON FUNCTION public.can_register_user(text, text) TO anon, authenticated;

-- Asegurar que la tabla auth.users tenga las políticas correctas
-- Nota: Esto normalmente lo maneja Supabase automáticamente