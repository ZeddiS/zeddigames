# ZeddiGames Launcher

> Unifikovaná herní platforma — Steam, Epic, GOG a standalone hry na jednom místě.

![Version](https://img.shields.io/badge/version-0.1.0-ff6b00)
![Platform](https://img.shields.io/badge/platform-Windows-blue)
![License](https://img.shields.io/badge/license-MIT-green)

## ✨ Funkce

- 🎯 **Auto-detekce her** — Steam, Epic, GOG, standalone EXE
- 🏪 **Herní obchod** — 500 000+ her přes RAWG.io API
- 👥 **Steam komunita** — profil, přátelé, achievementy
- ⬇ **Download manager** — SteamCMD integrace
- ⏱ **Sledování herního času** — pro všechny platformy
- 🔔 **Auto-aktualizace** — z GitHub Releases
- 🎨 **3 témata** — Steam Dark, Light, ZeddiGames Orange
- 🔐 **ZeddiGames účet** — registrace s rolemi (user, premium, moderator, admin)

## 🚀 Stažení

👉 [Nejnovější verze](https://github.com/ZeddiS/zeddigames/releases/latest)

## 🛠️ Technologie

| Vrstva | Tech |
|--------|------|
| Frontend | React 19 + TypeScript + Tailwind CSS v4 |
| Backend | Rust + Tauri 2.0 |
| Databáze | SQLite (rusqlite bundled) |
| HTTP | reqwest (rustls-tls) |
| Web | PHP 8 + MySQL |

## 🔧 Vývoj

```bash
# Požadavky: Rust (MSVC toolchain), Node.js 20+

# Spustit dev server (Windows)
dev.bat

# nebo manuálně:
npm run tauri dev
```

## 🌐 Web

Web je dostupný na [zeddihub.eu/games](https://zeddihub.eu/games/)

## 📁 Struktura projektu

```
zeddigames/
  src/            # React frontend
  src-tauri/      # Rust/Tauri backend
  web/            # PHP web pro zeddihub.eu/games/
    api/          # PHP API (auth, version)
    admin/        # Admin panel
  public/         # Statické soubory
```

## 📄 Licence

MIT — ZeddiGames je součást [ZeddiHub](https://zeddihub.eu) ekosystému.
