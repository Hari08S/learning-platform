import React, { useMemo, useState, useEffect } from 'react';
import '../styles/courses.css'; // Reusing the same styling grid
import { Link, useNavigate } from 'react-router-dom';
import placeholder from '/logo.png';
import SEO from './SEO.jsx';
import useStore from '../store';

const domains = ['All', 'tech', 'marketing', 'design', 'finance', 'other'];
const modes = ['All', 'Remote', 'Hybrid', 'On-site'];

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000';

export default function InternshipsList() {
    const [domain, setDomain] = useState('All');
    const [mode, setMode] = useState('All');
    const [internships, setInternships] = useState([]);
    const [loading, setLoading] = useState(true);

    const internshipEnrollments = useStore(state => state.internshipEnrollments);
    const setInternshipEnrollments = useStore(state => state.setInternshipEnrollments);
    const isLoggedIn = useStore(state => state.isLoggedIn);
    const navigate = useNavigate();

    // Fetch Internships List
    useEffect(() => {
        let cancelled = false;

        async function loadInternships() {
            setLoading(true);
            try {
                const queryParams = new URLSearchParams();
                if (domain !== 'All') queryParams.append('domain', domain);
                if (mode !== 'All') queryParams.append('mode', mode);

                const res = await fetch(`${API_BASE}/api/internships?${queryParams.toString()}`);
                if (!res.ok) throw new Error('Fetch failed');

                const data = await res.json();
                if (!cancelled) setInternships(data.internships || []);
            } catch (err) {
                console.warn('Failed fetching internships', err);
                if (!cancelled) setInternships([]);
            } finally {
                if (!cancelled) setLoading(false);
            }
        }

        loadInternships();
        return () => { cancelled = true; };
    }, [domain, mode]);

    // Fetch Enrollments (if logged in)
    useEffect(() => {
        let cancelled = false;

        async function fetchEnrollments() {
            if (!isLoggedIn) return;

            const token = localStorage.getItem('token');
            try {
                const res = await fetch(`${API_BASE}/api/user/internships/my`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    // Extract just the internship IDs that the user is enrolled in
                    const enrolledIds = data.applications.map(app =>
                        typeof app.internshipId === 'object' ? app.internshipId._id : app.internshipId
                    );
                    if (!cancelled && setInternshipEnrollments) {
                        setInternshipEnrollments(enrolledIds);
                    }
                }
            } catch (e) {
                console.warn('Failed to fetch user enrollments', e);
            }
        }

        fetchEnrollments();
        return () => { cancelled = true; };
    }, [isLoggedIn, setInternshipEnrollments]);

    return (
        <div className="courses-page">
            <SEO title="Internship Programs" description="Real-world internship opportunities with mentor guidance and verified certificates." />
            <div className="courses-hero">
                <div className="container">
                    <h1 className="courses-title">
                        <span className="bold">Internship</span> Programs
                    </h1>
                    <p className="courses-sub">Apply your skills to real-world projects, get mentored by experts, and kickstart your career.</p>

                    <div className="courses-controls">
                        <div className="filters">
                            <div className="filter-item">
                                <select className="filter-select" value={domain} onChange={(e) => setDomain(e.target.value)}>
                                    {domains.map((d) => (
                                        <option key={d} value={d}>
                                            {d === 'All' ? 'All Domains' : d.charAt(0).toUpperCase() + d.slice(1)}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="filter-item">
                                <select className="filter-select" value={mode} onChange={(e) => setMode(e.target.value)}>
                                    {modes.map((m) => (
                                        <option key={m} value={m}>{m}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="results-meta">
                        {loading ? 'Loading internships...' : `Showing ${internships.length} internship${internships.length !== 1 ? 's' : ''}`}
                    </div>
                </div>
            </div>

            <div className="container courses-grid-wrap">
                <div className="courses-grid">
                    {internships.map((internship) => {
                        const isEnrolled = internshipEnrollments && internshipEnrollments.includes(internship._id);

                        return (
                            <article className="course-card" key={internship._id}>
                                <div className="card-media">
                                    <img
                                        src={internship.thumbnail || placeholder}
                                        alt={internship.title}
                                        onError={(e) => { e.target.src = placeholder; }}
                                        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                                    />
                                    {isEnrolled && <div className="card-free-preview-badge" style={{ background: '#10b981', color: '#fff' }}>Enrolled</div>}
                                    <div className="card-tag" style={{ textTransform: 'capitalize' }}>{internship.domain}</div>
                                </div>

                                <div className="card-body">
                                    <h3 className="card-title">{internship.title}</h3>
                                    <p className="card-author">at <span>{internship.company || 'Upwise Hosted'}</span></p>

                                    <div className="card-meta" style={{ gap: '8px', flexWrap: 'wrap' }}>
                                        <div className="meta-item">⏱ {internship.duration}</div>
                                        <div className="level-badge" style={{ background: 'var(--surface-hover)', color: 'var(--text)' }}>{internship.mode}</div>
                                    </div>

                                    <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '8px', fontWeight: 600 }}>
                                        Stipend: <span style={{ color: 'var(--text)' }}>{internship.stipend || 'Unpaid'}</span>
                                    </div>

                                    <div className="card-bottom" style={{ marginTop: '16px' }}>
                                        <div>
                                            <div className="price">{internship.fee === 0 ? 'Free' : `₹${internship.fee}`}</div>
                                            <div className="trial">Enrollment Fee</div>
                                        </div>

                                        {isEnrolled ? (
                                            <Link to={`/internships/${internship._id}/portal`} className="btn course-btn" style={{ background: '#10b981', color: 'white' }}>
                                                Go to Portal
                                            </Link>
                                        ) : (
                                            <button
                                                onClick={() => isLoggedIn ? navigate(`/internships/${internship._id}`) : navigate('/login')}
                                                className="btn course-btn"
                                            >
                                                Apply Now
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </article>
                        );
                    })}

                    {!loading && internships.length === 0 && <div className="no-results">No internships matched your filters.</div>}
                </div>
            </div>

            <div className="container footer-spacer" />
        </div>
    );
}
