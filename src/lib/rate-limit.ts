type RateLimitStore = Map<string, number[]>;

const loginLimits: RateLimitStore = new Map();
const chatLimits: RateLimitStore = new Map();

// Helper to clean old entries
function cleanOld(timestamps: number[], windowMs: number): number[] {
    const now = Date.now();
    return timestamps.filter(t => now - t < windowMs);
}

export function checkRateLimit(type: 'LOGIN' | 'CHAT', identifier: string): boolean {
    const now = Date.now();
    let store: RateLimitStore;
    let limit: number;
    let windowMs: number;

    if (type === 'LOGIN') {
        store = loginLimits;
        limit = 5; // 5 attempts
        windowMs = 60 * 1000; // per minute
    } else {
        store = chatLimits;
        limit = 5; // 5 messages
        windowMs = 10 * 1000; // per 10 seconds
    }

    let timestamps = store.get(identifier) || [];
    timestamps = cleanOld(timestamps, windowMs);

    if (timestamps.length >= limit) {
        return false; // Limit exceeded
    }

    timestamps.push(now);
    store.set(identifier, timestamps);
    return true; // OK
}
