use rusqlite::{Connection, Result, params};
use serde::{Deserialize, Serialize};
use std::sync::Mutex;
use crate::AppSettings;
use crate::PlaytimeStat;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Game {
    pub id: i64,
    pub title: String,
    pub executable: String,
    pub install_dir: String,
    pub platform: String,
    pub platform_id: Option<String>,
    pub cover_url: Option<String>,
    pub description: Option<String>,
    pub genre: Option<String>,
    pub developer: Option<String>,
    pub release_date: Option<String>,
    pub last_played: Option<String>,
    pub playtime_hours: f64,
    pub added_at: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Collection {
    pub id: i64,
    pub name: String,
    pub color: String,
    pub game_count: i64,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct PlaytimeSession {
    pub id: i64,
    pub game_id: i64,
    pub session_start: i64,
    pub session_end: Option<i64>,
    pub duration_sec: Option<i64>,
}

pub struct Database(pub Mutex<Connection>);

impl Database {
    pub fn new(path: &str) -> Result<Self> {
        let conn = Connection::open(path)?;
        let db = Database(Mutex::new(conn));
        db.initialize()?;
        Ok(db)
    }

    fn initialize(&self) -> Result<()> {
        let conn = self.0.lock().unwrap();
        conn.execute_batch("
            PRAGMA journal_mode=WAL;
            PRAGMA foreign_keys=ON;

            CREATE TABLE IF NOT EXISTS games (
                id           INTEGER PRIMARY KEY AUTOINCREMENT,
                title        TEXT    NOT NULL,
                executable   TEXT    NOT NULL,
                install_dir  TEXT    DEFAULT '',
                platform     TEXT    DEFAULT 'standalone',
                platform_id  TEXT,
                cover_url    TEXT,
                description  TEXT,
                genre        TEXT,
                developer    TEXT,
                release_date TEXT,
                last_played  TEXT,
                added_at     TEXT DEFAULT (datetime('now'))
            );

            CREATE TABLE IF NOT EXISTS playtime (
                id              INTEGER PRIMARY KEY AUTOINCREMENT,
                game_id         INTEGER NOT NULL REFERENCES games(id) ON DELETE CASCADE,
                session_start   INTEGER NOT NULL,
                session_end     INTEGER,
                duration_sec    INTEGER
            );

            CREATE TABLE IF NOT EXISTS collections (
                id    INTEGER PRIMARY KEY AUTOINCREMENT,
                name  TEXT NOT NULL UNIQUE,
                color TEXT DEFAULT '#6366f1'
            );

            CREATE TABLE IF NOT EXISTS collection_games (
                collection_id INTEGER NOT NULL REFERENCES collections(id) ON DELETE CASCADE,
                game_id       INTEGER NOT NULL REFERENCES games(id) ON DELETE CASCADE,
                PRIMARY KEY (collection_id, game_id)
            );

            CREATE TABLE IF NOT EXISTS tags (
                id   INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT UNIQUE NOT NULL
            );

            CREATE TABLE IF NOT EXISTS game_tags (
                game_id INTEGER NOT NULL REFERENCES games(id) ON DELETE CASCADE,
                tag_id  INTEGER NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
                PRIMARY KEY (game_id, tag_id)
            );

            CREATE TABLE IF NOT EXISTS achievements (
                id          INTEGER PRIMARY KEY AUTOINCREMENT,
                game_id     INTEGER NOT NULL REFERENCES games(id) ON DELETE CASCADE,
                name        TEXT NOT NULL,
                description TEXT,
                icon_url    TEXT,
                unlocked_at TEXT
            );

            CREATE TABLE IF NOT EXISTS settings (
                key   TEXT PRIMARY KEY,
                value TEXT NOT NULL DEFAULT ''
            );
        ")?;
        Ok(())
    }

    pub fn get_settings(&self) -> Result<AppSettings> {
        let conn = self.0.lock().unwrap();
        let mut stmt = conn.prepare("SELECT key, value FROM settings")?;
        let mut map = std::collections::HashMap::new();
        let rows = stmt.query_map([], |row| {
            Ok((row.get::<_, String>(0)?, row.get::<_, String>(1)?))
        })?;
        for row in rows { if let Ok((k, v)) = row { map.insert(k, v); } }

        Ok(AppSettings {
            steam_api_key: map.get("steam_api_key").cloned().unwrap_or_default(),
            steam_id: map.get("steam_id").cloned().unwrap_or_default(),
            steam_username: map.get("steam_username").cloned().unwrap_or_default(),
            rawg_api_key: map.get("rawg_api_key").cloned().unwrap_or_default(),
            default_install_dir: map.get("default_install_dir").cloned().unwrap_or_default(),
            auto_scan_on_start: map.get("auto_scan_on_start").map(|v| v == "true").unwrap_or(false),
        })
    }

    pub fn save_settings(&self, s: &AppSettings) -> Result<()> {
        let conn = self.0.lock().unwrap();
        let pairs = [
            ("steam_api_key", &s.steam_api_key),
            ("steam_id", &s.steam_id),
            ("steam_username", &s.steam_username),
            ("rawg_api_key", &s.rawg_api_key),
            ("default_install_dir", &s.default_install_dir),
        ];
        for (k, v) in pairs {
            conn.execute(
                "INSERT INTO settings (key, value) VALUES (?1, ?2) ON CONFLICT(key) DO UPDATE SET value = ?2",
                params![k, v],
            )?;
        }
        conn.execute(
            "INSERT INTO settings (key, value) VALUES ('auto_scan_on_start', ?1) ON CONFLICT(key) DO UPDATE SET value = ?1",
            params![if s.auto_scan_on_start { "true" } else { "false" }],
        )?;
        Ok(())
    }

    pub fn get_game_by_id(&self, game_id: i64) -> Result<Option<Game>> {
        let conn = self.0.lock().unwrap();
        let mut stmt = conn.prepare("
            SELECT g.id, g.title, g.executable, g.install_dir, g.platform,
                   g.platform_id, g.cover_url, g.description, g.genre, g.developer,
                   g.release_date, g.last_played, g.added_at,
                   COALESCE(SUM(p.duration_sec), 0) / 3600.0
            FROM games g
            LEFT JOIN playtime p ON p.game_id = g.id AND p.duration_sec IS NOT NULL
            WHERE g.id = ?1 GROUP BY g.id
        ")?;
        let result = stmt.query_row(params![game_id], |row| {
            Ok(Game {
                id: row.get(0)?, title: row.get(1)?, executable: row.get(2)?,
                install_dir: row.get(3)?, platform: row.get(4)?,
                platform_id: row.get(5)?, cover_url: row.get(6)?,
                description: row.get(7)?, genre: row.get(8)?, developer: row.get(9)?,
                release_date: row.get(10)?, last_played: row.get(11)?,
                added_at: row.get(12)?, playtime_hours: row.get(13)?,
            })
        });
        match result {
            Ok(g) => Ok(Some(g)),
            Err(rusqlite::Error::QueryReturnedNoRows) => Ok(None),
            Err(e) => Err(e),
        }
    }

    pub fn add_to_collection(&self, collection_id: i64, game_id: i64) -> Result<()> {
        let conn = self.0.lock().unwrap();
        conn.execute(
            "INSERT OR IGNORE INTO collection_games (collection_id, game_id) VALUES (?1, ?2)",
            params![collection_id, game_id],
        )?;
        Ok(())
    }

    pub fn get_games_in_collection(&self, collection_id: i64) -> Result<Vec<Game>> {
        let conn = self.0.lock().unwrap();
        let mut stmt = conn.prepare("
            SELECT g.id, g.title, g.executable, g.install_dir, g.platform,
                   g.platform_id, g.cover_url, g.description, g.genre, g.developer,
                   g.release_date, g.last_played, g.added_at,
                   COALESCE(SUM(p.duration_sec), 0) / 3600.0
            FROM games g
            JOIN collection_games cg ON cg.game_id = g.id
            LEFT JOIN playtime p ON p.game_id = g.id AND p.duration_sec IS NOT NULL
            WHERE cg.collection_id = ?1 GROUP BY g.id ORDER BY g.title
        ")?;
        let games = stmt.query_map(params![collection_id], |row| {
            Ok(Game {
                id: row.get(0)?, title: row.get(1)?, executable: row.get(2)?,
                install_dir: row.get(3)?, platform: row.get(4)?,
                platform_id: row.get(5)?, cover_url: row.get(6)?,
                description: row.get(7)?, genre: row.get(8)?, developer: row.get(9)?,
                release_date: row.get(10)?, last_played: row.get(11)?,
                added_at: row.get(12)?, playtime_hours: row.get(13)?,
            })
        })?.collect::<Result<Vec<Game>>>()?;
        Ok(games)
    }

    pub fn get_playtime_stats(&self) -> Result<Vec<PlaytimeStat>> {
        let conn = self.0.lock().unwrap();
        let mut stmt = conn.prepare("
            SELECT g.id, g.title,
                   COALESCE(SUM(p.duration_sec), 0) / 3600.0 as total_hours,
                   g.last_played
            FROM games g
            LEFT JOIN playtime p ON p.game_id = g.id AND p.duration_sec IS NOT NULL
            GROUP BY g.id
            HAVING total_hours > 0
            ORDER BY total_hours DESC
            LIMIT 20
        ")?;
        let stats = stmt.query_map([], |row| {
            Ok(PlaytimeStat {
                game_id: row.get(0)?,
                title: row.get(1)?,
                total_hours: row.get(2)?,
                last_played: row.get(3)?,
            })
        })?.collect::<Result<Vec<PlaytimeStat>>>()?;
        Ok(stats)
    }

    pub fn get_all_games(&self) -> Result<Vec<Game>> {
        let conn = self.0.lock().unwrap();
        let mut stmt = conn.prepare("
            SELECT
                g.id, g.title, g.executable, g.install_dir, g.platform,
                g.platform_id, g.cover_url, g.description, g.genre, g.developer,
                g.release_date, g.last_played, g.added_at,
                COALESCE(SUM(p.duration_sec), 0) / 3600.0 as playtime_hours
            FROM games g
            LEFT JOIN playtime p ON p.game_id = g.id AND p.duration_sec IS NOT NULL
            GROUP BY g.id
            ORDER BY g.title COLLATE NOCASE
        ")?;

        let games = stmt.query_map([], |row| {
            Ok(Game {
                id: row.get(0)?,
                title: row.get(1)?,
                executable: row.get(2)?,
                install_dir: row.get(3)?,
                platform: row.get(4)?,
                platform_id: row.get(5)?,
                cover_url: row.get(6)?,
                description: row.get(7)?,
                genre: row.get(8)?,
                developer: row.get(9)?,
                release_date: row.get(10)?,
                last_played: row.get(11)?,
                added_at: row.get(12)?,
                playtime_hours: row.get(13)?,
            })
        })?.collect::<Result<Vec<Game>>>()?;

        Ok(games)
    }

    pub fn upsert_game(&self, game: &crate::scanner::DetectedGame) -> Result<i64> {
        let conn = self.0.lock().unwrap();
        conn.execute(
            "INSERT INTO games (title, executable, install_dir, platform, platform_id)
             VALUES (?1, ?2, ?3, ?4, ?5)
             ON CONFLICT(executable) DO UPDATE SET
                title = excluded.title,
                install_dir = excluded.install_dir,
                platform = excluded.platform",
            params![game.title, game.executable, game.install_dir, game.platform, game.platform_id],
        )?;
        Ok(conn.last_insert_rowid())
    }

    pub fn add_game_manual(&self, title: &str, executable: &str) -> Result<i64> {
        let conn = self.0.lock().unwrap();
        conn.execute(
            "INSERT INTO games (title, executable, platform) VALUES (?1, ?2, 'standalone')",
            params![title, executable],
        )?;
        Ok(conn.last_insert_rowid())
    }

    pub fn update_game_metadata(
        &self, game_id: i64,
        cover_url: Option<&str>,
        description: Option<&str>,
        genre: Option<&str>,
        developer: Option<&str>,
        release_date: Option<&str>,
    ) -> Result<()> {
        let conn = self.0.lock().unwrap();
        conn.execute(
            "UPDATE games SET
                cover_url    = COALESCE(?2, cover_url),
                description  = COALESCE(?3, description),
                genre        = COALESCE(?4, genre),
                developer    = COALESCE(?5, developer),
                release_date = COALESCE(?6, release_date)
             WHERE id = ?1",
            params![game_id, cover_url, description, genre, developer, release_date],
        )?;
        Ok(())
    }

    pub fn start_playtime_session(&self, game_id: i64, start_ts: i64) -> Result<i64> {
        let conn = self.0.lock().unwrap();
        conn.execute(
            "INSERT INTO playtime (game_id, session_start) VALUES (?1, ?2)",
            params![game_id, start_ts],
        )?;
        let session_id = conn.last_insert_rowid();
        conn.execute(
            "UPDATE games SET last_played = datetime('now') WHERE id = ?1",
            params![game_id],
        )?;
        Ok(session_id)
    }

    pub fn end_playtime_session(&self, game_id: i64, end_ts: i64) -> Result<()> {
        let conn = self.0.lock().unwrap();
        conn.execute(
            "UPDATE playtime SET
                session_end  = ?2,
                duration_sec = ?2 - session_start
             WHERE game_id = ?1 AND session_end IS NULL
             ORDER BY session_start DESC LIMIT 1",
            params![game_id, end_ts],
        )?;
        Ok(())
    }

    pub fn get_collections(&self) -> Result<Vec<Collection>> {
        let conn = self.0.lock().unwrap();
        let mut stmt = conn.prepare("
            SELECT c.id, c.name, c.color,
                   COUNT(cg.game_id) as game_count
            FROM collections c
            LEFT JOIN collection_games cg ON cg.collection_id = c.id
            GROUP BY c.id
            ORDER BY c.name
        ")?;
        let cols = stmt.query_map([], |row| {
            Ok(Collection {
                id: row.get(0)?,
                name: row.get(1)?,
                color: row.get(2)?,
                game_count: row.get(3)?,
            })
        })?.collect::<Result<Vec<Collection>>>()?;
        Ok(cols)
    }

    pub fn create_collection(&self, name: &str, color: &str) -> Result<i64> {
        let conn = self.0.lock().unwrap();
        conn.execute(
            "INSERT INTO collections (name, color) VALUES (?1, ?2)",
            params![name, color],
        )?;
        Ok(conn.last_insert_rowid())
    }

    pub fn delete_game(&self, game_id: i64) -> Result<()> {
        let conn = self.0.lock().unwrap();
        conn.execute("DELETE FROM games WHERE id = ?1", params![game_id])?;
        Ok(())
    }
}
