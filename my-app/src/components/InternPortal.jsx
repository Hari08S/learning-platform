import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import useStore from '../store';
import toast, { Toaster } from 'react-hot-toast';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000';

export default function InternPortal() {
    const { id } = useParams();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTaskIndex, setActiveTaskIndex] = useState(null);
    const [submissionForms, setSubmissionForms] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fetchPortalData = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_BASE}/api/user/internships/${id}/portal`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (!res.ok) throw new Error('Failed to load portal');
            const json = await res.json();
            setData(json);
        } catch (err) {
            toast.error(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPortalData();
    }, [id]);

    if (loading) return <div className="container" style={{ padding: 48 }}>Loading your portal...</div>;
    if (!data) return <div className="container" style={{ padding: 48 }}>Error loading portal.</div>;

    const { application, internship, submissions } = data;

    // Calculate progress based on approved tasks
    const totalTasks = internship.tasks.length || 1; // avoid division by zero
    const approvedTasksCount = submissions.filter(s => s.status === 'approved').length;
    const calculatedProgress = Math.round((approvedTasksCount / totalTasks) * 100);

    const getSubForTask = (idx) => submissions.find(s => s.taskIndex === idx);

    const handleTextChange = (idx, val) => {
        setSubmissionForms(prev => ({ ...prev, [idx]: { ...prev[idx], text: val } }));
    };
    const handleLinkChange = (idx, val) => {
        setSubmissionForms(prev => ({ ...prev, [idx]: { ...prev[idx], link: val } }));
    };

    const submitTask = async (idx) => {
        setIsSubmitting(true);
        const formUrl = submissionForms[idx]?.link || '';
        const formText = submissionForms[idx]?.text || '';

        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_BASE}/api/user/internships/${id}/submit/${idx}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ submissionText: formText, submissionLink: formUrl })
            });

            if (!res.ok) {
                const d = await res.json();
                throw new Error(d.message || 'Submission failed');
            }

            toast.success('Task submitted successfully!');
            setActiveTaskIndex(null);
            fetchPortalData(); // Refresh UI
        } catch (err) {
            toast.error(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="container course-detail-page" style={{ padding: "28px 24px 80px" }}>
            <Toaster position="top-center" />
            <button className="btn outline" onClick={() => window.history.back()} style={{ marginBottom: 18 }}>
                ← Back
            </button>

            {/* Header section */}
            <div style={{ background: 'var(--surface)', padding: '24px', borderRadius: '12px', boxShadow: 'var(--shadow)', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px' }}>
                <div style={{ flex: 1, minWidth: '300px' }}>
                    <div style={{ color: 'var(--muted)', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>Internship Workspace</div>
                    <h1 style={{ margin: '0 0 8px 0', color: 'var(--text)' }}>{internship.title}</h1>
                    <div style={{ fontSize: '16px', color: 'var(--muted)', marginBottom: '16px' }}>{internship.company || 'Upwise Hosted'}</div>

                    <div style={{ maxWidth: '400px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', marginBottom: '8px', fontWeight: 600 }}>
                            <span style={{ color: 'var(--muted)' }}>Program Progress</span>
                            <span style={{ color: calculatedProgress >= 100 || application.status === 'completed' ? '#10b981' : '#7C3AED' }}>
                                {application.status === 'completed' ? '100%' : `${calculatedProgress}%`}
                            </span>
                        </div>
                        <div style={{ height: '8px', background: 'var(--card-bg)', borderRadius: '4px', overflow: 'hidden' }}>
                            <div style={{ width: `${application.status === 'completed' ? 100 : calculatedProgress}%`, height: '100%', background: application.status === 'completed' ? '#10b981' : '#7C3AED', transition: 'width 0.3s ease' }} />
                        </div>
                    </div>

                    {application.status === 'completed' && (
                        <div style={{ marginTop: '24px' }}>
                            <button className="btn primary" style={{ background: '#10b981' }} onClick={() => toast('Certificate PDF generation is currently mocked.')}>
                                Download Certificate
                            </button>
                        </div>
                    )}
                </div>

                {/* Mentor Card */}
                <div style={{ width: '300px', background: 'var(--bg)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border)' }}>
                    <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', marginBottom: '12px' }}>Your Mentor</div>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                        <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--muted)', backgroundImage: `url(${internship.mentorAvatar || ''})`, backgroundSize: 'cover', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold' }}>
                            {!internship.mentorAvatar && (internship.mentorName?.[0] || 'M')}
                        </div>
                        <div>
                            <div style={{ fontWeight: 'bold', color: 'var(--text)' }}>{internship.mentorName || 'Assigned soon'}</div>
                            <div style={{ fontSize: '13px', color: 'var(--muted)', marginTop: '4px' }}>Expert Mentor</div>
                        </div>
                    </div>
                    <p style={{ fontSize: '13px', color: 'var(--muted)', marginTop: '12px', lineHeight: 1.4 }}>
                        {internship.mentorBio || 'Guiding you through milestones and code reviews.'}
                    </p>
                </div>
            </div>

            <h2>Tasks & Milestones</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>
                {(internship.tasks || []).map((task, idx) => {
                    const sub = getSubForTask(idx);
                    const isPending = sub && sub.status === 'pending';
                    const isApproved = sub && sub.status === 'approved';
                    const isRejected = sub && sub.status === 'rejected';

                    return (
                        <div key={idx} style={{ background: 'var(--surface)', borderRadius: '12px', border: '1px solid var(--border)', overflow: 'hidden' }}>
                            {/* Task Header */}
                            <div style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: activeTaskIndex === idx ? '1px solid var(--border)' : 'none' }}>
                                <div style={{ display: 'flex', gap: '16px' }}>
                                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: isApproved ? '#10b981' : 'var(--card-bg)', color: isApproved ? 'white' : 'var(--text)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                                        {isApproved ? '✓' : idx + 1}
                                    </div>
                                    <div>
                                        <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', color: 'var(--text)' }}>{task.title}</h3>
                                        <p style={{ margin: 0, fontSize: '14px', color: 'var(--muted)', maxWidth: '600px' }}>{task.description}</p>
                                        {task.resources && task.resources.length > 0 && (
                                            <div style={{ marginTop: '12px', fontSize: '13px' }}>
                                                <strong>Resources:</strong>
                                                <ul style={{ margin: '4px 0 0 0', paddingLeft: '20px' }}>
                                                    {task.resources.map((link, i) => (
                                                        <li key={i}><a href={link} target="_blank" rel="noreferrer" style={{ color: '#7C3AED' }}>View Material</a></li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '12px' }}>
                                    {!sub && <span style={{ padding: '4px 10px', background: 'var(--card-bg)', borderRadius: '20px', fontSize: '12px', fontWeight: 600 }}>TBD</span>}
                                    {isPending && <span style={{ padding: '4px 10px', background: '#fef3c7', color: '#d97706', borderRadius: '20px', fontSize: '12px', fontWeight: 600 }}>In Review</span>}
                                    {isApproved && <span style={{ padding: '4px 10px', background: '#d1fae5', color: '#059669', borderRadius: '20px', fontSize: '12px', fontWeight: 600 }}>Approved</span>}
                                    {isRejected && <span style={{ padding: '4px 10px', background: '#fee2e2', color: '#dc2626', borderRadius: '20px', fontSize: '12px', fontWeight: 600 }}>Needs Revision</span>}

                                    {!isApproved && (
                                        <button
                                            className={`btn outline small`}
                                            style={{ padding: '6px 12px' }}
                                            onClick={() => setActiveTaskIndex(activeTaskIndex === idx ? null : idx)}
                                        >
                                            {activeTaskIndex === idx ? 'Close' : (sub ? 'Resubmit' : 'Submit Work')}
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Feedback Alert if rejected */}
                            {isRejected && sub.adminFeedback && (
                                <div style={{ background: '#fee2e2', color: '#b91c1c', padding: '12px 20px', fontSize: '14px', borderTop: '1px solid #f87171' }}>
                                    <strong>Mentor Feedback:</strong> {sub.adminFeedback}
                                </div>
                            )}

                            {/* Submission Form Canvas */}
                            {activeTaskIndex === idx && !isApproved && (
                                <div style={{ padding: '20px', background: 'var(--bg)', borderTop: '1px solid var(--border)' }}>
                                    {isPending && (
                                        <div style={{ marginBottom: '16px', fontSize: '13px', color: '#d97706', background: '#fef3c7', padding: '8px 12px', borderRadius: '6px' }}>
                                            Your previous submission is under review. You can override it by submitting again.
                                        </div>
                                    )}

                                    <label style={{ display: 'block', marginBottom: '12px' }}>
                                        <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text)', marginBottom: '6px' }}>Work URL (GitHub, Google Drive, Figma, etc.)</div>
                                        <input
                                            type="url"
                                            style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text)' }}
                                            placeholder="https://..."
                                            value={submissionForms[idx]?.link || ''}
                                            onChange={e => handleLinkChange(idx, e.target.value)}
                                        />
                                    </label>

                                    <label style={{ display: 'block', marginBottom: '16px' }}>
                                        <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text)', marginBottom: '6px' }}>Notes for Mentor</div>
                                        <textarea
                                            style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text)', minHeight: '80px', fontFamily: 'inherit' }}
                                            placeholder="Explain your approach..."
                                            value={submissionForms[idx]?.text || ''}
                                            onChange={e => handleTextChange(idx, e.target.value)}
                                        ></textarea>
                                    </label>

                                    <button className="btn primary" onClick={() => submitTask(idx)} disabled={isSubmitting}>
                                        {isSubmitting ? 'Sending...' : 'Submit to Mentor'}
                                    </button>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
