<?php
// Controlador de usuarios
// Este archivo debe estar en la carpeta /public_html/taximeter/api/controllers/user_controller.php

// Función para obtener todos los usuarios
function handleGetUsers($params, $query, $body) {
    // Verificar autenticación
    $token = requireAuth();
    
    try {
        $db = getDbConnection();
        
        // Obtener todos los usuarios
        $stmt = $db->query("SELECT * FROM users");
        $users = $stmt->fetchAll();
        
        // Eliminar password_hash para la respuesta
        foreach ($users as &$user) {
            unset($user['password_hash']);
        }
        
        jsonResponse([
            'success' => true,
            'users' => $users
        ]);
    } catch (PDOException $e) {
        jsonResponse(['success' => false, 'message' => 'Error en el servidor'], 500);
    }
}

// Función para obtener un usuario específico
function handleGetUser($params, $query, $body) {
    // Verificar autenticación
    $token = requireAuth();
    
    $userId = $params[0];
    
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

// Función para actualizar un usuario
function handleUpdateUser($params, $query, $body) {
    // Verificar autenticación
    $token = requireAuth();
    
    $userId = $params[0];
    
    // Verificar que el cuerpo tenga datos
    if (empty($body)) {
        jsonResponse(['success' => false, 'message' => 'No hay datos para actualizar'], 400);
    }
    
    try {
        $db = getDbConnection();
        
        // Verificar que el usuario existe
        $stmt = $db->prepare("SELECT * FROM users WHERE id = ?");
        $stmt->execute([$userId]);
        $user = $stmt->fetch();
        
        if (!$user) {
            jsonResponse(['success' => false, 'message' => 'Usuario no encontrado'], 404);
        }
        
        // Construir la consulta de actualización
        $updateFields = [];
        $updateValues = [];
        
        // Campos permitidos para actualizar
        $allowedFields = [
            'first_name' => 'firstName',
            'last_name' => 'lastName',
            'email' => 'email',
            'phone' => 'phone',
            'vehicle_make' => 'vehicleInfo.make',
            'vehicle_model' => 'vehicleInfo.model',
            'vehicle_year' => 'vehicleInfo.year',
            'vehicle_plate' => 'vehicleInfo.plate',
            'vehicle_color' => 'vehicleInfo.color'
        ];
        
        foreach ($allowedFields as $dbField => $bodyField) {
            // Manejar campos anidados como vehicleInfo.make
            if (strpos($bodyField, '.') !== false) {
                list($parent, $child) = explode('.', $bodyField);
                if (isset($body[$parent]) && isset($body[$parent][$child])) {
                    $updateFields[] = "{$dbField} = ?";
                    $updateValues[] = $body[$parent][$child];
                }
            } else if (isset($body[$bodyField])) {
                $updateFields[] = "{$dbField} = ?";
                $updateValues[] = $body[$bodyField];
            }
        }
        
        // Si no hay campos para actualizar, terminar
        if (empty($updateFields)) {
            jsonResponse(['success' => false, 'message' => 'No hay campos válidos para actualizar'], 400);
        }
        
        // Agregar el ID del usuario a los valores
        $updateValues[] = $userId;
        
        // Construir y ejecutar la consulta
        $sql = "UPDATE users SET " . implode(', ', $updateFields) . " WHERE id = ?";
        $stmt = $db->prepare($sql);
        $stmt->execute($updateValues);
        
        // Obtener el usuario actualizado
        $stmt = $db->prepare("SELECT * FROM users WHERE id = ?");
        $stmt->execute([$userId]);
        $updatedUser = $stmt->fetch();
        
        // Eliminar password_hash para la respuesta
        unset($updatedUser['password_hash']);
        
        jsonResponse([
            'success' => true,
            'user' => $updatedUser,
            'message' => 'Usuario actualizado correctamente'
        ]);
    } catch (PDOException $e) {
        jsonResponse(['success' => false, 'message' => 'Error en el servidor: ' . $e->getMessage()], 500);
    }
}