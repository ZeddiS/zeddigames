<!DOCTYPE html>
<html lang="cs">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Přihlášení — ZeddiGames</title>
  <link rel="icon" href="/games/assets/favicon.ico">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="/games/assets/css/style.css">
</head>
<body>
  <nav class="navbar">
    <div class="container nav-inner">
      <a href="/games/" class="nav-logo">
        <img src="/games/assets/logo2.png" alt="ZeddiGames" class="logo-img">
        <span>ZeddiGames</span>
      </a>
    </div>
  </nav>

  <div class="auth-page">
    <div class="auth-card">
      <div class="auth-header">
        <img src="/games/assets/logo2.png" alt="ZeddiGames">
        <h1>Přihlásit se</h1>
        <p>Přihlás se ke svému ZeddiGames účtu</p>
      </div>
      <div class="auth-body">
        <div id="error-msg" class="form-error" style="display:none">
          <span>⚠</span><span id="error-text"></span>
        </div>
        <form id="login-form">
          <div class="form-group">
            <label>E-Mail</label>
            <input type="email" name="email" class="form-input" placeholder="tvuj@email.cz" required>
          </div>
          <div class="form-group">
            <label>Heslo</label>
            <input type="password" name="password" class="form-input" placeholder="••••••••" required>
          </div>
          <button type="submit" class="btn btn-primary form-submit" id="submit-btn">
            Přihlásit se
          </button>
        </form>
      </div>
      <div class="auth-footer">
        Nemáš účet? <a href="/games/register.php">Registrovat se</a>
      </div>
    </div>
  </div>

  <script>
    document.getElementById('login-form').addEventListener('submit', async e => {
      e.preventDefault();
      const btn = document.getElementById('submit-btn');
      const errDiv = document.getElementById('error-msg');
      const errTxt = document.getElementById('error-text');
      btn.textContent = 'Přihlašuji...'; btn.disabled = true;
      errDiv.style.display = 'none';

      const fd = new FormData(e.target);
      try {
        const res = await fetch('/games/api/auth.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'login', email: fd.get('email'), password: fd.get('password') })
        });
        const data = await res.json();
        if (data.success) {
          localStorage.setItem('zg_token', data.token);
          localStorage.setItem('zg_user',  JSON.stringify(data.user));
          window.location.href = '/games/profile.php';
        } else {
          errTxt.textContent = data.message; errDiv.style.display = 'flex';
        }
      } catch { errTxt.textContent = 'Chyba spojení se serverem.'; errDiv.style.display = 'flex'; }
      finally { btn.textContent = 'Přihlásit se'; btn.disabled = false; }
    });
  </script>
</body>
</html>
