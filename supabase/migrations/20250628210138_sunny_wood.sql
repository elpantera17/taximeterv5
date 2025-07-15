-- Actualizar configuraciones del sistema para incluir control de versiones
INSERT INTO system_settings (setting_key, setting_name, setting_description, setting_value, is_public) VALUES 
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
)
ON CONFLICT (setting_key) DO UPDATE SET
    setting_name = EXCLUDED.setting_name,
    setting_description = EXCLUDED.setting_description,
    setting_value = EXCLUDED.setting_value,
    is_public = EXCLUDED.is_public;

-- Actualizar la versión actual de la app
UPDATE system_settings 
SET setting_value = '"1.0.0"'::jsonb 
WHERE setting_key = 'app_version';

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