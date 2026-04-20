<!DOCTYPE html>
<html lang="cs">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Přihlášení — ZeddiGames</title>
  <link rel="icon" type="image/x-icon" href="/games/assets/favicon.ico">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="/games/assets/css/style.css">
  <style>
    body { background: #0d1117; }
    .auth-page { min-height: calc(100vh - 55px); }
    .auth-card { box-shadow: 0 20px 60px rgba(0,0,0,.6); }
    .or-divider { display: flex; align-items: center; gap: 12px; margin: 16px 0; color: #8b949e; font-size: 12px; }
    .or-divider::before, .or-divider::after { content:''; flex:1; height:1px; background:#30363d; }
    .input-icon-wrap { position: relative; }
    .input-icon-wrap svg { position:absolute; left:12px; top:50%; transform:translateY(-50%); width:16px; height:16px; stroke:#8b949e; fill:none; stroke-width:2; pointer-events:none; }
    .input-icon-wrap .form-input { padding-left: 38px; }
    .eye-btn { position:absolute; right:12px; top:50%; transform:translateY(-50%); background:none; border:none; cursor:pointer; padding:0; color:#8b949e; }
    .eye-btn:hover { color:#e6edf3; }
    .forgot-link { font-size:12px; color:#8b949e; text-decoration:none; float:right; margin-top:-20px; margin-bottom:8px; display:block; text-align:right; }
    .forgot-link:hover { color:#ff6b00; }
    .success-banner { background:rgba(35,197,97,.12); border:1px solid rgba(35,197,97,.3); border-radius:8px; padding:10px 14px; font-size:14px; color:#3fb950; margin-bottom:16px; display:flex; align-items:center; gap:8px; }
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
        <a href="/games/register.php" class="btn btn-primary">Registrovat se</a>
      </div>
    </div>
  </nav>

  <div class="auth-page">
    <div class="auth-card">
      <div class="auth-header">
        <img src="/games/assets/logo2.png" alt="ZeddiGames">
        <h1>Vítej zpět</h1>
        <p>Přihlas se ke svému ZeddiGames účtu</p>
      </div>
      <div class="auth-body">

        <?php if (isset($_GET['registered'])): ?>
        <div class="success-banner">✅ Registrace proběhla! Nyní se přihlas.</div>
        <?php endif; ?>

        <div id="error-msg" class="form-error" style="display:none">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          <span id="error-text"></span>
        </div>

        <form id="login-form">
          <div class="form-group">
            <label>Přezdívka nebo E-Mail</label>
            <div class="input-icon-wrap">
              <svg viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              <input type="text" name="login" class="form-input" placeholder="TvůjNick nebo tvuj@email.cz" autocomplete="username" required>
            </div>
          </div>
          <div class="form-group">
            <label>Heslo</label>
            <div class="input-icon-wrap">
              <svg viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              <input type="password" name="password" id="pw-input" class="form-input" placeholder="••••••••" autocomplete="current-password" required>
              <button type="button" class="eye-btn" id="eye-btn" title="Zobrazit heslo">
                <svg id="eye-icon" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
              </button>
            </div>
          </div>

          <div style="display:flex; justify-content:flex-end; margin-bottom:16px;">
            <a href="/games/forgot.php" class="forgot-link" style="margin:0">Zapomněl/a jsi heslo?</a>
          </div>

          <button type="submit" class="btn btn-primary form-submit" id="submit-btn">
            Přihlásit se
          </button>
        </form>

        <div class="or-divider">nebo</div>

        <a href="/games/register.php" class="btn btn-ghost form-submit" style="width:100%;justify-content:center">
          Vytvořit nový účet
        </a>
      </div>
    </div>
  </div>

  <script>
    // Eye toggle
    document.getElementById('eye-btn').addEventListener('click', function() {
      const inp = document.getElementById('pw-input');
      inp.type = inp.type === 'password' ? 'text' : 'password';
    });

    // Login submit
    document.getElementById('login-form').addEventListener('submit', async e => {
      e.preventDefault();
      const btn     = document.getElementById('submit-btn');
      const errDiv  = document.getElementById('error-msg');
      const errTxt  = document.getElementById('error-text');
      const fd      = new FormData(e.target);
      errDiv.style.display = 'none';
      btn.textContent = 'Přihlašuji...';
      btn.disabled    = true;

      try {
        const res  = await fetch('/games/api/auth.php', {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify({ action: 'login', login: fd.get('login'), password: fd.get('password') })
        });
        const data = await res.json();
        if (data.success) {
          localStorage.setItem('zg_token', data.token);
          localStorage.setItem('zg_user',  JSON.stringify(data.user));
          const redirect = new URLSearchParams(location.search).get('redirect') || '/games/profile.php';
          window.location.href = redirect;
        } else {
          errTxt.textContent   = data.message;
          errDiv.style.display = 'flex';
        }
      } catch {
        errTxt.textContent   = 'Nepodařilo se spojit se serverem. Zkus to znovu.';
        errDiv.style.display = 'flex';
      } finally {
        btn.textContent = 'Přihlásit se';
        btn.disabled    = false;
      }
    });
  </script>
</body>
</html>
