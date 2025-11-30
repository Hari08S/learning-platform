import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "../styles/login.css";

const ForgotPassword = () => {
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [err, setErr] = useState("");
  const [sent, setSent] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!email) return setErr("Please enter your email.");

    setErr("");
    setSent(true);

    // After 2 seconds → redirect to login
    setTimeout(() => {
      nav("/login");
    }, 2200);
  };

  return (
    <main className="login-page">
      <div className="login-panel container">

        {!sent && (
          <div className="panel-left">
            <h2 className="lp-title">Reset Your Password</h2>
            <p className="lp-desc">Enter your email to receive a reset link.</p>

            <form className="login-form" onSubmit={handleSubmit}>
              <label className="field">
                <span className="field-label">Email</span>
                <input
                  type="email"
                  placeholder="you@example.com"
                  className="input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </label>

              {err && <div className="form-error">{err}</div>}

              <button className="btn login-btn" type="submit">
                Send Reset Link
              </button>

              <div className="small-note" style={{ marginTop: 10 }}>
                Back to{" "}
                <Link to="/login" style={{ color: "#065F46", fontWeight: 700 }}>
                  Login
                </Link>
              </div>
            </form>
          </div>
        )}

        {/* SUCCESS ANIMATION */}
        {sent && (
          <div className="success-box">
            <div className="success-animation">
              <div className="success-circle"></div>
              <div className="success-check">✓</div>
            </div>
            <h2 className="success-text">Email Sent!</h2>
            <p className="success-subtext">
              Please check your inbox for the reset link.
            </p>
          </div>
        )}

        {/* RIGHT PANEL */}
        <aside className="panel-right">
          <h3 className="right-title">Stay Secure</h3>
          <ul className="right-features">
            <li>🔐 Reset password anytime</li>
            <li>📧 Secure email verification</li>
            <li>💡 Quick recovery process</li>
          </ul>
        </aside>
      </div>
    </main>
  );
};

export default ForgotPassword;
