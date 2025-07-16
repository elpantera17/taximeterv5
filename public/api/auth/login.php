<?php
// Conexión a la base de datos
$host = "localhost";
$dbname = "u379683784_meter";
$username = "u379683784_meter";
$password = "Sofia24@123";

header('Content-Type: application/json');
$input = json_decode(file_get_contents('php://input'), true);

// Verificar si llegaron las credenciales
if (!isset($input['email']) || !isset($input['password'])) {
    echo json_encode(['success' => false, 'message' => 'Faltan credenciales']);
    exit;
}

$email = $input['email'];
$passwordInput = $input['password'];

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Buscar usuario
    $stmt = $pdo->prepare("SELECT id, email, password_hash, first_name, last_name, role, is_active FROM users WHERE email = ?");
    $stmt->execute([$email]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    // Comparar en texto plano
    if ($user && $user['password_hash'] === $passwordInput) {
        echo json_encode([
            'success' => true,
            'message' => 'Login exitoso',
            'user' => [
                'id' => $user['id'],
                'email' => $user['email'],
                'nombre' => $user['first_name'] . ' ' . $user['last_name'],
                'role' => $user['role'],
                'activo' => $user['is_active']
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


    
