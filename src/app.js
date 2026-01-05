require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const authController = require('./controllers/authController');
const authLimiter = require('./config/rateLimit');
const adminController = require('./controllers/adminController');

const app = express();
const PORT = process.env.PORT || 3001;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/secure-auth';

const helmet = require('helmet');

// Middleware
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            ...helmet.contentSecurityPolicy.getDefaultDirectives(),
            "script-src": ["'self'", "https://cdnjs.cloudflare.com"], // Allow zxcvbn from CDN
            "style-src": ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com", "https://cdnjs.cloudflare.com"], // Allow FontAwesome & Google Fonts
            "font-src": ["'self'", "https://fonts.gstatic.com", "https://cdnjs.cloudflare.com"], // Allow Icons
        },
    },
}));
app.set('trust proxy', 1); // Trust first proxy (required for rate limiting behind proxy)

app.use(express.json());
app.use(express.static('public'));

// Secure Admin Middleware
const adminAuth = (req, res, next) => {
    const secret = req.headers['x-admin-secret'] || req.query.secret;
    // In production, this should be an env var. For demo: 'admin123'
    if (secret !== process.env.ADMIN_SECRET && secret !== 'admin123') {
        return res.status(403).json({ error: 'Access Denied: Missing or Invalid Admin Secret' });
    }
    next();
};

app.use('/api', authLimiter); // Apply rate limiting to API routes

// Database Connection
// Database Connection
// mongoose.connect(MONGODB_URI)
//  .then(() => console.log('Connected to MongoDB'))
//  .catch(err => console.error('MongoDB connection error:', err));
console.log('Running IN-MEMORY mode for demo.');

// Routes
app.post('/api/register', (req, res) => authController.register(req, res));
app.post('/api/login', (req, res) => authController.login(req, res));

// Health Check
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK' });
});

// Admin logs endpoint
app.get('/admin/logs', adminAuth, adminController.getLogs); // Admin logs endpoint
app.get('/api/admin/users', adminAuth, (req, res) => adminController.getUsers(req, res)); // Security proof endpoint

// Start Server
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}

module.exports = app;
