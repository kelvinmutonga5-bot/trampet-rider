import { useState } from "react";
import LoginPage from "./pages/LoginPage";
import JobsPage from "./pages/JobsPage";
import ActiveJobPage from "./pages/ActiveJobPage";
import EarningsPage from "./pages/EarningsPage";
import ProfilePage from "./pages/ProfilePage";
import BottomNav from "./components/BottomNav";
import { mockJobs, completedToday, riderProfile } from "./data/mockData";

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
      setCompleted(prev => [{
        id: job.id,
        customer: job.customer.name,
        restaurant: job.restaurant.name,
        deliveredAt: new Date().toLocaleTimeString("en-KE", { hour: "2-digit", minute: "2-digit" }),
        deliveryFee: job.deliveryFee,
        distance: job.distance,
        payment: job.payment,
      }, ...prev]);
      setJobs(prev => prev.filter(j => j.id !== jobId));
      setActiveJob(null);
      setTab("jobs");
    } else {
      setJobs(prev => prev.map(j => j.id === jobId ? { ...j, status: newStatus } : j));
      if (activeJob?.id === jobId) setActiveJob(prev => ({ ...prev, status: newStatus }));
    }
  }

  function openJob(job) {
    setActiveJob(job);
    setTab("active");
  }

  if (!loggedIn) return <LoginPage onLogin={() => setLoggedIn(true)} />;

  return (
    <div style={{
      maxWidth: 420, margin: "0 auto",
      minHeight: "100vh", background: "#080808",
      display: "flex", flexDirection: "column",
      position: "relative"
    }}>
      {/* Top status bar */}
      <div style={{
        background: "#0d0d0d", borderBottom: "1px solid #1a1a1a",
        padding: "14px 20px",
        display: "flex", alignItems: "center", justifyContent: "space-between"
      }}>
        <div>
          <p style={{ color: "#fff", fontWeight: 800, fontSize: 18, fontFamily: "'Syne',sans-serif", margin: 0 }}>
            {tab === "jobs" && "My Jobs"}
            {tab === "active" && "Active Delivery"}
            {tab === "earnings" && "Earnings"}
            {tab === "profile" && "Profile"}
          </p>
          <p style={{ color: "#555", fontSize: 12, margin: 0 }}>
            {riderProfile.name} · {riderProfile.vehicle}
          </p>
        </div>
        {/* Online toggle */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ color: online ? "#16a34a" : "#555", fontSize: 13, fontWeight: 600 }}>
            {online ? "Online" : "Offline"}
          </span>
          <button onClick={() => setOnline(p => !p)} style={{
            width: 48, height: 26, borderRadius: 13,
            background: online ? "#16a34a" : "#2a2a2a",
            border: "none", cursor: "pointer", position: "relative",
            transition: "background 0.2s"
          }}>
            <div style={{
              width: 20, height: 20, borderRadius: "50%", background: "#fff",
              position: "absolute", top: 3,
              left: online ? 25 : 3, transition: "left 0.2s"
            }} />
          </button>
        </div>
      </div>

      {/* Page content */}
      <div style={{ flex: 1, overflow: "auto", paddingBottom: 80 }}>
        {tab === "jobs" && (
          <JobsPage
            jobs={jobs}
            online={online}
            onOpenJob={openJob}
          />
        )}
        {tab === "active" && activeJob && (
          <ActiveJobPage
            job={activeJob}
            onUpdateStatus={updateJobStatus}
            onBack={() => setTab("jobs")}
          />
        )}
        {tab === "active" && !activeJob && (
          <div style={{ padding: 24, textAlign: "center", color: "#444", paddingTop: 80 }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🛵</div>
            <p style={{ color: "#555" }}>No active delivery</p>
            <button onClick={() => setTab("jobs")} style={{
              marginTop: 16, background: "#ff6b2b", border: "none",
              borderRadius: 10, color: "#fff", padding: "12px 24px",
              fontSize: 14, fontWeight: 600, cursor: "pointer"
            }}>View jobs</button>
          </div>
        )}
        {tab === "earnings" && (
          <EarningsPage completed={completed} />
        )}
        {tab === "profile" && (
          <ProfilePage rider={riderProfile} completed={completed} />
        )}
      </div>

      <BottomNav
        tab={tab}
        onTab={setTab}
        jobCount={jobs.length}
        hasActive={!!activeJob}
      />
    </div>
  );
}
