-- Corregir contraseña del usuario administrador

-- Actualizar la contraseña del usuario administrador
UPDATE users SET password_hash = 'Sofia24@123' WHERE email = 'p.joselopez17@gmail.com';

-- Si el usuario no existe, crearlo
INSERT INTO users (
    id, first_name, last_name, email, phone, password_hash, 
    role, is_active, created_at, last_login
) 
SELECT 
    gen_random_uuid()::text, 'José', 'López', 
    'p.joselopez17@gmail.com', '8098522664', 'Sofia24@123', 
    'admin', true, NOW(), NOW()
WHERE NOT EXISTS (
    SELECT 1 FROM users WHERE email = 'p.joselopez17@gmail.com'
);