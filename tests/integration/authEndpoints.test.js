const request = require('supertest');
const app = require('../../src/app'); // Import the Express app

describe('Auth Endpoints Integration Tests', () => {
    const user = {
        name: 'Test User',
        email: 'testuser@example.com',
        password: 'StrongPass!123'
    };

    it('should register a new user', async () => {
        const res = await request(app)
            .post('/api/register')
            .send(user)
            .set('Accept', 'application/json');
        expect(res.statusCode).toBe(201);
        expect(res.body).toHaveProperty('message', 'Đăng ký người dùng thành công');
        expect(res.body).toHaveProperty('user');
    });

    it('should login with correct credentials', async () => {
        const res = await request(app)
            .post('/api/login')
            .send({ email: user.email, password: user.password })
            .set('Accept', 'application/json');
        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('message', 'Đăng nhập thành công');
        expect(res.body).toHaveProperty('token');
    });

    it('should enforce rate limiting after 5 failed attempts', async () => {
        // 4 failed attempts should return 401
        for (let i = 0; i < 4; i++) {
            const res = await request(app)
                .post('/api/login')
                .send({ email: user.email, password: 'wrongPassword' })
                .set('Accept', 'application/json');
            expect(res.statusCode).toBe(401);
        }
        // 5th failed attempt should be blocked (429)
        const blockedRes = await request(app)
            .post('/api/login')
            .send({ email: user.email, password: 'wrongPassword' })
            .set('Accept', 'application/json');
        expect(blockedRes.statusCode).toBe(429);
        expect(blockedRes.body).toHaveProperty('error');
    });

    it('should retrieve admin logs', async () => {
        const res = await request(app)
            .get('/admin/logs')
            .set('Accept', 'application/json');
        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('logs');
        expect(Array.isArray(res.body.logs)).toBe(true);
    });
});
