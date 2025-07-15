<?php
// Configuración de la base de datos para Hostinger
// Este archivo debe estar en la carpeta /public_html/taximeter/api/config.php

// Habilitar reporte de errores en desarrollo (desactivar en producción)
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Configuración de la base de datos
$db_config = [
    'host' => 'localhost', // Normalmente es localhost en Hostinger
    'database' => 'u379683784_Meter', // Nombre de base de datos
    'username' => 'u379683784_Meter', // Usuario de base de datos
    'password' => 'Sofia24@123', // Contraseña
    'charset' => 'utf8mb4',
    'collation' => 'utf8mb4_unicode_ci',
];

// Función para conectar a la base de datos
function getDbConnection() {
    global $db_config;
    
    try {
        $dsn = "mysql:host={$db_config['host']};dbname={$db_config['database']};charset={$db_config['charset']}";
        $options = [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
        ];
        
        $pdo = new PDO($dsn, $db_config['username'], $db_config['password'], $options);
        return $pdo;
    } catch (PDOException $e) {
        // En producción, no mostrar el mensaje de error detallado
        die(json_encode(['success' => false, 'message' => 'Error de conexión a la base de datos']));
    }
}

// Configuración de CORS
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Si es una solicitud OPTIONS, terminar aquí
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// Función para generar respuesta JSON
function jsonResponse($data, $status = 200) {
    http_response_code($status);
    header('Content-Type: application/json');
    echo json_encode($data);
    exit;
}

// Función para verificar token JWT (simplificada)
function verifyToken($token) {
    // En una implementación real, verificarías la validez del token JWT
    // Por ahora, simplemente verificamos que exista
    if (empty($token)) {
        return false;
    }
    
    // Aquí implementarías la lógica real de verificación
    return true;
}

// Función para obtener el token de la cabecera Authorization
function getAuthToken() {
    $headers = getallheaders();
    $authHeader = isset($headers['Authorization']) ? $headers['Authorization'] : '';
    
    if (empty($authHeader) || !preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
        return null;
    }
    
    return $matches[1];
}

// Función para verificar autenticación
function requireAuth() {
    $token = getAuthToken();
    
    if (!$token || !verifyToken($token)) {
        jsonResponse(['success' => false, 'message' => 'No autorizado'], 401);
    }
    
    return $token;
}