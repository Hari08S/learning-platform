import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { FiMenu, FiX, FiBell, FiSettings, FiClock, FiShield, FiLogOut, FiUser } from "react-icons/fi";
import { toast } from "react-hot-toast";
import PurchaseHistoryModal from "./PurchaseHistoryModal.jsx";

const Navbar = ({ loggedIn, setLoggedIn }) => {
  const nav = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [notifsOpen, setNotifsOpen] = useState(false);


  const [notifications, setNotifications] = useState([
    { id: 1, text: "New course: Advanced React patterns available!", read: false },
    { id: 2, text: "Keep it up! 3 day streak 🔥", read: false },
    { id: 3, text: "Achievement unlocked: First Login", read: false }
  ]);


  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch {
      return null;
    }
  });

  const menuRef = useRef(null);
  const notifRef = useRef(null);

  // Sync user updates
  useEffect(() => {
    const onUpdate = () => {
      try {
        setUser(JSON.parse(localStorage.getItem("user") || "null"));
      } catch {
        setUser(null);
      }
    };
    window.addEventListener("user.updated", onUpdate);
    return () => window.removeEventListener("user.updated", onUpdate);
  }, []);

  // Close menus on outside click
  useEffect(() => {
    const onDocClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifsOpen(false);
      }
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const initials = (user?.name || user?.email || "U")
    .split(" ")
    .map(p => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const handleLogout = () => {
    localStorage.clear();
    setMenuOpen(false);
    setMobileNavOpen(false);
    setLoggedIn(false);
    toast.success("Signed out safely.");
    nav("/");
  };

  const markRead = (id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const isAdmin = user?.role === "admin";
  const isUser = user?.role === "user";

  const getLinkClass = (path) => {
    return location.pathname === path ? "link active" : "link";
  };

  return (
    <>
      <nav className="nav">
        <div className="nav-box container">
          {/* LOGO */}
          <div
            className="logo-box"
            style={{ cursor: "pointer", display: 'flex', alignItems: 'center' }}
            onClick={() => nav("/")}
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === 'Enter') nav("/"); }}
            aria-label="Home page"
          >
            <div className="logo" style={{ width: 40, height: 40, marginRight: 10 }}>
              <img src="/logo.png" alt="UPWISE logo" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
            </div>
            <span className="logo-txt" style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>UPWISE</span>
          </div>

          {/* MOBILE TOGGLE SECTION */}
          <div className="nav-controls-mobile" style={{ display: 'none' }}>
            <button
              className="hamburger"
              aria-label="Toggle Navigation Menu"
              onClick={() => setMobileNavOpen(!mobileNavOpen)}
              style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: 24, color: '#fff' }}
            >
              {mobileNavOpen ? <FiX /> : <FiMenu />}
            </button>
          </div>

          {/* NAV LINKS */}
          <ul className={`links ${mobileNavOpen ? 'open' : ''}`} style={{ alignItems: "center" }}>
            <li>
              <Link className={getLinkClass("/")} to="/">Home</Link>
            </li>

            {!loggedIn && (
              <li>
                <Link className={getLinkClass("/login")} to="/login">Login</Link>
              </li>
            )}

            {/* USER LINKS */}
            {loggedIn && isUser && (
              <>
                <li><Link className={getLinkClass("/dashboard")} to="/dashboard">Dashboard</Link></li>
                <li><Link className={getLinkClass("/courses")} to="/courses">Courses</Link></li>
                <li><Link className={getLinkClass("/internships")} to="/internships">Internships</Link></li>
                <li><Link className={getLinkClass("/certificates")} to="/certificates">Certificates</Link></li>
              </>
            )}

            {/* ADMIN LINKS (TOP NAVBAR) */}
            {loggedIn && isAdmin && (
              <>
                <li><Link className={getLinkClass("/admin/dashboard")} to="/admin/dashboard">Dashboard</Link></li>
                <li><Link className={getLinkClass("/admin/users")} to="/admin/users">Users</Link></li>
                <li><Link className={getLinkClass("/admin/courses")} to="/admin/courses">Courses</Link></li>
                <li><Link className={getLinkClass("/admin/internships")} to="/admin/internships">Internships</Link></li>
                <li><Link className={getLinkClass("/admin/purchases")} to="/admin/purchases">Purchases</Link></li>
              </>
            )}


            {/* NOTIFICATIONS */}
            {loggedIn && (
              <li style={{ position: "relative" }} ref={notifRef}>
                <button
                  onClick={() => setNotifsOpen(!notifsOpen)}
                  style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: 20, color: '#fff', position: 'relative', display: 'flex', marginLeft: 10, padding: 8 }}
                  aria-label={`Notifications ${unreadCount > 0 ? `(${unreadCount} unread)` : ''}`}
                >
                  <FiBell />
                  {unreadCount > 0 && (
                    <span style={{ position: 'absolute', top: 2, right: 2, background: '#ef4444', color: '#fff', fontSize: '0.65rem', width: 16, height: 16, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                      {unreadCount}
                    </span>
                  )}
                </button>
                {notifsOpen && (
                  <div className="user-menu" style={{ width: 300, right: 0, padding: '10px 0' }}>
                    <div style={{ padding: '0 15px 10px', fontWeight: 'bold', borderBottom: '1px solid var(--border)', color: 'var(--text)' }}>
                      Notifications
                    </div>
                    {notifications.length === 0 ? (
                      <div style={{ padding: '15px', textAlign: 'center', color: 'var(--muted)', fontSize: '0.9rem' }}>No notifications</div>
                    ) : (
                      notifications.map(n => (
                        <div
                          key={n.id}
                          onClick={() => markRead(n.id)}
                          style={{
                            padding: '12px 15px',
                            borderBottom: '1px solid var(--border)',
                            cursor: 'pointer',
                            background: n.read ? 'transparent' : 'rgba(16, 185, 129, 0.05)',
                            display: 'flex',
                            gap: '10px',
                            color: 'var(--text)'
                          }}
                        >
                          {!n.read && <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981', flexShrink: 0, marginTop: 6 }} />}
                          <span style={{ fontSize: '0.85rem', color: n.read ? 'var(--muted)' : 'var(--text)', fontWeight: n.read ? 'normal' : '600' }}>
                            {n.text}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </li>
            )}

            {/* AVATAR */}
            {loggedIn && (
              <li style={{ position: "relative", marginLeft: 10 }} ref={menuRef}>
                <button
                  className="avatar-btn"
                  aria-haspopup="true"
                  aria-expanded={menuOpen}
                  aria-label="Open User Menu"
                  onClick={() => setMenuOpen(v => !v)}
                >
                  <span className="avatar" aria-hidden="true">{initials}</span>
                </button>

                {menuOpen && (
                  <div className="user-menu" style={{ width: 280 }}>
                    {/* Profile Header */}
                    <div className="user-menu-header">
                      <div className="user-menu-avatar">{initials}</div>
                      <div className="user-menu-info">
                        <div className="user-menu-name">{user?.name || "User"}</div>
                        <div className="user-menu-email">{user?.email || ""}</div>
                        <span className={`user-menu-role-badge ${isAdmin ? 'admin' : ''}`}>
                          {isAdmin ? '🛡️ Admin' : '👤 Member'}
                        </span>
                      </div>
                    </div>

                    <div className="user-menu-divider" />

                    {isUser && (
                      <>
                        <Link
                          to="/settings"
                          className="user-menu-item"
                          onClick={() => { setMenuOpen(false); setMobileNavOpen(false); }}
                        >
                          <FiSettings className="user-menu-icon" />
                          <div>
                            <div className="user-menu-item-label">Settings</div>
                            <div className="user-menu-item-desc">Manage your account</div>
                          </div>
                        </Link>

                        <button
                          className="user-menu-item"
                          onClick={() => {
                            setMenuOpen(false);
                            setMobileNavOpen(false);
                            setHistoryOpen(true);
                          }}
                        >
                          <FiClock className="user-menu-icon" />
                          <div>
                            <div className="user-menu-item-label">Purchase History</div>
                            <div className="user-menu-item-desc">View your transactions</div>
                          </div>
                        </button>
                      </>
                    )}

                    {isAdmin && (
                      <Link
                        to="/admin/dashboard"
                        className="user-menu-item"
                        onClick={() => { setMenuOpen(false); setMobileNavOpen(false); }}
                      >
                        <FiShield className="user-menu-icon" />
                        <div>
                          <div className="user-menu-item-label">Admin Dashboard</div>
                          <div className="user-menu-item-desc">Manage the platform</div>
                        </div>
                      </Link>
                    )}

                    <div className="user-menu-divider" />

                    <button
                      className="user-menu-item user-menu-item--danger"
                      onClick={handleLogout}
                    >
                      <FiLogOut className="user-menu-icon" />
                      <div>
                        <div className="user-menu-item-label">Sign Out</div>
                        <div className="user-menu-item-desc">Log out of your account</div>
                      </div>
                    </button>
                  </div>
                )}
              </li>
            )}
          </ul>
        </div>
      </nav>

      {/* PURCHASE HISTORY MODAL */}
      {historyOpen && (
        <PurchaseHistoryModal
          open={historyOpen}
          onClose={() => setHistoryOpen(false)}
        />
      )}
    </>
  );
};

export default Navbar;
