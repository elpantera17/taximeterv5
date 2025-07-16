<?php
// Configura tu conexión a la base de datos
$host = "localhost";
$dbname = "u379683784_meter";
$username = "u379683784_meter";
$password = "Sofia24@123";

// Configurar cabeceras para JSON
header('Content-Type: application/json');

// Leer cuerpo JSON
$input = json_decode(file_get_contents('php://input'), true);

// Verificar si llegaron las credenciales
if (!isset($input['email']) || !isset($input['password'])) {
    echo json_encode(['success' => false, 'message' => 'Faltan credenciales']);
    exit;
}

// Extraer datos
$email = $input['email'];
$passwordInput = $input['password'];

try {
    // Conexión PDO
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Buscar usuario por email
    $stmt = $pdo->prepare("SELECT id, email, password, nombre, nivel_vip FROM users WHERE email = ?");
    $stmt->execute([$email]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    // Validar existencia y contraseña
    if ($user && password_verify($passwordInput, $user['password'])) {
        echo json_encode([
            'success' => true,
            'message' => 'Login exitoso',
            'user' => [
                'id' => $user['id'],
                'email' => $user['email'],
                'nombre' => $user['nombre'],
                'nivel_vip' => $user['nivel_vip']
            ]
        ]);
    } else {
        echo json_encode(['success' => false, 'message' => 'Credenciales incorrectas']);
    }

} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Error de conexión', 'error' => $e->getMessage()]);
    exit;
}
?>

