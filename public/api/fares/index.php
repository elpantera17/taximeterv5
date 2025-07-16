<?php
require_once '../../config.php';
require_once '../../controllers/fare_controller.php';

$fareController = new FareController($db_config);

header('Content-Type: application/json');

echo json_encode($fareController->getAll());
?>
