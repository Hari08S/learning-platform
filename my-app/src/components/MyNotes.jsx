import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import useNotes from '../hooks/useNotes';
import { FiChevronDown, FiChevronUp, FiBookOpen } from 'react-icons/fi';

export default function MyNotes({ userId }) {
    const { getNotes } = useNotes();
    const [notes, setNotes] = useState([]);
    const [open, setOpen] = useState(false);

    useEffect(() => {
        if (!userId) return;
        let cancelled = false;
        async function fetchNotes() {
            const data = await getNotes(userId);
            if (!cancelled) setNotes(data);
        }
        fetchNotes();
        return () => { cancelled = true; };
    }, [userId, getNotes]);

    // Group notes by course
    const grouped = notes.reduce((acc, note) => {
        if (!acc[note.courseId]) {
            acc[note.courseId] = {
                title: note.courseTitle,
                image: note.courseImage,
                items: []
            };
        }
        acc[note.courseId].items.push(note);
        return acc;
    }, {});

    return (
        <div style={{ marginTop: 24, background: 'var(--card-bg, #fff)', borderRadius: 12, padding: 22, boxShadow: 'var(--shadow, 0 8px 30px rgba(2,6,23,0.04))' }}>
            <div
                onClick={() => setOpen(!open)}
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
            >
                <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
                    <FiBookOpen color="#F59E0B" /> My Notes
                </h3>
                <button style={{ background: 'transparent', border: 'none', fontSize: 22, color: '#64748B', display: 'flex' }}>
                    {open ? <FiChevronUp /> : <FiChevronDown />}
                </button>
            </div>

            <div style={{
                marginTop: open ? 16 : 0,
                maxHeight: open ? 800 : 0,
                overflow: 'hidden',
                transition: 'all 0.4s ease',
                opacity: open ? 1 : 0
            }}>
                {notes.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '32px 10px', color: 'var(--muted, #64748B)', background: 'var(--bg, #f8fafc)', borderRadius: 10 }}>
                        <span style={{ fontSize: 32, display: 'block', marginBottom: 10 }}>📓</span>
                        You haven't taken any notes yet. Start learning to capture your thoughts!
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                        {Object.entries(grouped).map(([cId, courseGroup]) => (
                            <div key={cId} style={{ border: '1px solid var(--border, #f1f5f9)', borderRadius: 12, padding: 16 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                                    {courseGroup.image ? (
                                        <img src={courseGroup.image} alt="" style={{ width: 40, height: 40, borderRadius: 6, objectFit: 'cover' }} />
                                    ) : (
                                        <div style={{ width: 40, height: 40, borderRadius: 6, background: 'var(--border, #e2e8f0)' }} />
                                    )}
                                    <h4 style={{ margin: 0, fontSize: '1.05rem', color: '#0F172A' }}>{courseGroup.title}</h4>
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                    {courseGroup.items.map((note) => (
                                        <div key={note.key} style={{ background: 'var(--note-bg, #fffdf5)', borderLeft: '4px solid #f0d060', padding: '12px 16px', borderRadius: '0 8px 8px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 }}>
                                            <div>
                                                <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--muted, #475569)', marginBottom: 6 }}>
                                                    {note.lessonTitle}
                                                </div>
                                                <div style={{
                                                    fontFamily: "'Kalam', cursive, sans-serif",
                                                    fontSize: '1.05rem',
                                                    color: 'var(--note-text, #334155)',
                                                    display: '-webkit-box',
                                                    WebkitLineClamp: 2,
                                                    WebkitBoxOrient: 'vertical',
                                                    overflow: 'hidden'
                                                }}>
                                                    {note.content}
                                                </div>
                                            </div>

                                            <Link
                                                to={`/courses/${cId}`}
                                                style={{ whiteSpace: 'nowrap', fontSize: '0.85rem', color: '#7C3AED', textDecoration: 'none', fontWeight: 600, padding: '6px 12px', background: 'var(--accent-light, #F3E8FF)', borderRadius: 999 }}
                                            >
                                                Open Lesson →
                                            </Link>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
