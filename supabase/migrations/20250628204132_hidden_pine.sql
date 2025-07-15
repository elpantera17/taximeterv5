/*
  # Beneficios VIP Unificados

  1. Cambios
    - Actualizar beneficios VIP para que todos los planes tengan los mismos beneficios
    - Solo cambia la cantidad de choferes permitidos en grupos de trabajo
    - Simplificar la gestión de beneficios

  2. Beneficios
    - Todos los VIP tienen: mapas mejorados, estadísticas avanzadas, sin ads, etc.
    - VIP: Plan individual (sin grupos)
    - VIP2+: Grupos de trabajo con diferentes límites de choferes
*/

-- Limpiar beneficios existentes
DELETE FROM vip_plan_benefits;

-- Insertar beneficios unificados para todos los planes VIP
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

-- Actualizar vista de beneficios para mostrar información más clara
DROP VIEW IF EXISTS admin_vip_benefits;
CREATE VIEW admin_vip_benefits AS
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