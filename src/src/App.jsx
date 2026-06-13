import { useState, useEffect, useCallback } from "react";
import * as api from "./api.js";

export default function App() {
  const [loggedIn, setLoggedIn] = useState(!!api.getToken());
  const [tab, setTab] = useState("jobs");
  const [jobs, setJobs] = useState([]);
  const [earnings, setEarnings] = useState(null);
  const [online, setOnline] = useState(true);
  const [activeJob, setActiveJob] = useState(null);
  const [loading, setLoading] = useState(false);
  const user = api.getUser();

  const loadJobs = useCallback(async () => {
    if (!loggedIn) return;
    try {
      setLoading(true);
      const data = await api.fetchMyJobs();
      setJobs(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [loggedIn]);

  const loadEarnings = useCallback(async () => {
    if (!loggedIn) return;
    try {
      const data = await api.fetchMyEarnings();
      setEarnings(data);
    } catch (e) {
      console.error(e);
    }
  }, [loggedIn]);

  useEffect(() => {
    loadJobs();
    const interval = setInterval(loadJobs, 20000);
    return () => clearInterval(interval);
  }, [loadJobs]);

  useEffect(() => {
    if (tab === "earnings") loadEarnings();
  }, [tab, loadEarnings]);

  async function toggleOnline() {
    const newStatus = online ? "offline" : "available";
    try {
      await api.setRiderStatus(newStatus);
      setOnline(!online);
    } catch (e) {
      console.error(e);
    }
  }

  async function updateJobStatus(jobId, status) {
    try {
      await api.updateOrderStatus(jobId, status);
      if (status === "delivered") {
        setJobs(prev => prev.filter(j => j.id !== jobId));
        setActiveJob(null);
        setTab("jobs");
        loadEarnings();
      } else {
        setJobs(prev => prev.map(j => j.id === jobId ? { ...j, status } : j));
        if (activeJob?.id === jobId) setActiveJob(prev => ({ ...prev, status }));
      }
    } catch (e) {
      alert("Failed to update: " + e.message);
    }
  }

  if (!loggedIn) return <Login onLogin={() => setLoggedIn(true)} />;

  const pendingJobs = jobs.filter(j => ["assigned", "picked_up"].includes(j.status));

  return (
    <div style={{ maxWidth: 430, margin: "0 auto", minHeight: "100vh", background: "#f8fafc", display: "flex", flexDirection: "column", fontFamily: "-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif" }}>
      {/* Top bar */}
      <div style={{ background: "white", borderBottom: "1px solid #e2e8f0", padding: "14px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: "linear-gradient(135deg,#2563eb,#1d4ed8)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 800, fontSize: 14 }}>T</div>
            <div>
              <p style={{ fontWeight: 700, fontSize: 15, color: "#0f172a", margin: 0 }}>
                {tab === "jobs" && "My Jobs"}
                {tab === "active" && "Active Delivery"}
                {tab === "earnings" && "Earnings"}
                {tab === "profile" && "Profile"}
              </p>
              <p style={{ color: "#94a3b8", fontSize: 11, margin: 0 }}>{user?.name || "Rider"}</p>
            </div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, background: online ? "#f0fdf4" : "#f8fafc", border: `1px solid ${online ? "#bbf7d0" : "#e2e8f0"}`, borderRadius: 100, padding: "6px 14px" }}>
            <div style={{ width: 7, height: 7, borderRadius: "50%", background: online ? "#16a34a" : "#94a3b8" }} />
            <span style={{ fontSize: 12, fontWeight: 600, color: online ? "#15803d" : "#94a3b8" }}>{online ? "Online" : "Offline"}</span>
          </div>
          <button onClick={toggleOnline} style={{ width: 44, height: 24, borderRadius: 12, background: online ? "#16a34a" : "#e2e8f0", border: "none", cursor: "pointer", position: "relative", transition: "background 0.2s", flexShrink: 0 }}>
            <div style={{ width: 18, height: 18, borderRadius: "50%", background: "white", position: "absolute", top: 3, left: online ? 23 : 3, transition: "left 0.2s", boxShadow: "0 1px 4px rgba(0,0,0,0.2)" }} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflow: "auto", paddingBottom: 88 }}>
        {tab === "jobs" && <JobsTab jobs={pendingJobs} online={online} loading={loading} onOpen={job => { setActiveJob(job); setTab("active"); }} onRefresh={loadJobs} />}
        {tab === "active" && (activeJob ? <ActiveTab job={activeJob} onUpdate={updateJobStatus} onBack={() => setTab("jobs")} /> : <NoActive onJobs={() => setTab("jobs")} />)}
        {tab === "earnings" && <EarningsTab earnings={earnings} />}
        {tab === "profile" && <ProfileTab user={user} earnings={earnings} onLogout={() => { api.logout(); setLoggedIn(false); }} />}
      </div>

      {/* Bottom nav */}
      <div style={{ position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 430, background: "white", borderTop: "1px solid #e2e8f0", display: "flex", boxShadow: "0 -4px 16px rgba(0,0,0,0.08)", zIndex: 100 }}>
        {[["jobs", "📋", "Jobs", pendingJobs.length], ["active", "🛵", "Active", activeJob ? 1 : 0], ["earnings", "💰", "Earnings", 0], ["profile", "👤", "Profile", 0]].map(([id, icon, label, badge]) => (
          <button key={id} onClick={() => setTab(id)} style={{ flex: 1, background: "none", border: "none", padding: "12px 0 10px", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 4, position: "relative" }}>
            {tab === id && <div style={{ position: "absolute", top: 0, width: 32, height: 3, background: "#2563eb", borderRadius: "0 0 4px 4px" }} />}
            {badge > 0 && <div style={{ position: "absolute", top: 8, right: "calc(50% - 20px)", background: "#ef4444", color: "white", borderRadius: "50%", width: 16, height: 16, fontSize: 10, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>{badge}</div>}
            <span style={{ fontSize: 22 }}>{icon}</span>
            <span style={{ fontSize: 10, fontWeight: tab === id ? 700 : 400, color: tab === id ? "#2563eb" : "#94a3b8" }}>{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function JobsTab({ jobs, online, loading, onOpen, onRefresh }) {
  if (!online) return (
    <div style={{ padding: 24, textAlign: "center", paddingTop: 80 }}>
      <div style={{ width: 80, height: 80, borderRadius: "50%", background: "#f1f5f9", margin: "0 auto 20px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36 }}>💤</div>
      <h2 style={{ fontSize: 20, fontWeight: 700, color: "#0f172a", margin: "0 0 8px" }}>You're offline</h2>
      <p style={{ color: "#64748b", fontSize: 14, lineHeight: 1.6 }}>Toggle online above to start receiving delivery jobs</p>
    </div>
  );

  return (
    <div style={{ padding: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <p style={{ color: "#64748b", fontSize: 13 }}>{jobs.length} job{jobs.length !== 1 ? "s" : ""} assigned</p>
        <button onClick={onRefresh} style={{ background: "#f1f5f9", border: "none", borderRadius: 8, color: "#64748b", padding: "6px 12px", fontSize: 12, cursor: "pointer" }}>🔄 Refresh</button>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "60px 0" }}>
          <div style={{ width: 36, height: 36, border: "3px solid #e2e8f0", borderTopColor: "#2563eb", borderRadius: "50%", margin: "0 auto 16px", animation: "spin 0.8s linear infinite" }} />
          <p style={{ color: "#64748b", fontSize: 14 }}>Loading jobs...</p>
          <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        </div>
      ) : jobs.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 0" }}>
          <div style={{ width: 80, height: 80, borderRadius: "50%", background: "#eff6ff", margin: "0 auto 20px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36 }}>🕐</div>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: "#0f172a", margin: "0 0 8px" }}>No jobs yet</h2>
          <p style={{ color: "#64748b", fontSize: 14, lineHeight: 1.6 }}>Stay online — jobs appear here when the admin assigns them to you</p>
        </div>
      ) : jobs.map(job => (
        <JobCard key={job.id} job={job} onOpen={() => onOpen(job)} />
      ))}
    </div>
  );
}

function JobCard({ job, onOpen }) {
  const isPicked = job.status === "picked_up";
  return (
    <div style={{ background: "white", border: `1px solid ${isPicked ? "#bfdbfe" : "#e2e8f0"}`, borderRadius: 18, overflow: "hidden", marginBottom: 14, boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
      <div style={{ background: isPicked ? "linear-gradient(135deg,#eff6ff,#dbeafe)" : "linear-gradient(135deg,#f0fdf4,#dcfce7)", borderBottom: `1px solid ${isPicked ? "#bfdbfe" : "#bbf7d0"}`, padding: "10px 18px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: isPicked ? "#2563eb" : "#16a34a" }} />
          <span style={{ color: isPicked ? "#1d4ed8" : "#15803d", fontSize: 12, fontWeight: 700 }}>{isPicked ? "🛵 Deliver to customer" : "🍽️ Pick up from restaurant"}</span>
        </div>
        <span style={{ color: "#94a3b8", fontSize: 12 }}>{job.id}</span>
      </div>

      <div style={{ padding: "16px 18px" }}>
        {/* Route */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ display: "flex", gap: 12, alignItems: "flex-start", marginBottom: 10 }}>
            <div style={{ width: 34, height: 34, borderRadius: 9, background: "#fef3c7", border: "1px solid #fde68a", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>🍽️</div>
            <div style={{ flex: 1 }}>
              <p style={{ color: "#94a3b8", fontSize: 10, textTransform: "uppercase", letterSpacing: 0.5, margin: "0 0 2px" }}>Pick up from</p>
              <p style={{ fontWeight: 700, fontSize: 14, color: "#0f172a", margin: "0 0 2px" }}>{job.restaurant_name || "Restaurant"}</p>
              <p style={{ color: "#64748b", fontSize: 12, margin: 0 }}>{job.restaurant_address || job.delivery_address || "—"}</p>
            </div>
          </div>
          <div style={{ width: 2, height: 18, background: "#e2e8f0", margin: "0 0 10px 16px" }} />
          <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
            <div style={{ width: 34, height: 34, borderRadius: 9, background: "#eff6ff", border: "1px solid #bfdbfe", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>📍</div>
            <div style={{ flex: 1 }}>
              <p style={{ color: "#94a3b8", fontSize: 10, textTransform: "uppercase", letterSpacing: 0.5, margin: "0 0 2px" }}>Deliver to</p>
              <p style={{ fontWeight: 700, fontSize: 14, color: "#0f172a", margin: "0 0 2px" }}>{job.customer_name || "Customer"}</p>
              <p style={{ color: "#64748b", fontSize: 12, margin: 0 }}>{job.delivery_address || "—"}</p>
            </div>
          </div>
        </div>

        {/* Meta */}
        <div style={{ display: "flex", gap: 12, padding: "12px 0", borderTop: "1px solid #f1f5f9", borderBottom: "1px solid #f1f5f9", marginBottom: 14, flexWrap: "wrap" }}>
          <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 8, padding: "6px 12px", display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: 13 }}>{job.payment_method === "mpesa" ? "📱" : "💵"}</span>
            <span style={{ fontSize: 12, fontWeight: 600, color: "#374151" }}>{job.payment_method === "mpesa" ? "M-Pesa" : "Cash"}</span>
          </div>
          <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 8, padding: "6px 12px" }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: "#374151" }}>Ksh {(job.total || job.subtotal || 0).toLocaleString()}</span>
          </div>
          {job.delivery_fee && (
            <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 8, padding: "6px 12px" }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: "#15803d" }}>+Ksh {job.delivery_fee} fee</span>
            </div>
          )}
          {job.payment_method === "cash" && job.payment_status !== "paid" && (
            <div style={{ background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 8, padding: "6px 12px" }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: "#d97706" }}>⚠️ Collect cash</span>
            </div>
          )}
        </div>

        <button onClick={onOpen} style={{ width: "100%", background: "linear-gradient(135deg,#2563eb,#1d4ed8)", border: "none", borderRadius: 14, padding: "15px", color: "white", fontSize: 15, fontWeight: 700, cursor: "pointer", boxShadow: "0 4px 16px rgba(37,99,235,0.3)", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
          {isPicked ? <>📍 Continue delivery</> : <>🛵 Start delivery</>}
        </button>
      </div>
    </div>
  );
}

function ActiveTab({ job, onUpdate, onBack }) {
  const [showConfirm, setShowConfirm] = useState(false);
  const steps = [
    { status: "assigned", icon: "🏍️", label: "Head to restaurant", sub: "Pick up the order", action: "Confirm pickup ✓", next: "picked_up" },
    { status: "picked_up", icon: "📦", label: "Head to customer", sub: "Deliver the order", action: "Confirm delivery ✓", next: "delivered" },
  ];
  const stepIdx = steps.findIndex(s => s.status === job.status);
  const step = steps[stepIdx] || steps[0];
  const currentStop = job.status === "assigned"
    ? { icon: "🍽️", title: "Pick up from", name: job.restaurant_name || "Restaurant", addr: job.restaurant_address, phone: job.restaurant_phone }
    : { icon: "📍", title: "Deliver to", name: job.customer_name || "Customer", addr: job.delivery_address, phone: job.customer_phone };

  return (
    <div style={{ padding: 16 }}>
      <button onClick={onBack} style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "none", color: "#64748b", fontSize: 14, cursor: "pointer", marginBottom: 16, padding: 0 }}>← Back</button>

      {/* Order header */}
      <div style={{ background: "linear-gradient(135deg,#2563eb,#1d4ed8)", borderRadius: 16, padding: "18px 20px", marginBottom: 14, color: "white", display: "flex", justifyContent: "space-between", alignItems: "center", boxShadow: "0 4px 16px rgba(37,99,235,0.3)" }}>
        <div>
          <p style={{ fontSize: 11, opacity: 0.8, margin: "0 0 4px", textTransform: "uppercase", letterSpacing: 0.5 }}>Active order</p>
          <p style={{ fontSize: 20, fontWeight: 800, margin: 0 }}>{job.id}</p>
        </div>
        <div style={{ textAlign: "right" }}>
          <p style={{ fontSize: 11, opacity: 0.8, margin: "0 0 4px" }}>Your earnings</p>
          <p style={{ fontSize: 22, fontWeight: 800, margin: 0 }}>+Ksh {job.delivery_fee || 80}</p>
        </div>
      </div>

      {/* Progress steps */}
      <div style={{ background: "white", border: "1px solid #e2e8f0", borderRadius: 16, padding: "18px 20px", marginBottom: 14, boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
        <div style={{ display: "flex", alignItems: "center", marginBottom: 14 }}>
          {steps.map((s, i) => (
            <div key={s.status} style={{ display: "flex", alignItems: "center", flex: i < steps.length - 1 ? 1 : 0 }}>
              <div style={{ width: 40, height: 40, borderRadius: "50%", background: i < stepIdx ? "#f0fdf4" : i === stepIdx ? "#eff6ff" : "#f8fafc", border: `2px solid ${i < stepIdx ? "#16a34a" : i === stepIdx ? "#2563eb" : "#e2e8f0"}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: i < stepIdx ? 16 : 20, flexShrink: 0, transition: "all 0.3s" }}>
                {i < stepIdx ? "✓" : s.icon}
              </div>
              {i < steps.length - 1 && <div style={{ flex: 1, height: 2, background: i < stepIdx ? "#16a34a" : "#e2e8f0", margin: "0 8px", transition: "background 0.3s" }} />}
            </div>
          ))}
        </div>
        <p style={{ fontWeight: 700, fontSize: 16, color: "#0f172a", margin: "0 0 3px" }}>{step.label}</p>
        <p style={{ color: "#64748b", fontSize: 13, margin: 0 }}>{step.sub} · Step {stepIdx + 1} of {steps.length}</p>
      </div>

      {/* Current stop */}
      <div style={{ background: "white", border: "1px solid #e2e8f0", borderRadius: 16, padding: "18px 20px", marginBottom: 12, boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
        <p style={{ color: "#94a3b8", fontSize: 11, textTransform: "uppercase", letterSpacing: 0.5, margin: "0 0 12px" }}>{currentStop.title}</p>
        <div style={{ display: "flex", gap: 12, alignItems: "flex-start", marginBottom: 14 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>{currentStop.icon}</div>
          <div style={{ flex: 1 }}>
            <p style={{ fontWeight: 700, fontSize: 16, color: "#0f172a", margin: "0 0 4px" }}>{currentStop.name}</p>
            <p style={{ color: "#64748b", fontSize: 13, margin: 0, lineHeight: 1.5 }}>{currentStop.addr || "—"}</p>
          </div>
        </div>
        {currentStop.phone && (
          <a href={`tel:${currentStop.phone}`} style={{ display: "flex", alignItems: "center", gap: 10, background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 10, padding: "10px 14px", color: "#374151", textDecoration: "none", fontSize: 14, fontWeight: 500 }}>
            <span style={{ fontSize: 18 }}>📞</span> Call {currentStop.phone}
          </a>
        )}
        {job.status === "picked_up" && job.payment_method === "cash" && job.payment_status !== "paid" && (
          <div style={{ marginTop: 10, background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 10, padding: "12px 14px", display: "flex", gap: 10, alignItems: "center" }}>
            <span style={{ fontSize: 20 }}>💵</span>
            <div>
              <p style={{ fontWeight: 700, fontSize: 13, color: "#92400e", margin: "0 0 2px" }}>Collect cash payment</p>
              <p style={{ fontSize: 13, color: "#b45309", margin: 0 }}>Ksh {(job.total || job.subtotal || 0).toLocaleString()} from customer</p>
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <a href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(currentStop.addr || "Nairobi Kenya")}`} target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 14, padding: "13px", color: "#2563eb", fontSize: 14, fontWeight: 600, textDecoration: "none", marginBottom: 10 }}>
        🗺️ Open in Google Maps
      </a>

      <button onClick={() => step.next === "delivered" ? setShowConfirm(true) : onUpdate(job.id, step.next)} style={{ width: "100%", background: "linear-gradient(135deg,#2563eb,#1d4ed8)", border: "none", borderRadius: 14, padding: "16px", color: "white", fontSize: 16, fontWeight: 700, cursor: "pointer", boxShadow: "0 4px 16px rgba(37,99,235,0.3)" }}>
        {step.action}
      </button>

      {/* Confirm modal */}
      {showConfirm && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 200, display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
          <div style={{ background: "white", borderRadius: "24px 24px 0 0", padding: "28px 24px", width: "100%", maxWidth: 430, boxShadow: "0 -8px 32px rgba(0,0,0,0.15)" }}>
            <div style={{ textAlign: "center", marginBottom: 24 }}>
              <div style={{ width: 64, height: 64, borderRadius: "50%", background: "#f0fdf4", border: "2px solid #16a34a", margin: "0 auto 16px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28 }}>✅</div>
              <h2 style={{ fontSize: 22, fontWeight: 800, color: "#0f172a", margin: "0 0 6px" }}>Confirm delivery?</h2>
              <p style={{ color: "#64748b", fontSize: 14 }}>{job.customer_name || "Customer"} · {job.id}</p>
              {job.payment_method === "cash" && job.payment_status !== "paid" && (
                <div style={{ marginTop: 14, background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 12, padding: "12px 16px" }}>
                  <p style={{ fontWeight: 700, color: "#92400e", fontSize: 14, margin: 0 }}>⚠️ Have you collected Ksh {(job.total || 0).toLocaleString()} cash?</p>
                </div>
              )}
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setShowConfirm(false)} style={{ flex: 1, background: "#f1f5f9", border: "none", borderRadius: 12, color: "#64748b", padding: "14px", fontSize: 14, fontWeight: 500, cursor: "pointer" }}>Cancel</button>
              <button onClick={() => { setShowConfirm(false); onUpdate(job.id, "delivered"); }} style={{ flex: 2, background: "linear-gradient(135deg,#16a34a,#15803d)", border: "none", borderRadius: 12, color: "white", padding: "14px", fontSize: 15, fontWeight: 700, cursor: "pointer", boxShadow: "0 4px 14px rgba(22,163,74,0.3)" }}>Yes, delivered!</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function NoActive({ onJobs }) {
  return (
    <div style={{ padding: 24, textAlign: "center", paddingTop: 80 }}>
      <div style={{ width: 80, height: 80, borderRadius: "50%", background: "#f1f5f9", margin: "0 auto 20px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36 }}>🛵</div>
      <h2 style={{ fontSize: 20, fontWeight: 700, color: "#0f172a", margin: "0 0 8px" }}>No active delivery</h2>
      <p style={{ color: "#64748b", fontSize: 14, marginBottom: 24 }}>Accept a job to start delivering</p>
      <button onClick={onJobs} style={{ background: "linear-gradient(135deg,#2563eb,#1d4ed8)", border: "none", borderRadius: 12, color: "white", padding: "12px 28px", fontSize: 14, fontWeight: 600, cursor: "pointer", boxShadow: "0 4px 14px rgba(37,99,235,0.3)" }}>View jobs</button>
    </div>
  );
}

function EarningsTab({ earnings }) {
  if (!earnings) return <div style={{ padding: 24, textAlign: "center", color: "#64748b" }}>Loading earnings...</div>;

  const todayEarnings = Number(earnings.today?.earned || 0);
  const todayDeliveries = Number(earnings.today?.deliveries || 0);
  const weekEarnings = Number(earnings.week?.earned || 0);
  const history = Array.isArray(earnings.history) ? earnings.history : [];

  return (
    <div style={{ padding: 16 }}>
      {/* Hero card */}
      <div style={{ background: "linear-gradient(135deg,#1e3a8a,#2563eb)", borderRadius: 20, padding: "24px 22px", marginBottom: 16, color: "white", boxShadow: "0 8px 32px rgba(37,99,235,0.3)", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -30, right: -30, width: 120, height: 120, borderRadius: "50%", background: "rgba(255,255,255,0.06)" }} />
        <div style={{ position: "absolute", bottom: -40, left: -20, width: 150, height: 150, borderRadius: "50%", background: "rgba(255,255,255,0.04)" }} />
        <p style={{ color: "rgba(255,255,255,0.75)", fontSize: 13, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.8, margin: "0 0 8px" }}>Today's earnings</p>
        <p style={{ color: "white", fontSize: 44, fontWeight: 900, margin: "0 0 6px", letterSpacing: -1 }}>Ksh {todayEarnings.toLocaleString()}</p>
        <p style={{ color: "rgba(255,255,255,0.7)", fontSize: 13, margin: 0 }}>{todayDeliveries} deliveries completed today</p>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
        {[["📅", "This week", `Ksh ${weekEarnings.toLocaleString()}`, "#2563eb"], ["📊", "Avg per delivery", `Ksh ${todayDeliveries > 0 ? Math.round(todayEarnings / todayDeliveries).toLocaleString() : 0}`, "#7c3aed"]].map(([icon, label, val, color]) => (
          <div key={label} style={{ background: "white", border: "1px solid #e2e8f0", borderRadius: 14, padding: "16px 14px", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
            <span style={{ fontSize: 22 }}>{icon}</span>
            <p style={{ fontWeight: 800, fontSize: 18, color, margin: "8px 0 4px" }}>{val}</p>
            <p style={{ color: "#94a3b8", fontSize: 12, margin: 0 }}>{label}</p>
          </div>
        ))}
      </div>

      {/* History */}
      <div style={{ background: "white", border: "1px solid #e2e8f0", borderRadius: 16, overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
        <div style={{ padding: "14px 18px", borderBottom: "1px solid #f1f5f9" }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: "#0f172a", margin: 0 }}>Recent deliveries</h3>
        </div>
        {history.length === 0 ? (
          <p style={{ padding: "32px", textAlign: "center", color: "#94a3b8", fontSize: 14 }}>No deliveries yet</p>
        ) : history.slice(0, 20).map((d, i, arr) => (
          <div key={d.id || i} style={{ padding: "13px 18px", borderBottom: i < arr.length - 1 ? "1px solid #f8fafc" : "none", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <p style={{ fontWeight: 600, fontSize: 14, color: "#0f172a", margin: "0 0 2px" }}>{d.customer_name || "Customer"}</p>
              <p style={{ color: "#94a3b8", fontSize: 12, margin: "0 0 2px" }}>{d.restaurant_name || "—"}</p>
              <p style={{ color: "#94a3b8", fontSize: 11, margin: 0 }}>{d.delivery_address || "—"}</p>
            </div>
            <span style={{ color: "#16a34a", fontWeight: 800, fontSize: 16 }}>+Ksh {(d.delivery_fee || 0).toLocaleString()}</span>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 14, background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 12, padding: "12px 16px", display: "flex", gap: 10 }}>
        <span>ℹ️</span>
        <p style={{ color: "#1e40af", fontSize: 12, margin: 0, lineHeight: 1.5 }}>Earnings are paid <strong>daily via M-Pesa</strong> at the end of your shift by the Trampet admin.</p>
      </div>
    </div>
  );
}

function ProfileTab({ user, earnings, onLogout }) {
  const todayEarnings = Number(earnings?.today?.earned || 0);
  const todayDeliveries = Number(earnings?.today?.deliveries || 0);

  return (
    <div style={{ padding: 16 }}>
      {/* Profile card */}
      <div style={{ background: "white", border: "1px solid #e2e8f0", borderRadius: 20, padding: "28px 22px", textAlign: "center", marginBottom: 14, boxShadow: "0 4px 16px rgba(0,0,0,0.06)" }}>
        <div style={{ width: 80, height: 80, borderRadius: "50%", background: "linear-gradient(135deg,#2563eb,#1d4ed8)", margin: "0 auto 16px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, fontWeight: 800, color: "white", boxShadow: "0 4px 20px rgba(37,99,235,0.3)" }}>
          {(user?.name || "R").split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase()}
        </div>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: "#0f172a", margin: "0 0 4px" }}>{user?.name || "Rider"}</h2>
        <p style={{ color: "#64748b", fontSize: 14, margin: "0 0 18px" }}>{user?.phone || "—"} · {user?.city || "Nairobi"}</p>
        <div style={{ display: "flex", justifyContent: "center", gap: 32 }}>
          {[["Today", `${todayDeliveries}`], ["Earned", `Ksh ${todayEarnings.toLocaleString()}`], ["Rating", "⭐ 4.9"]].map(([label, val]) => (
            <div key={label}>
              <p style={{ fontWeight: 800, fontSize: 18, color: "#0f172a", margin: "0 0 3px" }}>{val}</p>
              <p style={{ color: "#94a3b8", fontSize: 12, margin: 0 }}>{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Details */}
      <div style={{ background: "white", border: "1px solid #e2e8f0", borderRadius: 16, overflow: "hidden", marginBottom: 14, boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
        {[["📱", "Phone", user?.phone || "—"], ["🏙️", "City", user?.city || "Nairobi"], ["🛵", "Role", "Delivery Rider"]].map(([icon, label, val], i, arr) => (
          <div key={label} style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 18px", borderBottom: i < arr.length - 1 ? "1px solid #f8fafc" : "none" }}>
            <span style={{ fontSize: 20 }}>{icon}</span>
            <span style={{ color: "#64748b", fontSize: 14, flex: 1 }}>{label}</span>
            <span style={{ fontWeight: 500, fontSize: 14, color: "#374151" }}>{val}</span>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div style={{ background: "white", border: "1px solid #e2e8f0", borderRadius: 16, overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
        <a href="tel:+254700000000" style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 18px", borderBottom: "1px solid #f8fafc", textDecoration: "none" }}>
          <span style={{ fontSize: 20 }}>📞</span>
          <span style={{ color: "#374151", fontSize: 14, flex: 1 }}>Call Trampet support</span>
          <span style={{ color: "#94a3b8" }}>→</span>
        </a>
        <button onClick={onLogout} style={{ width: "100%", display: "flex", alignItems: "center", gap: 14, padding: "14px 18px", background: "none", border: "none", cursor: "pointer" }}>
          <span style={{ fontSize: 20 }}>🚪</span>
          <span style={{ color: "#dc2626", fontSize: 14, fontWeight: 500 }}>Sign out</span>
        </button>
      </div>
    </div>
  );
}

function Login({ onLogin }) {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handle() {
    if (!phone || !password) return;
    setLoading(true); setError("");
    try { await api.login(phone, password); onLogin(); }
    catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg,#f8fafc,#eff6ff)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ width: "100%", maxWidth: 380 }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ width: 72, height: 72, borderRadius: 20, background: "linear-gradient(135deg,#2563eb,#1d4ed8)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", fontSize: 32, boxShadow: "0 6px 24px rgba(37,99,235,0.35)" }}>🛵</div>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: "#0f172a", margin: "0 0 4px" }}>Trampet Rider</h1>
          <p style={{ color: "#64748b", fontSize: 14 }}>Sign in to start delivering</p>
        </div>
        <div style={{ background: "white", border: "1px solid #e2e8f0", borderRadius: 22, padding: "32px 28px", boxShadow: "0 8px 32px rgba(0,0,0,0.08)" }}>
          {error && <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 10, padding: "10px 14px", color: "#dc2626", fontSize: 13, marginBottom: 18 }}>{error}</div>}
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "#374151", marginBottom: 6 }}>Phone number</label>
            <input value={phone} onChange={e => setPhone(e.target.value)} type="tel" placeholder="0712 345 678" style={{ width: "100%", padding: "13px 16px", border: "1px solid #e2e8f0", borderRadius: 12, fontSize: 15, outline: "none" }} onFocus={e => e.target.style.borderColor = "#2563eb"} onBlur={e => e.target.style.borderColor = "#e2e8f0"} />
          </div>
          <div style={{ marginBottom: 24 }}>
            <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "#374151", marginBottom: 6 }}>Password</label>
            <input value={password} onChange={e => setPassword(e.target.value)} type="password" placeholder="••••••••" onKeyDown={e => e.key === "Enter" && handle()} style={{ width: "100%", padding: "13px 16px", border: "1px solid #e2e8f0", borderRadius: 12, fontSize: 15, outline: "none" }} onFocus={e => e.target.style.borderColor = "#2563eb"} onBlur={e => e.target.style.borderColor = "#e2e8f0"} />
          </div>
          <button onClick={handle} disabled={loading} style={{ width: "100%", background: loading ? "#93c5fd" : "linear-gradient(135deg,#2563eb,#1d4ed8)", border: "none", borderRadius: 14, padding: "16px", color: "white", fontSize: 16, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer", boxShadow: "0 4px 16px rgba(37,99,235,0.35)" }}>
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </div>
      </div>
    </div>
  );
}
