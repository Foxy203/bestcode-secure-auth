require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const authController = require('./controllers/authController');
const authLimiter = require('./config/rateLimit');
const adminController = require('./controllers/adminController');

const app = express();
const PORT = process.env.PORT || 3001;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/secure-auth';

// Middleware
app.use(express.json());
app.use(express.static('public'));
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
app.get('/admin/logs', adminController.getLogs); // Admin logs endpoint

// Start Server
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}

module.exports = app;
