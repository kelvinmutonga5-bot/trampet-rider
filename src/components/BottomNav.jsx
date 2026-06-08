const TABS = [
  { id: "jobs",     icon: "📋", label: "Jobs" },
  { id: "active",   icon: "🛵", label: "Active" },
  { id: "earnings", icon: "💰", label: "Earnings" },
  { id: "profile",  icon: "👤", label: "Profile" },
];

export default function BottomNav({ tab, onTab, jobCount, hasActive }) {
  return (
    <div style={{
      position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)",
      width: "100%", maxWidth: 420,
      background: "#0d0d0d", borderTop: "1px solid #1a1a1a",
      display: "flex", zIndex: 100,
      paddingBottom: "env(safe-area-inset-bottom, 0px)"
    }}>
      {TABS.map(t => {
        const isActive = tab === t.id;
        const badge = t.id === "jobs" && jobCount > 0 ? jobCount : (t.id === "active" && hasActive ? "●" : null);
        return (
          <button key={t.id} onClick={() => onTab(t.id)} style={{
            flex: 1, background: "none", border: "none",
            padding: "12px 0", cursor: "pointer",
            display: "flex", flexDirection: "column",
            alignItems: "center", gap: 4, position: "relative"
          }}>
            <div style={{ position: "relative" }}>
              <span style={{ fontSize: 22 }}>{t.icon}</span>
              {badge && (
                <div style={{
                  position: "absolute", top: -4, right: -8,
                  background: "#ff6b2b", borderRadius: 100,
                  minWidth: 16, height: 16, fontSize: 10, fontWeight: 700,
                  color: "#fff", display: "flex", alignItems: "center",
                  justifyContent: "center", padding: "0 4px"
                }}>{badge}</div>
              )}
            </div>
            <span style={{
              fontSize: 10, fontWeight: isActive ? 700 : 400,
              color: isActive ? "#ff6b2b" : "#555"
            }}>{t.label}</span>
            {isActive && (
              <div style={{
                position: "absolute", top: 0, left: "50%",
                transform: "translateX(-50%)",
                width: 28, height: 2, background: "#ff6b2b", borderRadius: 2
              }} />
            )}
          </button>
        );
      })}
    </div>
  );
}
