// src/components/Footer.jsx
import React from 'react';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        
        <div className="footer-content">

          <div className="footer-section">
            <h3 className="footer-title">UPWISE</h3>
            <p className="footer-description">
              Premium online learning platform with expert-led courses. Pay once and gain lifetime access.
            </p>
            <div className="footer-links">
              <a href="#" className="footer-link">Terms</a>
              <a href="#" className="footer-link">Privacy</a>
            </div>
          </div>

          <div className="footer-section">
            <h3 className="footer-title">Platform</h3>
            <ul className="footer-links-list">
              <li><a href="#" className="footer-link">Browse Courses</a></li>
              <li><a href="#" className="footer-link">My Purchases</a></li>
              <li><a href="#" className="footer-link">Student Dashboard</a></li>
            </ul>
          </div>

          <div className="footer-section">
            <h3 className="footer-title">Support</h3>
            <ul className="footer-links-list">
              <li><a href="#" className="footer-link">Help Center</a></li>
              <li><a href="#" className="footer-link">Contact Us</a></li>
              <li><a href="#" className="footer-link">Community</a></li>
            </ul>
          </div>

          <div className="footer-section">
            <h3 className="footer-title">Get Started</h3>
            <p className="footer-description">
              Join 50,000+ professionals learning with lifetime-access courses.
            </p>
            <a href="#" className="btn primary small footer-cta">Start Your Journey</a>
          </div>

        </div>

        <hr className="footer-divider" />
        <div className="footer-bottom">
          <p className="copyright">© 2025 UPWISE. All rights reserved.</p>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
