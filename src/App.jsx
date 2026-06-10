import { useState, useEffect } from "react";
import { riderProfile, mockJobs, completedToday } from "./data/mockData";

const API = import.meta.env.VITE_API_URL || "http://localhost:4000";

export default function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [tab, setTab] = useState("jobs");
  const [jobs, setJobs] = useState(mockJobs);
  const [completed, setCompleted] = useState(completedToday);
  const [activeJob, setActiveJob] = useState(null);
  const [online, setOnline] = useState(true);

  function updateJobStatus(jobId, newStatus) {
    if (newStatus === "delivered") {
      const job = jobs.find(j => j.id === jobId);
      setCompleted(prev => [{ id: job.id, customer: job.customer.name, restaurant: job.restaurant.name, deliveredAt: new Date().toLocaleTimeString("en-KE", { hour: "2-digit", minute: "2-digit" }), deliveryFee: job.deliveryFee, distance: job.distance, payment: job.payment }, ...prev]);
      setJobs(prev => prev.filter(j => j.id !== jobId));
      setActiveJob(null);
      setTab("jobs");
    } else {
      setJobs(prev => prev.map(j => j.id === jobId ? { ...j, status: newStatus } : j));
      if (activeJob?.id === jobId) setActiveJob(prev => ({ ...prev, status: newStatus }));
    }
  }

  if (!loggedIn) return <Login onLogin={() => setLoggedIn(true)} />;

  return (
    <div style={{ maxWidth: 420, margin: "0 auto", minHeight: "100vh", background: "#f8fafc", display: "flex", flexDirection: "column" }}>
      {/* Top bar */}
      <div style={{ background: "white", borderBottom: "1px solid #e2e8f0", padding: "14px 20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <p style={{ fontWeight: 800, fontSize: 17, color: "#0f172a", margin: 0 }}>
            {tab === "jobs" && "My Jobs"}
            {tab === "active" && "Active Delivery"}
            {tab === "earnings" && "Earnings"}
            {tab === "profile" && "Profile"}
          </p>
          <p style={{ color: "#64748b", fontSize: 12, margin: 0 }}>{riderProfile.name} · {riderProfile.vehicle}</p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: online ? "#16a34a" : "#94a3b8" }}>{online ? "Online" : "Offline"}</span>
          <button onClick={() => setOnline(p => !p)} style={{ width: 46, height: 24, borderRadius: 12, background: online ? "#16a34a" : "#e2e8f0", border: "none", cursor: "pointer", position: "relative", transition: "background 0.2s" }}>
            <div style={{ width: 18, height: 18, borderRadius: "50%", background: "white", position: "absolute", top: 3, left: online ? 25 : 3, transition: "left 0.2s", boxShadow: "0 1px 3px rgba(0,0,0,0.2)" }} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflow: "auto", paddingBottom: 80 }}>
        {tab === "jobs" && <JobsTab jobs={jobs} online={online} onOpen={job => { setActiveJob(job); setTab("active"); }} onUpdate={updateJobStatus} />}
        {tab === "active" && (activeJob ? <ActiveTab job={activeJob} onUpdate={updateJobStatus} onBack={() => setTab("jobs")} /> : <NoActive onJobs={() => setTab("jobs")} />)}
        {tab === "earnings" && <EarningsTab completed={completed} />}
        {tab === "profile" && <ProfileTab rider={riderProfile} completed={completed} />}
      </div>

      {/* Bottom nav */}
      <div style={{ position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 420, background: "white", borderTop: "1px solid #e2e8f0", display: "flex" }}>
        {[["jobs","📋","Jobs",jobs.length],["active","🛵","Active",activeJob?1:0],["earnings","💰","Earnings",0],["profile","👤","Profile",0]].map(([id, icon, label, badge]) => (
          <button key={id} onClick={() => setTab(id)} style={{ flex: 1, background: "none", border: "none", padding: "12px 0", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 3, position: "relative" }}>
            {badge > 0 && <div style={{ position: "absolute", top: 8, right: "calc(50% - 18px)", background: "#ef4444", color: "white", borderRadius: "50%", width: 16, height: 16, fontSize: 10, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>{badge}</div>}
            <span style={{ fontSize: 20 }}>{icon}</span>
            <span style={{ fontSize: 10, color: tab === id ? "#2563eb" : "#94a3b8", fontWeight: tab === id ? 700 : 400 }}>{label}</span>
            {tab === id && <div style={{ position: "absolute", top: 0, width: 28, height: 2, background: "#2563eb", borderRadius: 2 }} />}
          </button>
        ))}
      </div>
    </div>
  );
}

function JobsTab({ jobs, online, onOpen, onUpdate }) {
  if (!online) return (
    <div style={{ padding: 24, textAlign: "center", paddingTop: 60 }}>
      <div style={{ fontSize: 52, marginBottom: 14 }}>💤</div>
      <h2 style={{ fontSize: 18, fontWeight: 700, color: "#0f172a", marginBottom: 8 }}>You're offline</h2>
      <p style={{ color: "#64748b", fontSize: 14 }}>Go online to receive delivery jobs</p>
    </div>
  );

  if (jobs.length === 0) return (
    <div style={{ padding: 24, textAlign: "center", paddingTop: 60 }}>
      <div style={{ fontSize: 52, marginBottom: 14 }}>🕐</div>
      <h2 style={{ fontSize: 18, fontWeight: 700, color: "#0f172a", marginBottom: 8 }}>No jobs yet</h2>
      <p style={{ color: "#64748b", fontSize: 14 }}>Stay online — jobs appear when assigned</p>
    </div>
  );

  return (
    <div style={{ padding: 16 }}>
      <p style={{ color: "#64748b", fontSize: 13, marginBottom: 14 }}>{jobs.length} job{jobs.length !== 1 ? "s" : ""} assigned to you</p>
      {jobs.map(job => {
        const isPicked = job.status === "picked_up";
        return (
          <div key={job.id} style={{ background: "white", border: `1px solid ${isPicked ? "#bfdbfe" : "#e2e8f0"}`, borderRadius: 16, overflow: "hidden", marginBottom: 14, boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
            <div style={{ background: isPicked ? "#eff6ff" : "#f0fdf4", borderBottom: `1px solid ${isPicked ? "#bfdbfe" : "#bbf7d0"}`, padding: "8px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: isPicked ? "#2563eb" : "#16a34a" }} />
                <span style={{ color: isPicked ? "#1d4ed8" : "#15803d", fontSize: 12, fontWeight: 700 }}>{isPicked ? "Picked up — deliver now" : "New job — pick up from restaurant"}</span>
              </div>
              <span style={{ color: "#94a3b8", fontSize: 12 }}>{job.assignedAt}</span>
            </div>
            <div style={{ padding: 16 }}>
              <div style={{ marginBottom: 14 }}>
                {[["🍽️", "Pick up from", job.restaurant.name, job.restaurant.address], ["📍", "Deliver to", job.customer.name, job.customer.address]].map(([icon, label, name, addr], i) => (
                  <div key={i}>
                    {i === 1 && <div style={{ width: 2, height: 16, background: "#e2e8f0", marginLeft: 15, margin: "4px 0 4px 15px" }} />}
                    <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                      <div style={{ width: 32, height: 32, borderRadius: 8, background: "#f1f5f9", border: "1px solid #e2e8f0", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, flexShrink: 0 }}>{icon}</div>
                      <div>
                        <p style={{ color: "#94a3b8", fontSize: 11, margin: "0 0 2px", textTransform: "uppercase", letterSpacing: 0.5 }}>{label}</p>
                        <p style={{ fontWeight: 600, fontSize: 14, color: "#0f172a", margin: "0 0 2px" }}>{name}</p>
                        <p style={{ color: "#64748b", fontSize: 12, margin: 0 }}>{addr}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ display: "flex", gap: 14, padding: "10px 0", borderTop: "1px solid #f1f5f9", borderBottom: "1px solid #f1f5f9", marginBottom: 14 }}>
                <span style={{ color: "#64748b", fontSize: 12 }}>📏 {job.distance}</span>
                <span style={{ color: "#64748b", fontSize: 12 }}>🕐 {job.eta}</span>
                <span style={{ color: "#64748b", fontSize: 12 }}>{job.payment === "M-Pesa" ? "📱" : "💵"} {job.payment}</span>
                {job.payment === "Cash" && !job.paid && <span style={{ color: "#d97706", fontSize: 12, fontWeight: 700 }}>💰 Collect Ksh {job.orderTotal.toLocaleString()}</span>}
              </div>
              <button onClick={() => onOpen(job)} style={{ width: "100%", background: "#2563eb", border: "none", borderRadius: 12, padding: "13px", color: "white", fontSize: 15, fontWeight: 700, cursor: "pointer" }}>
                {isPicked ? "📍 Continue delivery" : "🛵 Start delivery"}
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ActiveTab({ job, onUpdate, onBack }) {
  const [showConfirm, setShowConfirm] = useState(false);
  const steps = [{ status: "assigned", icon: "🏍️", label: "Head to restaurant", action: "Confirm pickup", next: "picked_up" }, { status: "picked_up", icon: "📦", label: "Head to customer", action: "Confirm delivery", next: "delivered" }];
  const stepIdx = steps.findIndex(s => s.status === job.status);
  const step = steps[stepIdx] || steps[0];

  return (
    <div style={{ padding: 16 }}>
      <button onClick={onBack} style={{ background: "none", border: "none", color: "#64748b", fontSize: 14, cursor: "pointer", marginBottom: 16, padding: 0 }}>← Back to jobs</button>

      {/* Order ID */}
      <div style={{ background: "white", border: "1px solid #e2e8f0", borderRadius: 14, padding: "14px 18px", marginBottom: 14, display: "flex", justifyContent: "space-between" }}>
        <div><p style={{ color: "#64748b", fontSize: 11, textTransform: "uppercase", letterSpacing: 0.5, margin: "0 0 3px" }}>Order</p><p style={{ color: "#2563eb", fontSize: 20, fontWeight: 800, margin: 0 }}>{job.id}</p></div>
        <div style={{ textAlign: "right" }}><p style={{ color: "#64748b", fontSize: 11, textTransform: "uppercase", letterSpacing: 0.5, margin: "0 0 3px" }}>Distance</p><p style={{ fontWeight: 700, fontSize: 16, color: "#0f172a", margin: 0 }}>{job.distance}</p></div>
      </div>

      {/* Progress */}
      <div style={{ background: "white", border: "1px solid #e2e8f0", borderRadius: 14, padding: 16, marginBottom: 14 }}>
        <div style={{ display: "flex", alignItems: "center", marginBottom: 12 }}>
          {steps.map((s, i) => (
            <div key={s.status} style={{ display: "flex", alignItems: "center", flex: i < steps.length - 1 ? 1 : 0 }}>
              <div style={{ width: 36, height: 36, borderRadius: "50%", background: i < stepIdx ? "#f0fdf4" : i === stepIdx ? "#eff6ff" : "#f8fafc", border: `2px solid ${i < stepIdx ? "#16a34a" : i === stepIdx ? "#2563eb" : "#e2e8f0"}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: i < stepIdx ? 14 : 18, flexShrink: 0 }}>
                {i < stepIdx ? "✓" : s.icon}
              </div>
              {i < steps.length - 1 && <div style={{ flex: 1, height: 2, background: i < stepIdx ? "#16a34a" : "#e2e8f0" }} />}
            </div>
          ))}
        </div>
        <p style={{ fontWeight: 700, fontSize: 15, color: "#0f172a", textAlign: "center", margin: "0 0 2px" }}>{step.label}</p>
        <p style={{ color: "#64748b", fontSize: 13, textAlign: "center", margin: 0 }}>Step {stepIdx + 1} of {steps.length}</p>
      </div>

      {/* Stop details */}
      {[job.status === "assigned" ? { icon: "🍽️", title: "Pick up from", name: job.restaurant.name, addr: job.restaurant.address, phone: job.restaurant.phone, extra: null } : { icon: "📍", title: "Deliver to", name: job.customer.name, addr: job.customer.address, phone: job.customer.phone, extra: job.payment === "Cash" && !job.paid ? "cash" : null }].map(stop => (
        <div key={stop.title} style={{ background: "white", border: "1px solid #e2e8f0", borderRadius: 14, padding: 16, marginBottom: 12 }}>
          <p style={{ color: "#64748b", fontSize: 11, textTransform: "uppercase", letterSpacing: 0.5, margin: "0 0 10px" }}>{stop.title}</p>
          <p style={{ fontWeight: 700, fontSize: 16, color: "#0f172a", margin: "0 0 4px" }}>{stop.name}</p>
          <p style={{ color: "#64748b", fontSize: 13, margin: "0 0 12px", lineHeight: 1.5 }}>{stop.addr}</p>
          <a href={`tel:${stop.phone}`} style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#f1f5f9", border: "1px solid #e2e8f0", borderRadius: 8, padding: "8px 14px", color: "#374151", fontSize: 13, textDecoration: "none" }}>📞 Call {stop.phone}</a>
          {stop.extra === "cash" && (
            <div style={{ marginTop: 10, background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 10, padding: "10px 14px" }}>
              <p style={{ color: "#92400e", fontWeight: 700, fontSize: 13, margin: 0 }}>💵 Collect Ksh {job.orderTotal.toLocaleString()} cash from customer</p>
            </div>
          )}
        </div>
      ))}

      <a href={`https://www.google.com/maps/dir/?api=1&destination=${job.status === "assigned" ? `${job.restaurant.coords.lat},${job.restaurant.coords.lng}` : `${job.customer.coords.lat},${job.customer.coords.lng}`}`} target="_blank" rel="noopener noreferrer" style={{ display: "block", textAlign: "center", background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 12, padding: "12px", color: "#2563eb", fontSize: 14, fontWeight: 600, textDecoration: "none", marginBottom: 10 }}>
        🗺️ Open in Google Maps
      </a>

      <button onClick={() => step.next === "delivered" ? setShowConfirm(true) : onUpdate(job.id, step.next)} style={{ width: "100%", background: "#2563eb", border: "none", borderRadius: 12, padding: "15px", color: "white", fontSize: 16, fontWeight: 700, cursor: "pointer" }}>
        {step.action} ✓
      </button>

      {showConfirm && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.3)", zIndex: 200, display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
          <div style={{ background: "white", borderRadius: "20px 20px 0 0", padding: "28px 24px", width: "100%", maxWidth: 420 }}>
            <div style={{ textAlign: "center", marginBottom: 22 }}>
              <div style={{ fontSize: 48, marginBottom: 10 }}>✅</div>
              <h2 style={{ fontSize: 20, fontWeight: 800, color: "#0f172a", margin: "0 0 6px" }}>Confirm delivery?</h2>
              <p style={{ color: "#64748b", fontSize: 14 }}>Order {job.id} delivered to {job.customer.name}</p>
              {job.payment === "Cash" && !job.paid && (
                <div style={{ marginTop: 12, background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 10, padding: "10px" }}>
                  <p style={{ color: "#92400e", fontWeight: 700, fontSize: 13, margin: 0 }}>Have you collected Ksh {job.orderTotal.toLocaleString()} cash?</p>
                </div>
              )}
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setShowConfirm(false)} style={{ flex: 1, background: "#f1f5f9", border: "none", borderRadius: 12, color: "#64748b", padding: "13px", fontSize: 14, cursor: "pointer" }}>Cancel</button>
              <button onClick={() => { setShowConfirm(false); onUpdate(job.id, "delivered"); }} style={{ flex: 2, background: "#16a34a", border: "none", borderRadius: 12, color: "white", padding: "13px", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>Yes, delivered!</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function NoActive({ onJobs }) {
  return (
    <div style={{ padding: 24, textAlign: "center", paddingTop: 60 }}>
      <div style={{ fontSize: 52, marginBottom: 14 }}>🛵</div>
      <h2 style={{ fontSize: 18, fontWeight: 700, color: "#0f172a", marginBottom: 8 }}>No active delivery</h2>
      <button onClick={onJobs} style={{ marginTop: 8, background: "#2563eb", border: "none", borderRadius: 10, color: "white", padding: "12px 24px", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>View jobs</button>
    </div>
  );
}

function EarningsTab({ completed }) {
  const todayEarnings = completed.reduce((s, d) => s + d.deliveryFee, 0);
  return (
    <div style={{ padding: 16 }}>
      <div style={{ background: "linear-gradient(135deg, #1e40af, #2563eb)", borderRadius: 16, padding: "24px", marginBottom: 16, textAlign: "center" }}>
        <p style={{ color: "#bfdbfe", fontSize: 13, fontWeight: 600, textTransform: "uppercase", letterSpacing: 1, margin: "0 0 8px" }}>Today's earnings</p>
        <p style={{ color: "white", fontSize: 42, fontWeight: 800, margin: "0 0 6px" }}>Ksh {todayEarnings.toLocaleString()}</p>
        <p style={{ color: "#bfdbfe", fontSize: 13 }}>{completed.length} deliveries completed</p>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
        <div style={{ background: "white", border: "1px solid #e2e8f0", borderRadius: 14, padding: 16 }}>
          <span style={{ fontSize: 22 }}>📅</span>
          <p style={{ fontWeight: 800, fontSize: 18, color: "#0f172a", margin: "8px 0 4px" }}>Ksh {(todayEarnings * 6).toLocaleString()}</p>
          <p style={{ color: "#64748b", fontSize: 12, margin: 0 }}>This week (est.)</p>
        </div>
        <div style={{ background: "white", border: "1px solid #e2e8f0", borderRadius: 14, padding: 16 }}>
          <span style={{ fontSize: 22 }}>📊</span>
          <p style={{ fontWeight: 800, fontSize: 18, color: "#0f172a", margin: "8px 0 4px" }}>Ksh {completed.length > 0 ? Math.round(todayEarnings / completed.length) : 0}</p>
          <p style={{ color: "#64748b", fontSize: 12, margin: 0 }}>Avg per delivery</p>
        </div>
      </div>
      <div style={{ background: "white", border: "1px solid #e2e8f0", borderRadius: 14, overflow: "hidden" }}>
        <div style={{ padding: "14px 18px", borderBottom: "1px solid #f1f5f9" }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: "#0f172a", margin: 0 }}>Today's deliveries</h3>
        </div>
        {completed.length === 0 ? <p style={{ padding: 24, textAlign: "center", color: "#94a3b8", fontSize: 14 }}>No deliveries yet today</p>
          : completed.map((d, i, arr) => (
            <div key={d.id} style={{ padding: "13px 18px", borderBottom: i < arr.length - 1 ? "1px solid #f1f5f9" : "none", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <p style={{ fontWeight: 600, fontSize: 14, color: "#0f172a", margin: "0 0 2px" }}>{d.customer}</p>
                <p style={{ color: "#64748b", fontSize: 12, margin: "0 0 2px" }}>{d.restaurant}</p>
                <div style={{ display: "flex", gap: 10 }}>
                  <span style={{ color: "#94a3b8", fontSize: 11 }}>📏 {d.distance}</span>
                  <span style={{ color: "#94a3b8", fontSize: 11 }}>🕐 {d.deliveredAt}</span>
                </div>
              </div>
              <span style={{ color: "#16a34a", fontWeight: 700, fontSize: 16 }}>+Ksh {d.deliveryFee}</span>
            </div>
          ))}
      </div>
    </div>
  );
}

function ProfileTab({ rider, completed }) {
  const todayEarnings = completed.reduce((s, d) => s + d.deliveryFee, 0);
  return (
    <div style={{ padding: 16 }}>
      <div style={{ background: "white", border: "1px solid #e2e8f0", borderRadius: 16, padding: "24px 20px", textAlign: "center", marginBottom: 14 }}>
        <div style={{ width: 72, height: 72, borderRadius: "50%", background: "#eff6ff", border: "2px solid #bfdbfe", margin: "0 auto 14px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, fontWeight: 800, color: "#2563eb" }}>
          {rider.name.split(" ").map(n => n[0]).join("").substring(0,2)}
        </div>
        <h2 style={{ fontSize: 20, fontWeight: 800, color: "#0f172a", margin: "0 0 4px" }}>{rider.name}</h2>
        <p style={{ color: "#64748b", fontSize: 14, margin: "0 0 16px" }}>{rider.vehicle} · {rider.city}</p>
        <div style={{ display: "flex", justifyContent: "center", gap: 28 }}>
          {[["⭐ " + rider.rating, "Rating"], [rider.totalDeliveries, "All time"], [completed.length, "Today"]].map(([val, label]) => (
            <div key={label}>
              <p style={{ fontWeight: 700, fontSize: 18, color: "#0f172a", margin: "0 0 2px" }}>{val}</p>
              <p style={{ color: "#64748b", fontSize: 12, margin: 0 }}>{label}</p>
            </div>
          ))}
        </div>
      </div>
      <div style={{ background: "white", border: "1px solid #e2e8f0", borderRadius: 14, overflow: "hidden", marginBottom: 14 }}>
        {[["Phone", rider.phone], ["Vehicle", rider.vehicle], ["Plate", rider.plate], ["City", rider.city], ["Today's earnings", `Ksh ${todayEarnings.toLocaleString()}`]].map(([k, v], i, arr) => (
          <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "13px 18px", borderBottom: i < arr.length - 1 ? "1px solid #f1f5f9" : "none" }}>
            <span style={{ color: "#64748b", fontSize: 14 }}>{k}</span>
            <span style={{ fontWeight: 500, fontSize: 14, color: "#0f172a" }}>{v}</span>
          </div>
        ))}
      </div>
      <div style={{ background: "white", border: "1px solid #e2e8f0", borderRadius: 14, overflow: "hidden" }}>
        <a href="tel:+254700000000" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "13px 18px", borderBottom: "1px solid #f1f5f9", textDecoration: "none" }}>
          <span style={{ color: "#374151", fontSize: 14 }}>📞 Call Trampet support</span>
          <span style={{ color: "#94a3b8" }}>→</span>
        </a>
        <div style={{ padding: "13px 18px" }}>
          <span style={{ color: "#dc2626", fontSize: 14, cursor: "pointer" }}>🚪 Sign out</span>
        </div>
      </div>
    </div>
  );
}

function Login({ onLogin }) {
  const [loading, setLoading] = useState(false);
  const [phone, setPhone] = useState("");
  const [pin, setPin] = useState("");
  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ width: "100%", maxWidth: 360 }}>
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{ width: 64, height: 64, borderRadius: 18, background: "#2563eb", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px", fontSize: 28 }}>🛵</div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: "#0f172a", margin: "0 0 4px" }}>Trampet Rider</h1>
          <p style={{ color: "#64748b", fontSize: 14 }}>Sign in to start delivering</p>
        </div>
        <div style={{ background: "white", border: "1px solid #e2e8f0", borderRadius: 18, padding: "26px 22px", boxShadow: "0 4px 16px rgba(0,0,0,0.06)" }}>
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "#374151", marginBottom: 6 }}>Phone number</label>
            <input value={phone} onChange={e => setPhone(e.target.value)} type="tel" placeholder="0712 345 678" style={{ width: "100%", padding: "12px 14px", border: "1px solid #e2e8f0", borderRadius: 10, fontSize: 15, outline: "none" }} />
          </div>
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "#374151", marginBottom: 6 }}>PIN</label>
            <input value={pin} onChange={e => setPin(e.target.value)} type="password" placeholder="••••" maxLength={6} style={{ width: "100%", padding: "12px 14px", border: "1px solid #e2e8f0", borderRadius: 10, fontSize: 22, letterSpacing: 8, textAlign: "center", outline: "none" }} />
          </div>
          <button onClick={() => { setLoading(true); setTimeout(onLogin, 1000); }} style={{ width: "100%", background: "#2563eb", border: "none", borderRadius: 12, padding: "14px", color: "white", fontSize: 16, fontWeight: 700, cursor: "pointer" }}>
            {loading ? "Signing in..." : "Sign in"}
          </button>
          <p style={{ color: "#94a3b8", fontSize: 12, textAlign: "center", marginTop: 14 }}>Demo: any phone + 4-digit PIN</p>
        </div>
      </div>
    </div>
  );
}
