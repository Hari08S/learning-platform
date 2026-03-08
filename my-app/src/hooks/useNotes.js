import { useState, useCallback } from 'react';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000';

export default function useNotes() {
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    const getNotes = useCallback(async (userId) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return [];
            const r = await fetch(`${API_BASE}/api/me/notes`, { headers: { Authorization: `Bearer ${token}` } });
            if (!r.ok) return [];
            const d = await r.json();
            return d.notes || [];
        } catch {
            return [];
        }
    }, [refreshTrigger]);

    const saveNote = useCallback(async (userId, courseId, lessonIndex, courseData, lessonData, content) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return;
            const payload = {
                courseTitle: courseData?.title || 'Unknown Course',
                courseImage: courseData?.thumb || courseData?.img || '',
                lessonTitle: lessonData?.title || `Lesson ${lessonIndex}`,
                content
            };
            await fetch(`${API_BASE}/api/me/notes/${courseId}/${lessonIndex}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify(payload)
            });
            setRefreshTrigger(prev => prev + 1);
        } catch (e) {
            console.error('Failed to save note:', e);
        }
    }, []);

    const getNoteForLesson = useCallback(async (userId, courseId, lessonIndex) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return '';
            const r = await fetch(`${API_BASE}/api/me/notes`, { headers: { Authorization: `Bearer ${token}` } });
            if (!r.ok) return '';
            const d = await r.json();
            const note = (d.notes || []).find(n => n.courseId === courseId && n.lessonIndex === lessonIndex);
            return note ? note.content : '';
        } catch {
            return '';
        }
    }, [refreshTrigger]);

    const deleteNote = useCallback(async (userId, courseId, lessonIndex) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return;
            await fetch(`${API_BASE}/api/me/notes/${courseId}/${lessonIndex}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            });
            setRefreshTrigger(prev => prev + 1);
        } catch (e) {
            console.error('Failed to delete note:', e);
        }
    }, []);

    return { getNotes, saveNote, getNoteForLesson, deleteNote };
}
