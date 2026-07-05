import { useState } from "react";
import { Clock, Check } from "../lib/icons.jsx";
import { Eyebrow, HashPill } from "../components/bits.jsx";

export default function Recap({ recap, onHashtag }) {
  const [done, setDone] = useState({});
  if (!recap) return null;

  return (
    <div style={{ padding: "6px 16px 20px" }}>
      <div style={{ display: "inline-flex", alignItems: "center", gap: "9px", marginBottom: "10px" }}>
        <span style={{ padding: "4px 11px", borderRadius: "100px", background: "var(--accent-soft)", color: "var(--accent)", fontSize: "11px", fontWeight: 700, letterSpacing: "0.04em" }}>WEEKLY RECAP</span>
        <span style={{ fontSize: "12px", color: "var(--fg3)", fontWeight: 500 }}>{recap.dateRange}</span>
      </div>
      <h1 style={{ margin: "2px 0 0", fontSize: "24px", lineHeight: 1.2, fontWeight: 800, color: "var(--fg)", letterSpacing: "-0.025em", textWrap: "balance" }}>{recap.headline}</h1>
      <p style={{ margin: "6px 0 0", fontSize: "12.5px", color: "var(--fg3)", fontWeight: 500 }}>{recap.basis}</p>

      <div style={{ marginTop: "22px" }}>
        <Eyebrow style={{ margin: "0 2px 11px" }}>Themes</Eyebrow>
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {(recap.themes || []).map((t, i) => (
            <div key={i} style={{ background: "var(--surface)", borderRadius: "16px", border: "1px solid var(--border)", boxShadow: "var(--card-shadow)", padding: "15px 16px", display: "flex", gap: "13px" }}>
              <span style={{ width: "26px", height: "26px", flex: "none", borderRadius: "8px", background: "var(--accent-soft)", color: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "13px", fontWeight: 700 }}>{t.n || i + 1}</span>
              <div>
                <h3 style={{ margin: "2px 0 5px", fontSize: "16px", fontWeight: 700, color: "var(--fg)", lineHeight: 1.25 }}>{t.title}</h3>
                <p style={{ margin: 0, fontSize: "13.5px", lineHeight: 1.45, color: "var(--fg2)" }}>{t.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {recap.actions?.length > 0 && (
        <div style={{ marginTop: "22px" }}>
          <Eyebrow style={{ margin: "0 2px 11px" }}>Action items</Eyebrow>
          <div style={{ background: "var(--surface)", borderRadius: "16px", border: "1px solid var(--border)", boxShadow: "var(--card-shadow)", overflow: "hidden" }}>
            {recap.actions.map((a, i) => {
              const checked = !!done[i];
              return (
                <button key={i} onClick={() => setDone((d) => ({ ...d, [i]: !d[i] }))} style={{
                  display: "flex", alignItems: "flex-start", gap: "12px", width: "100%", textAlign: "left",
                  padding: "14px 16px", background: "none", border: "none", borderTop: i ? "1px solid var(--border)" : "none", cursor: "pointer",
                }}>
                  <span style={{
                    width: "22px", height: "22px", flex: "none", marginTop: "1px", borderRadius: "7px",
                    border: checked ? "none" : "2px solid var(--border2)", background: checked ? "var(--accent)" : "transparent",
                    color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", transition: "0.2s",
                  }}>{checked && <Check size={13} />}</span>
                  <span style={{ flex: 1 }}>
                    <span style={{ display: "block", fontSize: "14px", fontWeight: 500, color: "var(--fg)", lineHeight: 1.4, textDecoration: checked ? "line-through" : "none", opacity: checked ? 0.55 : 1 }}>{a.text}</span>
                    {a.deadline && (
                      <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", marginTop: "6px", color: "var(--warn)", fontSize: "11.5px", fontWeight: 600 }}>
                        <Clock size={11} /> {a.deadline}
                      </span>
                    )}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {recap.hashtags?.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: "7px", marginTop: "20px" }}>
          {recap.hashtags.map((t) => <HashPill key={t} tag={t} onClick={() => onHashtag(t)} />)}
        </div>
      )}
    </div>
  );
}
