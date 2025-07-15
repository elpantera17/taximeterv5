<?php
// Punto de entrada principal para la API
// Este archivo debe estar en la carpeta /public_html/taximeter/api/index.php

require_once 'config.php';

// Obtener la ruta solicitada
$request_uri = $_SERVER['REQUEST_URI'];
$base_path = '/taximeter/api'; // Ajusta esto según tu configuración

// Eliminar la base_path y los parámetros de consulta
$path = parse_url($request_uri, PHP_URL_PATH);
$path = str_replace($base_path, '', $path);
$path = trim($path, '/');

// Obtener el método HTTP
$method = $_SERVER['REQUEST_METHOD'];

// Obtener los parámetros de consulta
$query_params = [];
parse_str($_SERVER['QUERY_STRING'] ?? '', $query_params);

// Obtener el cuerpo de la solicitud para métodos POST, PUT
$body = null;
if ($method === 'POST' || $method === 'PUT') {
    $input = file_get_contents('php://input');
    $body = json_decode($input, true);
}

// Enrutamiento básico
$routes = [
    // Rutas de autenticación
    'auth/login' => ['POST' => 'handleLogin'],
    'auth/register' => ['POST' => 'handleRegister'],
    'auth/me' => ['GET' => 'handleGetCurrentUser'],
    
    // Rutas de usuarios
    'users' => ['GET' => 'handleGetUsers'],
    'users/([^/]+)' => ['GET' => 'handleGetUser', 'PUT' => 'handleUpdateUser'],
    
    // Rutas de viajes
    'trips' => ['GET' => 'handleGetTrips', 'POST' => 'handleCreateTrip'],
    'trips/([^/]+)' => ['GET' => 'handleGetTrip', 'PUT' => 'handleUpdateTrip', 'DELETE' => 'handleDeleteTrip'],
    
    // Rutas de tarifas
    'fares' => ['GET' => 'handleGetFares', 'POST' => 'handleCreateFare'],
    'fares/([^/]+)' => ['GET' => 'handleGetFare', 'PUT' => 'handleUpdateFare', 'DELETE' => 'handleDeleteFare'],
    
    // Rutas de grupos de trabajo
    'workgroups' => ['GET' => 'handleGetWorkGroups', 'POST' => 'handleCreateWorkGroup'],
    'workgroups/([^/]+)' => ['GET' => 'handleGetWorkGroup', 'PUT' => 'handleUpdateWorkGroup', 'DELETE' => 'handleDeleteWorkGroup'],
    'workgroups/([^/]+)/members' => ['GET' => 'handleGetWorkGroupMembers', 'POST' => 'handleAddWorkGroupMember'],
    'workgroups/([^/]+)/members/([^/]+)' => ['DELETE' => 'handleRemoveWorkGroupMember'],
    
    // Ruta para verificar teléfono
    'check-phone' => ['GET' => 'handleCheckPhone'],
    
    // Ruta para crear usuario de prueba
    'create-test-user' => ['GET' => 'handleCreateTestUser']
];

// Buscar la ruta correspondiente
$handler = null;
$params = [];

foreach ($routes as $route => $handlers) {
    $pattern = "#^{$route}$#";
    if (preg_match($pattern, $path, $matches)) {
        array_shift($matches); // Eliminar la coincidencia completa
        $params = $matches;
        
        if (isset($handlers[$method])) {
            $handler = $handlers[$method];
            break;
        }
    }
}

// Si no se encuentra un manejador, devolver 404
if (!$handler) {
    jsonResponse(['success' => false, 'message' => 'Ruta no encontrada'], 404);
}

// Incluir los controladores
require_once 'controllers/auth_controller.php';
require_once 'controllers/user_controller.php';
require_once 'controllers/trip_controller.php';
require_once 'controllers/fare_controller.php';
require_once 'controllers/workgroup_controller.php';

// Llamar al manejador correspondiente
call_user_func($handler, $params, $query_params, $body);