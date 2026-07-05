import { Clock } from "../lib/icons.jsx";

export function Eyebrow({ children, color = "var(--fg3)", style }) {
  return (
    <div style={{ fontSize: "10.5px", fontWeight: 700, letterSpacing: "0.09em", color, textTransform: "uppercase", ...style }}>
      {children}
    </div>
  );
}

export function HashPill({ tag, active, onClick }) {
  return (
    <button onClick={onClick} style={{
      display: "inline-flex", alignItems: "center", padding: "5px 11px", borderRadius: "100px",
      border: active ? "1px solid var(--accent)" : "1px solid var(--border2)",
      background: active ? "var(--accent-soft)" : "transparent",
      color: active ? "var(--accent)" : "var(--fg2)",
      fontSize: "12px", fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap",
    }}>
      #{tag}
    </button>
  );
}

export function ActionPill({ deadline, label = "Action needed" }) {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: "5px", padding: "3px 10px", borderRadius: "100px",
      background: "var(--warn-soft)", color: "var(--warn)", fontSize: "11px", fontWeight: 700, whiteSpace: "nowrap",
    }}>
      <Clock size={11} />
      {label}{deadline ? ` · ${deadline}` : ""}
    </span>
  );
}
