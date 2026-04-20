<!DOCTYPE html>
<html lang="cs">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Changelog — ZeddiGames</title>
  <link rel="icon" href="/games/assets/favicon.ico">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="/games/assets/css/style.css">
  <style>
    .changelog { max-width: 700px; margin: 60px auto; padding: 0 24px 80px; }
    .changelog h1 { font-size: 36px; font-weight: 900; margin-bottom: 8px; }
    .changelog > p { color: var(--text-muted); margin-bottom: 48px; }
    .release { margin-bottom: 40px; }
    .release-header { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; }
    .release-version { font-size: 22px; font-weight: 800; }
    .release-date { font-size: 13px; color: var(--text-muted); }
    .release-badge { padding: 3px 10px; border-radius: 20px; font-size: 11px; font-weight: 700; }
    .badge-latest { background: rgba(255,107,0,.15); color: var(--orange); border: 1px solid rgba(255,107,0,.3); }
    .release-notes { background: var(--dark2); border: 1px solid var(--border); border-radius: 12px; padding: 20px 24px; }
    .release-notes ul { list-style: none; space-y: 8px; }
    .release-notes li { font-size: 14px; padding: 6px 0; border-bottom: 1px solid var(--border); color: var(--text-muted); display: flex; gap: 10px; }
    .release-notes li:last-child { border: none; }
    .tag { font-size: 11px; font-weight: 700; padding: 2px 7px; border-radius: 4px; flex-shrink: 0; margin-top: 2px; }
    .tag-new  { background: rgba(35,197,97,.15); color: #23c561; }
    .tag-fix  { background: rgba(248,81,73,.15); color: #f85149; }
    .tag-impr { background: rgba(88,166,255,.15); color: #58a6ff; }
  </style>
</head>
<body>
  <nav class="navbar">
    <div class="container nav-inner">
      <a href="/games/" class="nav-logo">
        <img src="/games/assets/logo2.png" alt="ZeddiGames" class="logo-img">
        <span>ZeddiGames</span>
      </a>
      <div class="nav-links">
        <a href="/games/">Domů</a>
        <a href="/games/#download" class="btn btn-primary">Stáhnout</a>
      </div>
    </div>
  </nav>

  <div class="changelog">
    <h1>📋 Changelog</h1>
    <p>Historie všech verzí ZeddiGames Launcheru</p>

    <?php
    $versions = [
      [
        "version" => "0.1.0",
        "date"    => "20. dubna 2026",
        "latest"  => true,
        "notes"   => [
          ["new",  "ZeddiGames Launcher – první veřejné vydání"],
          ["new",  "Auto-detekce Steam, Epic, GOG a standalone her"],
          ["new",  "Herní obchod přes RAWG.io API (500k+ her)"],
          ["new",  "Steam komunita – profil, přátelé, achievementy"],
          ["new",  "Download manager se SteamCMD integrací"],
          ["new",  "3 barevná témata: Steam Dark, Light, ZeddiGames Orange"],
          ["new",  "Auto-aktualizace přes GitHub Releases"],
          ["new",  "Vlastní titlebar bez Windows rámu"],
          ["new",  "ZeddiGames účet s rolemi (user, premium, admin, moderator)"],
          ["new",  "Toast notifikace systém"],
        ]
      ]
    ];

    $tagLabels = ["new" => "NOVÉ", "fix" => "FIX", "impr" => "VYLEPŠENÍ"];
    foreach ($versions as $v):
    ?>
    <div class="release">
      <div class="release-header">
        <span class="release-version">v<?= htmlspecialchars($v['version']) ?></span>
        <span class="release-date"><?= htmlspecialchars($v['date']) ?></span>
        <?php if ($v['latest']): ?>
          <span class="release-badge badge-latest">NEJNOVĚJŠÍ</span>
        <?php endif; ?>
      </div>
      <div class="release-notes">
        <ul>
          <?php foreach ($v['notes'] as [$type, $note]): ?>
          <li>
            <span class="tag tag-<?= $type ?>"><?= $tagLabels[$type] ?></span>
            <?= htmlspecialchars($note) ?>
          </li>
          <?php endforeach; ?>
        </ul>
      </div>
    </div>
    <?php endforeach; ?>
  </div>

  <footer class="footer">
    <div class="container footer-inner">
      <div class="footer-logo">
        <img src="/games/assets/logo2.png" alt="" class="logo-img">
        <span>ZeddiGames</span>
      </div>
      <p class="footer-copy">© <?= date('Y') ?> ZeddiGames</p>
    </div>
  </footer>
</body>
</html>
