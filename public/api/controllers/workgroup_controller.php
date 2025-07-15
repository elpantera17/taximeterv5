<?php
// Controlador de grupos de trabajo
// Este archivo debe estar en la carpeta /public_html/taximeter/api/controllers/workgroup_controller.php

// Función para obtener todos los grupos de trabajo
function handleGetWorkGroups($params, $query, $body) {
    // Verificar autenticación
    $token = requireAuth();
    
    // En una implementación real, obtendrías el ID del usuario del token
    // Por ahora, simulamos que el token contiene el ID del usuario
    $userId = '1'; // ID de usuario simulado
    
    try {
        $db = getDbConnection();
        
        // Obtener grupos donde el usuario es miembro
        $stmt = $db->prepare("
            SELECT wg.* 
            FROM work_groups wg
            JOIN work_group_members wgm ON wg.id = wgm.work_group_id
            WHERE wgm.user_id = ?
        ");
        $stmt->execute([$userId]);
        $groups = $stmt->fetchAll();
        
        // Para cada grupo, obtener el número de miembros
        foreach ($groups as &$group) {
            $stmt = $db->prepare("
                SELECT COUNT(*) 
                FROM work_group_members 
                WHERE work_group_id = ?
            ");
            $stmt->execute([$group['id']]);
            $group['currentMembers'] = $stmt->fetchColumn();
        }
        
        jsonResponse([
            'success' => true,
            'workGroups' => $groups
        ]);
    } catch (PDOException $e) {
        jsonResponse(['success' => false, 'message' => 'Error en el servidor'], 500);
    }
}

// Función para obtener un grupo de trabajo específico
function handleGetWorkGroup($params, $query, $body) {
    // Verificar autenticación
    $token = requireAuth();
    
    $groupId = $params[0];
    
    try {
        $db = getDbConnection();
        
        $stmt = $db->prepare("SELECT * FROM work_groups WHERE id = ?");
        $stmt->execute([$groupId]);
        $group = $stmt->fetch();
        
        if (!$group) {
            jsonResponse(['success' => false, 'message' => 'Grupo de trabajo no encontrado'], 404);
        }
        
        // Obtener el número de miembros
        $stmt = $db->prepare("
            SELECT COUNT(*) 
            FROM work_group_members 
            WHERE work_group_id = ?
        ");
        $stmt->execute([$groupId]);
        $group['currentMembers'] = $stmt->fetchColumn();
        
        jsonResponse([
            'success' => true,
            'workGroup' => $group
        ]);
    } catch (PDOException $e) {
        jsonResponse(['success' => false, 'message' => 'Error en el servidor'], 500);
    }
}

// Función para crear un grupo de trabajo
function handleCreateWorkGroup($params, $query, $body) {
    // Verificar autenticación
    $token = requireAuth();
    
    // En una implementación real, obtendrías el ID del usuario del token
    // Por ahora, simulamos que el token contiene el ID del usuario
    $userId = '1'; // ID de usuario simulado
    
    // Verificar que el cuerpo tenga los datos necesarios
    if (!isset($body['name'])) {
        jsonResponse(['success' => false, 'message' => 'Falta el nombre del grupo'], 400);
    }
    
    try {
        $db = getDbConnection();
        
        // Verificar que el usuario tiene un rol VIP2+
        $stmt = $db->prepare("SELECT role FROM users WHERE id = ?");
        $stmt->execute([$userId]);
        $userRole = $stmt->fetchColumn();
        
        if (!in_array($userRole, ['vip2', 'vip3', 'vip4', 'admin'])) {
            jsonResponse(['success' => false, 'message' => 'Se requiere un plan VIP2 o superior para crear grupos'], 403);
        }
        
        // Generar código de grupo
        $groupCode = strtoupper(substr(md5(uniqid(mt_rand(), true)), 0, 6));
        
        // Determinar max_members según el rol
        $maxMembers = 50; // Por defecto para VIP2
        if ($userRole === 'vip3') $maxMembers = 100;
        if ($userRole === 'vip4') $maxMembers = 300;
        if ($userRole === 'admin') $maxMembers = 999;
        
        // Insertar el grupo
        $stmt = $db->prepare("
            INSERT INTO work_groups (
                id, name, description, owner_id,
                is_active, max_members, group_code, created_at
            ) VALUES (
                UUID(), ?, ?, ?,
                1, ?, ?, NOW()
            )
        ");
        
        $stmt->execute([
            $body['name'],
            $body['description'] ?? '',
            $userId,
            $maxMembers,
            $groupCode
        ]);
        
        // Obtener el ID del grupo insertado
        $groupId = $db->lastInsertId();
        
        // Agregar al creador como miembro con rol de propietario
        $stmt = $db->prepare("
            INSERT INTO work_group_members (
                id, work_group_id, user_id, role, joined_at, is_active
            ) VALUES (
                UUID(), ?, ?, 'owner', NOW(), 1
            )
        ");
        $stmt->execute([$groupId, $userId]);
        
        // Obtener el grupo completo
        $stmt = $db->prepare("SELECT * FROM work_groups WHERE id = ?");
        $stmt->execute([$groupId]);
        $group = $stmt->fetch();
        
        // Establecer currentMembers a 1 (el propietario)
        $group['currentMembers'] = 1;
        
        jsonResponse([
            'success' => true,
            'workGroup' => $group,
            'message' => 'Grupo de trabajo creado correctamente'
        ]);
    } catch (PDOException $e) {
        jsonResponse(['success' => false, 'message' => 'Error en el servidor: ' . $e->getMessage()], 500);
    }
}

// Función para actualizar un grupo de trabajo
function handleUpdateWorkGroup($params, $query, $body) {
    // Verificar autenticación
    $token = requireAuth();
    
    $groupId = $params[0];
    
    // Verificar que el cuerpo tenga datos
    if (empty($body)) {
        jsonResponse(['success' => false, 'message' => 'No hay datos para actualizar'], 400);
    }
    
    try {
        $db = getDbConnection();
        
        // Verificar que el grupo existe
        $stmt = $db->prepare("SELECT * FROM work_groups WHERE id = ?");
        $stmt->execute([$groupId]);
        $group = $stmt->fetch();
        
        if (!$group) {
            jsonResponse(['success' => false, 'message' => 'Grupo de trabajo no encontrado'], 404);
        }
        
        // En una implementación real, verificarías que el usuario es el propietario
        // Por ahora, simulamos que el token contiene el ID del usuario
        $userId = '1'; // ID de usuario simulado
        
        // Verificar que el usuario es el propietario
        if ($group['owner_id'] !== $userId) {
            jsonResponse(['success' => false, 'message' => 'No tienes permiso para actualizar este grupo'], 403);
        }
        
        // Construir la consulta de actualización
        $updateFields = [];
        $updateValues = [];
        
        // Campos permitidos para actualizar
        $allowedFields = [
            'name' => 'name',
            'description' => 'description',
            'is_active' => 'isActive',
            'settings' => 'settings'
        ];
        
        foreach ($allowedFields as $dbField => $bodyField) {
            if (isset($body[$bodyField])) {
                $updateFields[] = "{$dbField} = ?";
                $updateValues[] = $dbField === 'settings' ? json_encode($body[$bodyField]) : $body[$bodyField];
            }
        }
        
        // Si no hay campos para actualizar, terminar
        if (empty($updateFields)) {
            jsonResponse(['success' => false, 'message' => 'No hay campos válidos para actualizar'], 400);
        }
        
        // Agregar el ID del grupo a los valores
        $updateValues[] = $groupId;
        
        // Construir y ejecutar la consulta
        $sql = "UPDATE work_groups SET " . implode(', ', $updateFields) . " WHERE id = ?";
        $stmt = $db->prepare($sql);
        $stmt->execute($updateValues);
        
        // Obtener el grupo actualizado
        $stmt = $db->prepare("SELECT * FROM work_groups WHERE id = ?");
        $stmt->execute([$groupId]);
        $updatedGroup = $stmt->fetch();
        
        // Obtener el número de miembros
        $stmt = $db->prepare("
            SELECT COUNT(*) 
            FROM work_group_members 
            WHERE work_group_id = ?
        ");
        $stmt->execute([$groupId]);
        $updatedGroup['currentMembers'] = $stmt->fetchColumn();
        
        jsonResponse([
            'success' => true,
            'workGroup' => $updatedGroup,
            'message' => 'Grupo de trabajo actualizado correctamente'
        ]);
    } catch (PDOException $e) {
        jsonResponse(['success' => false, 'message' => 'Error en el servidor: ' . $e->getMessage()], 500);
    }
}

// Función para eliminar un grupo de trabajo
function handleDeleteWorkGroup($params, $query, $body) {
    // Verificar autenticación
    $token = requireAuth();
    
    $groupId = $params[0];
    
    try {
        $db = getDbConnection();
        
        // Verificar que el grupo existe
        $stmt = $db->prepare("SELECT * FROM work_groups WHERE id = ?");
        $stmt->execute([$groupId]);
        $group = $stmt->fetch();
        
        if (!$group) {
            jsonResponse(['success' => false, 'message' => 'Grupo de trabajo no encontrado'], 404);
        }
        
        // En una implementación real, verificarías que el usuario es el propietario
        // Por ahora, simulamos que el token contiene el ID del usuario
        $userId = '1'; // ID de usuario simulado
        
        // Verificar que el usuario es el propietario
        if ($group['owner_id'] !== $userId) {
            jsonResponse(['success' => false, 'message' => 'No tienes permiso para eliminar este grupo'], 403);
        }
        
        // Eliminar el grupo (las restricciones de clave foránea eliminarán los miembros)
        $stmt = $db->prepare("DELETE FROM work_groups WHERE id = ?");
        $stmt->execute([$groupId]);
        
        jsonResponse([
            'success' => true,
            'message' => 'Grupo de trabajo eliminado correctamente'
        ]);
    } catch (PDOException $e) {
        jsonResponse(['success' => false, 'message' => 'Error en el servidor'], 500);
    }
}

// Función para obtener los miembros de un grupo
function handleGetWorkGroupMembers($params, $query, $body) {
    // Verificar autenticación
    $token = requireAuth();
    
    $groupId = $params[0];
    
    try {
        $db = getDbConnection();
        
        // Verificar que el grupo existe
        $stmt = $db->prepare("SELECT * FROM work_groups WHERE id = ?");
        $stmt->execute([$groupId]);
        $group = $stmt->fetch();
        
        if (!$group) {
            jsonResponse(['success' => false, 'message' => 'Grupo de trabajo no encontrado'], 404);
        }
        
        // Obtener los miembros del grupo con información de usuario
        $stmt = $db->prepare("
            SELECT wgm.*, u.first_name, u.last_name, u.email, u.phone
            FROM work_group_members wgm
            JOIN users u ON wgm.user_id = u.id
            WHERE wgm.work_group_id = ?
        ");
        $stmt->execute([$groupId]);
        $members = $stmt->fetchAll();
        
        jsonResponse([
            'success' => true,
            'members' => $members
        ]);
    } catch (PDOException $e) {
        jsonResponse(['success' => false, 'message' => 'Error en el servidor'], 500);
    }
}

// Función para agregar un miembro a un grupo
function handleAddWorkGroupMember($params, $query, $body) {
    // Verificar autenticación
    $token = requireAuth();
    
    $groupId = $params[0];
    
    // Verificar que el cuerpo tenga los datos necesarios
    if (!isset($body['userId']) || !isset($body['role'])) {
        jsonResponse(['success' => false, 'message' => 'Faltan datos requeridos'], 400);
    }
    
    try {
        $db = getDbConnection();
        
        // Verificar que el grupo existe
        $stmt = $db->prepare("SELECT * FROM work_groups WHERE id = ?");
        $stmt->execute([$groupId]);
        $group = $stmt->fetch();
        
        if (!$group) {
            jsonResponse(['success' => false, 'message' => 'Grupo de trabajo no encontrado'], 404);
        }
        
        // En una implementación real, verificarías que el usuario tiene permiso
        // Por ahora, simulamos que el token contiene el ID del usuario
        $userId = '1'; // ID de usuario simulado
        
        // Verificar que el usuario a agregar existe
        $stmt = $db->prepare("SELECT * FROM users WHERE id = ?");
        $stmt->execute([$body['userId']]);
        $userToAdd = $stmt->fetch();
        
        if (!$userToAdd) {
            jsonResponse(['success' => false, 'message' => 'Usuario no encontrado'], 404);
        }
        
        // Verificar que el usuario no es ya miembro del grupo
        $stmt = $db->prepare("
            SELECT COUNT(*) 
            FROM work_group_members 
            WHERE work_group_id = ? AND user_id = ?
        ");
        $stmt->execute([$groupId, $body['userId']]);
        $isMember = $stmt->fetchColumn() > 0;
        
        if ($isMember) {
            jsonResponse(['success' => false, 'message' => 'El usuario ya es miembro del grupo'], 400);
        }
        
        // Verificar que no se excede el límite de miembros
        $stmt = $db->prepare("
            SELECT COUNT(*) 
            FROM work_group_members 
            WHERE work_group_id = ?
        ");
        $stmt->execute([$groupId]);
        $memberCount = $stmt->fetchColumn();
        
        if ($memberCount >= $group['max_members']) {
            jsonResponse(['success' => false, 'message' => 'Se ha alcanzado el límite de miembros para este grupo'], 400);
        }
        
        // Insertar el miembro
        $stmt = $db->prepare("
            INSERT INTO work_group_members (
                id, work_group_id, user_id, role, nickname, joined_at, is_active
            ) VALUES (
                UUID(), ?, ?, ?, ?, NOW(), 1
            )
        ");
        
        $stmt->execute([
            $groupId,
            $body['userId'],
            $body['role'],
            $body['nickname'] ?? null
        ]);
        
        // Obtener el miembro insertado
        $memberId = $db->lastInsertId();
        
        // Obtener el miembro completo con información de usuario
        $stmt = $db->prepare("
            SELECT wgm.*, u.first_name, u.last_name, u.email, u.phone
            FROM work_group_members wgm
            JOIN users u ON wgm.user_id = u.id
            WHERE wgm.id = ?
        ");
        $stmt->execute([$memberId]);
        $member = $stmt->fetch();
        
        jsonResponse([
            'success' => true,
            'member' => $member,
            'message' => 'Miembro agregado correctamente'
        ]);
    } catch (PDOException $e) {
        jsonResponse(['success' => false, 'message' => 'Error en el servidor: ' . $e->getMessage()], 500);
    }
}

// Función para eliminar un miembro de un grupo
function handleRemoveWorkGroupMember($params, $query, $body) {
    // Verificar autenticación
    $token = requireAuth();
    
    $groupId = $params[0];
    $memberId = $params[1];
    
    try {
        $db = getDbConnection();
        
        // Verificar que el grupo existe
        $stmt = $db->prepare("SELECT * FROM work_groups WHERE id = ?");
        $stmt->execute([$groupId]);
        $group = $stmt->fetch();
        
        if (!$group) {
            jsonResponse(['success' => false, 'message' => 'Grupo de trabajo no encontrado'], 404);
        }
        
        // Verificar que el miembro existe
        $stmt = $db->prepare("
            SELECT * 
            FROM work_group_members 
            WHERE id = ? AND work_group_id = ?
        ");
        $stmt->execute([$memberId, $groupId]);
        $member = $stmt->fetch();
        
        if (!$member) {
            jsonResponse(['success' => false, 'message' => 'Miembro no encontrado'], 404);
        }
        
        // En una implementación real, verificarías que el usuario tiene permiso
        // Por ahora, simulamos que el token contiene el ID del usuario
        $userId = '1'; // ID de usuario simulado
        
        // Verificar que no se está eliminando al propietario
        if ($member['role'] === 'owner') {
            jsonResponse(['success' => false, 'message' => 'No se puede eliminar al propietario del grupo'], 403);
        }
        
        // Eliminar el miembro
        $stmt = $db->prepare("DELETE FROM work_group_members WHERE id = ?");
        $stmt->execute([$memberId]);
        
        jsonResponse([
            'success' => true,
            'message' => 'Miembro eliminado correctamente'
        ]);
    } catch (PDOException $e) {
        jsonResponse(['success' => false, 'message' => 'Error en el servidor'], 500);
    }
}