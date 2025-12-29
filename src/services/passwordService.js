const zxcvbn = require('zxcvbn');
const argon2 = require('argon2');
const fs = require('fs');
const path = require('path');

class PasswordService {
    constructor() {
        this.blacklist = new Set();
        this.loadBlacklist();
    }

    loadBlacklist() {
        try {
            const blacklistPath = path.join(__dirname, '../data/blacklist.json');
            if (fs.existsSync(blacklistPath)) {
                const list = JSON.parse(fs.readFileSync(blacklistPath, 'utf-8'));
                list.forEach(pwd => this.blacklist.add(pwd));
                console.log(`Loaded ${this.blacklist.size} passwords into blacklist.`);
            } else {
                console.warn('Blacklist file not found.');
            }
        } catch (error) {
            console.error('Failed to load password blacklist:', error);
        }
    }

    async checkStrength(password, userInputs = []) {
        // 1. Blacklist Check
        if (this.blacklist.has(password)) {
            return {
                valid: false,
                score: 0,
                feedback: {
                    warning: 'This is a very common password.',
                    suggestions: ['Please choose a unique password.']
                },
                crackTime: 0
            };
        }

        // 2. zxcvbn Check
        const analysis = zxcvbn(password, userInputs);
        const score = analysis.score;
        const crackTime = analysis.crack_times_seconds.offline_slow_hashing_1e4_per_second;

        // Rule: Score < 3 is rejected
        if (score < 3) {
            return {
                valid: false,
                score,
                feedback: analysis.feedback,
                crackTime
            };
        }

        return {
            valid: true,
            score,
            feedback: analysis.feedback,
            crackTime
        };
    }

    async hashPassword(password) {
        return await argon2.hash(password, {
            type: argon2.argon2id,
            memoryCost: 2 ** 16, // 64 MB
            timeCost: 3,
            parallelism: 1,
        });
    }

    async verifyPassword(storedHash, password) {
        return await argon2.verify(storedHash, password);
    }
}

module.exports = new PasswordService();
