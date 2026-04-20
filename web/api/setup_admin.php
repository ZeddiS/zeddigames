<!DOCTYPE html>
<?php
/**
 * ZeddiGames — Vytvoření admin účtu
 * ⚠ PO POUŽITÍ TENTO SOUBOR SMAŽ ze serveru!
 * URL: https://zeddihub.eu/games/api/setup_admin.php
 */

// Jednoduchá ochrana — nastav si vlastní klíč
define('SETUP_KEY', 'zeddigames_setup_2026');

require_once __DIR__ . '/db.php';

$error = '';
$success = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $key  = $_POST['setup_key']  ?? '';
    $nick = trim($_POST['nickname'] ?? '');
    $email = strtolower(trim($_POST['email'] ?? ''));
    $pw   = $_POST['password'] ?? '';
    $pw2  = $_POST['password2'] ?? '';

    if ($key !== SETUP_KEY) {
        $error = 'Nesprávný setup klíč.';
    } elseif (strlen($nick) < 3) {
        $error = 'Přezdívka je příliš krátká.';
    } elseif (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        $error = 'Neplatný e-mail.';
    } elseif (strlen($pw) < 8) {
        $error = 'Heslo musí mít alespoň 8 znaků.';
    } elseif ($pw !== $pw2) {
        $error = 'Hesla se neshodují.';
    } else {
        try {
            $pdo  = get_db();
            // Zkontroluj jestli admin existuje
            $exists = $pdo->prepare("SELECT id FROM zg_users WHERE email = ? OR nickname = ?");
            $exists->execute([$email, $nick]);
            if ($exists->fetch()) {
                // Povyš existujícího uživatele na admin
                $pdo->prepare("UPDATE zg_users SET role = 'admin', password_hash = ? WHERE email = ?")
                    ->execute([password_hash($pw, PASSWORD_BCRYPT, ['cost' => 12]), $email]);
                $success = "✅ Existující účet byl povýšen na admin a heslo aktualizováno!";
            } else {
                $hash = password_hash($pw, PASSWORD_BCRYPT, ['cost' => 12]);
                $pdo->prepare("INSERT INTO zg_users (nickname, email, password_hash, role, created_at)
                               VALUES (?, ?, ?, 'admin', NOW())")
                    ->execute([$nick, $email, $hash]);
                $success = "✅ Admin účet byl vytvořen! Přihlas se na <a href='/games/login.php'>/games/login.php</a>";
            }
        } catch (Exception $e) {
            $error = 'Chyba databáze: ' . $e->getMessage();
        }
    }
}
?>
<html lang="cs">
<head>
  <meta charset="UTF-8">
  <title>ZeddiGames — Setup Admin</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: Inter, sans-serif; background: #0d1117; color: #e6edf3; display: flex; align-items: center; justify-content: center; min-height: 100vh; padding: 24px; }
    .card { background: #161b22; border: 1px solid #30363d; border-radius: 16px; padding: 36px; max-width: 440px; width: 100%; }
    h1 { font-size: 22px; font-weight: 800; margin-bottom: 6px; }
    p  { color: #8b949e; font-size: 14px; margin-bottom: 24px; }
    label { display: block; font-size: 12px; font-weight: 600; color: #8b949e; text-transform: uppercase; letter-spacing: .5px; margin-bottom: 6px; margin-top: 14px; }
    input { width: 100%; background: #0d1117; border: 1px solid #30363d; border-radius: 8px; padding: 10px 14px; color: #e6edf3; font-size: 14px; }
    input:focus { outline: none; border-color: #ff6b00; }
    button { margin-top: 24px; width: 100%; padding: 12px; background: #ff6b00; color: #fff; font-size: 15px; font-weight: 700; border: none; border-radius: 8px; cursor: pointer; }
    button:hover { background: #ff8c00; }
    .error   { margin-top: 16px; padding: 12px; background: rgba(248,81,73,.12); border: 1px solid rgba(248,81,73,.3); border-radius: 8px; color: #f85149; font-size: 14px; }
    .success { margin-top: 16px; padding: 12px; background: rgba(35,197,97,.12); border: 1px solid rgba(35,197,97,.3); border-radius: 8px; color: #3fb950; font-size: 14px; }
    .warn { background: rgba(255,107,0,.1); border: 1px solid rgba(255,107,0,.3); border-radius: 8px; padding: 10px 14px; font-size: 13px; color: #ff8c00; margin-bottom: 20px; }
  </style>
</head>
<body>
  <div class="card">
    <h1>🔧 Setup Admin účtu</h1>
    <p>Vytvoř první admin účet pro ZeddiGames. Po dokončení tento soubor smaž.</p>
    <div class="warn">⚠ Po použití smaž tento soubor ze serveru!</div>

    <?php if ($error):   ?><div class="error"><?= htmlspecialchars($error) ?></div><?php endif; ?>
    <?php if ($success): ?><div class="success"><?= $success ?></div><?php endif; ?>

    <?php if (!$success): ?>
    <form method="POST">
      <label>Setup klíč (ochrana)</label>
      <input type="password" name="setup_key" placeholder="zeddigames_setup_2026" required>

      <label>Přezdívka admina</label>
      <input type="text" name="nickname" placeholder="Admin" required>

      <label>E-Mail</label>
      <input type="email" name="email" placeholder="admin@zeddihub.eu" required>

      <label>Heslo (min. 8 znaků)</label>
      <input type="password" name="password" required>

      <label>Potvrdit heslo</label>
      <input type="password" name="password2" required>

      <button type="submit">Vytvořit admin účet</button>
    </form>
    <?php endif; ?>
  </div>
</body>
</html>
