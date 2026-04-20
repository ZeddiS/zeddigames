mod db;
mod scanner;
mod launcher;
mod steam_api;
mod steamcmd;

use db::{Database, Game, Collection};
use launcher::RunningGames;
use steamcmd::{DownloadQueue, DownloadItem};
use steam_api::{SteamProfile, SteamOwnedGame, SteamFriend, SteamAchievement, SteamNewsItem};
use serde::{Deserialize, Serialize};
use std::sync::{Arc, Mutex};
use tauri::State;

pub struct AppState {
    pub db: Database,
    pub running: RunningGames,
    pub downloads: DownloadQueue,
}

// ─── Settings ─────────────────────────────────────────────────────────────────

#[derive(Debug, Serialize, Deserialize, Clone, Default)]
pub struct AppSettings {
    pub steam_api_key: String,
    pub steam_id: String,
    pub steam_username: String,
    pub rawg_api_key: String,
    pub default_install_dir: String,
    pub auto_scan_on_start: bool,
}

#[tauri::command]
async fn get_settings(state: State<'_, AppState>) -> Result<AppSettings, String> {
    state.db.get_settings().map_err(|e| e.to_string())
}

#[tauri::command]
async fn save_settings(settings: AppSettings, state: State<'_, AppState>) -> Result<(), String> {
    state.db.save_settings(&settings).map_err(|e| e.to_string())
}

// ─── Game commands ────────────────────────────────────────────────────────────

#[tauri::command]
async fn get_all_games(state: State<'_, AppState>) -> Result<Vec<Game>, String> {
    state.db.get_all_games().map_err(|e| e.to_string())
}

#[tauri::command]
async fn scan_and_save_games(state: State<'_, AppState>) -> Result<Vec<Game>, String> {
    let detected = scanner::scan_all();
    for game in &detected {
        let _ = state.db.upsert_game(game);
    }
    state.db.get_all_games().map_err(|e| e.to_string())
}

#[tauri::command]
async fn add_game_manual(
    title: String,
    executable: String,
    state: State<'_, AppState>,
) -> Result<i64, String> {
    state.db.add_game_manual(&title, &executable).map_err(|e| e.to_string())
}

#[tauri::command]
async fn delete_game(game_id: i64, state: State<'_, AppState>) -> Result<(), String> {
    state.db.delete_game(game_id).map_err(|e| e.to_string())
}

#[tauri::command]
async fn get_game_by_id(game_id: i64, state: State<'_, AppState>) -> Result<Option<Game>, String> {
    state.db.get_game_by_id(game_id).map_err(|e| e.to_string())
}

// ─── Launch commands ──────────────────────────────────────────────────────────

#[tauri::command]
async fn launch_game(
    game_id: i64,
    executable: String,
    state: State<'_, AppState>,
) -> Result<(), String> {
    let pid = launcher::launch_game(&executable)?;
    let start_ts = launcher::now_ts();
    let _ = state.db.start_playtime_session(game_id, start_ts);
    state.running.lock().unwrap().insert(game_id, pid);

    let running = Arc::clone(&state.running);
    let db_path = get_db_path();

    std::thread::spawn(move || {
        loop {
            std::thread::sleep(std::time::Duration::from_secs(10));
            if !launcher::is_process_running(pid) {
                let end_ts = launcher::now_ts();
                if let Ok(db) = Database::new(&db_path) {
                    let _ = db.end_playtime_session(game_id, end_ts);
                }
                running.lock().unwrap().remove(&game_id);
                break;
            }
        }
    });
    Ok(())
}

#[tauri::command]
async fn is_game_running(game_id: i64, state: State<'_, AppState>) -> Result<bool, String> {
    let running = state.running.lock().unwrap();
    if let Some(&pid) = running.get(&game_id) {
        Ok(launcher::is_process_running(pid))
    } else {
        Ok(false)
    }
}

// ─── Collection commands ──────────────────────────────────────────────────────

#[tauri::command]
async fn get_collections(state: State<'_, AppState>) -> Result<Vec<Collection>, String> {
    state.db.get_collections().map_err(|e| e.to_string())
}

#[tauri::command]
async fn create_collection(name: String, color: String, state: State<'_, AppState>) -> Result<i64, String> {
    state.db.create_collection(&name, &color).map_err(|e| e.to_string())
}

#[tauri::command]
async fn add_to_collection(collection_id: i64, game_id: i64, state: State<'_, AppState>) -> Result<(), String> {
    state.db.add_to_collection(collection_id, game_id).map_err(|e| e.to_string())
}

#[tauri::command]
async fn get_games_in_collection(collection_id: i64, state: State<'_, AppState>) -> Result<Vec<Game>, String> {
    state.db.get_games_in_collection(collection_id).map_err(|e| e.to_string())
}

// ─── Steam API commands ───────────────────────────────────────────────────────

#[tauri::command]
async fn steam_get_profile(state: State<'_, AppState>) -> Result<SteamProfile, String> {
    let settings = state.db.get_settings().map_err(|e| e.to_string())?;
    if settings.steam_api_key.is_empty() || settings.steam_id.is_empty() {
        return Err("Steam API klíč nebo Steam ID není nastaven".to_string());
    }
    steam_api::get_profile(&settings.steam_api_key, &settings.steam_id).await
}

#[tauri::command]
async fn steam_get_owned_games(state: State<'_, AppState>) -> Result<Vec<SteamOwnedGame>, String> {
    let settings = state.db.get_settings().map_err(|e| e.to_string())?;
    if settings.steam_api_key.is_empty() || settings.steam_id.is_empty() {
        return Err("Steam API klíč nebo Steam ID není nastaven".to_string());
    }
    steam_api::get_owned_games(&settings.steam_api_key, &settings.steam_id).await
}

#[tauri::command]
async fn steam_get_friends(state: State<'_, AppState>) -> Result<Vec<SteamFriend>, String> {
    let settings = state.db.get_settings().map_err(|e| e.to_string())?;
    if settings.steam_api_key.is_empty() || settings.steam_id.is_empty() {
        return Err("Steam API klíč nebo Steam ID není nastaven".to_string());
    }
    steam_api::get_friends(&settings.steam_api_key, &settings.steam_id).await
}

#[tauri::command]
async fn steam_get_achievements(app_id: u64, state: State<'_, AppState>) -> Result<Vec<SteamAchievement>, String> {
    let settings = state.db.get_settings().map_err(|e| e.to_string())?;
    if settings.steam_api_key.is_empty() || settings.steam_id.is_empty() {
        return Err("Steam API klíč nebo Steam ID není nastaven".to_string());
    }
    steam_api::get_achievements(&settings.steam_api_key, &settings.steam_id, app_id).await
}

#[tauri::command]
async fn steam_get_news(app_id: u64) -> Result<Vec<SteamNewsItem>, String> {
    steam_api::get_news(app_id).await
}

#[tauri::command]
fn steam_cover_url(app_id: u64) -> String {
    steam_api::steam_cover_url(app_id)
}

#[tauri::command]
fn steam_hero_url(app_id: u64) -> String {
    steam_api::steam_hero_url(app_id)
}

// ─── RAWG Store commands ──────────────────────────────────────────────────────

#[derive(Debug, Serialize, Deserialize)]
pub struct RawgGame {
    pub id: u64,
    pub name: String,
    pub background_image: Option<String>,
    pub rating: Option<f64>,
    pub rating_top: Option<u32>,
    pub released: Option<String>,
    pub genres: Option<Vec<RawgGenre>>,
    pub platforms: Option<Vec<RawgPlatformWrapper>>,
    pub short_screenshots: Option<Vec<RawgScreenshot>>,
    pub tags: Option<Vec<RawgTag>>,
    pub description_raw: Option<String>,
    pub metacritic: Option<i32>,
    pub playtime: Option<u32>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct RawgGenre { pub id: u32, pub name: String }

#[derive(Debug, Serialize, Deserialize)]
pub struct RawgPlatformWrapper { pub platform: RawgPlatform }

#[derive(Debug, Serialize, Deserialize)]
pub struct RawgPlatform { pub id: u32, pub name: String }

#[derive(Debug, Serialize, Deserialize)]
pub struct RawgScreenshot { pub id: u32, pub image: String }

#[derive(Debug, Serialize, Deserialize)]
pub struct RawgTag { pub id: u32, pub name: String }

#[derive(Debug, Serialize, Deserialize)]
pub struct RawgSearchResult {
    pub count: u64,
    pub results: Vec<RawgGame>,
}

#[tauri::command]
async fn rawg_search(query: String, page: u32, state: State<'_, AppState>) -> Result<RawgSearchResult, String> {
    let settings = state.db.get_settings().map_err(|e| e.to_string())?;
    if settings.rawg_api_key.is_empty() {
        return Err("RAWG API klíč není nastaven. Nastav ho v Nastavení.".to_string());
    }
    let url = format!(
        "https://api.rawg.io/api/games?key={}&search={}&page={}&page_size=20",
        settings.rawg_api_key,
        urlencoding::encode(&query),
        page
    );
    let resp = reqwest::get(&url).await.map_err(|e| e.to_string())?;
    resp.json::<RawgSearchResult>().await.map_err(|e| e.to_string())
}

#[tauri::command]
async fn rawg_browse(
    genre: Option<String>,
    ordering: Option<String>,
    page: u32,
    state: State<'_, AppState>,
) -> Result<RawgSearchResult, String> {
    let settings = state.db.get_settings().map_err(|e| e.to_string())?;
    if settings.rawg_api_key.is_empty() {
        return Err("RAWG API klíč není nastaven".to_string());
    }
    let mut url = format!(
        "https://api.rawg.io/api/games?key={}&page={}&page_size=20",
        settings.rawg_api_key, page
    );
    if let Some(g) = genre { url.push_str(&format!("&genres={}", g)); }
    if let Some(o) = ordering { url.push_str(&format!("&ordering={}", o)); }

    let resp = reqwest::get(&url).await.map_err(|e| e.to_string())?;
    resp.json::<RawgSearchResult>().await.map_err(|e| e.to_string())
}

#[tauri::command]
async fn rawg_game_detail(id: u64, state: State<'_, AppState>) -> Result<RawgGame, String> {
    let settings = state.db.get_settings().map_err(|e| e.to_string())?;
    if settings.rawg_api_key.is_empty() {
        return Err("RAWG API klíč není nastaven".to_string());
    }
    let url = format!("https://api.rawg.io/api/games/{}?key={}", id, settings.rawg_api_key);
    let resp = reqwest::get(&url).await.map_err(|e| e.to_string())?;
    resp.json::<RawgGame>().await.map_err(|e| e.to_string())
}

// ─── Metadata fetch ───────────────────────────────────────────────────────────

#[tauri::command]
async fn fetch_game_metadata(
    game_id: i64,
    title: String,
    state: State<'_, AppState>,
) -> Result<bool, String> {
    let settings = state.db.get_settings().map_err(|e| e.to_string())?;
    if settings.rawg_api_key.is_empty() { return Ok(false); }

    let url = format!(
        "https://api.rawg.io/api/games?key={}&search={}&page_size=1",
        settings.rawg_api_key,
        urlencoding::encode(&title)
    );
    let client = reqwest::Client::new();
    let resp = client.get(&url).send().await.map_err(|e| e.to_string())?;
    let search: RawgSearchResult = resp.json().await.map_err(|e| e.to_string())?;

    if let Some(result) = search.results.first() {
        let genre = result.genres.as_ref()
            .and_then(|g| g.first()).map(|g| g.name.as_str());
        state.db.update_game_metadata(
            game_id,
            result.background_image.as_deref(),
            None,
            genre,
            None,
            result.released.as_deref(),
        ).map_err(|e| e.to_string())?;
        return Ok(true);
    }
    Ok(false)
}

// ─── SteamCMD commands ────────────────────────────────────────────────────────

#[tauri::command]
fn steamcmd_is_installed() -> bool {
    steamcmd::is_steamcmd_installed()
}

#[tauri::command]
async fn steamcmd_download_self() -> Result<(), String> {
    steamcmd::download_steamcmd().await
}

#[tauri::command]
async fn steamcmd_install_game(
    app_id: u64,
    name: String,
    state: State<'_, AppState>,
) -> Result<(), String> {
    let settings = state.db.get_settings().map_err(|e| e.to_string())?;
    let install_dir = if settings.default_install_dir.is_empty() {
        dirs::data_local_dir()
            .unwrap_or_default()
            .join("ZeddiLauncher/games")
            .join(&name)
            .to_string_lossy()
            .to_string()
    } else {
        format!("{}/{}", settings.default_install_dir, name)
    };

    std::fs::create_dir_all(&install_dir).map_err(|e| e.to_string())?;
    steamcmd::start_download(app_id, &name, &install_dir, &settings.steam_username, Arc::clone(&state.downloads));
    Ok(())
}

#[tauri::command]
fn get_downloads(state: State<'_, AppState>) -> Vec<DownloadItem> {
    steamcmd::get_queue_snapshot(&state.downloads)
}

// ─── Playtime ─────────────────────────────────────────────────────────────────

#[derive(Debug, Serialize, Deserialize)]
pub struct PlaytimeStat {
    pub game_id: i64,
    pub title: String,
    pub total_hours: f64,
    pub last_played: Option<String>,
}

#[tauri::command]
async fn get_playtime_stats(state: State<'_, AppState>) -> Result<Vec<PlaytimeStat>, String> {
    state.db.get_playtime_stats().map_err(|e| e.to_string())
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

fn get_db_path() -> String {
    let data_dir = dirs::data_local_dir().unwrap_or_else(|| std::path::PathBuf::from("."));
    let app_dir = data_dir.join("ZeddiLauncher");
    std::fs::create_dir_all(&app_dir).ok();
    app_dir.join("library.db").to_string_lossy().to_string()
}

// ─── App entry ────────────────────────────────────────────────────────────────

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let db_path = get_db_path();
    let db = Database::new(&db_path).expect("Nelze otevřít databázi");

    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_updater::Builder::new().build())
        .plugin(tauri_plugin_notification::init())
        .plugin(tauri_plugin_shell::init())
        .manage(AppState {
            db,
            running: Arc::new(Mutex::new(std::collections::HashMap::new())),
            downloads: Arc::new(Mutex::new(std::collections::HashMap::new())),
        })
        .invoke_handler(tauri::generate_handler![
            // settings
            get_settings, save_settings,
            // games
            get_all_games, scan_and_save_games, add_game_manual,
            delete_game, get_game_by_id,
            // launcher
            launch_game, is_game_running,
            // collections
            get_collections, create_collection, add_to_collection,
            get_games_in_collection,
            // steam api
            steam_get_profile, steam_get_owned_games, steam_get_friends,
            steam_get_achievements, steam_get_news,
            steam_cover_url, steam_hero_url,
            // rawg store
            rawg_search, rawg_browse, rawg_game_detail,
            fetch_game_metadata,
            // steamcmd
            steamcmd_is_installed, steamcmd_download_self,
            steamcmd_install_game, get_downloads,
            // playtime
            get_playtime_stats,
        ])
        .run(tauri::generate_context!())
        .expect("Chyba při spuštění aplikace");
}
