import { useEffect, useState } from "react";

const API = import.meta.env.VITE_API_BASE || "http://localhost:4000";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
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

  const filteredUsers = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <div className="admin-page-header users-header">
  <h1>User Management</h1>

  <div className="users-search-wrapper">
    <input
      className="search-input"
      placeholder="Search users by name or email..."
      value={search}
      onChange={e => setSearch(e.target.value)}
    />
  </div>
</div>


      <div className="user-grid">
        {filteredUsers.map(user => {
          const totalPurchases = user.purchasedCourses?.length || 0;
          const activePurchases =
            user.purchasedCourses?.filter(p => p.status === "active").length || 0;

          return (
            <div className="user-card" key={user._id}>
              <div className="user-header">
                <h3>{user.name}</h3>
                <span className={`role-badge ${user.role}`}>
                  {user.role}
                </span>
              </div>

              <p className="user-email">{user.email}</p>

              <div className="user-stats">
                <div>
                  <strong>{totalPurchases}</strong>
                  <span>Total Purchases</span>
                </div>
                <div>
                  <strong>{activePurchases}</strong>
                  <span>Active</span>
                </div>
                <div>
                  <strong>{user.badges?.length || 0}</strong>
                  <span>Badges</span>
                </div>
                <div>
                  <strong>{user.streakDays || 0}</strong>
                  <span>Streak</span>
                </div>
              </div>

              <p className="user-meta">
                Joined:{" "}
                {user.createdAt
                  ? new Date(user.createdAt).toLocaleDateString()
                  : "—"}
              </p>

              <button
                className="danger-btn"
                onClick={() => deleteUser(user._id)}
              >
                Delete User
              </button>
            </div>
          );
        })}

        {filteredUsers.length === 0 && (
          <div className="empty-state">
            No users found
          </div>
        )}
      </div>

      <div className="dashboard-bottom-gap" />
    </>
  );
}
