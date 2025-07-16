<?php
require_once '../../config.php';
require_once '../../controllers/trip_controller.php';

$tripController = new TripController($db_config);

header('Content-Type: application/json');

// Obtener método de la solicitud
$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
  case 'GET':
    echo json_encode($tripController->getAll());
    break;

  case 'POST':
    $data = json_decode(file_get_contents('php://input'), true);
    echo json_encode($tripController->create($data));
    break;

  case 'PUT':
    parse_str(file_get_contents("php://input"), $put_vars);
    $tripId = $_GET['id'] ?? null;
    echo json_encode($tripController->update($tripId, $put_vars));
    break;

  case 'DELETE':
    $tripId = $_GET['id'] ?? null;
    echo json_encode($tripController->delete($tripId));
    break;

  default:
    echo json_encode(['success' => false, 'message' => 'Método no soportado']);
}
?>
