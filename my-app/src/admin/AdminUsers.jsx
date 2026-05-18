import { useEffect, useState } from "react";

const API = import.meta.env.VITE_API_BASE || "http://localhost:4000";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState(null);
  const [roleFilter, setRoleFilter] = useState("all");
  const token = localStorage.getItem("token");

  const loadUsers = async () => {
    const res = await fetch(`${API}/api/admin/users`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    setUsers(data.users || []);
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const deleteUser = async (id) => {
    if (!confirm("Are you sure you want to permanently delete this user?")) return;
    await fetch(`${API}/api/admin/users/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` }
    });
    loadUsers();
  };

  const filteredUsers = users.filter(u => {
    const matchSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === "all" || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  const totalUsers = users.length;
  const adminCount = users.filter(u => u.role === "admin").length;
  const userCount = users.filter(u => u.role === "user").length;

  return (
    <div className="admin-users-table-page">
      {/* Header */}
      <div className="aut-header">
        <div>
          <h1 className="aut-title">User Management</h1>
          <p className="aut-subtitle">{totalUsers} total users · {userCount} members · {adminCount} admins</p>
        </div>
      </div>

      {/* Controls */}
      <div className="aut-controls">
        <input
          className="aut-search"
          placeholder="🔍  Search by name or email..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <div className="aut-filters">
          {["all", "user", "admin"].map(r => (
            <button
              key={r}
              className={`aut-filter-btn ${roleFilter === r ? "active" : ""}`}
              onClick={() => setRoleFilter(r)}
            >
              {r === "all" ? "All" : r === "user" ? "Members" : "Admins"}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="aut-table-wrap">
        <table className="aut-table">
          <thead>
            <tr>
              <th style={{ width: 40 }}>#</th>
              <th>User</th>
              <th>Role</th>
              <th>Courses</th>
              <th>Internships</th>
              <th>Badges</th>
              <th>Streak</th>
              <th>Joined</th>
              <th style={{ width: 100 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user, idx) => {
              const totalPurchases = user.purchasedCourses?.length || 0;
              const activePurchases = user.purchasedCourses?.filter(p => p.status === "active").length || 0;
              const intTotal = user.internships?.total || 0;
              const intActive = user.internships?.active || 0;
              const intDone = user.internships?.completed || 0;
              const isExpanded = expandedId === user._id;
              const initials = (user.name || "U")
                .split(" ")
                .map(w => w[0])
                .slice(0, 2)
                .join("")
                .toUpperCase();

              return (
                <>
                  <tr
                    key={user._id}
                    className={`aut-row ${isExpanded ? "expanded" : ""}`}
                    onClick={() => setExpandedId(isExpanded ? null : user._id)}
                    style={{ cursor: "pointer" }}
                  >
                    <td className="aut-idx">{idx + 1}</td>
                    <td>
                      <div className="aut-user-cell">
                        <div className="aut-avatar">{initials}</div>
                        <div>
                          <div className="aut-name">{user.name}</div>
                          <div className="aut-email">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`aut-role-badge ${user.role}`}>
                        {user.role === "admin" ? "🛡️ Admin" : "👤 User"}
                      </span>
                    </td>
                    <td>
                      <span className="aut-stat-pill">{activePurchases}<span className="aut-stat-label">/{totalPurchases}</span></span>
                    </td>
                    <td>
                      <span className="aut-stat-pill green">{intActive}<span className="aut-stat-label">/{intTotal}</span></span>
                    </td>
                    <td>
                      <span className="aut-stat-num">{user.badges?.length || 0}</span>
                    </td>
                    <td>
                      {(user.streakDays || 0) > 0 ? (
                        <span className="aut-streak">🔥 {user.streakDays}</span>
                      ) : (
                        <span className="aut-stat-num muted">0</span>
                      )}
                    </td>
                    <td className="aut-date">
                      {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "—"}
                    </td>
                    <td>
                      <button
                        className="aut-delete-btn"
                        onClick={(e) => { e.stopPropagation(); deleteUser(user._id); }}
                        title="Delete User"
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                  {isExpanded && (
                    <tr key={`${user._id}-detail`} className="aut-detail-row">
                      <td colSpan={9}>
                        <div className="aut-detail-grid">
                          <div className="aut-detail-card">
                            <div className="aut-detail-label">📚 Courses</div>
                            <div className="aut-detail-stats">
                              <span><strong>{totalPurchases}</strong> purchased</span>
                              <span><strong>{activePurchases}</strong> active</span>
                              <span><strong>{totalPurchases - activePurchases}</strong> cancelled</span>
                            </div>
                          </div>
                          <div className="aut-detail-card">
                            <div className="aut-detail-label">🎓 Internships</div>
                            <div className="aut-detail-stats">
                              <span><strong>{intTotal}</strong> enrolled</span>
                              <span><strong>{intActive}</strong> active</span>
                              <span><strong>{intDone}</strong> completed</span>
                            </div>
                          </div>
                          <div className="aut-detail-card">
                            <div className="aut-detail-label">🏆 Activity</div>
                            <div className="aut-detail-stats">
                              <span><strong>{user.badges?.length || 0}</strong> badges</span>
                              <span><strong>{user.streakDays || 0}</strong> day streak</span>
                              <span><strong>{user.progress?.length || 0}</strong> in progress</span>
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              );
            })}
          </tbody>
        </table>

        {filteredUsers.length === 0 && (
          <div className="aut-empty">No users found matching your search.</div>
        )}
      </div>

      <div className="dashboard-bottom-gap" />
    </div>
  );
}
