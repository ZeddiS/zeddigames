-- ZeddiGames Launcher — Databázová schéma
-- Spusť v phpMyAdmin: vyber databázi vojtechc_AWP, pak importuj tento soubor
-- POZOR: Nevytvářej novou databázi — použij tu přidělenou hostingem!

-- Uživatelé
CREATE TABLE IF NOT EXISTS zg_users (
    id            INT AUTO_INCREMENT PRIMARY KEY,
    nickname      VARCHAR(30)  NOT NULL UNIQUE,
    email         VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role          ENUM('user','premium','moderator','admin') NOT NULL DEFAULT 'user',
    avatar_url    VARCHAR(500)  NULL,
    bio           TEXT          NULL,
    created_at    DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_login    DATETIME      NULL,
    is_banned     TINYINT(1)    NOT NULL DEFAULT 0,
    INDEX idx_email    (email),
    INDEX idx_nickname (nickname)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Session tokeny
CREATE TABLE IF NOT EXISTS zg_tokens (
    id         INT AUTO_INCREMENT PRIMARY KEY,
    user_id    INT         NOT NULL,
    token      VARCHAR(64) NOT NULL UNIQUE,
    created_at DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expires_at DATETIME    NOT NULL,
    FOREIGN KEY (user_id) REFERENCES zg_users(id) ON DELETE CASCADE,
    INDEX idx_token (token)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Verze / changelog (pro auto-updater)
CREATE TABLE IF NOT EXISTS zg_versions (
    id           INT AUTO_INCREMENT PRIMARY KEY,
    version      VARCHAR(20)  NOT NULL,
    release_date DATE         NOT NULL,
    notes        TEXT         NULL,
    download_url VARCHAR(500) NULL,
    is_latest    TINYINT(1)   NOT NULL DEFAULT 0,
    created_at   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Uživatelské stats (sync z launcheru)
CREATE TABLE IF NOT EXISTS zg_user_stats (
    user_id     INT   NOT NULL PRIMARY KEY,
    total_games INT   NOT NULL DEFAULT 0,
    total_hours FLOAT NOT NULL DEFAULT 0,
    last_sync   DATETIME NULL,
    FOREIGN KEY (user_id) REFERENCES zg_users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- První verze v changelogu
INSERT IGNORE INTO zg_versions (version, release_date, notes, download_url, is_latest)
VALUES (
    '0.1.0',
    '2026-04-20',
    'První vydání ZeddiGames Launcheru.',
    'https://github.com/ZeddiS/zeddigames/releases/latest/download/ZeddiGames_Launcher_0.1.0_x64-setup.exe',
    1
);
