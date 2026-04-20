import { useState, useEffect } from "react";
import { Save, Eye, EyeOff, ExternalLink, RefreshCw, CheckCircle } from "lucide-react";
import { useStore, AppSettings } from "../../store";

export function SettingsPage() {
  const { settings, loadSettings, saveSettings, settingsLoaded } = useStore();
  const [form, setForm] = useState<AppSettings>(settings);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [showRawgKey, setShowRawgKey] = useState(false);

  useEffect(() => {
    if (!settingsLoaded) loadSettings();
  }, []);

  useEffect(() => {
    setForm(settings);
  }, [settings]);

  async function handleSave() {
    setSaving(true);
    try {
      await saveSettings(form);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } finally {
      setSaving(false);
    }
  }

  const Field = ({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) => (
    <div>
      <label className="block text-xs font-medium text-[#c7d5e0] mb-1">{label}</label>
      {children}
      {hint && <p className="text-[10px] text-[#8f98a0] mt-1">{hint}</p>}
    </div>
  );

  const Input = ({ value, onChange, type = "text", placeholder, mono = false }: {
    value: string; onChange: (v: string) => void;
    type?: string; placeholder?: string; mono?: boolean;
  }) => (
    <input
      type={type} value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className={`w-full bg-[#1b2838] border border-[#4a8ab5]/30 rounded px-3 py-2
                  text-sm text-[#c7d5e0] placeholder-[#8f98a0]/50
                  focus:outline-none focus:border-[#67c1f5]/50 ${mono ? "font-mono" : ""}`}
    />
  );

  return (
    <div className="flex-1 flex flex-col bg-[#1b2838] overflow-y-auto">
      <div className="max-w-2xl mx-auto w-full p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-[#c7d5e0]">Nastavení</h1>
            <p className="text-xs text-[#8f98a0] mt-0.5">Konfigurace ZeddiLauncher</p>
          </div>
          <button onClick={handleSave} disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-[#4c6b22] hover:bg-[#5a7d28]
                       disabled:opacity-50 text-white text-sm rounded transition">
            {saved ? <CheckCircle className="w-4 h-4" /> : saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saved ? "Uloženo!" : saving ? "Ukládám..." : "Uložit"}
          </button>
        </div>

        {/* Steam API */}
        <Section title="Steam integrace" color="blue">
          <Field label="Steam API klíč"
            hint="Získej zdarma na: store.steampowered.com/dev/apikey">
            <div className="relative">
              <Input value={form.steam_api_key} onChange={v => setForm({ ...form, steam_api_key: v })}
                type={showApiKey ? "text" : "password"} placeholder="Tvůj Steam API klíč" mono />
              <button onClick={() => setShowApiKey(!showApiKey)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-[#8f98a0] hover:text-[#c7d5e0]">
                {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </Field>

          <Field label="Steam ID (64-bit)"
            hint="Najdeš ho na svém Steam profilu nebo na steamid.io">
            <Input value={form.steam_id} onChange={v => setForm({ ...form, steam_id: v })}
              placeholder="76561198XXXXXXXXX" mono />
          </Field>

          <Field label="Steam uživatelské jméno"
            hint="Potřebné pro SteamCMD stahování">
            <Input value={form.steam_username} onChange={v => setForm({ ...form, steam_username: v })}
              placeholder="tvoje_steam_jméno" />
          </Field>

          <div className="flex gap-2 text-xs text-[#67c1f5]">
            <a href="#" className="flex items-center gap-1 hover:underline">
              <ExternalLink className="w-3 h-3" /> Získat Steam API klíč
            </a>
            <span className="text-[#4a8ab5]">·</span>
            <a href="#" className="flex items-center gap-1 hover:underline">
              <ExternalLink className="w-3 h-3" /> Najít Steam ID
            </a>
          </div>
        </Section>

        {/* RAWG API */}
        <Section title="RAWG.io (Obchod)" color="green">
          <Field label="RAWG API klíč"
            hint="Zdarma na rawg.io/apidocs — 500k+ her, cover arty, metadata">
            <div className="relative">
              <Input value={form.rawg_api_key} onChange={v => setForm({ ...form, rawg_api_key: v })}
                type={showRawgKey ? "text" : "password"} placeholder="Tvůj RAWG API klíč" mono />
              <button onClick={() => setShowRawgKey(!showRawgKey)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-[#8f98a0] hover:text-[#c7d5e0]">
                {showRawgKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </Field>
          <a href="#" className="text-xs text-[#67c1f5] flex items-center gap-1 hover:underline">
            <ExternalLink className="w-3 h-3" /> Zaregistrovat se na RAWG.io
          </a>
        </Section>

        {/* General */}
        <Section title="Obecné" color="gray">
          <Field label="Výchozí složka pro instalaci her"
            hint="Sem budou stahované hry přes SteamCMD">
            <Input value={form.default_install_dir} onChange={v => setForm({ ...form, default_install_dir: v })}
              placeholder="C:\Games" mono />
          </Field>

          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={form.auto_scan_on_start}
              onChange={e => setForm({ ...form, auto_scan_on_start: e.target.checked })}
              className="w-4 h-4 accent-[#4c6b22]" />
            <span className="text-sm text-[#c7d5e0]">Automaticky skenovat hry při spuštění</span>
          </label>
        </Section>

        {/* About */}
        <Section title="O aplikaci" color="gray">
          <div className="text-xs text-[#8f98a0] space-y-1">
            <p className="text-sm font-medium text-[#c7d5e0]">ZeddiLauncher v0.1.0</p>
            <p>Unifikovaná herní platforma — Steam, Epic, GOG a standalone hry na jednom místě.</p>
            <p className="mt-2">Používá: RAWG.io API · Steam Web API · SteamCMD · Tauri 2.0 · React 18</p>
            <p className="mt-1 text-[#4a8ab5]">
              Tato aplikace je legálně nezávislá. Nepoužívá žádný proprietární kód platformy Steam.
            </p>
          </div>
        </Section>
      </div>
    </div>
  );
}

function Section({ title, color, children }: {
  title: string; color: "blue" | "green" | "gray"; children: React.ReactNode;
}) {
  const colors = { blue: "#1a5276", green: "#1e4d2b", gray: "#2a3f5f" };
  return (
    <div className="rounded-lg overflow-hidden border border-[#4a8ab5]/20">
      <div className="px-4 py-2.5" style={{ background: colors[color] + "40" }}>
        <h2 className="text-xs font-semibold text-[#c7d5e0] uppercase tracking-wider">{title}</h2>
      </div>
      <div className="bg-[#2a3f5f]/20 px-4 py-4 space-y-4">{children}</div>
    </div>
  );
}
