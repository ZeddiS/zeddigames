import { useEffect } from "react";
import { check } from "@tauri-apps/plugin-updater";
import { relaunch } from "@tauri-apps/plugin-process";
import { useStore } from "./store";
import { TitleBar } from "./components/TitleBar";
import { TopNavbar } from "./components/TopNavbar";
import { ToastProvider, useToast } from "./components/Toast";
import { AuthPage } from "./pages/Auth/AuthPage";
import { StorePage } from "./pages/Store/StorePage";
import { LibraryPage } from "./pages/Library/LibraryPage";
import { CommunityPage } from "./pages/Community/CommunityPage";
import { DownloadsPage } from "./pages/Downloads/DownloadsPage";
import { SettingsPage } from "./pages/Settings/SettingsPage";
import "./index.css";

export default function App() {
  return (
    <ToastProvider>
      <AppInner />
    </ToastProvider>
  );
}

function AppInner() {
  const {
    activeSection, isAuthenticated,
    loadGames, scanGames, loadCollections, loadSettings,
  } = useStore();
  const toast = useToast();

  // ── Init: load settings, auto-scan games on first run ────────────────────
  useEffect(() => {
    loadSettings().then(async () => {
      await loadGames();
      const { settings, games } = useStore.getState();
      // Scan hned při prvním spuštění nebo pokud je nastaveno auto-scan
      if (settings.auto_scan_on_start || games.length === 0) {
        await scanGames();
      }
      await loadCollections();
    });
  }, []);

  // ── Auto-update check ─────────────────────────────────────────────────────
  useEffect(() => {
    checkForUpdate(toast);
  }, []);

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[var(--bg,#1b2838)]">
      {/* Custom OS-independent titlebar */}
      <TitleBar />

      {/* Pokud není přihlášen → zobraz auth */}
      {!isAuthenticated ? (
        <AuthPage />
      ) : (
        <>
          <TopNavbar />
          <main className="flex-1 flex overflow-hidden">
            {activeSection === "store"     && <StorePage />}
            {activeSection === "library"   && <LibraryPage />}
            {activeSection === "community" && <CommunityPage />}
            {activeSection === "downloads" && <DownloadsPage />}
            {activeSection === "settings"  && <SettingsPage />}
          </main>
        </>
      )}
    </div>
  );
}

// ── Auto-updater ──────────────────────────────────────────────────────────────
async function checkForUpdate(toast: ReturnType<typeof useToast>) {
  try {
    const update = await check();
    if (!update?.available) return;
    toast.info(
      `Aktualizace ${update.version} dostupná`,
      "Stahuji a instaluji aktualizaci..."
    );
    await update.downloadAndInstall();
    toast.success("Aktualizace nainstalována", "Aplikace se restartuje...");
    setTimeout(() => relaunch(), 2000);
  } catch {
    // Tiché selhání — updater neblokuje spuštění
  }
}
