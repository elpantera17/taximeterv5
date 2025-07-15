/*
  # Implementación de Registro de Usuarios
  
  1. Cambios
    - Actualizar la tabla users para soportar registro directo
    - Agregar triggers para sincronización con auth.users
    - Mejorar políticas de seguridad para usuarios
    
  2. Seguridad
    - Asegurar que solo los propios usuarios puedan modificar sus datos
    - Permitir a los administradores gestionar todos los usuarios
*/

-- Asegurar que la tabla users tenga todos los campos necesarios
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS auth_id UUID REFERENCES auth.users(id);

-- Función para crear usuario en la tabla users cuando se crea en auth.users
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (
    id,
    auth_id,
    first_name,
    last_name,
    email,
    phone,
    password_hash,
    role,
    is_active,
    created_at,
    last_login
  ) VALUES (
    NEW.id,
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'first_name', 'Nuevo'),
    COALESCE(NEW.raw_user_meta_data->>'last_name', 'Usuario'),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'phone', ''),
    'hashed_in_auth',
    'normal',
    true,
    NEW.created_at,
    NEW.last_sign_in_at
  )
  ON CONFLICT (id) DO UPDATE SET
    email = NEW.email,
    last_login = NEW.last_sign_in_at;
    
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para crear usuario en public.users cuando se crea en auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Función para actualizar usuario en auth.users cuando se actualiza en public.users
CREATE OR REPLACE FUNCTION public.sync_user_data_to_auth()
RETURNS TRIGGER AS $$
BEGIN
  -- Solo actualizar si hay cambios en los campos relevantes
  IF (
    NEW.email IS DISTINCT FROM OLD.email OR
    NEW.first_name IS DISTINCT FROM OLD.first_name OR
    NEW.last_name IS DISTINCT FROM OLD.last_name OR
    NEW.phone IS DISTINCT FROM OLD.phone
  ) THEN
    UPDATE auth.users
    SET 
      email = NEW.email,
      raw_user_meta_data = jsonb_build_object(
        'first_name', NEW.first_name,
        'last_name', NEW.last_name,
        'phone', NEW.phone
      )
    WHERE id = NEW.auth_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para actualizar auth.users cuando se actualiza public.users
DROP TRIGGER IF EXISTS on_public_user_updated ON public.users;
CREATE TRIGGER on_public_user_updated
  AFTER UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.sync_user_data_to_auth();

-- Mejorar políticas de seguridad para la tabla users
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Eliminar políticas existentes
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON users;

-- Política para que los usuarios puedan leer sus propios datos
CREATE POLICY "Users can read own data"
  ON users FOR SELECT
  TO authenticated
  USING (id = auth.uid()::text OR role = 'admin');

-- Política para que los usuarios puedan actualizar sus propios datos
CREATE POLICY "Users can update own data"
  ON users FOR UPDATE
  TO authenticated
  USING (id = auth.uid()::text)
  WITH CHECK (id = auth.uid()::text);

-- Política para que los administradores puedan gestionar todos los usuarios
CREATE POLICY "Admins can manage all users"
  ON users FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()::text AND users.role = 'admin'
    )
  );

-- Función para verificar si un número de teléfono ya existe
CREATE OR REPLACE FUNCTION public.check_phone_exists(phone_number text)
RETURNS boolean AS $$
DECLARE
  phone_exists boolean;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM users WHERE phone = phone_number
  ) INTO phone_exists;
  
  RETURN phone_exists;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para registrar un nuevo usuario
CREATE OR REPLACE FUNCTION public.register_user(
  first_name text,
  last_name text,
  phone text,
  email text,
  password text
) RETURNS json AS $$
DECLARE
  new_user_id uuid;
  result json;
BEGIN
  -- Verificar si el teléfono ya existe
  IF public.check_phone_exists(phone) THEN
    RETURN json_build_object('success', false, 'message', 'Este número de teléfono ya está registrado');
  END IF;
  
  -- Generar un email si no se proporcionó uno
  IF email IS NULL OR email = '' THEN
    email := phone || '@pantera.auto.generated';
  END IF;
  
  -- Crear usuario en auth.users
  INSERT INTO auth.users (
    email,
    raw_user_meta_data,
    created_at
  ) VALUES (
    email,
    jsonb_build_object(
      'first_name', first_name,
      'last_name', last_name,
      'phone', phone
    ),
    now()
  )
  RETURNING id INTO new_user_id;
  
  -- El trigger on_auth_user_created se encargará de crear el usuario en public.users
  
  -- Establecer la contraseña
  UPDATE auth.users
  SET encrypted_password = crypt(password, gen_salt('bf'))
  WHERE id = new_user_id;
  
  RETURN json_build_object('success', true, 'user_id', new_user_id);
EXCEPTION
  WHEN others THEN
    RETURN json_build_object('success', false, 'message', SQLERRM);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;