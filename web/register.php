<!DOCTYPE html>
<html lang="cs">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Registrace — ZeddiGames</title>
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
        <h1>Vytvořit účet</h1>
        <p>Připoj se k ZeddiGames komunitě</p>
      </div>
      <div class="auth-body">
        <div id="error-msg" class="form-error" style="display:none">
          <span>⚠</span><span id="error-text"></span>
        </div>
        <form id="register-form">
          <div class="form-group">
            <label>Přezdívka</label>
            <input type="text" name="nickname" class="form-input" placeholder="TvůjNick" minlength="3" maxlength="30" required>
          </div>
          <div class="form-group">
            <label>E-Mail</label>
            <input type="email" name="email" class="form-input" placeholder="tvuj@email.cz" required>
          </div>
          <div class="form-group">
            <label>Heslo <span style="opacity:.5;font-weight:400">(min. 8 znaků)</span></label>
            <input type="password" name="password" class="form-input" placeholder="••••••••" minlength="8" required>
          </div>
          <div class="form-group">
            <label>Potvrdit heslo</label>
            <input type="password" name="confirm" class="form-input" placeholder="Zopakuj heslo" required>
          </div>
          <button type="submit" class="btn btn-primary form-submit" id="submit-btn">
            Vytvořit účet
          </button>
        </form>
      </div>
      <div class="auth-footer">
        Máš účet? <a href="/games/login.php">Přihlásit se</a>
      </div>
    </div>
  </div>

  <script>
    document.getElementById('register-form').addEventListener('submit', async e => {
      e.preventDefault();
      const btn = document.getElementById('submit-btn');
      const errDiv = document.getElementById('error-msg');
      const errTxt = document.getElementById('error-text');
      const fd = new FormData(e.target);
      errDiv.style.display = 'none';

      if (fd.get('password') !== fd.get('confirm')) {
        errTxt.textContent = 'Hesla se neshodují.'; errDiv.style.display = 'flex'; return;
      }
      btn.textContent = 'Registruji...'; btn.disabled = true;
      try {
        const res = await fetch('/games/api/auth.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action:'register', nickname:fd.get('nickname'), email:fd.get('email'), password:fd.get('password') })
        });
        const data = await res.json();
        if (data.success) {
          window.location.href = '/games/login.php?registered=1';
        } else {
          errTxt.textContent = data.message; errDiv.style.display = 'flex';
        }
      } catch { errTxt.textContent = 'Chyba serveru.'; errDiv.style.display = 'flex'; }
      finally { btn.textContent = 'Vytvořit účet'; btn.disabled = false; }
    });
  </script>
</body>
</html>
