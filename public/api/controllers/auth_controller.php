<?php
// Controlador de autenticación
// Este archivo debe estar en la carpeta /public_html/taximeter/api/controllers/auth_controller.php

// Función para manejar el inicio de sesión
function handleLogin($params, $query, $body) {
    if (!isset($body['email']) || !isset($body['password'])) {
        jsonResponse(['success' => false, 'message' => 'Email y contraseña son requeridos'], 400);
    }
    
    $email = $body['email'];
    $password = $body['password'];
    
    try {
        $db = getDbConnection();
        
        // Buscar usuario por email
        $stmt = $db->prepare("SELECT * FROM users WHERE email = ?");
        $stmt->execute([$email]);
        $user = $stmt->fetch();
        
        // Si no existe el usuario o la contraseña no coincide
        if (!$user || $user['password_hash'] !== $password) { // En producción, usar password_verify()
            jsonResponse(['success' => false, 'message' => 'Credenciales inválidas'], 401);
        }
        
        // Generar token (simplificado)
        $token = bin2hex(random_bytes(32));
        
        // Actualizar último inicio de sesión
        $stmt = $db->prepare("UPDATE users SET last_login = NOW() WHERE id = ?");
        $stmt->execute([$user['id']]);
        
        // Preparar datos de usuario para respuesta (sin password_hash)
        unset($user['password_hash']);
        
        jsonResponse([
            'success' => true,
            'user' => $user,
            'token' => $token
        ]);
    } catch (PDOException $e) {
        jsonResponse(['success' => false, 'message' => 'Error en el servidor'], 500);
    }
}

// Función para manejar el registro
function handleRegister($params, $query, $body) {
    if (!isset($body['firstName']) || !isset($body['lastName']) || 
        !isset($body['phone']) || !isset($body['password'])) {
        jsonResponse(['success' => false, 'message' => 'Faltan campos requeridos'], 400);
    }
    
    $firstName = $body['firstName'];
    $lastName = $body['lastName'];
    $phone = $body['phone'];
    $email = $body['email'] ?? "{$phone}@pantera.auto.generated";
    $password = $body['password'];
    
    try {
        $db = getDbConnection();
        
        // Verificar si el teléfono ya existe
        $stmt = $db->prepare("SELECT COUNT(*) FROM users WHERE phone = ?");
        $stmt->execute([$phone]);
        if ($stmt->fetchColumn() > 0) {
            jsonResponse(['success' => false, 'message' => 'Este número de teléfono ya está registrado'], 400);
        }
        
        // Verificar si el email ya existe
        if (isset($body['email']) && !empty($body['email'])) {
            $stmt = $db->prepare("SELECT COUNT(*) FROM users WHERE email = ?");
            $stmt->execute([$email]);
            if ($stmt->fetchColumn() > 0) {
                jsonResponse(['success' => false, 'message' => 'Este email ya está registrado'], 400);
            }
        }
        
        // Insertar nuevo usuario
        $stmt = $db->prepare("
            INSERT INTO users (
                id, first_name, last_name, email, phone, password_hash, 
                role, is_active, created_at
            ) VALUES (
                UUID(), ?, ?, ?, ?, ?, 
                'normal', 1, NOW()
            )
        ");
        
        $stmt->execute([
            $firstName, 
            $lastName, 
            $email, 
            $phone, 
            $password // En producción, usar password_hash()
        ]);
        
        // Obtener el usuario recién creado
        $userId = $db->lastInsertId();
        $stmt = $db->prepare("SELECT * FROM users WHERE id = ?");
        $stmt->execute([$userId]);
        $user = $stmt->fetch();
        
        // Eliminar password_hash para la respuesta
        unset($user['password_hash']);
        
        // Generar token (simplificado)
        $token = bin2hex(random_bytes(32));
        
        jsonResponse([
            'success' => true,
            'user' => $user,
            'token' => $token
        ]);
    } catch (PDOException $e) {
        jsonResponse(['success' => false, 'message' => 'Error en el servidor: ' . $e->getMessage()], 500);
    }
}

// Función para obtener el usuario actual
function handleGetCurrentUser($params, $query, $body) {
    // Verificar autenticación
    $token = requireAuth();
    
    // En una implementación real, obtendrías el ID del usuario del token
    // Por ahora, simulamos que el token contiene el ID del usuario
    $userId = '1'; // ID de usuario simulado
    
    try {
        $db = getDbConnection();
        
        $stmt = $db->prepare("SELECT * FROM users WHERE id = ?");
        $stmt->execute([$userId]);
        $user = $stmt->fetch();
        
        if (!$user) {
            jsonResponse(['success' => false, 'message' => 'Usuario no encontrado'], 404);
        }
        
        // Eliminar password_hash para la respuesta
        unset($user['password_hash']);
        
        jsonResponse([
            'success' => true,
            'user' => $user
        ]);
    } catch (PDOException $e) {
        jsonResponse(['success' => false, 'message' => 'Error en el servidor'], 500);
    }
}

// Función para crear un usuario de prueba
function handleCreateTestUser($params, $query, $body) {
    try {
        $db = getDbConnection();

        // Obtener el usuario administrador
        $stmt = $db->prepare("SELECT * FROM users WHERE email = ?");
        $stmt->execute(['p.joselopez17@gmail.com']);
        $user = $stmt->fetch();

        if (!$user) {
            jsonResponse([
                'success' => false,
                'message' => 'Usuario administrador no encontrado'
            ], 404);
        }

        // Eliminar contraseña para la respuesta
        unset($user['password_hash']);

        jsonResponse([
            'success' => true,
            'user' => $user,
            'message' => 'Usuario administrador encontrado'
        ]);
    } catch (PDOException $e) {
        jsonResponse(['success' => false, 'message' => 'Error en el servidor: ' . $e->getMessage()], 500);
    }
}

// Función para verificar si un teléfono existe
function handleCheckPhone($params, $query, $body) {
    if (!isset($query['phone'])) {
        jsonResponse(['success' => false, 'message' => 'Falta el parámetro phone'], 400);
    }
    
    $phone = $query['phone'];
    
    try {
        $db = getDbConnection();
        
        $stmt = $db->prepare("SELECT COUNT(*) FROM users WHERE phone = ?");
        $stmt->execute([$phone]);
        $exists = $stmt->fetchColumn() > 0;
        
        jsonResponse([
            'success' => true,
            'exists' => $exists
        ]);
    } catch (PDOException $e) {
        jsonResponse(['success' => false, 'message' => 'Error en el servidor'], 500);
    }
}