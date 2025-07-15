-- =====================================================
-- SISTEMA COMPLETO PANTERA TAXIMETER
-- Base de datos completa con sistema VIP y restricciones
-- =====================================================

-- =====================================================
-- EXTENSIONES Y FUNCIONES AUXILIARES
-- =====================================================

-- Habilitar extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- =====================================================
-- TABLA: users (Usuarios del sistema)
-- =====================================================

CREATE TABLE IF NOT EXISTS users (
    id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
    first_name text NOT NULL,
    last_name text NOT NULL,
    email text UNIQUE NOT NULL,
    phone text NOT NULL,
    password_hash text NOT NULL,
    role text NOT NULL DEFAULT 'normal',
    is_active boolean DEFAULT true,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    last_login timestamptz,
    profile_image text,
    vip_expiry_date timestamptz,
    vehicle_make text,
    vehicle_model text,
    vehicle_year integer,
    vehicle_plate text,
    vehicle_color text,
    total_trips integer DEFAULT 0,
    total_earnings numeric(10,2) DEFAULT 0.00,
    rating numeric(3,2) DEFAULT 5.00,
    auth_id UUID REFERENCES auth.users(id),
    
    CONSTRAINT users_role_check CHECK (role IN ('normal', 'vip', 'vip2', 'vip3', 'vip4', 'admin', 'moderator'))
);

-- Índices para users
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_is_active ON users(is_active);

-- RLS para users
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Políticas para users
DROP POLICY IF EXISTS "Users can read own data" ON users;
CREATE POLICY "Users can read own data"
  ON users FOR SELECT
  TO authenticated
  USING (id = auth.uid()::text OR role = 'admin');

-- Política para que los usuarios puedan actualizar sus propios datos
DROP POLICY IF EXISTS "Users can update own data" ON users;
CREATE POLICY "Users can update own data"
  ON users FOR UPDATE
  TO authenticated
  USING (id = auth.uid()::text)
  WITH CHECK (id = auth.uid()::text);

-- Política para que los administradores puedan gestionar todos los usuarios
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

-- Trigger para updated_at en users
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- TABLA: work_groups (Grupos de trabajo)
-- =====================================================

CREATE TABLE IF NOT EXISTS work_groups (
    id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
    name text NOT NULL,
    description text,
    owner_id text NOT NULL,
    is_active boolean DEFAULT true,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    max_members integer DEFAULT 50,
    group_code text UNIQUE NOT NULL,
    settings jsonb DEFAULT '{}'::jsonb,
    
    CONSTRAINT work_groups_owner_id_fkey FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Índices para work_groups
CREATE INDEX IF NOT EXISTS idx_work_groups_owner ON work_groups(owner_id);
CREATE INDEX IF NOT EXISTS idx_work_groups_code ON work_groups(group_code);

-- RLS para work_groups
ALTER TABLE work_groups ENABLE ROW LEVEL SECURITY;

-- Políticas para work_groups
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON work_groups;
CREATE POLICY "Allow all operations for authenticated users"
    ON work_groups FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Trigger para updated_at en work_groups
DROP TRIGGER IF EXISTS update_work_groups_updated_at ON work_groups;
CREATE TRIGGER update_work_groups_updated_at
    BEFORE UPDATE ON work_groups
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- TABLA: work_group_members (Miembros de grupos)
-- =====================================================

CREATE TABLE IF NOT EXISTS work_group_members (
    id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
    work_group_id text NOT NULL,
    user_id text NOT NULL,
    role text DEFAULT 'member',
    nickname text,
    joined_at timestamptz DEFAULT now(),
    is_active boolean DEFAULT true,
    permissions jsonb DEFAULT '{}'::jsonb,
    
    CONSTRAINT work_group_members_work_group_id_fkey FOREIGN KEY (work_group_id) REFERENCES work_groups(id) ON DELETE CASCADE,
    CONSTRAINT work_group_members_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT work_group_members_role_check CHECK (role IN ('owner', 'admin', 'moderator', 'member')),
    CONSTRAINT work_group_members_work_group_id_user_id_key UNIQUE (work_group_id, user_id)
);

-- Índices para work_group_members
CREATE INDEX IF NOT EXISTS idx_work_group_members_group ON work_group_members(work_group_id);
CREATE INDEX IF NOT EXISTS idx_work_group_members_user ON work_group_members(user_id);

-- RLS para work_group_members
ALTER TABLE work_group_members ENABLE ROW LEVEL SECURITY;

-- Políticas para work_group_members
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

-- =====================================================
-- TABLA: fare_categories (Categorías de tarifas)
-- =====================================================

CREATE TABLE IF NOT EXISTS fare_categories (
    id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
    name text NOT NULL,
    currency_symbol text DEFAULT '$',
    decimal_digits integer DEFAULT 2,
    basic_fare numeric(10,2) NOT NULL,
    minimum_fare numeric(10,2) NOT NULL,
    cost_per_minute numeric(10,2) NOT NULL,
    cost_per_km numeric(10,2) NOT NULL,
    measurement_unit text DEFAULT 'kilometer',
    is_active boolean DEFAULT false,
    is_global boolean DEFAULT true,
    work_group_id text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    created_by text,
    
    CONSTRAINT fare_categories_measurement_unit_check CHECK (measurement_unit IN ('kilometer', 'mile')),
    CONSTRAINT fare_categories_work_group_id_fkey FOREIGN KEY (work_group_id) REFERENCES work_groups(id) ON DELETE CASCADE,
    CONSTRAINT fare_categories_created_by_fkey FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Índices para fare_categories
CREATE INDEX IF NOT EXISTS idx_fare_categories_active ON fare_categories(is_active);
CREATE INDEX IF NOT EXISTS idx_fare_categories_global ON fare_categories(is_global);

-- RLS para fare_categories
ALTER TABLE fare_categories ENABLE ROW LEVEL SECURITY;

-- Políticas para fare_categories
-- Política para que todos puedan ver las tarifas
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON fare_categories;
CREATE POLICY "Allow all operations for authenticated users"
    ON fare_categories FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

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

-- Trigger para updated_at en fare_categories
DROP TRIGGER IF EXISTS update_fare_categories_updated_at ON fare_categories;
CREATE TRIGGER update_fare_categories_updated_at
    BEFORE UPDATE ON fare_categories
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- TABLA: trips (Viajes)
-- =====================================================

CREATE TABLE IF NOT EXISTS trips (
    id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id text NOT NULL,
    work_group_id text,
    fare_category_id text NOT NULL,
    start_time timestamptz NOT NULL,
    end_time timestamptz,
    start_lat numeric(10,8) NOT NULL,
    start_lng numeric(11,8) NOT NULL,
    start_address text,
    end_lat numeric(10,8),
    end_lng numeric(11,8),
    end_address text,
    distance numeric(10,3) DEFAULT 0,
    duration integer DEFAULT 0,
    total_cost numeric(10,2) NOT NULL,
    dynamic_multiplier numeric(3,2) DEFAULT 1.00,
    status text DEFAULT 'pending',
    route_data jsonb,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    
    CONSTRAINT trips_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT trips_work_group_id_fkey FOREIGN KEY (work_group_id) REFERENCES work_groups(id) ON DELETE SET NULL,
    CONSTRAINT trips_fare_category_id_fkey FOREIGN KEY (fare_category_id) REFERENCES fare_categories(id),
    CONSTRAINT trips_status_check CHECK (status IN ('pending', 'active', 'completed', 'cancelled'))
);

-- Índices para trips
CREATE INDEX IF NOT EXISTS idx_trips_user ON trips(user_id);
CREATE INDEX IF NOT EXISTS idx_trips_status ON trips(status);
CREATE INDEX IF NOT EXISTS idx_trips_start_time ON trips(start_time);

-- RLS para trips
ALTER TABLE trips ENABLE ROW LEVEL SECURITY;

-- Políticas para trips
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON trips;
CREATE POLICY "Allow all operations for authenticated users"
    ON trips FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Trigger para updated_at en trips
DROP TRIGGER IF EXISTS update_trips_updated_at ON trips;
CREATE TRIGGER update_trips_updated_at
    BEFORE UPDATE ON trips
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- TABLA: app_settings (Configuraciones de la app)
-- =====================================================

CREATE TABLE IF NOT EXISTS app_settings (
    id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id text,
    work_group_id text,
    setting_key text NOT NULL,
    setting_value jsonb NOT NULL,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    
    CONSTRAINT app_settings_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT app_settings_work_group_id_fkey FOREIGN KEY (work_group_id) REFERENCES work_groups(id) ON DELETE CASCADE,
    CONSTRAINT app_settings_user_id_setting_key_key UNIQUE (user_id, setting_key),
    CONSTRAINT app_settings_work_group_id_setting_key_key UNIQUE (work_group_id, setting_key)
);

-- RLS para app_settings
ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;

-- Políticas para app_settings
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON app_settings;
CREATE POLICY "Allow all operations for authenticated users"
    ON app_settings FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Trigger para updated_at en app_settings
DROP TRIGGER IF EXISTS update_app_settings_updated_at ON app_settings;
CREATE TRIGGER update_app_settings_updated_at
    BEFORE UPDATE ON app_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- TABLA: group_invitations (Invitaciones a grupos)
-- =====================================================

CREATE TABLE IF NOT EXISTS group_invitations (
    id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
    work_group_id text NOT NULL,
    invited_by text NOT NULL,
    email text NOT NULL,
    status text DEFAULT 'pending',
    expires_at timestamptz DEFAULT (now() + interval '7 days'),
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    
    CONSTRAINT group_invitations_work_group_id_fkey FOREIGN KEY (work_group_id) REFERENCES work_groups(id) ON DELETE CASCADE,
    CONSTRAINT group_invitations_invited_by_fkey FOREIGN KEY (invited_by) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT group_invitations_status_check CHECK (status IN ('pending', 'accepted', 'rejected', 'expired'))
);

-- Índices para group_invitations
CREATE INDEX IF NOT EXISTS idx_group_invitations_email ON group_invitations(email);
CREATE INDEX IF NOT EXISTS idx_group_invitations_status ON group_invitations(status);

-- RLS para group_invitations
ALTER TABLE group_invitations ENABLE ROW LEVEL SECURITY;

-- Políticas para group_invitations
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON group_invitations;
CREATE POLICY "Allow all operations for authenticated users"
    ON group_invitations FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Trigger para updated_at en group_invitations
DROP TRIGGER IF EXISTS update_group_invitations_updated_at ON group_invitations;
CREATE TRIGGER update_group_invitations_updated_at
    BEFORE UPDATE ON group_invitations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- TABLA: audit_log (Log de auditoría)
-- =====================================================

CREATE TABLE IF NOT EXISTS audit_log (
    id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id text,
    work_group_id text,
    action text NOT NULL,
    table_name text NOT NULL,
    record_id text,
    old_values jsonb,
    new_values jsonb,
    created_at timestamptz DEFAULT now(),
    
    CONSTRAINT audit_log_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT audit_log_work_group_id_fkey FOREIGN KEY (work_group_id) REFERENCES work_groups(id) ON DELETE SET NULL
);

-- RLS para audit_log
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- Políticas para audit_log
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON audit_log;
CREATE POLICY "Allow all operations for authenticated users"
    ON audit_log FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- =====================================================
-- SISTEMA VIP: TABLAS PRINCIPALES
-- =====================================================

-- TABLA: vip_plans (Planes VIP)
CREATE TABLE IF NOT EXISTS vip_plans (
    id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
    name text NOT NULL,
    level integer NOT NULL UNIQUE,
    max_drivers integer DEFAULT 0,
    is_active boolean DEFAULT true,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    
    CONSTRAINT vip_plans_level_check CHECK (level >= 1 AND level <= 4)
);

-- TABLA: vip_pricing (Precios de planes VIP)
CREATE TABLE IF NOT EXISTS vip_pricing (
    id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
    plan_id text NOT NULL,
    billing_period text NOT NULL,
    price numeric(10,2) NOT NULL,
    discount_percentage numeric(5,2) DEFAULT 0,
    is_active boolean DEFAULT true,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    
    CONSTRAINT vip_pricing_plan_id_fkey FOREIGN KEY (plan_id) REFERENCES vip_plans(id) ON DELETE CASCADE,
    CONSTRAINT vip_pricing_billing_period_check CHECK (billing_period IN ('monthly', 'yearly')),
    CONSTRAINT vip_pricing_plan_billing_unique UNIQUE (plan_id, billing_period)
);

-- TABLA: vip_offers (Ofertas especiales)
CREATE TABLE IF NOT EXISTS vip_offers (
    id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
    plan_id text NOT NULL,
    title text NOT NULL,
    description text,
    discount_percentage numeric(5,2) NOT NULL,
    start_date timestamptz DEFAULT now(),
    end_date timestamptz,
    is_active boolean DEFAULT true,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    
    CONSTRAINT vip_offers_plan_id_fkey FOREIGN KEY (plan_id) REFERENCES vip_plans(id) ON DELETE CASCADE
);

-- TABLA: vip_subscriptions (Suscripciones de usuarios)
CREATE TABLE IF NOT EXISTS vip_subscriptions (
    id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id text NOT NULL,
    plan_id text NOT NULL,
    billing_period text NOT NULL,
    start_date timestamptz DEFAULT now(),
    end_date timestamptz NOT NULL,
    is_active boolean DEFAULT true,
    auto_renew boolean DEFAULT true,
    payment_method text,
    last_payment_date timestamptz,
    next_payment_date timestamptz,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    
    CONSTRAINT vip_subscriptions_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT vip_subscriptions_plan_id_fkey FOREIGN KEY (plan_id) REFERENCES vip_plans(id) ON DELETE CASCADE,
    CONSTRAINT vip_subscriptions_billing_period_check CHECK (billing_period IN ('monthly', 'yearly'))
);

-- TABLA: vip_plan_benefits (Beneficios editables de planes)
CREATE TABLE IF NOT EXISTS vip_plan_benefits (
    id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
    plan_id text NOT NULL,
    benefit_key text NOT NULL,
    benefit_title text NOT NULL,
    benefit_description text NOT NULL,
    is_active boolean DEFAULT true,
    sort_order integer DEFAULT 0,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    
    CONSTRAINT vip_plan_benefits_plan_id_fkey FOREIGN KEY (plan_id) REFERENCES vip_plans(id) ON DELETE CASCADE,
    CONSTRAINT vip_plan_benefits_plan_key_unique UNIQUE (plan_id, benefit_key)
);

-- =====================================================
-- SISTEMA DE RESTRICCIONES Y CONFIGURACIONES
-- =====================================================

-- TABLA: app_restrictions (Restricciones para usuarios normales)
CREATE TABLE IF NOT EXISTS app_restrictions (
    id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
    restriction_key text UNIQUE NOT NULL,
    restriction_name text NOT NULL,
    restriction_description text,
    default_value jsonb NOT NULL,
    applies_to_roles text[] DEFAULT ARRAY['normal'],
    is_active boolean DEFAULT true,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- TABLA: system_settings (Configuraciones globales del sistema)
CREATE TABLE IF NOT EXISTS system_settings (
    id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
    setting_key text UNIQUE NOT NULL,
    setting_name text NOT NULL,
    setting_description text,
    setting_value jsonb NOT NULL,
    is_public boolean DEFAULT false,
    requires_restart boolean DEFAULT false,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- =====================================================
-- SISTEMA DE ANUNCIOS Y NOTIFICACIONES
-- =====================================================

-- TABLA: announcements (Anuncios del sistema)
CREATE TABLE IF NOT EXISTS announcements (
    id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
    title text NOT NULL,
    message text NOT NULL,
    type text DEFAULT 'info',
    target_audience text DEFAULT 'all',
    is_active boolean DEFAULT true,
    show_on_trip_complete boolean DEFAULT false,
    show_on_fare_create boolean DEFAULT false,
    show_on_login boolean DEFAULT false,
    priority integer DEFAULT 1,
    expires_at timestamptz,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    
    CONSTRAINT announcements_type_check CHECK (type IN ('info', 'warning', 'success', 'error', 'promotion')),
    CONSTRAINT announcements_target_audience_check CHECK (target_audience IN ('all', 'normal', 'vip', 'vip2', 'vip3', 'vip4', 'admin'))
);

-- TABLA: user_notifications (Notificaciones de usuarios)
CREATE TABLE IF NOT EXISTS user_notifications (
    id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id text NOT NULL,
    announcement_id text,
    title text NOT NULL,
    message text NOT NULL,
    type text DEFAULT 'info',
    is_read boolean DEFAULT false,
    created_at timestamptz DEFAULT now(),
    
    CONSTRAINT user_notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT user_notifications_announcement_id_fkey FOREIGN KEY (announcement_id) REFERENCES announcements(id) ON DELETE SET NULL,
    CONSTRAINT user_notifications_type_check CHECK (type IN ('info', 'warning', 'success', 'error', 'promotion'))
);

-- =====================================================
-- ÍNDICES PARA TABLAS VIP Y SISTEMA
-- =====================================================

-- Índices para vip_plans
CREATE INDEX IF NOT EXISTS idx_vip_plans_level ON vip_plans(level);
CREATE INDEX IF NOT EXISTS idx_vip_plans_active ON vip_plans(is_active);

-- Índices para vip_pricing
CREATE INDEX IF NOT EXISTS idx_vip_pricing_plan ON vip_pricing(plan_id);
CREATE INDEX IF NOT EXISTS idx_vip_pricing_active ON vip_pricing(is_active);

-- Índices para vip_subscriptions
CREATE INDEX IF NOT EXISTS idx_vip_subscriptions_user ON vip_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_vip_subscriptions_active ON vip_subscriptions(is_active);
CREATE INDEX IF NOT EXISTS idx_vip_subscriptions_end_date ON vip_subscriptions(end_date);

-- Índices para announcements
CREATE INDEX IF NOT EXISTS idx_announcements_active ON announcements(is_active);
CREATE INDEX IF NOT EXISTS idx_announcements_target ON announcements(target_audience);

-- Índices para user_notifications
CREATE INDEX IF NOT EXISTS idx_user_notifications_user ON user_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_user_notifications_read ON user_notifications(is_read);

-- =====================================================
-- RLS PARA TABLAS VIP Y SISTEMA
-- =====================================================

-- RLS para todas las tablas VIP
ALTER TABLE vip_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE vip_pricing ENABLE ROW LEVEL SECURITY;
ALTER TABLE vip_offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE vip_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE vip_plan_benefits ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_restrictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_notifications ENABLE ROW LEVEL SECURITY;

-- Políticas para vip_plans (solo lectura para todos, escritura para admins)
DROP POLICY IF EXISTS "Allow read access to vip_plans" ON vip_plans;
CREATE POLICY "Allow read access to vip_plans"
    ON vip_plans FOR SELECT
    TO authenticated
    USING (true);

DROP POLICY IF EXISTS "Allow admin write access to vip_plans" ON vip_plans;
CREATE POLICY "Allow admin write access to vip_plans"
    ON vip_plans FOR ALL
    TO authenticated
    USING (EXISTS (
        SELECT 1 FROM users 
        WHERE users.id = auth.uid()::text 
        AND users.role = 'admin'
    ))
    WITH CHECK (EXISTS (
        SELECT 1 FROM users 
        WHERE users.id = auth.uid()::text 
        AND users.role = 'admin'
    ));

-- Políticas similares para otras tablas del sistema
DROP POLICY IF EXISTS "Allow read access to vip_pricing" ON vip_pricing;
CREATE POLICY "Allow read access to vip_pricing"
    ON vip_pricing FOR SELECT
    TO authenticated
    USING (true);

DROP POLICY IF EXISTS "Allow admin write access to vip_pricing" ON vip_pricing;
CREATE POLICY "Allow admin write access to vip_pricing"
    ON vip_pricing FOR ALL
    TO authenticated
    USING (EXISTS (
        SELECT 1 FROM users 
        WHERE users.id = auth.uid()::text 
        AND users.role = 'admin'
    ));

-- Políticas para vip_subscriptions (usuarios pueden ver las suyas)
DROP POLICY IF EXISTS "Users can manage own subscriptions" ON vip_subscriptions;
CREATE POLICY "Users can manage own subscriptions"
    ON vip_subscriptions FOR ALL
    TO authenticated
    USING (user_id = auth.uid()::text OR EXISTS (
        SELECT 1 FROM users 
        WHERE users.id = auth.uid()::text 
        AND users.role = 'admin'
    ));

-- Políticas para user_notifications (usuarios pueden ver las suyas)
DROP POLICY IF EXISTS "Users can manage own notifications" ON user_notifications;
CREATE POLICY "Users can manage own notifications"
    ON user_notifications FOR ALL
    TO authenticated
    USING (user_id = auth.uid()::text);

-- Políticas para announcements (lectura para todos, escritura para admins)
DROP POLICY IF EXISTS "Allow read access to announcements" ON announcements;
CREATE POLICY "Allow read access to announcements"
    ON announcements FOR SELECT
    TO authenticated
    USING (is_active = true);

DROP POLICY IF EXISTS "Allow admin write access to announcements" ON announcements;
CREATE POLICY "Allow admin write access to announcements"
    ON announcements FOR ALL
    TO authenticated
    USING (EXISTS (
        SELECT 1 FROM users 
        WHERE users.id = auth.uid()::text 
        AND users.role = 'admin'
    ));

-- =====================================================
-- TRIGGERS PARA UPDATED_AT
-- =====================================================

-- Triggers para todas las tablas VIP
DROP TRIGGER IF EXISTS update_vip_plans_updated_at ON vip_plans;
CREATE TRIGGER update_vip_plans_updated_at
    BEFORE UPDATE ON vip_plans
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_vip_pricing_updated_at ON vip_pricing;
CREATE TRIGGER update_vip_pricing_updated_at
    BEFORE UPDATE ON vip_pricing
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_vip_offers_updated_at ON vip_offers;
CREATE TRIGGER update_vip_offers_updated_at
    BEFORE UPDATE ON vip_offers
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_vip_subscriptions_updated_at ON vip_subscriptions;
CREATE TRIGGER update_vip_subscriptions_updated_at
    BEFORE UPDATE ON vip_subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_vip_plan_benefits_updated_at ON vip_plan_benefits;
CREATE TRIGGER update_vip_plan_benefits_updated_at
    BEFORE UPDATE ON vip_plan_benefits
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_app_restrictions_updated_at ON app_restrictions;
CREATE TRIGGER update_app_restrictions_updated_at
    BEFORE UPDATE ON app_restrictions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_system_settings_updated_at ON system_settings;
CREATE TRIGGER update_system_settings_updated_at
    BEFORE UPDATE ON system_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_announcements_updated_at ON announcements;
CREATE TRIGGER update_announcements_updated_at
    BEFORE UPDATE ON announcements
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- FUNCIONES AUXILIARES DEL SISTEMA VIP
-- =====================================================

-- Función para verificar si un usuario es VIP
CREATE OR REPLACE FUNCTION is_vip_user(user_role text)
RETURNS boolean AS $$
BEGIN
    RETURN user_role IN ('vip', 'vip2', 'vip3', 'vip4');
END;
$$ LANGUAGE plpgsql;

-- Función para obtener nivel VIP
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

-- Función para calcular precio VIP con descuentos
CREATE OR REPLACE FUNCTION calculate_vip_price(
    plan_level integer,
    billing_period text,
    offer_discount numeric DEFAULT 0
)
RETURNS numeric AS $$
DECLARE
    base_price numeric;
    final_price numeric;
    period_discount numeric := 0;
BEGIN
    -- Obtener precio base según el plan y período
    SELECT price INTO base_price
    FROM vip_pricing vp
    JOIN vip_plans vpl ON vp.plan_id = vpl.id
    WHERE vpl.level = plan_level 
    AND vp.billing_period = billing_period
    AND vp.is_active = true;
    
    -- Si no se encuentra precio, retornar 0
    IF base_price IS NULL THEN
        RETURN 0;
    END IF;
    
    -- Aplicar descuento por período (anual = 60% descuento)
    IF billing_period = 'yearly' THEN
        period_discount := 60;
    END IF;
    
    -- Calcular precio final con descuentos
    final_price := base_price * (1 - period_discount / 100.0) * (1 - offer_discount / 100.0);
    
    RETURN ROUND(final_price, 2);
END;
$$ LANGUAGE plpgsql;

-- Función para obtener suscripción activa de un usuario
CREATE OR REPLACE FUNCTION get_user_active_subscription(user_uuid text)
RETURNS TABLE (
    subscription_id text,
    plan_level integer,
    plan_name text,
    end_date timestamptz,
    is_expired boolean
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        vs.id,
        vp.level,
        vp.name,
        vs.end_date,
        (vs.end_date < now()) as is_expired
    FROM vip_subscriptions vs
    JOIN vip_plans vp ON vs.plan_id = vp.id
    WHERE vs.user_id = user_uuid
    AND vs.is_active = true
    ORDER BY vs.end_date DESC
    LIMIT 1;
END;
$$ LANGUAGE plpgsql;

-- Función para verificar restricciones de usuario
CREATE OR REPLACE FUNCTION check_user_restriction(
    user_uuid text,
    restriction_key_param text
)
RETURNS jsonb AS $$
DECLARE
    user_role_val text;
    restriction_value jsonb;
BEGIN
    -- Obtener rol del usuario
    SELECT role INTO user_role_val
    FROM users
    WHERE id = user_uuid;
    
    -- Si es VIP o admin, no hay restricciones
    IF user_role_val IN ('vip', 'vip2', 'vip3', 'vip4', 'admin') THEN
        RETURN '{"restricted": false}'::jsonb;
    END IF;
    
    -- Obtener valor de restricción
    SELECT default_value INTO restriction_value
    FROM app_restrictions
    WHERE restriction_key = restriction_key_param
    AND is_active = true
    AND user_role_val = ANY(applies_to_roles);
    
    -- Si no hay restricción, permitir
    IF restriction_value IS NULL THEN
        RETURN '{"restricted": false}'::jsonb;
    END IF;
    
    RETURN jsonb_build_object('restricted', true, 'value', restriction_value);
END;
$$ LANGUAGE plpgsql;

-- Función para verificar si un usuario puede iniciar un viaje
CREATE OR REPLACE FUNCTION can_user_start_trip(user_uuid text)
RETURNS boolean AS $$
DECLARE
    user_role_val text;
    daily_limit integer;
    trips_today integer;
BEGIN
    -- Obtener rol del usuario
    SELECT role INTO user_role_val
    FROM users
    WHERE id = user_uuid;
    
    -- Si es VIP o admin, puede iniciar viajes sin límite
    IF user_role_val IN ('vip', 'vip2', 'vip3', 'vip4', 'admin') THEN
        RETURN true;
    END IF;
    
    -- Obtener límite diario para usuarios normales
    SELECT (default_value->>'max_trips_per_day')::integer INTO daily_limit
    FROM app_restrictions
    WHERE restriction_key = 'daily_trip_limit'
    AND is_active = true
    AND 'normal' = ANY(applies_to_roles);
    
    -- Si no hay límite configurado, permitir
    IF daily_limit IS NULL THEN
        RETURN true;
    END IF;
    
    -- Contar viajes de hoy
    SELECT COUNT(*) INTO trips_today
    FROM trips
    WHERE user_id = user_uuid
    AND DATE(start_time) = CURRENT_DATE;
    
    RETURN trips_today < daily_limit;
END;
$$ LANGUAGE plpgsql;

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

-- Función para verificar si un usuario necesita actualizar
CREATE OR REPLACE FUNCTION check_user_needs_update(user_version text)
RETURNS jsonb AS $$
DECLARE
    required_version text;
    force_update boolean;
    download_url text;
    update_message text;
    needs_update boolean := false;
BEGIN
    -- Obtener configuraciones de actualización
    SELECT 
        (SELECT setting_value::text FROM system_settings WHERE setting_key = 'required_version'),
        (SELECT setting_value::boolean FROM system_settings WHERE setting_key = 'force_update'),
        (SELECT setting_value::text FROM system_settings WHERE setting_key = 'download_url'),
        (SELECT setting_value::text FROM system_settings WHERE setting_key = 'update_message')
    INTO required_version, force_update, download_url, update_message;
    
    -- Limpiar comillas de los valores JSON
    required_version := TRIM('"' FROM required_version);
    download_url := TRIM('"' FROM download_url);
    update_message := TRIM('"' FROM update_message);
    
    -- Comparar versiones (lógica básica de semver)
    IF force_update AND user_version < required_version THEN
        needs_update := true;
    END IF;
    
    RETURN jsonb_build_object(
        'needs_update', needs_update,
        'current_version', user_version,
        'required_version', required_version,
        'download_url', download_url,
        'message', update_message,
        'force_update', force_update
    );
END;
$$ LANGUAGE plpgsql;

-- Función para obtener configuraciones públicas del sistema
CREATE OR REPLACE FUNCTION get_public_system_settings()
RETURNS jsonb AS $$
DECLARE
    settings jsonb := '{}';
    setting_record record;
BEGIN
    FOR setting_record IN 
        SELECT setting_key, setting_value 
        FROM system_settings 
        WHERE is_public = true
    LOOP
        settings := settings || jsonb_build_object(setting_record.setting_key, setting_record.setting_value);
    END LOOP;
    
    RETURN settings;
END;
$$ LANGUAGE plpgsql;

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

-- =====================================================
-- VISTAS ADMINISTRATIVAS
-- =====================================================

-- Vista para gestión de precios VIP
CREATE OR REPLACE VIEW admin_vip_pricing AS
SELECT 
    vp.id as plan_id,
    vp.name as plan_name,
    vp.level,
    vpr.billing_period,
    vpr.price,
    vpr.discount_percentage,
    calculate_vip_price(vp.level, vpr.billing_period, 0) as final_price,
    vpr.is_active
FROM vip_plans vp
JOIN vip_pricing vpr ON vp.id = vpr.plan_id
ORDER BY vp.level, vpr.billing_period;

-- Vista para gestión de beneficios VIP
CREATE OR REPLACE VIEW admin_vip_benefits AS
SELECT 
    vp.id as plan_id,
    vp.name as plan_name,
    vp.level,
    vp.max_drivers,
    vpb.benefit_key,
    vpb.benefit_title,
    vpb.benefit_description,
    vpb.is_active,
    vpb.sort_order
FROM vip_plans vp
LEFT JOIN vip_plan_benefits vpb ON vp.id = vpb.plan_id
ORDER BY vp.level, vpb.sort_order;

-- Vista para configuraciones públicas del sistema
CREATE OR REPLACE VIEW public_system_settings AS
SELECT 
    setting_key,
    setting_name,
    setting_value
FROM system_settings
WHERE is_public = true
AND setting_key IN ('whatsapp_number', 'app_version', 'maintenance_mode');

-- =====================================================
-- DATOS INICIALES DEL SISTEMA
-- =====================================================

-- Insertar usuarios de ejemplo (solo si no existen)
INSERT INTO users (
    id, first_name, last_name, email, phone, password_hash, role, is_active, 
    created_at, last_login, vehicle_make, vehicle_model, vehicle_year, 
    vehicle_plate, vehicle_color, total_trips, total_earnings, rating
) VALUES 
(
    '1', 'Admin', 'Sistema', 'admin@pantera.com', '+1-809-555-0001', 
    'admin123', 'admin', true, '2024-01-01'::timestamptz, now(),
    NULL, NULL, NULL, NULL, NULL, 0, 0.00, 5.00
),
(
    '2', 'Juan', 'Pérez', 'juan@example.com', '+1-809-555-0002',
    'user123', 'normal', true, '2024-01-15'::timestamptz, now(),
    'Toyota', 'Corolla', 2020, 'ABC-123', 'Blanco', 45, 2850.50, 4.8
),
(
    '3', 'María', 'González', 'maria@example.com', '+1-809-555-0003',
    'user123', 'vip', true, '2024-02-01'::timestamptz, now(),
    'Honda', 'Civic', 2021, 'XYZ-789', 'Negro', 78, 4920.75, 4.9
),
(
    '4', 'Carlos', 'Rodríguez', 'carlos@example.com', '+1-809-555-0004',
    'user123', 'vip2', true, '2024-01-20'::timestamptz, 
    now() - interval '2 days', 'Nissan', 'Sentra', 2019, 'DEF-456', 'Azul', 
    32, 1980.25, 4.6
),
(
    '5', 'Ana', 'Martínez', 'ana@example.com', '+1-809-555-0005',
    'user123', 'normal', false, '2024-02-10'::timestamptz,
    now() - interval '7 days', 'Hyundai', 'Elantra', 2022, 'GHI-789', 'Rojo',
    12, 750.00, 4.3
),
(
    '6', 'Sofia', 'Hernández', 'sofia@example.com', '+1-809-555-0006',
    'user123', 'vip3', true, '2024-01-10'::timestamptz, now(),
    'BMW', 'X3', 2023, 'VIP-001', 'Blanco Perla', 156, 12450.75, 4.95
),
(
    '7', 'Ricardo', 'Valdez', 'ricardo@example.com', '+1-809-555-0007',
    'user123', 'vip4', true, '2024-01-05'::timestamptz, now(),
    'Mercedes-Benz', 'E-Class', 2024, 'VIP-004', 'Negro Obsidiana', 289, 28750.50, 4.98
)
ON CONFLICT (email) DO UPDATE SET
    role = EXCLUDED.role,
    vehicle_make = EXCLUDED.vehicle_make,
    vehicle_model = EXCLUDED.vehicle_model,
    vehicle_year = EXCLUDED.vehicle_year,
    vehicle_plate = EXCLUDED.vehicle_plate,
    vehicle_color = EXCLUDED.vehicle_color,
    total_trips = EXCLUDED.total_trips,
    total_earnings = EXCLUDED.total_earnings,
    rating = EXCLUDED.rating;

-- Actualizar fechas de expiración VIP
UPDATE users SET vip_expiry_date = now() + interval '15 days' WHERE email = 'maria@example.com';
UPDATE users SET vip_expiry_date = now() - interval '5 days' WHERE email = 'carlos@example.com';
UPDATE users SET vip_expiry_date = now() + interval '60 days' WHERE email = 'sofia@example.com';
UPDATE users SET vip_expiry_date = now() + interval '365 days' WHERE email = 'ricardo@example.com';

-- Insertar categorías de tarifas de ejemplo
INSERT INTO fare_categories (
    id, name, currency_symbol, decimal_digits, basic_fare, minimum_fare,
    cost_per_minute, cost_per_km, measurement_unit, is_active, is_global
) VALUES 
(
    '1', 'Estándar', '$', 2, 25.00, 80.00, 4.00, 8.00, 'kilometer', true, true
),
(
    '2', 'Premium', '$', 2, 35.00, 120.00, 6.00, 12.00, 'kilometer', false, true
)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    basic_fare = EXCLUDED.basic_fare,
    minimum_fare = EXCLUDED.minimum_fare,
    cost_per_minute = EXCLUDED.cost_per_minute,
    cost_per_km = EXCLUDED.cost_per_km;

-- Insertar planes VIP
INSERT INTO vip_plans (id, name, level, max_drivers, is_active) VALUES 
('vip1', 'VIP', 1, 0, true),
('vip2', 'VIP2', 2, 50, true),
('vip3', 'VIP3', 3, 100, true),
('vip4', 'VIP4', 4, 300, true)
ON CONFLICT (level) DO UPDATE SET
    name = EXCLUDED.name,
    max_drivers = EXCLUDED.max_drivers,
    is_active = EXCLUDED.is_active;

-- Insertar precios VIP
INSERT INTO vip_pricing (plan_id, billing_period, price, discount_percentage, is_active) VALUES 
-- Precios mensuales
('vip1', 'monthly', 3.00, 0, true),
('vip2', 'monthly', 25.00, 0, true),
('vip3', 'monthly', 40.00, 0, true),
('vip4', 'monthly', 70.00, 0, true),
-- Precios anuales (60% descuento)
('vip1', 'yearly', 14.40, 60, true),
('vip2', 'yearly', 120.00, 60, true),
('vip3', 'yearly', 192.00, 60, true),
('vip4', 'yearly', 336.00, 60, true)
ON CONFLICT (plan_id, billing_period) DO UPDATE SET
    price = EXCLUDED.price,
    discount_percentage = EXCLUDED.discount_percentage,
    is_active = EXCLUDED.is_active;

-- Insertar beneficios VIP
INSERT INTO vip_plan_benefits (plan_id, benefit_key, benefit_title, benefit_description, sort_order) VALUES 
-- Beneficios para VIP (Nivel 1)
('vip1', 'enhanced_maps', 'Mapas Mejorados', 'Acceso a mapas de alta calidad con mejor precisión', 1),
('vip1', 'advanced_stats', 'Estadísticas Avanzadas', 'Reportes detallados de ganancias y rendimiento', 2),
('vip1', 'priority_support', 'Soporte Prioritario', 'Atención al cliente con prioridad VIP', 3),
('vip1', 'no_ads', 'Sin Publicidad', 'Experiencia libre de anuncios publicitarios', 4),
('vip1', 'unlimited_trips', 'Viajes Ilimitados', 'Sin límite en la cantidad de viajes diarios', 5),
('vip1', 'advanced_reporting', 'Reportes Avanzados', 'Exportar reportes en PDF y Excel', 6),
('vip1', 'custom_branding', 'Marca Personalizada', 'Personalizar la app con tu logo y colores', 7),
('vip1', 'api_access', 'Acceso API', 'Integración con sistemas externos via API', 8),
('vip1', 'dedicated_support', 'Soporte Dedicado', 'Gerente de cuenta personal y soporte 24/7', 9),

-- Beneficios para VIP2 (Nivel 2) - Mismos beneficios + grupos
('vip2', 'enhanced_maps', 'Mapas Mejorados', 'Acceso a mapas de alta calidad con mejor precisión', 1),
('vip2', 'advanced_stats', 'Estadísticas Avanzadas', 'Reportes detallados de ganancias y rendimiento', 2),
('vip2', 'priority_support', 'Soporte Prioritario', 'Atención al cliente con prioridad VIP', 3),
('vip2', 'no_ads', 'Sin Publicidad', 'Experiencia libre de anuncios publicitarios', 4),
('vip2', 'unlimited_trips', 'Viajes Ilimitados', 'Sin límite en la cantidad de viajes diarios', 5),
('vip2', 'work_groups', 'Grupos de Trabajo', 'Crear y gestionar grupos de trabajo con hasta 50 choferes', 6),
('vip2', 'team_management', 'Gestión de Equipo', 'Administrar choferes y asignar permisos', 7),
('vip2', 'group_analytics', 'Analíticas de Grupo', 'Estadísticas consolidadas del equipo de trabajo', 8),
('vip2', 'advanced_reporting', 'Reportes Avanzados', 'Exportar reportes en PDF y Excel', 9),
('vip2', 'custom_branding', 'Marca Personalizada', 'Personalizar la app con tu logo y colores', 10),
('vip2', 'api_access', 'Acceso API', 'Integración con sistemas externos via API', 11),
('vip2', 'dedicated_support', 'Soporte Dedicado', 'Gerente de cuenta personal y soporte 24/7', 12),

-- Beneficios para VIP3 (Nivel 3) - Mismos beneficios, más choferes
('vip3', 'enhanced_maps', 'Mapas Mejorados', 'Acceso a mapas de alta calidad con mejor precisión', 1),
('vip3', 'advanced_stats', 'Estadísticas Avanzadas', 'Reportes detallados de ganancias y rendimiento', 2),
('vip3', 'priority_support', 'Soporte Prioritario', 'Atención al cliente con prioridad VIP', 3),
('vip3', 'no_ads', 'Sin Publicidad', 'Experiencia libre de anuncios publicitarios', 4),
('vip3', 'unlimited_trips', 'Viajes Ilimitados', 'Sin límite en la cantidad de viajes diarios', 5),
('vip3', 'work_groups', 'Grupos de Trabajo', 'Crear y gestionar grupos de trabajo con hasta 100 choferes', 6),
('vip3', 'team_management', 'Gestión de Equipo', 'Administrar choferes y asignar permisos avanzados', 7),
('vip3', 'group_analytics', 'Analíticas de Grupo', 'Estadísticas consolidadas del equipo de trabajo', 8),
('vip3', 'advanced_reporting', 'Reportes Avanzados', 'Exportar reportes en PDF y Excel', 9),
('vip3', 'custom_branding', 'Marca Personalizada', 'Personalizar la app con tu logo y colores', 10),
('vip3', 'api_access', 'Acceso API', 'Integración con sistemas externos via API', 11),
('vip3', 'dedicated_support', 'Soporte Dedicado', 'Gerente de cuenta personal y soporte 24/7', 12),

-- Beneficios para VIP4 (Nivel 4) - Mismos beneficios, máximo de choferes
('vip4', 'enhanced_maps', 'Mapas Mejorados', 'Acceso a mapas de alta calidad con mejor precisión', 1),
('vip4', 'advanced_stats', 'Estadísticas Avanzadas', 'Reportes detallados de ganancias y rendimiento', 2),
('vip4', 'priority_support', 'Soporte Prioritario', 'Atención al cliente con prioridad VIP', 3),
('vip4', 'no_ads', 'Sin Publicidad', 'Experiencia libre de anuncios publicitarios', 4),
('vip4', 'unlimited_trips', 'Viajes Ilimitados', 'Sin límite en la cantidad de viajes diarios', 5),
('vip4', 'work_groups', 'Grupos de Trabajo', 'Crear y gestionar grupos de trabajo con hasta 300 choferes', 6),
('vip4', 'team_management', 'Gestión de Equipo', 'Administrar choferes y asignar permisos completos', 7),
('vip4', 'group_analytics', 'Analíticas de Grupo', 'Estadísticas consolidadas del equipo de trabajo', 8),
('vip4', 'advanced_reporting', 'Reportes Avanzados', 'Exportar reportes en PDF y Excel', 9),
('vip4', 'custom_branding', 'Marca Personalizada', 'Personalizar la app con tu logo y colores', 10),
('vip4', 'api_access', 'Acceso API', 'Integración con sistemas externos via API', 11),
('vip4', 'dedicated_support', 'Soporte Dedicado', 'Gerente de cuenta personal y soporte 24/7', 12)
ON CONFLICT (plan_id, benefit_key) DO UPDATE SET
    benefit_title = EXCLUDED.benefit_title,
    benefit_description = EXCLUDED.benefit_description,
    sort_order = EXCLUDED.sort_order;

-- Insertar restricciones para usuarios normales
INSERT INTO app_restrictions (restriction_key, restriction_name, restriction_description, default_value, applies_to_roles) VALUES 
(
    'daily_trip_limit', 
    'Límite de Viajes Diarios', 
    'Número máximo de viajes que puede realizar un usuario normal por día',
    '{"max_trips_per_day": 10, "enabled": true}'::jsonb,
    ARRAY['normal']
),
(
    'dynamic_pricing_limit',
    'Límite de Tarifa Dinámica',
    'Multiplicador máximo permitido para usuarios normales',
    '{"max_multiplier": 2.0, "enabled": true}'::jsonb,
    ARRAY['normal']
),
(
    'advanced_features',
    'Funciones Avanzadas',
    'Acceso a funciones avanzadas como estadísticas detalladas',
    '{"statistics_enabled": false, "export_enabled": false, "history_limit": 30, "enabled": true}'::jsonb,
    ARRAY['normal']
)
ON CONFLICT (restriction_key) DO UPDATE SET
    restriction_name = EXCLUDED.restriction_name,
    restriction_description = EXCLUDED.restriction_description,
    default_value = EXCLUDED.default_value;

-- Insertar configuraciones del sistema
INSERT INTO system_settings (setting_key, setting_name, setting_description, setting_value, is_public) VALUES 
(
    'whatsapp_number',
    'Número de WhatsApp',
    'Número de WhatsApp para contacto y compras VIP',
    '"+18098522664"'::jsonb,
    true
),
(
    'app_version',
    'Versión de la Aplicación',
    'Versión actual de la aplicación',
    '"1.0.0"'::jsonb,
    true
),
(
    'required_version',
    'Versión Requerida',
    'Versión mínima requerida para usar la aplicación',
    '"1.0.1"'::jsonb,
    true
),
(
    'download_url',
    'URL de Descarga',
    'Enlace para descargar la versión más reciente',
    '"https://github.com/pantera-taximeter/releases/latest"'::jsonb,
    true
),
(
    'force_update',
    'Actualización Obligatoria',
    'Forzar actualización para versiones anteriores',
    'true'::jsonb,
    true
),
(
    'update_message',
    'Mensaje de Actualización',
    'Mensaje personalizado para mostrar en la ventana de actualización',
    '"Tu versión está desactualizada. Por favor actualiza para continuar usando la aplicación."'::jsonb,
    true
),
(
    'maintenance_mode',
    'Modo de Mantenimiento',
    'Activar/desactivar modo de mantenimiento',
    '{"enabled": false, "message": "Sistema en mantenimiento"}'::jsonb,
    true
),
(
    'vip_pricing_editable',
    'Precios VIP Editables',
    'Permitir edición de precios VIP desde admin',
    '{"enabled": true}'::jsonb,
    false
),
(
    'max_trip_duration',
    'Duración Máxima de Viaje',
    'Tiempo máximo permitido para un viaje (en horas)',
    '24'::jsonb,
    false
),
(
    'auto_backup',
    'Respaldo Automático',
    'Configuración de respaldos automáticos',
    '{"enabled": true, "frequency": "daily", "retention_days": 30}'::jsonb,
    false
),
(
    'notification_settings',
    'Configuración de Notificaciones',
    'Configuración global de notificaciones push',
    '{"enabled": true, "trip_reminders": true, "vip_promotions": true, "system_alerts": true}'::jsonb,
    false
),
(
    'api_rate_limits',
    'Límites de API',
    'Configuración de límites de velocidad para API',
    '{"requests_per_minute": 100, "requests_per_hour": 1000, "burst_limit": 20}'::jsonb,
    false
)
ON CONFLICT (setting_key) DO UPDATE SET
    setting_name = EXCLUDED.setting_name,
    setting_description = EXCLUDED.setting_description,
    setting_value = EXCLUDED.setting_value,
    is_public = EXCLUDED.is_public;

-- Insertar anuncios de ejemplo
INSERT INTO announcements (title, message, type, target_audience, show_on_trip_complete, show_on_login, priority) VALUES 
(
    '¡Viaje Completado!',
    '¡Excelente trabajo! Has completado otro viaje exitosamente. Sigue así para aumentar tus ganancias.',
    'success',
    'all',
    true,
    false,
    1
),
(
    'Promoción VIP',
    '¡Hazte VIP y disfruta de mapas mejorados, estadísticas avanzadas y soporte prioritario! Contacta al +18098522664',
    'promotion',
    'normal',
    true,
    true,
    2
),
(
    'Nueva Función: Grupos de Trabajo',
    'Los usuarios VIP2+ ahora pueden crear grupos de trabajo y agregar choferes. ¡Expande tu negocio!',
    'info',
    'vip',
    false,
    true,
    1
)
ON CONFLICT DO NOTHING;

-- Insertar datos de ejemplo para moderadores
INSERT INTO work_groups (id, name, description, owner_id, group_code, max_members, is_active) VALUES
('1', 'Taxi Express RD', 'Grupo de taxis en Santo Domingo', '4', 'TEX2024', 50, true)
ON CONFLICT DO NOTHING;

INSERT INTO work_group_members (
  work_group_id,
  user_id,
  role,
  nickname,
  joined_at,
  is_active
) VALUES 
('1', '4', 'owner', NULL, now(), true),
('1', '3', 'moderator', 'María (Moderadora)', now(), true),
('1', '2', 'member', 'Juan (Chofer)', now(), true)
ON CONFLICT (work_group_id, user_id) DO UPDATE SET
  role = EXCLUDED.role,
  nickname = EXCLUDED.nickname;