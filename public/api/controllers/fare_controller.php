<?php
// Controlador de categorías de tarifas
// Este archivo debe estar en la carpeta /public_html/taximeter/api/controllers/fare_controller.php

// Función para obtener todas las categorías de tarifas
function handleGetFares($params, $query, $body) {
    // Verificar autenticación
    $token = requireAuth();
    
    try {
        $db = getDbConnection();
        
        // Obtener todas las categorías de tarifas
        $stmt = $db->query("SELECT * FROM fare_categories");
        $fares = $stmt->fetchAll();
        
        jsonResponse([
            'success' => true,
            'fares' => $fares
        ]);
    } catch (PDOException $e) {
        jsonResponse(['success' => false, 'message' => 'Error en el servidor'], 500);
    }
}

// Función para obtener una categoría de tarifa específica
function handleGetFare($params, $query, $body) {
    // Verificar autenticación
    $token = requireAuth();
    
    $fareId = $params[0];
    
    try {
        $db = getDbConnection();
        
        $stmt = $db->prepare("SELECT * FROM fare_categories WHERE id = ?");
        $stmt->execute([$fareId]);
        $fare = $stmt->fetch();
        
        if (!$fare) {
            jsonResponse(['success' => false, 'message' => 'Categoría de tarifa no encontrada'], 404);
        }
        
        jsonResponse([
            'success' => true,
            'fare' => $fare
        ]);
    } catch (PDOException $e) {
        jsonResponse(['success' => false, 'message' => 'Error en el servidor'], 500);
    }
}

// Función para crear una categoría de tarifa
function handleCreateFare($params, $query, $body) {
    // Verificar autenticación
    $token = requireAuth();
    
    // En una implementación real, obtendrías el ID del usuario del token
    // Por ahora, simulamos que el token contiene el ID del usuario
    $userId = '1'; // ID de usuario simulado
    
    // Verificar que el cuerpo tenga los datos necesarios
    if (!isset($body['name']) || !isset($body['basicFare']) || 
        !isset($body['minimumFare']) || !isset($body['costPerMinute']) || 
        !isset($body['costPerKm'])) {
        jsonResponse(['success' => false, 'message' => 'Faltan datos requeridos'], 400);
    }
    
    try {
        $db = getDbConnection();
        
        // Insertar la categoría de tarifa
        $stmt = $db->prepare("
            INSERT INTO fare_categories (
                id, name, currency_symbol, decimal_digits,
                basic_fare, minimum_fare, cost_per_minute, cost_per_km,
                measurement_unit, is_active, is_global, work_group_id, created_by,
                created_at
            ) VALUES (
                UUID(), ?, ?, ?,
                ?, ?, ?, ?,
                ?, ?, ?, ?, ?,
                NOW()
            )
        ");
        
        $stmt->execute([
            $body['name'],
            $body['currencySymbol'] ?? '$',
            $body['decimalDigits'] ?? 2,
            $body['basicFare'],
            $body['minimumFare'],
            $body['costPerMinute'],
            $body['costPerKm'],
            $body['measurementUnit'] ?? 'kilometer',
            $body['isActive'] ?? false,
            $body['isGlobal'] ?? true,
            $body['workGroupId'] ?? null,
            $userId
        ]);
        
        // Obtener el ID de la categoría insertada
        $fareId = $db->lastInsertId();
        
        // Obtener la categoría completa
        $stmt = $db->prepare("SELECT * FROM fare_categories WHERE id = ?");
        $stmt->execute([$fareId]);
        $fare = $stmt->fetch();
        
        jsonResponse([
            'success' => true,
            'fare' => $fare,
            'message' => 'Categoría de tarifa creada correctamente'
        ]);
    } catch (PDOException $e) {
        jsonResponse(['success' => false, 'message' => 'Error en el servidor: ' . $e->getMessage()], 500);
    }
}

// Función para actualizar una categoría de tarifa
function handleUpdateFare($params, $query, $body) {
    // Verificar autenticación
    $token = requireAuth();
    
    $fareId = $params[0];
    
    // Verificar que el cuerpo tenga datos
    if (empty($body)) {
        jsonResponse(['success' => false, 'message' => 'No hay datos para actualizar'], 400);
    }
    
    try {
        $db = getDbConnection();
        
        // Verificar que la categoría existe
        $stmt = $db->prepare("SELECT * FROM fare_categories WHERE id = ?");
        $stmt->execute([$fareId]);
        $fare = $stmt->fetch();
        
        if (!$fare) {
            jsonResponse(['success' => false, 'message' => 'Categoría de tarifa no encontrada'], 404);
        }
        
        // Construir la consulta de actualización
        $updateFields = [];
        $updateValues = [];
        
        // Campos permitidos para actualizar
        $allowedFields = [
            'name' => 'name',
            'currency_symbol' => 'currencySymbol',
            'decimal_digits' => 'decimalDigits',
            'basic_fare' => 'basicFare',
            'minimum_fare' => 'minimumFare',
            'cost_per_minute' => 'costPerMinute',
            'cost_per_km' => 'costPerKm',
            'measurement_unit' => 'measurementUnit',
            'is_active' => 'isActive'
        ];
        
        foreach ($allowedFields as $dbField => $bodyField) {
            if (isset($body[$bodyField])) {
                $updateFields[] = "{$dbField} = ?";
                $updateValues[] = $body[$bodyField];
            }
        }
        
        // Si no hay campos para actualizar, terminar
        if (empty($updateFields)) {
            jsonResponse(['success' => false, 'message' => 'No hay campos válidos para actualizar'], 400);
        }
        
        // Agregar el ID de la categoría a los valores
        $updateValues[] = $fareId;
        
        // Construir y ejecutar la consulta
        $sql = "UPDATE fare_categories SET " . implode(', ', $updateFields) . " WHERE id = ?";
        $stmt = $db->prepare($sql);
        $stmt->execute($updateValues);
        
        // Obtener la categoría actualizada
        $stmt = $db->prepare("SELECT * FROM fare_categories WHERE id = ?");
        $stmt->execute([$fareId]);
        $updatedFare = $stmt->fetch();
        
        jsonResponse([
            'success' => true,
            'fare' => $updatedFare,
            'message' => 'Categoría de tarifa actualizada correctamente'
        ]);
    } catch (PDOException $e) {
        jsonResponse(['success' => false, 'message' => 'Error en el servidor: ' . $e->getMessage()], 500);
    }
}

// Función para eliminar una categoría de tarifa
function handleDeleteFare($params, $query, $body) {
    // Verificar autenticación
    $token = requireAuth();
    
    $fareId = $params[0];
    
    try {
        $db = getDbConnection();
        
        // Verificar que la categoría existe
        $stmt = $db->prepare("SELECT * FROM fare_categories WHERE id = ?");
        $stmt->execute([$fareId]);
        $fare = $stmt->fetch();
        
        if (!$fare) {
            jsonResponse(['success' => false, 'message' => 'Categoría de tarifa no encontrada'], 404);
        }
        
        // Eliminar la categoría
        $stmt = $db->prepare("DELETE FROM fare_categories WHERE id = ?");
        $stmt->execute([$fareId]);
        
        jsonResponse([
            'success' => true,
            'message' => 'Categoría de tarifa eliminada correctamente'
        ]);
    } catch (PDOException $e) {
        jsonResponse(['success' => false, 'message' => 'Error en el servidor'], 500);
    }
}