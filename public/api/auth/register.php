<?php
require_once '../config.php';
require_once '../controllers/UserController.php';

header('Content-Type: application/json');
$input = json_decode(file_get_contents('php://input'), true);

if (!isset($input['email']) || !isset($input['password'])) {
    echo json_encode(['success' => false, 'message' => 'Faltan datos']);
    exit;
}

$userController = new UserController($db_config);
$response = $userController->register($input);

echo json_encode($response);
?>
