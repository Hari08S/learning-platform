// src/components/Feature.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Smart Info Panel shown when user clicks "Learn More"
 * Each card (expert / flexible / career / community) gets its own interactive content.
 */
function FeaturePanel({ kind, onClose }) {
  const navigate = useNavigate();
  const [hoursPerWeek, setHoursPerWeek] = useState(null);
  const [timePref, setTimePref] = useState('');
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';

  if (!kind) return null;

  let title = '';
  let subtitle = '';
  let chip = '';
  let bodyContent = null;
  let primaryLabel = '';
  let primaryAction = () => {};
  let secondaryLabel = 'Close';

  if (kind === 'expert') {
    title = 'Learn from Real-World Experts';
    subtitle = 'See who you could be learning from when you join UPWISE.';
    chip = 'Expert-Led Track';

    bodyContent = (
      <>
        <div className="feature-panel-mini-grid">
          <div className="feature-panel-card">
            <div className="feature-panel-card-title">Priya Sharma</div>
            <div className="feature-panel-card-sub">Senior Frontend Engineer · ex-Google</div>
            <p className="feature-panel-card-body">
              Teaches: React JS, Modern JavaScript, Frontend Interview Prep.
            </p>
          </div>
          <div className="feature-panel-card">
            <div className="feature-panel-card-title">Rahul Kapoor</div>
            <div className="feature-panel-card-sub">Digital Marketing Lead · SaaS Startup</div>
            <p className="feature-panel-card-body">
              Teaches: Performance Marketing, SEO + SEM, Growth Funnels.
            </p>
          </div>
          <div className="feature-panel-card">
            <div className="feature-panel-card-title">Ananya Desai</div>
            <div className="feature-panel-card-sub">UX Consultant · Worked with 20+ brands</div>
            <p className="feature-panel-card-body">
              Teaches: UI/UX Design, Portfolio Building, Case Study Storytelling.
            </p>
          </div>
        </div>
        <p className="feature-panel-note">
          Just like Coursera or GeeksforGeeks, our courses are taught by practitioners — but with a
          focus on small, project-based lessons you can apply immediately at work.
        </p>
      </>
    );

    primaryLabel = 'Browse Expert Courses';
    primaryAction = () => navigate('/courses');
  }

  if (kind === 'flexible') {
    title = 'Build Your Weekly Learning Plan';
    subtitle = 'Tell us how much time you have. We’ll show how quickly you can complete a course.';
    chip = 'Flexible Learning';

    const planReady = hoursPerWeek && timePref;

    const estimateWeeks = () => {
      const h = Number(hoursPerWeek || 0);
      if (!h) return null;
      // assume ~12 hours of focused content for a typical course
      const weeks = Math.ceil(12 / h);
      return weeks;
    };

    bodyContent = (
      <>
        <div className="feature-panel-wizard">
          <div className="wizard-block">
            <div className="wizard-label">1. How many hours per week can you learn?</div>
            <div className="wizard-options">
              {[2, 4, 6, 8].map(h => (
                <button
                  key={h}
                  className={
                    'wizard-option' + (hoursPerWeek === h ? ' wizard-option--active' : '')
                  }
                  type="button"
                  onClick={() => setHoursPerWeek(h)}
                >
                  {h}h / week
                </button>
              ))}
            </div>
          </div>

          <div className="wizard-block">
            <div className="wizard-label">2. When do you prefer learning?</div>
            <div className="wizard-options">
              {['Morning', 'Evening', 'Weekends'].map(t => (
                <button
                  key={t}
                  className={
                    'wizard-option' + (timePref === t ? ' wizard-option--active' : '')
                  }
                  type="button"
                  onClick={() => setTimePref(t)}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="wizard-summary">
          {planReady ? (
            <>
              <div className="wizard-summary-title">Your personalised plan</div>
              <p className="wizard-summary-text">
                With <strong>{hoursPerWeek} hours per week</strong> of <strong>{timePref.toLowerCase()}</strong> learning,
                you can comfortably finish a typical UPWISE course in about{' '}
                <strong>{estimateWeeks()} week(s)</strong>.
              </p>
              <p className="wizard-summary-text">
                We’ll use this plan to recommend courses that actually fit your schedule — so you don’t feel overwhelmed.
              </p>
            </>
          ) : (
            <p className="wizard-summary-placeholder">
              Choose your weekly hours and preferred time to see a realistic completion estimate.
            </p>
          )}
        </div>
      </>
    );

    primaryLabel = 'Find Courses For My Plan';
    primaryAction = () => navigate('/courses');
  }

  if (kind === 'career') {
    title = 'Your Career Acceleration Roadmap';
    subtitle = 'Understand how UPWISE takes you from beginner to job-ready.';
    chip = 'CAREER FAST-TRACK';
  
    bodyContent = (
      <>
        <div className="career-roadmap-fixed">
          {[
            {
              n: 1,
              title: "Pick a Skill Track",
              text: "Choose from React, Digital Marketing, UI/UX, and more."
            },
            {
              n: 2,
              title: "Build Portfolio Projects",
              text: "Each course includes hands-on projects you can add to your resume."
            },
            {
              n: 3,
              title: "Earn Shareable Certificates",
              text: "Download certificates from your dashboard and attach them to LinkedIn."
            },
            {
              n: 4,
              title: "Showcase Skills & Apply",
              text: "Use your projects + certificates to stand out for internships and jobs."
            }
          ].map(step => (
            <div key={step.n} className="career-step">
              <div className="career-step-number">{step.n}</div>
              <div className="career-step-content">
                <div className="career-step-title">{step.title}</div>
                <div className="career-step-text">{step.text}</div>
              </div>
            </div>
          ))}
        </div>
  
        <p className="career-note">
          Unlike many platforms that stop at video lessons, UPWISE focuses on
          <strong> portfolio-ready work</strong> and certificates you can actually share with hiring managers.
        </p>
      </>
    );
  
    primaryLabel = isLoggedIn ? 'Open My Dashboard' : 'Start with a Free Account';
    primaryAction = () => navigate(isLoggedIn ? '/dashboard' : '/signup');
  }
  

  if (kind === 'community') {
    title = 'Never Learn Alone Again';
    subtitle = 'Stay motivated with support from mentors and peers.';
    chip = 'Community Support';

    bodyContent = (
      <>
        <div className="feature-panel-mini-grid">
          <div className="feature-panel-card">
            <div className="feature-panel-card-title">Ask Questions Anytime</div>
            <p className="feature-panel-card-body">
              Stuck on a concept? Reach out to the support team or future community spaces for help.
            </p>
          </div>
          <div className="feature-panel-card">
            <div className="feature-panel-card-title">Peer Learning (coming soon)</div>
            <p className="feature-panel-card-body">
              We’re building discussion spaces similar to GFG & Coursera forums — tailored for UPWISE learners.
            </p>
          </div>
          <div className="feature-panel-card">
            <div className="feature-panel-card-title">Direct Email Support</div>
            <p className="feature-panel-card-body">
              For queries, you can always write to{' '}
              <strong>harisuresh@fusiondiaries.com</strong> and get personalised help.
            </p>
          </div>
        </div>

        <p className="feature-panel-note">
          Learning online shouldn’t feel lonely. UPWISE is focused on building a support layer around your courses — not just videos.
        </p>
      </>
    );

    primaryLabel = 'Contact Support';
    primaryAction = () => {
      window.location.href = 'mailto:harisuresh@fusiondiaries.com?subject=UPWISE%20Support%20Query';
    };
  }

  return (
    <div className="feature-panel-backdrop" onClick={onClose}>
      <div
        className="feature-panel"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="feature-panel-header">
          <div>
            {chip && <span className="feature-chip">{chip}</span>}
            <h3 className="feature-panel-title">{title}</h3>
            <p className="feature-panel-subtitle">{subtitle}</p>
          </div>
          <button
            type="button"
            className="feature-panel-close"
            onClick={onClose}
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <div className="feature-panel-body">
          {bodyContent}
        </div>

        <div className="feature-panel-footer">
          {primaryLabel && (
            <button
              type="button"
              className="btn primary"
              onClick={primaryAction}
            >
              {primaryLabel}
            </button>
          )}
          <button
            type="button"
            className="btn outline small"
            onClick={onClose}
          >
            {secondaryLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

const Feature = () => {
  const [panelKind, setPanelKind] = useState(null);

  const items = [
    {
      t: 'Expert-Led Courses',
      d: 'Learn from industry leaders with real-world experience.',
      i: '👨‍🏫',
      c: '#FF6B6B',
      key: 'expert'
    },
    {
      t: 'Flexible Learning',
      d: 'Learn at your own pace anytime, anywhere.',
      i: '📱',
      c: '#4ECDC4',
      key: 'flexible'
    },
    {
      t: 'Career Acceleration',
      d: 'Portfolio projects & certificates to boost your profile.',
      i: '🚀',
      c: '#45B7D1',
      key: 'career'
    },
    {
      t: 'Community Support',
      d: 'Get help from a global network of learners & experts.',
      i: '👥',
      c: '#F9CA24',
      key: 'community'
    }
  ];

  return (
    <section className="features">
      <div className="container">
        <h2 className="title">Why Choose UPWISE?</h2>
        <p className="subtitle">Transform your career with our platform trusted worldwide.</p>

        <div className="grid">
          {items.map((f) => (
            <div className="card" key={f.key}>
              <div className="icon" style={{ background: f.c }}>{f.i}</div>
              <h3>{f.t}</h3>
              <p>{f.d}</p>
              <button
                className="btn outline small"
                type="button"
                onClick={() => setPanelKind(f.key)}
              >
                Learn More
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Smart info panel overlay */}
      <FeaturePanel kind={panelKind} onClose={() => setPanelKind(null)} />
    </section>
  );
};

export default Feature;
