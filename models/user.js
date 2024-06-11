const db = require('../util/connectionDB');

module.exports = class User {
    constructor(username, email, password) {
        this.username = username;
        this.email = email;
        this.password = password;
    }

    static async findByUsername(username) {
        return db.promise().query(
            'SELECT * FROM users WHERE username = ?', [username]
        );
    }

    static async findByUserId(userid) {
        return db.promise().query(
            'SELECT * FROM users WHERE id = ?', [userid]
        );
    }

    static async save(user) {
        return db.promise().execute(
            'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
            [user.username, user.email, user.password]
        );
    }

    static async delete(userId) {
        return db.promise().execute('DELETE FROM users WHERE id = ?', [userId]);
    }

    static async updatePassword(password, username) {
        return db.promise().execute('UPDATE users SET password = ? WHERE username = ?', [password, username]);
    }
}