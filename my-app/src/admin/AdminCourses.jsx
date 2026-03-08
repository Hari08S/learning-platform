import { useEffect, useMemo, useState } from "react";

const API = import.meta.env.VITE_API_BASE || "http://localhost:4000";

export default function AdminCourses() {
  const [courses, setCourses] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const [modalOpen, setModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [activeTab, setActiveTab] = useState("basics");

  const [formData, setFormData] = useState({
    title: "", author: "", description: "", price: "", level: "Beginner", hours: "", img: "",
    tag: "", isPublished: true, includes: "", curriculum: [], quiz: null,
    instructor: { name: "", bio: "", rating: 5, students: 0, courses: 1 }
  });

  const token = localStorage.getItem("token");

  // ================= LOAD DATA (AUTH SAFE) =================
  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      const coursesRes = await fetch(`${API}/api/admin/courses`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!coursesRes.ok) {
        const err = await coursesRes.json();
        setError(err.message || "Admin access required");
        setCourses([]);
        return;
      }

      const coursesJson = await coursesRes.json();
      setCourses(coursesJson.courses || []);

      const purchasesRes = await fetch(`${API}/api/admin/purchases`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (purchasesRes.ok) {
        const purchasesJson = await purchasesRes.json();
        setPurchases(purchasesJson.purchases || []);
      } else {
        setPurchases([]);
      }
    } catch (err) {
      setError("Failed to load admin courses");
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const purchasesByCourse = useMemo(() => {
    const map = {};
    purchases.forEach(p => {
      if (!p.courseTitle) return;
      const key = p.courseTitle.trim().toLowerCase();
      map[key] = (map[key] || 0) + 1;
    });
    return map;
  }, [purchases]);

  const filteredCourses = useMemo(() => {
    return courses.filter(course => {
      if (!course.title) return false;

      const matchesSearch = course.title
        .toLowerCase()
        .includes(search.toLowerCase());

      if (!matchesSearch) return false;
      if (filter === "all") return true;

      const key = course.title.trim().toLowerCase();
      const count = purchasesByCourse[key] || 0;
      const status = count > 0 ? "published" : "draft";

      return status === filter;
    });
  }, [courses, purchasesByCourse, search, filter]);

  const openCreateModal = () => {
    setEditingCourse(null);
    setActiveTab("basics");
    setFormData({
      title: "", author: "", description: "", price: "", level: "Beginner", hours: "", img: "",
      tag: "", isPublished: true, includes: "", curriculum: [], quiz: null,
      instructor: { name: "", bio: "", rating: 5, students: 0, courses: 1 }
    });
    setModalOpen(true);
  };

  const openEditModal = (course) => {
    setEditingCourse(course);
    setActiveTab("basics");
    setFormData({
      title: course.title || "",
      author: course.author || "",
      description: course.description || "",
      price: course.price || "",
      level: course.level || "Beginner",
      hours: course.hours || "",
      img: course.img || "",
      tag: course.tag || "",
      isPublished: course.isPublished !== false,
      includes: course.includes && course.includes.length > 0 ? course.includes.join("\n") : "",
      curriculum: course.curriculum && course.curriculum.length > 0 ? course.curriculum : [],
      quiz: course.quiz || null,
      instructor: course.instructor || { name: course.author || "", bio: "", rating: 5, students: 0, courses: 1 }
    });
    setModalOpen(true);
  };

  const saveCourse = async () => {
    if (!formData.title.trim()) return alert("Title is required");

    const payload = {
      ...formData,
      includes: formData.includes.split("\n").map(line => line.trim()).filter(Boolean),
    };

    const url = editingCourse
      ? `${API}/api/admin/courses/${editingCourse._id}`
      : `${API}/api/admin/courses`;
    const method = editingCourse ? "PUT" : "POST";

    await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    setModalOpen(false);
    loadData();
  };

  // Curriculum Handlers
  const addCurriculumItem = () => {
    setFormData(prev => ({
      ...prev,
      curriculum: [...prev.curriculum, {
        id: Date.now().toString(),
        title: "",
        mins: 10,
        preview: false,
        type: "lesson",
        body: ""
      }]
    }));
  };

  const updateCurriculumItem = (index, field, value) => {
    const updated = [...formData.curriculum];
    updated[index] = { ...updated[index], [field]: value };
    setFormData(prev => ({ ...prev, curriculum: updated }));
  };

  const removeCurriculumItem = (index) => {
    const updated = formData.curriculum.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, curriculum: updated }));
  };

  // Quiz Handlers
  const toggleQuiz = (enabled) => {
    if (enabled) {
      setFormData(prev => ({ ...prev, quiz: { title: "Course Quiz", estimatedMins: 10, passingPercentage: 50, questions: [] } }));
    } else {
      setFormData(prev => ({ ...prev, quiz: null }));
    }
  };

  const updateQuizField = (field, value) => {
    setFormData(prev => ({ ...prev, quiz: { ...prev.quiz, [field]: value } }));
  };

  const addQuizQuestion = () => {
    setFormData(prev => ({
      ...prev,
      quiz: {
        ...prev.quiz,
        questions: [...prev.quiz.questions, {
          id: Date.now().toString(),
          text: "",
          options: [],
          correctOptionId: null,
          points: 1
        }]
      }
    }));
  };

  const updateQuestion = (qIndex, field, value) => {
    const questions = [...formData.quiz.questions];
    questions[qIndex] = { ...questions[qIndex], [field]: value };
    updateQuizField("questions", questions);
  };

  const removeQuestion = (qIndex) => {
    const questions = formData.quiz.questions.filter((_, i) => i !== qIndex);
    updateQuizField("questions", questions);
  };

  const addOption = (qIndex) => {
    const questions = [...formData.quiz.questions];
    const newOption = { id: Date.now().toString(), text: "" };
    questions[qIndex].options = [...questions[qIndex].options, newOption];
    updateQuizField("questions", questions);
  };

  const updateOption = (qIndex, oIndex, value) => {
    const questions = [...formData.quiz.questions];
    questions[qIndex].options[oIndex].text = value;
    updateQuizField("questions", questions);
  };

  const removeOption = (qIndex, oIndex) => {
    const questions = [...formData.quiz.questions];
    questions[qIndex].options = questions[qIndex].options.filter((_, i) => i !== oIndex);
    updateQuizField("questions", questions);
  };

  const setCorrectOption = (qIndex, optionId) => {
    const questions = [...formData.quiz.questions];
    questions[qIndex].correctOptionId = optionId;
    updateQuizField("questions", questions);
  };

  const deleteCourse = async (id) => {
    if (!confirm("Are you sure you want to permanently delete this course?")) return;

    await fetch(`${API}/api/admin/courses/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    loadData();
  };

  return (
    <>
      <div className="admin-page-header">
        <h1>Courses</h1>

        <div className="course-toolbar">
          <input
            className="search-input"
            placeholder="Search courses..."
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
            + Add Course
          </button>
        </div>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <div className="empty-state">
          <h3>{error}</h3>
        </div>
      ) : courses.length === 0 ? (
        <div className="empty-state">
          <h3>No courses created yet</h3>
        </div>
      ) : filteredCourses.length === 0 ? (
        <div className="empty-state">
          <h3>No courses match your filter</h3>
        </div>
      ) : (
        <div className="course-grid">
          {filteredCourses.map(course => {
            const key = course.title.trim().toLowerCase();
            const count = purchasesByCourse[key] || 0;
            const status = count > 0 ? "published" : "draft";

            return (
              <div key={course._id} className="course-card">
                <div className="course-header">
                  <div className="course-title">{course.title}</div>
                  <span className={`status-badge ${status}`}>
                    {status}
                  </span>
                </div>

                <div className="course-meta">
                  Purchases: <strong>{count}</strong>
                </div>

                <div style={{ display: "flex", gap: "10px", marginTop: "auto" }}>
                  <button
                    className="secondary-btn"
                    style={{ flex: 1 }}
                    onClick={() => openEditModal(course)}
                  >
                    Edit
                  </button>
                  <button
                    className="danger-btn"
                    style={{ flex: 1, marginTop: 0, padding: "8px 14px", borderRadius: "8px" }}
                    onClick={() => deleteCourse(course._id)}
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
          <div className="modal" style={{ width: 600, margin: "auto" }}>
            <h2 style={{ marginBottom: "20px" }}>{editingCourse ? "Edit Course" : "Create Course"}</h2>

            {/* Custom Tabs Navigation */}
            <div style={{ display: "flex", gap: "10px", marginBottom: "20px", borderBottom: "1px solid #e2e8f0" }}>
              <button
                style={{ padding: "8px 16px", background: "none", border: "none", borderBottom: activeTab === "basics" ? "2px solid #10b981" : "2px solid transparent", cursor: "pointer", fontWeight: activeTab === "basics" ? 700 : 500, color: activeTab === "basics" ? "#10b981" : "var(--muted)" }}
                onClick={() => setActiveTab("basics")}
              >
                Basics
              </button>
              <button
                style={{ padding: "8px 16px", background: "none", border: "none", borderBottom: activeTab === "details" ? "2px solid #10b981" : "2px solid transparent", cursor: "pointer", fontWeight: activeTab === "details" ? 700 : 500, color: activeTab === "details" ? "#10b981" : "var(--muted)" }}
                onClick={() => setActiveTab("details")}
              >
                Details
              </button>
              <button
                style={{ padding: "8px 16px", background: "none", border: "none", borderBottom: activeTab === "curriculum" ? "2px solid #10b981" : "2px solid transparent", cursor: "pointer", fontWeight: activeTab === "curriculum" ? 700 : 500, color: activeTab === "curriculum" ? "#10b981" : "var(--muted)" }}
                onClick={() => setActiveTab("curriculum")}
              >
                Curriculum Builder
              </button>
              <button
                style={{ padding: "8px 16px", background: "none", border: "none", borderBottom: activeTab === "quiz" ? "2px solid #10b981" : "2px solid transparent", cursor: "pointer", fontWeight: activeTab === "quiz" ? 700 : 500, color: activeTab === "quiz" ? "#10b981" : "var(--muted)" }}
                onClick={() => setActiveTab("quiz")}
              >
                Quiz Builder
              </button>
              <button
                style={{ padding: "8px 16px", background: "none", border: "none", borderBottom: activeTab === "instructor" ? "2px solid #10b981" : "2px solid transparent", cursor: "pointer", fontWeight: activeTab === "instructor" ? 700 : 500, color: activeTab === "instructor" ? "#10b981" : "var(--muted)" }}
                onClick={() => setActiveTab("instructor")}
              >
                Instructor
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "24px" }}>

              {/* TAB: BASICS */}
              {activeTab === "basics" && (
                <>
                  <label>
                    <div style={{ fontWeight: 600, fontSize: "14px", color: "var(--muted)" }}>Title *</div>
                    <input style={{ width: "100%", padding: "10px", marginTop: "6px", borderRadius: "8px", border: "1px solid #ccc" }} type="text" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} />
                  </label>

                  <label>
                    <div style={{ fontWeight: 600, fontSize: "14px", color: "var(--muted)" }}>Image URL</div>
                    <input style={{ width: "100%", padding: "10px", marginTop: "6px", borderRadius: "8px", border: "1px solid #ccc" }} type="text" value={formData.img} onChange={e => setFormData({ ...formData, img: e.target.value })} />
                  </label>

                  <div style={{ display: "flex", gap: "12px" }}>
                    <label style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: "14px", color: "var(--muted)" }}>Author</div>
                      <input style={{ width: "100%", padding: "10px", marginTop: "6px", borderRadius: "8px", border: "1px solid #ccc" }} type="text" value={formData.author} onChange={e => setFormData({ ...formData, author: e.target.value })} />
                    </label>
                    <label style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: "14px", color: "var(--muted)" }}>Price</div>
                      <input style={{ width: "100%", padding: "10px", marginTop: "6px", borderRadius: "8px", border: "1px solid #ccc" }} type="text" value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} />
                    </label>
                  </div>

                  <div style={{ display: "flex", gap: "12px" }}>
                    <label style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: "14px", color: "var(--muted)" }}>Level</div>
                      <select style={{ width: "100%", padding: "10px", marginTop: "6px", borderRadius: "8px", border: "1px solid #ccc" }} value={formData.level} onChange={e => setFormData({ ...formData, level: e.target.value })}>
                        <option value="Beginner">Beginner</option>
                        <option value="Intermediate">Intermediate</option>
                        <option value="Advanced">Advanced</option>
                        <option value="All Levels">All Levels</option>
                      </select>
                    </label>
                    <label style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: "14px", color: "var(--muted)" }}>Duration (e.g. 10.5h)</div>
                      <input style={{ width: "100%", padding: "10px", marginTop: "6px", borderRadius: "8px", border: "1px solid #ccc" }} type="text" value={formData.hours} onChange={e => setFormData({ ...formData, hours: e.target.value })} />
                    </label>
                  </div>
                </>
              )}

              {/* TAB: DETAILS */}
              {activeTab === "details" && (
                <>
                  <label>
                    <div style={{ fontWeight: 600, fontSize: "14px", color: "var(--muted)" }}>Description</div>
                    <textarea style={{ width: "100%", padding: "10px", marginTop: "6px", borderRadius: "8px", border: "1px solid #ccc", minHeight: "80px", fontFamily: "inherit" }} value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })}></textarea>
                  </label>

                  <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                    <label style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: "14px", color: "var(--muted)" }}>Category Tag</div>
                      <input style={{ width: "100%", padding: "10px", marginTop: "6px", borderRadius: "8px", border: "1px solid #ccc" }} type="text" placeholder="e.g. Design, Web Dev" value={formData.tag} onChange={e => setFormData({ ...formData, tag: e.target.value })} />
                    </label>

                    <label style={{ flex: 1, display: "flex", alignItems: "center", gap: "8px", marginTop: "20px" }}>
                      <input type="checkbox" checked={formData.isPublished} onChange={e => setFormData({ ...formData, isPublished: e.target.checked })} />
                      <span style={{ fontWeight: 600, fontSize: "14px", color: "var(--muted)" }}>Published (Visible to users)</span>
                    </label>
                  </div>

                  <label>
                    <div style={{ fontWeight: 600, fontSize: "14px", color: "var(--muted)" }}>What's Included? (One per line)</div>
                    <div style={{ fontSize: "12px", color: "#666", marginBottom: "6px" }}>This will construct the bullet-list under the buy button.</div>
                    <textarea style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #ccc", minHeight: "100px", fontFamily: "inherit" }} placeholder="Full Lifetime Access&#10;Certificate of completion&#10;Access on mobile" value={formData.includes} onChange={e => setFormData({ ...formData, includes: e.target.value })}></textarea>
                  </label>
                </>
              )}

              {/* TAB: CURRICULUM */}
              {activeTab === "curriculum" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "16px", maxHeight: "400px", overflowY: "auto", paddingRight: "10px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ fontWeight: 600, fontSize: "14px", color: "var(--text)" }}>Modules / Lessons</div>
                    <button className="primary-btn" style={{ padding: "6px 12px", fontSize: "12px", borderRadius: "6px" }} onClick={addCurriculumItem}>+ Add Lesson</button>
                  </div>

                  {formData.curriculum.length === 0 ? (
                    <div style={{ padding: "30px", textAlign: "center", color: "var(--muted)", background: "#f8fafc", borderRadius: "8px", border: "1px dashed #cbd5e1" }}>
                      No curriculum items yet. Click <strong>+ Add Lesson</strong> to start building your course.
                    </div>
                  ) : (
                    formData.curriculum.map((item, idx) => (
                      <div key={idx} style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "8px", padding: "16px", position: "relative" }}>
                        <button
                          onClick={() => removeCurriculumItem(idx)}
                          style={{ position: "absolute", top: "16px", right: "16px", background: "#fee2e2", color: "#ef4444", border: "none", borderRadius: "4px", width: "24px", height: "24px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold" }}
                          title="Remove Lesson"
                        >
                          ×
                        </button>

                        <div style={{ display: "flex", gap: "12px", marginBottom: "12px", paddingRight: "30px" }}>
                          <label style={{ flex: 2 }}>
                            <div style={{ fontSize: "12px", fontWeight: 600, color: "var(--muted)" }}>Lesson Title</div>
                            <input style={{ width: "100%", padding: "8px", marginTop: "4px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "13px" }} value={item.title} onChange={e => updateCurriculumItem(idx, "title", e.target.value)} placeholder="e.g. Introduction to React" />
                          </label>
                          <label style={{ flex: 1 }}>
                            <div style={{ fontSize: "12px", fontWeight: 600, color: "var(--muted)" }}>Duration (mins)</div>
                            <input type="number" style={{ width: "100%", padding: "8px", marginTop: "4px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "13px" }} value={item.mins} onChange={e => updateCurriculumItem(idx, "mins", Number(e.target.value))} />
                          </label>
                        </div>

                        <label style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "12px", cursor: "pointer" }}>
                          <input type="checkbox" checked={item.preview} onChange={e => updateCurriculumItem(idx, "preview", e.target.checked)} />
                          <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--muted)" }}>Free Preview (Available before purchase)</span>
                        </label>

                        <label>
                          <div style={{ fontSize: "12px", fontWeight: 600, color: "var(--muted)" }}>Content Details</div>
                          <textarea style={{ width: "100%", padding: "8px", marginTop: "4px", borderRadius: "6px", border: "1px solid #cbd5e1", minHeight: "60px", fontSize: "13px", fontFamily: "inherit" }} value={item.body} onChange={e => updateCurriculumItem(idx, "body", e.target.value)} placeholder="Brief description or formatting for the lesson content"></textarea>
                        </label>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* TAB: QUIZ */}
              {activeTab === "quiz" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "16px", maxHeight: "400px", overflowY: "auto", paddingRight: "10px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ fontWeight: 600, fontSize: "14px", color: "var(--text)" }}>Course Quiz</div>
                    {!formData.quiz ? (
                      <button className="primary-btn" style={{ padding: "6px 12px", fontSize: "12px", borderRadius: "6px" }} onClick={() => toggleQuiz(true)}>+ Enable Quiz</button>
                    ) : (
                      <button className="danger-btn" style={{ padding: "6px 12px", fontSize: "12px", borderRadius: "6px", margin: 0 }} onClick={() => toggleQuiz(false)}>Remove Quiz</button>
                    )}
                  </div>

                  {!formData.quiz ? (
                    <div style={{ padding: "30px", textAlign: "center", color: "var(--muted)", background: "#f8fafc", borderRadius: "8px", border: "1px dashed #cbd5e1" }}>
                      This course does not have a quiz. Click <strong>+ Enable Quiz</strong> to add one.
                    </div>
                  ) : (
                    <>
                      <div style={{ display: "flex", gap: "12px", marginBottom: "8px" }}>
                        <label style={{ flex: 2 }}>
                          <div style={{ fontSize: "12px", fontWeight: 600, color: "var(--muted)" }}>Quiz Title</div>
                          <input style={{ width: "100%", padding: "8px", marginTop: "4px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "13px" }} value={formData.quiz.title} onChange={e => updateQuizField("title", e.target.value)} />
                        </label>
                        <label style={{ flex: 1 }}>
                          <div style={{ fontSize: "12px", fontWeight: 600, color: "var(--muted)" }}>Pass %</div>
                          <input type="number" style={{ width: "100%", padding: "8px", marginTop: "4px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "13px" }} value={formData.quiz.passingPercentage} onChange={e => updateQuizField("passingPercentage", Number(e.target.value))} />
                        </label>
                      </div>

                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "10px" }}>
                        <div style={{ fontWeight: 600, fontSize: "14px", color: "var(--text)" }}>Questions</div>
                        <button className="secondary-btn" style={{ padding: "6px 12px", fontSize: "12px", borderRadius: "6px" }} onClick={addQuizQuestion}>+ Add Question</button>
                      </div>

                      {formData.quiz.questions.map((q, qIndex) => (
                        <div key={qIndex} style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "8px", padding: "16px", position: "relative" }}>
                          <button
                            onClick={() => removeQuestion(qIndex)}
                            style={{ position: "absolute", top: "16px", right: "16px", background: "#fee2e2", color: "#ef4444", border: "none", borderRadius: "4px", width: "24px", height: "24px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold" }}
                            title="Remove Question"
                          >
                            ×
                          </button>

                          <label>
                            <div style={{ fontSize: "12px", fontWeight: 600, color: "var(--muted)", marginBottom: "4px" }}>Question Text</div>
                            <input style={{ width: "calc(100% - 30px)", padding: "8px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "13px" }} value={q.text} onChange={e => updateQuestion(qIndex, "text", e.target.value)} placeholder="e.g. What is React?" />
                          </label>

                          <div style={{ marginTop: "12px" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                              <div style={{ fontSize: "12px", fontWeight: 600, color: "var(--muted)" }}>Options</div>
                              <button style={{ fontSize: "12px", color: "#10b981", border: "none", background: "none", cursor: "pointer", fontWeight: 600 }} onClick={() => addOption(qIndex)}>+ Add Option</button>
                            </div>

                            {q.options.map((opt, oIndex) => (
                              <div key={oIndex} style={{ display: "flex", gap: "8px", alignItems: "center", marginBottom: "6px" }}>
                                <input
                                  type="radio"
                                  name={`correct-${qIndex}`}
                                  checked={q.correctOptionId === opt.id}
                                  onChange={() => setCorrectOption(qIndex, opt.id)}
                                  title="Mark as Correct Option"
                                />
                                <input
                                  style={{ flex: 1, width: "100%", minWidth: "150px", padding: "6px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "12px" }}
                                  value={opt.text}
                                  onChange={e => updateOption(qIndex, oIndex, e.target.value)}
                                  placeholder="Option text"
                                />
                                <button onClick={() => removeOption(qIndex, oIndex)} style={{ color: "#ef4444", background: "none", border: "none", cursor: "pointer", fontSize: "14px", fontWeight: "bold" }}>×</button>
                              </div>
                            ))}
                            {q.options.length > 0 && !q.correctOptionId && <div style={{ fontSize: "11px", color: "#ef4444", marginTop: "4px" }}>Please select the correct option using the radio buttons.</div>}
                          </div>
                        </div>
                      ))}
                    </>
                  )}
                </div>
              )}

              {/* TAB: INSTRUCTOR */}
              {activeTab === "instructor" && (
                <>
                  <label>
                    <div style={{ fontWeight: 600, fontSize: "14px", color: "var(--muted)" }}>Instructor Name</div>
                    <input style={{ width: "100%", padding: "10px", marginTop: "6px", borderRadius: "8px", border: "1px solid #ccc" }} type="text" value={formData.instructor.name} onChange={e => setFormData({ ...formData, instructor: { ...formData.instructor, name: e.target.value } })} />
                  </label>
                  <label>
                    <div style={{ fontWeight: 600, fontSize: "14px", color: "var(--muted)" }}>Bio</div>
                    <textarea style={{ width: "100%", padding: "10px", marginTop: "6px", borderRadius: "8px", border: "1px solid #ccc", minHeight: "80px", fontFamily: "inherit" }} value={formData.instructor.bio} onChange={e => setFormData({ ...formData, instructor: { ...formData.instructor, bio: e.target.value } })}></textarea>
                  </label>
                  <div style={{ display: "flex", gap: "12px" }}>
                    <label style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: "14px", color: "var(--muted)" }}>Rating</div>
                      <input style={{ width: "100%", padding: "10px", marginTop: "6px", borderRadius: "8px", border: "1px solid #ccc" }} type="number" step="0.1" value={formData.instructor.rating} onChange={e => setFormData({ ...formData, instructor: { ...formData.instructor, rating: Number(e.target.value) } })} />
                    </label>
                    <label style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: "14px", color: "var(--muted)" }}>Students</div>
                      <input style={{ width: "100%", padding: "10px", marginTop: "6px", borderRadius: "8px", border: "1px solid #ccc" }} type="number" value={formData.instructor.students} onChange={e => setFormData({ ...formData, instructor: { ...formData.instructor, students: Number(e.target.value) } })} />
                    </label>
                    <label style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: "14px", color: "var(--muted)" }}>Courses</div>
                      <input style={{ width: "100%", padding: "10px", marginTop: "6px", borderRadius: "8px", border: "1px solid #ccc" }} type="number" value={formData.instructor.courses} onChange={e => setFormData({ ...formData, instructor: { ...formData.instructor, courses: Number(e.target.value) } })} />
                    </label>
                  </div>
                </>
              )}
            </div>

            <div className="modal-actions">
              <button className="secondary-btn" onClick={() => setModalOpen(false)}>Cancel</button>
              <button className="primary-btn" onClick={saveCourse}>Save Changes</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

