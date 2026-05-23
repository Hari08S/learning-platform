import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { FiMenu, FiX, FiBell, FiSettings, FiClock, FiShield, FiLogOut, FiUser } from "react-icons/fi";
import { toast } from "react-hot-toast";
import PurchaseHistoryModal from "./PurchaseHistoryModal.jsx";
import NotificationBell from "./NotificationBell.jsx";

const Navbar = ({ loggedIn, setLoggedIn }) => {
  const nav = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [notifsOpen, setNotifsOpen] = useState(false);


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



  const isAdmin = user?.role === "admin";
  const isUser = user?.role === "user";

  const getLinkClass = (path) => {
    return location.pathname === path ? "link active" : "link";
  };

  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <nav className="nav" style={{
        boxShadow: scrolled ? '0 4px 12px rgba(0,0,0,0.05)' : 'none',
        position: 'sticky', top: 0, zIndex: 50, transition: 'box-shadow 0.3s'
      }}>
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
                <li><Link className={getLinkClass("/interview-prep")} to="/interview-prep">Interview Prep</Link></li>
                <li><Link className={getLinkClass("/leaderboard")} to="/leaderboard">Leaderboard</Link></li>
              </>
            )}

            {/* ADMIN LINKS (TOP NAVBAR) */}
            {loggedIn && isAdmin && (
              <>
                <li><Link className={getLinkClass("/admin/dashboard")} to="/admin/dashboard">Dashboard</Link></li>
                <li><Link className={getLinkClass("/admin/users")} to="/admin/users">Users</Link></li>
                <li><Link className={getLinkClass("/admin/courses")} to="/admin/courses">Courses</Link></li>
                <li><Link className={getLinkClass("/admin/internships")} to="/admin/internships">Internships</Link></li>
                <li><Link className={getLinkClass("/admin/submissions")} to="/admin/submissions">Submissions</Link></li>
                <li><Link className={getLinkClass("/admin/purchases")} to="/admin/purchases">Purchases</Link></li>
              </>
            )}


            {/* NOTIFICATIONS */}
            {loggedIn && (
              <li style={{ position: "relative", display: "flex", alignItems: "center" }}>
                <NotificationBell />
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
                          to={`/portfolio/${user?.email ? user.email.split('@')[0] : 'user'}`}
                          className="user-menu-item"
                          onClick={() => { setMenuOpen(false); setMobileNavOpen(false); }}
                        >
                          <FiUser className="user-menu-icon" />
                          <div>
                            <div className="user-menu-item-label">My Portfolio</div>
                            <div className="user-menu-item-desc">Your public profile</div>
                          </div>
                        </Link>

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
