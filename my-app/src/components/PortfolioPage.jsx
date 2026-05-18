import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import LoadingSpinner from './LoadingSpinner';
import SEO from './SEO';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000';

export default function PortfolioPage() {
    const { username } = useParams();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        async function fetchPortfolio() {
            try {
                const res = await fetch(`${API_BASE}/api/portfolio/${username}`);
                if (!res.ok) throw new Error('Portfolio not found');
                const pData = await res.json();
                setData(pData);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }
        fetchPortfolio();
    }, [username]);

    const handleShare = () => {
        navigator.clipboard.writeText(window.location.href);
        alert('Portfolio link copied to clipboard!');
    };

    if (loading) return <LoadingSpinner fullScreen />;
    if (error) return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: '20px' }}>
            <div style={{ fontSize: '80px' }}>🔍</div>
            <h2 style={{ color: 'var(--upwise-dark)', fontWeight: 800 }}>Portfolio Not Found</h2>
            <p style={{ color: 'var(--muted)' }}>We couldn't find a portfolio for "{username}".</p>
            <Link to="/" className="btn outline">Return to Home</Link>
        </div>
    );

    return (
        <div className="portfolio-bg" style={{ background: 'var(--bg-light)', minHeight: '100vh', padding: '40px 20px' }}>
            <SEO title={`${data.name}'s Portfolio | UPWISE`} description={`Checkout ${data.name}'s verified learning journey and certificates on Upwise!`} />

            <div className="portfolio-container" style={{ maxWidth: '1000px', margin: '0 auto' }}>

                {/* HERO HEADER SECTION */}
                <div style={{
                    background: 'linear-gradient(135deg, var(--upwise-dark) 0%, var(--upwise-mid) 100%)',
                    borderRadius: '24px',
                    padding: '60px 40px',
                    textAlign: 'center',
                    color: '#fff',
                    position: 'relative',
                    overflow: 'hidden',
                    boxShadow: '0 20px 40px rgba(6, 95, 70, 0.2)',
                    marginBottom: '40px'
                }}>
                    {/* Decorative Circle */}
                    <div style={{ position: 'absolute', top: '-50px', right: '-50px', width: '200px', height: '200px', background: 'rgba(255,255,255,0.05)', borderRadius: '50%' }} />
                    <div style={{ position: 'absolute', bottom: '-20px', left: '10%', width: '100px', height: '100px', background: 'rgba(52, 211, 153, 0.1)', borderRadius: '50%' }} />

                    <div style={{
                        width: '120px',
                        height: '120px',
                        borderRadius: '50%',
                        border: '5px solid rgba(255,255,255,0.2)',
                        background: '#fff',
                        color: 'var(--upwise-dark)',
                        fontSize: '48px',
                        fontWeight: 900,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 24px',
                        boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
                    }}>
                        {data.avatar ? <img src={data.avatar} alt={data.name} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} /> : data.name.charAt(0).toUpperCase()}
                    </div>

                    <h1 style={{ fontSize: '36px', fontWeight: 900, marginBottom: '8px', letterSpacing: '-0.5px' }}>{data.name}</h1>
                    <p style={{ opacity: 0.8, fontSize: '18px', marginBottom: '32px' }}>Member since {new Date(data.joinDate).getFullYear()}</p>

                    <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
                        <div style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(5px)', padding: '10px 24px', borderRadius: '30px', fontWeight: 700, border: '1px solid rgba(255,255,255,0.2)' }}>
                            LEVEL {data.level}
                        </div>
                        <div style={{ background: 'var(--accent)', color: 'var(--upwise-dark)', padding: '10px 24px', borderRadius: '30px', fontWeight: 800 }}>
                            {data.xp} XP
                        </div>
                        <div style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(5px)', padding: '10px 24px', borderRadius: '30px', fontWeight: 700, border: '1px solid rgba(255,255,255,0.2)' }}>
                            🔥 {data.streakDays} Day Streak
                        </div>
                    </div>

                    <button className="btn" style={{
                        marginTop: '40px',
                        padding: '12px 30px',
                        background: '#fff',
                        color: 'var(--upwise-dark)',
                        border: 'none',
                        borderRadius: '12px',
                        fontWeight: 800,
                        cursor: 'pointer',
                        transition: 'transform 0.2s',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                    }} onClick={handleShare}>
                        Share Portfolio 🔗
                    </button>
                </div>

                {/* STATS TILES SECTION */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', marginBottom: '48px' }}>
                    <div className="stat-card" style={{ background: '#fff', padding: '32px', borderRadius: '20px', boxShadow: '0 10px 30px rgba(0,0,0,0.03)', border: '1px solid #edf2f7', textAlign: 'center' }}>
                        <div style={{ fontSize: '40px', marginBottom: '12px' }}>📚</div>
                        <h3 style={{ fontSize: '36px', fontWeight: 900, color: 'var(--upwise-dark)', margin: '0' }}>{data.completedCourses}</h3>
                        <p style={{ color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase', fontSize: '14px', letterSpacing: '1px', marginTop: '8px' }}>Completed Courses</p>
                    </div>
                    <div className="stat-card" style={{ background: '#fff', padding: '32px', borderRadius: '20px', boxShadow: '0 10px 30px rgba(0,0,0,0.03)', border: '1px solid #edf2f7', textAlign: 'center' }}>
                        <div style={{ fontSize: '40px', marginBottom: '12px' }}>⏱️</div>
                        <h3 style={{ fontSize: '36px', fontWeight: 900, color: 'var(--upwise-dark)', margin: '0' }}>{data.hoursLearned}</h3>
                        <p style={{ color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase', fontSize: '14px', letterSpacing: '1px', marginTop: '8px' }}>Learning Hours</p>
                    </div>
                    <div className="stat-card" style={{ background: '#fff', padding: '32px', borderRadius: '20px', boxShadow: '0 10px 30px rgba(0,0,0,0.03)', border: '1px solid #edf2f7', textAlign: 'center' }}>
                        <div style={{ fontSize: '40px', marginBottom: '12px' }}>🎓</div>
                        <h3 style={{ fontSize: '36px', fontWeight: 900, color: 'var(--upwise-dark)', margin: '0' }}>{data.certificates?.length || 0}</h3>
                        <p style={{ color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase', fontSize: '14px', letterSpacing: '1px', marginTop: '8px' }}>Verified Certificates</p>
                    </div>
                </div>

                {/* CERTIFICATES & BADGES SECTION */}
                <div style={{ background: '#fff', padding: '40px', borderRadius: '24px', boxShadow: '0 10px 30px rgba(0,0,0,0.03)', border: '1px solid #edf2f7' }}>
                    <h2 style={{ color: 'var(--upwise-dark)', fontSize: '24px', fontWeight: 800, marginBottom: '32px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ fontSize: '32px' }}>🏆</span> Earned Achievements
                    </h2>

                    {data.certificates?.length > 0 ? (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                            {data.certificates.map((cert, i) => (
                                <div key={i} style={{
                                    padding: '24px',
                                    background: 'linear-gradient(to right, #f8fafc, #fff)',
                                    border: '1px solid #e2e8f0',
                                    borderRadius: '16px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '16px',
                                    transition: 'all 0.3s ease',
                                    cursor: 'default'
                                }}>
                                    <div style={{ background: '#ecfdf5', color: '#059669', width: '50px', height: '50px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>
                                        📜
                                    </div>
                                    <div>
                                        <h4 style={{ color: 'var(--upwise-dark)', margin: '0 0 4px', fontSize: '16px', fontWeight: 800 }}>{cert}</h4>
                                        <p style={{ color: 'var(--muted)', fontSize: '13px', margin: 0 }}>Verified by UPWISE</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--muted)' }}>
                            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🚀</div>
                            <p style={{ fontSize: '18px', fontWeight: 600 }}>Zero to hero! Journey has just begun.</p>
                            <p>Complete courses to earn your first certified achievement.</p>
                        </div>
                    )}

                    <div style={{ marginTop: '48px', paddingTop: '32px', borderTop: '1px solid #f1f5f9' }}>
                        <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--upwise-dark)', marginBottom: '16px' }}>Badges & Skills</h3>
                        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                            {data.badges?.length > 0 ? (
                                data.badges.map((b, i) => (
                                    <span key={i} title={b.description} style={{ padding: '8px 16px', background: 'var(--bg-light)', color: 'var(--upwise-dark)', fontWeight: 700, borderRadius: '20px', border: '1px solid var(--accent)', fontSize: '14px' }}>
                                        {b.icon} {b.title}
                                    </span>
                                ))
                            ) : (
                                <>
                                    <span style={{ padding: '8px 16px', background: '#f1f5f9', color: '#94a3b8', fontWeight: 700, borderRadius: '20px', fontSize: '14px' }}>🛡️ Early Adopter</span>
                                    <span style={{ padding: '8px 16px', background: '#f1f5f9', color: '#94a3b8', fontWeight: 700, borderRadius: '20px', fontSize: '14px' }}>⚡ Quick Learner</span>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                <div style={{ textAlign: 'center', marginTop: '48px' }}>
                    <p style={{ color: 'var(--muted)', fontSize: '14px' }}>Verified by <strong>UPWISE Learning Engine</strong></p>
                </div>
            </div>
        </div>
    );
}
