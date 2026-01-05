const auditLogs = [];
const loginAttempts = {};

// Tiered Configuration
// Tiered Configuration
const TIERS = [
    { threshold: 2, waitSeconds: 30 },
    { threshold: 3, waitSeconds: 60 },
    { threshold: 4, waitSeconds: 120 },
    { threshold: 5, waitSeconds: 300 } // Final lock (5 minutes) if they fail the last one
];

function recordLog(level, msg, ip) {
    const entry = {
        level,
        msg,
        ip,
        time: new Date().toISOString()
    };
    auditLogs.push(entry);
}

function getAttempts(key) {
    if (!loginAttempts[key]) {
        loginAttempts[key] = { count: 0, blockedUntil: null, tier: 0 };
    }
    return loginAttempts[key];
}

function incrementAttempt(key) {
    const entry = getAttempts(key);

    // If currently blocked, don't increment, just return (or handle via controller)
    if (entry.blockedUntil && Date.now() < entry.blockedUntil) {
        return entry;
    }

    // Reset count if block expired? No, we keep count to escalate tiers 
    // unless successful login resets it.

    entry.count += 1;



    // Check Tiers
    // Find exact match OR get the highest tier if we exceeded all thresholds
    let tier = TIERS.find(t => t.threshold === entry.count);

    // If no exact match, but count > max threshold, use the last tier (Permanent/Long lock)
    if (!tier && entry.count > TIERS[TIERS.length - 1].threshold) {
        tier = TIERS[TIERS.length - 1];
    }

    if (tier) {
        entry.blockedUntil = Date.now() + (tier.waitSeconds * 1000);
        entry.tier = tier.threshold;
    }

    loginAttempts[key] = entry;
    return entry;
}

function resetAttempts(key) {
    loginAttempts[key] = { count: 0, blockedUntil: null, tier: 0 };
}

function getRemainingTime(key) {
    const entry = getAttempts(key);
    if (!entry.blockedUntil) return 0;
    const remaining = Math.ceil((entry.blockedUntil - Date.now()) / 1000);
    return remaining > 0 ? remaining : 0;
}

module.exports = {
    auditLogs,
    loginAttempts,
    recordLog,
    getAttempts,
    incrementAttempt,
    resetAttempts,
    getRemainingTime
};
