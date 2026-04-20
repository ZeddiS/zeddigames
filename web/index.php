<!DOCTYPE html>
<html lang="cs">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ZeddiGames Launcher — Všechny hry na jednom místě</title>
  <meta name="description" content="ZeddiGames Launcher automaticky detekuje a spouští tvoje hry ze Steamu, Epicu, GOGu a dalších. Zdarma, pro Windows.">
  <meta property="og:title" content="ZeddiGames Launcher">
  <meta property="og:description" content="Tvoje herní platforma. Zdarma.">
  <meta property="og:image" content="https://zeddihub.eu/games/assets/logo2.png">
  <link rel="icon" type="image/x-icon" href="/games/assets/favicon.ico">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="/games/assets/css/style.css">
</head>
<body>

<!-- ═══ NAVBAR ═══════════════════════════════════════════════════════════════ -->
<nav class="navbar">
  <div class="container nav-inner">
    <a href="/games/" class="nav-logo">
      <img src="/games/assets/logo2.png" alt="ZeddiGames" class="logo-img">
      <span>ZeddiGames</span>
    </a>
    <div class="nav-links">
      <a href="/games/#features">Funkce</a>
      <a href="/games/changelog.php">Co je nového</a>
      <a href="https://github.com/ZeddiS/zeddigames" target="_blank" rel="noopener">GitHub</a>
      <a href="/games/login.php" class="btn btn-ghost">Přihlásit se</a>
      <a href="/games/#download" class="btn btn-primary">⬇ Stáhnout</a>
    </div>
    <button class="nav-mobile-btn" id="nav-toggle" aria-label="Menu">
      <span></span><span></span><span></span>
    </button>
  </div>
</nav>

<!-- ═══ HERO ══════════════════════════════════════════════════════════════════ -->
<section class="hero">
  <div class="hero-glow"></div>
  <div class="container hero-content">

    <div class="hero-badge">
      <span class="badge-dot"></span>
      Verze 0.1.0 · Zdarma pro Windows
    </div>

    <h1 class="hero-title">
      Všechny tvoje hry.<br>
      <span class="gradient-text">Jedna platforma.</span>
    </h1>

    <p class="hero-desc">
      ZeddiGames Launcher shromáždí hry z&nbsp;každé platformy do jednoho místa.
      Steam, Epic, GOG i&nbsp;standalone hry — spouštěj je bez přepínání.
    </p>

    <div class="hero-btns">
      <a href="#download" class="btn btn-primary btn-lg">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
        Stáhnout zdarma
        <span class="btn-sub">Windows 10/11 · 64-bit</span>
      </a>
      <a href="#features" class="btn btn-ghost btn-lg">
        Zjistit více
      </a>
    </div>

    <div class="hero-platforms">
      <span>Funguje s:</span>
      <div class="platform-tags">
        <span class="ptag steam">Steam</span>
        <span class="ptag epic">Epic Games</span>
        <span class="ptag gog">GOG</span>
        <span class="ptag standalone">Standalone</span>
      </div>
    </div>

  </div>
</section>

<!-- ═══ STATS BAR ═════════════════════════════════════════════════════════════ -->
<div class="stats-bar">
  <div class="container stats-inner">
    <div class="stat-item"><strong>500 000+</strong><span>Her v obchodě</span></div>
    <div class="stat-sep"></div>
    <div class="stat-item"><strong>4</strong><span>Herní platformy</span></div>
    <div class="stat-sep"></div>
    <div class="stat-item"><strong>~15 MB</strong><span>Velikost instalace</span></div>
    <div class="stat-sep"></div>
    <div class="stat-item"><strong>Zdarma</strong><span>Navždy</span></div>
  </div>
</div>

<!-- ═══ FEATURES ══════════════════════════════════════════════════════════════ -->
<section class="section" id="features">
  <div class="container">
    <div class="section-header">
      <div class="section-label">Funkce</div>
      <h2>Vše, co potřebuješ pro svou herní kolekci</h2>
      <p>Navrženo pro hráče, kteří mají hry na více platformách a nechtějí je spravovat zvlášť.</p>
    </div>

    <div class="features-grid">
      <div class="feature-card featured">
        <div class="feature-icon-wrap">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
        </div>
        <h3>Automatická detekce her</h3>
        <p>Spusť a hotovo — launcher sám najde všechny nainstalované hry ze Steamu, Epicu, GOGu i volně stažené programy.</p>
      </div>
      <div class="feature-card">
        <div class="feature-icon-wrap">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
        </div>
        <h3>Herní obchod</h3>
        <p>Prohlíž přes 500 000 titulů s hodnoceními, screenshoty a popisem — přímo v launcheru.</p>
      </div>
      <div class="feature-card">
        <div class="feature-icon-wrap">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
        </div>
        <h3>Steam komunita</h3>
        <p>Zobraz svůj Steam profil, přátele a achievementy bez nutnosti otevírat Steam Client.</p>
      </div>
      <div class="feature-card">
        <div class="feature-icon-wrap">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
        </div>
        <h3>Sledování herního času</h3>
        <p>Přesné statistiky pro každou hru bez ohledu na platformu. Kolik hodin jsi strávil v každém světě?</p>
      </div>
      <div class="feature-card">
        <div class="feature-icon-wrap">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
        </div>
        <h3>Stahování her</h3>
        <p>Stahuj Steam hry přímo přes launcher pomocí SteamCMD — oficiálního nástroje od Valve.</p>
      </div>
      <div class="feature-card">
        <div class="feature-icon-wrap">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93A10 10 0 0 0 4.93 19.07m14.14 0A10 10 0 0 0 4.93 4.93"/></svg>
        </div>
        <h3>Automatické aktualizace</h3>
        <p>Launcher se aktualizuje sám, vždy v pozadí. Žádné ruční stahování nových verzí.</p>
      </div>
      <div class="feature-card">
        <div class="feature-icon-wrap">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg>
        </div>
        <h3>3 barevná témata</h3>
        <p>Steam Dark, světlý režim nebo ZeddiGames Orange — přizpůsob si launcher svému stylu.</p>
      </div>
      <div class="feature-card">
        <div class="feature-icon-wrap">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
        </div>
        <h3>ZeddiGames účet</h3>
        <p>Zaregistruj se zdarma a získej online profil s herními statistikami přístupný odevšud.</p>
      </div>
    </div>
  </div>
</section>

<!-- ═══ DOWNLOAD ══════════════════════════════════════════════════════════════ -->
<section class="section section-dark" id="download">
  <div class="container">
    <div class="section-header">
      <div class="section-label">Stažení</div>
      <h2>Stáhni ZeddiGames Launcher</h2>
      <p>Zdarma. Bez reklam. Bez telemetrie. Funguje na Windows 10 a novějším.</p>
    </div>

    <div class="download-cards">
      <div class="download-card primary">
        <div class="dl-os">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor"><path d="M0 3.449L9.75 2.1v9.451H0m10.949-9.602L24 0v11.4H10.949M0 12.6h9.75v9.451L0 20.699M10.949 12.6H24V24l-12.9-1.801"/></svg>
        </div>
        <h3>Windows</h3>
        <p class="dl-ver">Verze 0.1.0 · Windows 10/11 · 64-bit</p>
        <div class="dl-btns">
          <a href="https://github.com/ZeddiS/zeddigames/releases/latest/download/ZeddiGames_Launcher_0.1.0_x64-setup.exe"
             class="btn btn-primary">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            Instalátor (.exe)
          </a>
          <a href="https://github.com/ZeddiS/zeddigames/releases/latest/download/ZeddiGames_Launcher_0.1.0_x64_en-US.msi"
             class="btn btn-ghost">MSI balíček</a>
        </div>
      </div>
    </div>

    <p class="dl-note">
      🔒 Open-source na <a href="https://github.com/ZeddiS/zeddigames" target="_blank">GitHubu</a> ·
      Žádný malware · MIT licence ·
      <a href="/games/changelog.php">Co je nového v 0.1.0</a>
    </p>
  </div>
</section>

<!-- ═══ CTA ═══════════════════════════════════════════════════════════════════ -->
<section class="section cta-section">
  <div class="container cta-inner">
    <img src="/games/assets/logo2.png" alt="" class="cta-logo">
    <div>
      <h2>Připoj se ke ZeddiGames komunitě</h2>
      <p>Zaregistruj se zdarma a získej přístup k online profilu, herním statistikám a dalším funkcím.</p>
    </div>
    <div class="cta-btns">
      <a href="/games/register.php" class="btn btn-primary btn-lg">Registrovat se zdarma</a>
      <a href="/games/login.php" class="btn btn-ghost btn-lg">Přihlásit se</a>
    </div>
  </div>
</section>

<!-- ═══ FOOTER ════════════════════════════════════════════════════════════════ -->
<footer class="footer">
  <div class="container">
    <div class="footer-top">
      <div class="footer-brand">
        <a href="/games/" class="nav-logo">
          <img src="/games/assets/logo2.png" alt="ZeddiGames" class="logo-img">
          <span>ZeddiGames</span>
        </a>
        <p>Tvoje herní platforma.<br>Součást <a href="https://zeddihub.eu" target="_blank">ZeddiHub</a> ekosystému.</p>
      </div>
      <div class="footer-col">
        <h4>Launcher</h4>
        <a href="/games/#features">Funkce</a>
        <a href="/games/#download">Stáhnout</a>
        <a href="/games/changelog.php">Changelog</a>
      </div>
      <div class="footer-col">
        <h4>Účet</h4>
        <a href="/games/login.php">Přihlásit se</a>
        <a href="/games/register.php">Registrovat se</a>
        <a href="/games/profile.php">Můj profil</a>
      </div>
      <div class="footer-col">
        <h4>Ostatní</h4>
        <a href="https://github.com/ZeddiS/zeddigames" target="_blank">GitHub</a>
        <a href="https://zeddihub.eu" target="_blank">ZeddiHub</a>
        <a href="https://zeddihub.eu/tools/" target="_blank">ZeddiHub Tools</a>
      </div>
    </div>
    <div class="footer-bottom">
      <p>© <?= date('Y') ?> ZeddiGames · Vytvořeno s ❤ v Česku</p>
      <a href="/games/admin/" class="admin-link">Admin</a>
    </div>
  </div>
</footer>

<script src="/games/assets/js/main.js"></script>
</body>
</html>
