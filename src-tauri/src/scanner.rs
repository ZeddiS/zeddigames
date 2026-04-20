use serde::{Deserialize, Serialize};
use std::path::PathBuf;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct DetectedGame {
    pub title: String,
    pub executable: String,
    pub install_dir: String,
    pub platform: String,
    pub platform_id: Option<String>,
}

pub fn scan_all() -> Vec<DetectedGame> {
    let mut games = Vec::new();
    games.extend(scan_steam());
    games.extend(scan_epic());
    games.extend(scan_gog());
    // Deduplicate by executable path
    games.sort_by(|a, b| a.executable.cmp(&b.executable));
    games.dedup_by(|a, b| a.executable == b.executable);
    games
}

// ─── Steam ───────────────────────────────────────────────────────────────────

pub fn scan_steam() -> Vec<DetectedGame> {
    let mut games = Vec::new();
    let Some(steam_path) = get_steam_path() else { return games };

    let vdf_path = steam_path.join("steamapps/libraryfolders.vdf");
    let Ok(content) = std::fs::read_to_string(&vdf_path) else { return games };

    let mut library_paths = vec![steam_path.join("steamapps").to_string_lossy().to_string()];
    for line in content.lines() {
        if line.contains("\"path\"") {
            if let Some(path) = extract_vdf_value(line) {
                let normalized = path.replace("\\\\", "/").replace('\\', "/");
                library_paths.push(format!("{}/steamapps", normalized));
            }
        }
    }

    for lib in library_paths {
        let Ok(entries) = std::fs::read_dir(&lib) else { continue };
        for entry in entries.flatten() {
            let path = entry.path();
            if path.extension().map_or(false, |e| e == "acf") {
                if let Some(game) = parse_steam_manifest(&path, &lib) {
                    games.push(game);
                }
            }
        }
    }
    games
}

fn parse_steam_manifest(path: &PathBuf, lib_path: &str) -> Option<DetectedGame> {
    let content = std::fs::read_to_string(path).ok()?;
    let title = find_vdf_key(&content, "name")?;
    let app_id = find_vdf_key(&content, "appid");
    let install_dir_name = find_vdf_key(&content, "installdir")?;
    let install_dir = format!("{}/common/{}", lib_path, install_dir_name);
    let executable = find_main_executable(&install_dir, 0)?;

    Some(DetectedGame {
        title,
        executable,
        install_dir,
        platform: "steam".to_string(),
        platform_id: app_id,
    })
}

fn find_vdf_key(content: &str, key: &str) -> Option<String> {
    let pattern = format!("\"{}\"", key);
    let line = content.lines().find(|l| {
        let trimmed = l.trim();
        trimmed.starts_with(&pattern)
    })?;
    extract_vdf_value(line)
}

fn extract_vdf_value(line: &str) -> Option<String> {
    let parts: Vec<&str> = line.split('"').collect();
    parts.get(3).map(|s| s.to_string())
}

#[cfg(target_os = "windows")]
fn get_steam_path() -> Option<PathBuf> {
    use winreg::enums::*;
    use winreg::RegKey;
    let hklm = RegKey::predef(HKEY_LOCAL_MACHINE);
    let key = hklm.open_subkey("SOFTWARE\\WOW6432Node\\Valve\\Steam").ok()
        .or_else(|| hklm.open_subkey("SOFTWARE\\Valve\\Steam").ok())?;
    let path: String = key.get_value("InstallPath").ok()?;
    Some(PathBuf::from(path))
}

#[cfg(not(target_os = "windows"))]
fn get_steam_path() -> Option<PathBuf> {
    let home = dirs::home_dir()?;
    let path = home.join(".steam/steam");
    if path.exists() { Some(path) } else { None }
}

// ─── Epic Games ──────────────────────────────────────────────────────────────

pub fn scan_epic() -> Vec<DetectedGame> {
    let mut games = Vec::new();
    let Some(local_data) = dirs::data_local_dir() else { return games };
    let manifest_dir = local_data.join("EpicGamesLauncher/Data/Manifests");
    let Ok(entries) = std::fs::read_dir(&manifest_dir) else { return games };

    for entry in entries.flatten() {
        let path = entry.path();
        if path.extension().map_or(false, |e| e == "item") {
            if let Ok(content) = std::fs::read_to_string(&path) {
                if let Ok(manifest) = serde_json::from_str::<serde_json::Value>(&content) {
                    let title = manifest["DisplayName"].as_str()
                        .unwrap_or("Unknown").to_string();
                    let install_dir = manifest["InstallLocation"].as_str()
                        .unwrap_or("").to_string();
                    let exe_rel = manifest["LaunchExecutable"].as_str()
                        .unwrap_or("").to_string();
                    let catalog_id = manifest["CatalogItemId"].as_str()
                        .map(|s| s.to_string());

                    if !install_dir.is_empty() && !exe_rel.is_empty() {
                        let executable = format!("{}/{}", install_dir, exe_rel)
                            .replace('\\', "/");
                        games.push(DetectedGame {
                            title,
                            executable,
                            install_dir,
                            platform: "epic".to_string(),
                            platform_id: catalog_id,
                        });
                    }
                }
            }
        }
    }
    games
}

// ─── GOG Galaxy ──────────────────────────────────────────────────────────────

#[cfg(target_os = "windows")]
pub fn scan_gog() -> Vec<DetectedGame> {
    use winreg::enums::*;
    use winreg::RegKey;
    let mut games = Vec::new();

    let hklm = RegKey::predef(HKEY_LOCAL_MACHINE);
    let gog_key = hklm.open_subkey("SOFTWARE\\WOW6432Node\\GOG.com\\Games")
        .or_else(|_| hklm.open_subkey("SOFTWARE\\GOG.com\\Games"));

    let Ok(key) = gog_key else { return games };

    for subkey_name in key.enum_keys().flatten() {
        if let Ok(subkey) = key.open_subkey(&subkey_name) {
            let title: String = subkey.get_value("GAMENAME").unwrap_or_default();
            let exe: String = subkey.get_value("EXE").unwrap_or_default();
            let path: String = subkey.get_value("PATH").unwrap_or_default();
            let game_id: String = subkey.get_value("GAMEID").unwrap_or_default();

            if !title.is_empty() && !exe.is_empty() {
                games.push(DetectedGame {
                    title,
                    executable: exe.replace('\\', "/"),
                    install_dir: path,
                    platform: "gog".to_string(),
                    platform_id: if game_id.is_empty() { None } else { Some(game_id) },
                });
            }
        }
    }
    games
}

#[cfg(not(target_os = "windows"))]
pub fn scan_gog() -> Vec<DetectedGame> {
    Vec::new()
}

// ─── Executable finder ───────────────────────────────────────────────────────

pub fn find_main_executable(dir: &str, depth: u32) -> Option<String> {
    if depth > 3 { return None; }
    let path = PathBuf::from(dir);
    let Ok(entries) = std::fs::read_dir(&path) else { return None };

    let mut exes: Vec<PathBuf> = entries.flatten()
        .filter(|e| {
            let p = e.path();
            if !p.is_file() { return false; }
            let ext_ok = p.extension().map_or(false, |e| e == "exe");
            let name = p.file_name().unwrap_or_default().to_string_lossy().to_lowercase();
            let is_utility = name.contains("unins") || name.contains("setup")
                || name.contains("redist") || name.contains("vcredist")
                || name.contains("directx") || name.contains("dxsetup")
                || name.contains("crash") || name.contains("report");
            ext_ok && !is_utility
        })
        .map(|e| e.path())
        .collect();

    // Největší .exe je obvykle hlavní spustitelný soubor
    exes.sort_by_key(|p| std::fs::metadata(p).map(|m| m.len()).unwrap_or(0));

    if let Some(exe) = exes.last() {
        return Some(exe.to_string_lossy().replace('\\', "/").to_string());
    }

    // Rekurzivní prohledání podsložek
    let Ok(sub_entries) = std::fs::read_dir(&path) else { return None };
    for entry in sub_entries.flatten() {
        if entry.path().is_dir() {
            let name = entry.file_name().to_string_lossy().to_lowercase();
            if name == "redist" || name == "_commonredist" { continue; }
            if let Some(found) = find_main_executable(
                &entry.path().to_string_lossy(),
                depth + 1,
            ) {
                return Some(found);
            }
        }
    }
    None
}
