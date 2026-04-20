<?php
function json_ok(array $data = []) {
    echo json_encode(array_merge(["success" => true], $data));
    exit;
}

function json_error(string $message, int $code = 422) {
    http_response_code($code);
    echo json_encode(["success" => false, "message" => $message]);
    exit;
}

function require_auth(): array {
    $pdo  = get_db();
    $auth = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
    if (!preg_match('/^Bearer (.+)$/', $auth, $m)) json_error("Přístup odepřen.", 401);

    $stmt = $pdo->prepare("
        SELECT u.* FROM zg_users u
        JOIN zg_tokens t ON t.user_id = u.id
        WHERE t.token = ? AND t.expires_at > NOW()
    ");
    $stmt->execute([hash('sha256', $m[1])]);
    $user = $stmt->fetch();
    if (!$user) json_error("Token vypršel nebo je neplatný.", 401);
    return $user;
}

function require_role(array $user, string ...$roles) {
    if (!in_array($user['role'], $roles)) json_error("Nedostatečná oprávnění.", 403);
}
