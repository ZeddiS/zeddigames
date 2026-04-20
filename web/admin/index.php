<?php
session_start();
require_once __DIR__ . '/../api/db.php';
require_once __DIR__ . '/../api/utils.php';

// Simple session-based admin auth
$token = $_COOKIE['zg_admin_token'] ?? '';
$admin = null;
if ($token) {
    $pdo = get_db();
    $stmt = $pdo->prepare("
        SELECT u.* FROM zg_users u JOIN zg_tokens t ON t.user_id = u.id
        WHERE t.token = ? AND t.expires_at > NOW() AND u.role IN ('admin','moderator')
    ");
    $stmt->execute([hash('sha256', $token)]);
    $admin = $stmt->fetch(PDO::FETCH_ASSOC);
}
if (!$admin) { header("Location: /games/login.php?redirect=/games/admin/"); exit; }

$pdo = get_db();
$stats = [];
$stats['users']   = $pdo->query("SELECT COUNT(*) FROM zg_users")->fetchColumn();
$stats['premium'] = $pdo->query("SELECT COUNT(*) FROM zg_users WHERE role='premium'")->fetchColumn();
$stats['admins']  = $pdo->query("SELECT COUNT(*) FROM zg_users WHERE role IN('admin','moderator')")->fetchColumn();

$recentUsers = $pdo->query("SELECT id,nickname,email,role,created_at FROM zg_users ORDER BY id DESC LIMIT 20")->fetchAll(PDO::FETCH_ASSOC);

$roleColors = ['user'=>'#8b949e','premium'=>'#f0a500','moderator'=>'#58a6ff','admin'=>'#f85149'];
?>
<!DOCTYPE html>
<html lang="cs">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Admin Panel — ZeddiGames</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="/games/assets/css/style.css">
  <style>
    body { background: #0d1117; }
    .admin-wrap { display: flex; min-height: calc(100vh - 55px); }
    .admin-sidebar { width: 220px; flex-shrink: 0; background: #161b22; border-right: 1px solid #30363d; padding: 24px 16px; }
    .admin-sidebar h2 { font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: #8b949e; margin-bottom: 12px; }
    .side-link { display: flex; align-items: center; gap: 8px; padding: 9px 12px; border-radius: 8px; text-decoration: none; color: #c9d1d9; font-size: 14px; margin-bottom: 2px; transition: background .2s; }
    .side-link:hover, .side-link.active { background: rgba(255,107,0,.1); color: #ff6b00; }
    .admin-main { flex: 1; padding: 32px; overflow-y: auto; }
    .admin-main h1 { font-size: 28px; font-weight: 800; margin-bottom: 8px; }
    .admin-main > p { color: #8b949e; margin-bottom: 32px; }
    .stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 32px; }
    .stat-card { background: #161b22; border: 1px solid #30363d; border-radius: 12px; padding: 20px 24px; }
    .stat-card .val { font-size: 32px; font-weight: 900; }
    .stat-card .lbl { font-size: 13px; color: #8b949e; margin-top: 4px; }
    .data-table { width: 100%; border-collapse: collapse; }
    .data-table th { text-align: left; font-size: 11px; text-transform: uppercase; letter-spacing: .5px; color: #8b949e; padding: 10px 12px; border-bottom: 1px solid #30363d; }
    .data-table td { padding: 10px 12px; font-size: 13px; border-bottom: 1px solid #21262d; }
    .data-table tr:hover td { background: rgba(255,255,255,.02); }
    .role-badge { padding: 2px 8px; border-radius: 20px; font-size: 11px; font-weight: 700; }
    .table-wrap { background: #161b22; border: 1px solid #30363d; border-radius: 12px; overflow: hidden; }
    .table-header { padding: 16px 20px; border-bottom: 1px solid #30363d; display: flex; justify-content: space-between; align-items: center; }
    .table-header h3 { font-weight: 700; }
  </style>
</head>
<body>
  <nav class="navbar">
    <div class="container nav-inner">
      <a href="/games/" class="nav-logo">
        <img src="/games/assets/logo2.png" alt="ZeddiGames" class="logo-img">
        <span>ZeddiGames <span style="color:#ff6b00">Admin</span></span>
      </a>
      <div class="nav-links">
        <span style="font-size:13px;color:#8b949e">Přihlášen jako <strong style="color:#ff6b00"><?= htmlspecialchars($admin['nickname']) ?></strong></span>
        <a href="/games/api/logout.php" class="btn btn-ghost">Odhlásit</a>
      </div>
    </div>
  </nav>

  <div class="admin-wrap">
    <aside class="admin-sidebar">
      <h2>Navigace</h2>
      <a href="/games/admin/" class="side-link active">📊 Dashboard</a>
      <a href="/games/admin/users.php" class="side-link">👥 Uživatelé</a>
      <a href="/games/admin/versions.php" class="side-link">🚀 Verze</a>
      <a href="/games/" class="side-link">🌐 Na web</a>
    </aside>

    <main class="admin-main">
      <h1>Dashboard</h1>
      <p>Přehled ZeddiGames platformy · <?= date('j. n. Y') ?></p>

      <div class="stats-grid">
        <div class="stat-card">
          <div class="val" style="color:#ff6b00"><?= number_format($stats['users']) ?></div>
          <div class="lbl">Celkem uživatelů</div>
        </div>
        <div class="stat-card">
          <div class="val" style="color:#f0a500"><?= number_format($stats['premium']) ?></div>
          <div class="lbl">Premium uživatelů</div>
        </div>
        <div class="stat-card">
          <div class="val" style="color:#58a6ff"><?= number_format($stats['admins']) ?></div>
          <div class="lbl">Admin / Moderátor</div>
        </div>
      </div>

      <div class="table-wrap">
        <div class="table-header">
          <h3>Nejnovější uživatelé</h3>
          <a href="/games/admin/users.php" class="btn btn-ghost" style="padding:6px 14px;font-size:12px">Všichni →</a>
        </div>
        <table class="data-table">
          <thead><tr><th>#</th><th>Přezdívka</th><th>E-Mail</th><th>Role</th><th>Registrace</th></tr></thead>
          <tbody>
            <?php foreach ($recentUsers as $u): ?>
            <tr>
              <td style="color:#8b949e"><?= $u['id'] ?></td>
              <td><strong><?= htmlspecialchars($u['nickname']) ?></strong></td>
              <td style="color:#8b949e"><?= htmlspecialchars($u['email']) ?></td>
              <td>
                <span class="role-badge" style="background:<?= $roleColors[$u['role']] ?>22;color:<?= $roleColors[$u['role']] ?>">
                  <?= strtoupper($u['role']) ?>
                </span>
              </td>
              <td style="color:#8b949e"><?= date('j.n.Y', strtotime($u['created_at'])) ?></td>
            </tr>
            <?php endforeach; ?>
          </tbody>
        </table>
      </div>
    </main>
  </div>
</body>
</html>
