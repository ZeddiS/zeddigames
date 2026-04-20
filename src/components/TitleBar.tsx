import { getCurrentWindow } from "@tauri-apps/api/window";
import { Minus, Square, X, Maximize2 } from "lucide-react";
import { useState, useEffect } from "react";

export function TitleBar() {
  const [maximized, setMaximized] = useState(false);
  const win = getCurrentWindow();

  useEffect(() => {
    win.isMaximized().then(setMaximized);
    const unlisten = win.onResized(() => win.isMaximized().then(setMaximized));
    return () => { unlisten.then(f => f()); };
  }, []);

  return (
    <div
      data-tauri-drag-region
      className="h-7 flex items-center justify-between bg-[#0d1117] select-none flex-shrink-0 border-b border-[#1a2332]"
    >
      {/* Left: Logo + App name */}
      <div data-tauri-drag-region className="flex items-center gap-2 pl-3 pointer-events-none">
        <img src="/logo2.png" alt="ZeddiGames" className="h-4 w-4 object-contain" />
        <span className="text-[11px] font-semibold text-[#8f98a0] tracking-wide">
          ZeddiGames Launcher
        </span>
      </div>

      {/* Right: Window controls */}
      <div className="flex items-center">
        <WinBtn onClick={() => win.minimize()} title="Minimalizovat">
          <Minus className="w-3 h-3" />
        </WinBtn>
        <WinBtn onClick={async () => { maximized ? await win.unmaximize() : await win.maximize(); }} title="Maximalizovat">
          {maximized ? <Square className="w-3 h-3" /> : <Maximize2 className="w-3 h-3" />}
        </WinBtn>
        <WinBtn onClick={() => win.close()} title="Zavřít" isClose>
          <X className="w-3 h-3" />
        </WinBtn>
      </div>
    </div>
  );
}

function WinBtn({ children, onClick, title, isClose }: {
  children: React.ReactNode;
  onClick: () => void;
  title: string;
  isClose?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={`h-7 w-10 flex items-center justify-center transition-colors
        text-[#8f98a0]
        ${isClose
          ? "hover:bg-red-600 hover:text-white"
          : "hover:bg-[#2a3f5f] hover:text-[#c7d5e0]"
        }`}
    >
      {children}
    </button>
  );
}
