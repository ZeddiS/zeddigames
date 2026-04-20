import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { motion } from "framer-motion";
import { Star, Search, Flame, TrendingUp, Award, ExternalLink } from "lucide-react";
import { useStore } from "../../store";

interface RawgGame {
  id: number;
  name: string;
  background_image?: string;
  rating?: number;
  released?: string;
  genres?: { id: number; name: string }[];
  metacritic?: number;
  playtime?: number;
}

interface RawgResult { count: number; results: RawgGame[]; }

const GENRES = [
  { slug: "action", label: "Akce" },
  { slug: "rpg", label: "RPG" },
  { slug: "shooter", label: "Střílečky" },
  { slug: "adventure", label: "Dobrodružství" },
  { slug: "strategy", label: "Strategie" },
  { slug: "sports", label: "Sport" },
  { slug: "simulation", label: "Simulace" },
  { slug: "puzzle", label: "Puzzle" },
];


export function StorePage() {
  const { settings } = useStore();
  const [featured, setFeatured] = useState<RawgGame[]>([]);
  const [trending, setTrending] = useState<RawgGame[]>([]);
  const [topRated, setTopRated] = useState<RawgGame[]>([]);
  const [loading, setLoading] = useState(true);
  const [heroIdx, setHeroIdx] = useState(0);
  const [selectedGame, setSelectedGame] = useState<RawgGame | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<RawgGame[]>([]);
  const [activeGenre, setActiveGenre] = useState<string | null>(null);
  const [genreGames, setGenreGames] = useState<RawgGame[]>([]);
  const [noApiKey, setNoApiKey] = useState(false);

  useEffect(() => {
    loadStore();
  }, [settings.rawg_api_key]);

  async function loadStore() {
    if (!settings.rawg_api_key) { setNoApiKey(true); setLoading(false); return; }
    setNoApiKey(false);
    setLoading(true);
    try {
      const [feat, top] = await Promise.all([
        invoke<RawgResult>("rawg_browse", { ordering: "-added", page: 1 }),
        invoke<RawgResult>("rawg_browse", { ordering: "-rating", page: 1 }),
      ]);
      setFeatured(feat.results.slice(0, 5));
      setTrending(feat.results.slice(5, 15));
      setTopRated(top.results.slice(0, 10));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const id = setInterval(() => setHeroIdx((i) => (i + 1) % Math.max(featured.length, 1)), 5000);
    return () => clearInterval(id);
  }, [featured.length]);

  async function handleSearch(q: string) {
    setSearchQuery(q);
    if (q.length < 2) { setSearchResults([]); return; }
    try {
      const res = await invoke<RawgResult>("rawg_search", { query: q, page: 1 });
      setSearchResults(res.results);
    } catch {}
  }

  async function handleGenre(slug: string) {
    setActiveGenre(slug);
    setSelectedGame(null);
    try {
      const res = await invoke<RawgResult>("rawg_browse", { genre: slug, ordering: "-rating", page: 1 });
      setGenreGames(res.results);
    } catch {}
  }

  if (noApiKey) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-4 bg-[#1b2838] text-[#c7d5e0]">
        <div className="w-16 h-16 rounded-full bg-[#2a3f5f] flex items-center justify-center">
          <Store className="w-8 h-8 opacity-50" />
        </div>
        <div className="text-center">
          <p className="text-lg font-semibold">RAWG API klíč není nastaven</p>
          <p className="text-sm text-[#8f98a0] mt-1">Jdi do Nastavení a zadej svůj RAWG API klíč (zdarma na rawg.io)</p>
        </div>
        <button
          onClick={() => useStore.getState().setActiveSection("settings")}
          className="px-6 py-2 bg-[#4c6b22] hover:bg-[#5a7d28] text-white text-sm font-medium rounded transition"
        >
          Otevřít Nastavení
        </button>
      </div>
    );
  }

  const hero = featured[heroIdx];

  return (
    <div className="flex-1 flex overflow-hidden bg-[#1b2838]">
      {/* Left: Game detail panel */}
      {selectedGame && (
        <GameDetailPanel game={selectedGame} onClose={() => setSelectedGame(null)} />
      )}

      <div className="flex-1 overflow-y-auto">
        {/* Search bar */}
        <div className="sticky top-0 z-10 bg-[#1b2838]/95 backdrop-blur px-6 py-3 border-b border-black/30">
          <div className="relative max-w-lg">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8f98a0]" />
            <input
              className="w-full bg-[#316282]/30 border border-[#4a8ab5]/30 rounded
                         pl-9 pr-4 py-2 text-sm text-[#c7d5e0] placeholder-[#8f98a0]
                         focus:outline-none focus:border-[#67c1f5]/50"
              placeholder="Hledat v obchodě..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-8 h-8 border-2 border-[#67c1f5] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="p-6 space-y-8">
            {/* Search results */}
            {searchQuery.length >= 2 && (
              <Section title="Výsledky hledání" icon={<Search className="w-4 h-4" />}>
                <GameGrid games={searchResults} onSelect={setSelectedGame} />
              </Section>
            )}

            {/* Hero banner */}
            {!searchQuery && hero && (
              <div className="relative rounded-lg overflow-hidden h-72 cursor-pointer group"
                onClick={() => setSelectedGame(hero)}>
                <img src={hero.background_image} className="w-full h-full object-cover
                  group-hover:scale-105 transition-transform duration-500" alt={hero.name} />
                <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
                <div className="absolute bottom-0 left-0 p-6">
                  <h2 className="text-2xl font-bold text-white mb-2">{hero.name}</h2>
                  <div className="flex items-center gap-3">
                    {hero.rating && (
                      <span className="flex items-center gap-1 text-yellow-400 text-sm">
                        <Star className="w-3.5 h-3.5 fill-yellow-400" />
                        {hero.rating.toFixed(1)}
                      </span>
                    )}
                    {hero.genres?.slice(0, 2).map(g => (
                      <span key={g.id} className="text-xs bg-white/20 text-white px-2 py-0.5 rounded">{g.name}</span>
                    ))}
                  </div>
                  <button className="mt-3 px-5 py-2 bg-[#4c6b22] hover:bg-[#5a7d28] text-white
                    text-sm font-medium rounded transition flex items-center gap-1.5">
                    <ExternalLink className="w-3.5 h-3.5" /> Zobrazit detail
                  </button>
                </div>
                {/* Dots */}
                <div className="absolute bottom-4 right-4 flex gap-1">
                  {featured.map((_, i) => (
                    <button key={i} onClick={(e) => { e.stopPropagation(); setHeroIdx(i); }}
                      className={`w-2 h-2 rounded-full transition ${i === heroIdx ? "bg-white" : "bg-white/30"}`} />
                  ))}
                </div>
              </div>
            )}

            {/* Genre filters */}
            {!searchQuery && (
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => { setActiveGenre(null); setGenreGames([]); }}
                  className={`px-3 py-1.5 rounded text-xs font-medium transition
                    ${!activeGenre ? "bg-[#67c1f5] text-[#1b2838]" : "bg-[#2a475e] text-[#c7d5e0] hover:bg-[#316282]"}`}
                >
                  Vše
                </button>
                {GENRES.map(g => (
                  <button key={g.slug} onClick={() => handleGenre(g.slug)}
                    className={`px-3 py-1.5 rounded text-xs font-medium transition
                      ${activeGenre === g.slug ? "bg-[#67c1f5] text-[#1b2838]" : "bg-[#2a475e] text-[#c7d5e0] hover:bg-[#316282]"}`}>
                    {g.label}
                  </button>
                ))}
              </div>
            )}

            {/* Genre results */}
            {activeGenre && genreGames.length > 0 && (
              <Section title={`Žánr: ${GENRES.find(g => g.slug === activeGenre)?.label}`} icon={<TrendingUp className="w-4 h-4" />}>
                <GameGrid games={genreGames} onSelect={setSelectedGame} />
              </Section>
            )}

            {/* Trending */}
            {!searchQuery && !activeGenre && (
              <>
                <Section title="Populární nyní" icon={<Flame className="w-4 h-4 text-orange-400" />}>
                  <GameGrid games={trending} onSelect={setSelectedGame} />
                </Section>
                <Section title="Nejlépe hodnocené" icon={<Award className="w-4 h-4 text-yellow-400" />}>
                  <GameGrid games={topRated} onSelect={setSelectedGame} compact />
                </Section>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function Section({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="flex items-center gap-2 text-[#c7d5e0] font-semibold text-sm mb-3 uppercase tracking-wider">
        {icon} {title}
      </h3>
      {children}
    </div>
  );
}

function GameGrid({ games, onSelect, compact = false }: {
  games: RawgGame[];
  onSelect: (g: RawgGame) => void;
  compact?: boolean;
}) {
  return (
    <div className={`grid gap-3 ${compact
      ? "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5"
      : "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6"
    }`}>
      {games.map((game) => (
        <motion.div
          key={game.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="group cursor-pointer rounded overflow-hidden bg-[#16202d]
                     border border-[#2a3f5f]/50 hover:border-[#67c1f5]/40 transition"
          onClick={() => onSelect(game)}
        >
          <div className="aspect-[3/4] bg-[#2a3f5f] overflow-hidden">
            {game.background_image ? (
              <img src={game.background_image} alt={game.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-[#4a8ab5] text-3xl font-bold">
                {game.name[0]}
              </div>
            )}
          </div>
          <div className="p-2">
            <p className="text-xs font-medium text-[#c7d5e0] truncate">{game.name}</p>
            <div className="flex items-center justify-between mt-1">
              {game.rating ? (
                <span className="flex items-center gap-0.5 text-[10px] text-yellow-400">
                  <Star className="w-2.5 h-2.5 fill-yellow-400" /> {game.rating.toFixed(1)}
                </span>
              ) : <span />}
              {game.metacritic && (
                <span className={`text-[10px] px-1 rounded font-medium
                  ${game.metacritic >= 75 ? "bg-green-600" : game.metacritic >= 50 ? "bg-yellow-600" : "bg-red-600"} text-white`}>
                  {game.metacritic}
                </span>
              )}
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

function GameDetailPanel({ game, onClose }: { game: RawgGame; onClose: () => void }) {
  const [detail, setDetail] = useState<RawgGame | null>(null);
  const { settings } = useStore();

  useEffect(() => {
    if (settings.rawg_api_key) {
      invoke<RawgGame>("rawg_game_detail", { id: game.id })
        .then(setDetail).catch(() => setDetail(game));
    } else {
      setDetail(game);
    }
  }, [game.id]);

  const g = detail ?? game;

  return (
    <motion.div
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className="w-80 flex-shrink-0 bg-[#16202d] border-r border-black/40 overflow-y-auto flex flex-col"
    >
      {/* Hero image */}
      <div className="relative h-44 flex-shrink-0">
        {g.background_image ? (
          <img src={g.background_image} className="w-full h-full object-cover" alt={g.name} />
        ) : (
          <div className="w-full h-full bg-[#2a3f5f]" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#16202d] to-transparent" />
        <button onClick={onClose}
          className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/50 hover:bg-black/80
                     text-white text-xs flex items-center justify-center transition">
          ✕
        </button>
      </div>

      <div className="px-4 py-3 flex flex-col gap-3">
        <h2 className="text-[#c7d5e0] font-bold text-base leading-tight">{g.name}</h2>

        {/* Rating + meta */}
        <div className="flex items-center gap-3">
          {g.rating && (
            <div className="flex items-center gap-1 text-yellow-400 text-sm">
              <Star className="w-3.5 h-3.5 fill-yellow-400" />
              <span className="font-medium">{g.rating.toFixed(1)}</span>
              <span className="text-[#8f98a0] text-xs">/5</span>
            </div>
          )}
          {g.metacritic && (
            <span className={`text-xs px-2 py-0.5 rounded font-bold
              ${g.metacritic >= 75 ? "bg-green-600" : g.metacritic >= 50 ? "bg-yellow-600" : "bg-red-600"} text-white`}>
              {g.metacritic}
            </span>
          )}
        </div>

        {/* Genres */}
        {g.genres && g.genres.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {g.genres.map(genre => (
              <span key={genre.id} className="text-[10px] px-2 py-0.5 rounded-full
                bg-[#2a475e] text-[#67c1f5]">
                {genre.name}
              </span>
            ))}
          </div>
        )}

        {/* Released */}
        {g.released && (
          <p className="text-xs text-[#8f98a0]">
            <span className="text-[#c7d5e0]">Vydáno:</span> {g.released}
          </p>
        )}

        {/* Description */}
        {(g as any).description_raw && (
          <p className="text-xs text-[#8f98a0] leading-relaxed line-clamp-6">
            {(g as any).description_raw}
          </p>
        )}

        {/* Screenshots */}
        {(g as any).short_screenshots?.length > 0 && (
          <div className="space-y-1.5">
            <p className="text-xs font-medium text-[#c7d5e0]">Screenshoty</p>
            <div className="grid grid-cols-2 gap-1">
              {(g as any).short_screenshots.slice(0, 4).map((s: any) => (
                <img key={s.id} src={s.image} className="rounded w-full aspect-video object-cover" alt="" />
              ))}
            </div>
          </div>
        )}

        {/* Install from Steam */}
        <button className="w-full py-2.5 bg-[#4c6b22] hover:bg-[#5a7d28]
                           text-white text-sm font-medium rounded transition">
          Přidat do knihovny
        </button>
      </div>
    </motion.div>
  );
}

// Inline Store icon since we import from lucide
function Store(props: any) {
  return <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
    <line x1="3" y1="6" x2="21" y2="6"/>
    <path d="M16 10a4 4 0 01-8 0"/>
  </svg>;
}
