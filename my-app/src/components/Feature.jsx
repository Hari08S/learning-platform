import React from 'react';

const Feature = () => {
  const items = [
    { t: 'Expert-Led Courses', d: 'Learn from industry leaders with real-world experience.', i: '👨‍🏫', c: '#FF6B6B' },
    { t: 'Flexible Learning', d: 'Learn at your own pace anytime, anywhere.', i: '📱', c: '#4ECDC4' },
    { t: 'Career Acceleration', d: 'Portfolio projects & certificates to boost your profile.', i: '🚀', c: '#45B7D1' },
    { t: 'Community Support', d: 'Get help from a global network of learners & experts.', i: '👥', c: '#F9CA24' }
  ];

  return (
    <section className="features">
      <div className="container">
        <h2 className="title">Why Choose UPWISE?</h2>
        <p className="subtitle">Transform your career with our platform trusted worldwide.</p>

        <div className="grid">
          {items.map((f, i) => (
            <div className="card" key={i}>
              <div className="icon" style={{ background: f.c }}>{f.i}</div>
              <h3>{f.t}</h3>
              <p>{f.d}</p>
              <button className="btn outline small">Learn More</button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Feature;
