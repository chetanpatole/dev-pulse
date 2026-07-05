import { Bolt, ArrowOut, Chevron } from "../lib/icons.jsx";
import { Eyebrow, HashPill, ActionPill } from "../components/bits.jsx";

const card = {
  background: "var(--surface)", borderRadius: "20px", border: "1px solid var(--border)",
  boxShadow: "var(--card-shadow)", overflow: "hidden",
};

export default function Insight({ insight, dateLabel, onHashtag }) {
  if (!insight) return null;
  return (
    <div style={{ padding: "6px 16px 20px" }}>
      <div style={card}>
        {/* hero band */}
        <div style={{ background: "var(--hero-tint)", borderBottom: "1px solid var(--border)", padding: "16px 18px 18px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "7px", marginBottom: "12px" }}>
            <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "var(--accent)" }} />
            <Eyebrow style={{ whiteSpace: "nowrap" }}>Today's insight · {dateLabel}</Eyebrow>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "7px", marginBottom: "14px" }}>
            <span style={pill("var(--accent-soft)", "var(--accent)")}>
              <Bolt size={11} fill="currentColor" /> AI insight
            </span>
            <span style={pill("var(--accent)", "#fff")}>For you</span>
            {insight.action_needed && <ActionPill deadline={insight.deadline} />}
          </div>
          <h1 style={{ margin: 0, fontSize: "25px", lineHeight: 1.14, fontWeight: 800, color: "var(--fg)", letterSpacing: "-0.025em", textWrap: "balance" }}>
            {insight.headline}
          </h1>
        </div>

        {/* body */}
        <div style={{ padding: "18px" }}>
          <Section label="What changed">
            <p style={p("var(--fg2)", "15px")}>{insight.what_changed}</p>
          </Section>

          {insight.code_example && (
            <div style={{ margin: "0 0 20px", borderRadius: "13px", border: "1px solid var(--border)", background: "var(--code-bg)", overflow: "hidden" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "7px", padding: "9px 13px", borderBottom: "1px solid var(--border)" }}>
                <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "var(--fg3)", opacity: 0.5 }} />
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "10.5px", fontWeight: 600, color: "var(--fg3)" }}>{insight.code_lang}</span>
              </div>
              <pre style={{ margin: 0, padding: "12px 14px", overflowX: "auto", fontFamily: "'JetBrains Mono', monospace", fontSize: "12px", lineHeight: 1.65, color: "var(--code-fg)", whiteSpace: "pre" }}>
                {insight.code_example}
              </pre>
            </div>
          )}

          <div style={{ marginBottom: "18px" }}>
            <Eyebrow color="var(--accent)" style={{ marginBottom: "7px" }}>For developers</Eyebrow>
            <div style={{ borderLeft: "2.5px solid var(--accent)", paddingLeft: "13px" }}>
              <p style={p("var(--fg)", "14.5px")}>{insight.developer_impact}</p>
            </div>
          </div>

          <div style={{ marginBottom: "18px" }}>
            <Eyebrow style={{ marginBottom: "7px" }}>For merchants</Eyebrow>
            <div style={{ borderLeft: "2.5px solid var(--border2)", paddingLeft: "13px" }}>
              <p style={p("var(--fg2)", "14px")}>{insight.merchant_impact}</p>
            </div>
          </div>

          <div style={{ marginBottom: "18px", background: "var(--surface2)", borderRadius: "13px", padding: "13px 15px" }}>
            <Eyebrow style={{ marginBottom: "6px" }}>Why it matters</Eyebrow>
            <p style={{ ...p("var(--fg)", "14.5px"), fontWeight: 500 }}>{insight.why_it_matters}</p>
          </div>

          <div style={{ display: "flex", flexWrap: "wrap", gap: "7px", marginBottom: "18px" }}>
            {(insight.hashtags || []).map((t) => <HashPill key={t} tag={t} onClick={() => onHashtag(t)} />)}
          </div>

          <a href={insight.link} target="_blank" rel="noreferrer" style={{
            display: "flex", alignItems: "center", justifyContent: "center", gap: "7px", height: "46px",
            borderRadius: "13px", background: "var(--fg)", color: "var(--bg)", textDecoration: "none", fontSize: "14.5px", fontWeight: 700,
          }}>
            Read on {insight.source} <ArrowOut size={16} />
          </a>
        </div>
      </div>

      {/* also worth knowing */}
      {insight.also_worth_knowing?.length > 0 && (
        <div style={{ marginTop: "18px" }}>
          <Eyebrow style={{ margin: "0 4px 9px" }}>Also worth knowing</Eyebrow>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {insight.also_worth_knowing.map((item, i) => (
              <a key={i} href={item.link} target="_blank" rel="noreferrer" style={{
                display: "flex", alignItems: "center", gap: "11px", padding: "13px 14px", borderRadius: "14px",
                border: "1px solid var(--border)", background: "var(--surface)", textDecoration: "none",
              }}>
                <span style={{ width: "7px", height: "7px", borderRadius: "50%", background: "var(--accent)", flex: "none" }} />
                <span style={{ flex: 1, fontSize: "13.5px", lineHeight: 1.4, fontWeight: 500, color: "var(--fg)" }}>{item.text}</span>
                <Chevron size={15} color="var(--fg3)" />
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function Section({ label, children }) {
  return (
    <div style={{ marginBottom: "20px" }}>
      <Eyebrow style={{ marginBottom: "7px" }}>{label}</Eyebrow>
      {children}
    </div>
  );
}

const p = (color, size) => ({ margin: 0, fontSize: size, lineHeight: 1.5, color });
const pill = (bg, color) => ({ display: "inline-flex", alignItems: "center", gap: "5px", padding: "4px 10px", borderRadius: "100px", background: bg, color, fontSize: "11px", fontWeight: 700 });
