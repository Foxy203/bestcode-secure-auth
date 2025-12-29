const authService = require('../../src/services/authService');
const userRepository = require('../../src/repositories/userRepository');
const passwordService = require('../../src/services/passwordService');
const jwt = require('jsonwebtoken');

// Mock dependencies
jest.mock('../../src/repositories/userRepository');
jest.mock('../../src/services/passwordService');
jest.mock('jsonwebtoken');

describe('AuthService', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('register', () => {
        test('should throw error if user already exists', async () => {
            userRepository.findByEmail.mockResolvedValue({ email: 'test@example.com' });
            await expect(authService.register('test@example.com', 'password')).rejects.toThrow('User already exists');
        });

        test('should throw error if password is weak', async () => {
            userRepository.findByEmail.mockResolvedValue(null);
            passwordService.checkStrength.mockResolvedValue({
                valid: false,
                feedback: { warning: 'Weak', suggestions: [] }
            });

            await expect(authService.register('test@example.com', 'weak')).rejects.toThrow('Password is too weak');
        });

        test('should create user if inputs are valid', async () => {
            userRepository.findByEmail.mockResolvedValue(null);
            passwordService.checkStrength.mockResolvedValue({ valid: true });
            passwordService.hashPassword.mockResolvedValue('hashed_password');
            userRepository.create.mockResolvedValue({ _id: '123', email: 'test@example.com' });

            const result = await authService.register('test@example.com', 'StrongPass1!');
            expect(result).toEqual({ id: '123', email: 'test@example.com' });
            expect(userRepository.create).toHaveBeenCalledWith({ email: 'test@example.com', password: 'hashed_password' });
        });
    });

    describe('login', () => {
        test('should throw if user not found', async () => {
            userRepository.findByEmail.mockResolvedValue(null);
            await expect(authService.login('test@example.com', 'pass')).rejects.toThrow('Invalid credentials');
        });

        test('should throw if password invalid', async () => {
            userRepository.findByEmail.mockResolvedValue({ password: 'hash' });
            passwordService.verifyPassword.mockResolvedValue(false);
            await expect(authService.login('test@example.com', 'pass')).rejects.toThrow('Invalid credentials');
        });

        test('should return token if credentials valid', async () => {
            userRepository.findByEmail.mockResolvedValue({ _id: '123', email: 'test@example.com', password: 'hash' });
            passwordService.verifyPassword.mockResolvedValue(true);
            jwt.sign.mockReturnValue('mock_token');

            const result = await authService.login('test@example.com', 'pass');
            expect(result.token).toBe('mock_token');
        });
    });
});
