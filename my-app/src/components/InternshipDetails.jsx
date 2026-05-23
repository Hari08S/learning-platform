import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import '../styles/courses.css'; // Leverage existing CSS grid layout
import useStore from '../store';
import toast, { Toaster } from 'react-hot-toast';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000';

export default function InternshipDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const internshipEnrollments = useStore(state => state.internshipEnrollments);
    const setInternshipEnrollments = useStore(state => state.setInternshipEnrollments);
    const isLoggedIn = useStore(state => state.isLoggedIn);

    const [internship, setInternship] = useState(null);
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState('overview');
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [paymentCountdown, setPaymentCountdown] = useState(null);

    useEffect(() => {
        let cancelled = false;
        async function fetchInternship() {
            try {
                const res = await fetch(`${API_BASE}/api/internships/${id}`);
                if (!res.ok) throw new Error('Not found');
                const data = await res.json();
                if (!cancelled) setInternship(data.internship);
            } catch (err) {
                toast.error('Failed to load internship details');
            } finally {
                if (!cancelled) setLoading(false);
            }
        }
        fetchInternship();
        return () => { cancelled = true; };
    }, [id]);

    if (loading) return <div className="container" style={{ padding: 48 }}>Loading details...</div>;
    if (!internship) return <div className="container" style={{ padding: 48 }}>Not found.</div>;

    const resolveImage = (imgSrc) => {
        if (!imgSrc || typeof imgSrc !== 'string') return '/logo.png';
        if (imgSrc.startsWith('http') || imgSrc.startsWith('/')) return imgSrc;
        return `/${imgSrc}`;
    };

    const isEnrolled = internshipEnrollments && internshipEnrollments.includes(internship._id);
    const heroImg = resolveImage(internship.thumbnail);

    const handleApply = async () => {
        if (isProcessing) return;
        setIsProcessing(true);
        setPaymentCountdown(5);

        let count = 5;
        const timer = setInterval(async () => {
            count -= 1;
            setPaymentCountdown(count);
            if (count <= 0) {
                clearInterval(timer);
                setPaymentCountdown(null);
                await executeEnrollment();
            }
        }, 1000);
    };

    const executeEnrollment = async () => {
        const token = localStorage.getItem('token');

        try {
            const res = await fetch(`${API_BASE}/api/user/internships/${internship._id}/apply`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` }
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || 'Payment/Application failed');
            }

            toast.success('🎉 Payment Successful! Internship unlocked.');
            if (setInternshipEnrollments) {
                setInternshipEnrollments([...(internshipEnrollments || []), internship._id]);
            }
            setShowConfirmModal(false);

            setTimeout(() => {
                navigate(`/internships/${internship._id}/portal`);
            }, 1500);

        } catch (err) {
            toast.error(err.message);
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="container course-detail-page" style={{ padding: "28px 24px 80px" }}>
            <Toaster position="top-center" />
            <button className="btn outline" onClick={() => navigate('/internships')} style={{ marginBottom: 18 }}>
                ← Back to Internships
            </button>

            <div className="detail-grid">
                <div className="detail-main">
                    {/* Hero Banner Header */}
                    <div className="detail-hero">
                        <img
                            src={heroImg}
                            alt={internship.title}
                            className="detail-hero-img"
                            onError={(e) => { e.target.src = '/logo.png'; }}
                        />
                        <div className="hero-overlay">
                            <div className="hero-tag" style={{ textTransform: 'uppercase' }}>{internship.domain}</div>
                            <h1 className="detail-title">{internship.title}</h1>
                            <div className="detail-author">at {internship.company || 'Upwise Hosted'}</div>
                        </div>
                    </div>

                    <div className="detail-stats">
                        <div className="stat">📍 {internship.mode}</div>
                        <div className="stat">⏱ {internship.duration}</div>
                        <div className="stat">💰 {internship.stipend || 'Unpaid'}</div>
                        <div className="stat">📝 {(internship.tasks || []).length} Milestones</div>
                    </div>

                    {/* TABS Navigation */}
                    <div className="tabs">
                        <button className={`tab ${tab === "overview" ? "active" : ""}`} onClick={() => setTab("overview")}>Overview</button>
                        <button className={`tab ${tab === "tasks" ? "active" : ""}`} onClick={() => setTab("tasks")}>Milestones / Tasks</button>
                        <button className={`tab ${tab === "mentor" ? "active" : ""}`} onClick={() => setTab("mentor")}>Mentor</button>
                    </div>

                    {/* TABS Content */}
                    <div className="tab-panel">
                        {tab === "overview" && (
                            <>
                                <h2>Program Description</h2>
                                <p className="lead" style={{ whiteSpace: 'pre-line' }}>{internship.description}</p>

                                {internship.skills && internship.skills.length > 0 && (
                                    <>
                                        <h3>Required & Gained Skills</h3>
                                        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '12px' }}>
                                            {internship.skills.map((s, idx) => (
                                                <div key={idx} style={{ padding: '6px 12px', background: 'var(--surface-hover)', borderRadius: '20px', fontSize: '14px', fontWeight: 500, color: 'var(--text)' }}>
                                                    {s}
                                                </div>
                                            ))}
                                        </div>
                                    </>
                                )}
                            </>
                        )}

                        {tab === "tasks" && (
                            <>
                                <h2>Timeline & Milestones</h2>
                                <div className="curriculum">
                                    {(internship.tasks || []).length === 0 ? (
                                        <p style={{ color: 'var(--muted)' }}>No tasks defined yet.</p>
                                    ) : (
                                        (internship.tasks || []).map((t, i) => (
                                            <div className="curriculum-item" key={i}>
                                                <div className="num" style={{ background: '#10b981', color: 'white' }}>{i + 1}</div>
                                                <div className="curriculum-body">
                                                    <div className="curriculum-title">{t.title}</div>
                                                    <div className="curriculum-meta">
                                                        Due in {t.dueInDays} days
                                                        <span className="preview" style={{ marginLeft: 8 }}>Task submission available in portal</span>
                                                    </div>
                                                    <div style={{ fontSize: '14px', color: 'var(--muted)', marginTop: '4px' }}>{t.description}</div>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </>
                        )}

                        {tab === "mentor" && (
                            <>
                                <h2>Your Mentor</h2>
                                <div className="instructor-card">
                                    <div className="avatar" style={{ backgroundImage: `url(${internship.mentorAvatar || ''})`, backgroundSize: 'cover' }}>
                                        {!internship.mentorAvatar && (internship.mentorName?.[0] || 'M')}
                                    </div>
                                    <div>
                                        <div className="instr-name">{internship.mentorName || 'Assigned soon'}</div>
                                        <div className="instr-bio" style={{ marginTop: '8px' }}>
                                            {internship.mentorBio || 'Expert mentor selected from top tech companies to guide you through your journey.'}
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* Sidebar */}
                <aside className="detail-sidebar">
                    <div className="price-card">
                        <div className="price">₹149</div>
                        <div className="trial">Enrollment Process Fee</div>

                        {isEnrolled ? (
                            <button className="btn primary" style={{ background: "#7C3AED", width: "100%", marginTop: 18 }} onClick={() => navigate(`/internships/${internship._id}/portal`)}>
                                Continue Internship ✓
                            </button>
                        ) : (
                            <button
                                className="btn primary"
                                style={{ width: "100%", marginTop: 18, background: '#10b981' }}
                                onClick={() => {
                                    if (!isLoggedIn) {
                                        navigate('/login');
                                    } else {
                                        setShowConfirmModal(true);
                                    }
                                }}
                            >
                                Apply & Pay
                            </button>
                        )}

                        <hr style={{ margin: "20px 0" }} />
                        <h4>What this program includes:</h4>
                        <ul className="includes-list">
                            <li>Real-world project tasks</li>
                            <li>Dedicated mentor guidance</li>
                            <li>Verified Experience Certificate</li>
                            <li>Lifetime access to resources</li>
                        </ul>
                    </div>
                </aside>
            </div>

            {/* Confirmation Modal */}
            {showConfirmModal && (
                <div className="modal-backdrop" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                    <div className="modal" style={{ background: 'var(--bg)', padding: '30px', borderRadius: '12px', width: '400px', maxWidth: '90%' }}>
                        <h2 style={{ marginBottom: '16px' }}>Confirm Enrollment</h2>
                        <p style={{ color: 'var(--text)', marginBottom: '8px' }}>You are applying for:</p>
                        <h3 style={{ marginBottom: '16px', color: 'var(--text)' }}>{internship.title} @ {internship.company || 'Upwise'}</h3>

                        <div style={{ background: 'var(--surface-hover)', padding: '16px', borderRadius: '8px', marginBottom: '24px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', color: 'var(--muted)' }}>
                                <span>Program Fee</span>
                                <span>₹149</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text)', fontWeight: 'bold' }}>
                                <span>Total Due</span>
                                <span>₹149</span>
                            </div>
                        </div>

                        {paymentCountdown !== null && (
                            <div style={{
                                marginBottom: 20,
                                padding: '10px 14px',
                                background: 'linear-gradient(135deg, #065F46, #059669)',
                                borderRadius: 10,
                                color: '#fff',
                                fontSize: 13,
                                textAlign: 'center',
                                fontWeight: 600,
                            }}>
                                🔒 Simulating secure payment...<br />
                                <span style={{ fontSize: 22, fontWeight: 800 }}>{paymentCountdown}</span>
                                <span style={{ fontSize: 12, opacity: 0.8 }}> seconds</span>
                            </div>
                        )}

                        <div style={{ display: 'flex', gap: '12px' }}>
                            <button className="btn outline" style={{ flex: 1 }} onClick={() => setShowConfirmModal(false)} disabled={isProcessing}>
                                Cancel
                            </button>
                            <button className="btn primary" style={{ flex: 1, background: '#10b981' }} onClick={handleApply} disabled={isProcessing}>
                                {paymentCountdown !== null ? `⏳ Simulating (${paymentCountdown}s)...` : isProcessing ? 'Processing...' : 'Pay & Start'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
