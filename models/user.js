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

    static async findByUserId(userId) {
        return db.promise().query(
            'SELECT * FROM users WHERE id = ?', [userId]
        );
    }

    static async save(user) {
        return db.promise().execute(
            'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
            [user.username, user.email, user.password]
        );
    }

    static async deleteUser(userId) {
        return db.promise().execute('DELETE FROM users WHERE id = ?', [userId]);
    }

    static async updatePassword(password, userId) {
        return db.promise().execute('UPDATE users SET password = ? WHERE id = ?', [password, userId]);
    }


    static async saveGameDetails(gameDetails, user_id, date) {
        return db.promise().execute(
            'INSERT INTO game_history (totalHits, timeConsumed, username, result, date, user_id) VALUES (?, ?, ?, ?, ?, ?)',
            [gameDetails.totalPlayerHits, gameDetails.timeConsumed, gameDetails.username, gameDetails.result, date, user_id]
        );
    }

    static async findGameDetailsByUserId(userId) {
        return db.promise().query(
            'SELECT * FROM game_history WHERE user_id = ? LIMIT 10', [userId]
        );
    }


    static async deleteUserFromTable() {
        try {
            await Promise.all([
                await db.promise().execute('DELETE FROM battleship_test.users'),
            ]);
        } catch (error) {
            console.error('Error deleting user or history:', error);
        }
    }

}