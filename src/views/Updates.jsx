import { TYPES, badgeStyle, relStyle, src } from "../lib/theme.js";
import { Globe, Star, X, Check } from "../lib/icons.jsx";
import { HashPill, ActionPill } from "../components/bits.jsx";

export default function Updates({ updates, loading, filters, setFilters }) {
  const { typeFilter, forYou, activeHashtag } = filters;

  let list = (updates || []).slice();
  if (activeHashtag) list = list.filter((u) => (u.hashtags || []).includes(activeHashtag));
  if (typeFilter) list = list.filter((u) => u.type === typeFilter);
  if (forYou) list = list.filter((u) => u.relevance === "For you" || u.relevance === "High");

  const anyFilter = typeFilter || forYou || activeHashtag;

  return (
    <div style={{ padding: "0 16px 20px" }}>
      {/* filter bar */}
      <div style={{ position: "sticky", top: 0, zIndex: 2, margin: "0 -16px", padding: "4px 16px 10px", background: "linear-gradient(var(--bg) 80%, transparent)" }}>
        <div className="no-scrollbar" style={{ display: "flex", gap: "8px", overflowX: "auto", paddingBottom: "2px" }}>
          <button onClick={() => setFilters((f) => ({ ...f, forYou: !f.forYou }))} style={chip(forYou)}>
            <Star size={13} fill={forYou ? "currentColor" : "none"} /> For you
          </button>
          {TYPES.map((t) => (
            <button key={t} onClick={() => setFilters((f) => ({ ...f, typeFilter: f.typeFilter === t ? null : t }))} style={chip(typeFilter === t)}>
              {t}
            </button>
          ))}
        </div>
        {activeHashtag && (
          <div style={{ marginTop: "9px" }}>
            <button onClick={() => setFilters((f) => ({ ...f, activeHashtag: null }))} style={{
              display: "inline-flex", alignItems: "center", gap: "6px", padding: "5px 11px", borderRadius: "100px",
              background: "var(--accent-soft)", color: "var(--accent)", border: "none", fontSize: "12px", fontWeight: 700, cursor: "pointer",
            }}>
              Filtered to #{activeHashtag} <X size={13} />
            </button>
          </div>
        )}
      </div>

      {loading ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {[0, 1, 2].map((i) => <div key={i} className="skeleton" style={{ height: "112px" }} />)}
        </div>
      ) : list.length === 0 ? (
        <Empty filtered={!!anyFilter} onClear={() => setFilters({ typeFilter: null, forYou: false, activeHashtag: null })} />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {list.map((u, i) => <Card key={i} u={u} onHashtag={(t) => setFilters({ typeFilter: null, forYou: false, activeHashtag: t })} />)}
        </div>
      )}
    </div>
  );
}

function Card({ u, onHashtag }) {
  const s = src(u.source);
  return (
    <div style={{ background: "var(--surface)", borderRadius: "16px", border: "1px solid var(--border)", boxShadow: "var(--card-shadow)", padding: "15px 16px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "9px" }}>
        <span style={badgeStyle(u.type)}>
          <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: badgeStyle(u.type).color }} />
          {u.type}
        </span>
        <span style={relStyle(u.relevance)}>{u.relevance}</span>
        <span style={{ flex: 1 }} />
        <span style={{ fontSize: "12px", color: "var(--fg3)", fontWeight: 500 }}>{u.date}</span>
      </div>
      <h3 style={{ margin: "0 0 6px", fontSize: "16.5px", lineHeight: 1.28, fontWeight: 700, color: "var(--fg)", letterSpacing: "-0.01em" }}>{u.title}</h3>
      <p style={{ margin: "0 0 10px", fontSize: "13.5px", lineHeight: 1.42, color: "var(--fg2)" }}>{u.summary}</p>
      <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "12px", color: "var(--fg3)", fontSize: "12px" }}>
        <Globe size={13} /> {u.impact}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
        <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
          <span style={{ width: "18px", height: "18px", borderRadius: "6px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontWeight: 700, background: `color-mix(in srgb, ${s.c} 15%, transparent)`, color: s.c }}>{s.i}</span>
          <span style={{ fontSize: "12px", color: "var(--fg2)", fontWeight: 600 }}>{u.source}</span>
        </span>
        {u.action_needed && <ActionPill deadline={u.deadline} label="" />}
        <span style={{ flex: 1 }} />
        {(u.hashtags || []).slice(0, 2).map((t) => <HashPill key={t} tag={t} onClick={() => onHashtag(t)} />)}
      </div>
    </div>
  );
}

function Empty({ filtered, onClear }) {
  return (
    <div style={{ textAlign: "center", padding: "48px 24px" }}>
      <div style={{ width: "52px", height: "52px", margin: "0 auto 16px", borderRadius: "14px", background: "var(--surface2)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--fg2)" }}>
        <Check size={24} />
      </div>
      <p style={{ margin: "0 0 4px", fontSize: "16px", fontWeight: 700, color: "var(--fg)" }}>
        {filtered ? "No updates match" : "You're all caught up"}
      </p>
      <p style={{ margin: "0 0 16px", fontSize: "13.5px", color: "var(--fg3)" }}>
        {filtered ? "Try a different filter." : "New updates will appear here."}
      </p>
      {filtered && (
        <button onClick={onClear} style={{ padding: "9px 18px", borderRadius: "11px", border: "1px solid var(--border2)", background: "var(--surface)", color: "var(--fg)", fontSize: "13.5px", fontWeight: 600, cursor: "pointer" }}>
          Clear filters
        </button>
      )}
    </div>
  );
}

const chip = (active) => ({
  display: "inline-flex", alignItems: "center", gap: "6px", padding: "7px 13px", borderRadius: "100px",
  background: active ? "var(--accent)" : "var(--surface)", color: active ? "#fff" : "var(--fg2)",
  border: active ? "none" : "1px solid var(--border2)", fontSize: "13px", fontWeight: active ? 700 : 600,
  cursor: "pointer", whiteSpace: "nowrap", flex: "none",
});
