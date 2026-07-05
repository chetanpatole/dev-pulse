// Exact design tokens from the Dev Pulse handoff.

export const THEMES = {
  light: {
    "--bg": "#f6f5f2", "--surface": "#ffffff", "--surface2": "#f0eeea", "--nav-bg": "#fbfaf8",
    "--border": "rgba(24,23,21,0.09)", "--border2": "rgba(24,23,21,0.16)",
    "--fg": "#1b1a18", "--fg2": "#54524c", "--fg3": "#8f8c84",
    "--code-bg": "#f4f2ee", "--code-fg": "#2c2a26",
    "--card-shadow": "0 1px 2px rgba(24,23,21,0.05),0 10px 24px -14px rgba(24,23,21,0.16)",
    "--skeleton": "linear-gradient(90deg,#eceae5 25%,#f4f2ee 50%,#eceae5 75%)",
  },
  dark: {
    "--bg": "#131312", "--surface": "#1c1c1a", "--surface2": "#242422", "--nav-bg": "#171716",
    "--border": "rgba(255,255,255,0.09)", "--border2": "rgba(255,255,255,0.17)",
    "--fg": "#f3f1ec", "--fg2": "#b8b5ac", "--fg3": "#7d7b73",
    "--code-bg": "#0e0e0d", "--code-fg": "#d9d6cf",
    "--card-shadow": "0 1px 2px rgba(0,0,0,0.4),0 12px 28px -16px rgba(0,0,0,0.6)",
    "--skeleton": "linear-gradient(90deg,#242422 25%,#2c2c2a 50%,#242422 75%)",
  },
};

// Type-badge severity hues.
export const SEV = {
  Breaking: "#e5484d", Deprecation: "#d18616", New: "#30a46c",
  Improvement: "#3e63dd", Fix: "#8e6bd6", Release: "#7b8291",
};

// Source monograms.
export const SRC = {
  Changelog: { c: "#5c6ac4", i: "C" }, Hydrogen: { c: "#1f9d63", i: "H" }, CLI: { c: "#7b8291", i: "›" },
  "UI Extensions": { c: "#d18616", i: "U" }, Polaris: { c: "#8e6bd6", i: "P" },
};

export const TYPES = ["Breaking", "Deprecation", "New", "Improvement", "Fix", "Release"];

export const ACCENTS = ["#0e9aa7", "#1f9d63", "#5b5bd6", "#d97a2b", "#2f6bd6"];

// Build the CSS-variable map applied to the app root.
export function cssVars(theme, accent) {
  const t = THEMES[theme] || THEMES.dark;
  return {
    ...t,
    "--accent": accent,
    "--accent-soft": `color-mix(in srgb, ${accent} 15%, transparent)`,
    "--hero-tint": `color-mix(in srgb, ${accent} 6%, ${t["--surface"]})`,
    "--warn": "#d18616",
    "--warn-soft": "color-mix(in srgb, #d18616 15%, transparent)",
  };
}

export function relStyle(rel) {
  if (rel === "For you")
    return { padding: "2px 8px", borderRadius: "100px", background: "var(--accent-soft)", color: "var(--accent)", fontSize: "11px", fontWeight: 700, whiteSpace: "nowrap" };
  const map = { High: "var(--fg2)", Medium: "var(--fg3)", Low: "var(--fg3)" };
  return { padding: "2px 8px", borderRadius: "100px", background: "var(--surface2)", color: map[rel] || "var(--fg3)", fontSize: "11px", fontWeight: 600, whiteSpace: "nowrap" };
}

export function badgeStyle(type) {
  const hue = SEV[type] || "#7b8291";
  return { display: "inline-flex", alignItems: "center", gap: "5px", padding: "3px 9px", borderRadius: "100px", background: `color-mix(in srgb, ${hue} 15%, transparent)`, color: hue, fontSize: "11px", fontWeight: 700, whiteSpace: "nowrap" };
}

export function src(source) {
  return SRC[source] || { c: "var(--fg3)", i: (source || "?")[0] };
}
