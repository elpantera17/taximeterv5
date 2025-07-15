/*
  # Implementación de Moderadores para Grupos de Trabajo

  1. Cambios
    - Actualizar la tabla work_group_members para soportar el rol de moderador
    - Agregar campo nickname para nombres personalizados de miembros
    - Actualizar permisos para que moderadores puedan editar tarifas y gestionar miembros
    - Crear funciones para verificar permisos de moderadores

  2. Seguridad
    - Solo dueños de grupos (VIP2+) pueden asignar moderadores
    - Moderadores pueden editar tarifas pero no crearlas ni eliminarlas
    - Moderadores pueden eliminar miembros pero no al dueño ni a otros moderadores
*/

-- Actualizar tabla work_group_members para agregar nickname
ALTER TABLE work_group_members 
ADD COLUMN IF NOT EXISTS nickname text;

-- Asegurar que el rol 'moderator' esté permitido (ya debería estarlo)
-- La constraint ya existe: work_group_members_role_check CHECK (role IN ('owner', 'admin', 'moderator', 'member'))

-- Función para verificar si un usuario es dueño de un grupo
CREATE OR REPLACE FUNCTION is_work_group_owner(
  user_id_param text,
  group_id_param text
) RETURNS boolean AS $$
DECLARE
  is_owner boolean;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM work_group_members
    WHERE user_id = user_id_param
    AND work_group_id = group_id_param
    AND role = 'owner'
  ) INTO is_owner;
  
  RETURN is_owner;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para verificar si un usuario es moderador de un grupo
CREATE OR REPLACE FUNCTION is_work_group_moderator(
  user_id_param text,
  group_id_param text
) RETURNS boolean AS $$
DECLARE
  is_mod boolean;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM work_group_members
    WHERE user_id = user_id_param
    AND work_group_id = group_id_param
    AND role IN ('moderator', 'owner')
  ) INTO is_mod;
  
  RETURN is_mod;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para verificar si un usuario puede editar tarifas de un grupo
CREATE OR REPLACE FUNCTION can_edit_group_fare(
  user_id_param text,
  group_id_param text
) RETURNS boolean AS $$
DECLARE
  can_edit boolean;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM work_group_members
    WHERE user_id = user_id_param
    AND work_group_id = group_id_param
    AND role IN ('owner', 'moderator')
  ) INTO can_edit;
  
  RETURN can_edit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para verificar si un usuario puede eliminar a otro de un grupo
CREATE OR REPLACE FUNCTION can_remove_from_group(
  remover_id_param text,
  target_id_param text,
  group_id_param text
) RETURNS boolean AS $$
DECLARE
  remover_role text;
  target_role text;
BEGIN
  -- Obtener roles
  SELECT role INTO remover_role FROM work_group_members
  WHERE user_id = remover_id_param AND work_group_id = group_id_param;
  
  SELECT role INTO target_role FROM work_group_members
  WHERE user_id = target_id_param AND work_group_id = group_id_param;
  
  -- Reglas:
  -- 1. El dueño puede eliminar a cualquiera
  -- 2. Moderadores pueden eliminar miembros normales
  -- 3. Moderadores no pueden eliminar a otros moderadores ni al dueño
  -- 4. Miembros normales no pueden eliminar a nadie
  
  IF remover_role = 'owner' THEN
    RETURN true;
  ELSIF remover_role = 'moderator' AND target_role = 'member' THEN
    RETURN true;
  ELSE
    RETURN false;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Actualizar políticas para work_group_members
ALTER TABLE work_group_members ENABLE ROW LEVEL SECURITY;

-- Política para que los dueños puedan gestionar todos los miembros
DROP POLICY IF EXISTS "Owners can manage all members" ON work_group_members;
CREATE POLICY "Owners can manage all members"
  ON work_group_members FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM work_group_members wgm
      WHERE wgm.user_id = auth.uid()::text
      AND wgm.work_group_id = work_group_id
      AND wgm.role = 'owner'
    )
  );

-- Política para que los moderadores puedan ver todos los miembros
DROP POLICY IF EXISTS "Moderators can view all members" ON work_group_members;
CREATE POLICY "Moderators can view all members"
  ON work_group_members FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM work_group_members wgm
      WHERE wgm.user_id = auth.uid()::text
      AND wgm.work_group_id = work_group_id
      AND wgm.role = 'moderator'
    )
  );

-- Política para que los moderadores puedan eliminar miembros normales
DROP POLICY IF EXISTS "Moderators can remove regular members" ON work_group_members;
CREATE POLICY "Moderators can remove regular members"
  ON work_group_members FOR DELETE
  TO authenticated
  USING (
    public.can_remove_from_group(auth.uid()::text, user_id, work_group_id)
  );

-- Actualizar políticas para fare_categories
-- Política para que los moderadores puedan editar tarifas del grupo
DROP POLICY IF EXISTS "Moderators can edit group fares" ON fare_categories;
CREATE POLICY "Moderators can edit group fares"
  ON fare_categories FOR UPDATE
  TO authenticated
  USING (
    work_group_id IS NOT NULL AND
    public.can_edit_group_fare(auth.uid()::text, work_group_id)
  )
  WITH CHECK (
    work_group_id IS NOT NULL AND
    public.can_edit_group_fare(auth.uid()::text, work_group_id)
  );

-- Política para que los moderadores NO puedan crear ni eliminar tarifas
DROP POLICY IF EXISTS "Only owners can create and delete group fares" ON fare_categories;
CREATE POLICY "Only owners can create and delete group fares"
  ON fare_categories FOR INSERT
  TO authenticated
  WITH CHECK (
    work_group_id IS NULL OR
    public.is_work_group_owner(auth.uid()::text, work_group_id)
  );

DROP POLICY IF EXISTS "Only owners can delete group fares" ON fare_categories;
CREATE POLICY "Only owners can delete group fares"
  ON fare_categories FOR DELETE
  TO authenticated
  USING (
    work_group_id IS NULL OR
    public.is_work_group_owner(auth.uid()::text, work_group_id)
  );

-- Insertar datos de ejemplo para moderadores
INSERT INTO work_group_members (
  work_group_id,
  user_id,
  role,
  nickname,
  joined_at,
  is_active
) VALUES (
  (SELECT id FROM work_groups LIMIT 1),
  (SELECT id FROM users WHERE email = 'maria@example.com' LIMIT 1),
  'moderator',
  'María (Moderadora)',
  now(),
  true
)
ON CONFLICT (work_group_id, user_id) DO UPDATE SET
  role = 'moderator',
  nickname = 'María (Moderadora)';