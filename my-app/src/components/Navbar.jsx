// src/components/Navbar.jsx
import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import PurchaseHistoryModal from './PurchaseHistoryModal.jsx'; // new import

const Navbar = ({ loggedIn, setLoggedIn }) => {
  const nav = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false); // new
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('user') || 'null'); } catch { return null; }
  });
  const menuRef = useRef(null);

  useEffect(() => {
    function onUpdate() {
      try {
        const u = JSON.parse(localStorage.getItem('user') || 'null');
        setUser(u);
      } catch {
        setUser(null);
      }
    }
    window.addEventListener('user.updated', onUpdate);
    return () => window.removeEventListener('user.updated', onUpdate);
  }, []);

  const initials = (user?.name || user?.email || 'U')
    .split(' ')
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setMenuOpen(false);
    setLoggedIn(false);
    nav('/');
  };

  // close dropdown when clicking outside
  useEffect(() => {
    function onDoc(e) {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(e.target)) setMenuOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  return (
    <>
      <nav className="nav">
        <div className="nav-box container">
          <div className="logo-box">
            <div className="logo">
              <img src="/logo.png" alt="UPWISE logo" />
            </div>
            <span className="logo-txt">UPWISE</span>
          </div>

          <ul className="links" style={{ alignItems: 'center' }}>
            <li><Link className="link" to="/">Home</Link></li>

            {!loggedIn && <li><Link className="link" to="/login">Login</Link></li>}

            {loggedIn && (
              <>
                <li><Link className="link" to="/dashboard">Dashboard</Link></li>
                <li><Link className="link" to="/courses">Courses</Link></li>
                <li><Link className="link" to="/certificates">Certificates</Link></li>

                {/* Avatar-only button */}
                <li style={{ position: 'relative', marginLeft: 8 }} ref={menuRef}>
                  <button
                    aria-haspopup="true"
                    aria-expanded={menuOpen}
                    className="avatar-btn"
                    onClick={() => setMenuOpen((s) => !s)}
                    title="Open profile menu"
                  >
                    <span className="avatar">{initials}</span>
                  </button>

                  {menuOpen && (
                    <div
                      className="user-menu"
                      role="menu"
                      aria-label="Profile menu"
                      style={{ width: 220 }}
                    >
                      <Link
                        to="/settings"
                        className="user-menu-item"
                        onClick={() => setMenuOpen(false)}
                      >
                        Settings
                      </Link>

                      <button
                        className="user-menu-item"
                        onClick={() => { setMenuOpen(false); setHistoryOpen(true); }}
                        style={{ width: '100%', textAlign: 'left', background: 'transparent', border: 'none', padding: '12px 14px', cursor: 'pointer' }}
                      >
                        Purchase history
                      </button>

                      <button
                        className="user-menu-item mute"
                        onClick={handleLogout}
                        style={{ width: '100%', textAlign: 'left', background: 'transparent', border: 'none', padding: '12px 14px', cursor: 'pointer' }}
                      >
                        Sign out
                      </button>
                    </div>
                  )}
                </li>
              </>
            )}
          </ul>
        </div>
      </nav>

      {/* Modal shown when user clicks Purchase history in dropdown */}
      {historyOpen && <PurchaseHistoryModal open={historyOpen} onClose={() => setHistoryOpen(false)} />}
    </>
  );
};

export default Navbar;
