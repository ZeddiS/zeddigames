<!DOCTYPE html>
<html lang="cs">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ZeddiGames Launcher</title>
  <meta name="description" content="Unifikovaná herní platforma – Steam, Epic, GOG a standalone hry na jednom místě.">
  <link rel="icon" type="image/x-icon" href="/games/assets/favicon.ico">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="/games/assets/css/style.css">
</head>
<body>
  <!-- NAVBAR -->
  <nav class="navbar">
    <div class="container nav-inner">
      <a href="/games/" class="nav-logo">
        <img src="/games/assets/logo2.png" alt="ZeddiGames" class="logo-img">
        <span>ZeddiGames</span>
      </a>
      <div class="nav-links">
        <a href="/games/#features">Funkce</a>
        <a href="/games/changelog.php">Changelog</a>
        <a href="/games/login.php" class="btn btn-ghost">Přihlásit se</a>
        <a href="/games/#download" class="btn btn-primary">Stáhnout</a>
      </div>
    </div>
  </nav>

  <!-- HERO -->
  <section class="hero">
    <div class="hero-glow"></div>
    <div class="container hero-content">
      <div class="hero-badge">🎮 Verze 0.1.0 · Právě vydáno</div>
      <h1 class="hero-title">
        Všechny tvoje hry.<br>
        <span class="gradient-text">Jedna platforma.</span>
      </h1>
      <p class="hero-desc">
        ZeddiGames Launcher automaticky detekuje hry ze Steamu, Epicu, GOGu a standalone instalací.
        Spouštěj, sleduj herní čas a prohlíži store — vše na jednom místě.
      </p>
      <div class="hero-btns">
        <a href="#download" class="btn btn-primary btn-lg">
          ⬇ Stáhnout zdarma
          <span class="btn-sub">Windows 10/11 · ~15 MB</span>
        </a>
        <a href="https://github.com/ZeddiS/zeddigames" target="_blank" class="btn btn-ghost btn-lg">
          GitHub →
        </a>
      </div>
      <div class="hero-screenshot">
        <img src="/games/assets/screenshot.png" alt="ZeddiGames Launcher screenshot"
             onerror="this.style.display='none'">
      </div>
    </div>
  </section>

  <!-- FEATURES -->
  <section class="section" id="features">
    <div class="container">
      <div class="section-header">
        <h2>Proč ZeddiGames?</h2>
        <p>Inspirováno Steam Clientem, ale bez limitů.</p>
      </div>
      <div class="features-grid">
        <?php
        $features = [
          ["🎯", "Auto-detekce her",      "Automaticky najde hry ze Steamu, Epicu, GOGu a standalone EXE souborů."],
          ["🏪", "Herní obchod",           "Prohlíž 500 000+ her přes RAWG.io API s hodnoceními a metadaty."],
          ["👥", "Steam komunita",         "Zobraz svůj profil, přátele a achievementy přímo z Steam Web API."],
          ["⬇", "Download manager",       "Stahuj hry přes SteamCMD — officiální Valve nástroj, zcela legální."],
          ["⏱", "Sledování herního času", "Přesné statistiky pro každou hru bez ohledu na platformu."],
          ["🔔", "Auto-aktualizace",       "Launcher se aktualizuje automaticky při každém spuštění."],
          ["🎨", "3 témata",              "Steam Dark, Light nebo ZeddiGames Orange — vyber si svůj styl."],
          ["🔐", "ZeddiGames účet",        "Registrace s online profilem, sdílením statistik a herní historií."],
        ];
        foreach ($features as [$icon, $title, $desc]):
        ?>
        <div class="feature-card">
          <div class="feature-icon"><?= $icon ?></div>
          <h3><?= $title ?></h3>
          <p><?= $desc ?></p>
        </div>
        <?php endforeach; ?>
      </div>
    </div>
  </section>

  <!-- DOWNLOAD -->
  <section class="section section-dark" id="download">
    <div class="container download-section">
      <h2>Stáhnout ZeddiGames Launcher</h2>
      <p>Zdarma, bezpečné, open-source. Vyžaduje Windows 10 nebo novější.</p>
      <div class="download-cards">
        <div class="download-card primary">
          <div class="dl-icon">🪟</div>
          <h3>Windows x64</h3>
          <p>Instalátor (.exe) · ~15 MB</p>
          <a href="https://github.com/ZeddiS/zeddigames/releases/latest/download/ZeddiGames_Launcher_0.1.0_x64-setup.exe"
             class="btn btn-primary">
            Stáhnout (.exe)
          </a>
        </div>
        <div class="download-card">
          <div class="dl-icon">📦</div>
          <h3>Windows MSI</h3>
          <p>MSI balíček · enterprise install</p>
          <a href="https://github.com/ZeddiS/zeddigames/releases/latest/download/ZeddiGames_Launcher_0.1.0_x64_en-US.msi"
             class="btn btn-ghost">
            Stáhnout (.msi)
          </a>
        </div>
      </div>
      <p class="dl-note">
        📝 Open source na
        <a href="https://github.com/ZeddiS/zeddigames" target="_blank">GitHub</a> ·
        Žádný spyware · MIT licence
      </p>
    </div>
  </section>

  <!-- FOOTER -->
  <footer class="footer">
    <div class="container footer-inner">
      <div class="footer-logo">
        <img src="/games/assets/logo2.png" alt="ZeddiGames" class="logo-img">
        <span>ZeddiGames</span>
      </div>
      <div class="footer-links">
        <a href="/games/changelog.php">Changelog</a>
        <a href="https://github.com/ZeddiS/zeddigames" target="_blank">GitHub</a>
        <a href="https://zeddihub.eu" target="_blank">ZeddiHub</a>
        <a href="/games/admin/" class="admin-link">Admin</a>
      </div>
      <p class="footer-copy">© <?= date('Y') ?> ZeddiGames · Část ZeddiHub ekosystému</p>
    </div>
  </footer>

  <script src="/games/assets/js/main.js"></script>
</body>
</html>
