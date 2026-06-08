export default function JobsPage({ jobs, online, onOpenJob }) {
  if (!online) {
    return (
      <div style={{ padding: 24, textAlign: "center", paddingTop: 80 }}>
        <div style={{ fontSize: 52, marginBottom: 16 }}>💤</div>
        <p style={{ color: "#fff", fontSize: 18, fontWeight: 700, marginBottom: 8 }}>You're offline</p>
        <p style={{ color: "#555", fontSize: 14 }}>Go online to receive delivery jobs</p>
      </div>
    );
  }

  if (jobs.length === 0) {
    return (
      <div style={{ padding: 24, textAlign: "center", paddingTop: 80 }}>
        <div style={{ fontSize: 52, marginBottom: 16 }}>🕐</div>
        <p style={{ color: "#fff", fontSize: 18, fontWeight: 700, marginBottom: 8 }}>No jobs yet</p>
        <p style={{ color: "#555", fontSize: 14 }}>Stay online — jobs will appear here when assigned by admin</p>
      </div>
    );
  }

  return (
    <div style={{ padding: 16 }}>
      <p style={{ color: "#555", fontSize: 13, marginBottom: 16 }}>
        {jobs.length} job{jobs.length !== 1 ? "s" : ""} assigned to you
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {jobs.map(job => (
          <JobCard key={job.id} job={job} onOpen={() => onOpenJob(job)} />
        ))}
      </div>
    </div>
  );
}

function JobCard({ job, onOpen }) {
  const isPicked = job.status === "picked_up";
  return (
    <div style={{
      background: "#111", border: `1px solid ${isPicked ? "#ff6b2b44" : "#1a1a1a"}`,
      borderRadius: 16, overflow: "hidden"
    }}>
      {/* Status bar */}
      <div style={{
        background: isPicked ? "#ff6b2b15" : "#16a34a15",
        borderBottom: `1px solid ${isPicked ? "#ff6b2b22" : "#16a34a22"}`,
        padding: "8px 16px",
        display: "flex", justifyContent: "space-between", alignItems: "center"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{
            width: 8, height: 8, borderRadius: "50%",
            background: isPicked ? "#ff6b2b" : "#16a34a"
          }} />
          <span style={{
            color: isPicked ? "#ff6b2b" : "#16a34a",
            fontSize: 12, fontWeight: 700
          }}>{isPicked ? "Picked up — deliver now" : "New job — pick up from restaurant"}</span>
        </div>
        <span style={{ color: "#555", fontSize: 12 }}>{job.assignedAt}</span>
      </div>

      <div style={{ padding: 16 }}>
        {/* Route summary */}
        <div style={{ marginBottom: 14 }}>
          <RouteStop
            type="pickup"
            icon="🍽️"
            label="Pick up from"
            name={job.restaurant.name}
            address={job.restaurant.address}
          />
          <div style={{ width: 2, height: 20, background: "#2a2a2a", marginLeft: 14, margin: "4px 0 4px 14px" }} />
          <RouteStop
            type="dropoff"
            icon="📍"
            label="Deliver to"
            name={job.customer.name}
            address={job.customer.address}
          />
        </div>

        {/* Meta */}
        <div style={{
          display: "flex", gap: 16, padding: "10px 0",
          borderTop: "1px solid #1a1a1a", borderBottom: "1px solid #1a1a1a",
          marginBottom: 14
        }}>
          <Meta icon="📏" value={job.distance} />
          <Meta icon="🕐" value={job.eta} />
          <Meta icon={job.payment === "M-Pesa" ? "📱" : "💵"} value={job.payment} />
          {job.payment === "Cash" && !job.paid && (
            <Meta icon="💰" value={`Collect Ksh ${job.orderTotal.toLocaleString()}`} highlight />
          )}
        </div>

        <button onClick={onOpen} style={{
          width: "100%", background: "#ff6b2b", border: "none",
          borderRadius: 12, padding: "14px", color: "#fff",
          fontSize: 15, fontWeight: 700, cursor: "pointer"
        }}>
          {isPicked ? "📍 Continue delivery" : "🛵 Start delivery"}
        </button>
      </div>
    </div>
  );
}

function RouteStop({ icon, label, name, address }) {
  return (
    <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
      <div style={{
        width: 30, height: 30, borderRadius: 8, flexShrink: 0,
        background: "#1a1a1a", border: "1px solid #2a2a2a",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 14
      }}>{icon}</div>
      <div>
        <p style={{ color: "#555", fontSize: 11, margin: "0 0 2px", textTransform: "uppercase", letterSpacing: 0.5 }}>{label}</p>
        <p style={{ color: "#fff", fontSize: 14, fontWeight: 600, margin: "0 0 2px" }}>{name}</p>
        <p style={{ color: "#666", fontSize: 12, margin: 0 }}>{address}</p>
      </div>
    </div>
  );
}

function Meta({ icon, value, highlight }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
      <span style={{ fontSize: 13 }}>{icon}</span>
      <span style={{ color: highlight ? "#f59e0b" : "#666", fontSize: 12, fontWeight: highlight ? 700 : 400 }}>{value}</span>
    </div>
  );
}
