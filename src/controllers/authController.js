const authService = require('../services/authService');

class AuthController {
    async register(req, res) {
        try {
            const { email, password, name } = req.body;

            // Input Validation
            if (!email || !password) {
                return res.status(400).json({ error: 'Email và mật khẩu là bắt buộc' });
            }

            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                return res.status(400).json({ error: 'Email không hợp lệ' });
            }

            if (password.length < 8) {
                return res.status(400).json({ error: 'Mật khẩu phải có ít nhất 8 ký tự' });
            }

            // Pass name/email as userInputs for context-aware check
            const userInputs = name ? [name] : [];

            const user = await authService.register(email, password, userInputs);
            res.status(201).json({ message: 'Đăng ký người dùng thành công', user });
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    async login(req, res) {
        try {
            const { email, password } = req.body;
            const ip = req.ip || req.headers['x-forwarded-for'] || 'unknown';
            const { getAttempts, incrementAttempt, resetAttempts, getRemainingTime, recordLog } = require('../audit');

            // 1. Check if already blocked
            const remaining = getRemainingTime(ip);
            if (remaining > 0) {
                const attempt = getAttempts(ip);
                recordLog('ALERT', `IP BLOCKED (${remaining}s remaining)`, ip);
                return res.status(429).json({
                    error: `Bạn bị tạm khóa. Vui lòng đợi ${remaining} giây.`,
                    remainingTime: remaining,
                    attemptsRemaining: 0 // Locked
                });
            }

            if (!email || !password) {
                return res.status(400).json({ error: 'Email và mật khẩu là bắt buộc' });
            }

            const result = await authService.login(email, password);

            // Successful login
            resetAttempts(ip);
            recordLog('INFO', 'Login successful', ip);
            res.status(200).json({ message: 'Đăng nhập thành công', ...result });
        } catch (error) {
            const ip = req.ip || req.headers['x-forwarded-for'] || 'unknown';
            const { incrementAttempt, getRemainingTime, recordLog } = require('../audit');

            // Increment attempt and check if it triggered a block
            const attempt = incrementAttempt(ip);
            const remaining = getRemainingTime(ip);

            // Calculate attempts until next tier or lockout
            // Total attempts allowed before major lock: 5
            let attemptsLeft = 5 - attempt.count;
            if (attemptsLeft < 0) attemptsLeft = 0;

            if (remaining > 0) {
                recordLog('WARN', `Login failed. IP Blocked for ${remaining}s`, ip);
                return res.status(429).json({
                    error: `Đăng nhập thất bại. Bạn bị tạm khóa ${remaining} giây.`,
                    remainingTime: remaining,
                    attemptsRemaining: attemptsLeft // Pass actual remaining attempts
                });
            }

            recordLog('WARN', `Login failed (Attempt ${attempt.count})`, ip);
            res.status(401).json({
                error: error.message,
                attemptsRemaining: attemptsLeft // For UI warning if needed
            });
        }
    }
}

module.exports = new AuthController();
