use std::process::Command;
use std::time::{SystemTime, UNIX_EPOCH};
use std::sync::{Arc, Mutex};
use std::collections::HashMap;

pub type RunningGames = Arc<Mutex<HashMap<i64, u32>>>;

pub fn launch_game(executable: &str) -> Result<u32, String> {
    let path = std::path::Path::new(executable);

    if !path.exists() {
        return Err(format!("Soubor nenalezen: {}", executable));
    }

    let work_dir = path.parent()
        .unwrap_or(std::path::Path::new("."));

    let child = Command::new(executable)
        .current_dir(work_dir)
        .spawn()
        .map_err(|e| format!("Nelze spustit hru: {}", e))?;

    Ok(child.id())
}

pub fn now_ts() -> i64 {
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap_or_default()
        .as_secs() as i64
}

#[cfg(target_os = "windows")]
pub fn is_process_running(pid: u32) -> bool {
    use std::process::Command;
    let output = Command::new("tasklist")
        .args(["/FI", &format!("PID eq {}", pid), "/NH", "/FO", "CSV"])
        .output();
    match output {
        Ok(out) => {
            let text = String::from_utf8_lossy(&out.stdout);
            text.contains(&format!(",\"{}\",", pid))
                || text.contains(&pid.to_string())
        }
        Err(_) => false,
    }
}

#[cfg(not(target_os = "windows"))]
pub fn is_process_running(pid: u32) -> bool {
    std::path::Path::new(&format!("/proc/{}", pid)).exists()
}
