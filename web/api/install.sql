-- ZeddiGames Launcher — Databázová schéma
-- Spusť jednou na svém serveru v phpMyAdmin nebo přes SSH

CREATE DATABASE IF NOT EXISTS zeddihub_games CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE zeddihub_games;

-- Uživatelé
CREATE TABLE IF NOT EXISTS zg_users (
    id           INT AUTO_INCREMENT PRIMARY KEY,
    nickname     VARCHAR(30)  NOT NULL UNIQUE,
    email        VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role         ENUM('user','premium','moderator','admin') NOT NULL DEFAULT 'user',
    avatar_url   VARCHAR(500)  NULL,
    bio          TEXT          NULL,
    created_at   DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_login   DATETIME      NULL,
    is_banned    TINYINT(1)    NOT NULL DEFAULT 0,
    INDEX idx_email (email),
    INDEX idx_nickname (nickname)
) ENGINE=InnoDB;

-- Session tokeny
CREATE TABLE IF NOT EXISTS zg_tokens (
    id         INT AUTO_INCREMENT PRIMARY KEY,
    user_id    INT          NOT NULL,
    token      VARCHAR(64)  NOT NULL UNIQUE,   -- SHA-256 hash tokenu
    created_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expires_at DATETIME     NOT NULL,
    FOREIGN KEY (user_id) REFERENCES zg_users(id) ON DELETE CASCADE,
    INDEX idx_token (token)
) ENGINE=InnoDB;

-- Verze / changelog
CREATE TABLE IF NOT EXISTS zg_versions (
    id           INT AUTO_INCREMENT PRIMARY KEY,
    version      VARCHAR(20)  NOT NULL,
    release_date DATE         NOT NULL,
    notes        TEXT         NULL,
    download_url VARCHAR(500) NULL,
    is_latest    TINYINT(1)   NOT NULL DEFAULT 0,
    created_at   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Uživatelské stats (sync z launcheru)
CREATE TABLE IF NOT EXISTS zg_user_stats (
    user_id      INT   NOT NULL PRIMARY KEY,
    total_games  INT   NOT NULL DEFAULT 0,
    total_hours  FLOAT NOT NULL DEFAULT 0,
    last_sync    DATETIME NULL,
    FOREIGN KEY (user_id) REFERENCES zg_users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Admin: defaultní admin účet (vyměň heslo!)
-- Heslo: Admin1234  (bcrypt hash)
INSERT IGNORE INTO zg_users (nickname, email, password_hash, role)
VALUES ('Admin', 'admin@zeddihub.eu', '$2y$12$examplehashReplaceThis', 'admin');
