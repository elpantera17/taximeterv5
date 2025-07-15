-- =====================================================
-- SISTEMA COMPLETO PANTERA TAXIMETER
-- Base de datos completa con sistema VIP y restricciones
-- Versión compatible con MySQL/MariaDB para Hostinger
-- =====================================================

-- Configuración inicial
SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";

-- Crear la base de datos si no existe
CREATE DATABASE IF NOT EXISTS `u379683784_met`;
USE `u379683784_met`;

-- =====================================================
-- FUNCIONES AUXILIARES
-- =====================================================

-- Función para generar UUID (reemplazo de uuid-ossp)
DELIMITER //
CREATE FUNCTION IF NOT EXISTS gen_random_uuid() 
RETURNS CHAR(36)
BEGIN
    RETURN UUID();
END//
DELIMITER ;

-- =====================================================
-- TABLA: users (Usuarios del sistema)
-- =====================================================

CREATE TABLE IF NOT EXISTS `users` (
    `id` VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    `first_name` VARCHAR(255) NOT NULL,
    `last_name` VARCHAR(255) NOT NULL,
    `email` VARCHAR(255) UNIQUE NOT NULL,
    `phone` VARCHAR(255) NOT NULL,
    `password_hash` VARCHAR(255) NOT NULL,
    `role` ENUM('normal', 'vip', 'vip2', 'vip3', 'vip4', 'admin', 'moderator') NOT NULL DEFAULT 'normal',
    `is_active` BOOLEAN DEFAULT TRUE,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `last_login` TIMESTAMP NULL,
    `profile_image` VARCHAR(255) NULL,
    `vip_expiry_date` TIMESTAMP NULL,
    `vehicle_make` VARCHAR(255) NULL,
    `vehicle_model` VARCHAR(255) NULL,
    `vehicle_year` INT NULL,
    `vehicle_plate` VARCHAR(255) NULL,
    `vehicle_color` VARCHAR(255) NULL,
    `total_trips` INT DEFAULT 0,
    `total_earnings` DECIMAL(10,2) DEFAULT 0.00,
    `rating` DECIMAL(3,2) DEFAULT 5.00
);

-- Índices para users
CREATE INDEX `idx_users_email` ON `users`(`email`);
CREATE INDEX `idx_users_role` ON `users`(`role`);
CREATE INDEX `idx_users_is_active` ON `users`(`is_active`);

-- =====================================================
-- TABLA: work_groups (Grupos de trabajo)
-- =====================================================

CREATE TABLE IF NOT EXISTS `work_groups` (
    `id` VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    `name` VARCHAR(255) NOT NULL,
    `description` TEXT NULL,
    `owner_id` VARCHAR(36) NOT NULL,
    `is_active` BOOLEAN DEFAULT TRUE,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `max_members` INT DEFAULT 50,
    `group_code` VARCHAR(255) UNIQUE NOT NULL,
    `settings` JSON DEFAULT (JSON_OBJECT()),
    
    FOREIGN KEY (`owner_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
);

-- Índices para work_groups
CREATE INDEX `idx_work_groups_owner` ON `work_groups`(`owner_id`);
CREATE INDEX `idx_work_groups_code` ON `work_groups`(`group_code`);

-- =====================================================
-- TABLA: work_group_members (Miembros de grupos)
-- =====================================================

CREATE TABLE IF NOT EXISTS `work_group_members` (
    `id` VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    `work_group_id` VARCHAR(36) NOT NULL,
    `user_id` VARCHAR(36) NOT NULL,
    `role` ENUM('owner', 'admin', 'moderator', 'member') DEFAULT 'member',
    `nickname` VARCHAR(255) NULL,
    `joined_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `is_active` BOOLEAN DEFAULT TRUE,
    `permissions` JSON DEFAULT (JSON_OBJECT()),
    
    FOREIGN KEY (`work_group_id`) REFERENCES `work_groups`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
    UNIQUE KEY `work_group_members_work_group_id_user_id_key` (`work_group_id`, `user_id`)
);

-- Índices para work_group_members
CREATE INDEX `idx_work_group_members_group` ON `work_group_members`(`work_group_id`);
CREATE INDEX `idx_work_group_members_user` ON `work_group_members`(`user_id`);

-- =====================================================
-- TABLA: fare_categories (Categorías de tarifas)
-- =====================================================

CREATE TABLE IF NOT EXISTS `fare_categories` (
    `id` VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    `name` VARCHAR(255) NOT NULL,
    `currency_symbol` VARCHAR(10) DEFAULT '$',
    `decimal_digits` INT DEFAULT 2,
    `basic_fare` DECIMAL(10,2) NOT NULL,
    `minimum_fare` DECIMAL(10,2) NOT NULL,
    `cost_per_minute` DECIMAL(10,2) NOT NULL,
    `cost_per_km` DECIMAL(10,2) NOT NULL,
    `measurement_unit` ENUM('kilometer', 'mile') DEFAULT 'kilometer',
    `is_active` BOOLEAN DEFAULT FALSE,
    `is_global` BOOLEAN DEFAULT TRUE,
    `work_group_id` VARCHAR(36) NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `created_by` VARCHAR(36) NULL,
    
    FOREIGN KEY (`work_group_id`) REFERENCES `work_groups`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`created_by`) REFERENCES `users`(`id`)
);

-- Índices para fare_categories
CREATE INDEX `idx_fare_categories_active` ON `fare_categories`(`is_active`);
CREATE INDEX `idx_fare_categories_global` ON `fare_categories`(`is_global`);

-- =====================================================
-- TABLA: trips (Viajes)
-- =====================================================

CREATE TABLE IF NOT EXISTS `trips` (
    `id` VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    `user_id` VARCHAR(36) NOT NULL,
    `work_group_id` VARCHAR(36) NULL,
    `fare_category_id` VARCHAR(36) NOT NULL,
    `start_time` TIMESTAMP NOT NULL,
    `end_time` TIMESTAMP NULL,
    `start_lat` DECIMAL(10,8) NOT NULL,
    `start_lng` DECIMAL(11,8) NOT NULL,
    `start_address` VARCHAR(255) NULL,
    `end_lat` DECIMAL(10,8) NULL,
    `end_lng` DECIMAL(11,8) NULL,
    `end_address` VARCHAR(255) NULL,
    `distance` DECIMAL(10,3) DEFAULT 0,
    `duration` INT DEFAULT 0,
    `total_cost` DECIMAL(10,2) NOT NULL,
    `dynamic_multiplier` DECIMAL(3,2) DEFAULT 1.00,
    `status` ENUM('pending', 'active', 'completed', 'cancelled') DEFAULT 'pending',
    `route_data` JSON NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`work_group_id`) REFERENCES `work_groups`(`id`) ON DELETE SET NULL,
    FOREIGN KEY (`fare_category_id`) REFERENCES `fare_categories`(`id`)
);

-- Índices para trips
CREATE INDEX `idx_trips_user` ON `trips`(`user_id`);
CREATE INDEX `idx_trips_status` ON `trips`(`status`);
CREATE INDEX `idx_trips_start_time` ON `trips`(`start_time`);

-- =====================================================
-- TABLA: app_settings (Configuraciones de la app)
-- =====================================================

CREATE TABLE IF NOT EXISTS `app_settings` (
    `id` VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    `user_id` VARCHAR(36) NULL,
    `work_group_id` VARCHAR(36) NULL,
    `setting_key` VARCHAR(255) NOT NULL,
    `setting_value` JSON NOT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`work_group_id`) REFERENCES `work_groups`(`id`) ON DELETE CASCADE,
    UNIQUE KEY `app_settings_user_id_setting_key_key` (`user_id`, `setting_key`),
    UNIQUE KEY `app_settings_work_group_id_setting_key_key` (`work_group_id`, `setting_key`)
);

-- =====================================================
-- TABLA: group_invitations (Invitaciones a grupos)
-- =====================================================

CREATE TABLE IF NOT EXISTS `group_invitations` (
    `id` VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    `work_group_id` VARCHAR(36) NOT NULL,
    `invited_by` VARCHAR(36) NOT NULL,
    `email` VARCHAR(255) NOT NULL,
    `status` ENUM('pending', 'accepted', 'rejected', 'expired') DEFAULT 'pending',
    `expires_at` TIMESTAMP DEFAULT (NOW() + INTERVAL 7 DAY),
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (`work_group_id`) REFERENCES `work_groups`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`invited_by`) REFERENCES `users`(`id`) ON DELETE CASCADE
);

-- Índices para group_invitations
CREATE INDEX `idx_group_invitations_email` ON `group_invitations`(`email`);
CREATE INDEX `idx_group_invitations_status` ON `group_invitations`(`status`);

-- =====================================================
-- TABLA: audit_log (Log de auditoría)
-- =====================================================

CREATE TABLE IF NOT EXISTS `audit_log` (
    `id` VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    `user_id` VARCHAR(36) NULL,
    `work_group_id` VARCHAR(36) NULL,
    `action` VARCHAR(255) NOT NULL,
    `table_name` VARCHAR(255) NOT NULL,
    `record_id` VARCHAR(255) NULL,
    `old_values` JSON NULL,
    `new_values` JSON NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL,
    FOREIGN KEY (`work_group_id`) REFERENCES `work_groups`(`id`) ON DELETE SET NULL
);

-- =====================================================
-- SISTEMA VIP: TABLAS PRINCIPALES
-- =====================================================

-- TABLA: vip_plans (Planes VIP)
CREATE TABLE IF NOT EXISTS `vip_plans` (
    `id` VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    `name` VARCHAR(255) NOT NULL,
    `level` INT NOT NULL UNIQUE,
    `max_drivers` INT DEFAULT 0,
    `is_active` BOOLEAN DEFAULT TRUE,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    CONSTRAINT `vip_plans_level_check` CHECK (`level` >= 1 AND `level` <= 4)
);

-- TABLA: vip_pricing (Precios de planes VIP)
CREATE TABLE IF NOT EXISTS `vip_pricing` (
    `id` VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    `plan_id` VARCHAR(36) NOT NULL,
    `billing_period` ENUM('monthly', 'yearly') NOT NULL,
    `price` DECIMAL(10,2) NOT NULL,
    `discount_percentage` DECIMAL(5,2) DEFAULT 0,
    `is_active` BOOLEAN DEFAULT TRUE,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (`plan_id`) REFERENCES `vip_plans`(`id`) ON DELETE CASCADE,
    UNIQUE KEY `vip_pricing_plan_billing_unique` (`plan_id`, `billing_period`)
);

-- TABLA: vip_offers (Ofertas especiales)
CREATE TABLE IF NOT EXISTS `vip_offers` (
    `id` VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    `plan_id` VARCHAR(36) NOT NULL,
    `title` VARCHAR(255) NOT NULL,
    `description` TEXT NULL,
    `discount_percentage` DECIMAL(5,2) NOT NULL,
    `start_date` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `end_date` TIMESTAMP NULL,
    `is_active` BOOLEAN DEFAULT TRUE,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (`plan_id`) REFERENCES `vip_plans`(`id`) ON DELETE CASCADE
);

-- TABLA: vip_subscriptions (Suscripciones de usuarios)
CREATE TABLE IF NOT EXISTS `vip_subscriptions` (
    `id` VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    `user_id` VARCHAR(36) NOT NULL,
    `plan_id` VARCHAR(36) NOT NULL,
    `billing_period` ENUM('monthly', 'yearly') NOT NULL,
    `start_date` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `end_date` TIMESTAMP NOT NULL,
    `is_active` BOOLEAN DEFAULT TRUE,
    `auto_renew` BOOLEAN DEFAULT TRUE,
    `payment_method` VARCHAR(255) NULL,
    `last_payment_date` TIMESTAMP NULL,
    `next_payment_date` TIMESTAMP NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`plan_id`) REFERENCES `vip_plans`(`id`) ON DELETE CASCADE
);

-- TABLA: vip_plan_benefits (Beneficios editables de planes)
CREATE TABLE IF NOT EXISTS `vip_plan_benefits` (
    `id` VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    `plan_id` VARCHAR(36) NOT NULL,
    `benefit_key` VARCHAR(255) NOT NULL,
    `benefit_title` VARCHAR(255) NOT NULL,
    `benefit_description` TEXT NOT NULL,
    `is_active` BOOLEAN DEFAULT TRUE,
    `sort_order` INT DEFAULT 0,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (`plan_id`) REFERENCES `vip_plans`(`id`) ON DELETE CASCADE,
    UNIQUE KEY `vip_plan_benefits_plan_key_unique` (`plan_id`, `benefit_key`)
);

-- =====================================================
-- SISTEMA DE RESTRICCIONES Y CONFIGURACIONES
-- =====================================================

-- TABLA: app_restrictions (Restricciones para usuarios normales)
CREATE TABLE IF NOT EXISTS `app_restrictions` (
    `id` VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    `restriction_key` VARCHAR(255) UNIQUE NOT NULL,
    `restriction_name` VARCHAR(255) NOT NULL,
    `restriction_description` TEXT NULL,
    `default_value` JSON NOT NULL,
    `applies_to_roles` JSON DEFAULT (JSON_ARRAY('normal')),
    `is_active` BOOLEAN DEFAULT TRUE,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- TABLA: system_settings (Configuraciones globales del sistema)
CREATE TABLE IF NOT EXISTS `system_settings` (
    `id` VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    `setting_key` VARCHAR(255) UNIQUE NOT NULL,
    `setting_name` VARCHAR(255) NOT NULL,
    `setting_description` TEXT NULL,
    `setting_value` JSON NOT NULL,
    `is_public` BOOLEAN DEFAULT FALSE,
    `requires_restart` BOOLEAN DEFAULT FALSE,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- =====================================================
-- SISTEMA DE ANUNCIOS Y NOTIFICACIONES
-- =====================================================

-- TABLA: announcements (Anuncios del sistema)
CREATE TABLE IF NOT EXISTS `announcements` (
    `id` VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    `title` VARCHAR(255) NOT NULL,
    `message` TEXT NOT NULL,
    `type` ENUM('info', 'warning', 'success', 'error', 'promotion') DEFAULT 'info',
    `target_audience` ENUM('all', 'normal', 'vip', 'vip2', 'vip3', 'vip4', 'admin') DEFAULT 'all',
    `is_active` BOOLEAN DEFAULT TRUE,
    `show_on_trip_complete` BOOLEAN DEFAULT FALSE,
    `show_on_fare_create` BOOLEAN DEFAULT FALSE,
    `show_on_login` BOOLEAN DEFAULT FALSE,
    `priority` INT DEFAULT 1,
    `expires_at` TIMESTAMP NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- TABLA: user_notifications (Notificaciones de usuarios)
CREATE TABLE IF NOT EXISTS `user_notifications` (
    `id` VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    `user_id` VARCHAR(36) NOT NULL,
    `announcement_id` VARCHAR(36) NULL,
    `title` VARCHAR(255) NOT NULL,
    `message` TEXT NOT NULL,
    `type` ENUM('info', 'warning', 'success', 'error', 'promotion') DEFAULT 'info',
    `is_read` BOOLEAN DEFAULT FALSE,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`announcement_id`) REFERENCES `announcements`(`id`) ON DELETE SET NULL
);

-- =====================================================
-- ÍNDICES PARA TABLAS VIP Y SISTEMA
-- =====================================================

-- Índices para vip_plans
CREATE INDEX `idx_vip_plans_level` ON `vip_plans`(`level`);
CREATE INDEX `idx_vip_plans_active` ON `vip_plans`(`is_active`);

-- Índices para vip_pricing
CREATE INDEX `idx_vip_pricing_plan` ON `vip_pricing`(`plan_id`);
CREATE INDEX `idx_vip_pricing_active` ON `vip_pricing`(`is_active`);

-- Índices para vip_subscriptions
CREATE INDEX `idx_vip_subscriptions_user` ON `vip_subscriptions`(`user_id`);
CREATE INDEX `idx_vip_subscriptions_active` ON `vip_subscriptions`(`is_active`);
CREATE INDEX `idx_vip_subscriptions_end_date` ON `vip_subscriptions`(`end_date`);

-- Índices para announcements
CREATE INDEX `idx_announcements_active` ON `announcements`(`is_active`);
CREATE INDEX `idx_announcements_target` ON `announcements`(`target_audience`);

-- Índices para user_notifications
CREATE INDEX `idx_user_notifications_user` ON `user_notifications`(`user_id`);
CREATE INDEX `idx_user_notifications_read` ON `user_notifications`(`is_read`);

-- =====================================================
-- FUNCIONES AUXILIARES DEL SISTEMA VIP
-- =====================================================

-- Función para verificar si un usuario es VIP
DELIMITER //
CREATE FUNCTION IF NOT EXISTS is_vip_user(user_role VARCHAR(20))
RETURNS BOOLEAN
BEGIN
    RETURN user_role IN ('vip', 'vip2', 'vip3', 'vip4');
END//
DELIMITER ;

-- Función para obtener nivel VIP
DELIMITER //
CREATE FUNCTION IF NOT EXISTS get_vip_level(user_role VARCHAR(20))
RETURNS INT
BEGIN
    CASE user_role
        WHEN 'vip' THEN RETURN 1;
        WHEN 'vip2' THEN RETURN 2;
        WHEN 'vip3' THEN RETURN 3;
        WHEN 'vip4' THEN RETURN 4;
        ELSE RETURN 0;
    END CASE;
END//
DELIMITER ;

-- Función para calcular precio VIP con descuentos
DELIMITER //
CREATE FUNCTION IF NOT EXISTS calculate_vip_price(
    plan_level INT,
    billing_period VARCHAR(20),
    offer_discount DECIMAL(5,2)
)
RETURNS DECIMAL(10,2)
BEGIN
    DECLARE base_price DECIMAL(10,2);
    DECLARE final_price DECIMAL(10,2);
    DECLARE period_discount DECIMAL(5,2) DEFAULT 0;
    
    -- Obtener precio base según el plan y período
    SELECT price INTO base_price
    FROM vip_pricing vp
    JOIN vip_plans vpl ON vp.plan_id = vpl.id
    WHERE vpl.level = plan_level 
    AND vp.billing_period = billing_period
    AND vp.is_active = TRUE
    LIMIT 1;
    
    -- Si no se encuentra precio, retornar 0
    IF base_price IS NULL THEN
        RETURN 0;
    END IF;
    
    -- Aplicar descuento por período (anual = 60% descuento)
    IF billing_period = 'yearly' THEN
        SET period_discount = 60;
    END IF;
    
    -- Calcular precio final con descuentos
    SET final_price = base_price * (1 - period_discount / 100.0) * (1 - offer_discount / 100.0);
    
    RETURN ROUND(final_price, 2);
END//
DELIMITER ;

-- Función para verificar si un usuario puede iniciar un viaje
DELIMITER //
CREATE FUNCTION IF NOT EXISTS can_user_start_trip(user_uuid VARCHAR(36))
RETURNS BOOLEAN
BEGIN
    DECLARE user_role_val VARCHAR(20);
    DECLARE daily_limit INT;
    DECLARE trips_today INT;
    
    -- Obtener rol del usuario
    SELECT role INTO user_role_val
    FROM users
    WHERE id = user_uuid;
    
    -- Si es VIP o admin, puede iniciar viajes sin límite
    IF user_role_val IN ('vip', 'vip2', 'vip3', 'vip4', 'admin') THEN
        RETURN TRUE;
    END IF;
    
    -- Obtener límite diario para usuarios normales
    SELECT JSON_EXTRACT(default_value, '$.max_trips_per_day') INTO daily_limit
    FROM app_restrictions
    WHERE restriction_key = 'daily_trip_limit'
    AND is_active = TRUE
    AND JSON_CONTAINS(applies_to_roles, JSON_ARRAY('normal'))
    LIMIT 1;
    
    -- Si no hay límite configurado, permitir
    IF daily_limit IS NULL THEN
        RETURN TRUE;
    END IF;
    
    -- Contar viajes de hoy
    SELECT COUNT(*) INTO trips_today
    FROM trips
    WHERE user_id = user_uuid
    AND DATE(start_time) = CURDATE();
    
    RETURN trips_today < daily_limit;
END//
DELIMITER ;

-- =====================================================
-- DATOS INICIALES DEL SISTEMA
-- =====================================================

-- Insertar usuarios de ejemplo
INSERT INTO `users` (
    `id`, `first_name`, `last_name`, `email`, `phone`, `password_hash`, `role`, `is_active`, 
    `created_at`, `last_login`, `vehicle_make`, `vehicle_model`, `vehicle_year`, 
    `vehicle_plate`, `vehicle_color`, `total_trips`, `total_earnings`, `rating`
) VALUES 
(
    '1', 'Admin', 'Sistema', 'admin@pantera.com', '+1-809-555-0001', 
    'admin123', 'admin', TRUE, '2024-01-01', NOW(),
    NULL, NULL, NULL, NULL, NULL, 0, 0.00, 5.00
),
(
    '2', 'Juan', 'Pérez', 'juan@example.com', '+1-809-555-0002',
    'user123', 'normal', TRUE, '2024-01-15', NOW(),
    'Toyota', 'Corolla', 2020, 'ABC-123', 'Blanco', 45, 2850.50, 4.8
),
(
    '3', 'María', 'González', 'maria@example.com', '+1-809-555-0003',
    'user123', 'vip', TRUE, '2024-02-01', NOW(),
    'Honda', 'Civic', 2021, 'XYZ-789', 'Negro', 78, 4920.75, 4.9
),
(
    '4', 'Carlos', 'Rodríguez', 'carlos@example.com', '+1-809-555-0004',
    'user123', 'vip2', TRUE, '2024-01-20', 
    DATE_SUB(NOW(), INTERVAL 2 DAY), 'Nissan', 'Sentra', 2019, 'DEF-456', 'Azul', 
    32, 1980.25, 4.6
),
(
    '5', 'Ana', 'Martínez', 'ana@example.com', '+1-809-555-0005',
    'user123', 'normal', FALSE, '2024-02-10',
    DATE_SUB(NOW(), INTERVAL 7 DAY), 'Hyundai', 'Elantra', 2022, 'GHI-789', 'Rojo',
    12, 750.00, 4.3
),
(
    '6', 'Sofia', 'Hernández', 'sofia@example.com', '+1-809-555-0006',
    'user123', 'vip3', TRUE, '2024-01-10', NOW(),
    'BMW', 'X3', 2023, 'VIP-001', 'Blanco Perla', 156, 12450.75, 4.95
),
(
    '7', 'Ricardo', 'Valdez', 'ricardo@example.com', '+1-809-555-0007',
    'user123', 'vip4', TRUE, '2024-01-05', NOW(),
    'Mercedes-Benz', 'E-Class', 2024, 'VIP-004', 'Negro Obsidiana', 289, 28750.50, 4.98
);

-- Actualizar fechas de expiración VIP
UPDATE `users` SET `vip_expiry_date` = DATE_ADD(NOW(), INTERVAL 15 DAY) WHERE `email` = 'maria@example.com';
UPDATE `users` SET `vip_expiry_date` = DATE_SUB(NOW(), INTERVAL 5 DAY) WHERE `email` = 'carlos@example.com';
UPDATE `users` SET `vip_expiry_date` = DATE_ADD(NOW(), INTERVAL 60 DAY) WHERE `email` = 'sofia@example.com';
UPDATE `users` SET `vip_expiry_date` = DATE_ADD(NOW(), INTERVAL 365 DAY) WHERE `email` = 'ricardo@example.com';

-- Insertar categorías de tarifas de ejemplo
INSERT INTO `fare_categories` (
    `id`, `name`, `currency_symbol`, `decimal_digits`, `basic_fare`, `minimum_fare`,
    `cost_per_minute`, `cost_per_km`, `measurement_unit`, `is_active`, `is_global`
) VALUES 
(
    '1', 'Estándar', '$', 2, 25.00, 80.00, 4.00, 8.00, 'kilometer', TRUE, TRUE
),
(
    '2', 'Premium', '$', 2, 35.00, 120.00, 6.00, 12.00, 'kilometer', FALSE, TRUE
);

-- Insertar planes VIP
INSERT INTO `vip_plans` (`id`, `name`, `level`, `max_drivers`, `is_active`) VALUES 
('vip1', 'VIP', 1, 0, TRUE),
('vip2', 'VIP2', 2, 50, TRUE),
('vip3', 'VIP3', 3, 100, TRUE),
('vip4', 'VIP4', 4, 300, TRUE);

-- Insertar precios VIP
INSERT INTO `vip_pricing` (`plan_id`, `billing_period`, `price`, `discount_percentage`, `is_active`) VALUES 
-- Precios mensuales
('vip1', 'monthly', 3.00, 0, TRUE),
('vip2', 'monthly', 25.00, 0, TRUE),
('vip3', 'monthly', 40.00, 0, TRUE),
('vip4', 'monthly', 70.00, 0, TRUE),
-- Precios anuales (60% descuento)
('vip1', 'yearly', 14.40, 60, TRUE),
('vip2', 'yearly', 120.00, 60, TRUE),
('vip3', 'yearly', 192.00, 60, TRUE),
('vip4', 'yearly', 336.00, 60, TRUE);

-- Insertar beneficios VIP
INSERT INTO `vip_plan_benefits` (`plan_id`, `benefit_key`, `benefit_title`, `benefit_description`, `sort_order`) VALUES 
-- VIP (Nivel 1)
('vip1', 'enhanced_maps', 'Mapas Mejorados', 'Acceso a mapas de alta calidad con mejor precisión', 1),
('vip1', 'advanced_stats', 'Estadísticas Avanzadas', 'Reportes detallados de ganancias y rendimiento', 2),
('vip1', 'priority_support', 'Soporte Prioritario', 'Atención al cliente con prioridad VIP', 3),
('vip1', 'no_ads', 'Sin Publicidad', 'Experiencia libre de anuncios publicitarios', 4),
('vip1', 'unlimited_trips', 'Viajes Ilimitados', 'Sin límite en la cantidad de viajes diarios', 5),
('vip1', 'advanced_reporting', 'Reportes Avanzados', 'Exportar reportes en PDF y Excel', 6),
('vip1', 'custom_branding', 'Marca Personalizada', 'Personalizar la app con tu logo y colores', 7),
('vip1', 'api_access', 'Acceso API', 'Integración con sistemas externos via API', 8),
('vip1', 'dedicated_support', 'Soporte Dedicado', 'Gerente de cuenta personal y soporte 24/7', 9),

-- VIP2 (Nivel 2) - Mismos beneficios + grupos
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

-- VIP3 (Nivel 3) - Mismos beneficios, más choferes
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

-- VIP4 (Nivel 4) - Mismos beneficios, máximo de choferes
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
('vip4', 'dedicated_support', 'Soporte Dedicado', 'Gerente de cuenta personal y soporte 24/7', 12);

-- Insertar restricciones para usuarios normales
INSERT INTO `app_restrictions` (`restriction_key`, `restriction_name`, `restriction_description`, `default_value`, `applies_to_roles`) VALUES 
(
    'daily_trip_limit', 
    'Límite de Viajes Diarios', 
    'Número máximo de viajes que puede realizar un usuario normal por día',
    '{"max_trips_per_day": 10, "enabled": true}',
    JSON_ARRAY('normal')
),
(
    'dynamic_pricing_limit',
    'Límite de Tarifa Dinámica',
    'Multiplicador máximo permitido para usuarios normales',
    '{"max_multiplier": 2.0, "enabled": true}',
    JSON_ARRAY('normal')
),
(
    'advanced_features',
    'Funciones Avanzadas',
    'Acceso a funciones avanzadas como estadísticas detalladas',
    '{"statistics_enabled": false, "export_enabled": false, "history_limit": 30}',
    JSON_ARRAY('normal')
);

-- Insertar configuraciones del sistema
INSERT INTO `system_settings` (`setting_key`, `setting_name`, `setting_description`, `setting_value`, `is_public`) VALUES 
(
    'whatsapp_number',
    'Número de WhatsApp',
    'Número de WhatsApp para contacto y compras VIP',
    '"+18098522664"',
    TRUE
),
(
    'app_version',
    'Versión de la Aplicación',
    'Versión actual de la aplicación',
    '"1.0.0"',
    TRUE
),
(
    'required_version',
    'Versión Requerida',
    'Versión mínima requerida para usar la aplicación',
    '"1.0.1"',
    TRUE
),
(
    'download_url',
    'URL de Descarga',
    'Enlace para descargar la versión más reciente',
    '"https://github.com/pantera-taximeter/releases/latest"',
    TRUE
),
(
    'force_update',
    'Actualización Obligatoria',
    'Forzar actualización para versiones anteriores',
    'true',
    TRUE
),
(
    'maintenance_mode',
    'Modo de Mantenimiento',
    'Activar/desactivar modo de mantenimiento',
    '{"enabled": false, "message": "Sistema en mantenimiento"}',
    TRUE
),
(
    'vip_pricing_editable',
    'Precios VIP Editables',
    'Permitir edición de precios VIP desde admin',
    '{"enabled": true}',
    FALSE
);

-- Insertar anuncios de ejemplo
INSERT INTO `announcements` (`title`, `message`, `type`, `target_audience`, `show_on_trip_complete`, `show_on_login`, `priority`) VALUES 
(
    '¡Viaje Completado!',
    '¡Excelente trabajo! Has completado otro viaje exitosamente. Sigue así para aumentar tus ganancias.',
    'success',
    'all',
    TRUE,
    FALSE,
    1
),
(
    'Promoción VIP',
    '¡Hazte VIP y disfruta de mapas mejorados, estadísticas avanzadas y soporte prioritario! Contacta al +18098522664',
    'promotion',
    'normal',
    TRUE,
    TRUE,
    2
),
(
    'Nueva Función: Grupos de Trabajo',
    'Los usuarios VIP2+ ahora pueden crear grupos de trabajo y agregar choferes. ¡Expande tu negocio!',
    'info',
    'vip',
    FALSE,
    TRUE,
    1
);

-- Insertar un grupo de trabajo de ejemplo
INSERT INTO `work_groups` (
    `id`, `name`, `description`, `owner_id`, `is_active`, 
    `max_members`, `group_code`, `created_at`
) VALUES (
    '1', 'Taxi Express RD', 'Grupo de taxis en Santo Domingo', 
    '4', TRUE, 50, 'TEX2024', '2024-01-20'
);

-- Insertar miembros del grupo de ejemplo
INSERT INTO `work_group_members` (
    `id`, `work_group_id`, `user_id`, `role`, `nickname`, 
    `joined_at`, `is_active`
) VALUES 
(
    '1', '1', '4', 'owner', NULL, 
    '2024-01-20', TRUE
),
(
    '2', '1', '3', 'moderator', 'María (Moderadora)', 
    DATE_SUB(NOW(), INTERVAL 7 DAY), TRUE
),
(
    '3', '1', '2', 'member', 'Juan (Chofer)', 
    DATE_SUB(NOW(), INTERVAL 14 DAY), TRUE
);

-- Insertar una tarifa de grupo de ejemplo
INSERT INTO `fare_categories` (
    `id`, `name`, `currency_symbol`, `decimal_digits`, 
    `basic_fare`, `minimum_fare`, `cost_per_minute`, `cost_per_km`, 
    `measurement_unit`, `is_active`, `is_global`, `work_group_id`, `created_by`
) VALUES (
    '3', 'Tarifa Grupo Express', '$', 2, 
    30.00, 90.00, 5.00, 10.00, 
    'kilometer', TRUE, FALSE, '1', '4'
);

-- Insertar algunos viajes de ejemplo
INSERT INTO `trips` (
    `id`, `user_id`, `fare_category_id`, `start_time`, `end_time`,
    `start_lat`, `start_lng`, `start_address`, 
    `end_lat`, `end_lng`, `end_address`,
    `distance`, `duration`, `total_cost`, `dynamic_multiplier`, `status`
) VALUES 
(
    UUID(), '2', '1', 
    DATE_SUB(NOW(), INTERVAL 2 DAY), DATE_SUB(NOW(), INTERVAL 2 DAY) + INTERVAL 30 MINUTE,
    18.4861, -69.9312, 'Agora Mall, Santo Domingo',
    18.4539, -69.9516, 'Malecón, Santo Domingo',
    5.2, 1800, 150.00, 1.0, 'completed'
),
(
    UUID(), '3', '1', 
    DATE_SUB(NOW(), INTERVAL 1 DAY), DATE_SUB(NOW(), INTERVAL 1 DAY) + INTERVAL 45 MINUTE,
    18.4734, -69.8845, 'Zona Colonial, Santo Domingo',
    18.4896, -69.9018, 'UASD, Santo Domingo',
    3.8, 2700, 180.00, 1.2, 'completed'
),
(
    UUID(), '4', '3', 
    DATE_SUB(NOW(), INTERVAL 12 HOUR), DATE_SUB(NOW(), INTERVAL 11 HOUR),
    18.4756, -69.9441, 'Blue Mall, Santo Domingo',
    18.4297, -69.6689, 'Aeropuerto Las Américas, Santo Domingo',
    28.5, 3600, 450.00, 1.5, 'completed'
);

-- =====================================================
-- VISTAS ADMINISTRATIVAS
-- =====================================================

-- Vista para gestión de precios VIP
CREATE OR REPLACE VIEW `admin_vip_pricing` AS
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
CREATE OR REPLACE VIEW `admin_vip_benefits` AS
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
CREATE OR REPLACE VIEW `public_system_settings` AS
SELECT 
    setting_key,
    setting_name,
    setting_value
FROM system_settings
WHERE is_public = TRUE
AND setting_key IN ('whatsapp_number', 'app_version', 'maintenance_mode');

-- =====================================================
-- PROCEDIMIENTOS ALMACENADOS
-- =====================================================

-- Procedimiento para verificar si un usuario necesita actualizar
DELIMITER //
CREATE PROCEDURE IF NOT EXISTS check_user_needs_update(IN user_version VARCHAR(20), OUT result JSON)
BEGIN
    DECLARE required_version VARCHAR(20);
    DECLARE force_update BOOLEAN;
    DECLARE download_url VARCHAR(255);
    DECLARE update_message VARCHAR(255);
    DECLARE needs_update BOOLEAN DEFAULT FALSE;
    
    -- Obtener configuraciones de actualización
    SELECT 
        JSON_UNQUOTE(setting_value),
        IF(setting_value = 'true', TRUE, FALSE),
        JSON_UNQUOTE(setting_value),
        JSON_UNQUOTE(setting_value)
    INTO 
        required_version, force_update, download_url, update_message
    FROM system_settings 
    WHERE setting_key IN ('required_version', 'force_update', 'download_url', 'update_message')
    ORDER BY FIELD(setting_key, 'required_version', 'force_update', 'download_url', 'update_message')
    LIMIT 4;
    
    -- Comparar versiones (lógica básica de semver)
    IF force_update AND user_version < required_version THEN
        SET needs_update = TRUE;
    END IF;
    
    SET result = JSON_OBJECT(
        'needs_update', needs_update,
        'current_version', user_version,
        'required_version', required_version,
        'download_url', download_url,
        'message', update_message,
        'force_update', force_update
    );
END//
DELIMITER ;

-- Procedimiento para obtener configuraciones públicas del sistema
DELIMITER //
CREATE PROCEDURE IF NOT EXISTS get_public_system_settings(OUT result JSON)
BEGIN
    DECLARE settings JSON DEFAULT JSON_OBJECT();
    DECLARE done INT DEFAULT FALSE;
    DECLARE setting_key_val VARCHAR(255);
    DECLARE setting_value_val JSON;
    DECLARE cur CURSOR FOR 
        SELECT setting_key, setting_value 
        FROM system_settings 
        WHERE is_public = TRUE;
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;
    
    OPEN cur;
    
    read_loop: LOOP
        FETCH cur INTO setting_key_val, setting_value_val;
        IF done THEN
            LEAVE read_loop;
        END IF;
        
        SET settings = JSON_SET(settings, CONCAT('$."', setting_key_val, '"'), setting_value_val);
    END LOOP;
    
    CLOSE cur;
    
    SET result = settings;
END//
DELIMITER ;

-- Procedimiento para verificar si un usuario es dueño de un grupo
DELIMITER //
CREATE PROCEDURE IF NOT EXISTS is_work_group_owner(
    IN user_id_param VARCHAR(36),
    IN group_id_param VARCHAR(36),
    OUT result BOOLEAN
)
BEGIN
    SELECT EXISTS (
        SELECT 1 FROM work_group_members
        WHERE user_id = user_id_param
        AND work_group_id = group_id_param
        AND role = 'owner'
    ) INTO result;
END//
DELIMITER ;

-- Procedimiento para verificar si un usuario es moderador de un grupo
DELIMITER //
CREATE PROCEDURE IF NOT EXISTS is_work_group_moderator(
    IN user_id_param VARCHAR(36),
    IN group_id_param VARCHAR(36),
    OUT result BOOLEAN
)
BEGIN
    SELECT EXISTS (
        SELECT 1 FROM work_group_members
        WHERE user_id = user_id_param
        AND work_group_id = group_id_param
        AND role IN ('moderator', 'owner')
    ) INTO result;
END//
DELIMITER ;

-- Procedimiento para verificar si un usuario puede editar tarifas de un grupo
DELIMITER //
CREATE PROCEDURE IF NOT EXISTS can_edit_group_fare(
    IN user_id_param VARCHAR(36),
    IN group_id_param VARCHAR(36),
    OUT result BOOLEAN
)
BEGIN
    SELECT EXISTS (
        SELECT 1 FROM work_group_members
        WHERE user_id = user_id_param
        AND work_group_id = group_id_param
        AND role IN ('owner', 'moderator')
    ) INTO result;
END//
DELIMITER ;

-- Procedimiento para verificar si un usuario puede eliminar a otro de un grupo
DELIMITER //
CREATE PROCEDURE IF NOT EXISTS can_remove_from_group(
    IN remover_id_param VARCHAR(36),
    IN target_id_param VARCHAR(36),
    IN group_id_param VARCHAR(36),
    OUT result BOOLEAN
)
BEGIN
    DECLARE remover_role VARCHAR(20);
    DECLARE target_role VARCHAR(20);
    
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
        SET result = TRUE;
    ELSEIF remover_role = 'moderator' AND target_role = 'member' THEN
        SET result = TRUE;
    ELSE
        SET result = FALSE;
    END IF;
END//
DELIMITER ;

-- Procedimiento para crear un usuario de prueba
DELIMITER //
CREATE PROCEDURE IF NOT EXISTS create_test_user(OUT result JSON)
BEGIN
    DECLARE test_user_id VARCHAR(36);
    DECLARE test_user_exists BOOLEAN;
    
    -- Verificar si el usuario de prueba ya existe
    SELECT EXISTS (
        SELECT 1 FROM users WHERE email = 'test@pantera.local'
    ) INTO test_user_exists;
    
    IF test_user_exists THEN
        -- Si ya existe, devolver error
        SET result = JSON_OBJECT(
            'success', FALSE,
            'error', JSON_OBJECT(
                'message', 'User already registered',
                'code', 'user_already_exists'
            )
        );
    ELSE
        -- Crear usuario de prueba
        SET test_user_id = UUID();
        
        INSERT INTO users (
            id, first_name, last_name, email, phone, 
            password_hash, role, is_active, created_at
        ) VALUES (
            test_user_id, 'Usuario', 'Prueba', 'test@pantera.local', '+1-809-555-0001',
            'test123456', 'admin', TRUE, NOW()
        );
        
        SET result = JSON_OBJECT('success', TRUE, 'user_id', test_user_id);
    END IF;
END//
DELIMITER ;

-- Procedimiento para verificar si un teléfono ya existe
DELIMITER //
CREATE PROCEDURE IF NOT EXISTS check_phone_exists(
    IN phone_number VARCHAR(255),
    OUT result BOOLEAN
)
BEGIN
    SELECT EXISTS (
        SELECT 1 FROM users WHERE phone = phone_number
    ) INTO result;
END//
DELIMITER ;

-- Procedimiento para registrar un nuevo usuario
DELIMITER //
CREATE PROCEDURE IF NOT EXISTS register_user(
    IN first_name VARCHAR(255),
    IN last_name VARCHAR(255),
    IN phone VARCHAR(255),
    IN email VARCHAR(255),
    IN password VARCHAR(255),
    OUT result JSON
)
BEGIN
    DECLARE new_user_id VARCHAR(36);
    DECLARE phone_exists BOOLEAN;
    DECLARE email_exists BOOLEAN DEFAULT FALSE;
    
    -- Verificar si el teléfono ya existe
    CALL check_phone_exists(phone, phone_exists);
    
    IF phone_exists THEN
        SET result = JSON_OBJECT(
            'success', FALSE,
            'message', 'Este número de teléfono ya está registrado'
        );
    ELSE
        -- Generar un email si no se proporcionó uno
        IF email IS NULL OR email = '' THEN
            SET email = CONCAT(phone, '@pantera.auto.generated');
        ELSE
            -- Verificar si el email ya existe
            SELECT EXISTS (
                SELECT 1 FROM users WHERE email = email
            ) INTO email_exists;
            
            IF email_exists THEN
                SET result = JSON_OBJECT(
                    'success', FALSE,
                    'message', 'Este email ya está registrado'
                );
                LEAVE proc;
            END IF;
        END IF;
        
        -- Crear usuario
        SET new_user_id = UUID();
        
        INSERT INTO users (
            id, first_name, last_name, email, phone, 
            password_hash, role, is_active, created_at
        ) VALUES (
            new_user_id, first_name, last_name, email, phone,
            password, 'normal', TRUE, NOW()
        );
        
        SET result = JSON_OBJECT('success', TRUE, 'user_id', new_user_id);
    END IF;
END//
DELIMITER ;

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Trigger para actualizar estadísticas de usuario después de completar un viaje
DELIMITER //
CREATE TRIGGER IF NOT EXISTS after_trip_complete
AFTER UPDATE ON trips
FOR EACH ROW
BEGIN
    IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
        -- Actualizar estadísticas del usuario
        UPDATE users
        SET 
            total_trips = total_trips + 1,
            total_earnings = total_earnings + NEW.total_cost
        WHERE id = NEW.user_id;
    END IF;
END//
DELIMITER ;

-- Trigger para verificar límite de miembros en grupo antes de insertar
DELIMITER //
CREATE TRIGGER IF NOT EXISTS before_member_insert
BEFORE INSERT ON work_group_members
FOR EACH ROW
BEGIN
    DECLARE max_members INT;
    DECLARE current_members INT;
    
    -- Obtener máximo de miembros permitidos
    SELECT wg.max_members INTO max_members
    FROM work_groups wg
    WHERE wg.id = NEW.work_group_id;
    
    -- Contar miembros actuales
    SELECT COUNT(*) INTO current_members
    FROM work_group_members
    WHERE work_group_id = NEW.work_group_id;
    
    -- Verificar si se excede el límite
    IF current_members >= max_members THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Se ha alcanzado el límite máximo de miembros para este grupo';
    END IF;
END//
DELIMITER ;

-- Trigger para actualizar contador de miembros en grupo después de insertar
DELIMITER //
CREATE TRIGGER IF NOT EXISTS after_member_insert
AFTER INSERT ON work_group_members
FOR EACH ROW
BEGIN
    -- Actualizar contador de miembros
    UPDATE work_groups
    SET current_members = (
        SELECT COUNT(*) 
        FROM work_group_members 
        WHERE work_group_id = NEW.work_group_id
    )
    WHERE id = NEW.work_group_id;
END//
DELIMITER ;

-- Trigger para actualizar contador de miembros en grupo después de eliminar
DELIMITER //
CREATE TRIGGER IF NOT EXISTS after_member_delete
AFTER DELETE ON work_group_members
FOR EACH ROW
BEGIN
    -- Actualizar contador de miembros
    UPDATE work_groups
    SET current_members = (
        SELECT COUNT(*) 
        FROM work_group_members 
        WHERE work_group_id = OLD.work_group_id
    )
    WHERE id = OLD.work_group_id;
END//
DELIMITER ;

-- =====================================================
-- CONFIGURACIÓN FINAL
-- =====================================================

-- Crear usuario de prueba para acceso rápido
CALL create_test_user(@test_user_result);

-- Actualizar la versión actual de la app
UPDATE system_settings 
SET setting_value = '"1.0.1"'
WHERE setting_key = 'app_version';