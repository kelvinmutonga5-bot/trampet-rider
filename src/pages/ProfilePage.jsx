export default function ProfilePage({ rider, completed }) {
  const todayEarnings = completed.reduce((s, d) => s + d.deliveryFee, 0);

  return (
    <div style={{ padding: 16 }}>
      {/* Profile card */}
      <div style={{
        background: "#111", border: "1px solid #1a1a1a",
        borderRadius: 16, padding: "24px 20px",
        textAlign: "center", marginBottom: 16
      }}>
        <div style={{
          width: 72, height: 72, borderRadius: "50%", margin: "0 auto 14px",
          background: "linear-gradient(135deg, #ff6b2b, #ff3d00)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 28, fontWeight: 800, color: "#fff", fontFamily: "'Syne',sans-serif"
        }}>
          {rider.name.split(" ").map(n => n[0]).join("").substring(0, 2)}
        </div>
        <h2 style={{ color: "#fff", fontFamily: "'Syne',sans-serif", fontSize: 22, fontWeight: 800, margin: "0 0 4px" }}>
          {rider.name}
        </h2>
        <p style={{ color: "#555", fontSize: 14, margin: "0 0 16px" }}>
          {rider.vehicle} · {rider.city}
        </p>
        <div style={{ display: "flex", justifyContent: "center", gap: 24 }}>
          <Stat value={`⭐ ${rider.rating}`} label="Rating" />
          <Stat value={rider.totalDeliveries} label="All time" />
          <Stat value={completed.length} label="Today" />
        </div>
      </div>

      {/* Details */}
      <div style={{ background: "#111", border: "1px solid #1a1a1a", borderRadius: 14, overflow: "hidden", marginBottom: 16 }}>
        {[
          ["Phone", rider.phone],
          ["Vehicle", rider.vehicle],
          ["Plate number", rider.plate],
          ["City", rider.city],
          ["Today's earnings", `Ksh ${todayEarnings.toLocaleString()}`],
        ].map(([k, v], i, arr) => (
          <div key={k} style={{
            display: "flex", justifyContent: "space-between", padding: "14px 16px",
            borderBottom: i < arr.length - 1 ? "1px solid #141414" : "none"
          }}>
            <span style={{ color: "#555", fontSize: 14 }}>{k}</span>
            <span style={{ color: "#ccc", fontSize: 14, fontWeight: 500 }}>{v}</span>
          </div>
        ))}
      </div>

      {/* Support */}
      <div style={{ background: "#111", border: "1px solid #1a1a1a", borderRadius: 14, overflow: "hidden" }}>
        <a href="tel:+254700000000" style={{
          display: "flex", justifyContent: "space-between", alignItems: "center",
          padding: "14px 16px", borderBottom: "1px solid #141414",
          textDecoration: "none"
        }}>
          <span style={{ color: "#ccc", fontSize: 14 }}>📞 Call Trampet support</span>
          <span style={{ color: "#555", fontSize: 14 }}>→</span>
        </a>
        <div style={{ padding: "14px 16px" }}>
          <span style={{ color: "#ef4444", fontSize: 14, cursor: "pointer" }}>🚪 Sign out</span>
        </div>
      </div>
    </div>
  );
}

function Stat({ value, label }) {
  return (
    <div style={{ textAlign: "center" }}>
      <p style={{ color: "#fff", fontSize: 18, fontWeight: 700, margin: "0 0 2px" }}>{value}</p>
      <p style={{ color: "#555", fontSize: 12, margin: 0 }}>{label}</p>
    </div>
  );
}
