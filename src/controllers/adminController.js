const { auditLogs } = require('../audit');

class AdminController {
    getLogs(req, res) {
        // For simplicity, no auth; in real app protect this route
        res.json({ logs: auditLogs });
    }
}

module.exports = new AdminController();
