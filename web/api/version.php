<?php
/**
 * ZeddiGames — Version endpoint (pro auto-updater)
 * GET https://zeddihub.eu/games/api/version.php
 * Vrací JSON kompatibilní s Tauri updater formátem
 */

header("Content-Type: application/json; charset=utf-8");
header("Access-Control-Allow-Origin: *");

require_once __DIR__ . '/db.php';

$pdo  = get_db();
$stmt = $pdo->query("SELECT * FROM zg_versions WHERE is_latest = 1 ORDER BY id DESC LIMIT 1");
$row  = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$row) {
    // Fallback pokud DB nemá záznam
    echo json_encode([
        "version"      => "0.1.0",
        "notes"        => "ZeddiGames Launcher – první vydání",
        "pub_date"     => "2026-04-20T00:00:00Z",
        "platforms"    => [
            "windows-x86_64" => [
                "signature" => "",
                "url"       => "https://github.com/ZeddiS/zeddigames/releases/latest/download/ZeddiGames_Launcher_0.1.0_x64-setup.exe"
            ]
        ]
    ]);
    exit;
}

echo json_encode([
    "version"   => $row['version'],
    "notes"     => $row['notes'] ?? '',
    "pub_date"  => date('c', strtotime($row['release_date'])),
    "platforms" => [
        "windows-x86_64" => [
            "signature" => "",
            "url"       => $row['download_url'] ?? ""
        ]
    ]
]);
