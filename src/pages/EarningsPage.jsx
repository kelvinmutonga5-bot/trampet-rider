import { completedToday } from "../data/mockData";

export default function EarningsPage({ completed }) {
  const todayEarnings = completed.reduce((s, d) => s + d.deliveryFee, 0);
  const weekEstimate = todayEarnings * 6;

  return (
    <div style={{ padding: 16 }}>
      {/* Today summary */}
      <div style={{
        background: "linear-gradient(135deg, #ff6b2b22, #ff3d0011)",
        border: "1px solid #ff6b2b33", borderRadius: 16,
        padding: "20px", marginBottom: 16, textAlign: "center"
      }}>
        <p style={{ color: "#ff6b2b", fontSize: 12, fontWeight: 700, margin: "0 0 8px", textTransform: "uppercase", letterSpacing: 1 }}>Today's earnings</p>
        <p style={{ color: "#fff", fontSize: 42, fontWeight: 800, margin: "0 0 4px", fontFamily: "'Syne',sans-serif" }}>
          Ksh {todayEarnings.toLocaleString()}
        </p>
        <p style={{ color: "#555", fontSize: 13, margin: 0 }}>{completed.length} deliveries completed</p>
      </div>

      {/* Stats row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
        <StatCard label="This week (est.)" value={`Ksh ${weekEstimate.toLocaleString()}`} icon="📅" />
        <StatCard label="Avg per delivery" value={`Ksh ${completed.length > 0 ? Math.round(todayEarnings / completed.length) : 0}`} icon="📊" />
      </div>

      {/* Today's deliveries */}
      <div style={{
        background: "#111", border: "1px solid #1a1a1a",
        borderRadius: 14, overflow: "hidden"
      }}>
        <div style={{ padding: "14px 16px", borderBottom: "1px solid #1a1a1a" }}>
          <p style={{ color: "#fff", fontSize: 15, fontWeight: 700, margin: 0, fontFamily: "'Syne',sans-serif" }}>Today's deliveries</p>
        </div>

        {completed.length === 0 ? (
          <p style={{ color: "#444", fontSize: 14, textAlign: "center", padding: "24px" }}>No deliveries yet today</p>
        ) : (
          completed.map((d, i) => (
            <div key={d.id} style={{
              padding: "14px 16px",
              borderBottom: i < completed.length - 1 ? "1px solid #141414" : "none",
              display: "flex", justifyContent: "space-between", alignItems: "center"
            }}>
              <div>
                <p style={{ color: "#ccc", fontSize: 14, fontWeight: 600, margin: "0 0 2px" }}>{d.customer}</p>
                <p style={{ color: "#555", fontSize: 12, margin: "0 0 2px" }}>{d.restaurant}</p>
                <div style={{ display: "flex", gap: 10 }}>
                  <span style={{ color: "#444", fontSize: 11 }}>📏 {d.distance}</span>
                  <span style={{ color: "#444", fontSize: 11 }}>🕐 {d.deliveredAt}</span>
                  <span style={{ color: "#444", fontSize: 11 }}>{d.payment === "M-Pesa" ? "📱" : "💵"} {d.payment}</span>
                </div>
              </div>
              <span style={{ color: "#16a34a", fontWeight: 700, fontSize: 16 }}>
                +Ksh {d.deliveryFee}
              </span>
            </div>
          ))
        )}
      </div>

      {/* Payout info */}
      <div style={{
        marginTop: 14, background: "#0a1a0a", border: "1px solid #1a2a1a",
        borderRadius: 12, padding: "12px 16px",
        display: "flex", gap: 10, alignItems: "flex-start"
      }}>
        <span style={{ fontSize: 16 }}>ℹ️</span>
        <p style={{ color: "#555", fontSize: 12, margin: 0, lineHeight: 1.5 }}>
          Your earnings are paid <strong style={{ color: "#888" }}>daily via M-Pesa</strong> at end of shift by the Trampet admin.
        </p>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon }) {
  return (
    <div style={{ background: "#111", border: "1px solid #1a1a1a", borderRadius: 12, padding: "14px" }}>
      <span style={{ fontSize: 20 }}>{icon}</span>
      <p style={{ color: "#fff", fontSize: 18, fontWeight: 800, margin: "8px 0 2px", fontFamily: "'Syne',sans-serif" }}>{value}</p>
      <p style={{ color: "#555", fontSize: 11, margin: 0 }}>{label}</p>
    </div>
  );
}
