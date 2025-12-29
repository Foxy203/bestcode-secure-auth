const passwordService = require('../../src/services/passwordService');
const zxcvbn = require('zxcvbn');
const argon2 = require('argon2');

describe('PasswordService', () => {
    describe('checkStrength', () => {
        test('should reject password found in blacklist', async () => {
            const result = await passwordService.checkStrength('password123');
            expect(result.valid).toBe(false);
            expect(result.feedback.warning).toContain('common password');
        });

        test('should reject weak password (score < 3)', async () => {
            // "trilogy" might be weak checking zxcvbn default dict
            const result = await passwordService.checkStrength('7777777');
            expect(result.valid).toBe(false);
            expect(result.score).toBeLessThan(3);
        });

        test('should accept strong password', async () => {
            const result = await passwordService.checkStrength('Correct-Horse-Battery-Staple-99!');
            expect(result.valid).toBe(true);
            expect(result.score).toBeGreaterThanOrEqual(3);
        });

        test('should reject password similar to user inputs', async () => {
            const result = await passwordService.checkStrength('john123', ['john']);
            expect(result.valid).toBe(false);
        });
    });

    describe('hashPassword & verifyPassword', () => {
        test('should hash password using argon2', async () => {
            const hash = await passwordService.hashPassword('securepassword');
            expect(hash).toContain('$argon2');
        });

        test('should verify correct password', async () => {
            const hash = await passwordService.hashPassword('securepassword');
            const isValid = await passwordService.verifyPassword(hash, 'securepassword');
            expect(isValid).toBe(true);
        });

        test('should reject incorrect password', async () => {
            const hash = await passwordService.hashPassword('securepassword');
            const isValid = await passwordService.verifyPassword(hash, 'wrongpassword');
            expect(isValid).toBe(false);
        });
    });
});
