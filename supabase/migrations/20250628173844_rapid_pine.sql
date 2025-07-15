/*
  # Corrección de Roles de Usuario

  1. Cambios
    - Actualizar constraint de roles para incluir VIP2, VIP3, VIP4
    - VIP2+ no son moderadores globales, solo en sus grupos de trabajo
    - Mantener jerarquía: normal < vip < vip2 < vip3 < vip4 < admin

  2. Seguridad
    - Actualizar políticas según nuevos roles
*/

-- Actualizar constraint de roles
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
ALTER TABLE users ADD CONSTRAINT users_role_check 
  CHECK (role IN ('normal', 'vip', 'vip2', 'vip3', 'vip4', 'admin', 'moderator'));

-- Actualizar constraint de roles en work_group_members
ALTER TABLE work_group_members DROP CONSTRAINT IF EXISTS work_group_members_role_check;
ALTER TABLE work_group_members ADD CONSTRAINT work_group_members_role_check 
  CHECK (role IN ('owner', 'admin', 'moderator', 'member'));

-- Función para verificar si un usuario es VIP (cualquier nivel)
CREATE OR REPLACE FUNCTION is_vip_user(user_role text)
RETURNS boolean AS $$
BEGIN
  RETURN user_role IN ('vip', 'vip2', 'vip3', 'vip4');
END;
$$ LANGUAGE plpgsql;

-- Función para verificar nivel VIP
CREATE OR REPLACE FUNCTION get_vip_level(user_role text)
RETURNS integer AS $$
BEGIN
  CASE user_role
    WHEN 'vip' THEN RETURN 1;
    WHEN 'vip2' THEN RETURN 2;
    WHEN 'vip3' THEN RETURN 3;
    WHEN 'vip4' THEN RETURN 4;
    ELSE RETURN 0;
  END CASE;
END;
$$ LANGUAGE plpgsql;

-- Actualizar algunos usuarios de ejemplo con nuevos roles
UPDATE users SET role = 'vip2' WHERE email = 'carlos@example.com';

-- Insertar usuario VIP3 de ejemplo
INSERT INTO users (
  first_name, last_name, email, phone, password_hash, role, is_active, 
  vip_expiry_date, vehicle_make, vehicle_model, vehicle_year, vehicle_plate, vehicle_color,
  total_trips, total_earnings, rating
) VALUES (
  'Sofia', 'Hernández', 'sofia@example.com', '+1-809-555-0006', 'user123', 'vip3', true,
  now() + interval '60 days',
  'BMW', 'X3', 2023, 'VIP-001', 'Blanco Perla',
  156, 12450.75, 4.95
) ON CONFLICT (email) DO UPDATE SET
  role = EXCLUDED.role,
  vip_expiry_date = EXCLUDED.vip_expiry_date;

-- Insertar usuario VIP4 de ejemplo
INSERT INTO users (
  first_name, last_name, email, phone, password_hash, role, is_active,
  vip_expiry_date, vehicle_make, vehicle_model, vehicle_year, vehicle_plate, vehicle_color,
  total_trips, total_earnings, rating
) VALUES (
  'Ricardo', 'Valdez', 'ricardo@example.com', '+1-809-555-0007', 'user123', 'vip4', true,
  now() + interval '365 days',
  'Mercedes-Benz', 'E-Class', 2024, 'VIP-004', 'Negro Obsidiana',
  289, 28750.50, 4.98
) ON CONFLICT (email) DO UPDATE SET
  role = EXCLUDED.role,
  vip_expiry_date = EXCLUDED.vip_expiry_date;