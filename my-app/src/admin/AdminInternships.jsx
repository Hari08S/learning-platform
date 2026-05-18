import { useEffect, useMemo, useState } from "react";
import toast, { Toaster } from 'react-hot-toast';

const API = import.meta.env.VITE_API_BASE || "http://localhost:4000";

export default function AdminInternships() {
    const [internships, setInternships] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState("all");

    const [modalOpen, setModalOpen] = useState(false);
    const [editingInternship, setEditingInternship] = useState(null);
    const [activeTab, setActiveTab] = useState("basics");

    const [applicantsData, setApplicantsData] = useState([]);
    const [loadingApplicants, setLoadingApplicants] = useState(false);

    const [formData, setFormData] = useState({
        title: "", description: "", company: "", domain: "tech", fee: "", thumbnail: "", isPublished: true, tasks: [],
        mentorName: "", mentorBio: "", mentorAvatar: ""
    });

    const token = localStorage.getItem("token");

    const loadData = async () => {
        try {
            setLoading(true);
            setError("");

            const res = await fetch(`${API}/api/admin/internships`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!res.ok) {
                throw new Error("Admin access required");
            }

            const json = await res.json();
            setInternships(json.internships || []);
        } catch (err) {
            setError("Failed to load internships");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const filteredInternships = useMemo(() => {
        return internships.filter(int => {
            if (!int.title) return false;

            const matchesSearch = int.title.toLowerCase().includes(search.toLowerCase()) ||
                (int.company && int.company.toLowerCase().includes(search.toLowerCase()));

            if (!matchesSearch) return false;
            if (filter === "all") return true;

            const status = int.isPublished ? "published" : "draft";
            return status === filter;
        });
    }, [internships, search, filter]);

    const openCreateModal = () => {
        setEditingInternship(null);
        setActiveTab("basics");
        setFormData({
            title: "", description: "", company: "", domain: "tech", fee: "", thumbnail: "", isPublished: true, tasks: [],
            mentorName: "", mentorBio: "", mentorAvatar: ""
        });
        setApplicantsData([]);
        setModalOpen(true);
    };

    const openEditModal = (int) => {
        setEditingInternship(int);
        setActiveTab("basics");
        setFormData({
            title: int.title || "",
            description: int.description || "",
            company: int.company || "",
            domain: int.domain || "tech",
            fee: int.fee || 0,
            thumbnail: int.thumbnail || "",
            isPublished: int.status === 'published',
            tasks: int.tasks || [],
            mentorName: int.mentorName || "",
            mentorBio: int.mentorBio || "",
            mentorAvatar: int.mentorAvatar || ""
        });
        setApplicantsData([]);
        setModalOpen(true);
    };

    const loadApplicants = async (id) => {
        setLoadingApplicants(true);
        try {
            const res = await fetch(`${API}/api/admin/internships/${id}/applicants`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                const json = await res.json();
                setApplicantsData(json.applications || []);
            }
        } catch (err) {
            toast.error("Failed to load applicants");
        } finally {
            setLoadingApplicants(false);
        }
    };

    const handleTabChange = (tab) => {
        setActiveTab(tab);
        if (tab === 'applicants' && editingInternship) {
            loadApplicants(editingInternship._id);
        }
    };

    const saveInternship = async () => {
        if (!formData.title.trim()) return toast.error("Title is required");

        const url = editingInternship
            ? `${API}/api/admin/internships/${editingInternship._id}`
            : `${API}/api/admin/internships`;
        const method = editingInternship ? "PUT" : "POST";

        try {
            const res = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(formData),
            });

            if (!res.ok) {
                const d = await res.json();
                throw new Error(d.message || "Failed to save");
            }

            toast.success(editingInternship ? "Internship updated" : "Internship created");
            setModalOpen(false);
            loadData();
        } catch (err) {
            toast.error(err.message);
        }
    };

    const deleteInternship = async (id) => {
        if (!confirm("Are you sure you want to permanently delete this internship?")) return;

        try {
            await fetch(`${API}/api/admin/internships/${id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });
            toast.success("Internship deleted");
            loadData();
        } catch (err) {
            toast.error("Failed to delete");
        }
    };

    const togglePublish = async (id, currentStatus) => {
        try {
            await fetch(`${API}/api/admin/internships/${id}/status`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ isPublished: !currentStatus })
            });
            loadData();
        } catch (err) {
            toast.error("Failed to update status");
        }
    };

    // Task Handlers
    const addTask = () => {
        setFormData(prev => ({
            ...prev,
            tasks: [...prev.tasks, { title: "", description: "", dueInDays: 7, resources: [] }]
        }));
    };

    const updateTask = (idx, field, value) => {
        const updated = [...formData.tasks];
        updated[idx] = { ...updated[idx], [field]: value };
        setFormData(prev => ({ ...prev, tasks: updated }));
    };

    const removeTask = (idx) => {
        const updated = formData.tasks.filter((_, i) => i !== idx);
        setFormData(prev => ({ ...prev, tasks: updated }));
    };

    const updateTaskResources = (idx, lines) => {
        const updated = [...formData.tasks];
        updated[idx].resources = lines.split("\n").filter(Boolean);
        setFormData(prev => ({ ...prev, tasks: updated }));
    };

    // Submission Handlers
    const updateSubmissionStatus = async (subId, status) => {
        const fb = status === 'rejected' ? prompt("Enter feedback for rejection:") || "Please review your work and resubmit." : "Great job!";
        try {
            const res = await fetch(`${API}/api/admin/submissions/${subId}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ status, adminFeedback: fb })
            });
            if (!res.ok) throw new Error("Failed to update submission");
            toast.success(`Submission marked as ${status}`);
            loadApplicants(editingInternship._id);
        } catch (err) {
            toast.error(err.message);
        }
    };

    const markComplete = async (userId) => {
        if (!confirm("Are you sure you want to mark this internship as completed for this user? This will generate their certificate.")) return;
        try {
            const res = await fetch(`${API}/api/admin/internships/${editingInternship._id}/complete/${userId}`, {
                method: "POST",
                headers: { Authorization: `Bearer ${token}` }
            });
            if (!res.ok) throw new Error("Failed to complete");
            toast.success("Internship marked as complete & certificate generated!");
            loadApplicants(editingInternship._id);
        } catch (err) {
            toast.error(err.message);
        }
    };

    return (
        <>
            <Toaster position="top-right" />
            <div className="admin-page-header">
                <h1>Internships & Programs</h1>

                <div className="course-toolbar">
                    <input
                        className="search-input"
                        placeholder="Search internships..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />

                    <select
                        className="filter-select"
                        value={filter}
                        onChange={e => setFilter(e.target.value)}
                    >
                        <option value="all">All</option>
                        <option value="published">Published</option>
                        <option value="draft">Draft</option>
                    </select>

                    <button className="primary-btn" onClick={openCreateModal}>
                        + Add Internship
                    </button>
                </div>
            </div>

            {loading ? (
                <p>Loading...</p>
            ) : error ? (
                <div className="empty-state">
                    <h3>{error}</h3>
                </div>
            ) : internships.length === 0 ? (
                <div className="empty-state">
                    <h3>No internships created yet</h3>
                </div>
            ) : filteredInternships.length === 0 ? (
                <div className="empty-state">
                    <h3>No internships match your filter</h3>
                </div>
            ) : (
                <div className="course-grid">
                    {filteredInternships.map(int => {
                        const isPublished = int.status === 'published';
                        const statusLabel = int.status || 'draft';

                        return (
                            <div key={int._id} className="course-card">
                                <div className="course-header" style={{ alignItems: 'flex-start' }}>
                                    <div className="course-title" style={{ maxWidth: '80%' }}>{int.title}</div>
                                    <button
                                        onClick={() => togglePublish(int._id, isPublished)}
                                        className={`status-badge ${statusLabel}`}
                                        style={{ cursor: 'pointer', border: 'none', padding: '4px 8px' }}
                                        title="Click to toggle status"
                                    >
                                        {statusLabel}
                                    </button>
                                </div>

                                <div className="course-meta">
                                    Company: <strong>{int.company || "Upwise"}</strong>
                                </div>
                                <div className="course-meta">
                                    Fee: <strong>${int.fee || 0}</strong>
                                </div>
                                <div className="course-meta">
                                    Applicants: <strong>{int.applicantsCount || 0}</strong>
                                </div>

                                <div style={{ display: "flex", gap: "10px", marginTop: "auto" }}>
                                    <button
                                        className="secondary-btn"
                                        style={{ flex: 1 }}
                                        onClick={() => openEditModal(int)}
                                    >
                                        Edit / Manage
                                    </button>
                                    <button
                                        className="danger-btn"
                                        style={{ flex: 1, marginTop: 0, padding: "8px 14px", borderRadius: "8px" }}
                                        onClick={() => deleteInternship(int._id)}
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* MODAL */}
            {modalOpen && (
                <div className="modal-backdrop" style={{ overflowY: "auto", padding: "40px 0" }}>
                    <div className="modal" style={{ width: 800, margin: "auto" }}>
                        <h2 style={{ marginBottom: "20px" }}>{editingInternship ? "Manage Internship" : "Create Internship"}</h2>

                        {/* Tabs */}
                        <div style={{ display: "flex", gap: "10px", marginBottom: "20px", borderBottom: "1px solid #e2e8f0" }}>
                            <button
                                style={{ padding: "8px 16px", background: "none", border: "none", borderBottom: activeTab === "basics" ? "2px solid #10b981" : "2px solid transparent", cursor: "pointer", fontWeight: activeTab === "basics" ? 700 : 500, color: activeTab === "basics" ? "#10b981" : "var(--muted)" }}
                                onClick={() => handleTabChange("basics")}
                            >
                                Basics
                            </button>
                            <button
                                style={{ padding: "8px 16px", background: "none", border: "none", borderBottom: activeTab === "details" ? "2px solid #10b981" : "2px solid transparent", cursor: "pointer", fontWeight: activeTab === "details" ? 700 : 500, color: activeTab === "details" ? "#10b981" : "var(--muted)" }}
                                onClick={() => handleTabChange("details")}
                            >
                                Details
                            </button>
                            <button
                                style={{ padding: "8px 16px", background: "none", border: "none", borderBottom: activeTab === "tasks" ? "2px solid #10b981" : "2px solid transparent", cursor: "pointer", fontWeight: activeTab === "tasks" ? 700 : 500, color: activeTab === "tasks" ? "#10b981" : "var(--muted)" }}
                                onClick={() => handleTabChange("tasks")}
                            >
                                Tasks Builder
                            </button>
                            <button
                                style={{ padding: "8px 16px", background: "none", border: "none", borderBottom: activeTab === "mentor" ? "2px solid #10b981" : "2px solid transparent", cursor: "pointer", fontWeight: activeTab === "mentor" ? 700 : 500, color: activeTab === "mentor" ? "#10b981" : "var(--muted)" }}
                                onClick={() => handleTabChange("mentor")}
                            >
                                Mentor
                            </button>
                            {editingInternship && (
                                <button
                                    style={{ padding: "8px 16px", background: "none", border: "none", borderBottom: activeTab === "applicants" ? "2px solid #10b981" : "2px solid transparent", cursor: "pointer", fontWeight: activeTab === "applicants" ? 700 : 500, color: activeTab === "applicants" ? "#10b981" : "var(--muted)" }}
                                    onClick={() => handleTabChange("applicants")}
                                >
                                    Applicants & Submissions
                                </button>
                            )}
                        </div>

                        <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "24px" }}>

                            {/* TAB: BASICS */}
                            {activeTab === "basics" && (
                                <>
                                    <label>
                                        <div style={{ fontWeight: 600, fontSize: "14px", color: "var(--muted)" }}>Program Title *</div>
                                        <input style={{ width: "100%", padding: "10px", marginTop: "6px", borderRadius: "8px", border: "1px solid #ccc" }} type="text" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} />
                                    </label>

                                    <label>
                                        <div style={{ fontWeight: 600, fontSize: "14px", color: "var(--muted)" }}>Thumbnail / Image URL</div>
                                        <input style={{ width: "100%", padding: "10px", marginTop: "6px", borderRadius: "8px", border: "1px solid #ccc" }} type="text" value={formData.thumbnail} onChange={e => setFormData({ ...formData, thumbnail: e.target.value })} placeholder="/logo.png" />
                                    </label>

                                    <div style={{ display: "flex", gap: "12px" }}>
                                        <label style={{ flex: 1 }}>
                                            <div style={{ fontWeight: 600, fontSize: "14px", color: "var(--muted)" }}>Company / Sponsor</div>
                                            <input style={{ width: "100%", padding: "10px", marginTop: "6px", borderRadius: "8px", border: "1px solid #ccc" }} type="text" value={formData.company} onChange={e => setFormData({ ...formData, company: e.target.value })} placeholder="Leave blank for internally hosted" />
                                        </label>
                                        <label style={{ flex: 1 }}>
                                            <div style={{ fontWeight: 600, fontSize: "14px", color: "var(--muted)" }}>Enrollment Fee</div>
                                            <input style={{ width: "100%", padding: "10px", marginTop: "6px", borderRadius: "8px", border: "1px solid #ccc" }} type="number" value={formData.fee} onChange={e => setFormData({ ...formData, fee: Number(e.target.value) })} />
                                        </label>
                                    </div>

                                    <div style={{ display: "flex", gap: "12px" }}>
                                        <label style={{ flex: 1 }}>
                                            <div style={{ fontWeight: 600, fontSize: "14px", color: "var(--muted)" }}>Domain</div>
                                            <select style={{ width: "100%", padding: "10px", marginTop: "6px", borderRadius: "8px", border: "1px solid #ccc" }} value={formData.domain} onChange={e => setFormData({ ...formData, domain: e.target.value })}>
                                                <option value="tech">Technology</option>
                                                <option value="software">Software Engineering</option>
                                                <option value="data">Data Science</option>
                                                <option value="design">UI/UX Design</option>
                                                <option value="marketing">Digital Marketing</option>
                                                <option value="finance">Finance</option>
                                                <option value="other">Other</option>
                                            </select>
                                        </label>
                                    </div>
                                </>
                            )}

                            {/* TAB: DETAILS */}
                            {activeTab === "details" && (
                                <>
                                    <label>
                                        <div style={{ fontWeight: 600, fontSize: "14px", color: "var(--muted)" }}>Detailed Description</div>
                                        <textarea style={{ width: "100%", padding: "10px", marginTop: "6px", borderRadius: "8px", border: "1px solid #ccc", minHeight: "150px", fontFamily: "inherit" }} value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} placeholder="Describe what interns will learn and build..."></textarea>
                                    </label>

                                    <label style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "10px" }}>
                                        <input type="checkbox" checked={formData.isPublished} onChange={e => setFormData({ ...formData, isPublished: e.target.checked })} />
                                        <span style={{ fontWeight: 600, fontSize: "14px", color: "var(--muted)" }}>Published (Visible to users)</span>
                                    </label>
                                </>
                            )}

                            {/* TAB: TASKS */}
                            {activeTab === "tasks" && (
                                <div style={{ display: "flex", flexDirection: "column", gap: "16px", maxHeight: "500px", overflowY: "auto", paddingRight: "10px" }}>
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                        <div style={{ fontWeight: 600, fontSize: "14px", color: "var(--text)" }}>Internship Tasks & Milestones</div>
                                        <button className="primary-btn" style={{ padding: "6px 12px", fontSize: "12px", borderRadius: "6px" }} onClick={addTask}>+ Add Task</button>
                                    </div>

                                    {formData.tasks.length === 0 ? (
                                        <div style={{ padding: "30px", textAlign: "center", color: "var(--muted)", background: "#f8fafc", borderRadius: "8px", border: "1px dashed #cbd5e1" }}>
                                            No tasks defined. Click <strong>+ Add Task</strong> to create the program structure.
                                        </div>
                                    ) : (
                                        formData.tasks.map((task, idx) => (
                                            <div key={idx} style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "8px", padding: "16px", position: "relative" }}>
                                                <button
                                                    onClick={() => removeTask(idx)}
                                                    style={{ position: "absolute", top: "16px", right: "16px", background: "#fee2e2", color: "#ef4444", border: "none", borderRadius: "4px", width: "24px", height: "24px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold" }}
                                                    title="Remove Task"
                                                >
                                                    ×
                                                </button>

                                                <label>
                                                    <div style={{ fontSize: "12px", fontWeight: 600, color: "var(--muted)" }}>Task Title</div>
                                                    <input style={{ width: "calc(100% - 30px)", padding: "8px", marginTop: "4px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "13px" }} value={task.title} onChange={e => updateTask(idx, "title", e.target.value)} placeholder="e.g. Set up Development Environment" />
                                                </label>

                                                <label style={{ display: 'block', marginTop: '10px' }}>
                                                    <div style={{ fontSize: "12px", fontWeight: 600, color: "var(--muted)" }}>Task Description & Requirements</div>
                                                    <textarea style={{ width: "100%", padding: "8px", marginTop: "4px", borderRadius: "6px", border: "1px solid #cbd5e1", minHeight: "60px", fontSize: "13px", fontFamily: "inherit" }} value={task.description} onChange={e => updateTask(idx, "description", e.target.value)} placeholder="Explain what needs to be done..."></textarea>
                                                </label>

                                                <div style={{ display: "flex", gap: "12px", marginTop: "10px" }}>
                                                    <label style={{ flex: 1 }}>
                                                        <div style={{ fontSize: "12px", fontWeight: 600, color: "var(--muted)" }}>Due in Days</div>
                                                        <input type="number" style={{ width: "100%", padding: "8px", marginTop: "4px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "13px" }} value={task.dueInDays} onChange={e => updateTask(idx, "dueInDays", Number(e.target.value))} />
                                                    </label>
                                                    <label style={{ flex: 2 }}>
                                                        <div style={{ fontSize: "12px", fontWeight: 600, color: "var(--muted)" }}>Helpful Resource URLs (one per line)</div>
                                                        <textarea style={{ width: "100%", padding: "8px", marginTop: "4px", borderRadius: "6px", border: "1px solid #cbd5e1", minHeight: "40px", fontSize: "13px", fontFamily: "inherit" }} value={(task.resources || []).join("\n")} onChange={e => updateTaskResources(idx, e.target.value)} placeholder="https://docs.reactjs.org"></textarea>
                                                    </label>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            )}

                            {/* TAB: MENTOR */}
                            {activeTab === "mentor" && (
                                <>
                                    <label>
                                        <div style={{ fontWeight: 600, fontSize: "14px", color: "var(--muted)" }}>Mentor Name</div>
                                        <input style={{ width: "100%", padding: "10px", marginTop: "6px", borderRadius: "8px", border: "1px solid #ccc" }} type="text" value={formData.mentorName} onChange={e => setFormData({ ...formData, mentorName: e.target.value })} />
                                    </label>
                                    <label>
                                        <div style={{ fontWeight: 600, fontSize: "14px", color: "var(--muted)" }}>Mentor Bio</div>
                                        <textarea style={{ width: "100%", padding: "10px", marginTop: "6px", borderRadius: "8px", border: "1px solid #ccc", minHeight: "80px", fontFamily: "inherit" }} value={formData.mentorBio} onChange={e => setFormData({ ...formData, mentorBio: e.target.value })}></textarea>
                                    </label>
                                    <label>
                                        <div style={{ fontWeight: 600, fontSize: "14px", color: "var(--muted)" }}>Mentor Avatar URL</div>
                                        <input style={{ width: "100%", padding: "10px", marginTop: "6px", borderRadius: "8px", border: "1px solid #ccc" }} type="text" value={formData.mentorAvatar} onChange={e => setFormData({ ...formData, mentorAvatar: e.target.value })} />
                                    </label>
                                </>
                            )}

                            {/* TAB: APPLICANTS & SUBMISSIONS */}
                            {activeTab === "applicants" && (
                                <div style={{ maxHeight: "500px", overflowY: "auto", paddingRight: "10px" }}>
                                    {loadingApplicants ? (
                                        <p>Loading applicants...</p>
                                    ) : applicantsData.length === 0 ? (
                                        <div style={{ padding: "30px", textAlign: "center", color: "var(--muted)", background: "#f8fafc", borderRadius: "8px", border: "1px dashed #cbd5e1" }}>
                                            No applicants for this internship yet.
                                        </div>
                                    ) : (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                            {applicantsData.map((data, idx) => (
                                                <div key={idx} style={{ border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px', background: '#fff' }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', paddingBottom: '12px', borderBottom: '1px solid #e2e8f0' }}>
                                                        <div>
                                                            <div style={{ fontWeight: 'bold', fontSize: '16px' }}>{data.userId?.name || data.userId?.email || "User"}</div>
                                                            <div style={{ fontSize: '12px', color: 'var(--muted)' }}>Status: <strong style={{ color: data.status === 'completed' ? '#10b981' : '#7c3aed' }}>{data.status?.toUpperCase()}</strong></div>
                                                        </div>
                                                        <button
                                                            className="btn"
                                                            style={{ padding: '6px 12px', background: data.status === 'completed' ? '#cbd5e1' : '#10b981', color: data.status === 'completed' ? '#475569' : '#fff' }}
                                                            onClick={() => markComplete(data.userId?._id)}
                                                            disabled={data.status === 'completed'}
                                                        >
                                                            {data.status === 'completed' ? 'Completed' : 'Complete User'}
                                                        </button>
                                                    </div>

                                                    <div style={{ fontWeight: 600, marginBottom: '12px', fontSize: '14px' }}>Task Submissions</div>
                                                    {data.submissions && data.submissions.length > 0 ? (
                                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                                            {data.submissions.map(sub => (
                                                                <div key={sub._id} style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
                                                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                                        <div style={{ fontWeight: 600, fontSize: '13px' }}>Task #{sub.taskIndex + 1}</div>
                                                                        <div style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '10px', background: sub.status === 'approved' ? '#d1fae5' : sub.status === 'rejected' ? '#fee2e2' : '#fef3c7', color: sub.status === 'approved' ? '#059669' : sub.status === 'rejected' ? '#dc2626' : '#d97706' }}>
                                                                            {sub.status.toUpperCase()}
                                                                        </div>
                                                                    </div>
                                                                    <div style={{ marginTop: '8px', fontSize: '13px', color: '#334155' }}>
                                                                        {sub.submissionText && <div><strong>Notes:</strong> {sub.submissionText}</div>}
                                                                        {sub.submissionLink && <div><strong>Link:</strong> <a href={sub.submissionLink} target="_blank" rel="noreferrer" style={{ color: '#3b82f6' }}>View Work</a></div>}
                                                                    </div>

                                                                    {sub.status === 'pending' && (
                                                                        <div style={{ marginTop: '12px', display: 'flex', gap: '8px' }}>
                                                                            <button onClick={() => updateSubmissionStatus(sub._id, 'approved')} style={{ padding: '4px 12px', fontSize: '12px', background: '#10b981', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Approve</button>
                                                                            <button onClick={() => updateSubmissionStatus(sub._id, 'rejected')} style={{ padding: '4px 12px', fontSize: '12px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Reject with Feedback</button>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <div style={{ fontSize: '13px', color: 'var(--muted)' }}>No submissions from this user yet.</div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="modal-actions" style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "24px" }}>
                            <button className="secondary-btn" onClick={() => setModalOpen(false)}>Close</button>
                            {activeTab !== 'applicants' && <button className="primary-btn" onClick={saveInternship}>Save Internship Details</button>}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
