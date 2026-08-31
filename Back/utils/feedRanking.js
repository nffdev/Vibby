const HALF_LIFE_HOURS = 36;              
const LAMBDA = Math.log(2) / HALF_LIFE_HOURS;
const LIKE_WEIGHT = 1.0;
const COMMENT_WEIGHT = 1.5;
const BASE_FLOOR = 1.0; 
const FOLLOW_BOOST = 3.0; 
const VIEWED_PENALTY = 0.1; 
const MAX_FOLLOWED = 2000; 
const MAX_VIEWED = 5000; 

function encodeCursor(cursor) {
    return Buffer.from(JSON.stringify(cursor)).toString('base64url');
}

function decodeCursor(str) {
    try {
        const parsed = JSON.parse(Buffer.from(String(str), 'base64url').toString('utf8'));
        if (typeof parsed.ts !== 'number' || typeof parsed.score !== 'number' || typeof parsed.id !== 'string') {
            return null;
        }
        return parsed;
    } catch {
        return null;
    }
}

module.exports = {
    LAMBDA,
    LIKE_WEIGHT,
    COMMENT_WEIGHT,
    BASE_FLOOR,
    FOLLOW_BOOST,
    VIEWED_PENALTY,
    MAX_FOLLOWED,
    MAX_VIEWED,
    encodeCursor,
    decodeCursor,
};
