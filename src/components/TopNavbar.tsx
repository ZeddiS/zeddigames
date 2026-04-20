import { useStore, NavSection } from "../store";
import { Store, BookOpen, Users, Download, Settings, Bell, ChevronDown, Gamepad2 } from "lucide-react";

const NAV_ITEMS: { id: NavSection; label: string; icon: React.ReactNode }[] = [
  { id: "store",     label: "OBCHOD",    icon: <Store className="w-3.5 h-3.5" /> },
  { id: "library",   label: "KNIHOVNA",  icon: <BookOpen className="w-3.5 h-3.5" /> },
  { id: "community", label: "KOMUNITA",  icon: <Users className="w-3.5 h-3.5" /> },
  { id: "downloads", label: "STAHOVÁNÍ", icon: <Download className="w-3.5 h-3.5" /> },
];

const PERSONA_STATUS: Record<number, { label: string; color: string }> = {
  0: { label: "Offline",   color: "#6b7280" },
  1: { label: "Online",    color: "#57cbde" },
  2: { label: "Zaneprázdněn", color: "#c6423a" },
  3: { label: "Pryč",      color: "#c6923a" },
  4: { label: "Snít",      color: "#6b7280" },
};

export function TopNavbar() {
  const { activeSection, setActiveSection, steamProfile, settings } = useStore();

  return (
    <header
      className="flex-shrink-0 flex items-stretch bg-[#171a21] border-b border-black/40"
      style={{ height: 48 }}
      data-tauri-drag-region
    >
      {/* Logo */}
      <div className="flex items-center px-4 gap-2 border-r border-black/30 select-none">
        <div className="w-6 h-6 rounded bg-[#1b2838] flex items-center justify-center">
          <Gamepad2 className="w-3.5 h-3.5 text-[#c7d5e0]" />
        </div>
        <span className="text-[#c7d5e0] text-xs font-semibold tracking-widest">ZEDDI</span>
      </div>

      {/* Nav tabs */}
      <nav className="flex items-stretch">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveSection(item.id)}
            className={`flex items-center gap-1.5 px-5 text-xs font-medium tracking-wider
                        transition-all border-b-2 select-none
                        ${activeSection === item.id
                          ? "text-white border-[#c7d5e0] bg-white/5"
                          : "text-[#8f98a0] border-transparent hover:text-[#c7d5e0] hover:bg-white/5"
                        }`}
          >
            {item.icon}
            {item.label}
          </button>
        ))}
      </nav>

      {/* Spacer */}
      <div className="flex-1" data-tauri-drag-region />

      {/* Right side */}
      <div className="flex items-center gap-1 px-3">
        {/* Notifications */}
        <button className="p-1.5 rounded hover:bg-white/10 text-[#8f98a0] hover:text-white transition">
          <Bell className="w-4 h-4" />
        </button>

        {/* User profile */}
        <button
          onClick={() => setActiveSection("community")}
          className="flex items-center gap-2 px-2 py-1 rounded hover:bg-white/10 transition group"
        >
          {steamProfile ? (
            <>
              <div className="relative">
                <img
                  src={steamProfile.avatar_full}
                  className="w-6 h-6 rounded"
                  alt={steamProfile.persona_name}
                />
                <span
                  className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full border border-[#171a21]"
                  style={{ background: PERSONA_STATUS[steamProfile.persona_state]?.color ?? "#6b7280" }}
                />
              </div>
              <span className="text-xs text-[#c7d5e0] group-hover:text-white transition max-w-[120px] truncate">
                {steamProfile.persona_name}
              </span>
              <ChevronDown className="w-3 h-3 text-[#8f98a0]" />
            </>
          ) : (
            <span className="text-xs text-[#8f98a0] group-hover:text-[#c7d5e0]">
              {settings.steam_id ? "Načítám..." : "Nepřihlášen"}
            </span>
          )}
        </button>

        {/* Settings */}
        <button
          onClick={() => setActiveSection("settings")}
          className={`p-1.5 rounded transition
            ${activeSection === "settings"
              ? "bg-white/10 text-white"
              : "text-[#8f98a0] hover:bg-white/10 hover:text-white"
            }`}
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>

      {/* Window controls */}
      <WindowControls />
    </header>
  );
}

function WindowControls() {
  return (
    <div className="flex items-stretch border-l border-black/30">
      <button
        className="w-10 flex items-center justify-center text-[#8f98a0]
                   hover:bg-white/10 hover:text-white transition text-lg leading-none"
        onClick={() => (window as any).__TAURI__?.window?.getCurrent()?.minimize()}
      >
        ─
      </button>
      <button
        className="w-10 flex items-center justify-center text-[#8f98a0]
                   hover:bg-white/10 hover:text-white transition text-sm"
        onClick={() => (window as any).__TAURI__?.window?.getCurrent()?.toggleMaximize()}
      >
        □
      </button>
      <button
        className="w-10 flex items-center justify-center text-[#8f98a0]
                   hover:bg-red-600 hover:text-white transition text-lg leading-none"
        onClick={() => (window as any).__TAURI__?.window?.getCurrent()?.close()}
      >
        ✕
      </button>
    </div>
  );
}
