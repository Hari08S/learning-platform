import { useEffect, useMemo, useState } from "react";

const API = import.meta.env.VITE_API_BASE || "http://localhost:4000";

export default function AdminPurchases() {
  const [purchases, setPurchases] = useState([]);
  const [query, setQuery] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);

  const token = localStorage.getItem("token");

  /* ================= LOAD DATA ================= */
  useEffect(() => {
    fetch(`${API}/api/admin/purchases`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(data => setPurchases(data.purchases || []))
      .catch(console.error);
  }, []);

  /* ================= HELPERS ================= */
  const toNumber = v => Number(v) || 0;

  const startOfDay = d => {
    const x = new Date(d);
    x.setHours(0, 0, 0, 0);
    return x;
  };

  const endOfDay = d => {
    const x = new Date(d);
    x.setHours(23, 59, 59, 999);
    return x;
  };

  /* ================= FILTER ================= */
  const filtered = useMemo(() => {
    return purchases.filter(p => {
      const textMatch = `${p.userEmail} ${p.courseTitle}`
        .toLowerCase()
        .includes(query.toLowerCase());

      if (!p.purchasedAt) return false;
      const date = new Date(p.purchasedAt);

      const fromOk = from ? date >= startOfDay(from) : true;
      const toOk = to ? date <= endOfDay(to) : true;

      return textMatch && fromOk && toOk;
    });
  }, [purchases, query, from, to]);

  /* ================= STATS ================= */
  const stats = useMemo(() => {
    // Count all non-cancelled purchases (active + completed) for revenue
    const valid = purchases.filter(p => p.status !== 'cancelled' && p.status !== 'withdrawn');
    const active = purchases.filter(p => p.status === 'active');
    const revenue = valid.reduce((sum, p) => sum + toNumber(p.price), 0);

    return {
      total: purchases.length,
      active: active.length,
      revenue,
    };
  }, [purchases]);

  /* ================= MONTHLY ================= */
  const monthly = useMemo(() => {
    const map = {};

    purchases.forEach(p => {
      // Include active AND completed purchases in monthly revenue chart
      if ((p.status === 'active' || p.status === 'completed') && p.purchasedAt) {
        const d = new Date(p.purchasedAt);
        const key = `${d.getFullYear()}-${d.getMonth()}`;
        map[key] = (map[key] || 0) + toNumber(p.price);
      }
    });

    const rows = Object.entries(map).map(([k, v]) => {
      const [y, m] = k.split("-");
      return {
        label: new Date(y, m).toLocaleString("default", { month: "short" }),
        value: v,
      };
    });

    return rows;
  }, [purchases]);

  const maxMonthly = Math.max(...monthly.map(m => m.value), 1);

  /* ================= UI ================= */
  return (
    <div className="admin-content">
      {/* HEADER */}
      <div className="purchase-header">
        <h1>Purchases</h1>
        <input
          className="search-input wide"
          placeholder="Search user or course..."
          value={query}
          onChange={e => setQuery(e.target.value)}
        />
      </div>

      {/* DATE FILTER */}
      <div className="filter-wrapper">
        <h3 className="filter-title">Filter by Date</h3>
        <div className="filter-card">
          <div className="date-group">
            <label>From</label>
            <input type="date" value={from} onChange={e => setFrom(e.target.value)} />
          </div>

          <div className="date-group">
            <label>To</label>
            <input type="date" value={to} onChange={e => setTo(e.target.value)} />
          </div>

          <div className="date-actions">
            <button className="secondary-btn clear-btn" onClick={() => { setFrom(''); setTo(''); }}>Clear</button>
          </div>
        </div>
      </div>

      {/* STATS */}
      <div className="purchase-stats">
        <div className="stat-card">
          <h2>{stats.total}</h2>
          <p>Total</p>
        </div>

        <div className="stat-card">
          <h2>{stats.active}</h2>
          <p>Active</p>
        </div>

        <div className="stat-card revenue">
          <h2>₹{stats.revenue}</h2>
          <p>Revenue</p>
        </div>
      </div>

      {/* MONTHLY */}
      <div className="chart-card compact">
        <h3>Monthly Revenue</h3>

        {monthly.length === 0 ? (
          <p className="muted">No revenue yet</p>
        ) : (
          <div className="bar-chart centered">
            {monthly.map((m, i) => (
              <div className="bar" key={i}>
                <span
                  style={{
                    height: `${(m.value / maxMonthly) * 100}%`,
                  }}
                  title={`₹${m.value} in ${m.label}`}
                />
                <strong>₹{m.value}</strong>
                <small>{m.label}</small>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* TABLE */}
      <div className="table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Course</th>
              <th>Price</th>
              <th>Status</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan="5" className="empty-cell">
                  No purchases found
                </td>
              </tr>
            ) : (
              filtered.map((p, i) => (
                <tr key={i}>
                  <td>
                    <button
                      className="link-btn"
                      onClick={() => setSelectedUser(p.userEmail)}
                    >
                      {p.userEmail}
                    </button>
                  </td>
                  <td>{p.courseTitle}</td>
                  <td>₹{toNumber(p.price)}</td>
                  <td>
                    <span className={`status-badge ${p.status}`}>
                      {p.status.toUpperCase()}
                    </span>
                  </td>
                  <td>{new Date(p.purchasedAt).toLocaleDateString()}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* USER DRAWER */}
      {selectedUser && (
        <div className="drawer">
          <div className="drawer-header">
            <h3>{selectedUser}</h3>
            <button onClick={() => setSelectedUser(null)}>✕</button>
          </div>

          {purchases
            .filter(p => p.userEmail === selectedUser)
            .map((p, i) => (
              <div className="drawer-item" key={i}>
                <strong>{p.courseTitle}</strong>
                <span>₹{toNumber(p.price)}</span>
                <small className={p.status}>{p.status}</small>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
