import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { Users, Clock, Globe, RefreshCw, UserCheck, Monitor, Gamepad2 } from "lucide-react";
import { useStore, SteamProfile } from "../../store";

interface SteamFriend {
  steam_id: string;
  relationship: string;
  friend_since: number;
  persona_name?: string;
  avatar_url?: string;
  persona_state?: number;
}

interface SteamOwnedGame {
  appid: number;
  name?: string;
  playtime_forever: number;
  img_icon_url?: string;
}

const STATUS_COLORS: Record<number, string> = {
  0: "#6b7280", 1: "#57cbde", 2: "#c6423a", 3: "#c6923a",
};
const STATUS_LABELS: Record<number, string> = {
  0: "Offline", 1: "Online", 2: "Zaneprázdněn", 3: "Pryč",
};

export function CommunityPage() {
  const { settings, steamProfile, loadSteamProfile, steamLoading } = useStore();
  const [friends, setFriends] = useState<SteamFriend[]>([]);
  const [ownedGames, setOwnedGames] = useState<SteamOwnedGame[]>([]);
  const [loadingFriends, setLoadingFriends] = useState(false);
  const [loadingGames, setLoadingGames] = useState(false);
  const [activeTab, setActiveTab] = useState<"profile" | "friends" | "games">("profile");
  const [, setError] = useState<string | null>(null);

  const noSetup = !settings.steam_api_key || !settings.steam_id;

  useEffect(() => {
    if (!noSetup && !steamProfile) loadSteamProfile();
  }, [settings.steam_api_key, settings.steam_id]);

  async function loadFriends() {
    setLoadingFriends(true);
    setError(null);
    try {
      const data = await invoke<SteamFriend[]>("steam_get_friends");
      setFriends(data);
    } catch (e: any) {
      setError(e);
    } finally {
      setLoadingFriends(false);
    }
  }

  async function loadOwnedGames() {
    setLoadingGames(true);
    try {
      const data = await invoke<SteamOwnedGame[]>("steam_get_owned_games");
      setOwnedGames(data.sort((a, b) => b.playtime_forever - a.playtime_forever));
    } catch {}
    finally { setLoadingGames(false); }
  }

  if (noSetup) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-4 bg-[#1b2838] text-[#c7d5e0]">
        <div className="w-16 h-16 rounded-full bg-[#2a475e] flex items-center justify-center">
          <Users className="w-8 h-8 opacity-50" />
        </div>
        <div className="text-center">
          <p className="text-lg font-semibold">Steam API není nastaven</p>
          <p className="text-sm text-[#8f98a0] mt-1">Jdi do Nastavení a zadej Steam API klíč a Steam ID</p>
        </div>
        <button onClick={() => useStore.getState().setActiveSection("settings")}
          className="px-6 py-2 bg-[#4c6b22] hover:bg-[#5a7d28] text-white text-sm rounded transition">
          Otevřít Nastavení
        </button>
      </div>
    );
  }

  return (
    <div className="flex-1 flex overflow-hidden bg-[#1b2838]">
      {/* Profile sidebar */}
      <div className="w-72 flex-shrink-0 bg-[#131e2b] border-r border-black/40 flex flex-col overflow-y-auto">
        {steamLoading ? (
          <div className="flex items-center justify-center h-32">
            <div className="w-6 h-6 border-2 border-[#67c1f5] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : steamProfile ? (
          <ProfileCard profile={steamProfile} />
        ) : (
          <div className="p-4 text-center">
            <p className="text-sm text-[#8f98a0]">Nelze načíst profil</p>
            <button onClick={loadSteamProfile}
              className="mt-2 text-xs text-[#67c1f5] hover:underline">Zkusit znovu</button>
          </div>
        )}

        {/* Nav tabs */}
        <div className="px-2 mt-2 space-y-0.5">
          {[
            { id: "profile" as const, label: "Profil", icon: <UserCheck className="w-4 h-4" /> },
            { id: "friends" as const, label: `Přátelé (${friends.length})`, icon: <Users className="w-4 h-4" /> },
            { id: "games" as const, label: `Hry (${ownedGames.length})`, icon: <Gamepad2 className="w-4 h-4" /> },
          ].map(tab => (
            <button key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                if (tab.id === "friends" && friends.length === 0) loadFriends();
                if (tab.id === "games" && ownedGames.length === 0) loadOwnedGames();
              }}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded text-sm transition
                ${activeTab === tab.id
                  ? "bg-[#2a475e] text-[#c7d5e0]"
                  : "text-[#8f98a0] hover:bg-[#2a475e]/50 hover:text-[#c7d5e0]"}`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-y-auto p-6">
        {activeTab === "profile" && steamProfile && (
          <ProfileDetails profile={steamProfile} games={ownedGames} onLoadGames={loadOwnedGames} />
        )}
        {activeTab === "friends" && (
          <FriendsList friends={friends} loading={loadingFriends} onRefresh={loadFriends} />
        )}
        {activeTab === "games" && (
          <OwnedGamesList games={ownedGames} loading={loadingGames} onRefresh={loadOwnedGames} />
        )}
      </div>
    </div>
  );
}

function ProfileCard({ profile }: { profile: SteamProfile }) {
  return (
    <div className="relative">
      <div className="h-20 bg-gradient-to-b from-[#2a3f5f] to-[#131e2b]" />
      <div className="px-4 pb-4">
        <div className="relative -mt-8 mb-3">
          <div className="relative inline-block">
            <img src={profile.avatar_full} className="w-16 h-16 rounded" alt={profile.persona_name} />
            <span
              className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-[#131e2b]"
              style={{ background: STATUS_COLORS[profile.persona_state] ?? "#6b7280" }}
            />
          </div>
        </div>
        <h2 className="text-[#c7d5e0] font-bold text-sm">{profile.persona_name}</h2>
        {profile.real_name && <p className="text-xs text-[#8f98a0] mt-0.5">{profile.real_name}</p>}
        <div className="flex items-center gap-1.5 mt-1">
          <span className="text-xs" style={{ color: STATUS_COLORS[profile.persona_state] ?? "#6b7280" }}>
            ●
          </span>
          <span className="text-xs text-[#8f98a0]">{STATUS_LABELS[profile.persona_state] ?? "Offline"}</span>
          {profile.loc_country && (
            <span className="flex items-center gap-1 text-xs text-[#8f98a0] ml-auto">
              <Globe className="w-3 h-3" /> {profile.loc_country}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function ProfileDetails({ profile, games, onLoadGames }: {
  profile: SteamProfile; games: SteamOwnedGame[]; onLoadGames: () => void;
}) {
  const totalHours = games.reduce((sum, g) => sum + g.playtime_forever / 60, 0);
  const top5 = games.slice(0, 5);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-[#c7d5e0]">{profile.persona_name}</h2>
        <p className="text-sm text-[#8f98a0]">Steam ID: {profile.steam_id}</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-3 gap-3">
        <StatsCard label="Celkem her" value={games.length > 0 ? games.length.toString() : "—"} icon={<Gamepad2 className="w-4 h-4 text-[#67c1f5]" />} />
        <StatsCard label="Odehráno hodin" value={games.length > 0 ? `${Math.round(totalHours)}h` : "—"} icon={<Clock className="w-4 h-4 text-[#67c1f5]" />} />
        <StatsCard label="Stav" value={STATUS_LABELS[profile.persona_state] ?? "Offline"} icon={<Monitor className="w-4 h-4 text-[#67c1f5]" />} />
      </div>

      {/* Top games */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-[#c7d5e0]">Nejhranější hry</h3>
          {games.length === 0 && (
            <button onClick={onLoadGames} className="text-xs text-[#67c1f5] hover:underline">Načíst hry</button>
          )}
        </div>
        {top5.length > 0 ? (
          <div className="space-y-2">
            {top5.map((game) => (
              <div key={game.appid} className="flex items-center gap-3 p-2 rounded bg-[#2a3f5f]/30">
                <img
                  src={`https://cdn.cloudflare.steamstatic.com/steam/apps/${game.appid}/header.jpg`}
                  className="w-12 h-8 rounded object-cover flex-shrink-0"
                  alt={game.name ?? ""}
                  onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-[#c7d5e0] truncate">{game.name ?? `App ${game.appid}`}</p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <div className="flex-1 h-1 bg-[#2a475e] rounded-full overflow-hidden">
                      <div className="h-full bg-[#4c6b22] rounded-full"
                        style={{ width: `${Math.min((game.playtime_forever / (top5[0]?.playtime_forever || 1)) * 100, 100)}%` }} />
                    </div>
                    <span className="text-[10px] text-[#8f98a0] flex-shrink-0">
                      {(game.playtime_forever / 60).toFixed(1)}h
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-[#8f98a0]">Klikni na "Načíst hry" nebo přejdi na záložku Hry</p>
        )}
      </div>
    </div>
  );
}

function FriendsList({ friends, loading, onRefresh }: {
  friends: SteamFriend[]; loading: boolean; onRefresh: () => void;
}) {
  const online = friends.filter(f => f.persona_state && f.persona_state > 0);
  const offline = friends.filter(f => !f.persona_state || f.persona_state === 0);

  if (loading) return (
    <div className="flex items-center justify-center h-32">
      <div className="w-6 h-6 border-2 border-[#67c1f5] border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (friends.length === 0) return (
    <div className="flex flex-col items-center gap-3 py-12">
      <Users className="w-12 h-12 text-[#4a8ab5]/30" />
      <p className="text-sm text-[#8f98a0]">Žádní přátelé</p>
      <button onClick={onRefresh} className="text-xs text-[#67c1f5] hover:underline flex items-center gap-1">
        <RefreshCw className="w-3 h-3" /> Načíst přátele
      </button>
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-[#c7d5e0]">Přátelé ({friends.length})</h2>
        <button onClick={onRefresh} className="text-xs text-[#67c1f5] hover:underline flex items-center gap-1">
          <RefreshCw className="w-3 h-3" /> Obnovit
        </button>
      </div>

      {online.length > 0 && (
        <div>
          <p className="text-[10px] text-[#8f98a0] uppercase tracking-wider mb-2">Online — {online.length}</p>
          <FriendGroup friends={online} />
        </div>
      )}
      {offline.length > 0 && (
        <div>
          <p className="text-[10px] text-[#8f98a0] uppercase tracking-wider mb-2">Offline — {offline.length}</p>
          <FriendGroup friends={offline} />
        </div>
      )}
    </div>
  );
}

function FriendGroup({ friends }: { friends: SteamFriend[] }) {
  return (
    <div className="grid grid-cols-1 gap-1">
      {friends.map(f => (
        <div key={f.steam_id} className="flex items-center gap-3 px-3 py-2 rounded hover:bg-[#2a475e]/50 transition">
          <div className="relative flex-shrink-0">
            {f.avatar_url ? (
              <img src={f.avatar_url} className="w-9 h-9 rounded" alt={f.persona_name ?? ""} />
            ) : (
              <div className="w-9 h-9 rounded bg-[#2a475e] flex items-center justify-center">
                <Users className="w-4 h-4 text-[#4a8ab5]" />
              </div>
            )}
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-[#131e2b]"
              style={{ background: STATUS_COLORS[f.persona_state ?? 0] }} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-[#c7d5e0] truncate">{f.persona_name ?? f.steam_id}</p>
            <p className="text-[10px]" style={{ color: STATUS_COLORS[f.persona_state ?? 0] }}>
              {STATUS_LABELS[f.persona_state ?? 0]}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

function OwnedGamesList({ games, loading, onRefresh }: {
  games: SteamOwnedGame[]; loading: boolean; onRefresh: () => void;
}) {
  if (loading) return (
    <div className="flex items-center justify-center h-32">
      <div className="w-6 h-6 border-2 border-[#67c1f5] border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-[#c7d5e0]">Steam hry ({games.length})</h2>
        <button onClick={onRefresh} className="text-xs text-[#67c1f5] hover:underline flex items-center gap-1">
          <RefreshCw className="w-3 h-3" /> Obnovit
        </button>
      </div>
      <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
        {games.map(g => (
          <div key={g.appid} className="group cursor-pointer" title={g.name ?? `App ${g.appid}`}>
            <div className="aspect-[3/4] rounded overflow-hidden bg-[#2a3f5f]">
              <img
                src={`https://cdn.cloudflare.steamstatic.com/steam/apps/${g.appid}/library_600x900.jpg`}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                alt={g.name ?? ""}
                onError={(e) => {
                  const img = e.target as HTMLImageElement;
                  img.src = `https://cdn.cloudflare.steamstatic.com/steam/apps/${g.appid}/header.jpg`;
                }}
              />
            </div>
            <p className="text-[10px] text-[#8f98a0] mt-1 truncate">{g.name ?? `App ${g.appid}`}</p>
            {g.playtime_forever > 0 && (
              <p className="text-[10px] text-[#4a8ab5]">{(g.playtime_forever / 60).toFixed(0)}h</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function StatsCard({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <div className="bg-[#2a3f5f]/30 rounded-lg p-3">
      <div className="flex items-center gap-1.5 mb-1">{icon}<span className="text-xs text-[#8f98a0]">{label}</span></div>
      <p className="text-sm font-bold text-[#c7d5e0]">{value}</p>
    </div>
  );
}
