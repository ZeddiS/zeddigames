import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Grid3X3, List, Plus, Play, Clock, X, RefreshCw, ChevronDown, Filter } from "lucide-react";
import { useStore, Game } from "../../store";

const PLATFORM_COLORS: Record<string, string> = {
  steam: "#1a9fff",
  epic: "#a0a0a0",
  gog: "#a855f7",
  standalone: "#22c55e",
};

const SORT_OPTIONS = [
  { value: "title", label: "Název A-Z" },
  { value: "title_desc", label: "Název Z-A" },
  { value: "playtime", label: "Nejvíce hráno" },
  { value: "last_played", label: "Naposledy hráno" },
  { value: "added", label: "Naposledy přidáno" },
];

export function LibraryPage() {
  const {
    games, collections, librarySidebarFilter, librarySearch, libraryView,
    launching, scanning, selectedGameId,
    setLibrarySearch, setLibraryView,
    setSelectedGame, launchGame, scanGames,
  } = useStore();

  const [showAddDialog, setShowAddDialog] = useState(false);
  const [sortBy, setSortBy] = useState("title");
  const [showSortMenu, setShowSortMenu] = useState(false);

  const filtered = useMemo(() => {
    let list = [...games];

    // Filter by sidebar
    if (librarySidebarFilter === "recent") {
      list = list.filter((g) => g.last_played);
      list.sort((a, b) => (b.last_played ?? "").localeCompare(a.last_played ?? ""));
    } else if (librarySidebarFilter === "unplayed") {
      list = list.filter((g) => g.playtime_hours < 0.01);
    } else if (librarySidebarFilter !== "all" && !librarySidebarFilter.startsWith("col_")) {
      list = list.filter((g) => g.platform === librarySidebarFilter);
    }

    // Search
    if (librarySearch) {
      list = list.filter((g) =>
        g.title.toLowerCase().includes(librarySearch.toLowerCase()) ||
        (g.genre ?? "").toLowerCase().includes(librarySearch.toLowerCase())
      );
    }

    // Sort
    switch (sortBy) {
      case "title": list.sort((a, b) => a.title.localeCompare(b.title)); break;
      case "title_desc": list.sort((a, b) => b.title.localeCompare(a.title)); break;
      case "playtime": list.sort((a, b) => b.playtime_hours - a.playtime_hours); break;
      case "last_played": list.sort((a, b) => (b.last_played ?? "").localeCompare(a.last_played ?? "")); break;
      case "added": list.sort((a, b) => b.added_at.localeCompare(a.added_at)); break;
    }

    return list;
  }, [games, librarySidebarFilter, librarySearch, sortBy]);

  const platforms = useMemo(() => [...new Set(games.map((g) => g.platform))], [games]);

  return (
    <div className="flex-1 flex overflow-hidden bg-[#1b2838]">
      {/* Left sidebar */}
      <LibrarySidebar platforms={platforms} collections={collections} />

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Toolbar */}
        <div className="flex items-center gap-2 px-4 py-2.5 bg-[#2a475e]/30 border-b border-black/30 flex-shrink-0">
          {/* Search */}
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#8f98a0]" />
            <input
              className="w-full bg-[#316282]/20 border border-[#4a8ab5]/30 rounded
                         pl-9 pr-8 py-1.5 text-sm text-[#c7d5e0] placeholder-[#8f98a0]
                         focus:outline-none focus:border-[#67c1f5]/50"
              placeholder="Hledat v knihovně..."
              value={librarySearch}
              onChange={(e) => setLibrarySearch(e.target.value)}
            />
            {librarySearch && (
              <button onClick={() => setLibrarySearch("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-[#8f98a0] hover:text-[#c7d5e0]">
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Sort */}
          <div className="relative">
            <button
              onClick={() => setShowSortMenu(!showSortMenu)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#2a475e] hover:bg-[#316282]
                         text-[#8f98a0] hover:text-[#c7d5e0] text-xs rounded transition"
            >
              <Filter className="w-3.5 h-3.5" />
              {SORT_OPTIONS.find(s => s.value === sortBy)?.label}
              <ChevronDown className="w-3 h-3" />
            </button>
            {showSortMenu && (
              <div className="absolute top-full mt-1 right-0 bg-[#2a475e] border border-[#4a8ab5]/30
                              rounded shadow-xl z-50 min-w-[140px]">
                {SORT_OPTIONS.map(opt => (
                  <button key={opt.value}
                    onClick={() => { setSortBy(opt.value); setShowSortMenu(false); }}
                    className={`w-full text-left px-3 py-2 text-xs hover:bg-[#316282] transition
                      ${sortBy === opt.value ? "text-[#67c1f5]" : "text-[#c7d5e0]"}`}>
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* View toggle */}
          <div className="flex gap-0.5 bg-[#2a475e] rounded p-0.5">
            <button onClick={() => setLibraryView("grid")}
              className={`p-1.5 rounded transition ${libraryView === "grid" ? "bg-[#67c1f5] text-[#1b2838]" : "text-[#8f98a0] hover:text-[#c7d5e0]"}`}>
              <Grid3X3 className="w-3.5 h-3.5" />
            </button>
            <button onClick={() => setLibraryView("list")}
              className={`p-1.5 rounded transition ${libraryView === "list" ? "bg-[#67c1f5] text-[#1b2838]" : "text-[#8f98a0] hover:text-[#c7d5e0]"}`}>
              <List className="w-3.5 h-3.5" />
            </button>
          </div>

          <button onClick={() => setShowAddDialog(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#2a475e] hover:bg-[#316282]
                       text-[#c7d5e0] text-xs rounded transition">
            <Plus className="w-3.5 h-3.5" /> Přidat
          </button>

          <button onClick={scanGames} disabled={scanning}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#4c6b22] hover:bg-[#5a7d28]
                       disabled:opacity-50 text-white text-xs rounded transition">
            <RefreshCw className={`w-3.5 h-3.5 ${scanning ? "animate-spin" : ""}`} />
            {scanning ? "Skenuji..." : "Skenovat"}
          </button>
        </div>

        {/* Stats */}
        <div className="px-4 py-1.5 text-xs text-[#8f98a0] bg-[#2a475e]/10 border-b border-black/20 flex-shrink-0">
          {filtered.length} her {librarySearch && `· "${librarySearch}"`}
        </div>

        {/* Game grid/list */}
        <div className="flex-1 flex overflow-hidden">
          <div className="flex-1 overflow-y-auto">
            {filtered.length === 0 ? (
              <EmptyLibrary onScan={scanGames} scanning={scanning} />
            ) : libraryView === "grid" ? (
              <GameGrid games={filtered} launching={launching}
                selectedId={selectedGameId}
                onSelect={setSelectedGame} onLaunch={launchGame} />
            ) : (
              <GameList games={filtered} launching={launching}
                selectedId={selectedGameId}
                onSelect={setSelectedGame} onLaunch={launchGame} />
            )}
          </div>

          {/* Right game panel */}
          <AnimatePresence>
            {selectedGameId !== null && <GamePanel key={selectedGameId} />}
          </AnimatePresence>
        </div>
      </div>

      {showAddDialog && (
        <AddGameDialog
          onClose={() => setShowAddDialog(false)}
          onAdd={async (title, exe) => {
            await useStore.getState().addGameManual(title, exe);
            setShowAddDialog(false);
          }}
        />
      )}
    </div>
  );
}

// ─── Library Sidebar ──────────────────────────────────────────────────────────

function LibrarySidebar({ platforms, collections }: { platforms: string[]; collections: any[] }) {
  const { librarySidebarFilter, setLibrarySidebarFilter, games } = useStore();

  const Item = ({ id, label, count }: { id: string; label: string; count?: number }) => (
    <button
      onClick={() => setLibrarySidebarFilter(id)}
      className={`w-full flex items-center justify-between px-3 py-1.5 text-sm rounded transition
        ${librarySidebarFilter === id
          ? "bg-[#2a475e] text-[#c7d5e0]"
          : "text-[#8f98a0] hover:bg-[#2a475e]/50 hover:text-[#c7d5e0]"}`}
    >
      <span className="truncate">{label}</span>
      {count !== undefined && <span className="text-xs text-[#8f98a0] ml-1">{count}</span>}
    </button>
  );

  return (
    <div className="w-52 flex-shrink-0 bg-[#131e2b] border-r border-black/40 overflow-y-auto flex flex-col">
      <div className="px-2 py-3 space-y-0.5">
        <p className="px-3 py-1 text-[10px] font-semibold text-[#8f98a0] uppercase tracking-widest">Knihovna</p>
        <Item id="all" label="Všechny hry" count={games.length} />
        <Item id="recent" label="Naposledy hrané" />
        <Item id="unplayed" label="Nehráno" count={games.filter(g => g.playtime_hours < 0.01).length} />
      </div>

      {platforms.length > 0 && (
        <div className="px-2 py-2 space-y-0.5">
          <p className="px-3 py-1 text-[10px] font-semibold text-[#8f98a0] uppercase tracking-widest">Platformy</p>
          {platforms.map(p => (
            <button key={p} onClick={() => setLibrarySidebarFilter(p)}
              className={`w-full flex items-center gap-2 px-3 py-1.5 text-sm rounded transition
                ${librarySidebarFilter === p ? "bg-[#2a475e] text-[#c7d5e0]" : "text-[#8f98a0] hover:bg-[#2a475e]/50 hover:text-[#c7d5e0]"}`}>
              <span className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ background: PLATFORM_COLORS[p] ?? "#6b7280" }} />
              <span className="capitalize truncate">{p}</span>
              <span className="ml-auto text-xs text-[#8f98a0]">
                {games.filter(g => g.platform === p).length}
              </span>
            </button>
          ))}
        </div>
      )}

      {collections.length > 0 && (
        <div className="px-2 py-2 space-y-0.5">
          <p className="px-3 py-1 text-[10px] font-semibold text-[#8f98a0] uppercase tracking-widest">Kolekce</p>
          {collections.map(col => (
            <button key={col.id} onClick={() => setLibrarySidebarFilter(`col_${col.id}`)}
              className={`w-full flex items-center gap-2 px-3 py-1.5 text-sm rounded transition
                ${librarySidebarFilter === `col_${col.id}` ? "bg-[#2a475e] text-[#c7d5e0]" : "text-[#8f98a0] hover:bg-[#2a475e]/50 hover:text-[#c7d5e0]"}`}>
              <span className="w-2 h-2 rounded-full" style={{ background: col.color }} />
              <span className="truncate">{col.name}</span>
              <span className="ml-auto text-xs text-[#8f98a0]">{col.game_count}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Game Grid ────────────────────────────────────────────────────────────────

function GameGrid({ games, launching, selectedId, onSelect, onLaunch }: {
  games: Game[]; launching: Set<number>; selectedId: number | null;
  onSelect: (id: number) => void; onLaunch: (g: Game) => void;
}) {
  return (
    <div className="p-4 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 2xl:grid-cols-8 gap-2">
      {games.map((game) => (
        <motion.div key={game.id} layout
          initial={{ opacity: 0, scale: 0.93 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`group relative cursor-pointer rounded overflow-hidden transition-all
            ${selectedId === game.id
              ? "ring-2 ring-[#67c1f5]"
              : "ring-1 ring-white/5 hover:ring-[#67c1f5]/40"}`}
          onClick={() => onSelect(game.id)}
        >
          <div className="aspect-[3/4] bg-[#2a3f5f] relative overflow-hidden">
            {game.cover_url ? (
              <img src={game.cover_url} alt={game.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-4xl font-bold text-[#4a8ab5]/30">{game.title[0]?.toUpperCase()}</span>
              </div>
            )}

            {/* Hover overlay */}
            <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity
                            flex items-end justify-center pb-3">
              <button onClick={(e) => { e.stopPropagation(); onLaunch(game); }}
                className="flex items-center gap-1.5 bg-[#4c6b22] hover:bg-[#5a7d28]
                           text-white text-xs font-medium px-3 py-1.5 rounded transition">
                <Play className="w-3 h-3 fill-white" />
                {launching.has(game.id) ? "Spouštím..." : "Hrát"}
              </button>
            </div>

            {/* Platform dot */}
            <span className="absolute top-1 left-1 w-2 h-2 rounded-full"
              style={{ background: PLATFORM_COLORS[game.platform] ?? "#6b7280" }} />
          </div>

          <div className="bg-[#16202d] px-1.5 py-1">
            <p className="text-[11px] font-medium text-[#c7d5e0] truncate">{game.title}</p>
            <p className="text-[10px] text-[#8f98a0]">
              {game.playtime_hours > 0.01 ? `${game.playtime_hours.toFixed(1)}h` : "Nehráno"}
            </p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

// ─── Game List ────────────────────────────────────────────────────────────────

function GameList({ games, launching, selectedId, onSelect, onLaunch }: {
  games: Game[]; launching: Set<number>; selectedId: number | null;
  onSelect: (id: number) => void; onLaunch: (g: Game) => void;
}) {
  return (
    <div className="p-2">
      {/* Header */}
      <div className="flex items-center px-3 py-1 text-[10px] text-[#8f98a0] uppercase tracking-wider border-b border-white/5 mb-1">
        <span className="w-8" />
        <span className="flex-1">Název</span>
        <span className="w-24 text-right">Odehráno</span>
        <span className="w-28 text-right">Naposledy hráno</span>
        <span className="w-20" />
      </div>

      {games.map((game) => (
        <div key={game.id}
          onClick={() => onSelect(game.id)}
          className={`flex items-center px-3 py-2 rounded cursor-pointer group transition
            ${selectedId === game.id ? "bg-[#2a475e] text-[#c7d5e0]" : "hover:bg-[#2a475e]/50 text-[#8f98a0] hover:text-[#c7d5e0]"}`}
        >
          <div className="w-8 flex-shrink-0">
            <div className="w-6 h-8 rounded overflow-hidden bg-[#2a3f5f]">
              {game.cover_url && <img src={game.cover_url} className="w-full h-full object-cover" alt="" />}
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate text-[#c7d5e0]">{game.title}</p>
            <p className="text-[10px] text-[#8f98a0] capitalize">{game.platform} · {game.genre ?? "—"}</p>
          </div>
          <div className="w-24 text-right text-xs">
            {game.playtime_hours > 0.01 ? (
              <span className="flex items-center gap-1 justify-end">
                <Clock className="w-3 h-3" />{game.playtime_hours.toFixed(1)}h
              </span>
            ) : "—"}
          </div>
          <div className="w-28 text-right text-xs">
            {game.last_played ? new Date(game.last_played).toLocaleDateString("cs-CZ") : "—"}
          </div>
          <div className="w-20 flex justify-end">
            <button onClick={(e) => { e.stopPropagation(); onLaunch(game); }}
              className="opacity-0 group-hover:opacity-100 flex items-center gap-1 bg-[#4c6b22]
                         hover:bg-[#5a7d28] text-white text-xs px-2.5 py-1 rounded transition">
              <Play className="w-3 h-3 fill-white" />
              {launching.has(game.id) ? "..." : "Hrát"}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Game Panel (right side detail) ──────────────────────────────────────────

function GamePanel() {
  const { games, selectedGameId, setSelectedGame, launchGame, launching, deleteGame } = useStore();
  const game = games.find((g) => g.id === selectedGameId);
  if (!game) return null;

  return (
    <motion.div
      initial={{ x: 20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 20, opacity: 0 }}
      className="w-72 flex-shrink-0 bg-[#16202d] border-l border-black/40 overflow-y-auto flex flex-col"
    >
      {/* Hero image */}
      <div className="relative h-40 flex-shrink-0 overflow-hidden">
        {game.cover_url ? (
          <>
            <div className="absolute inset-0 bg-cover bg-center scale-110 blur-sm opacity-50"
              style={{ backgroundImage: `url(${game.cover_url})` }} />
            <img src={game.cover_url} alt={game.title}
              className="relative w-full h-full object-contain" />
          </>
        ) : (
          <div className="h-full bg-[#2a3f5f] flex items-center justify-center">
            <span className="text-5xl font-bold text-white/10">{game.title[0]?.toUpperCase()}</span>
          </div>
        )}
        <button onClick={() => setSelectedGame(null)}
          className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/50 hover:bg-black/80
                     text-white text-xs flex items-center justify-center transition">
          ✕
        </button>
      </div>

      <div className="flex-1 px-4 py-3 flex flex-col gap-3">
        <div>
          <h2 className="text-[#c7d5e0] font-bold text-sm leading-tight">{game.title}</h2>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-[10px] px-1.5 py-0.5 rounded capitalize"
              style={{ background: `${PLATFORM_COLORS[game.platform]}22`, color: PLATFORM_COLORS[game.platform] ?? "#8f98a0" }}>
              {game.platform}
            </span>
            {game.genre && <span className="text-[10px] text-[#8f98a0]">{game.genre}</span>}
          </div>
        </div>

        {/* Play button */}
        <button onClick={() => launchGame(game)}
          disabled={launching.has(game.id)}
          className="w-full py-2.5 bg-[#4c6b22] hover:bg-[#5a7d28] disabled:opacity-50
                     text-white text-sm font-medium rounded flex items-center justify-center gap-2 transition">
          <Play className="w-4 h-4 fill-white" />
          {launching.has(game.id) ? "Spouštím..." : "Hrát"}
        </button>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-2">
          <StatBox label="Odehráno"
            value={game.playtime_hours > 0.01 ? `${game.playtime_hours.toFixed(1)}h` : "Nehráno"} />
          <StatBox label="Vydáno" value={game.release_date ?? "—"} />
        </div>

        {/* Description */}
        {game.description && (
          <p className="text-[11px] text-[#8f98a0] leading-relaxed line-clamp-4">{game.description}</p>
        )}

        {/* Path */}
        <div>
          <p className="text-[10px] text-[#8f98a0] mb-1">Cesta ke hře</p>
          <p className="text-[10px] text-[#4a8ab5] font-mono break-all bg-[#1b2838] rounded px-2 py-1.5">
            {game.executable}
          </p>
        </div>

        {/* Delete */}
        <button onClick={() => { if (confirm(`Odebrat "${game.title}"?`)) deleteGame(game.id); }}
          className="text-xs text-red-400/60 hover:text-red-400 hover:bg-red-400/10 py-1.5 rounded transition">
          Odebrat z knihovny
        </button>
      </div>
    </motion.div>
  );
}

function StatBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-[#1b2838] rounded p-2">
      <p className="text-[10px] text-[#8f98a0]">{label}</p>
      <p className="text-xs font-semibold text-[#c7d5e0] mt-0.5">{value}</p>
    </div>
  );
}

function EmptyLibrary({ onScan, scanning }: { onScan: () => void; scanning: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-4 text-[#8f98a0]">
      <div className="w-16 h-16 rounded-full bg-[#2a475e] flex items-center justify-center">
        <Grid3X3 className="w-7 h-7" />
      </div>
      <div className="text-center">
        <p className="text-sm font-medium text-[#c7d5e0]">Knihovna je prázdná</p>
        <p className="text-xs mt-1">Spusť skenování nebo přidej hry ručně</p>
      </div>
      <button onClick={onScan} disabled={scanning}
        className="px-5 py-2 bg-[#4c6b22] hover:bg-[#5a7d28] disabled:opacity-50 text-white text-sm rounded transition">
        {scanning ? "Skenuji..." : "Skenovat hry"}
      </button>
    </div>
  );
}

function AddGameDialog({ onClose, onAdd }: {
  onClose: () => void;
  onAdd: (title: string, executable: string) => Promise<void>;
}) {
  const [title, setTitle] = useState("");
  const [executable, setExecutable] = useState("");
  const [adding, setAdding] = useState(false);

  async function handleAdd() {
    if (!title.trim() || !executable.trim()) return;
    setAdding(true);
    await onAdd(title.trim(), executable.trim());
    setAdding(false);
  }

  return (
    <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-[#2a3f5f] border border-[#4a8ab5]/30 rounded-lg p-5 w-96 shadow-2xl"
        onClick={e => e.stopPropagation()}>
        <h2 className="text-sm font-semibold text-[#c7d5e0] mb-4">Přidat hru ručně</h2>
        <div className="space-y-3">
          <div>
            <label className="block text-xs text-[#8f98a0] mb-1">Název hry</label>
            <input autoFocus
              className="w-full bg-[#1b2838] border border-[#4a8ab5]/30 rounded px-3 py-2
                         text-sm text-[#c7d5e0] placeholder-[#8f98a0]/50
                         focus:outline-none focus:border-[#67c1f5]/50"
              placeholder="The Witcher 3" value={title}
              onChange={e => setTitle(e.target.value)} />
          </div>
          <div>
            <label className="block text-xs text-[#8f98a0] mb-1">Cesta ke .exe souboru</label>
            <input
              className="w-full bg-[#1b2838] border border-[#4a8ab5]/30 rounded px-3 py-2
                         text-sm text-[#c7d5e0] placeholder-[#8f98a0]/50 font-mono
                         focus:outline-none focus:border-[#67c1f5]/50"
              placeholder="C:\Games\witcher3.exe" value={executable}
              onChange={e => setExecutable(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleAdd()} />
          </div>
        </div>
        <div className="flex gap-2 mt-4 justify-end">
          <button onClick={onClose} className="px-4 py-1.5 text-sm text-[#8f98a0] hover:text-[#c7d5e0] transition">
            Zrušit
          </button>
          <button onClick={handleAdd} disabled={!title.trim() || !executable.trim() || adding}
            className="px-4 py-1.5 bg-[#4c6b22] hover:bg-[#5a7d28] disabled:opacity-40
                       text-white text-sm rounded transition">
            {adding ? "Přidávám..." : "Přidat"}
          </button>
        </div>
      </div>
    </div>
  );
}
