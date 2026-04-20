import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { Download, CheckCircle, XCircle, Clock, Loader, RefreshCw, Package } from "lucide-react";
import { useStore } from "../../store";

interface DownloadItem {
  app_id: number;
  name: string;
  status: "queued" | "downloading" | "paused" | "completed" | "failed" | "verifying";
  progress: number;
  size_mb?: number;
  downloaded_mb?: number;
  error?: string;
}

export function DownloadsPage() {
  const { settings } = useStore();
  const [downloads, setDownloads] = useState<DownloadItem[]>([]);
  const [steamcmdInstalled, setSteamcmdInstalled] = useState<boolean | null>(null);
  const [installing, setInstalling] = useState(false);
  const [appId, setAppId] = useState("");
  const [gameName, setGameName] = useState("");
  const [queuing, setQueuing] = useState(false);

  useEffect(() => {
    checkSteamcmd();
    const interval = setInterval(refreshDownloads, 3000);
    return () => clearInterval(interval);
  }, []);

  async function checkSteamcmd() {
    const ok = await invoke<boolean>("steamcmd_is_installed");
    setSteamcmdInstalled(ok);
  }

  async function installSteamcmd() {
    setInstalling(true);
    try {
      await invoke("steamcmd_download_self");
      setSteamcmdInstalled(true);
    } catch (e) {
      alert("Chyba při instalaci SteamCMD: " + e);
    } finally {
      setInstalling(false);
    }
  }

  async function refreshDownloads() {
    const items = await invoke<DownloadItem[]>("get_downloads");
    setDownloads(items);
  }

  async function queueDownload() {
    if (!appId.trim() || !gameName.trim()) return;
    setQueuing(true);
    try {
      await invoke("steamcmd_install_game", {
        appId: parseInt(appId),
        name: gameName,
      });
      await refreshDownloads();
      setAppId("");
      setGameName("");
    } catch (e) {
      alert("Chyba: " + e);
    } finally {
      setQueuing(false);
    }
  }

  const noUsername = !settings.steam_username;

  return (
    <div className="flex-1 flex flex-col bg-[#1b2838] overflow-y-auto">
      {/* Header */}
      <div className="px-6 py-4 border-b border-black/30">
        <h1 className="text-lg font-bold text-[#c7d5e0] flex items-center gap-2">
          <Download className="w-5 h-5" /> Správce stahování
        </h1>
        <p className="text-xs text-[#8f98a0] mt-1">
          Stahuj hry přes SteamCMD — oficiální nástroj Valve
        </p>
      </div>

      <div className="p-6 space-y-6">
        {/* SteamCMD status */}
        <div className={`rounded-lg p-4 border ${steamcmdInstalled
          ? "bg-green-900/20 border-green-500/30"
          : "bg-yellow-900/20 border-yellow-500/30"}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {steamcmdInstalled === null ? (
                <Loader className="w-4 h-4 text-[#8f98a0] animate-spin" />
              ) : steamcmdInstalled ? (
                <CheckCircle className="w-4 h-4 text-green-400" />
              ) : (
                <Package className="w-4 h-4 text-yellow-400" />
              )}
              <span className="text-sm font-medium text-[#c7d5e0]">
                SteamCMD {steamcmdInstalled ? "je nainstalován" : "není nainstalován"}
              </span>
            </div>
            {!steamcmdInstalled && steamcmdInstalled !== null && (
              <button onClick={installSteamcmd} disabled={installing}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#4c6b22] hover:bg-[#5a7d28]
                           disabled:opacity-50 text-white text-xs rounded transition">
                {installing ? <Loader className="w-3 h-3 animate-spin" /> : <Download className="w-3 h-3" />}
                {installing ? "Instaluji..." : "Nainstalovat SteamCMD"}
              </button>
            )}
          </div>
          {!steamcmdInstalled && steamcmdInstalled !== null && (
            <p className="text-xs text-[#8f98a0] mt-2">
              SteamCMD je potřeba pro stahování her. Bude stažen automaticky (~30 MB).
            </p>
          )}
        </div>

        {/* Username warning */}
        {noUsername && (
          <div className="rounded-lg p-4 bg-[#2a3f5f]/50 border border-[#4a8ab5]/30">
            <p className="text-sm text-yellow-400 font-medium">⚠ Steam uživatelské jméno není nastaveno</p>
            <p className="text-xs text-[#8f98a0] mt-1">
              Jdi do Nastavení a nastav Steam uživatelské jméno pro přihlášení přes SteamCMD.
            </p>
            <button onClick={() => useStore.getState().setActiveSection("settings")}
              className="mt-2 text-xs text-[#67c1f5] hover:underline">
              Otevřít Nastavení →
            </button>
          </div>
        )}

        {/* Add download form */}
        {steamcmdInstalled && (
          <div className="bg-[#2a3f5f]/30 rounded-lg p-4 border border-[#4a8ab5]/20">
            <h3 className="text-sm font-semibold text-[#c7d5e0] mb-3">Stáhnout hru přes Steam App ID</h3>
            <p className="text-xs text-[#8f98a0] mb-3">
              App ID najdeš na stránce hry na steampowered.com (v URL adrese).
            </p>
            <div className="flex gap-2">
              <input
                className="w-32 bg-[#1b2838] border border-[#4a8ab5]/30 rounded px-3 py-2
                           text-sm text-[#c7d5e0] placeholder-[#8f98a0]/50
                           focus:outline-none focus:border-[#67c1f5]/50"
                placeholder="App ID" value={appId}
                onChange={e => setAppId(e.target.value.replace(/\D/g, ""))}
              />
              <input
                className="flex-1 bg-[#1b2838] border border-[#4a8ab5]/30 rounded px-3 py-2
                           text-sm text-[#c7d5e0] placeholder-[#8f98a0]/50
                           focus:outline-none focus:border-[#67c1f5]/50"
                placeholder="Název hry" value={gameName}
                onChange={e => setGameName(e.target.value)}
              />
              <button onClick={queueDownload}
                disabled={!appId || !gameName || queuing || noUsername}
                className="px-4 py-2 bg-[#4c6b22] hover:bg-[#5a7d28] disabled:opacity-40
                           text-white text-sm rounded transition flex items-center gap-1.5">
                {queuing ? <Loader className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
                Stáhnout
              </button>
            </div>
          </div>
        )}

        {/* Download queue */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-[#c7d5e0]">Fronta stahování</h3>
            <button onClick={refreshDownloads}
              className="text-xs text-[#67c1f5] hover:underline flex items-center gap-1">
              <RefreshCw className="w-3 h-3" /> Obnovit
            </button>
          </div>

          {downloads.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-[#8f98a0] gap-3">
              <Download className="w-10 h-10 opacity-30" />
              <p className="text-sm">Fronta je prázdná</p>
            </div>
          ) : (
            <div className="space-y-2">
              {downloads.map(item => (
                <DownloadRow key={item.app_id} item={item} />
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="bg-[#1b2838]/50 rounded-lg p-4 border border-[#2a3f5f]">
          <h3 className="text-xs font-semibold text-[#8f98a0] uppercase tracking-wider mb-2">O SteamCMD</h3>
          <p className="text-xs text-[#8f98a0] leading-relaxed">
            SteamCMD je oficiální nástroj od Valve pro stahování Steam her z příkazové řádky.
            Je zcela legální a zdarma. Vyžaduje Steam účet s vlastnictvím dané hry.
            Hry jsou stahovány do složky nastavené v Nastavení aplikace.
          </p>
        </div>
      </div>
    </div>
  );
}

function DownloadRow({ item }: { item: DownloadItem }) {
  const StatusIcon = () => {
    switch (item.status) {
      case "completed": return <CheckCircle className="w-4 h-4 text-green-400" />;
      case "failed": return <XCircle className="w-4 h-4 text-red-400" />;
      case "downloading": return <Loader className="w-4 h-4 text-[#67c1f5] animate-spin" />;
      case "queued": return <Clock className="w-4 h-4 text-yellow-400" />;
      case "verifying": return <RefreshCw className="w-4 h-4 text-blue-400 animate-spin" />;
      default: return <Clock className="w-4 h-4 text-[#8f98a0]" />;
    }
  };

  const STATUS_LABEL: Record<string, string> = {
    queued: "Ve frontě", downloading: "Stahuje se", completed: "Dokončeno",
    failed: "Chyba", paused: "Pozastaveno", verifying: "Ověřování",
  };

  return (
    <div className="bg-[#2a3f5f]/30 rounded-lg p-3 border border-[#4a8ab5]/20">
      <div className="flex items-center gap-3">
        <img
          src={`https://cdn.cloudflare.steamstatic.com/steam/apps/${item.app_id}/header.jpg`}
          className="w-16 h-10 rounded object-cover flex-shrink-0"
          alt={item.name}
          onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-[#c7d5e0] truncate">{item.name}</p>
            <div className="flex items-center gap-1.5 ml-2">
              <StatusIcon />
              <span className="text-xs text-[#8f98a0]">{STATUS_LABEL[item.status]}</span>
            </div>
          </div>

          {item.status === "downloading" && (
            <div className="mt-1.5">
              <div className="h-1.5 bg-[#1b2838] rounded-full overflow-hidden">
                <div className="h-full bg-[#4c6b22] rounded-full transition-all duration-300"
                  style={{ width: `${item.progress}%` }} />
              </div>
              <p className="text-[10px] text-[#8f98a0] mt-0.5">{item.progress.toFixed(1)}%</p>
            </div>
          )}

          {item.error && (
            <p className="text-xs text-red-400 mt-1 truncate">{item.error}</p>
          )}
        </div>
      </div>
    </div>
  );
}
