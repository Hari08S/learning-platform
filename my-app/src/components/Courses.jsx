// src/components/Courses.jsx
import React, { useMemo, useState, useEffect } from 'react';
import '../styles/courses.css';
import fallbackCourses from '../data/coursesData'; // local fallback
import { Link } from 'react-router-dom';
import placeholder from '/logo.png';

const categories = [
  'All Categories',
  'Technology',
  'Business',
  'Design',
  'Marketing',
  'Finance',
  'Health',
  'Language',
  'Arts'
];

const levels = ['All Levels', 'Beginner', 'Intermediate', 'Advanced'];

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000';

export default function Courses() {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All Categories');
  const [level, setLevel] = useState('All Levels');

  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadErr, setLoadErr] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function loadCourses() {
      setLoading(true);
      setLoadErr('');
      try {
        const res = await fetch(`${API_BASE}/api/courses`);
        if (!res.ok) {
          // fallback to local data if server unavailable
          console.warn('GET /api/courses failed', res.status);
          setCourses(fallbackCourses);
          return;
        }
        // API returns JSON like { courses: [...] }
        const data = await res.json();
        if (!cancelled) {
          if (Array.isArray(data.courses)) setCourses(data.courses);
          else if (Array.isArray(data)) setCourses(data); // fallbacks
          else setCourses(fallbackCourses);
        }
      } catch (err) {
        console.warn('Failed fetching courses from API, using fallback', err);
        if (!cancelled) {
          setLoadErr('Could not load courses from server — using local data.');
          setCourses(fallbackCourses);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadCourses();
    return () => { cancelled = true; };
  }, []);

  const filtered = useMemo(() => {
    const q = (query || '').trim().toLowerCase();
    return (courses || []).filter((c) => {
      if (q) {
        const found =
          (c.title || '').toString().toLowerCase().includes(q) ||
          (c.author || '').toString().toLowerCase().includes(q) ||
          ((c.tag || '')).toString().toLowerCase().includes(q);
        if (!found) return false;
      }

      if (category !== 'All Categories') {
        const tag = (c.tag || '').toString().toLowerCase();
        if (!tag.includes(category.toLowerCase())) return false;
      }
      if (level !== 'All Levels') {
        if (!((c.level || '').toString().toLowerCase().includes(level.toLowerCase()))) return false;
      }
      return true;
    });
  }, [query, category, level, courses]);

  return (
    <div className="courses-page">
      <div className="courses-hero">
        <div className="container">
          <h1 className="courses-title">
            <span className="bold">All</span> Courses
          </h1>
          <p className="courses-sub">Discover world-class courses from expert instructors. Start your learning journey today!</p>

          <div className="courses-controls">
            <div className="search-wrap">
              <input
                className="course-search"
                placeholder="Search courses or instructors..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>

            <div className="filters">
              <div className="filter-item">
                <select className="filter-select" value={category} onChange={(e) => setCategory(e.target.value)}>
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div className="filter-item">
                <select className="filter-select" value={level} onChange={(e) => setLevel(e.target.value)}>
                  {levels.map((l) => (
                    <option key={l} value={l}>
                      {l}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="results-meta">
            {loading ? 'Loading courses...' : `Showing ${filtered.length} course${filtered.length !== 1 ? 's' : ''}`}
          </div>
          {loadErr && <div style={{ color: '#b91c1c', marginTop: 8 }}>{loadErr}</div>}
        </div>
      </div>

      <div className="container courses-grid-wrap">
        <div className="courses-grid">
          {filtered.map((c) => (
            <article className="course-card" key={c._id || c.id}>
              <div className="card-media" style={{ backgroundImage: `url(${c.img || placeholder})` }}>
                <div className="card-tag">{c.tag}</div>
                <div className="card-rating">★ {c.rating}</div>
              </div>

              <div className="card-body">
                <h3 className="card-title">{c.title}</h3>
                <p className="card-author">by <span>{c.author}</span></p>

                <div className="card-meta">
                  <div className="meta-item">⏱ {c.hours}</div>
                  <div className="meta-item">👥 {(c.students || 0).toLocaleString()}</div>
                  <div className={`level-badge ${c.level}`}>{c.level}</div>
                </div>

                <div className="card-bottom">
                  <div>
                    <div className="price">{c.price}/month</div>
                    <div className="trial">3-day free trial</div>
                  </div>
                  <Link to={`/courses/${c._id || c.id}`} className="btn course-btn">
                    View Details
                  </Link>
                </div>
              </div>
            </article>
          ))}

          {!loading && filtered.length === 0 && <div className="no-results">No courses matched your search.</div>}
        </div>
      </div>

      <div className="container footer-spacer" />
    </div>
  );
}
