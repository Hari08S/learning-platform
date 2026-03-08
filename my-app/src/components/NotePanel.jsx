import React, { useState, useEffect, useCallback, useRef } from 'react';
import useNotes from '../hooks/useNotes';
import { FiTrash2 } from 'react-icons/fi';

export default function NotePanel({ open, userId, courseId, lessonIndex, courseData, lessonData, onClose }) {
    const { getNoteForLesson, saveNote, deleteNote } = useNotes();
    const [content, setContent] = useState('');
    const [savedStatus, setSavedStatus] = useState(false);
    const saveTimeout = useRef(null);
    const statusTimeout = useRef(null);

    useEffect(() => {
        if (!open) return;
        let cancelled = false;
        async function fetchNote() {
            const val = await getNoteForLesson(userId, courseId, lessonIndex);
            if (!cancelled) setContent(val || '');
        }
        fetchNote();
        return () => { cancelled = true; };
    }, [open, userId, courseId, lessonIndex, getNoteForLesson]);

    const handleUpdate = (e) => {
        const newContent = e.target.value;
        if (newContent.length > 1000) return;
        setContent(newContent);

        if (saveTimeout.current) clearTimeout(saveTimeout.current);
        saveTimeout.current = setTimeout(() => {
            saveNote(userId, courseId, lessonIndex, courseData, lessonData, newContent);
            setSavedStatus(true);
            if (statusTimeout.current) clearTimeout(statusTimeout.current);
            statusTimeout.current = setTimeout(() => setSavedStatus(false), 2000);
        }, 1000);
    };

    const handleDelete = () => {
        deleteNote(userId, courseId, lessonIndex);
        setContent('');
        setSavedStatus(false);
        onClose();
    };

    if (!open) return null;

    return (
        <div style={{
            marginTop: 12,
            background: '#fffdf5',
            border: '1px solid #f0d060',
            borderRadius: 12,
            padding: '16px 20px',
            position: 'relative',
            boxShadow: '0 4px 12px rgba(240, 208, 96, 0.15)',
            animation: 'slideDown 0.3s ease-out'
        }}>
            <textarea
                value={content}
                onChange={handleUpdate}
                placeholder="Type your notes for this lesson here..."
                style={{
                    width: '100%',
                    minHeight: 120,
                    background: 'transparent',
                    border: 'none',
                    outline: 'none',
                    resize: 'vertical',
                    fontFamily: "'Kalam', cursive, sans-serif",
                    fontSize: '1.15rem',
                    lineHeight: 1.5,
                    color: '#334155'
                }}
            />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, borderTop: '1px dashed rgba(240, 208, 96, 0.5)', paddingTop: 12 }}>
                <button
                    onClick={handleDelete}
                    style={{ background: 'transparent', border: 'none', color: '#ef4444', display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: '0.9rem' }}
                >
                    <FiTrash2 /> Clear Note
                </button>

                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    {savedStatus && <span style={{ color: '#10B981', fontSize: '0.85rem', fontWeight: 600, animation: 'fadeIn 0.2s' }}>Saved ✓</span>}
                    <span style={{ color: '#94A3B8', fontSize: '0.85rem', fontFamily: 'sans-serif' }}>
                        {content.length} / 1000
                    </span>
                </div>
            </div>
        </div>
    );
}
