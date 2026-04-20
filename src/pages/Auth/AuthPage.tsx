import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, Loader, User, Mail, Lock, LogIn, UserPlus, AlertCircle } from "lucide-react";
import { useStore } from "../../store";
import { useToast } from "../../components/Toast";

const API = "https://zeddihub.eu/games/api";

export function AuthPage() {
  const [mode, setMode] = useState<"login" | "register">("login");

  return (
    <div className="flex-1 flex items-center justify-center bg-[#0d1117] overflow-y-auto p-4">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5 pointer-events-none"
        style={{ backgroundImage: "url(/logo_transparent.png)", backgroundSize: "300px", backgroundRepeat: "repeat" }} />

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <img src="/logo2.png" alt="ZeddiGames" className="w-20 h-20 object-contain mb-3" />
          <h1 className="text-2xl font-bold text-white tracking-tight">ZeddiGames</h1>
          <p className="text-sm text-[#8f98a0] mt-1">Tvoje herní platforma</p>
        </div>

        {/* Card */}
        <div className="bg-[#161b22] border border-[#30363d] rounded-xl overflow-hidden shadow-2xl">
          {/* Tab switcher */}
          <div className="flex border-b border-[#30363d]">
            <TabBtn active={mode === "login"} onClick={() => setMode("login")} icon={<LogIn className="w-4 h-4" />} label="Přihlásit se" />
            <TabBtn active={mode === "register"} onClick={() => setMode("register")} icon={<UserPlus className="w-4 h-4" />} label="Registrovat se" />
          </div>

          <div className="p-6">
            <AnimatePresence mode="wait">
              {mode === "login" ? (
                <motion.div key="login" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}>
                  <LoginForm />
                </motion.div>
              ) : (
                <motion.div key="register" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}>
                  <RegisterForm onSuccess={() => setMode("login")} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <p className="text-center text-xs text-[#8f98a0] mt-4">
          Pokračováním souhlasíš s{" "}
          <a href="https://zeddihub.eu/games/" target="_blank" className="text-[#ff6b00] hover:underline">podmínkami služby</a>
        </p>
      </div>
    </div>
  );
}

function TabBtn({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button onClick={onClick}
      className={`flex-1 flex items-center justify-center gap-2 py-3.5 text-sm font-medium transition-colors
        ${active
          ? "text-[#ff6b00] border-b-2 border-[#ff6b00] bg-[#ff6b0008]"
          : "text-[#8f98a0] hover:text-[#c7d5e0] hover:bg-white/5"}`}
    >
      {icon}{label}
    </button>
  );
}

function LoginForm() {
  const { loginUser } = useStore();
  const toast = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`${API}/auth.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "login", email, password }),
      });
      const data = await res.json();
      if (!data.success) { setError(data.message ?? "Nesprávné přihlašovací údaje"); return; }
      loginUser(data.user, data.token);
      toast.success("Přihlášení úspěšné", `Vítej, ${data.user.nickname}!`);
    } catch {
      setError("Chyba spojení se serverem. Zkus to znovu.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleLogin} className="space-y-4">
      <AuthInput icon={<Mail className="w-4 h-4" />} label="E-Mail" type="email"
        value={email} onChange={setEmail} placeholder="tvuj@email.cz" />
      <div>
        <label className="block text-xs font-medium text-[#8f98a0] mb-1">Heslo</label>
        <div className="relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8f98a0]"><Lock className="w-4 h-4" /></div>
          <input type={showPw ? "text" : "password"} value={password}
            onChange={e => setPassword(e.target.value)} placeholder="••••••••"
            className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg pl-9 pr-10 py-2.5
                       text-sm text-[#c7d5e0] placeholder-[#8f98a0]/40
                       focus:outline-none focus:border-[#ff6b00]/60 transition-colors" />
          <button type="button" onClick={() => setShowPw(!showPw)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8f98a0] hover:text-[#c7d5e0]">
            {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
          <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
          <p className="text-xs text-red-400">{error}</p>
        </div>
      )}

      <button type="submit" disabled={loading || !email || !password}
        className="w-full py-2.5 bg-[#ff6b00] hover:bg-[#ff8c00] disabled:opacity-50
                   text-white font-semibold text-sm rounded-lg transition-colors flex items-center justify-center gap-2">
        {loading ? <Loader className="w-4 h-4 animate-spin" /> : <LogIn className="w-4 h-4" />}
        {loading ? "Přihlašuji..." : "Přihlásit se"}
      </button>
    </form>
  );
}

function RegisterForm({ onSuccess }: { onSuccess: () => void }) {
  const toast = useToast();
  const [form, setForm] = useState({ nickname: "", email: "", password: "", confirm: "" });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function upd(k: keyof typeof form) { return (v: string) => setForm(f => ({ ...f, [k]: v })); }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (form.password !== form.confirm) { setError("Hesla se neshodují."); return; }
    if (form.password.length < 8) { setError("Heslo musí mít alespoň 8 znaků."); return; }
    setLoading(true);
    try {
      const res = await fetch(`${API}/auth.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "register", nickname: form.nickname, email: form.email, password: form.password }),
      });
      const data = await res.json();
      if (!data.success) { setError(data.message ?? "Registrace se nezdařila"); return; }
      toast.success("Účet vytvořen!", "Přihlas se svými novými údaji.");
      onSuccess();
    } catch {
      setError("Chyba spojení se serverem.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleRegister} className="space-y-4">
      <AuthInput icon={<User className="w-4 h-4" />} label="Přezdívka" type="text"
        value={form.nickname} onChange={upd("nickname")} placeholder="TvůjNick" />
      <AuthInput icon={<Mail className="w-4 h-4" />} label="E-Mail" type="email"
        value={form.email} onChange={upd("email")} placeholder="tvuj@email.cz" />
      <AuthInput icon={<Lock className="w-4 h-4" />} label="Heslo" type={showPw ? "text" : "password"}
        value={form.password} onChange={upd("password")} placeholder="min. 8 znaků"
        suffix={
          <button type="button" onClick={() => setShowPw(!showPw)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8f98a0] hover:text-[#c7d5e0]">
            {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        } />
      <AuthInput icon={<Lock className="w-4 h-4" />} label="Potvrdit heslo" type={showPw ? "text" : "password"}
        value={form.confirm} onChange={upd("confirm")} placeholder="Zopakuj heslo" />

      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
          <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
          <p className="text-xs text-red-400">{error}</p>
        </div>
      )}

      {/* Password strength */}
      {form.password.length > 0 && (
        <div>
          <div className="flex gap-1 mb-1">
            {[1,2,3,4].map(i => (
              <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${
                passwordStrength(form.password) >= i
                  ? i <= 1 ? "bg-red-500" : i <= 2 ? "bg-yellow-500" : i <= 3 ? "bg-blue-500" : "bg-green-500"
                  : "bg-[#30363d]"
              }`} />
            ))}
          </div>
          <p className="text-[10px] text-[#8f98a0]">
            {["", "Slabé", "Dostatečné", "Silné", "Velmi silné"][passwordStrength(form.password)]}
          </p>
        </div>
      )}

      <button type="submit" disabled={loading || !form.nickname || !form.email || !form.password || !form.confirm}
        className="w-full py-2.5 bg-[#ff6b00] hover:bg-[#ff8c00] disabled:opacity-50
                   text-white font-semibold text-sm rounded-lg transition-colors flex items-center justify-center gap-2">
        {loading ? <Loader className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
        {loading ? "Registruji..." : "Vytvořit účet"}
      </button>
    </form>
  );
}

function AuthInput({ icon, label, suffix, ...inputProps }: {
  icon: React.ReactNode; label: string; suffix?: React.ReactNode;
  type: string; value: string; onChange: (v: string) => void; placeholder?: string;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-[#8f98a0] mb-1">{label}</label>
      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8f98a0]">{icon}</div>
        <input
          type={inputProps.type} value={inputProps.value}
          onChange={e => inputProps.onChange(e.target.value)}
          placeholder={inputProps.placeholder}
          className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg pl-9 pr-3 py-2.5
                     text-sm text-[#c7d5e0] placeholder-[#8f98a0]/40
                     focus:outline-none focus:border-[#ff6b00]/60 transition-colors"
        />
        {suffix}
      </div>
    </div>
  );
}

function passwordStrength(pw: string): number {
  let s = 0;
  if (pw.length >= 8) s++;
  if (/[A-Z]/.test(pw)) s++;
  if (/[0-9]/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  return s;
}
