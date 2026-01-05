// Replaced Mongoose with In-Memory Map for Demo reliability independent of local DB setup
// In production, this would act as a facade for a real database (MongoDB/SQL)

class UserRepository {
    constructor() {
        this.users = new Map();
        // Pre-populate with a demo user if needed
    }

    async findByEmail(email) {
        // Simulate async DB call
        return new Promise((resolve) => {
            setTimeout(() => {
                const user = this.users.get(email);
                resolve(user || null);
            }, 100);
        });
    }

    async create(userData) {
        return new Promise((resolve) => {
            setTimeout(() => {
                // Assign a random ID
                const user = {
                    _id: Math.random().toString(36).substr(2, 9),
                    ...userData,
                    createdAt: new Date()
                };
                this.users.set(userData.email, user);

                // DEMO LOGGING: Show stored data
                console.log('\n=============================================');
                console.log('>>> [DEMO DATABASE] NEW USER STORED:');
                console.log('>>> Email:', user.email);
                console.log('>>> Hashed Password:', user.password);
                console.log('=============================================\n');

                resolve(user);
            }, 100);
        });
    }
    async findAll() {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve(Array.from(this.users.values()));
            }, 50);
        });
    }
}

module.exports = new UserRepository();
