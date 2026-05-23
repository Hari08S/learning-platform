import { useEffect, useMemo, useState } from "react";
import toast, { Toaster } from 'react-hot-toast';

const API = import.meta.env.VITE_API_BASE || "http://localhost:4000";

export default function AdminSubmissions() {
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState("pending");

    const token = localStorage.getItem("token");

    const loadSubmissions = async () => {
        try {
            setLoading(true);
            setError("");

            const res = await fetch(`${API}/api/admin/submissions`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!res.ok) {
                throw new Error("Admin access required");
            }

            const json = await res.json();
            setSubmissions(json.submissions || []);
        } catch (err) {
            setError("Failed to load submissions");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadSubmissions();
    }, []);

    const filteredSubmissions = useMemo(() => {
        return submissions.filter(sub => {
            const userName = sub.userId?.name || "";
            const userEmail = sub.userId?.email || "";
            const internTitle = sub.internshipId?.title || "";

            const matchesSearch = 
                userName.toLowerCase().includes(search.toLowerCase()) ||
                userEmail.toLowerCase().includes(search.toLowerCase()) ||
                internTitle.toLowerCase().includes(search.toLowerCase());

            if (!matchesSearch) return false;
            if (filter === "all") return true;
            return sub.status === filter;
        });
    }, [submissions, search, filter]);

    const handleUpdateStatus = async (subId, status) => {
        const feedbackPrompt = status === 'rejected' 
            ? prompt("Enter feedback / revision requirements for the student:") 
            : "Excellent work! Approved.";
        
        if (status === 'rejected' && feedbackPrompt === null) {
            return; // Cancelled
        }

        const adminFeedback = feedbackPrompt || "Approved.";

        try {
            const res = await fetch(`${API}/api/admin/submissions/${subId}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ status, adminFeedback })
            });

            if (!res.ok) {
                throw new Error("Failed to update status");
            }

            toast.success(`Task submission successfully ${status === 'approved' ? 'Approved ✓' : 'Rejected ✗'}`);
            loadSubmissions(); // reload list
        } catch (err) {
            toast.error(err.message);
        }
    };

    return (
        <>
            <Toaster position="top-right" />
            <div className="admin-page-header">
                <h1>Internship Task Submissions</h1>
                <p style={{ color: 'var(--muted)', marginTop: '4px' }}>
                    Review, approve, or request revisions on task submissions from interns across all programs.
                </p>

                <div className="course-toolbar" style={{ marginTop: '20px' }}>
                    <input
                        className="search-input"
                        placeholder="Search student, email, or program..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        style={{ flex: 1, minWidth: '250px' }}
                    />

                    <select
                        className="filter-select"
                        value={filter}
                        onChange={e => setFilter(e.target.value)}
                    >
                        <option value="pending">⏳ Pending Review</option>
                        <option value="approved">✅ Approved</option>
                        <option value="rejected">❌ Needs Revision</option>
                        <option value="all">📁 All Submissions</option>
                    </select>
                </div>
            </div>

            {loading ? (
                <p>Loading task submissions...</p>
            ) : error ? (
                <div className="empty-state">
                    <h3>{error}</h3>
                </div>
            ) : submissions.length === 0 ? (
                <div className="empty-state">
                    <h3>No submissions found on the platform yet.</h3>
                </div>
            ) : filteredSubmissions.length === 0 ? (
                <div className="empty-state">
                    <h3>No submissions match your search or filter criteria.</h3>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '20px' }}>
                    {filteredSubmissions.map(sub => {
                        const isPending = sub.status === 'pending';
                        const isApproved = sub.status === 'approved';
                        const isRejected = sub.status === 'rejected';

                        return (
                            <div 
                                key={sub._id} 
                                style={{ 
                                    background: '#fff', 
                                    borderRadius: '12px', 
                                    padding: '20px', 
                                    boxShadow: '0 8px 30px rgba(2,6,23,0.04)', 
                                    border: '1px solid #e2e8f0',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '12px'
                                }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                                    <div>
                                        <h3 style={{ margin: 0, fontSize: '18px', color: 'var(--text)' }}>
                                            {sub.userId?.name || "Student"} 
                                            <span style={{ fontSize: '14px', fontWeight: 'normal', color: 'var(--muted)', marginLeft: '8px' }}>
                                                ({sub.userId?.email || "No Email"})
                                            </span>
                                        </h3>
                                        <div style={{ fontSize: '14px', color: '#7c3aed', fontWeight: 600, marginTop: '4px' }}>
                                            Program: {sub.internshipId?.title || "Internship Program"}
                                        </div>
                                    </div>

                                    <span 
                                        style={{ 
                                            padding: '6px 12px', 
                                            borderRadius: '20px', 
                                            fontSize: '12px', 
                                            fontWeight: 700,
                                            background: isApproved ? '#d1fae5' : isRejected ? '#fee2e2' : '#fef3c7', 
                                            color: isApproved ? '#059669' : isRejected ? '#dc2626' : '#d97706'
                                        }}
                                    >
                                        {sub.status?.toUpperCase() || 'PENDING'}
                                    </span>
                                </div>

                                <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
                                    <div style={{ fontWeight: 700, fontSize: '14px', color: 'var(--text)', marginBottom: '6px' }}>
                                        Task Milestone #{sub.taskIndex + 1}
                                    </div>
                                    
                                    {sub.submissionText && (
                                        <p style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#475569', whiteSpace: 'pre-line' }}>
                                            <strong>Student Notes:</strong> {sub.submissionText}
                                        </p>
                                    )}

                                    {sub.submissionLink ? (
                                        <div style={{ fontSize: '14px' }}>
                                            <strong>Work Link:</strong>{' '}
                                            <a 
                                                href={sub.submissionLink} 
                                                target="_blank" 
                                                rel="noreferrer" 
                                                style={{ color: '#2563eb', fontWeight: 600, textDecoration: 'underline' }}
                                            >
                                                {sub.submissionLink} 📃
                                            </a>
                                        </div>
                                    ) : (
                                        <div style={{ fontSize: '14px', color: 'var(--muted)' }}>
                                            <em>No link submitted</em>
                                        </div>
                                    )}

                                    {sub.adminFeedback && (
                                        <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px solid #e2e8f0', fontSize: '13px', color: '#4b5563' }}>
                                            <strong>Review Feedback:</strong> {sub.adminFeedback}
                                        </div>
                                    )}
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                                    <span style={{ fontSize: '12px', color: 'var(--muted)' }}>
                                        Submitted on: {new Date(sub.submittedAt).toLocaleString()}
                                    </span>

                                    {isPending && (
                                        <div style={{ display: 'flex', gap: '10px' }}>
                                            <button 
                                                className="primary-btn" 
                                                onClick={() => handleUpdateStatus(sub._id, 'approved')}
                                                style={{ padding: '8px 16px', background: '#10b981', fontSize: '13px' }}
                                            >
                                                ✓ Accept & Approve
                                            </button>
                                            <button 
                                                className="danger-btn" 
                                                onClick={() => handleUpdateStatus(sub._id, 'rejected')}
                                                style={{ padding: '8px 16px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '13px' }}
                                            >
                                                ✗ Request Revision
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </>
    );
}
