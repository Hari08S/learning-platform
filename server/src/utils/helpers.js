// server/src/utils/helpers.js
const mongoose = require('mongoose');

/**
 * Normalize a courseId value to a consistent string key.
 * Handles ObjectId, populated objects, legacy numeric IDs, etc.
 */
function toNormalizedKey(val) {
    if (val === undefined || val === null) return '';
    try {
        if (typeof val === 'object' && (val._id || val.id)) {
            const candidate = val._id ?? val.id;
            if (mongoose.Types.ObjectId.isValid(String(candidate))) {
                return String(new mongoose.Types.ObjectId(String(candidate)));
            }
            return String(candidate);
        }
        if (mongoose.Types.ObjectId.isValid(String(val))) {
            return String(new mongoose.Types.ObjectId(String(val)));
        }
    } catch (e) { /* ignore */ }
    return String(val);
}

/**
 * Check if a string is a "meaningful" title (not blank, "Untitled", "N/A")
 */
function isMeaningfulTitle(t) {
    if (!t) return false;
    const s = String(t).trim();
    if (!s) return false;
    const low = s.toLowerCase();
    if (low === 'untitled' || low === 'title' || low === 'n/a') return false;
    return true;
}

/**
 * Check if value is empty/sentinel string
 */
function isSentinelString(s) {
    if (!s && s !== 0) return true;
    const v = String(s).trim().toLowerCase();
    return v === '' || v === 'undefined' || v === 'null' || v === 'nan';
}

/**
 * Extract course identity from a raw courseId value.
 * Returns { key, legacyId, title }
 */
function extractCourseIdentity(raw) {
    if (!raw && raw !== 0) return { key: null, legacyId: null, title: null };
    if (typeof raw === 'object') {
        if (raw._id) return { key: String(raw._id), legacyId: raw.legacyId ?? null, title: raw.title ?? null };
        if (raw.id) return { key: String(raw.id), legacyId: raw.legacyId ?? null, title: raw.title ?? null };
    }
    if (typeof raw === 'string') {
        if (raw.length === 24 && mongoose.Types.ObjectId.isValid(raw)) return { key: raw, legacyId: null, title: null };
        const n = parseInt(raw, 10);
        if (!Number.isNaN(n)) return { key: null, legacyId: n, title: null };
        if (raw === 'undefined') return { key: null, legacyId: null, title: null };
        return { key: raw, legacyId: null, title: null };
    }
    if (typeof raw === 'number') return { key: null, legacyId: raw, title: null };
    return { key: null, legacyId: null, title: null };
}

/**
 * Build pagination parameters from query string
 */
function parsePagination(query, defaults = {}) {
    const page = Math.max(1, parseInt(query.page || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(query.limit || defaults.limit || '20', 10)));
    const skip = (page - 1) * limit;
    return { page, limit, skip };
}

module.exports = {
    toNormalizedKey,
    isMeaningfulTitle,
    isSentinelString,
    extractCourseIdentity,
    parsePagination,
};
