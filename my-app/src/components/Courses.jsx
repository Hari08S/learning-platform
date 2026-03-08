import React, { useMemo, useState, useEffect } from 'react';
import '../styles/courses.css';
import fallbackCourses from '../data/coursesData'; // local fallback
import { Link } from 'react-router-dom';
import placeholder from '/logo.png';
import SEO from './SEO.jsx';

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
const sorts = ['Most Popular', 'Newest', 'Highest Rated', 'Price: Low to High', 'Price: High to Low'];

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000';

export default function Courses() {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All Categories');
  const [level, setLevel] = useState('All Levels');
  const [sortBy, setSortBy] = useState('Most Popular');

  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Pagination
  const [page, setPage] = useState(1);
  const itemsPerPage = 6;

  const [wishlist, setWishlist] = useState([]);

  useEffect(() => {
    let cancelled = false;
    async function fetchWishlist() {
      const token = localStorage.getItem('token');
      if (!token) return;
      try {
        const r = await fetch(`${API_BASE}/api/me/wishlist`, { headers: { Authorization: `Bearer ${token}` } });
        if (r.ok) {
          const d = await r.json();
          if (!cancelled) setWishlist(d.wishlist || []);
        }
      } catch (e) {
        // ignore
      }
    }
    fetchWishlist();
    return () => { cancelled = true; };
  }, []);

  const toggleWishlist = async (id) => {
    const token = localStorage.getItem('token');
    if (!token) return alert('Please log in to save to your wishlist.');

    // optimistically update
    setWishlist(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

    try {
      await fetch(`${API_BASE}/api/me/wishlist`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ courseId: id })
      });
    } catch (e) {
      console.error('Failed to update wishlist', e);
    }
  };

  useEffect(() => {
    let cancelled = false;

    async function loadCourses() {
      setLoading(true);
      try {
        const res = await fetch(`${API_BASE}/api/courses`);
        if (!res.ok) {
          console.warn('GET /api/courses failed', res.status);
          setCourses(fallbackCourses);
          return;
        }
        const data = await res.json();
        if (!cancelled) {
          if (Array.isArray(data.courses)) setCourses(data.courses);
          else if (Array.isArray(data)) setCourses(data);
          else setCourses(fallbackCourses);
        }
      } catch (err) {
        console.warn('Failed fetching courses from API, using fallback', err);
        if (!cancelled) {
          setCourses(fallbackCourses);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadCourses();
    return () => { cancelled = true; };
  }, []);

  // reset pagination when filters change
  useEffect(() => {
    setPage(1);
  }, [query, category, level, sortBy]);

  const filtered = useMemo(() => {
    const q = (query || '').trim().toLowerCase();
    let result = (courses || []).filter((c) => {
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

    // sorting
    result.sort((a, b) => {
      // Mock properties for sorting if missing
      const priceA = parseFloat(a.price) || 0;
      const priceB = parseFloat(b.price) || 0;
      const ratingA = parseFloat(a.rating) || 0;
      const ratingB = parseFloat(b.rating) || 0;
      const studentsA = a.students || 0;
      const studentsB = b.students || 0;

      if (sortBy === 'Price: Low to High') return priceA - priceB;
      if (sortBy === 'Price: High to Low') return priceB - priceA;
      if (sortBy === 'Highest Rated') return ratingB - ratingA;
      if (sortBy === 'Newest') return (b.createdAt ? new Date(b.createdAt) : 0) - (a.createdAt ? new Date(a.createdAt) : 0);

      // Most Popular
      return studentsB - studentsA;
    });

    return result;
  }, [query, category, level, sortBy, courses]);

  const displayedCourses = filtered.slice(0, page * itemsPerPage);

  return (
    <div className="courses-page">
      <SEO title="Courses" description="Browse our library of world-class courses designed to accelerate your career." />
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
                <select className="filter-select" value={level} onChange={(e) => setLevel(e.target.value)}>
                  {levels.map((l) => (
                    <option key={l} value={l}>{l}</option>
                  ))}
                </select>
              </div>
              <div className="filter-item">
                <select className="filter-select" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                  {sorts.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="category-pills" style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: 16, width: '100%' }}>
              {categories.map((c) => (
                <button
                  key={c}
                  className={`pill-btn ${category === c ? 'active' : ''}`}
                  onClick={() => setCategory(c)}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div className="results-meta">
            {loading ? 'Loading courses...' : `Showing ${filtered.length} course${filtered.length !== 1 ? 's' : ''}`}
          </div>
        </div>
      </div>

      <div className="container courses-grid-wrap">
        <div className="courses-grid">
          {displayedCourses.map((c, idx) => {
            const courseId = c._id || c.id;
            const isWishlisted = wishlist.includes(courseId);
            // Mocking free preview randomly on every 3rd course for UI demo
            const hasFreePreview = c.price === '0' || c.price === 0 || idx % 3 === 0;

            return (
              <article className="course-card" key={courseId}>
                <div className="card-media" style={{ backgroundImage: `url(${c.img || placeholder})` }}>
                  {hasFreePreview && <div className="card-free-preview-badge">Free Preview</div>}
                  <div className="card-tag">{c.tag}</div>
                  <div className="card-rating">★ {c.rating}</div>
                  <button
                    className={`card-wishlist-btn ${isWishlisted ? 'active' : ''}`}
                    onClick={(e) => { e.preventDefault(); toggleWishlist(courseId); }}
                    aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
                  >
                    {isWishlisted ? '♥' : '♡'}
                  </button>
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
                      <div className="price">{c.price === 0 || c.price === '0' ? 'Free' : `₹${c.price}`}</div>
                      <div className="trial">Start learning today</div>
                    </div>
                    <Link to={`/courses/${courseId}`} className="btn course-btn">
                      View Details
                    </Link>
                  </div>
                </div>
              </article>
            );
          })}

          {!loading && filtered.length === 0 && <div className="no-results">No courses matched your search.</div>}
        </div>

        {page * itemsPerPage < filtered.length && (
          <div style={{ textAlign: 'center', marginTop: '40px' }}>
            <button className="btn outline" onClick={() => setPage(page + 1)}>
              Load More Courses
            </button>
          </div>
        )}
      </div>

      <div className="container footer-spacer" />
    </div>
  );
}
