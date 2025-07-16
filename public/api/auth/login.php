<?php
require_once '../config.php';
require_once '../controllers/User_Controller.php';

header('Content-Type: application/json');
$input = json_decode(file_get_contents('php://input'), true);

if (!isset($input['email']) || !isset($input['password'])) {
    echo json_encode(['success' => false, 'message' => 'Faltan credenciales']);
    exit;
}

$userController = new UserController($db_config);
$response = $userController->login($input['email'], $input['password']);

echo json_encode($response);
?>
