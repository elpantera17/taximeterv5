/*
  # Agregar usuario administrador personalizado
  
  1. Cambios
    - Eliminar usuarios de prueba existentes
    - Crear un nuevo usuario administrador con credenciales específicas
    
  2. Seguridad
    - La contraseña se almacena en texto plano solo para desarrollo
    - En producción, se recomienda usar funciones de hash seguras
*/

-- Eliminar usuarios de prueba si existen
DELETE FROM users WHERE email = 'test@pantera.local';
DELETE FROM users WHERE email LIKE '%@pantera.auto.generated';

-- Crear usuario administrador personalizado
INSERT INTO users (
    id,
    first_name,
    last_name,
    email,
    phone,
    password_hash,
    role,
    is_active,
    created_at,
    last_login,
    profile_image,
    vip_expiry_date,
    vehicle_make,
    vehicle_model,
    vehicle_year,
    vehicle_plate,
    vehicle_color,
    total_trips,
    total_earnings,
    rating
) VALUES (
    gen_random_uuid()::text,
    'José',
    'López',
    'p.joselopez17@gmail.com',
    '8098522664',
    'sofia24@',
    'admin',
    true,
    NOW(),
    NOW(),
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    0,
    0.00,
    5.00
)
ON CONFLICT (email) DO UPDATE SET
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    phone = EXCLUDED.phone,
    password_hash = EXCLUDED.password_hash,
    role = EXCLUDED.role,
    is_active = EXCLUDED.is_active;

-- Asegurarse de que el usuario tenga permisos de administrador
UPDATE users SET role = 'admin' WHERE email = 'p.joselopez17@gmail.com';