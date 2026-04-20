export type ThemeId = "dark" | "light" | "orange";

export interface Theme {
  id: ThemeId;
  label: string;
  bg: string;
  bgSecondary: string;
  bgCard: string;
  border: string;
  text: string;
  textMuted: string;
  accent: string;
  accentHover: string;
  nav: string;
  navBorder: string;
}

export const THEMES: Record<ThemeId, Theme> = {
  dark: {
    id: "dark",
    label: "Steam Dark",
    bg: "#1b2838",
    bgSecondary: "#131e2b",
    bgCard: "#2a3f5f20",
    border: "#4a8ab520",
    text: "#c7d5e0",
    textMuted: "#8f98a0",
    accent: "#4c6b22",
    accentHover: "#5a7d28",
    nav: "#171a21",
    navBorder: "#00000050",
  },
  light: {
    id: "light",
    label: "Light",
    bg: "#f0f2f5",
    bgSecondary: "#e2e6ea",
    bgCard: "#ffffff",
    border: "#d1d9e0",
    text: "#1a2332",
    textMuted: "#5a6475",
    accent: "#1a9fff",
    accentHover: "#0d8aee",
    nav: "#dce3ea",
    navBorder: "#c0c8d0",
  },
  orange: {
    id: "orange",
    label: "ZeddiGames Orange",
    bg: "#0f0f0f",
    bgSecondary: "#1a1a1a",
    bgCard: "#ffffff08",
    border: "#ff6b0030",
    text: "#f0f0f0",
    textMuted: "#999999",
    accent: "#ff6b00",
    accentHover: "#ff8c00",
    nav: "#0a0a0a",
    navBorder: "#ff6b0020",
  },
};

export function applyTheme(theme: Theme) {
  const root = document.documentElement;
  root.style.setProperty("--bg", theme.bg);
  root.style.setProperty("--bg-secondary", theme.bgSecondary);
  root.style.setProperty("--bg-card", theme.bgCard);
  root.style.setProperty("--border", theme.border);
  root.style.setProperty("--text", theme.text);
  root.style.setProperty("--text-muted", theme.textMuted);
  root.style.setProperty("--accent", theme.accent);
  root.style.setProperty("--accent-hover", theme.accentHover);
  root.style.setProperty("--nav", theme.nav);
  root.style.setProperty("--nav-border", theme.navBorder);
  root.setAttribute("data-theme", theme.id);
}
