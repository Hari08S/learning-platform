import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API = import.meta.env.VITE_API_BASE || "http://localhost:4000";

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");

    fetch(`${API}/api/admin/dashboard`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(data => setStats(data.stats))
      .catch(console.error);
  }, []);

  if (!stats) return <p>Loading dashboard...</p>;

  const max = Math.max(
    stats.totalUsers,
    stats.totalCourses,
    stats.totalPurchases,
    1
  );

  const barHeight = (value) => `${(value / max) * 100}%`;

  return (
    <>
      <h1 className="admin-title">Admin Dashboard</h1>

      {/* ===== KPI CARDS ===== */}
      <div className="dashboard-grid">
        <div
          className="kpi-card accent"
          onClick={() => navigate("/admin/users")}
          style={{ cursor: "pointer" }}
        >
          <h2>{stats.totalUsers}</h2>
          <p>Total Users</p>
        </div>

        <div className="kpi-card">
          <h2>{stats.totalAdmins}</h2>
          <p>Admins</p>
        </div>

        <div
          className="kpi-card"
          onClick={() => navigate("/admin/courses")}
          style={{ cursor: "pointer" }}
        >
          <h2>{stats.totalCourses}</h2>
          <p>Courses</p>
        </div>

        <div
          className="kpi-card"
          onClick={() => navigate("/admin/purchases")}
          style={{ cursor: "pointer" }}
        >
          <h2>{stats.totalPurchases}</h2>
          <p>Purchases</p>
        </div>

        <div
          className="kpi-card revenue"
          onClick={() => navigate("/admin/purchases")}
          style={{ cursor: "pointer" }}
        >
          <h2>₹{stats.totalRevenue}</h2>
          <p>Total Revenue</p>
        </div>
      </div>

      {/* ===== INSIGHTS ===== */}
      <div className="dashboard-row">
        <div className="insight-card">
          <h3>Platform Status</h3>
          <p className="status-live">🟢 Platform is Live</p>
          <p className="muted">
            Courses are published and ready to onboard users.
          </p>
        </div>

        <div className="insight-card">
          <h3>Activity Overview</h3>

          <div className="bar-chart">
            <div
              className="bar"
              onClick={() => navigate("/admin/users")}
              style={{ cursor: "pointer" }}
            >
              <span style={{ height: barHeight(stats.totalUsers) }} />
              <label>Users</label>
            </div>

            <div
              className="bar"
              onClick={() => navigate("/admin/courses")}
              style={{ cursor: "pointer" }}
            >
              <span style={{ height: barHeight(stats.totalCourses) }} />
              <label>Courses</label>
            </div>

            <div
              className="bar"
              onClick={() => navigate("/admin/purchases")}
              style={{ cursor: "pointer" }}
            >
              <span style={{ height: barHeight(stats.totalPurchases) }} />
              <label>Purchases</label>
            </div>
          </div>

          <p className="muted small">
            Activity grows as users join and purchase courses.
          </p>
        </div>
      </div>

      {/* ===== QUICK ACTIONS ===== */}
      <div className="dashboard-actions dashboard-bottom-gap">
        <h3>Quick Actions</h3>

        <div className="action-grid">
          <button
            className="action-card"
            onClick={() => navigate("/admin/courses")}
          >
            ➕ Add Course
          </button>

          <button
            className="action-card"
            onClick={() => navigate("/admin/users")}
          >
            👥 View Users
          </button>

          <button
            className="action-card"
            onClick={() => navigate("/admin/purchases")}
          >
            💳 View Purchases
          </button>
        </div>
      </div>
    </>
  );
}
