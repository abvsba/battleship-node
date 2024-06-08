const db = require('../util/connectionDB');

module.exports = class User {
    constructor(username, email, password) {
        this.username = username;
        this.email = email;
        this.password = password;
    }

    static async find(username) {
        try {
            return await db.promise().query(
                'SELECT * FROM users WHERE username = ?', [username]
            );
        } catch (error) {
            console.error('Error searching user:', error);
            throw error;
        }
    }

    static async save(user) {
        try {
            return await db.promise().execute(
                'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
                [user.username, user.email, user.password]
            );
        } catch (error) {
            console.error('Error saving user:', error);
            throw error;
        }
    }
}