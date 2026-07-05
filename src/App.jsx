import { useEffect, useMemo, useState } from "react";
import { cssVars } from "./lib/theme.js";
import { Bolt, List, Calendar, Gear, Sun, Moon, WifiOff } from "./lib/icons.jsx";
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

  const goHashtag = (tag) => { setFilters({ typeFilter: null, forYou: false, activeHashtag: tag }); setView("updates"); };

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
        <span style={{ width: "30px", height: "30px", borderRadius: "8px", background: "var(--accent)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Bolt size={17} fill="currentColor" />
        </span>
        <div style={{ marginLeft: "10px", flex: 1 }}>
          <div style={{ fontSize: "16px", fontWeight: 800, color: "var(--fg)", lineHeight: 1.1 }}>Dev Pulse</div>
          <div style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "11.5px", color: "var(--fg3)" }}>
            <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: "var(--accent)" }} />
            Synced {data?.meta?.lastSynced || "—"}
          </div>
        </div>
        <IconBtn onClick={() => setTheme(theme === "dark" ? "light" : "dark")} label="Toggle theme">
          {theme === "dark" ? <Sun /> : <Moon />}
        </IconBtn>
        <IconBtn onClick={() => setView("settings")} label="Settings" color={view === "settings" ? "var(--accent)" : "var(--fg2)"}>
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
        {view === "settings" && <Settings meta={data?.meta} notif={notif} onToggleNotif={toggleNotif} stack={stack} setStack={setStack} />}
      </main>

      <nav style={{ position: "sticky", bottom: 0, display: "flex", background: "var(--nav-bg)", borderTop: "1px solid var(--border)", paddingBottom: "env(safe-area-inset-bottom)" }}>
        <Tab active={view === "insight"} onClick={() => setView("insight")} icon={<Bolt fill={view === "insight" ? "currentColor" : "none"} />} label="Insight" />
        <Tab active={view === "updates"} onClick={() => setView("updates")} icon={<List />} label="Updates" />
        <Tab active={view === "recap"} onClick={() => setView("recap")} icon={<Calendar />} label="Recap" />
      </nav>
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
