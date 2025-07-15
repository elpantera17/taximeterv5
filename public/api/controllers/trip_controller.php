<?php
// Controlador de viajes
// Este archivo debe estar en la carpeta /public_html/taximeter/api/controllers/trip_controller.php

// Función para obtener todos los viajes
function handleGetTrips($params, $query, $body) {
    // Verificar autenticación
    $token = requireAuth();
    
    // En una implementación real, obtendrías el ID del usuario del token
    // Por ahora, simulamos que el token contiene el ID del usuario
    $userId = '1'; // ID de usuario simulado
    
    try {
        $db = getDbConnection();
        
        // Obtener viajes del usuario
        $stmt = $db->prepare("SELECT * FROM trips WHERE user_id = ? ORDER BY start_time DESC");
        $stmt->execute([$userId]);
        $trips = $stmt->fetchAll();
        
        // Para cada viaje, obtener la categoría de tarifa
        foreach ($trips as &$trip) {
            $stmt = $db->prepare("SELECT * FROM fare_categories WHERE id = ?");
            $stmt->execute([$trip['fare_category_id']]);
            $fareCategory = $stmt->fetch();
            $trip['fareCategory'] = $fareCategory;
        }
        
        jsonResponse([
            'success' => true,
            'trips' => $trips
        ]);
    } catch (PDOException $e) {
        jsonResponse(['success' => false, 'message' => 'Error en el servidor'], 500);
    }
}

// Función para obtener un viaje específico
function handleGetTrip($params, $query, $body) {
    // Verificar autenticación
    $token = requireAuth();
    
    $tripId = $params[0];
    
    try {
        $db = getDbConnection();
        
        $stmt = $db->prepare("SELECT * FROM trips WHERE id = ?");
        $stmt->execute([$tripId]);
        $trip = $stmt->fetch();
        
        if (!$trip) {
            jsonResponse(['success' => false, 'message' => 'Viaje no encontrado'], 404);
        }
        
        // Obtener la categoría de tarifa
        $stmt = $db->prepare("SELECT * FROM fare_categories WHERE id = ?");
        $stmt->execute([$trip['fare_category_id']]);
        $fareCategory = $stmt->fetch();
        $trip['fareCategory'] = $fareCategory;
        
        jsonResponse([
            'success' => true,
            'trip' => $trip
        ]);
    } catch (PDOException $e) {
        jsonResponse(['success' => false, 'message' => 'Error en el servidor'], 500);
    }
}

// Función para crear un viaje
function handleCreateTrip($params, $query, $body) {
    // Verificar autenticación
    $token = requireAuth();
    
    // En una implementación real, obtendrías el ID del usuario del token
    // Por ahora, simulamos que el token contiene el ID del usuario
    $userId = '1'; // ID de usuario simulado
    
    // Verificar que el cuerpo tenga los datos necesarios
    if (!isset($body['startTime']) || !isset($body['startLocation']) || 
        !isset($body['fareCategory']) || !isset($body['totalCost'])) {
        jsonResponse(['success' => false, 'message' => 'Faltan datos requeridos'], 400);
    }
    
    try {
        $db = getDbConnection();
        
        // Insertar el viaje
        $stmt = $db->prepare("
            INSERT INTO trips (
                id, user_id, fare_category_id, start_time, end_time,
                start_lat, start_lng, start_address,
                end_lat, end_lng, end_address,
                distance, duration, total_cost, dynamic_multiplier, status,
                route_data, created_at
            ) VALUES (
                UUID(), ?, ?, ?, ?,
                ?, ?, ?,
                ?, ?, ?,
                ?, ?, ?, ?, ?,
                ?, NOW()
            )
        ");
        
        $stmt->execute([
            $userId,
            $body['fareCategory']['id'],
            $body['startTime'],
            $body['endTime'] ?? null,
            $body['startLocation']['lat'],
            $body['startLocation']['lng'],
            $body['startLocation']['address'] ?? null,
            $body['endLocation']['lat'] ?? null,
            $body['endLocation']['lng'] ?? null,
            $body['endLocation']['address'] ?? null,
            $body['distance'] ?? 0,
            $body['duration'] ?? 0,
            $body['totalCost'],
            $body['dynamicMultiplier'] ?? 1.0,
            $body['status'] ?? 'completed',
            json_encode($body['route'] ?? [])
        ]);
        
        // Obtener el ID del viaje insertado
        $tripId = $db->lastInsertId();
        
        // Obtener el viaje completo
        $stmt = $db->prepare("SELECT * FROM trips WHERE id = ?");
        $stmt->execute([$tripId]);
        $trip = $stmt->fetch();
        
        // Obtener la categoría de tarifa
        $stmt = $db->prepare("SELECT * FROM fare_categories WHERE id = ?");
        $stmt->execute([$trip['fare_category_id']]);
        $fareCategory = $stmt->fetch();
        $trip['fareCategory'] = $fareCategory;
        
        jsonResponse([
            'success' => true,
            'trip' => $trip,
            'message' => 'Viaje creado correctamente'
        ]);
    } catch (PDOException $e) {
        jsonResponse(['success' => false, 'message' => 'Error en el servidor: ' . $e->getMessage()], 500);
    }
}

// Función para actualizar un viaje
function handleUpdateTrip($params, $query, $body) {
    // Verificar autenticación
    $token = requireAuth();
    
    $tripId = $params[0];
    
    // Verificar que el cuerpo tenga datos
    if (empty($body)) {
        jsonResponse(['success' => false, 'message' => 'No hay datos para actualizar'], 400);
    }
    
    try {
        $db = getDbConnection();
        
        // Verificar que el viaje existe
        $stmt = $db->prepare("SELECT * FROM trips WHERE id = ?");
        $stmt->execute([$tripId]);
        $trip = $stmt->fetch();
        
        if (!$trip) {
            jsonResponse(['success' => false, 'message' => 'Viaje no encontrado'], 404);
        }
        
        // Construir la consulta de actualización
        $updateFields = [];
        $updateValues = [];
        
        // Campos permitidos para actualizar
        $allowedFields = [
            'end_time' => 'endTime',
            'end_lat' => 'endLocation.lat',
            'end_lng' => 'endLocation.lng',
            'end_address' => 'endLocation.address',
            'distance' => 'distance',
            'duration' => 'duration',
            'total_cost' => 'totalCost',
            'status' => 'status',
            'route_data' => 'route'
        ];
        
        foreach ($allowedFields as $dbField => $bodyField) {
            // Manejar campos anidados como endLocation.lat
            if (strpos($bodyField, '.') !== false) {
                list($parent, $child) = explode('.', $bodyField);
                if (isset($body[$parent]) && isset($body[$parent][$child])) {
                    $updateFields[] = "{$dbField} = ?";
                    $updateValues[] = $body[$parent][$child];
                }
            } else if (isset($body[$bodyField])) {
                $updateFields[] = "{$dbField} = ?";
                $updateValues[] = $dbField === 'route_data' ? json_encode($body[$bodyField]) : $body[$bodyField];
            }
        }
        
        // Si no hay campos para actualizar, terminar
        if (empty($updateFields)) {
            jsonResponse(['success' => false, 'message' => 'No hay campos válidos para actualizar'], 400);
        }
        
        // Agregar el ID del viaje a los valores
        $updateValues[] = $tripId;
        
        // Construir y ejecutar la consulta
        $sql = "UPDATE trips SET " . implode(', ', $updateFields) . " WHERE id = ?";
        $stmt = $db->prepare($sql);
        $stmt->execute($updateValues);
        
        // Obtener el viaje actualizado
        $stmt = $db->prepare("SELECT * FROM trips WHERE id = ?");
        $stmt->execute([$tripId]);
        $updatedTrip = $stmt->fetch();
        
        // Obtener la categoría de tarifa
        $stmt = $db->prepare("SELECT * FROM fare_categories WHERE id = ?");
        $stmt->execute([$updatedTrip['fare_category_id']]);
        $fareCategory = $stmt->fetch();
        $updatedTrip['fareCategory'] = $fareCategory;
        
        jsonResponse([
            'success' => true,
            'trip' => $updatedTrip,
            'message' => 'Viaje actualizado correctamente'
        ]);
    } catch (PDOException $e) {
        jsonResponse(['success' => false, 'message' => 'Error en el servidor: ' . $e->getMessage()], 500);
    }
}

// Función para eliminar un viaje
function handleDeleteTrip($params, $query, $body) {
    // Verificar autenticación
    $token = requireAuth();
    
    $tripId = $params[0];
    
    try {
        $db = getDbConnection();
        
        // Verificar que el viaje existe
        $stmt = $db->prepare("SELECT * FROM trips WHERE id = ?");
        $stmt->execute([$tripId]);
        $trip = $stmt->fetch();
        
        if (!$trip) {
            jsonResponse(['success' => false, 'message' => 'Viaje no encontrado'], 404);
        }
        
        // Eliminar el viaje
        $stmt = $db->prepare("DELETE FROM trips WHERE id = ?");
        $stmt->execute([$tripId]);
        
        jsonResponse([
            'success' => true,
            'message' => 'Viaje eliminado correctamente'
        ]);
    } catch (PDOException $e) {
        jsonResponse(['success' => false, 'message' => 'Error en el servidor'], 500);
    }
}