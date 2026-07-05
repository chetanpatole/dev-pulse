import { Bolt, Bell } from "../lib/icons.jsx";

const rows = [
  "One insight a day — not a firehose.",
  "Developer and merchant impact, deadlines flagged.",
  "Tuned to your stack — the noise gets filtered out.",
];

export default function Onboarding({ onEnable, onSkip }) {
  return (
    <div style={{ minHeight: "100%", display: "flex", flexDirection: "column", padding: "40px 26px 32px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "auto" }}>
        <span style={{ width: "30px", height: "30px", borderRadius: "8px", background: "var(--accent)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Bolt size={17} fill="currentColor" />
        </span>
        <span style={{ fontSize: "16px", fontWeight: 800, color: "var(--fg)" }}>Dev Pulse</span>
      </div>

      <div style={{ margin: "32px 0" }}>
        <h1 style={{ margin: "0 0 14px", fontSize: "30px", lineHeight: 1.12, fontWeight: 800, color: "var(--fg)", letterSpacing: "-0.03em", textWrap: "balance" }}>
          The one Shopify update that matters today.
        </h1>
        <p style={{ margin: 0, fontSize: "15px", lineHeight: 1.5, color: "var(--fg2)" }}>
          AI reads the changelog, CLI, Hydrogen, Polaris and UI Extensions so you don't have to — and tells you what to act on.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "26px" }}>
          {rows.map((r, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <span style={{ width: "30px", height: "30px", flex: "none", borderRadius: "9px", background: "var(--accent-soft)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ width: "7px", height: "7px", borderRadius: "50%", background: "var(--accent)" }} />
              </span>
              <span style={{ fontSize: "14.5px", lineHeight: 1.45, color: "var(--fg2)" }}>{r}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ marginTop: "auto" }}>
        <button onClick={onEnable} style={{
          display: "flex", alignItems: "center", justifyContent: "center", gap: "9px", width: "100%", height: "52px",
          borderRadius: "15px", background: "var(--accent)", color: "#fff", border: "none", fontSize: "15.5px", fontWeight: 700, cursor: "pointer",
        }}>
          <Bell size={19} /> Enable notifications
        </button>
        <button onClick={onSkip} style={{ display: "block", width: "100%", marginTop: "12px", padding: "10px", background: "none", border: "none", color: "var(--fg3)", fontSize: "14px", fontWeight: 500, cursor: "pointer" }}>
          Skip — enable later in Settings
        </button>
      </div>
    </div>
  );
}
