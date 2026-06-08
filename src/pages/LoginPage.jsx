import { useState } from "react";

export default function LoginPage({ onLogin }) {
  const [phone, setPhone] = useState("");
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);

  function handleLogin() {
    if (!phone || pin.length < 4) return;
    setLoading(true);
    setTimeout(() => { setLoading(false); onLogin(); }, 1200);
  }

  return (
    <div style={{
      minHeight: "100vh", background: "#080808",
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center", padding: 24
    }}>
      <div style={{ width: "100%", maxWidth: 360, textAlign: "center" }}>
        <div style={{
          width: 64, height: 64, borderRadius: 18, margin: "0 auto 14px",
          background: "linear-gradient(135deg, #ff6b2b, #ff3d00)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 28
        }}>🛵</div>
        <h1 style={{ fontFamily: "'Syne',sans-serif", fontSize: 26, fontWeight: 800, color: "#fff", margin: "0 0 4px" }}>Trampet Rider</h1>
        <p style={{ color: "#555", fontSize: 14, margin: "0 0 36px" }}>Sign in to start delivering</p>

        <div style={{ background: "#111", border: "1px solid #1e1e1e", borderRadius: 18, padding: "24px 20px" }}>
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: "block", color: "#555", fontSize: 11, marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.5, textAlign: "left" }}>Phone number</label>
            <input value={phone} onChange={e => setPhone(e.target.value)} type="tel" placeholder="0712 345 678"
              style={{ width: "100%", background: "#0d0d0d", border: "1px solid #2a2a2a", borderRadius: 10, padding: "13px 14px", color: "#fff", fontSize: 16, outline: "none", boxSizing: "border-box", fontFamily: "inherit" }} />
          </div>
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: "block", color: "#555", fontSize: 11, marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.5, textAlign: "left" }}>PIN</label>
            <input value={pin} onChange={e => setPin(e.target.value)} type="password" placeholder="••••" maxLength={6}
              onKeyDown={e => e.key === "Enter" && handleLogin()}
              style={{ width: "100%", background: "#0d0d0d", border: "1px solid #2a2a2a", borderRadius: 10, padding: "13px 14px", color: "#fff", fontSize: 22, outline: "none", boxSizing: "border-box", fontFamily: "inherit", letterSpacing: 8, textAlign: "center" }} />
          </div>
          <button onClick={handleLogin} disabled={loading} style={{
            width: "100%", background: loading ? "#2a2a2a" : "#ff6b2b",
            border: "none", borderRadius: 12, padding: "15px",
            color: "#fff", fontSize: 16, fontWeight: 700,
            cursor: loading ? "not-allowed" : "pointer"
          }}>{loading ? "Signing in..." : "Sign in"}</button>
          <p style={{ color: "#333", fontSize: 12, marginTop: 14 }}>Demo: enter any phone + 4-digit PIN</p>
        </div>
      </div>
    </div>
  );
}
