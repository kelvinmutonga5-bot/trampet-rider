import { useState } from "react";

const STEPS = [
  { status: "assigned",  label: "Head to restaurant",   icon: "🏍️",  action: "Confirm pickup",      next: "picked_up" },
  { status: "picked_up", label: "Head to customer",      icon: "📦",  action: "Confirm delivery",    next: "delivered" },
];

export default function ActiveJobPage({ job, onUpdateStatus, onBack }) {
  const [showConfirm, setShowConfirm] = useState(false);
  const step = STEPS.find(s => s.status === job.status) || STEPS[0];
  const stepIndex = STEPS.indexOf(step);

  function handleAction() {
    if (step.next === "delivered") {
      setShowConfirm(true);
    } else {
      onUpdateStatus(job.id, step.next);
    }
  }

  return (
    <div style={{ padding: 16 }}>
      {/* Back */}
      <button onClick={onBack} style={{
        background: "none", border: "none", color: "#666",
        fontSize: 14, cursor: "pointer", padding: 0, marginBottom: 16
      }}>← Back to jobs</button>

      {/* Order ID */}
      <div style={{
        background: "#111", border: "1px solid #1a1a1a",
        borderRadius: 14, padding: "14px 16px", marginBottom: 14
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <p style={{ color: "#555", fontSize: 11, margin: "0 0 3px", textTransform: "uppercase", letterSpacing: 0.5 }}>Order ID</p>
            <p style={{ color: "#ff6b2b", fontSize: 18, fontWeight: 800, margin: 0, fontFamily: "'Syne',sans-serif" }}>{job.id}</p>
          </div>
          <div style={{ textAlign: "right" }}>
            <p style={{ color: "#555", fontSize: 11, margin: "0 0 3px" }}>Distance</p>
            <p style={{ color: "#fff", fontSize: 16, fontWeight: 700, margin: 0 }}>{job.distance}</p>
          </div>
        </div>
      </div>

      {/* Progress steps */}
      <div style={{
        background: "#111", border: "1px solid #1a1a1a",
        borderRadius: 14, padding: "16px", marginBottom: 14
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 0, marginBottom: 16 }}>
          {STEPS.map((s, i) => (
            <div key={s.status} style={{ display: "flex", alignItems: "center", flex: i < STEPS.length - 1 ? 1 : 0 }}>
              <div style={{
                width: 36, height: 36, borderRadius: "50%", flexShrink: 0,
                background: i < stepIndex ? "#16a34a" : i === stepIndex ? "#ff6b2b" : "#1a1a1a",
                border: `2px solid ${i < stepIndex ? "#16a34a" : i === stepIndex ? "#ff6b2b" : "#2a2a2a"}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: i < stepIndex ? 16 : 18, transition: "all 0.3s"
              }}>
                {i < stepIndex ? "✓" : s.icon}
              </div>
              {i < STEPS.length - 1 && (
                <div style={{
                  flex: 1, height: 2,
                  background: i < stepIndex ? "#16a34a" : "#1a1a1a",
                  transition: "background 0.3s"
                }} />
              )}
            </div>
          ))}
        </div>
        <p style={{
          color: "#fff", fontSize: 16, fontWeight: 700,
          margin: "0 0 4px", textAlign: "center"
        }}>{step.label}</p>
        <p style={{ color: "#555", fontSize: 13, textAlign: "center", margin: 0 }}>
          Step {stepIndex + 1} of {STEPS.length}
        </p>
      </div>

      {/* Current stop details */}
      {job.status === "assigned" ? (
        <StopCard
          type="pickup"
          title="Pickup from restaurant"
          name={job.restaurant.name}
          address={job.restaurant.address}
          phone={job.restaurant.phone}
          extra={
            <div style={{ marginTop: 10 }}>
              <p style={{ color: "#555", fontSize: 11, margin: "0 0 6px", textTransform: "uppercase", letterSpacing: 0.5 }}>Order items</p>
              {job.items.map((item, i) => (
                <p key={i} style={{ color: "#888", fontSize: 13, margin: "0 0 3px" }}>
                  {item.qty}× {item.name}
                </p>
              ))}
            </div>
          }
        />
      ) : (
        <StopCard
          type="dropoff"
          title="Deliver to customer"
          name={job.customer.name}
          address={job.customer.address}
          phone={job.customer.phone}
          extra={
            job.payment === "Cash" && !job.paid && (
              <div style={{
                marginTop: 10, background: "#1a1200", border: "1px solid #3a2800",
                borderRadius: 8, padding: "10px 12px"
              }}>
                <p style={{ color: "#f59e0b", fontSize: 13, fontWeight: 700, margin: "0 0 2px" }}>
                  💵 Collect cash payment
                </p>
                <p style={{ color: "#888", fontSize: 13, margin: 0 }}>
                  Ksh {job.orderTotal.toLocaleString()} from customer
                </p>
              </div>
            )
          }
        />
      )}

      {/* Navigation button */}
      <a
        href={`https://www.google.com/maps/dir/?api=1&destination=${
          job.status === "assigned"
            ? `${job.restaurant.coords.lat},${job.restaurant.coords.lng}`
            : `${job.customer.coords.lat},${job.customer.coords.lng}`
        }`}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          display: "block", textAlign: "center",
          background: "#1a1a3a", border: "1px solid #2a2a5a",
          borderRadius: 12, padding: "13px", color: "#6b8bff",
          fontSize: 14, fontWeight: 600, textDecoration: "none",
          marginBottom: 10
        }}
      >
        🗺️ Open in Google Maps
      </a>

      {/* Main action button */}
      <button onClick={handleAction} style={{
        width: "100%", background: "#ff6b2b", border: "none",
        borderRadius: 12, padding: "16px", color: "#fff",
        fontSize: 16, fontWeight: 700, cursor: "pointer"
      }}>
        {step.action} ✓
      </button>

      {/* Confirm delivery modal */}
      {showConfirm && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)",
          backdropFilter: "blur(4px)", zIndex: 200,
          display: "flex", alignItems: "flex-end", justifyContent: "center"
        }}>
          <div style={{
            background: "#111", border: "1px solid #2a2a2a",
            borderRadius: "20px 20px 0 0", padding: "28px 24px",
            width: "100%", maxWidth: 420
          }}>
            <div style={{ textAlign: "center", marginBottom: 24 }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>✅</div>
              <h2 style={{ color: "#fff", fontFamily: "'Syne',sans-serif", fontSize: 20, fontWeight: 800, margin: "0 0 8px" }}>
                Confirm delivery?
              </h2>
              <p style={{ color: "#555", fontSize: 14, margin: 0 }}>
                Order {job.id} delivered to {job.customer.name}
              </p>
              {job.payment === "Cash" && !job.paid && (
                <div style={{
                  marginTop: 14, background: "#1a1200", border: "1px solid #3a2800",
                  borderRadius: 10, padding: "10px 16px"
                }}>
                  <p style={{ color: "#f59e0b", fontSize: 14, fontWeight: 700, margin: 0 }}>
                    Have you collected Ksh {job.orderTotal.toLocaleString()} cash?
                  </p>
                </div>
              )}
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setShowConfirm(false)} style={{
                flex: 1, background: "#1a1a1a", border: "1px solid #2a2a2a",
                borderRadius: 12, color: "#666", padding: "14px",
                fontSize: 14, cursor: "pointer"
              }}>Cancel</button>
              <button onClick={() => { setShowConfirm(false); onUpdateStatus(job.id, "delivered"); }} style={{
                flex: 2, background: "#16a34a", border: "none",
                borderRadius: 12, color: "#fff", padding: "14px",
                fontSize: 14, fontWeight: 700, cursor: "pointer"
              }}>Yes, delivered!</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StopCard({ title, name, address, phone, extra }) {
  return (
    <div style={{
      background: "#111", border: "1px solid #1a1a1a",
      borderRadius: 14, padding: "16px", marginBottom: 12
    }}>
      <p style={{ color: "#555", fontSize: 11, margin: "0 0 10px", textTransform: "uppercase", letterSpacing: 0.5 }}>{title}</p>
      <p style={{ color: "#fff", fontSize: 16, fontWeight: 700, margin: "0 0 4px" }}>{name}</p>
      <p style={{ color: "#666", fontSize: 13, margin: "0 0 12px", lineHeight: 1.4 }}>{address}</p>
      <a href={`tel:${phone}`} style={{
        display: "inline-flex", alignItems: "center", gap: 8,
        background: "#1a1a1a", border: "1px solid #2a2a2a",
        borderRadius: 8, padding: "8px 14px", textDecoration: "none",
        color: "#ccc", fontSize: 13
      }}>
        📞 Call {phone}
      </a>
      {extra}
    </div>
  );
}
