use serde::{Deserialize, Serialize};
use std::path::PathBuf;
use std::process::{Command, Stdio};
use std::sync::{Arc, Mutex};
use std::collections::HashMap;

#[derive(Debug, Serialize, Deserialize, Clone, PartialEq)]
#[serde(rename_all = "snake_case")]
pub enum DownloadStatus {
    Queued,
    Downloading,
    Paused,
    Completed,
    Failed,
    Verifying,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct DownloadItem {
    pub app_id: u64,
    pub name: String,
    pub status: DownloadStatus,
    pub progress: f32,
    pub size_mb: Option<f64>,
    pub downloaded_mb: Option<f64>,
    pub error: Option<String>,
}

pub type DownloadQueue = Arc<Mutex<HashMap<u64, DownloadItem>>>;

pub fn get_steamcmd_path() -> PathBuf {
    let data_dir = dirs::data_local_dir().unwrap_or_else(|| PathBuf::from("."));
    data_dir.join("ZeddiLauncher/steamcmd/steamcmd.exe")
}

pub fn is_steamcmd_installed() -> bool {
    get_steamcmd_path().exists()
}

pub async fn download_steamcmd() -> Result<(), String> {
    let steamcmd_dir = get_steamcmd_path()
        .parent()
        .unwrap()
        .to_path_buf();
    std::fs::create_dir_all(&steamcmd_dir).map_err(|e| e.to_string())?;

    let url = "https://steamcdn-a.akamaihd.net/client/installer/steamcmd.zip";
    let resp = reqwest::get(url).await.map_err(|e| e.to_string())?;
    let bytes = resp.bytes().await.map_err(|e| e.to_string())?;

    let zip_path = steamcmd_dir.join("steamcmd.zip");
    std::fs::write(&zip_path, &bytes).map_err(|e| e.to_string())?;

    // Rozbalit ZIP
    let file = std::fs::File::open(&zip_path).map_err(|e| e.to_string())?;
    let mut archive = zip::ZipArchive::new(file).map_err(|e| e.to_string())?;
    archive.extract(&steamcmd_dir).map_err(|e| e.to_string())?;
    std::fs::remove_file(&zip_path).ok();

    Ok(())
}

pub fn start_download(
    app_id: u64,
    name: &str,
    install_dir: &str,
    username: &str,
    queue: DownloadQueue,
) {
    let steamcmd = get_steamcmd_path();
    let install_path = install_dir.to_string();
    let uname = username.to_string();
    let game_name = name.to_string();
    let q = Arc::clone(&queue);

    // Přidej do fronty
    {
        let mut lock = queue.lock().unwrap();
        lock.insert(app_id, DownloadItem {
            app_id,
            name: game_name.clone(),
            status: DownloadStatus::Queued,
            progress: 0.0,
            size_mb: None,
            downloaded_mb: None,
            error: None,
        });
    }

    std::thread::spawn(move || {
        // Nastav stav na Downloading
        {
            let mut lock = q.lock().unwrap();
            if let Some(item) = lock.get_mut(&app_id) {
                item.status = DownloadStatus::Downloading;
            }
        }

        let output = Command::new(&steamcmd)
            .args([
                "+force_install_dir", &install_path,
                "+login", &uname,
                "+app_update", &app_id.to_string(), "validate",
                "+quit",
            ])
            .stdout(Stdio::piped())
            .stderr(Stdio::piped())
            .output();

        let mut lock = q.lock().unwrap();
        if let Some(item) = lock.get_mut(&app_id) {
            match output {
                Ok(out) if out.status.success() => {
                    item.status = DownloadStatus::Completed;
                    item.progress = 100.0;
                }
                Ok(out) => {
                    item.status = DownloadStatus::Failed;
                    item.error = Some(String::from_utf8_lossy(&out.stderr).to_string());
                }
                Err(e) => {
                    item.status = DownloadStatus::Failed;
                    item.error = Some(e.to_string());
                }
            }
        }
    });
}

pub fn get_queue_snapshot(queue: &DownloadQueue) -> Vec<DownloadItem> {
    queue.lock().unwrap().values().cloned().collect()
}
