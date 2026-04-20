import { create } from "zustand";
import { invoke } from "@tauri-apps/api/core";
import { ThemeId, THEMES, applyTheme } from "./theme";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Game {
  id: number;
  title: string;
  executable: string;
  install_dir: string;
  platform: string;
  platform_id?: string;
  cover_url?: string;
  description?: string;
  genre?: string;
  developer?: string;
  release_date?: string;
  last_played?: string;
  playtime_hours: number;
  added_at: string;
}

export interface Collection {
  id: number;
  name: string;
  color: string;
  game_count: number;
}

export interface AppSettings {
  steam_api_key: string;
  steam_id: string;
  steam_username: string;
  rawg_api_key: string;
  default_install_dir: string;
  auto_scan_on_start: boolean;
}

export interface SteamProfile {
  steam_id: string;
  persona_name: string;
  avatar_full: string;
  profile_url: string;
  persona_state: number;
  real_name?: string;
  loc_country?: string;
}

export interface DownloadItem {
  app_id: number;
  name: string;
  status: "queued" | "downloading" | "paused" | "completed" | "failed" | "verifying";
  progress: number;
  size_mb?: number;
  downloaded_mb?: number;
  error?: string;
}

export interface ZGUser {
  id: number;
  nickname: string;
  email: string;
  role: "user" | "premium" | "moderator" | "admin";
  avatar_url?: string;
  created_at: string;
}

export type NavSection = "store" | "library" | "community" | "downloads" | "settings" | "profile";

// ─── Store interface ──────────────────────────────────────────────────────────

interface AppStore {
  // Auth
  user: ZGUser | null;
  authToken: string | null;
  isAuthenticated: boolean;
  loginUser: (user: ZGUser, token: string) => void;
  logoutUser: () => void;

  // Navigation
  activeSection: NavSection;
  setActiveSection: (s: NavSection) => void;

  // Theme
  theme: ThemeId;
  setTheme: (t: ThemeId) => void;

  // Games
  games: Game[];
  collections: Collection[];
  selectedGameId: number | null;
  scanning: boolean;
  launching: Set<number>;
  librarySearch: string;
  libraryView: "grid" | "list";
  librarySidebarFilter: string;

  // Settings
  settings: AppSettings;
  settingsLoaded: boolean;

  // Steam
  steamProfile: SteamProfile | null;
  steamLoading: boolean;

  // Downloads
  downloads: DownloadItem[];

  // Actions
  loadGames: () => Promise<void>;
  scanGames: () => Promise<void>;
  launchGame: (game: Game) => Promise<void>;
  loadCollections: () => Promise<void>;
  loadSettings: () => Promise<void>;
  saveSettings: (s: AppSettings) => Promise<void>;
  loadSteamProfile: () => Promise<void>;
  loadDownloads: () => void;
  setSelectedGame: (id: number | null) => void;
  setLibrarySearch: (q: string) => void;
  setLibraryView: (v: "grid" | "list") => void;
  setLibrarySidebarFilter: (f: string) => void;
  addGameManual: (title: string, executable: string) => Promise<void>;
  deleteGame: (gameId: number) => Promise<void>;
}

// ─── Persistence helpers ──────────────────────────────────────────────────────

function loadAuth(): { user: ZGUser | null; token: string | null } {
  try {
    const raw = localStorage.getItem("zg_auth");
    if (!raw) return { user: null, token: null };
    return JSON.parse(raw);
  } catch { return { user: null, token: null }; }
}

function saveAuth(user: ZGUser | null, token: string | null) {
  if (user && token) localStorage.setItem("zg_auth", JSON.stringify({ user, token }));
  else localStorage.removeItem("zg_auth");
}

function loadTheme(): ThemeId {
  return (localStorage.getItem("zg_theme") as ThemeId) ?? "dark";
}

// ─── Store ────────────────────────────────────────────────────────────────────

const { user: savedUser, token: savedToken } = loadAuth();
const savedTheme = loadTheme();
applyTheme(THEMES[savedTheme]);

export const useStore = create<AppStore>((set, get) => ({
  // Auth
  user: savedUser,
  authToken: savedToken,
  isAuthenticated: !!savedToken,

  loginUser: (user, token) => {
    saveAuth(user, token);
    set({ user, authToken: token, isAuthenticated: true });
  },
  logoutUser: () => {
    saveAuth(null, null);
    set({ user: null, authToken: null, isAuthenticated: false });
  },

  // Navigation
  activeSection: "library",
  setActiveSection: (activeSection) => set({ activeSection, selectedGameId: null }),

  // Theme
  theme: savedTheme,
  setTheme: (theme) => {
    localStorage.setItem("zg_theme", theme);
    applyTheme(THEMES[theme]);
    set({ theme });
  },

  // Games
  games: [],
  collections: [],
  selectedGameId: null,
  scanning: false,
  launching: new Set(),
  librarySearch: "",
  libraryView: "grid",
  librarySidebarFilter: "all",

  // Settings
  settings: {
    steam_api_key: "", steam_id: "", steam_username: "",
    rawg_api_key: "", default_install_dir: "", auto_scan_on_start: false,
  },
  settingsLoaded: false,
  steamProfile: null,
  steamLoading: false,
  downloads: [],

  // ─── Actions ─────────────────────────────────────────────────────────────

  setActiveSection: (activeSection) => set({ activeSection, selectedGameId: null }),

  loadGames: async () => {
    const games = await invoke<Game[]>("get_all_games");
    set({ games });
  },

  scanGames: async () => {
    set({ scanning: true });
    try {
      const games = await invoke<Game[]>("scan_and_save_games");
      set({ games });
    } finally {
      set({ scanning: false });
    }
  },

  launchGame: async (game: Game) => {
    set((s) => ({ launching: new Set([...s.launching, game.id]) }));
    try {
      await invoke("launch_game", { gameId: game.id, executable: game.executable });
      setTimeout(() => {
        set((s) => { const l = new Set(s.launching); l.delete(game.id); return { launching: l }; });
      }, 3000);
    } catch {
      set((s) => { const l = new Set(s.launching); l.delete(game.id); return { launching: l }; });
    }
  },

  loadCollections: async () => {
    const collections = await invoke<Collection[]>("get_collections");
    set({ collections });
  },

  loadSettings: async () => {
    const settings = await invoke<AppSettings>("get_settings");
    set({ settings, settingsLoaded: true });
  },

  saveSettings: async (settings) => {
    await invoke("save_settings", { settings });
    set({ settings });
  },

  loadSteamProfile: async () => {
    set({ steamLoading: true });
    try {
      const steamProfile = await invoke<SteamProfile>("steam_get_profile");
      set({ steamProfile });
    } catch {
      set({ steamProfile: null });
    } finally {
      set({ steamLoading: false });
    }
  },

  loadDownloads: () => {
    invoke<DownloadItem[]>("get_downloads").then((downloads) => set({ downloads }));
  },

  setSelectedGame: (selectedGameId) => set({ selectedGameId }),
  setLibrarySearch: (librarySearch) => set({ librarySearch }),
  setLibraryView: (libraryView) => set({ libraryView }),
  setLibrarySidebarFilter: (librarySidebarFilter) => set({ librarySidebarFilter }),

  addGameManual: async (title, executable) => {
    await invoke("add_game_manual", { title, executable });
    await get().loadGames();
  },

  deleteGame: async (gameId) => {
    await invoke("delete_game", { gameId });
    set((s) => ({
      games: s.games.filter((g) => g.id !== gameId),
      selectedGameId: s.selectedGameId === gameId ? null : s.selectedGameId,
    }));
  },
}));
