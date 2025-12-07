// src/components/Footer.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import FooterModal from './FooterModal';

const Footer = () => {
  const [modal, setModal] = useState({
    open: false,
    title: '',
    body: ''
  });

  const openModal = (title, body) => {
    setModal({ open: true, title, body });
  };

  const closeModal = () => {
    setModal(prev => ({ ...prev, open: false }));
  };

  return (
    <>
      <footer className="footer">
        <div className="container">
          
          <div className="footer-content">

            {/* Brand / Legal */}
            <div className="footer-section">
              <h3 className="footer-title">UPWISE</h3>
              <p className="footer-description">
                Premium online learning platform with expert-led courses. Pay once and gain lifetime access.
              </p>
              <div className="footer-links">
                <a
                  href="#"
                  className="footer-link"
                  onClick={e => {
                    e.preventDefault();
                    openModal(
                      'Terms & Conditions',
                      `By using UPWISE, you agree to our learner terms:\n\n• Courses are for personal, non-commercial learning.\n• Certificates reflect course completion, not a university degree.\n• Similar to platforms like GeeksforGeeks or Coursera, content is created by experts and may be updated over time.\n\nFor any questions about these terms, reach out to us at harisuresh@fusiondiaries.com.`
                    );
                  }}
                >
                  Terms
                </a>
                <a
                  href="#"
                  className="footer-link"
                  onClick={e => {
                    e.preventDefault();
                    openModal(
                      'Privacy Notice',
                      `We respect your privacy:\n\n• We collect only the data needed to run your account (name, email, course activity).\n• Your data is used to improve recommendations and track your progress.\n• We do not sell your personal information.\n\nOur approach is similar to major learning platforms like Coursera or GFG — learn safely and securely on UPWISE.`
                    );
                  }}
                >
                  Privacy
                </a>
              </div>
            </div>

            {/* Platform navigation (real routes) */}
            <div className="footer-section">
              <h3 className="footer-title">Platform</h3>
              <ul className="footer-links-list">
                <li>
                  <Link to="/courses" className="footer-link">
                    Browse Courses
                  </Link>
                </li>
                <li>
                  {/* assuming purchase history is on dashboard (modal/button there) */}
                  <Link to="/dashboard" className="footer-link">
                    My Purchases
                  </Link>
                </li>
                <li>
                  <Link to="/dashboard" className="footer-link">
                    Student Dashboard
                  </Link>
                </li>
              </ul>
            </div>

            {/* Support – show informative modals */}
            <div className="footer-section">
              <h3 className="footer-title">Support</h3>
              <ul className="footer-links-list">
                <li>
                  <a
                    href="#"
                    className="footer-link"
                    onClick={e => {
                      e.preventDefault();
                      openModal(
                        'Help Center',
                        `Our Help Center will host step-by-step guides on:\n\n• Starting your first course\n• Payment & billing questions\n• Certificates and progress tracking\n\nWe're building this experience similar to the support you see on platforms like GeeksforGeeks, Coursera, and Udemy.\n\nFor now, you can email us directly for any help.`
                      );
                    }}
                  >
                    Help Center
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="footer-link"
                    onClick={e => {
                      e.preventDefault();
                      openModal(
                        'Contact Us',
                        'For queries, contact us at\nharisuresh@fusiondiaries.com'
                      );
                    }}
                  >
                    Contact Us
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="footer-link"
                    onClick={e => {
                      e.preventDefault();
                      openModal(
                        'Community',
                        `We are building a learner community inspired by GFG and Coursera discussion forums.\n\nSoon you will be able to:\n• Ask questions and get peer support\n• Share projects and get feedback\n• Join topic-wise channels (React, DSA, Cloud, etc.)\n\nStay tuned — community features are coming soon to UPWISE.`
                      );
                    }}
                  >
                    Community
                  </a>
                </li>
              </ul>
            </div>

            {/* Get started – route to signup + info modal style text */}
            <div className="footer-section">
              <h3 className="footer-title">Get Started</h3>
              <p className="footer-description">
                Join 50,000+ professionals learning with lifetime-access courses.
              </p>
              <Link
                to="/signup"
                className="btn primary small footer-cta"
              >
                Start Your Journey
              </Link>
            </div>

          </div>

          <hr className="footer-divider" />
          <div className="footer-bottom">
            <p className="copyright">© 2025 UPWISE. All rights reserved.</p>
          </div>

        </div>
      </footer>

      <FooterModal
        open={modal.open}
        title={modal.title}
        body={modal.body}
        onClose={closeModal}
      />
    </>
  );
};

export default Footer;
