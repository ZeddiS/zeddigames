<?php
/**
 * ZeddiGames Launcher — Auth API
 * Endpoint: https://zeddihub.eu/games/api/auth.php
 * Actions: login, register, verify_token, logout
 */

header("Content-Type: application/json; charset=utf-8");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit; }

require_once __DIR__ . '/db.php';
require_once __DIR__ . '/utils.php';

$input = json_decode(file_get_contents('php://input'), true);
$action = $input['action'] ?? '';

switch ($action) {
    case 'register': handle_register($input); break;
    case 'login':    handle_login($input);    break;
    case 'verify':   handle_verify();         break;
    default:         json_error("Neznámá akce", 400);
}

// ─── Register ────────────────────────────────────────────────────────────────
function handle_register(array $data) {
    $pdo  = get_db();
    $nick = trim($data['nickname'] ?? '');
    $email = strtolower(trim($data['email'] ?? ''));
    $pw   = $data['password'] ?? '';

    if (strlen($nick) < 3)  json_error("Přezdívka musí mít alespoň 3 znaky.");
    if (strlen($nick) > 30) json_error("Přezdívka je příliš dlouhá (max 30 znaků).");
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) json_error("Neplatný e-mail.");
    if (strlen($pw) < 8) json_error("Heslo musí mít alespoň 8 znaků.");
    if (!preg_match('/[A-Za-z]/', $pw) || !preg_match('/[0-9]/', $pw))
        json_error("Heslo musí obsahovat písmeno a číslo.");

    // Check duplicates
    $stmt = $pdo->prepare("SELECT id FROM zg_users WHERE email = ? OR nickname = ?");
    $stmt->execute([$email, $nick]);
    if ($stmt->fetch()) json_error("E-mail nebo přezdívka jsou již obsazené.");

    $hash = password_hash($pw, PASSWORD_BCRYPT, ['cost' => 12]);
    $stmt = $pdo->prepare("INSERT INTO zg_users (nickname, email, password_hash, role, created_at) VALUES (?,?,?,'user',NOW())");
    $stmt->execute([$nick, $email, $hash]);

    json_ok(["message" => "Účet byl vytvořen. Přihlas se."]);
}

// ─── Login ────────────────────────────────────────────────────────────────────
function handle_login(array $data) {
    $pdo   = get_db();
    $email = strtolower(trim($data['email'] ?? ''));
    $pw    = $data['password'] ?? '';

    if (!$email || !$pw) json_error("Vyplň e-mail a heslo.");

    $stmt = $pdo->prepare("SELECT * FROM zg_users WHERE email = ? LIMIT 1");
    $stmt->execute([$email]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$user || !password_verify($pw, $user['password_hash']))
        json_error("Nesprávný e-mail nebo heslo.", 401);

    // Generate session token
    $token = bin2hex(random_bytes(32));
    $expires = date('Y-m-d H:i:s', strtotime('+30 days'));
    $pdo->prepare("INSERT INTO zg_tokens (user_id, token, expires_at) VALUES (?,?,?)")
        ->execute([$user['id'], hash('sha256', $token), $expires]);

    // Update last login
    $pdo->prepare("UPDATE zg_users SET last_login = NOW() WHERE id = ?")->execute([$user['id']]);

    unset($user['password_hash']);
    json_ok(["user" => $user, "token" => $token]);
}

// ─── Verify token ─────────────────────────────────────────────────────────────
function handle_verify() {
    $pdo = get_db();
    $auth = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
    if (!preg_match('/^Bearer (.+)$/', $auth, $m)) json_error("Chybí token.", 401);
    $token = $m[1];

    $stmt = $pdo->prepare("
        SELECT u.* FROM zg_users u
        JOIN zg_tokens t ON t.user_id = u.id
        WHERE t.token = ? AND t.expires_at > NOW()
        LIMIT 1
    ");
    $stmt->execute([hash('sha256', $token)]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    if (!$user) json_error("Token je neplatný nebo vypršel.", 401);

    unset($user['password_hash']);
    json_ok(["user" => $user]);
}
