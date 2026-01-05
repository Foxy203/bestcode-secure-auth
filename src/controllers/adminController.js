const { auditLogs } = require('../audit');

class AdminController {
    getLogs(req, res) {
        // For simplicity, no auth; in real app protect this route
        res.json({ logs: auditLogs });
    }
    async getUsers(req, res) {
        try {
            const users = await require('../repositories/userRepository').findAll();
            // Map to only show email and password (hash)
            const safeUsers = users.map(u => ({
                email: u.email,
                password: u.password // The hash
            }));
            res.json(safeUsers);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}

module.exports = new AdminController();
