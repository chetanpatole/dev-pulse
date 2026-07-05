import { useEffect, useMemo, useState } from "react";
import { cssVars } from "./lib/theme.js";
import { Bolt, List, Calendar, Gear, Sun, Moon, WifiOff, X } from "./lib/icons.jsx";
import Insight from "./views/Insight.jsx";
import Updates from "./views/Updates.jsx";
import Recap from "./views/Recap.jsx";
import Settings from "./views/Settings.jsx";
import Onboarding from "./views/Onboarding.jsx";

const ACCENT = "#0e9aa7";
const DEFAULT_STACK = ["Hydrogen", "React Router", "GraphQL Admin API", "Functions", "Polaris", "Checkout UI Extensions"];

const prefersDark = () => window.matchMedia?.("(prefers-color-scheme: dark)").matches;

export default function App() {
  const [theme, setTheme] = useState(() => localStorage.getItem("dp-theme") || (prefersDark() ? "dark" : "light"));
  const [onboarded, setOnboarded] = useState(() => localStorage.getItem("dp-onboarded") === "1");
  const [stack, setStack] = useState(() => JSON.parse(localStorage.getItem("dp-stack") || "null") || DEFAULT_STACK);
  const [notif, setNotif] = useState(() => (typeof Notification !== "undefined" ? Notification.permission : "default"));

  const [view, setView] = useState("insight");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [filters, setFilters] = useState({ typeFilter: null, forYou: false, activeHashtag: null });
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [offline, setOffline] = useState(!navigator.onLine);

  useEffect(() => { localStorage.setItem("dp-theme", theme); }, [theme]);
  useEffect(() => { localStorage.setItem("dp-stack", JSON.stringify(stack)); }, [stack]);

  useEffect(() => {
    const on = () => setOffline(false), off = () => setOffline(true);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => { window.removeEventListener("online", on); window.removeEventListener("offline", off); };
  }, []);

  useEffect(() => {
    fetch(`${import.meta.env.BASE_URL}feed.json`)
      .then((r) => r.json())
      .then((d) => setData(d))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, []);

  const vars = useMemo(() => cssVars(theme, ACCENT), [theme]);
  const dateLabel = useMemo(() => new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" }), []);

  const goHashtag = (tag) => { setFilters({ typeFilter: null, forYou: false, activeHashtag: tag }); setView("updates"); setSettingsOpen(false); };
  const goHome = () => { setView("insight"); setSettingsOpen(false); };

  const enableNotifications = async () => {
    finishOnboarding();
    try {
      if (typeof Notification !== "undefined") setNotif(await Notification.requestPermission());
    } catch { /* ignore */ }
  };
  const toggleNotif = async () => {
    if (notif === "granted") return; // browsers don't allow revoking from JS
    try {
      if (typeof Notification !== "undefined") setNotif(await Notification.requestPermission());
    } catch { /* ignore */ }
  };
  function finishOnboarding() { setOnboarded(true); localStorage.setItem("dp-onboarded", "1"); }

  const rootStyle = { ...vars, minHeight: "100%", display: "flex", flexDirection: "column", background: "var(--bg)", color: "var(--fg)", fontFamily: "Figtree, sans-serif" };

  if (!onboarded) {
    return <div style={rootStyle}><Onboarding onEnable={enableNotifications} onSkip={finishOnboarding} /></div>;
  }

  return (
    <div style={rootStyle}>
      <header style={{ display: "flex", alignItems: "center", padding: "14px 16px 10px", position: "sticky", top: 0, background: "var(--bg)", zIndex: 3 }}>
        <button onClick={goHome} aria-label="Dev Pulse — go to home" style={{ display: "flex", alignItems: "center", gap: "10px", flex: 1, padding: 0, margin: 0, background: "none", border: "none", textAlign: "left", cursor: "pointer", WebkitTapHighlightColor: "transparent" }}>
          <span style={{ width: "30px", height: "30px", flex: "none", borderRadius: "8px", background: "var(--accent)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Bolt size={17} fill="currentColor" />
          </span>
          <span>
            <span style={{ display: "block", fontSize: "16px", fontWeight: 800, color: "var(--fg)", lineHeight: 1.1 }}>Dev Pulse</span>
            <span style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "11.5px", color: "var(--fg3)" }}>
              <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: "var(--accent)" }} />
              Synced {data?.meta?.lastSynced || "—"}
            </span>
          </span>
        </button>
        <IconBtn onClick={() => setTheme(theme === "dark" ? "light" : "dark")} label="Toggle theme">
          {theme === "dark" ? <Sun /> : <Moon />}
        </IconBtn>
        <IconBtn onClick={() => setSettingsOpen((o) => !o)} label={settingsOpen ? "Close settings" : "Settings"} color={settingsOpen ? "var(--accent)" : "var(--fg2)"}>
          <Gear />
        </IconBtn>
      </header>

      {offline && (
        <div style={{ display: "flex", alignItems: "center", gap: "8px", margin: "0 16px 8px", padding: "9px 12px", borderRadius: "11px", background: "var(--surface2)", color: "var(--fg2)", fontSize: "12.5px", fontWeight: 500 }}>
          <WifiOff size={15} /> Offline — showing your last synced updates.
        </div>
      )}

      <main style={{ flex: 1 }}>
        {view === "insight" && <Insight insight={data?.insight} dateLabel={dateLabel} onHashtag={goHashtag} />}
        {view === "updates" && <Updates updates={data?.updates} loading={loading} filters={filters} setFilters={setFilters} />}
        {view === "recap" && <Recap recap={data?.recap} onHashtag={goHashtag} />}
      </main>

      <nav style={{ position: "sticky", bottom: 0, display: "flex", background: "var(--nav-bg)", borderTop: "1px solid var(--border)", paddingBottom: "env(safe-area-inset-bottom)" }}>
        <Tab active={view === "insight"} onClick={() => setView("insight")} icon={<Bolt fill={view === "insight" ? "currentColor" : "none"} />} label="Insight" />
        <Tab active={view === "updates"} onClick={() => setView("updates")} icon={<List />} label="Updates" />
        <Tab active={view === "recap"} onClick={() => setView("recap")} icon={<Calendar />} label="Recap" />
      </nav>

      {/* Settings drawer (slides in from the right) */}
      <div
        onClick={() => setSettingsOpen(false)}
        aria-hidden={!settingsOpen}
        style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)",
          opacity: settingsOpen ? 1 : 0, pointerEvents: settingsOpen ? "auto" : "none",
          transition: "opacity 0.25s ease", zIndex: 20,
        }}
      />
      <aside
        role="dialog"
        aria-label="Settings"
        aria-hidden={!settingsOpen}
        style={{
          position: "fixed", top: 0, right: 0, bottom: 0, width: "min(420px, 90vw)",
          background: "var(--bg)", zIndex: 21, overflowY: "auto",
          transform: settingsOpen ? "translateX(0)" : "translateX(100%)",
          transition: "transform 0.28s cubic-bezier(0.22,0.61,0.36,1)",
          boxShadow: settingsOpen ? "-14px 0 44px rgba(0,0,0,0.28)" : "none",
          paddingBottom: "env(safe-area-inset-bottom)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "flex-end", padding: "12px 10px 0", position: "sticky", top: 0, background: "var(--bg)", zIndex: 1 }}>
          <IconBtn onClick={() => setSettingsOpen(false)} label="Close settings"><X size={20} /></IconBtn>
        </div>
        <Settings meta={data?.meta} notif={notif} onToggleNotif={toggleNotif} stack={stack} setStack={setStack} />
      </aside>
    </div>
  );
}

function IconBtn({ children, onClick, label, color = "var(--fg2)" }) {
  return (
    <button onClick={onClick} aria-label={label} style={{ width: "38px", height: "38px", display: "flex", alignItems: "center", justifyContent: "center", background: "none", border: "none", color, cursor: "pointer" }}>
      {children}
    </button>
  );
}

function Tab({ active, onClick, icon, label }) {
  return (
    <button onClick={onClick} style={{
      flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "3px", padding: "9px 0 10px",
      background: "none", border: "none", cursor: "pointer", color: active ? "var(--accent)" : "var(--fg3)",
    }}>
      {icon}
      <span style={{ fontSize: "11px", fontWeight: 700 }}>{label}</span>
    </button>
  );
}
