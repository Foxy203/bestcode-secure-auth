const jwt = require('jsonwebtoken');
const userRepository = require('../repositories/userRepository');
const passwordService = require('./passwordService');

class AuthService {
    constructor() {
        this.jwtSecret = process.env.JWT_SECRET || 'your_super_secret_key_change_in_production';
        this.jwtExpiresIn = '1h';
    }

    async register(email, password, userInputs = []) {
        const existingUser = await userRepository.findByEmail(email);
        if (existingUser) {
            throw new Error('User already exists');
        }

        // Strength Check
        const strength = await passwordService.checkStrength(password, [...userInputs, email]);
        if (!strength.valid) {
            throw new Error(`Password is too weak. ${strength.feedback.warning || ''} Suggestions: ${strength.feedback.suggestions.join(' ')}`);
        }

        // Hash Password
        const hashedPassword = await passwordService.hashPassword(password);

        const user = await userRepository.create({ email, password: hashedPassword });
        return { id: user._id, email: user.email };
    }

    async login(email, password) {
        const user = await userRepository.findByEmail(email);
        if (!user) {
            throw new Error('Invalid credentials');
        }

        const isValid = await passwordService.verifyPassword(user.password, password);
        if (!isValid) {
            throw new Error('Invalid credentials');
        }

        // Generate JWT
        const token = jwt.sign(
            { userId: user._id, email: user.email },
            this.jwtSecret,
            { expiresIn: this.jwtExpiresIn }
        );

        return { id: user._id, email: user.email, token };
    }
}

module.exports = new AuthService();
