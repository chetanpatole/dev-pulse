import { X, Plus } from "../lib/icons.jsx";
import { Eyebrow } from "../components/bits.jsx";
import { pushStatus } from "../firebase.js";

export default function Settings({ meta, notif, on, onToggle, stack, setStack }) {
  return (
    <div style={{ padding: "6px 16px 20px" }}>
      <h1 style={{ margin: "0 0 20px", fontSize: "26px", fontWeight: 800, color: "var(--fg)", letterSpacing: "-0.025em" }}>Settings</h1>

      <Eyebrow style={{ margin: "0 2px 10px" }}>Notifications</Eyebrow>
      <div style={cardStyle}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "15px 16px" }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: "15px", fontWeight: 600, color: "var(--fg)" }}>Push notifications</div>
            <div style={{ fontSize: "12.5px", color: "var(--fg3)", marginTop: "2px" }}>Ping me when something matters</div>
          </div>
          <button onClick={onToggle} role="switch" aria-checked={on} aria-label="Toggle notifications" style={{
            width: "50px", height: "30px", flex: "none", borderRadius: "100px", border: "none", cursor: "pointer",
            background: on ? "var(--accent)" : "var(--surface2)", position: "relative", transition: "0.2s",
          }}>
            <span style={{
              position: "absolute", top: "3px", left: on ? "23px" : "3px",
              width: "24px", height: "24px", borderRadius: "50%", background: "#fff", transition: "left 0.2s",
              boxShadow: "0 1px 3px rgba(0,0,0,0.3)",
            }} />
          </button>
        </div>
        {notif === "denied" && (
          <div style={{ padding: "12px 16px", borderTop: "1px solid var(--border)", background: "var(--warn-soft)", fontSize: "12.5px", lineHeight: 1.5, color: "var(--warn)" }}>
            Notifications are blocked. Enable them for this site in your browser settings, then reopen the app.
          </div>
        )}
        {on && pushStatus() && pushStatus() !== "disabled" && (
          <div style={{ padding: "10px 16px", borderTop: "1px solid var(--border)", fontSize: "12px", lineHeight: 1.5, color: pushStatus() === "registered" ? "var(--fg3)" : "var(--warn)" }}>
            {pushStatus() === "registered" ? "Device registered for push ✓" : `Registration: ${pushStatus()}`}
          </div>
        )}
      </div>

      <Eyebrow style={{ margin: "22px 2px 10px" }}>My stack</Eyebrow>
      <div style={{ ...cardStyle, padding: "15px 16px" }}>
        <p style={{ margin: "0 0 12px", fontSize: "12.5px", lineHeight: 1.5, color: "var(--fg3)" }}>
          Drives which updates are marked relevant to you.
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
          {stack.map((tech) => (
            <span key={tech} style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "6px 10px 6px 12px", borderRadius: "100px", background: "var(--accent-soft)", color: "var(--accent)", fontSize: "12.5px", fontWeight: 600 }}>
              {tech}
              <button onClick={() => setStack(stack.filter((s) => s !== tech))} aria-label={`Remove ${tech}`} style={{ display: "inline-flex", background: "none", border: "none", padding: 0, color: "var(--accent)", cursor: "pointer", opacity: 0.7 }}>
                <X size={13} />
              </button>
            </span>
          ))}
          <button onClick={() => addTech(stack, setStack)} style={{ display: "inline-flex", alignItems: "center", gap: "5px", padding: "6px 12px", borderRadius: "100px", background: "transparent", border: "1.5px dashed var(--border2)", color: "var(--fg3)", fontSize: "12.5px", fontWeight: 600, cursor: "pointer" }}>
            <Plus size={13} /> Add
          </button>
        </div>
      </div>

      <Eyebrow style={{ margin: "22px 2px 10px" }}>About</Eyebrow>
      <div style={cardStyle}>
        <Row label="Last synced" value={meta?.lastSynced || "—"} />
        <Row label="Version" value="1.0.0 · Phase 1" divider />
        <Row label="Source & feed" value="View ↗" divider link={meta?.repo} />
      </div>
      <p style={{ margin: "14px 4px 0", fontSize: "12px", color: "var(--fg3)", lineHeight: 1.5 }}>
        Dev Pulse reads from a static feed · works offline.
      </p>
    </div>
  );
}

function addTech(stack, setStack) {
  const t = window.prompt("Add a technology to your stack");
  if (t && t.trim()) setStack([...stack, t.trim()]);
}

function Row({ label, value, divider, link }) {
  const content = (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "13px 16px", borderTop: divider ? "1px solid var(--border)" : "none" }}>
      <span style={{ fontSize: "13.5px", color: "var(--fg2)" }}>{label}</span>
      <span style={{ fontSize: "13.5px", color: link ? "var(--accent)" : "var(--fg)", fontWeight: 500 }}>{value}</span>
    </div>
  );
  return link ? <a href={link} target="_blank" rel="noreferrer" style={{ textDecoration: "none" }}>{content}</a> : content;
}

const cardStyle = { background: "var(--surface)", borderRadius: "16px", border: "1px solid var(--border)", overflow: "hidden" };
