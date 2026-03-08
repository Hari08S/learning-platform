import React, { useState, useEffect } from 'react';
import CalendarHeatmap from 'react-calendar-heatmap';
import { Tooltip } from 'react-tooltip';
import 'react-calendar-heatmap/dist/styles.css';
import useActivity from '../hooks/useActivity';

export default function LearningHeatmap({ userId }) {
    const { getHeatmapData, getStreak, getLongestStreak, getTotalMinutes } = useActivity();
    const [year, setYear] = useState(new Date().getFullYear());
    const [data, setData] = useState([]);
    const [streak, setStreak] = useState(0);
    const [maxStreak, setMaxStreak] = useState(0);
    const [totalMin, setTotalMin] = useState(0);

    useEffect(() => {
        if (!userId) return;

        let cancelled = false;
        const refresh = async () => {
            const hData = await getHeatmapData();
            const strk = await getStreak();
            const mStrk = await getLongestStreak();
            const tm = await getTotalMinutes(userId, String(year));

            if (!cancelled) {
                setData(hData);
                setStreak(strk);
                setMaxStreak(mStrk);
                setTotalMin(tm);
            }
        };

        refresh();
        window.addEventListener('activity.updated', refresh);
        return () => {
            cancelled = true;
            window.removeEventListener('activity.updated', refresh);
        };
    }, [userId, getHeatmapData, getStreak, getLongestStreak, getTotalMinutes, year]);

    const startDate = new Date(`${year}-01-01`);
    const endDate = new Date(`${year}-12-31`);

    const totalHours = Math.floor(totalMin / 60);
    const totalMinsRem = totalMin % 60;

    return (
        <div style={{
            background: 'var(--card-bg, #fff)',
            borderRadius: 16,
            padding: 24,
            boxShadow: 'var(--shadow, 0 8px 30px rgba(2,6,23,0.04))',
            marginTop: 24
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <div>
                    <h3 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--text, #0F172A)' }}>Learning Activity</h3>
                    <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--muted, #64748B)' }}>{totalMin > 0 ? `${totalMin} total minutes learned this year` : 'Start your learning journey'}</p>
                </div>

                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                    <button
                        onClick={() => setYear(y => y - 1)}
                        style={{ border: 'none', background: 'transparent', cursor: 'pointer', fontSize: 18, color: 'var(--muted, #64748B)', fontWeight: 600 }}
                    >
                        ←
                    </button>
                    <span style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--text, #0F172A)' }}>{year}</span>
                    <button
                        onClick={() => setYear(y => y + 1)}
                        disabled={year >= new Date().getFullYear()}
                        style={{ border: 'none', background: 'transparent', cursor: year >= new Date().getFullYear() ? 'not-allowed' : 'pointer', fontSize: 18, color: year >= new Date().getFullYear() ? 'var(--border, #CBD5E1)' : 'var(--muted, #64748B)', fontWeight: 600 }}
                    >
                        →
                    </button>
                </div>
            </div>

            <div className="activity-heatmap">
                <CalendarHeatmap
                    startDate={startDate}
                    endDate={endDate}
                    values={data}
                    classForValue={(value) => {
                        if (!value || value.count === 0) return 'color-empty';
                        if (value.count <= 15) return 'color-scale-1';
                        if (value.count <= 30) return 'color-scale-2';
                        if (value.count <= 60) return 'color-scale-3';
                        return 'color-scale-4';
                    }}
                    tooltipDataAttrs={(value) => {
                        if (!value || !value.date) {
                            return { 'data-tooltip-id': 'heatmap-tooltip', 'data-tooltip-content': 'No activity' };
                        }
                        return {
                            'data-tooltip-id': 'heatmap-tooltip',
                            'data-tooltip-content': `${value.date} — ${value.count} min learned`
                        };
                    }}
                    showWeekdayLabels={true}
                />
                <Tooltip id="heatmap-tooltip" style={{ borderRadius: 8, fontSize: '0.85rem', zIndex: 1000 }} />
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24, marginTop: 20, paddingTop: 20, borderTop: '1px solid var(--border, #f1f5f9)' }}>
                <div style={{ flex: 1, minWidth: 120 }}>
                    <div style={{ fontSize: '0.85rem', color: 'var(--muted, #64748B)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}>Current Streak</div>
                    <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#F59E0B', marginTop: 4 }}>🔥 {streak} days</div>
                </div>

                <div style={{ flex: 1, minWidth: 120 }}>
                    <div style={{ fontSize: '0.85rem', color: 'var(--muted, #64748B)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}>Longest Streak</div>
                    <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#10B981', marginTop: 4 }}>📅 {maxStreak} days</div>
                </div>

                <div style={{ flex: 1, minWidth: 120 }}>
                    <div style={{ fontSize: '0.85rem', color: 'var(--muted, #64748B)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}>Total This Year</div>
                    <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#7C3AED', marginTop: 4 }}>⏱️ {totalHours}h {totalMinsRem}m</div>
                </div>
            </div>
        </div>
    );
}
