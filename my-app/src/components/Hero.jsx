import React from 'react';
import { useNavigate } from 'react-router-dom';

const Hero = () => {
  const navigate = useNavigate();

  const handleStart = () => {
    // navigate to login page
    navigate('/login');
  };

  return (
    <section className="hero">
      <div className="hero-box">
        <div className="hero-text">
          <span className="badge">★ Trusted by 50,000+ learners worldwide</span>
          <h1 className="hero-title">
            Master New Skills
            <br />
            <span className="hero-title">with Expert-Led</span>
            <br />
            Courses
          </h1>
          <p className="hero-desc">
            Join thousands of professionals advancing their careers through our premium subscription-based learning platform. Access cutting-edge courses taught by industry experts.
          </p>

          <div className="hero-btns hero-btns--center">
            <button className="btn primary" onClick={handleStart}>Start Learning →</button>
          </div>

          <div className="stats">
            <div className="stat">
              <div className="num">50K+</div>
              <div className="label">Active Learners</div>
            </div>

            <div className="stat">
              <div className="num">200+</div>
              <div className="label">Expert Courses</div>
            </div>

            <div className="stat">
              <div className="num rate">4.8</div>
              <div className="label"><span className="stars">★★★★☆</span> Average Rating</div>
            </div>
          </div>
        </div>

        <div className="hero-visual" aria-hidden="true">
          <svg className="hero-image" viewBox="0 0 480 360" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style={{ stopColor: '#134E4A', stopOpacity: 1 }} />
                <stop offset="100%" style={{ stopColor: '#065F46', stopOpacity: 1 }} />
              </linearGradient>
            </defs>

            <rect width="480" height="360" rx="16" fill="url(#grad1)" />
            <path d="M 80 280 C 160 120, 320 120, 400 280" stroke="#34D399" strokeWidth="6" fill="none" strokeLinecap="round" opacity="0.5"/>
            <path d="M 120 280 Q 240 180, 360 280" stroke="white" strokeWidth="8" fill="none" strokeLinecap="round" />
            <circle cx="120" cy="280" r="12" fill="#FBBF24" />
            <circle cx="240" cy="219" r="12" fill="#FBBF24" />
            <circle cx="360" cy="280" r="12" fill="#FBBF24" />

            <text x="50%" y="45%" dominantBaseline="middle" textAnchor="middle" fill="white" fontSize="28" fontWeight="700" fontFamily="sans-serif">
              Your Path to Mastery
            </text>

            <text x="50%" y="58%" dominantBaseline="middle" textAnchor="middle" fill="#A7F3D0" fontSize="14" fontFamily="sans-serif">
              Starts Here
            </text>
          </svg>
        </div>
      </div>
    </section>
  );
};

export default Hero;
